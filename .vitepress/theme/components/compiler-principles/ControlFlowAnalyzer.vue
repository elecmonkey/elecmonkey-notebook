<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { VueFlow, MarkerType, Position, type Node, type Edge, type VueFlowStore } from '@vue-flow/core'
import '@vue-flow/core/dist/style.css'
import '@vue-flow/core/dist/theme-default.css'
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

// Vue Flow Data
const nodes = ref<Node[]>([])
const edges = ref<Edge[]>([])
let flowInstance: VueFlowStore | null = null

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

    // 更新节点
    nodes.value = blocks.value.map(block => ({
      id: block.id.toString(),
      type: 'custom',
      position: layout.value[block.id] || { x: 0, y: 0 },
      data: {
        blockId: block.id,
        instructions: block.instructions,
        isLoop: isInLoop(block.id)
      },
    }))

    // 更新边
    if (cfg.value) {
      edges.value = cfg.value.edges.map((edge, i) => ({
        id: `e${edge.from}-${edge.to}-${i}`,
        source: edge.from.toString(),
        target: edge.to.toString(),
        type: 'default',
        animated: edge.type === 'back',
        style: { 
          stroke: edge.type === 'back' ? 'red' : '#999',
          strokeWidth: 2
        },
        markerEnd: MarkerType.ArrowClosed,
        label: edge.type === 'back' ? 'Back' : undefined,
        labelStyle: { fill: 'red', fontWeight: 700 },
        labelBgStyle: { fill: 'rgba(255, 255, 255, 0.7)' },
      }))
    } else {
      edges.value = []
    }
    
    // 如果已初始化，尝试适应视图
    if (showCFG.value && flowInstance) {
       setTimeout(() => flowInstance?.fitView(), 50)
    }

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

// 检查是否在循环中
function isInLoop(blockId: number): boolean {
  if (!cfg.value) return false
  return cfg.value.loops.some(loop => loop.nodes.includes(blockId))
}

function onPaneReady(instance: VueFlowStore) {
  flowInstance = instance
  instance.fitView()
}

// 每次生成新的图时，自动适应视图
watch(showCFG, (val) => {
  if (val && flowInstance) {
    setTimeout(() => {
      flowInstance?.fitView()
    }, 100)
  }
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

      <!-- 图模式：展示 CFG (Vue Flow) -->
      <div v-else class="cfg-canvas">
        <ClientOnly>
          <VueFlow 
            v-model:nodes="nodes" 
            v-model:edges="edges" 
            :default-viewport="{ zoom: 1 }"
            :min-zoom="0.1"
            :max-zoom="4"
            fit-view-on-init
            style="height: 100%; width: 100%;"
            @pane-ready="onPaneReady"
          >
            <template #node-custom="{ data }">
              <div class="custom-node" :class="{ 'in-loop': data.isLoop }">
                <div class="node-header">Block B{{ data.blockId }}</div>
                <div class="node-content">
                  <div v-for="inst in data.instructions" :key="inst.id" class="mini-code">
                    {{ inst.id }}: {{ inst.original.replace(/^\(\d+\)\s*/, '') }}
                  </div>
                </div>
              </div>
            </template>
            <template #edge-custom="props">
               <!-- custom edge if needed, but currently using default/smoothstep with styles -->
            </template>
          </VueFlow>
        </ClientOnly>
        
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
  height: 600px;
  display: block;
}

/* Custom Node Styles */
.custom-node {
  background: #fff;
  border: 2px solid #333;
  border-radius: 8px;
  padding: 0;
  min-width: 180px;
  box-shadow: 2px 2px 4px rgba(0,0,0,0.1);
  font-family: monospace;
  overflow: hidden;
}

.custom-node.in-loop {
  background: #fef9c3;
  border-color: #eab308;
}

.node-header {
  background: #f0f0f0;
  padding: 4px 8px;
  border-bottom: 1px solid #ddd;
  font-weight: bold;
  text-align: center;
  font-size: 12px;
}

.custom-node.in-loop .node-header {
  background: #fde047; /* brighter yellow header for loop */
  border-bottom-color: #eab308;
}

.node-content {
  padding: 8px;
  font-size: 11px;
}

.mini-code {
  white-space: nowrap;
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
