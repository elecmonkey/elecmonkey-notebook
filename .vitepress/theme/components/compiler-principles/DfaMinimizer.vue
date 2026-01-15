<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { instance } from '@viz-js/viz'
import { buildNFA } from './utils/thompson'
import { subsetConstruction, dfaToDot } from './utils/subset-construction'
import { minimizeDFA, MinimizedDFA, minDfaToDot } from './utils/dfa-minimization'

const regexInput = ref('(a|b)*abb')
const direction = ref<'LR' | 'TD'>('LR')
const minResult = ref<MinimizedDFA | null>(null)
const errorMsg = ref('')
const initialContainerRef = ref<HTMLElement | null>(null)
const minContainerRef = ref<HTMLElement | null>(null)

async function updateDiagram() {
  errorMsg.value = ''
  if (!regexInput.value) {
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
    
    const dfaDot = dfaToDot(dfaStart, direction.value)

    // 2. Minimize DFA
    const result = minimizeDFA(dfaStart)
    minResult.value = result
    
    const minDot = minDfaToDot(result.startState, direction.value)

    const viz = await instance()

    // Render Initial DFA
    if (initialContainerRef.value) {
      const svg = viz.renderSVGElement(dfaDot)
      initialContainerRef.value.innerHTML = ''
      initialContainerRef.value.appendChild(svg)
    }

    // Render Minimized DFA
    if (minContainerRef.value) {
      const svg = viz.renderSVGElement(minDot)
      minContainerRef.value.innerHTML = ''
      minContainerRef.value.appendChild(svg)
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

onMounted(() => {
  updateDiagram()
})
</script>

<template>
  <div class="dfa-min-container">
    <div class="controls">
      <div class="input-row">
        <div class="input-group">
          <label>Regular Expression:</label>
          <input 
            v-model="regexInput" 
            @input="onInput" 
            type="text" 
            placeholder="e.g. (a|b)*abb"
          />
        </div>
        <button class="toggle-btn" @click="toggleDirection">
          Direction: {{ direction === 'LR' ? 'Left to Right' : 'Top to Down' }}
        </button>
      </div>
      <div class="hint">
        Supports: <code>( )</code>, <code>|</code> (union), <code>*</code> (closure), concatenation (implicit).
      </div>
    </div>

    <div v-if="errorMsg" class="error">{{ errorMsg }}</div>

    <div class="content-wrapper" v-if="minResult">
      <div class="diagram-section">
        <h3>1. Initial DFA (from NFA)</h3>
        <div class="diagram-container">
          <div ref="initialContainerRef" class="viz-render"></div>
        </div>
      </div>

      <div class="arrow">⬇️ Minimization (Partition Refinement) ⬇️</div>

      <div class="diagram-section">
        <h3>2. Partition Refinement Steps</h3>
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

      <div class="diagram-section">
        <h3>3. Minimized DFA</h3>
        <div class="diagram-container">
          <div ref="minContainerRef" class="viz-render"></div>
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

.input-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}

.input-group {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
}

.input-group label {
  font-weight: bold;
  white-space: nowrap;
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
  padding: 8px 12px;
  background-color: var(--vp-c-brand-soft);
  color: var(--vp-c-brand-1);
  border: 1px solid var(--vp-c-brand-1);
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9em;
  white-space: nowrap;
  height: 38px;
  transition: all 0.2s;
}

.toggle-btn:hover {
  background-color: var(--vp-c-brand-1);
  color: white;
}

.hint {
  font-size: 0.9em;
  color: var(--vp-c-text-2);
}

.diagram-section {
  width: 100%;
  margin-bottom: 24px;
}

.diagram-container {
  overflow-x: auto;
  padding: 20px;
  background-color: white;
  border-radius: 4px;
  min-height: 100px;
  display: flex;
  justify-content: center;
  width: 100%;
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
.viz-render {
  width: 100%;
  display: flex;
  justify-content: center;
}
</style>
