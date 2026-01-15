<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import { instance } from '@viz-js/viz'
import { parseTACBlock, buildDAG, markDeadCode, reconstructCode, dagToDot, type DAGNode, type TAC } from './utils/dag-algo'

// 预设案例 (Test 31 style)
const defaultInput = `A = B + C
B = B - D
C = P + Q
E = B + C
F = B - D
`
// Test 61 style example could be added too
const defaultLiveVars = 'A, E' // F is dead code if not used

// State
const currentStep = ref(1)
const inputCode = ref(defaultInput)
const liveVarsInput = ref(defaultLiveVars)
const tacs = ref<TAC[]>([])
const dagNodes = ref<DAGNode[]>([])
const optimizedCode = ref<string[]>([])
const errorMsg = ref('')

const vizContainerRef = ref<HTMLElement | null>(null)
const legendRef = ref<HTMLElement | null>(null)

// 拖拽相关逻辑
const legendOffset = ref({ x: 0, y: 0 })
let isDragging = false
let startPos = { x: 0, y: 0 }
let startOffset = { x: 0, y: 0 }

function handleStart(e: MouseEvent | TouchEvent) {
  isDragging = true
  const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
  const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY
  
  startPos = { x: clientX, y: clientY }
  startOffset = { ...legendOffset.value }
  
  if ('touches' in e) {
    window.addEventListener('touchmove', handleMove, { passive: false })
    window.addEventListener('touchend', handleEnd)
  } else {
    window.addEventListener('mousemove', handleMove)
    window.addEventListener('mouseup', handleEnd)
  }
  
  if (e.cancelable && !('touches' in e)) {
     e.preventDefault() 
  }
}

function handleMove(e: MouseEvent | TouchEvent) {
  if (!isDragging) return
  
  const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
  const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY

  const dx = clientX - startPos.x
  const dy = clientY - startPos.y
  
  let newX = startOffset.x + dx
  let newY = startOffset.y + dy

  // 边界检查
  if (legendRef.value && vizContainerRef.value) {
    const legendRect = legendRef.value.getBoundingClientRect()
    const containerRect = vizContainerRef.value.getBoundingClientRect()
    
    // 计算相对边界
    // 初始位置是 bottom: 10, right: 10
    // transform 是相对于这个初始位置的偏移
    
    // 向左最大偏移：容器宽度 - 图例宽度 - padding(20)
    const maxLeft = -(containerRect.width - legendRect.width - 20)
    // 向右最大偏移：0 (不能超出右边界)
    const maxRight = 0
    
    // 向上最大偏移：容器高度 - 图例高度 - padding(20)
    const maxUp = -(containerRect.height - legendRect.height - 20)
    // 向下最大偏移：0 (不能超出下边界)
    const maxDown = 0

    if (newX < maxLeft) newX = maxLeft
    if (newX > maxRight) newX = maxRight
    if (newY < maxUp) newY = maxUp
    if (newY > maxDown) newY = maxDown
  }

  legendOffset.value = { x: newX, y: newY }
  
  if (e.cancelable) {
    e.preventDefault()
  }
}

function handleEnd() {
  isDragging = false
  window.removeEventListener('mousemove', handleMove)
  window.removeEventListener('mouseup', handleEnd)
  window.removeEventListener('touchmove', handleMove)
  window.removeEventListener('touchend', handleEnd)
}

// Computed
const stepTitle = computed(() => {
  switch (currentStep.value) {
    case 1: return 'Step 1: 输入基本块代码与活跃变量'
    case 2: return 'Step 2: 构建 DAG (公共子表达式消除 & 常量折叠)'
    case 3: return 'Step 3: 死代码消除与代码重构'
    default: return ''
  }
})

// Actions
function nextStep() {
  if (currentStep.value < 3) {
    if (currentStep.value === 1) {
      if (!analyze()) return
    }
    currentStep.value++
    if (currentStep.value === 2) {
      setTimeout(() => renderDAG(), 100)
    }
    if (currentStep.value === 3) {
      optimize()
      setTimeout(() => renderDAG(), 100) // Re-render with dead code marking
    }
  }
}

function prevStep() {
  if (currentStep.value > 1) {
    currentStep.value--
    if (currentStep.value === 2) {
      // Re-render without dead code marking (conceptually) 
      // Actually we just render the DAG state. 
      // If we want to show "before dead code elimination", we should reset isLive?
      // For simplicity, let's keep isLive logic simple:
      // Step 2 shows structure. Step 3 highlights dead/live.
      // So when going back to 2, we might want to clear live marks?
      // Let's just re-analyze to reset.
      analyze()
      setTimeout(() => renderDAG(), 100)
    }
  }
}

