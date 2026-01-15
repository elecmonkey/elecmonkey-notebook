<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { instance } from '@viz-js/viz'
import { parseTAC, findLeaders, buildBasicBlocks, buildCFG, type TACInstruction, type BasicBlock, type ControlFlowGraph } from './utils/cfg-algo'

// 默认示例：阶乘的 TAC
const defaultTAC = `(1) i = 1
(2) j = 1
(3) t1 = 10 * i
(4) if j > t1 goto 11
(5) t2 = j - 1
(6) t3 = 4 * t2
(7) t4 = a[t3]
(8) if t4 > j goto 10
(9) j = t4
(10) goto 4
(11) i = i + 1
(12) goto 3`

const inputTAC = ref(defaultTAC)
const instructions = ref<TACInstruction[]>([])
const leaders = ref<Set<number>>(new Set())
const blocks = ref<BasicBlock[]>([])
const cfg = ref<ControlFlowGraph | null>(null)
const errorMsg = ref('')

const legendRef = ref<HTMLElement | null>(null)
const canvasRef = ref<HTMLElement | null>(null)
const vizContainerRef = ref<HTMLElement | null>(null)

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
  if (legendRef.value && canvasRef.value) {
    const legendRect = legendRef.value.getBoundingClientRect()
    const canvasRect = canvasRef.value.getBoundingClientRect()
    
    // 计算当前相对位置（初始位置是 bottom: 10, right: 10）
    // 初始位置坐标相对于 canvas 右下角：x = -10 - width, y = -10 - height
    // 但 transform 是相对于初始位置的偏移
    
    // 更好的方式是计算绝对边界限制
    // 允许向左移动的最大距离：canvasWidth - legendWidth - 20 (padding)
    // 允许向上移动的最大距离：canvasHeight - legendHeight - 20
    
    const maxLeft = -(canvasRect.width - legendRect.width - 20)
    const maxRight = 0
    const maxUp = -(canvasRect.height - legendRect.height - 20)
    const maxDown = 0

    // 限制 X
    if (newX < maxLeft) newX = maxLeft
    if (newX > maxRight) newX = maxRight
    
    // 限制 Y
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

// 视图控制
const showLeaders = ref(false)
const showBlocks = ref(false)
const showCFG = ref(false)

function reset() {
  showLeaders.value = false
  showBlocks.value = false
  showCFG.value = false
  analyze()
}

function cfgToDot(cfg: ControlFlowGraph): string {
  let dot = 'digraph CFG {\n'
  dot += '  rankdir=TB;\n'
  dot += '  node [shape=none, fontname="Helvetica, Arial, sans-serif"];\n'
  dot += '  edge [fontname="Helvetica, Arial, sans-serif"];\n'

  // Nodes
  for (const block of cfg.blocks) {
    const isLoop = cfg.loops.some(loop => loop.nodes.includes(block.id))
    const bgColor = isLoop ? '#fff9f9' : '#ffffff'
    const headerColor = isLoop ? '#ffe0e0' : '#f0f0f0'
    
    let label = `<
      <table border="0" cellborder="1" cellspacing="0" cellpadding="4" bgcolor="${bgColor}">
        <tr><td bgcolor="${headerColor}" port="h"><b>Block B${block.id}</b></td></tr>
        <tr><td align="left" balign="left">`
    
    for (const inst of block.instructions) {
      const txt = `${inst.id}: ${inst.original.replace(/^\(\d+\)\s*/, '')}`
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
      label += `${txt}<br align="left"/>`
    }
    
    label += `</td></tr></table>>`
    
    dot += `  ${block.id} [label=${label}];\n`
  }

  // Edges
  for (const edge of cfg.edges) {
    const color = edge.type === 'back' ? 'red' : '#666666'
    const style = edge.type === 'back' ? 'dashed' : 'solid'
    const label = edge.type === 'back' ? 'Back' : ''
    // 增加 penwidth 使线条更清晰
    dot += `  ${edge.from}:s -> ${edge.to}:n [color="${color}", style="${style}", label="${label}", fontcolor="${color}", penwidth=1.5];\n`
  }

  dot += '}'
  return dot
}

async function updateDiagram() {
  if (!cfg.value || !vizContainerRef.value || !showCFG.value) return
  
  try {
    const dot = cfgToDot(cfg.value)
    const viz = await instance()
    const svg = viz.renderSVGElement(dot)
    
    vizContainerRef.value.innerHTML = ''
    vizContainerRef.value.appendChild(svg)
    
    // 移除强制的 width: 100%，改为最大宽度限制
    // 这样在桌面端图不会被拉伸得太大，在移动端则会自适应缩小
    svg.style.maxWidth = '100%'
    svg.style.height = 'auto'
    
  } catch (e: any) {
    console.error(e)
    errorMsg.value = 'Graph rendering error: ' + e.message
  }
}

function analyze() {
  try {
    errorMsg.value = ''
    instructions.value = parseTAC(inputTAC.value)
    leaders.value = findLeaders(instructions.value)
    blocks.value = buildBasicBlocks(instructions.value, leaders.value)
    cfg.value = buildCFG(blocks.value)
    
    // 如果正在显示图，更新图
    if (showCFG.value) {
      // 使用 setTimeout 确保 DOM 更新后渲染
      setTimeout(() => updateDiagram(), 50)
    }

  } catch (e: any) {
    errorMsg.value = e.message
  }
}

// 步骤控制
function toggleLeaders() { showLeaders.value = !showLeaders.value }
function toggleBlocks() { showBlocks.value = !showBlocks.value; if(showBlocks.value) showLeaders.value = true }
function toggleCFG() { 
  showCFG.value = !showCFG.value; 
  if(showCFG.value) {
    showBlocks.value = true
    setTimeout(() => updateDiagram(), 50)
  }
}

watch(inputTAC, () => {
  analyze()
})

onMounted(() => {
  analyze()
})
</script>

<template>
  <div class="cfg-analyzer">
    <div class="panel input-panel">
      <h3>1. 输入三地址码 (TAC)</h3>
      <textarea v-model="inputTAC" rows="15" spellcheck="false"></textarea>
      <div class="controls">
        <button :class="{ active: showLeaders }" @click="toggleLeaders">识别 Leaders</button>
        <button :class="{ active: showBlocks }" @click="toggleBlocks">划分基本块</button>
        <button :class="{ active: showCFG }" @click="toggleCFG">生成流图</button>
      </div>
      <div v-if="errorMsg" class="error">{{ errorMsg }}</div>
    </div>

    <div class="panel vis-panel">
      <h3>2. 可视化分析</h3>
      
      <!-- 列表模式：展示指令和 Leader -->
      <div v-if="!showCFG" class="instruction-list">
        <div 
          v-for="inst in instructions" 
          :key="inst.id"
          class="inst-row"
          :class="{ 
            'is-leader': showLeaders && leaders.has(inst.id),
            'block-start': showBlocks && leaders.has(inst.id)
          }"
        >
          <div class="leader-mark" v-if="showLeaders && leaders.has(inst.id)">Leader</div>
          <span class="line-no">({{ inst.id }})</span>
          <span class="code">{{ inst.original.replace(/^\(\d+\)\s*/, '') }}</span>
        </div>
      </div>

      <!-- 图模式：展示 CFG (Viz.js) -->
      <div v-else class="cfg-canvas" ref="canvasRef">
        <div class="diagram-container">
          <div ref="vizContainerRef" class="viz-render"></div>
        </div>
        
        <div 
          class="legend" 
          ref="legendRef"
          :style="{ transform: `translate(${legendOffset.x}px, ${legendOffset.y}px)` }"
          @mousedown="handleStart"
          @touchstart="handleStart"
        >
          <div class="item"><span class="swatch normal"></span> 普通块</div>
          <div class="item"><span class="swatch loop"></span> 循环节点 (Loop)</div>
          <div class="item"><span class="swatch back-edge"></span> 回边 (Back Edge)</div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.cfg-analyzer {
  display: flex;
  flex-direction: column;
  gap: 20px;
  height: auto;
  min-height: 800px;
}

