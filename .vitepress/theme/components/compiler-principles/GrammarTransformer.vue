<script setup lang="ts">
import { ref, watch } from 'vue'
import { parseGrammar, Grammar } from './utils/grammar'
import { eliminateLeftRecursion, leftFactoring, grammarToString } from './utils/grammar-transform'
import { buildLL1Table, LL1Result } from './utils/ll1-table'
import { computeFirst, computeFollow } from './utils/first-follow'

const defaultInput = `E -> E + T | T
T -> T * F | F
F -> ( E ) | id`

const input = ref(defaultInput)
const transformedOutput = ref('')
const logs = ref<string[]>([])
const errorMsg = ref('')
const ll1Status = ref<{ before: boolean, after: boolean } | null>(null)

function analyzeAndTransform() {
  errorMsg.value = ''
  logs.value = []
  ll1Status.value = null
  transformedOutput.value = ''

  try {
    const g = parseGrammar(input.value)
    if (g.nonTerminals.size === 0) {
      errorMsg.value = 'Invalid grammar input.'
      return
    }

    // Check if original is LL(1)
    const firstRes1 = computeFirst(g)
    const followRes1 = computeFollow(g, firstRes1.map)
    const res1 = buildLL1Table(g, firstRes1.map, followRes1.map)
    
    // Transform
    let currentG = g;
    let logBuffer: string[] = [];

    // 1. Eliminate Left Recursion
    const resLR = eliminateLeftRecursion(currentG);
    currentG = resLR.grammar;
    if (resLR.log.length > 0) {
        logBuffer.push('--- Eliminating Left Recursion ---');
        logBuffer.push(...resLR.log);
    }

    // 2. Left Factoring
    const resLF = leftFactoring(currentG);
    currentG = resLF.grammar;
    if (resLF.log.length > 0) {
        logBuffer.push('--- Left Factoring ---');
        logBuffer.push(...resLF.log);
    }

    logs.value = logBuffer;
    transformedOutput.value = grammarToString(currentG);

    // Check if transformed is LL(1)
    const firstRes2 = computeFirst(currentG)
    const followRes2 = computeFollow(currentG, firstRes2.map)
    const res2 = buildLL1Table(currentG, firstRes2.map, followRes2.map)

    ll1Status.value = {
        before: res1.isLL1,
        after: res2.isLL1
    }

  } catch (e: any) {
    console.error(e)
    errorMsg.value = 'Error: ' + e.message
  }
}

// Watch doesn't auto-run to avoid flashing, user clicks button
// But for consistency with other components, maybe auto run?
// Let's use auto run but maybe debounce?
// Actually button is better for "Transform" action.
</script>

<template>
  <div class="grammar-transform-container">
    <div class="input-section">
      <div class="header">
        <span class="title">Original Grammar</span>
      </div>
      <textarea 
        v-model="input" 
        class="grammar-input" 
        rows="5" 
        spellcheck="false"
      ></textarea>
      
      <button class="action-btn" @click="analyzeAndTransform">
        ✨ Transform & Check LL(1)
      </button>
    </div>

    <div v-if="errorMsg" class="error">{{ errorMsg }}</div>

    <div v-if="ll1Status" class="results-section">
      <div class="status-bar">
        <div class="status-item" :class="{ valid: ll1Status.before, invalid: !ll1Status.before }">
          Original LL(1): <strong>{{ ll1Status.before ? 'Yes' : 'No' }}</strong>
        </div>
        <div class="arrow">➜</div>
        <div class="status-item" :class="{ valid: ll1Status.after, invalid: !ll1Status.after }">
          Transformed LL(1): <strong>{{ ll1Status.after ? 'Yes' : 'No' }}</strong>
        </div>
      </div>

      <div class="output-box">
        <h4>Transformed Grammar</h4>
        <pre class="grammar-output">{{ transformedOutput }}</pre>
      </div>

      <div class="logs-box" v-if="logs.length > 0">
        <h4>Transformation Logs</h4>
        <ul class="log-list">
          <li v-for="(log, i) in logs" :key="i" :class="{ 'log-header': log.startsWith('---'), 'log-item': !log.startsWith('---') }">
            {{ log }}
          </li>
        </ul>
      </div>
      <div v-else class="logs-box empty">
        No transformations needed.
      </div>
    </div>
  </div>
</template>

<style scoped>
.grammar-transform-container {
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  padding: 16px;
  margin: 16px 0;
  background-color: var(--vp-c-bg-soft);
}

.input-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 16px;
}

.header {
  font-weight: bold;
}

.grammar-input {
  width: 100%;
  padding: 12px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 4px;
  background-color: var(--vp-c-bg);
  color: var(--vp-c-text-1);
  font-family: var(--vp-font-family-mono);
  font-size: 0.9em;
  resize: vertical;
}

.action-btn {
  align-self: flex-start;
  padding: 8px 16px;
  background-color: var(--vp-c-brand-1);
  color: white;
  border-radius: 4px;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.2s;
}

.action-btn:hover {
  background-color: var(--vp-c-brand-2);
}

.error {
  color: var(--vp-c-danger-1);
  margin-bottom: 16px;
  padding: 8px;
  background-color: var(--vp-c-danger-soft);
  border-radius: 4px;
}

.status-bar {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 16px;
  font-size: 0.9em;
}

.status-item {
  padding: 6px 12px;
  border-radius: 4px;
  border: 1px solid currentColor;
}

.status-item.valid {
  color: var(--vp-c-success-1);
  background-color: var(--vp-c-success-soft);
}

.status-item.invalid {
  color: var(--vp-c-danger-1);
  background-color: var(--vp-c-danger-soft);
}

.arrow {
  color: var(--vp-c-text-2);
  font-weight: bold;
}

.output-box {
  background-color: var(--vp-c-bg);
  border: 1px solid var(--vp-c-divider);
  border-radius: 4px;
  padding: 12px;
  margin-bottom: 16px;
}

.output-box h4 {
  margin-top: 0;
  margin-bottom: 8px;
  font-size: 0.9em;
  color: var(--vp-c-text-2);
}

.grammar-output {
  margin: 0;
  white-space: pre-wrap;
  font-family: var(--vp-font-family-mono);
  color: var(--vp-c-text-1);
}

.logs-box {
  font-size: 0.9em;
  color: var(--vp-c-text-2);
  background-color: var(--vp-c-bg-alt);
  padding: 16px;
  border-radius: 4px;
  border: 1px solid var(--vp-c-divider);
}

.logs-box h4 {
  margin-top: 0;
  margin-bottom: 12px;
  font-weight: bold;
  color: var(--vp-c-text-1);
}

.log-list {
  margin: 0;
  padding: 0;
  list-style: none;
  font-family: var(--vp-font-family-mono);
}

.log-header {
  margin-top: 12px;
  margin-bottom: 8px;
  font-weight: bold;
  color: var(--vp-c-brand-1);
  border-bottom: 1px dashed var(--vp-c-divider);
  padding-bottom: 4px;
}

.log-header:first-child {
  margin-top: 0;
}

.log-item {
  padding-left: 12px;
  margin-bottom: 4px;
  border-left: 2px solid var(--vp-c-divider);
  line-height: 1.5;
}

.logs-box.empty {
  font-style: italic;
  text-align: center;
  padding: 24px;
}
</style>