function analyze(): boolean {
  errorMsg.value = ''
  try {
    // Parse
    tacs.value = parseTACBlock(inputCode.value)
    if (tacs.value.length === 0) {
      errorMsg.value = '输入代码为空或格式不正确'
      return false
    }
    
    // Build DAG
    const result = buildDAG(tacs.value)
    dagNodes.value = result.nodes
    return true
  } catch (e: any) {
    errorMsg.value = e.message
    return false
  }
}

function optimize() {
  // Re-build DAG with advanced optimizations (associative folding) enabled
  const result = buildDAG(tacs.value, true)
  dagNodes.value = result.nodes

  // Parse live vars
  const liveOut = liveVarsInput.value.split(/[,，\s]+/).filter(s => s)
  
  // Mark Dead Code
  // Note: varMap is internal to buildDAG, but we can infer or pass it out.
  // For simplicity, markDeadCode in utils now searches identifiers in nodes.
  // But wait, buildDAG creates nodes with identifiers. 
  // Let's assume the utils function handles it correctly by searching identifiers.
  markDeadCode(dagNodes.value, liveOut, new Map()) // map not strictly needed if we search nodes
  
  // Reconstruct
  optimizedCode.value = reconstructCode(dagNodes.value)
}

async function renderDAG() {
  if (!vizContainerRef.value) return
  
  try {
    const dot = dagToDot(dagNodes.value, currentStep.value >= 3)
    const viz = await instance()
    const svg = viz.renderSVGElement(dot)
    
    vizContainerRef.value.innerHTML = ''
    vizContainerRef.value.appendChild(svg)
    svg.style.maxWidth = '100%'
    svg.style.height = 'auto'
  } catch (e: any) {
    console.error(e)
    errorMsg.value = 'DAG 渲染失败: ' + e.message
  }
}

// Watchers
watch([inputCode, liveVarsInput], () => {
  if (currentStep.value > 1) {
    currentStep.value = 1
  }
})

onMounted(() => {
  analyze()
})
</script>

