<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { parseGrammar, Grammar, Production, EPSILON } from './utils/grammar'
import { computeFirst, computeFollow, SymbolMap } from './utils/first-follow'
import { buildSLR1Table, LRTable, LR0Item, Action } from './utils/lr0-algo'

const defaultInput = `E -> E + T | T
T -> T * F | F
F -> ( E ) | id`

const input = ref(defaultInput)
const grammar = ref<Grammar | null>(null)
const slr1Result = ref<LRTable | null>(null)
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
  return Array.from(grammar.value.nonTerminals).sort()
})

function formatProd(prod: Production) {
  if (prod.rhs.length === 1 && prod.rhs[0] === EPSILON) {
    return `${prod.lhs} → ε`
  }
  return `${prod.lhs} → ${prod.rhs.join(' ')}`
}

function formatItem(item: LR0Item) {
  const rhs = [...item.production.rhs]
  if (rhs.length === 1 && rhs[0] === EPSILON) {
    // A -> .
    return `${item.production.lhs} → ·`
  }
  
  const parts = []
  for (let i = 0; i < rhs.length; i++) {
    if (i === item.dotIndex) parts.push('·')
    parts.push(rhs[i])
  }
  if (item.dotIndex === rhs.length) parts.push('·')
  
  return `${item.production.lhs} → ${parts.join(' ')}`
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
  slr1Result.value = null
  
  try {
    const g = parseGrammar(input.value)
    if (g.nonTerminals.size === 0) {
      errorMsg.value = 'Invalid grammar.'
      return
    }
    grammar.value = g
    
    // 1. Compute First & Follow
    const firstRes = computeFirst(g)
    const followRes = computeFollow(g, firstRes.map)
    
    // 2. Build SLR(1) Table using Follow sets
    slr1Result.value = buildSLR1Table(g, followRes.map)

  } catch (e: any) {
    console.error(e)
    errorMsg.value = 'Error: ' + e.message
  }
}

watch(input, analyze, { immediate: true })

// Helper to check for conflicts
const conflictCount = computed(() => {
  if (!slr1Result.value) return 0
  let count = 0
  slr1Result.value.action.forEach(row => {
    row.forEach(actions => {
      if (actions.length > 1) count++
    })
  })
  return count
})
</script>

<template>
  <div class="slr1-analyzer-container">
    <div class="input-section">
      <div class="header">
        <span class="title">Grammar Input (SLR(1))</span>
        <span class="hint">Format: <code>E -> E + T</code></span>
      </div>
      <textarea 
        v-model="input" 
        class="grammar-input" 
        rows="5" 
        spellcheck="false"
      ></textarea>
    </div>

    <div v-if="errorMsg" class="error">{{ errorMsg }}</div>

    <div v-if="slr1Result" class="results-section">
      
      <div class="status-bar">
        <div class="stat-item">
          States: <strong>{{ slr1Result.states.length }}</strong>
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
          LR(0) Collection (States)
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
            <tr v-for="state in slr1Result.states" :key="state.id">
              <td class="state-id-cell">{{ state.id }}</td>
              <!-- ACTION -->
              <td v-for="t in terminalsList" :key="t" 
                  :class="{ 'conflict-cell': (slr1Result.action.get(state.id)?.get(t)?.length || 0) > 1 }">
                {{ formatAction(slr1Result.action.get(state.id)?.get(t)) }}
              </td>
              <!-- GOTO -->
              <td v-for="nt in nonTerminalsList" :key="nt">
                {{ slr1Result.goto.get(state.id)?.get(nt) ?? '' }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- States List -->
      <div v-if="activeTab === 'states'" class="states-grid">
        <div v-for="state in slr1Result.states" :key="state.id" class="state-card">
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
.slr1-analyzer-container {
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

.status-bar {
  display: flex;
  gap: 20px;
  margin-bottom: 16px;
  padding: 8px 12px;
  background-color: var(--vp-c-bg-alt);
  border-radius: 4px;
  font-size: 0.9em;
}

.stat-item.has-conflict {
  color: var(--vp-c-danger-1);
}

.tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
  border-bottom: 1px solid var(--vp-c-divider);
}

.tab-btn {
  padding: 8px 16px;
  border: none;
  background: none;
  cursor: pointer;
  color: var(--vp-c-text-2);
  border-bottom: 2px solid transparent;
  transition: all 0.2s;
}

.tab-btn:hover {
  color: var(--vp-c-brand);
}

.tab-btn.active {
  color: var(--vp-c-brand);
  border-bottom-color: var(--vp-c-brand);
  font-weight: bold;
}

.table-container {
  overflow-x: auto;
  border: 1px solid var(--vp-c-divider);
  border-radius: 4px;
}

.lr-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.85em;
  white-space: nowrap;
}

.lr-table th, .lr-table td {
  border: 1px solid var(--vp-c-divider);
  padding: 6px 10px;
  text-align: center;
}

.lr-table th {
  background-color: var(--vp-c-bg-alt);
  font-weight: 600;
}

.state-id-cell {
  background-color: var(--vp-c-bg-alt);
  font-weight: bold;
  width: 40px;
}

.conflict-cell {
  background-color: var(--vp-c-danger-soft);
  color: var(--vp-c-danger-1);
  font-weight: bold;
}

.states-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
}

.state-card {
  border: 1px solid var(--vp-c-divider);
  border-radius: 6px;
  padding: 12px;
  background-color: var(--vp-c-bg);
  font-size: 0.85em;
}

.state-header {
  font-weight: bold;
  border-bottom: 1px solid var(--vp-c-divider);
  padding-bottom: 4px;
  margin-bottom: 8px;
  color: var(--vp-c-brand);
}

.items-list {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.lr-item {
  font-family: var(--vp-font-family-mono);
  color: var(--vp-c-text-2);
}

.transitions-list hr {
  margin: 8px 0;
  border: none;
  border-top: 1px solid var(--vp-c-divider);
}

.transition-item {
  color: var(--vp-c-text-1);
  font-weight: 500;
}
</style>
