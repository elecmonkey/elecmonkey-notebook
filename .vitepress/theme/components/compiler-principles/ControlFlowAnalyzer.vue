<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { parseTAC, findLeaders, buildBasicBlocks, buildCFG, layoutCFG, type TACInstruction, type BasicBlock, type ControlFlowGraph } from './utils/cfg-algo'

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
const layout = ref<Record<number, { x: number, y: number }>>({})
const errorMsg = ref('')

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

function analyze() {
  try {
    errorMsg.value = ''
    instructions.value = parseTAC(inputTAC.value)
    leaders.value = findLeaders(instructions.value)
    blocks.value = buildBasicBlocks(instructions.value, leaders.value)
    cfg.value = buildCFG(blocks.value)
    layout.value = layoutCFG(cfg.value)
  } catch (e: any) {
    errorMsg.value = e.message
  }
}

// 步骤控制
function toggleLeaders() { showLeaders.value = !showLeaders.value }
function toggleBlocks() { showBlocks.value = !showBlocks.value; if(showBlocks.value) showLeaders.value = true }
function toggleCFG() { showCFG.value = !showCFG.value; if(showCFG.value) showBlocks.value = true }

watch(inputTAC, () => {
  analyze()
})

onMounted(() => {
  analyze()
})

// 辅助：获取 SVG 连线路径
function getPath(fromId: number, toId: number, type: 'normal' | 'back') {
  const p1 = layout.value[fromId]
  const p2 = layout.value[toId]
  if (!p1 || !p2) return ''

  // 简单的贝塞尔曲线
  // 块高约 100，宽 180
  const w = 180
  const h = 100 // 估算内容高度
  
  // 出发点：底部中心
  const x1 = p1.x
  const y1 = p1.y + h/2 + 20 

  // 目标点：顶部中心
  const x2 = p2.x
  const y2 = p2.y - h/2 - 20

  if (type === 'back') {
    // 回边：从左侧绕回去
    const cp1x = x1 - 150
    const cp1y = y1
    const cp2x = x2 - 150
    const cp2y = y2
    return `M ${x1} ${y1} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${x2} ${y2}`
  } else {
    // 普通边
    const cpy = (y1 + y2) / 2
    return `M ${x1} ${y1} C ${x1} ${cpy}, ${x2} ${cpy}, ${x2} ${y2}`
  }
}

// 检查是否在循环中
function isInLoop(blockId: number): boolean {
  if (!cfg.value) return false
  return cfg.value.loops.some(loop => loop.nodes.includes(blockId))
}

// 检查是否是回边
function isBackEdge(from: number, to: number): boolean {
  return cfg.value?.edges.some(e => e.from === from && e.to === to && e.type === 'back') || false
}
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

      <!-- 图模式：展示 CFG -->
      <div v-else class="cfg-canvas">
        <svg width="100%" height="600" viewBox="0 0 800 600">
          <defs>
            <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
              <polygon points="0 0, 10 3.5, 0 7" fill="#666" />
            </marker>
            <marker id="arrowhead-red" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
              <polygon points="0 0, 10 3.5, 0 7" fill="red" />
            </marker>
          </defs>

          <g transform="translate(0, 20)">
            <!-- 连线 -->
            <path 
              v-for="(edge, i) in cfg?.edges" 
              :key="'edge-'+i"
              :d="getPath(edge.from, edge.to, edge.type)"
              fill="none"
              :stroke="edge.type === 'back' ? 'red' : '#999'"
              stroke-width="2"
              :marker-end="edge.type === 'back' ? 'url(#arrowhead-red)' : 'url(#arrowhead)'"
              :stroke-dasharray="edge.type === 'back' ? '5,5' : '0'"
            />

            <!-- 节点 -->
            <g 
              v-for="block in blocks" 
              :key="block.id"
              :transform="`translate(${layout[block.id]?.x || 0}, ${layout[block.id]?.y || 0})`"
            >
              <!-- 块背景 -->
              <rect 
                x="-90" y="-50" width="180" height="100" 
                rx="8" ry="8"
                class="block-rect"
                :class="{ 'in-loop': isInLoop(block.id) }"
              />
              
              <!-- 标题 -->
              <text x="0" y="-30" text-anchor="middle" font-weight="bold" fill="#333">
                Block B{{ block.id }}
              </text>
              
              <!-- 内容 -->
              <foreignObject x="-80" y="-20" width="160" height="60">
                <div class="block-content">
                  <div v-for="inst in block.instructions" :key="inst.id" class="mini-code">
                    {{ inst.id }}: {{ inst.original.replace(/^\(\d+\)\s*/, '') }}
                  </div>
                </div>
              </foreignObject>
            </g>
          </g>
        </svg>
        
        <div class="legend">
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
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 20px;
  height: 600px;
}

@media (max-width: 960px) {
  .cfg-analyzer {
    grid-template-columns: 1fr;
    height: auto;
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

h3 {
  margin: 0 0 12px 0;
  font-size: 1.1em;
}

textarea {
  flex: 1;
  background: var(--vp-c-bg);
  border: 1px solid var(--vp-c-divider);
  border-radius: 4px;
  padding: 8px;
  font-family: monospace;
  resize: none;
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
  padding: 12px;
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
  left: -40px;
  background: var(--vp-c-yellow-1);
  color: #000;
  font-size: 10px;
  padding: 2px 4px;
  border-radius: 2px;
}

.line-no {
  color: var(--vp-c-text-3);
  margin-right: 12px;
  width: 30px;
  text-align: right;
}

/* CFG Canvas */
.cfg-canvas {
  background: #fff; /* 始终白色底以便看图 */
  border: 1px solid var(--vp-c-divider);
  border-radius: 4px;
  overflow: hidden; /* SVG pan/zoom later? */
  position: relative;
  flex: 1;
}

.block-rect {
  fill: #fff;
  stroke: #333;
  stroke-width: 2px;
  filter: drop-shadow(2px 2px 4px rgba(0,0,0,0.1));
}

.block-rect.in-loop {
  fill: #fef9c3; /* 淡黄色 */
  stroke: #eab308;
}

.block-content {
  font-size: 11px;
  font-family: monospace;
  color: #333;
  overflow: hidden;
  height: 100%;
}

.mini-code {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
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
.swatch.loop { background: #fef9c3; border-color: #eab308; }
.swatch.back-edge { background: red; border: none; height: 2px; }
</style>
