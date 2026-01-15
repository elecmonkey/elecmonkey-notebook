<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { parseGrammar, Grammar, Production, EPSILON } from './utils/grammar'
import { computeFirst, SymbolMap } from './utils/first-follow'
import { buildLR1Table, LR1Table, LR1State, LR1Item, Action } from './utils/lr1-algo'

const defaultInput = `S -> C C
C -> c C | d`

const input = ref(defaultInput)
const grammar = ref<Grammar | null>(null)
const firstSet = ref<SymbolMap | null>(null)
const lr1Result = ref<LR1Table | null>(null)
const errorMsg = ref('')

const activeTab = ref<'states' | 'table'>('table')

const terminalsList = computed(() => {
  if (!grammar.value) return []
  const terms = Array.from(grammar.value.terminals).filter(t => t !== '$').sort()
  terms.push('$')
  return terms
})

const nonTerminalsList = computed(() => {
  if (!grammar.value) return []
  // Filter out augmented start symbol if any (though parseGrammar doesn't add it)
  return Array.from(grammar.value.nonTerminals).sort()
})

function formatProd(prod: Production) {
  if (prod.rhs.length === 1 && prod.rhs[0] === EPSILON) {
    return `${prod.lhs} → ε`
  }
  return `${prod.lhs} → ${prod.rhs.join(' ')}`
}

function formatItem(item: LR1Item) {
  const rhs = [...item.production.rhs]
  if (rhs.length === 1 && rhs[0] === EPSILON) {
    // A -> .
    return `${item.production.lhs} → ·, ${item.lookahead}`
  }
  
  const parts = []
  for (let i = 0; i < rhs.length; i++) {
    if (i === item.dotIndex) parts.push('·')
    parts.push(rhs[i])
  }
  if (item.dotIndex === rhs.length) parts.push('·')
  
  return `${item.production.lhs} → ${parts.join(' ')}, ${item.lookahead}`
}

function formatAction(actions: Action[] | undefined) {
  if (!actions || actions.length === 0) return ''
  return actions.map(a => {
    if (a.type === 'SHIFT') return `s${a.value}`
    if (a.type === 'REDUCE') {
       const prod = a.value as Production
       return `r(${formatProd(prod)})`
    }
    if (a.type === 'ACCEPT') return 'acc'
    return 'err'
  }).join(' / ') // Show conflicts
}

function analyze() {
  errorMsg.value = ''
  lr1Result.value = null
  
  try {
    const g = parseGrammar(input.value)
    if (g.nonTerminals.size === 0) {
      errorMsg.value = 'Invalid grammar.'
      return
    }
    grammar.value = g
    const first = computeFirst(g)
    firstSet.value = first
    
    lr1Result.value = buildLR1Table(g, first)

  } catch (e: any) {
    console.error(e)
    errorMsg.value = 'Error: ' + e.message
  }
}

watch(input, analyze, { immediate: true })

// Helper to check for conflicts
const conflictCount = computed(() => {
  if (!lr1Result.value) return 0
  let count = 0
  lr1Result.value.action.forEach(row => {
    row.forEach(actions => {
      if (actions.length > 1) count++
    })
  })
  return count
})
</script>

