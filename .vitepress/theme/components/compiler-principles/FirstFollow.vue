<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { parseGrammar, Grammar, EPSILON } from './utils/grammar'
import { computeFirst, computeFollow, SymbolMap } from './utils/first-follow'

const defaultInput = `E -> T E'
E' -> + T E' | ε
T -> F T'
T' -> * F T' | ε
F -> ( E ) | id`

const input = ref(defaultInput)
const grammar = ref<Grammar | null>(null)
const firstSet = ref<SymbolMap | null>(null)
const followSet = ref<SymbolMap | null>(null)
const errorMsg = ref('')

const nonTerminalsList = computed(() => {
  if (!grammar.value) return []
  return Array.from(grammar.value.nonTerminals)
})

function formatSet(set: Set<string> | undefined): string {
  if (!set) return '{}'
  if (set.size === 0) return '{}'
  return '{ ' + Array.from(set).join(', ') + ' }'
}

function analyze() {
  errorMsg.value = ''
  try {
    const g = parseGrammar(input.value)
    if (g.nonTerminals.size === 0) {
      errorMsg.value = 'No non-terminals found. Please check your input.'
      grammar.value = null
      return
    }
    grammar.value = g
    firstSet.value = computeFirst(g)
    followSet.value = computeFollow(g, firstSet.value)
  } catch (e: any) {
    console.error(e)
    errorMsg.value = 'Error: ' + e.message
    grammar.value = null
  }
}

// Watch input changes
watch(input, () => {
  analyze()
}, { immediate: true })

</script>

<template>
  <div class="first-follow-container">
    <div class="input-section">
      <div class="header">
        <span class="title">Grammar Input</span>
        <span class="hint">Format: <code>S -> A B | ε</code> (spaces separate symbols)</span>
      </div>
      <textarea 
        v-model="input" 
        class="grammar-input" 
        rows="8" 
        spellcheck="false"
      ></textarea>
    </div>

    <div v-if="errorMsg" class="error">{{ errorMsg }}</div>

    <div v-if="grammar" class="results-section">
      <div class="table-container">
        <table class="result-table">
          <thead>
            <tr>
              <th>Non-Terminal</th>
              <th>FIRST</th>
              <th>FOLLOW</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="nt in nonTerminalsList" :key="nt">
              <td class="nt-cell">{{ nt }}</td>
              <td>{{ formatSet(firstSet?.get(nt)) }}</td>
              <td>{{ formatSet(followSet?.get(nt)) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <div class="terminals-info">
        <strong>Terminals:</strong> {{ Array.from(grammar.terminals).join(', ') }}
      </div>
    </div>
  </div>
</template>

<style scoped>
.first-follow-container {
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  padding: 16px;
  margin: 16px 0;
  background-color: var(--vp-c-bg-soft);
}

.input-section {
  margin-bottom: 16px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.title {
  font-weight: bold;
}

.hint {
  font-size: 0.85em;
  color: var(--vp-c-text-2);
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

.error {
  color: var(--vp-c-danger-1);
  margin-bottom: 16px;
  padding: 8px;
  background-color: var(--vp-c-danger-soft);
  border-radius: 4px;
}

.result-table {
  width: 100% !important;
  border-collapse: collapse;
  margin-bottom: 16px;
  background-color: var(--vp-c-bg);
  table-layout: fixed !important;
  display: table !important;
}

.result-table th,
.result-table td {
  border: 1px solid var(--vp-c-divider);
  padding: 8px 12px;
  text-align: left;
  width: 33.33%; /* 三列平分宽度 */
  box-sizing: border-box; /* 包含 padding */
}

.result-table th {
  background-color: var(--vp-c-bg-alt);
  font-weight: 600;
}

.nt-cell {
  font-weight: bold;
  color: var(--vp-c-brand-1);
  font-family: var(--vp-font-family-mono);
}

.terminals-info {
  font-size: 0.9em;
  color: var(--vp-c-text-2);
}
</style>
