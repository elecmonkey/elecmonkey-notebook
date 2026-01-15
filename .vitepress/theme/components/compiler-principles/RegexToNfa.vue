<script setup lang="ts">
import { ref, watch, onMounted, nextTick } from 'vue'
import { instance } from '@viz-js/viz'
import { buildNFA, nfaToDot } from './utils/thompson'

const regexInput = ref('a*|b')
const direction = ref<'LR' | 'TD'>('LR')
const errorMsg = ref('')
const containerRef = ref<HTMLElement | null>(null)

async function updateDiagram() {
  errorMsg.value = ''
  if (!regexInput.value) {
    if (containerRef.value) containerRef.value.innerHTML = ''
    return
  }

  try {
    const nfa = buildNFA(regexInput.value)
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

onMounted(() => {
  updateDiagram()
})
</script>

<template>
  <div class="regex-nfa-container">
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
      <div class="hint">
        Supports: <code>( )</code>, <code>|</code> (union), <code>*</code> (closure), concatenation (implicit).
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

.input-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.input-group label {
  font-weight: 600;
  color: var(--vp-c-text-1);
}

.input-group input {
  padding: 8px 12px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 4px;
  background: var(--vp-c-bg-soft);
  color: var(--vp-c-text-1);
  font-family: monospace;
  font-size: 16px;
}

.options {
  display: flex;
  gap: 12px;
}

.toggle-btn {
  padding: 6px 12px;
  background: var(--vp-c-brand-soft);
  color: var(--vp-c-brand-1);
  border: 1px solid var(--vp-c-brand-1);
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
}

.toggle-btn:hover {
  background: var(--vp-c-brand-1);
  color: white;
}

.hint {
  font-size: 12px;
  color: var(--vp-c-text-3);
}

.error {
  color: var(--vp-c-danger-1);
  background: var(--vp-c-danger-soft);
  padding: 8px 12px;
  border-radius: 4px;
}

.diagram-container {
  margin-top: 16px;
  overflow: auto;
  border: 1px solid var(--vp-c-divider);
  border-radius: 4px;
  background: white; /* Graphviz output usually expects white background */
  padding: 16px;
  min-height: 200px;
  display: flex;
  justify-content: center;
}

.viz-render {
  width: 100%;
  display: flex;
  justify-content: center;
}
</style>
