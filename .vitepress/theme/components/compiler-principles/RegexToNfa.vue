<script setup lang="ts">
import { ref, watch, onMounted, nextTick } from 'vue'
import mermaid from 'mermaid'
import { buildNFA, nfaToMermaid } from './utils/thompson'

const regexInput = ref('a*|b')
const direction = ref<'LR' | 'TD'>('LR')
const mermaidCode = ref('')
const errorMsg = ref('')
const containerRef = ref<HTMLElement | null>(null)

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
    mermaidCode.value = ''
    if (containerRef.value) containerRef.value.innerHTML = ''
    return
  }

  try {
    const nfa = buildNFA(regexInput.value)
    if (!nfa) {
      errorMsg.value = 'Invalid Regex or empty result'
      return
    }
    const code = nfaToMermaid(nfa, direction.value)
    mermaidCode.value = code
    
    // Render with mermaid
    if (containerRef.value) {
      const id = `mermaid-${Date.now()}`
      const { svg } = await mermaid.render(id, code)
      containerRef.value.innerHTML = svg
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
      <div ref="containerRef" class="mermaid-render"></div>
    </div>

    <details class="debug-info">
      <summary>Show Mermaid Code</summary>
      <pre>{{ mermaidCode }}</pre>
    </details>
  </div>
</template>

<style scoped>
.regex-nfa-container {
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

.options {
  margin-bottom: 8px;
}

.toggle-btn {
  padding: 4px 12px;
  background-color: var(--vp-c-brand-soft);
  color: var(--vp-c-brand-1);
  border: 1px solid var(--vp-c-brand-1);
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9em;
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
}

/* Dark mode adjustment if needed, but simple white bg is safe for diagrams */
:root.dark .diagram-container {
  background-color: #fff; 
  filter: invert(1) hue-rotate(180deg); /* Simple dark mode hack for diagrams */
}
/* Revert invert for the SVG itself if colors are weird, but usually this is okay for black/white diagrams */
:root.dark .diagram-container img, 
:root.dark .diagram-container svg {
  /* filter: invert(1) hue-rotate(180deg); */
}

.debug-info {
  margin-top: 16px;
  font-size: 0.85em;
  color: var(--vp-c-text-3);
}
</style>