@media (max-width: 960px) {
  .cfg-analyzer {
    min-height: auto;
  }
}

.panel {
  background: var(--vp-c-bg-soft);
  border-radius: 8px;
  padding: 16px;
  border: 1px solid var(--vp-c-divider);
  display: flex;
  flex-direction: column;
}

.input-panel {
  flex: 0 0 auto;
}

.vis-panel {
  flex: 1;
  min-height: 500px;
}

h3 {
  margin: 0 0 12px 0;
  font-size: 1.1em;
}

textarea {
  width: 100%;
  height: 150px;
  background: var(--vp-c-bg);
  border: 1px solid var(--vp-c-divider);
  border-radius: 4px;
  padding: 8px;
  font-family: monospace;
  resize: vertical;
  font-size: 13px;
  line-height: 1.5;
}

.controls {
  margin-top: 12px;
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

button {
  padding: 6px 12px;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg);
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9em;
  transition: all 0.2s;
}

button.active {
  background: var(--vp-c-brand-1);
  color: white;
  border-color: var(--vp-c-brand-1);
}

.instruction-list {
  background: var(--vp-c-bg);
  border: 1px solid var(--vp-c-divider);
  border-radius: 4px;
  padding: 12px 12px 12px 50px;
  overflow-y: auto;
  flex: 1;
  font-family: monospace;
}

.inst-row {
  padding: 4px 8px;
  border-bottom: 1px dashed var(--vp-c-divider);
  position: relative;
  display: flex;
  align-items: center;
}

.inst-row.block-start {
  border-top: 2px solid var(--vp-c-brand-1);
  margin-top: 10px;
  background-color: var(--vp-c-bg-alt);
}

.leader-mark {
  position: absolute;
  left: -44px;
  width: 40px;
  text-align: center;
  background: var(--vp-c-yellow-1);
  color: #000;
  font-size: 10px;
  padding: 2px 0;
  border-radius: 2px;
  z-index: 1;
}

.line-no {
  color: var(--vp-c-text-3);
  margin-right: 12px;
  width: 30px;
  text-align: right;
  flex-shrink: 0;
}

/* CFG Canvas */
.cfg-canvas {
  background: #fff;
  border: 1px solid var(--vp-c-divider);
  border-radius: 4px;
  overflow: hidden;
  position: relative;
  /* height: 600px;  <-- Removed fixed height to allow auto-sizing */
  min-height: 200px;
  display: flex;
  flex-direction: column;
}

.diagram-container {
  overflow: auto;
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding: 20px;
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
  color: #333;
  z-index: 10;
  cursor: grab;
  user-select: none;
  box-shadow: 0 2px 5px rgba(0,0,0,0.2);
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

.swatch.normal { background: #fff; }
.swatch.loop { background: #fff9f9; border-color: #ffcccc; }
.swatch.back-edge { background: red; border: none; height: 2px; }
</style>
