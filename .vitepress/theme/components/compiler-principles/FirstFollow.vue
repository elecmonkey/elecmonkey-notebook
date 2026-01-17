<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { parseGrammar, Grammar, EPSILON } from './utils/grammar'
import { computeFirst, computeFollow, SymbolMap, CalculationStep } from './utils/first-follow'

const defaultInput = `E -> T E'
E' -> + T E' | ε
T -> F T'
T' -> * F T' | ε
F -> ( E ) | id`

const input = ref(defaultInput)
const grammar = ref<Grammar | null>(null)
const firstSet = ref<SymbolMap | null>(null)
const followSet = ref<SymbolMap | null>(null)
const firstSteps = ref<CalculationStep[]>([])
const followSteps = ref<CalculationStep[]>([])
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

function formatAdded(added: string[]): string {
  return '{ ' + added.join(', ') + ' }'
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
    
    const firstRes = computeFirst(g)
    firstSet.value = firstRes.map
    firstSteps.value = firstRes.steps

    const followRes = computeFollow(g, firstRes.map)
    followSet.value = followRes.map
    followSteps.value = followRes.steps

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

      <div class="steps-container" v-if="firstSteps.length > 0 || followSteps.length > 0">
        <h3>Calculation Process (Derivation)</h3>
        
        <div class="step-columns">
          <div class="step-group">
            <h4>FIRST Set Derivation</h4>
            <ul class="step-list">
              <li v-for="(step, i) in firstSteps" :key="'f-'+i">
                  <span class="step-symbol">{{ step.symbol }}</span>: 
                  Added <span class="step-added">{{ formatAdded(step.added) }}</span>
                  <div class="step-reason">{{ step.reason }}</div>
              </li>
            </ul>
          </div>

          <div class="step-group">
            <h4>FOLLOW Set Derivation</h4>
            <ul class="step-list">
              <li v-for="(step, i) in followSteps" :key="'fo-'+i">
                  <span class="step-symbol">{{ step.symbol }}</span>: 
                  Added <span class="step-added">{{ formatAdded(step.added) }}</span>
                  <div class="step-reason">{{ step.reason }}</div>
              </li>
            </ul>
          </div>
        </div>
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

.steps-container {
  margin-bottom: 24px;
  background-color: var(--vp-c-bg);
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  padding: 16px;
}

.steps-container h3 {
  margin-top: 0;
  margin-bottom: 16px;
  font-size: 1.1em;
  font-weight: bold;
}

.step-columns {
  display: flex;
  gap: 24px;
}

.step-group {
  flex: 1;
}

.step-group h4 {
  margin-top: 0;
  margin-bottom: 12px;
  font-size: 1em;
  font-weight: 600;
  color: var(--vp-c-brand-1);
  border-bottom: 1px solid var(--vp-c-divider);
  padding-bottom: 8px;
}

.step-list {
  list-style: none;
  padding: 0;
  margin: 0;
  font-size: 0.9em;
  /* max-height: 400px; */
  /* overflow-y: auto; */
}

.step-list li {
  margin-bottom: 12px;
  padding-bottom: 12px;
  border-bottom: 1px dashed var(--vp-c-divider);
}

.step-list li:last-child {
  border-bottom: none;
}

.step-symbol {
  font-weight: bold;
  font-family: var(--vp-font-family-mono);
  color: var(--vp-c-text-1);
}

.step-added {
  font-family: var(--vp-font-family-mono);
  color: var(--vp-c-green-1);
  font-weight: bold;
}

.step-reason {
  margin-top: 4px;
  font-size: 0.9em;
  color: var(--vp-c-text-2);
  font-family: var(--vp-font-family-mono);
}

@media (max-width: 768px) {
  .step-columns {
    flex-direction: column;
  }
}
</style>
