<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { parseGrammar, Grammar } from './utils/grammar'
import { computeFirst, computeFollow, SymbolMap } from './utils/first-follow'
import { buildLL1Table, ParsingTable, LL1Result } from './utils/ll1-table'

const defaultInput = `E -> T E'
E' -> + T E' | ε
T -> F T'
T' -> * F T' | ε
F -> ( E ) | id`

const input = ref(defaultInput)
const grammar = ref<Grammar | null>(null)
const firstSet = ref<SymbolMap | null>(null)
const followSet = ref<SymbolMap | null>(null)
const ll1Result = ref<LL1Result | null>(null)
const errorMsg = ref('')

const nonTerminalsList = computed(() => {
  if (!grammar.value) return []
  return Array.from(grammar.value.nonTerminals)
})

const terminalsList = computed(() => {
  if (!grammar.value) return []
  // Ensure $ is at the end
  const terms = Array.from(grammar.value.terminals).filter(t => t !== '$')
  terms.push('$')
  return terms
})

function formatSet(set: Set<string> | undefined): string {
  if (!set || set.size === 0) return '{}'
  return '{ ' + Array.from(set).join(', ') + ' }'
}

function formatProd(prod: any) {
  return `${prod.lhs} → ${prod.rhs.join(' ')}`
}

function analyze() {
  errorMsg.value = ''
  try {
    const g = parseGrammar(input.value)
    if (g.nonTerminals.size === 0) {
      errorMsg.value = 'No non-terminals found.'
      grammar.value = null
      return
    }
    grammar.value = g
    const first = computeFirst(g)
    firstSet.value = first
    const follow = computeFollow(g, first)
    followSet.value = follow
    
    ll1Result.value = buildLL1Table(g, first, follow)

  } catch (e: any) {
    console.error(e)
    errorMsg.value = 'Error: ' + e.message
    grammar.value = null
  }
}

watch(input, analyze, { immediate: true })
</script>

<template>
  <div class="ll1-analyzer-container">
    <div class="input-section">
      <div class="header">
        <span class="title">Grammar Input</span>
        <span class="hint">Format: <code>S -> A B | ε</code></span>
      </div>
      <textarea 
        v-model="input" 
        class="grammar-input" 
        rows="6" 
        spellcheck="false"
      ></textarea>
    </div>

    <div v-if="errorMsg" class="error">{{ errorMsg }}</div>

    <div v-if="grammar && ll1Result" class="results-section">
      
      <!-- Judgment Result -->
      <div class="verdict" :class="{ valid: ll1Result.isLL1, invalid: !ll1Result.isLL1 }">
        <span class="status-icon">{{ ll1Result.isLL1 ? '✅' : '❌' }}</span>
        <strong>Is LL(1)? </strong>
        <span>{{ ll1Result.isLL1 ? 'Yes' : 'No' }}</span>
      </div>

      <div v-if="ll1Result.conflicts.length > 0" class="conflicts-box">
        <strong>Conflicts Found:</strong>
        <ul>
          <li v-for="(c, i) in ll1Result.conflicts" :key="i">{{ c }}</li>
        </ul>
      </div>

      <!-- Tabs or Split View? Let's just stack them for clarity -->
      
      <div class="section-title">1. FIRST & FOLLOW Sets</div>
      <div class="table-container">
        <table class="data-table">
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

      <div class="section-title">2. Predictive Parsing Table</div>
      <div class="table-container">
        <table class="data-table parse-table">
          <thead>
            <tr>
              <th>M[N, T]</th>
              <th v-for="t in terminalsList" :key="t">{{ t }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="nt in nonTerminalsList" :key="nt">
              <td class="nt-cell">{{ nt }}</td>
              <td v-for="t in terminalsList" :key="t" 
                  :class="{ 'conflict-cell': (ll1Result.table.get(nt)?.get(t)?.length || 0) > 1 }">
                <div v-if="ll1Result.table.get(nt)?.get(t)?.length">
                  <div v-for="(prod, idx) in ll1Result.table.get(nt)?.get(t)" :key="idx" class="prod-item">
                    {{ formatProd(prod) }}
                  </div>
                </div>
                <span v-else class="empty-cell"></span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

    </div>
  </div>
</template>

<style scoped>
.ll1-analyzer-container {
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

.verdict {
  padding: 12px;
  border-radius: 4px;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.verdict.valid {
  background-color: var(--vp-c-success-soft);
  color: var(--vp-c-success-1);
  border: 1px solid var(--vp-c-success-1);
}

.verdict.invalid {
  background-color: var(--vp-c-danger-soft);
  color: var(--vp-c-danger-1);
  border: 1px solid var(--vp-c-danger-1);
}

.conflicts-box {
  margin-bottom: 16px;
  padding: 12px;
  background-color: var(--vp-c-warning-soft);
  color: var(--vp-c-warning-1);
  border-radius: 4px;
}

.section-title {
  font-weight: bold;
  margin: 16px 0 8px;
  padding-bottom: 4px;
  border-bottom: 1px solid var(--vp-c-divider);
}

.table-container {
  overflow-x: auto;
  margin-bottom: 16px;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9em;
  background-color: var(--vp-c-bg);
}

.data-table {
  width: 100% !important;
  border-collapse: collapse;
  margin-bottom: 16px;
  background-color: var(--vp-c-bg);
  display: table !important;
  /* table-layout: fixed;  LL1 表格列数不固定，不适合强制 fixed 平分，但要设 width 100% */
}

.data-table th,
.data-table td {
  border: 1px solid var(--vp-c-divider);
  padding: 6px 10px;
  text-align: left;
}

.data-table th {
  background-color: var(--vp-c-bg-alt);
  font-weight: 600;
  white-space: nowrap;
}

.nt-cell {
  font-weight: bold;
  color: var(--vp-c-brand-1);
  font-family: var(--vp-font-family-mono);
}

.parse-table td {
  vertical-align: top;
  min-width: 100px;
}

.prod-item {
  white-space: nowrap;
  font-family: var(--vp-font-family-mono);
  font-size: 0.85em;
}

.conflict-cell {
  background-color: var(--vp-c-danger-soft);
}

.empty-cell {
  color: var(--vp-c-text-3);
}
</style>