<template>
  <div class="dag-optimizer">
    <!-- Stepper Header -->
    <div class="stepper">
      <div class="step" :class="{ active: currentStep >= 1, current: currentStep === 1 }">1. Input</div>
      <div class="line"></div>
      <div class="step" :class="{ active: currentStep >= 2, current: currentStep === 2 }">2. DAG Construction</div>
      <div class="line"></div>
      <div class="step" :class="{ active: currentStep >= 3, current: currentStep === 3 }">3. Optimization</div>
    </div>

    <div class="content-area">
      <!-- Step 1: Input (Always visible) -->
      <div class="step-section" :class="{ 'completed': currentStep > 1 }">
        <h4>1. 输入基本块代码与活跃变量</h4>
        <div class="step-content">
          <div class="form-group full-width">
            <label>基本块代码 (TAC):</label>
            <textarea v-model="inputCode" rows="6" spellcheck="false" placeholder="A = B + C..." ></textarea>
          </div>
          <div class="form-group full-width">
            <label>基本块出口活跃变量 (Live-out Variables):</label>
            <input v-model="liveVarsInput" placeholder="例如: A, E (逗号分隔)" />
            <div class="hint">这些变量的值在基本块之后会被用到，因此计算它们的路径是活跃的。</div>
          </div>
        </div>
      </div>

      <!-- Step 2: Viz (Visible if step >= 2) -->
      <div v-if="currentStep >= 2" class="step-section">
        <h4>2. 构建 DAG (公共子表达式消除 & 常量折叠)</h4>
        <div class="step-content viz-layout">
          <div class="viz-container">
            <div ref="vizContainerRef" class="viz-render"></div>
            <div 
              class="legend" 
              v-if="currentStep >= 3"
              ref="legendRef"
              :style="{ transform: `translate(${legendOffset.x}px, ${legendOffset.y}px)` }"
              @mousedown="handleStart"
              @touchstart="handleStart"
            >
              <div class="item"><span class="swatch live"></span> 活跃节点 (Live)</div>
              <div class="item"><span class="swatch dead"></span> 死节点 (Dead)</div>
              <div class="item"><span class="swatch const"></span> 常量 (Constant)</div>
              <div class="item"><span class="swatch leaf"></span> 叶子 (Leaf)</div>
            </div>
          </div>
        </div>
      </div>
        
      <!-- Step 3: Result (Visible if step >= 3) -->
      <div v-if="currentStep >= 3" class="step-section">
        <h4>3. 死代码消除与代码重构</h4>
        <div class="step-content result-layout">
          <div class="result-panel">
            <h5>优化后代码 (Optimized TAC)</h5>
            <div class="code-box">
              <div v-for="(line, i) in optimizedCode" :key="i" class="code-line">{{ line }}</div>
              <div v-if="optimizedCode.length === 0" class="empty-hint">无有效代码生成 (全为死代码?)</div>
            </div>
            <div class="stats">
              原始行数: {{ tacs.length }} &nbsp;->&nbsp; 优化后: {{ optimizedCode.length }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="errorMsg" class="error-msg">{{ errorMsg }}</div>

    <div class="controls">
      <button class="secondary" @click="prevStep" :disabled="currentStep === 1">上一步</button>
      <button class="primary" @click="nextStep" :disabled="currentStep === 3">
        {{ currentStep === 1 ? '构建 DAG' : (currentStep === 2 ? '执行优化' : '完成') }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.dag-optimizer {
  display: flex;
  flex-direction: column;
  gap: 20px;
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  padding: 20px;
  min-height: 600px;
}

.stepper {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
}

.step {
  padding: 8px 16px;
  border-radius: 20px;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-2);
  border: 1px solid var(--vp-c-divider);
  font-size: 14px;
  font-weight: bold;
}

.step.active {
  background: var(--vp-c-brand-soft);
  color: var(--vp-c-brand-1);
  border-color: var(--vp-c-brand-1);
}

.step.current {
  background: var(--vp-c-brand-1);
  color: white;
}

.line {
  width: 40px;
  height: 2px;
  background: var(--vp-c-divider);
  margin: 0 8px;
}

.content-area {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.step-section {
  border: 1px solid var(--vp-c-divider);
  background-color: var(--vp-c-bg);
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 20px;
}

.step-section.completed {
  opacity: 0.8;
}

.step-section h4 {
  margin: 0 0 16px 0;
  font-size: 1.1em;
  color: var(--vp-c-brand-1);
}

.step-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-group.full-width {
  width: 100%;
}

.viz-layout {
  width: 100%;
}

.result-layout {
  width: 100%;
}

.input-step {
  /* Removed max-width to full fill */
  width: 100%;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

textarea, input {
  padding: 12px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 4px;
  background: var(--vp-c-bg);
  font-family: monospace;
}

.hint {
  font-size: 12px;
  color: var(--vp-c-text-2);
}

/* Removed .viz-step grid layout to allow full width stacking */
/*
.viz-step {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 20px;
  height: 100%;
}

@media (max-width: 768px) {
  .viz-step {
    grid-template-columns: 1fr;
  }
}
*/

.viz-container {
  background: white;
  border: 1px solid var(--vp-c-divider);
  border-radius: 4px;
  padding: 20px;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  min-height: 400px;
  overflow: auto;
}

.viz-render {
  width: 100%;
  display: flex;
  justify-content: center;
}

.legend {
  position: absolute;
  bottom: 10px;
  right: 10px;
  background: rgba(255,255,255,0.9);
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 12px;
  cursor: grab;
  user-select: none;
  box-shadow: 0 2px 5px rgba(0,0,0,0.2);
  z-index: 10;
}

.legend:active {
  cursor: grabbing;
}

.item {
  display: flex;
  align-items: center;
  margin: 4px 0;
}

.swatch {
  width: 12px;
  height: 12px;
  margin-right: 6px;
  border: 1px solid #333;
}

.swatch.live { background: white; border-color: black; } /* Default filled,solid */
.swatch.dead { background: #f0f0f0; border-color: gray; border-style: dashed; }
.swatch.const { background: #e6fffa; }
.swatch.leaf { background: white; }

.result-panel {
  background: var(--vp-c-bg);
  border: 1px solid var(--vp-c-divider);
  border-radius: 4px;
  padding: 16px;
  display: flex;
  flex-direction: column;
}

.code-box {
  flex: 1;
  background: var(--vp-c-bg-alt);
  padding: 12px;
  border-radius: 4px;
  font-family: monospace;
  overflow-y: auto;
  border: 1px solid var(--vp-c-divider);
}

.code-line {
  padding: 2px 0;
}

.stats {
  margin-top: 12px;
  font-size: 13px;
  color: var(--vp-c-text-2);
  text-align: right;
}

.controls {
  display: flex;
  justify-content: space-between;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid var(--vp-c-divider);
}

button {
  padding: 8px 24px;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
  transition: all 0.2s;
}

button.primary {
  background: var(--vp-c-brand-1);
  color: white;
  border: none;
}
button.primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

button.secondary {
  background: var(--vp-c-bg);
  border: 1px solid var(--vp-c-divider);
}
button.secondary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.error-msg {
  color: var(--vp-c-red-1);
  padding: 10px;
  background: var(--vp-c-red-soft);
  border-radius: 4px;
  margin-top: 10px;
}
</style>
