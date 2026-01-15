<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { instance } from '@viz-js/viz'
import { buildNFA, nfaToDot } from './utils/thompson'
import { subsetConstruction, dfaToDot, ConstructionStep } from './utils/subset-construction'

const regexInput = ref('(a|b)*abb')
const direction = ref<'LR' | 'TD'>('LR')
const constructionSteps = ref<ConstructionStep[]>([])
const errorMsg = ref('')
const nfaContainerRef = ref<HTMLElement | null>(null)
const dfaContainerRef = ref<HTMLElement | null>(null)

async function updateDiagram() {
  errorMsg.value = ''
  if (!regexInput.value) {
    constructionSteps.value = []
    if (nfaContainerRef.value) nfaContainerRef.value.innerHTML = ''
    if (dfaContainerRef.value) dfaContainerRef.value.innerHTML = ''
    return
  }

  try {
    // 1. Build NFA
    const nfa = buildNFA(regexInput.value)
    if (!nfa) {
      errorMsg.value = 'Invalid Regex or empty result'
      return
    }
    const nfaDot = nfaToDot(nfa, direction.value)
    
    // 2. Build DFA (Subset Construction)
    const { startState, steps } = subsetConstruction(nfa)
    const dfaDot = dfaToDot(startState, direction.value)
    constructionSteps.value = steps

    const viz = await instance()

    // Render NFA
    if (nfaContainerRef.value) {
      const svg = viz.renderSVGElement(nfaDot)
      nfaContainerRef.value.innerHTML = ''
      nfaContainerRef.value.appendChild(svg)
    }

    // Render DFA
    if (dfaContainerRef.value) {
      const svg = viz.renderSVGElement(dfaDot)
      dfaContainerRef.value.innerHTML = ''
      dfaContainerRef.value.appendChild(svg)
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
  <div class="nfa-dfa-container">
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

    <div class="diagrams-wrapper">
      <div class="diagram-box">
        <h4>Step 1: NFA (Thompson)</h4>
        <div ref="nfaContainerRef" class="viz-render"></div>
      </div>

      <div class="arrow">⬇️ Subset Construction ⬇️</div>

      <div class="steps-box" v-if="constructionSteps.length > 0">
        <h4>Construction Steps</h4>
        <div class="table-container">
          <table class="steps-table">
            <thead>
              <tr>
                <th>Current DFA State</th>
                <th>Input Symbol</th>
                <th>move(I, a)</th>
                <th>ε-closure(move)</th>
                <th>Target DFA State</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(step, index) in constructionSteps" :key="index">
                <td>
                  <strong>{{ step.dfaStateId }}</strong> <br/> 
                  <small class="nfa-set">{ {{ step.nfaStates.join(',') }} }</small>
                </td>
                <td class="symbol-cell">{{ step.symbol }}</td>
                <td>
                  <span v-if="step.moveResult.length > 0">{ {{ step.moveResult.join(',') }} }</span>
                  <span v-else>∅</span>
                </td>
                <td>
                  <span v-if="step.targetClosure.length > 0">{ {{ step.targetClosure.join(',') }} }</span>
                  <span v-else>∅</span>
                </td>
                <td>
                  <strong>{{ step.targetDfaStateId }}</strong> <br/>
                  <span v-if="step.isNewState" class="badge-new">New</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div class="diagram-box">
        <h4>Step 2: DFA</h4>
        <div ref="dfaContainerRef" class="viz-render"></div>
        <div class="legend">
          <small>* Labels like <code>{0,1,2}</code> indicate the set of NFA states merged into this DFA state.</small>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.nfa-dfa-container {
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

.diagrams-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.diagram-box {
  width: 100%;
  padding: 16px;
  background-color: white;
  border-radius: 4px;
  overflow-x: auto;
  border: 1px solid var(--vp-c-divider);
}

.diagram-box h4 {
  margin-top: 0;
  margin-bottom: 12px;
  color: #333;
  text-align: center;
}

.arrow {
  font-weight: bold;
  color: var(--vp-c-text-2);
}

.mermaid-render {
  display: flex;
  justify-content: center;
}

.legend {
  margin-top: 8px;
  text-align: center;
  color: #666;
  font-size: 0.85em;
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

.nfa-set {
  color: var(--vp-c-text-2);
  display: block;
}

.symbol-cell {
  text-align: center;
  font-weight: bold;
  font-family: monospace;
}

.badge-new {
  display: inline-block;
  font-size: 0.75em;
  padding: 2px 6px;
  background-color: var(--vp-c-brand-1);
  color: white;
  border-radius: 4px;
  margin-left: 4px;
}
.viz-render {
  width: 100%;
  display: flex;
  justify-content: center;
}
</style>
