<script setup lang="ts">
import { ref, onMounted } from 'vue'
import mermaid from 'mermaid'
import { buildNFA, nfaToMermaid } from './utils/thompson'
import { subsetConstruction, dfaToMermaid } from './utils/subset-construction'
import { minimizeDFA, MinimizedDFA } from './utils/dfa-minimization'

const regexInput = ref('(a|b)*abb')
const direction = ref<'LR' | 'TD'>('LR')
const initialDfaMermaid = ref('')
const minDfaMermaid = ref('')
const minResult = ref<MinimizedDFA | null>(null)
const errorMsg = ref('')
const initialContainerRef = ref<HTMLElement | null>(null)
const minContainerRef = ref<HTMLElement | null>(null)

// Initialize mermaid
onMounted(() => {
  mermaid.initialize({ 
    startOnLoad: false,
    theme: 'default',
    securityLevel: 'loose',
  })
  updateDiagram()
})

async function updateDiagram() {
  errorMsg.value = ''
  if (!regexInput.value) {
    initialDfaMermaid.value = ''
    minDfaMermaid.value = ''
    minResult.value = null
    if (initialContainerRef.value) initialContainerRef.value.innerHTML = ''
    if (minContainerRef.value) minContainerRef.value.innerHTML = ''
    return
  }

  try {
    // 1. Regex -> NFA -> DFA (Initial)
    const nfa = buildNFA(regexInput.value)
    if (!nfa) {
      errorMsg.value = 'Invalid Regex'
      return
    }
    const { startState: dfaStart } = subsetConstruction(nfa)
    
    const dfaCode = dfaToMermaid(dfaStart, direction.value)
    initialDfaMermaid.value = dfaCode

    // 2. Minimize DFA
    const result = minimizeDFA(dfaStart)
    minResult.value = result
    
    const minCode = dfaToMermaid(result.startState, direction.value)
    minDfaMermaid.value = minCode

    // Render Initial DFA
    if (initialContainerRef.value) {
      const id = `mermaid-init-dfa-${Date.now()}`
      const { svg } = await mermaid.render(id, dfaCode)
      initialContainerRef.value.innerHTML = svg
    }

    // Render Minimized DFA
    if (minContainerRef.value) {
      const id = `mermaid-min-dfa-${Date.now()}`
      const { svg } = await mermaid.render(id, minCode)
      minContainerRef.value.innerHTML = svg
    }

  } catch (e: any) {
    console.error(e)
    errorMsg.value = 'Error: ' + e.message
  }
}

let timeout: any = null
function onInput() {
  if (timeout) clearTimeout(timeout)
  timeout = setTimeout(() => {
    updateDiagram()
  }, 500)
}

function toggleDirection() {
  direction.value = direction.value === 'LR' ? 'TD' : 'LR'
  updateDiagram()
}
</script>

<template>
  <div class="dfa-min-container">
    <div class="controls">
      <div class="input-group">
        <label>Regular Expression:</label>
        <input 
          v-model="regexInput" 
          @input="onInput" 
          type="text" 
          placeholder="e.g. (a|b)*abb"
        />
      </div>
      <div class="options">
        <button class="toggle-btn" @click="toggleDirection">
          Direction: {{ direction === 'LR' ? 'Left to Right' : 'Top to Down' }}
        </button>
      </div>
    </div>

    <div v-if="errorMsg" class="error">{{ errorMsg }}</div>

    <div class="content-wrapper" v-if="minResult">
      <!-- 1. Initial DFA -->
      <div class="panel">
        <h4>1. Initial DFA</h4>
        <div ref="initialContainerRef" class="mermaid-render"></div>
      </div>

      <div class="arrow">⬇️ Minimization (Partition Refinement) ⬇️</div>

      <!-- 2. Steps Table -->
      <div class="steps-box">
        <h4>2. Partition Steps</h4>
        <div class="table-container">
          <table class="steps-table">
            <thead>
              <tr>
                <th>Round</th>
                <th>Groups (Sets of State IDs)</th>
                <th>Note</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="step in minResult.steps" :key="step.round">
                <td class="round-cell">{{ step.round }}</td>
                <td>
                  <div class="group-list">
                    <span v-for="(g, i) in step.groups" :key="i" class="group-item">
                      { {{ g.join(',') }} }
                    </span>
                  </div>
                </td>
                <td class="note-cell">{{ step.splitReason }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div class="arrow">⬇️ Result ⬇️</div>

      <!-- 3. Minimized DFA -->
      <div class="panel">
        <h4>3. Minimized DFA</h4>
        <div ref="minContainerRef" class="mermaid-render"></div>
        <div class="legend">
          <small>New states are merged from equivalent original states.</small>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.dfa-min-container {
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  padding: 16px;
  margin: 16px 0;
  background-color: var(--vp-c-bg-soft);
}

.controls {
  margin-bottom: 16px;
}

.input-group {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.input-group label {
  font-weight: bold;
}

.input-group input {
  flex: 1;
  padding: 8px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 4px;
  background-color: var(--vp-c-bg);
  color: var(--vp-c-text-1);
}

.toggle-btn {
  padding: 4px 12px;
  background-color: var(--vp-c-brand-soft);
  color: var(--vp-c-brand-1);
  border: 1px solid var(--vp-c-brand-1);
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9em;
}

.error {
  color: var(--vp-c-danger-1);
  margin-bottom: 16px;
  padding: 8px;
  background-color: var(--vp-c-danger-soft);
  border-radius: 4px;
}

.content-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.panel {
  width: 100%;
  padding: 16px;
  background-color: white;
  border-radius: 4px;
  border: 1px solid var(--vp-c-divider);
  overflow-x: auto;
}

.panel h4 {
  margin-top: 0;
  margin-bottom: 12px;
  text-align: center;
  color: #333;
}

.arrow {
  font-weight: bold;
  color: var(--vp-c-text-2);
}

.mermaid-render {
  display: flex;
  justify-content: center;
}

.steps-box {
  width: 100%;
  padding: 16px;
  background-color: var(--vp-c-bg);
  border-radius: 4px;
  border: 1px solid var(--vp-c-divider);
}

.steps-box h4 {
  margin-top: 0;
  margin-bottom: 12px;
  text-align: center;
}

.table-container {
  overflow-x: auto;
}

.steps-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9em;
}

.steps-table th,
.steps-table td {
  border: 1px solid var(--vp-c-divider);
  padding: 8px;
  text-align: left;
}

.steps-table th {
  background-color: var(--vp-c-bg-alt);
  font-weight: 600;
}

.round-cell {
  text-align: center;
  font-weight: bold;
  width: 60px;
}

.group-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.group-item {
  background-color: var(--vp-c-bg-alt);
  padding: 2px 6px;
  border-radius: 4px;
  border: 1px solid var(--vp-c-divider);
  font-family: monospace;
}

.note-cell {
  color: var(--vp-c-text-2);
  font-style: italic;
}

.legend {
  text-align: center;
  margin-top: 8px;
  color: #666;
}
</style>
