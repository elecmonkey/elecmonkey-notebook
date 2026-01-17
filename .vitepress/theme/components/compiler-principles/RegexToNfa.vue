<script setup lang="ts">
import { ref, watch, onMounted, nextTick } from 'vue'
import { instance } from '@viz-js/viz'
import { buildNFA, nfaToDot } from './utils/thompson'

const regexInput = ref('a*|b')
const direction = ref<'LR' | 'TD'>('LR')
const isSimplified = ref(false)
const errorMsg = ref('')
const containerRef = ref<HTMLElement | null>(null)

async function updateDiagram() {
  errorMsg.value = ''
  if (!regexInput.value) {
    if (containerRef.value) containerRef.value.innerHTML = ''
    return
  }

  try {
    const nfa = buildNFA(regexInput.value, isSimplified.value)
    if (!nfa) {
      errorMsg.value = 'Invalid Regex or empty result'
      return
    }
    const dot = nfaToDot(nfa, direction.value)
    
    // Render with viz-js
    if (containerRef.value) {
      const viz = await instance()
      const svg = viz.renderSVGElement(dot)
      containerRef.value.innerHTML = ''
      containerRef.value.appendChild(svg)
    }
  } catch (e: any) {
    console.error(e)
    errorMsg.value = 'Error generating diagram: ' + e.message
  }
}

// Watch for changes with a small debounce could be nice, but for now manual or lazy
// Let's just watch and debounce slightly or just use @input
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

function toggleMode() {
  isSimplified.value = !isSimplified.value
  updateDiagram()
}

onMounted(() => {
  updateDiagram()
})
</script>

<template>
  <div class="regex-nfa-container">
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
        <button class="toggle-btn" @click="toggleMode" :class="{ active: isSimplified }">
          Mode: {{ isSimplified ? 'Simplified (Compact)' : 'Standard (Thompson)' }}
        </button>
      </div>
      <div class="hint">
        Supports: <code>( )</code>, <code>|</code> (union), <code>*</code> (closure), concatenation (implicit).
        <br>
        <strong>Simplified Mode:</strong> Reduces ε-transitions by merging states where possible (e.g. 1--a-->2 instead of 1--ε-->1'--a-->2'--ε-->2).
      </div>
    </div>

    <div v-if="errorMsg" class="error">{{ errorMsg }}</div>

    <div class="diagram-container">
      <div ref="containerRef" class="viz-render"></div>
    </div>
  </div>
</template>

<style scoped>
.regex-nfa-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 20px;
  background: var(--vp-c-bg);
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
}

.controls {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.input-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
  flex-wrap: wrap;
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
  height: 38px; /* Match input height */
  transition: all 0.2s;
}

.toggle-btn.active {
  background-color: var(--vp-c-brand-1);
  color: white;
}

.toggle-btn:hover {
  background-color: var(--vp-c-brand-1);
  color: white;
}

.hint {
  font-size: 0.9em;
  color: var(--vp-c-text-2);
}

.error {
  color: var(--vp-c-danger-1);
  margin-bottom: 8px;
}

.diagram-container {
  overflow-x: auto;
  padding: 20px;
  background-color: white; /* Mermaid default theme looks best on white */
  border-radius: 4px;
  min-height: 100px;
  display: flex;
  justify-content: center;
  width: 100%;
}

.viz-render {
  width: 100%;
  display: flex;
  justify-content: center;
}
</style>
