<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import { instance } from '@viz-js/viz'
import { parseTACBlock, buildDAG, markDeadCode, reconstructCode, dagToDot, type DAGNode, type TAC } from './utils/dag-algo'

// 预设案例 (Comprehensive Optimization Showcase)
const defaultInput = `// 1. 公共子表达式消除 (CSE)
T1 = A + B
T2 = A + B

// 2. 代数恒等式 (Algebraic Identities)
T3 = T1 * 1    // T3 等价于 T1
T4 = T2 + 0    // T4 等价于 T2 (即 T1)

// 3. 常量折叠 (Constant Folding)
T5 = 2 * 3     // T5 编译时计算为 6

// 4. 死代码 (Dead Code)
Dead = X + Y   // 该变量后续未被使用(不在活跃列表中)

// 5. 结果计算
Final = T3 + T5`

const defaultLiveVars = 'Final'

// State
const currentStep = ref(1)
const inputCode = ref(defaultInput)
const liveVarsInput = ref(defaultLiveVars)
const tacs = ref<TAC[]>([])
const initialDagNodes = ref<DAGNode[]>([])
const optimizedDagNodes = ref<DAGNode[]>([])
const optimizedCode = ref<string[]>([])
const errorMsg = ref('')

const initialVizRef = ref<HTMLElement | null>(null)
const optimizedVizRef = ref<HTMLElement | null>(null)
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
  if (legendRef.value && initialVizRef.value) {
    const legendRect = legendRef.value.getBoundingClientRect()
    const containerRect = initialVizRef.value.getBoundingClientRect()
    
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
    case 2: return 'Step 2: 构建初始 DAG (仅执行 CSE)'
    case 3: return 'Step 3: 执行高级优化 (代数恒等式、常量折叠、死代码消除)'
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
      setTimeout(() => renderDAG(initialDagNodes.value, initialVizRef.value, false), 100)
    }
    if (currentStep.value === 3) {
      optimize()
      setTimeout(() => renderDAG(optimizedDagNodes.value, optimizedVizRef.value, true), 100)
    }
  }
}

function prevStep() {
  if (currentStep.value > 1) {
    currentStep.value--
    if (currentStep.value === 2) {
      // Re-render without optimizations (back to faithful construction)
      analyze()
      setTimeout(() => renderDAG(initialDagNodes.value, initialVizRef.value, false), 100)
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
    
    // Build DAG (Step 2: Faithful Construction, NO optimizations except CSE)
    const result = buildDAG(tacs.value, false)
    initialDagNodes.value = result.nodes
    return true
  } catch (e: any) {
    errorMsg.value = e.message
    return false
  }
}

function optimize() {
  // Re-build DAG with advanced optimizations enabled (Step 3)
  const result = buildDAG(tacs.value, true)
  optimizedDagNodes.value = result.nodes

  // Parse live vars
  const liveOut = liveVarsInput.value.split(/[,，\s]+/).filter(s => s)
  
  // Mark Dead Code
  markDeadCode(optimizedDagNodes.value, liveOut, new Map())
  
  // Reconstruct
  optimizedCode.value = reconstructCode(optimizedDagNodes.value)
}

async function renderDAG(nodes: DAGNode[], container: HTMLElement | null, showLiveness: boolean) {
  if (!container) return
  
  try {
    const dot = dagToDot(nodes, showLiveness)
    const viz = await instance()
    const svg = viz.renderSVGElement(dot)
    
    container.innerHTML = ''
    container.appendChild(svg)
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
        <h4>2. 构建初始 DAG (仅执行 CSE)</h4>
        <div class="step-content viz-layout">
          <div class="viz-container">
            <div ref="initialVizRef" class="viz-render"></div>
            <!-- Legend removed per user request -->
          </div>
        </div>
      </div>
        
      <!-- Step 3: Result (Visible if step >= 3) -->
      <div v-if="currentStep >= 3" class="step-section">
        <h4>3. 执行高级优化与代码重构</h4>
        <div class="step-content result-layout">
          <div class="viz-container">
            <div ref="optimizedVizRef" class="viz-render"></div>
          </div>
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