<template>
  <div class="lr1-analyzer-container">
    <div class="input-section">
      <div class="header">
        <span class="title">Grammar Input</span>
        <span class="hint">Format: <code>S -> C C</code></span>
      </div>
      <textarea 
        v-model="input" 
        class="grammar-input" 
        rows="5" 
        spellcheck="false"
      ></textarea>
    </div>

    <div v-if="errorMsg" class="error">{{ errorMsg }}</div>

    <div v-if="lr1Result" class="results-section">
      
      <div class="status-bar">
        <div class="stat-item">
          States: <strong>{{ lr1Result.states.length }}</strong>
        </div>
        <div class="stat-item" :class="{ 'has-conflict': conflictCount > 0 }">
          Conflicts: <strong>{{ conflictCount }}</strong>
        </div>
      </div>

      <div class="tabs">
        <button 
          class="tab-btn" 
          :class="{ active: activeTab === 'table' }"
          @click="activeTab = 'table'"
        >
          Parsing Table (ACTION / GOTO)
        </button>
        <button 
          class="tab-btn" 
          :class="{ active: activeTab === 'states' }"
          @click="activeTab = 'states'"
        >
          Canonical Collection (States)
        </button>
      </div>

      <!-- Parsing Table -->
      <div v-if="activeTab === 'table'" class="table-container">
        <table class="lr-table">
          <thead>
            <tr>
              <th rowspan="2">State</th>
              <th :colspan="terminalsList.length">ACTION</th>
              <th :colspan="nonTerminalsList.length">GOTO</th>
            </tr>
            <tr>
              <th v-for="t in terminalsList" :key="t" class="sub-th">{{ t }}</th>
              <th v-for="nt in nonTerminalsList" :key="nt" class="sub-th">{{ nt }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="state in lr1Result.states" :key="state.id">
              <td class="state-id-cell">{{ state.id }}</td>
              <!-- ACTION -->
              <td v-for="t in terminalsList" :key="t" 
                  :class="{ 'conflict-cell': (lr1Result.action.get(state.id)?.get(t)?.length || 0) > 1 }">
                {{ formatAction(lr1Result.action.get(state.id)?.get(t)) }}
              </td>
              <!-- GOTO -->
              <td v-for="nt in nonTerminalsList" :key="nt">
                {{ lr1Result.goto.get(state.id)?.get(nt) ?? '' }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- States List -->
      <div v-if="activeTab === 'states'" class="states-grid">
        <div v-for="state in lr1Result.states" :key="state.id" class="state-card">
          <div class="state-header">State {{ state.id }}</div>
          <div class="items-list">
            <div v-for="(item, idx) in state.items" :key="idx" class="lr-item">
              {{ formatItem(item) }}
            </div>
          </div>
          <div class="transitions-list" v-if="state.transitions.size > 0">
            <hr/>
            <div v-for="[sym, target] in state.transitions" :key="sym" class="transition-item">
              {{ sym }} ➜ State {{ target }}
            </div>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<style scoped>
.lr1-analyzer-container {
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  padding: 16px;
  margin: 16px 0;
  background-color: var(--vp-c-bg-soft);
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

.status-bar {
  display: flex;
  gap: 16px;
  margin-bottom: 16px;
}

.stat-item {
  padding: 4px 8px;
  background-color: var(--vp-c-bg);
  border: 1px solid var(--vp-c-divider);
  border-radius: 4px;
  font-size: 0.9em;
}

.stat-item.has-conflict {
  color: var(--vp-c-danger-1);
  border-color: var(--vp-c-danger-1);
  background-color: var(--vp-c-danger-soft);
}

.tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
}

.tab-btn {
  padding: 6px 12px;
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  cursor: pointer;
  font-weight: 600;
  color: var(--vp-c-text-2);
}

.tab-btn.active {
  color: var(--vp-c-brand-1);
  border-bottom-color: var(--vp-c-brand-1);
}

.table-container {
  overflow-x: auto;
}

.lr-table {
  width: 100% !important;
  border-collapse: collapse;
  font-size: 0.85em;
  background-color: var(--vp-c-bg);
  display: table !important;
  /* table-layout: fixed; LR1 表格通常列很多，不建议 fixed，但要 width 100% */
}

.lr-table th, .lr-table td {
  border: 1px solid var(--vp-c-divider);
  padding: 6px;
  text-align: center;
  white-space: nowrap;
}

.lr-table th {
  background-color: var(--vp-c-bg-alt);
}

.sub-th {
  font-weight: normal;
  font-size: 0.9em;
  color: var(--vp-c-text-2);
}

.state-id-cell {
  font-weight: bold;
  background-color: var(--vp-c-bg-alt);
}

.conflict-cell {
  background-color: var(--vp-c-danger-soft);
  color: var(--vp-c-danger-1);
  font-weight: bold;
}

.states-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 12px;
}

.state-card {
  background-color: var(--vp-c-bg);
  border: 1px solid var(--vp-c-divider);
  border-radius: 4px;
  padding: 12px;
  font-size: 0.85em;
}

.state-header {
  font-weight: bold;
  border-bottom: 1px solid var(--vp-c-divider);
  padding-bottom: 6px;
  margin-bottom: 6px;
  color: var(--vp-c-brand-1);
}

.lr-item {
  font-family: var(--vp-font-family-mono);
  margin-bottom: 2px;
}

.transitions-list hr {
  margin: 8px 0;
  border: none;
  border-top: 1px solid var(--vp-c-divider);
}

.transition-item {
  color: var(--vp-c-text-2);
}
</style>
