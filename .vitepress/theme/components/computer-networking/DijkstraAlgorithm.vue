
<template>
  <div class="dijkstra-container">
    <div class="top-controls">
       <div class="selector-group">
         <label>Preset:</label>
         <select v-model="selectedPresetId" @change="handlePresetChange">
           <option v-for="p in presets" :key="p.id" :value="p.id">{{ p.name }}</option>
           <option value="custom">Custom Input</option>
         </select>
       </div>
       
       <div v-if="selectedPresetId === 'custom'" class="custom-input-area">
          <textarea 
            v-model="customInput" 
            placeholder="Enter edges like: A-B:5, B-C:2"
            rows="3"
            class="input-textarea"
          ></textarea>
          <button @click="parseAndLoadCustom" class="control-btn small">Load Graph</button>
          <div class="error-msg" v-if="errorMsg">{{ errorMsg }}</div>
       </div>

       <div class="control-actions">
          <button @click="reset" class="control-btn">Restart</button>
          <button @click="prevStep" :disabled="currentStepIndex <= 0" class="control-btn">Previous</button>
          <button @click="togglePlay" class="control-btn">
            {{ isPlaying ? 'Pause' : 'Auto Play' }}
          </button>
          <button @click="nextStep" :disabled="currentStepIndex >= steps.length - 1" class="control-btn primary">Next Step</button>
          <span class="step-indicator">Step: {{ currentStepIndex }} / {{ steps.length - 1 }}</span>
       </div>
    </div>

    <div class="visualization-layout">
      <!-- Left: Graph Visualization -->
      <div class="graph-panel">
        <svg viewBox="0 0 500 300" class="graph-svg">
          <!-- Edges -->
          <g v-for="(edge, index) in graph.edges" :key="'edge-' + index">
            <line
              :x1="getNode(edge.from).x"
              :y1="getNode(edge.from).y"
              :x2="getNode(edge.to).x"
              :y2="getNode(edge.to).y"
              class="edge-line"
              :class="{ 
                'active': isEdgeActive(edge),
                'tree': isEdgeInTree(edge)
              }"
            />
            <!-- Edge Cost Label -->
            <text
              :x="(getNode(edge.from).x + getNode(edge.to).x) / 2"
              :y="(getNode(edge.from).y + getNode(edge.to).y) / 2 - 5"
              class="edge-label"
            >{{ edge.cost }}</text>
          </g>

          <!-- Nodes -->
          <g v-for="node in graph.nodes" :key="node">
            <circle
              :cx="getNode(node).x"
              :cy="getNode(node).y"
              r="18"
              class="node-circle"
              :class="{
                'in-n-prime': currentStep.N_prime.includes(node),
                'just-added': currentStep.current_u === node
              }"
            />
            <text
              :x="getNode(node).x"
              :y="getNode(node).y + 5"
              class="node-label"
            >{{ node }}</text>
            <!-- Distance Label (floating above) -->
            <text
              v-if="currentStep.D[node] !== Infinity"
              :x="getNode(node).x"
              :y="getNode(node).y - 25"
              class="dist-label"
            >D={{ currentStep.D[node] }}</text>
             <text
              v-else
              :x="getNode(node).x"
              :y="getNode(node).y - 25"
              class="dist-label"
            >∞</text>
          </g>
        </svg>
      </div>

      <!-- Right: Algorithm Table -->
      <div class="table-panel">
        <table class="algo-table">
          <thead>
            <tr>
              <th>Step</th>
              <th>N'</th>
              <th v-for="node in nonSourceNodes" :key="node">
                D({{ node }}), p({{ node }})
              </th>
            </tr>
          </thead>
          <tbody>
            <tr 
              v-for="(step, index) in steps" 
              :key="index"
              :class="{ 'current-row': index === currentStepIndex }"
              @click="goToStep(index)"
            >
              <td>{{ step.stepIndex }}</td>
              <td>{{ formatSet(step.N_prime) }}</td>
              <td v-for="node in nonSourceNodes" :key="node">
                {{ formatDp(step.D[node], step.p[node]) }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { DijkstraSolver, presets, presetCoords, type Graph, type DijkstraStep, type Edge } from './utils/dijkstra'

const selectedPresetId = ref('default')
const customInput = ref('')
const errorMsg = ref('')

const graph = ref<Graph>(presets[0].graph)
const sourceNode = ref(graph.value.nodes[0]) // Default to first node
const currentCoords = ref<Record<string, {x: number, y: number}>>(presetCoords['default'])

const steps = ref<DijkstraStep[]>([])
const currentStepIndex = ref(0)

// Auto Play Logic
const isPlaying = ref(false)
let playTimer: number | null = null

const togglePlay = () => {
  if (isPlaying.value) {
    pause()
  } else {
    play()
  }
}

const play = () => {
  if (currentStepIndex.value >= steps.value.length - 1) {
    return
  }
  isPlaying.value = true
  playTimer = window.setInterval(() => {
    if (currentStepIndex.value < steps.value.length - 1) {
      currentStepIndex.value++
    } else {
      pause()
    }
  }, 1000) // 1s per step
}

const pause = () => {
  isPlaying.value = false
  if (playTimer) {
    clearInterval(playTimer)
    playTimer = null
  }
}

const getNode = (name: string) => currentCoords.value[name] || { x: 0, y: 0 }

const nonSourceNodes = computed(() => {
  return graph.value.nodes.filter(n => n !== sourceNode.value).sort()
})

const currentStep = computed(() => steps.value[currentStepIndex.value] || {
  N_prime: [], D: {}, p: {}, current_u: null, updated_neighbors: []
})

const initSolver = () => {
  const solver = new DijkstraSolver(graph.value, sourceNode.value)
  steps.value = solver.solve()
  currentStepIndex.value = 0
  pause()
}

const handlePresetChange = () => {
  if (selectedPresetId.value === 'custom') {
    // Keep current graph until user loads
    return
  }
  const p = presets.find(x => x.id === selectedPresetId.value)
  if (p) {
    graph.value = p.graph
    sourceNode.value = p.graph.nodes[0]
    currentCoords.value = presetCoords[p.id] || generateCircularLayout(p.graph.nodes)
    initSolver()
  }
}

// Custom Input Parser
const parseAndLoadCustom = () => {
  errorMsg.value = ''
  try {
    const lines = customInput.value.split(/[,\n;]+/).map(l => l.trim()).filter(l => l)
    const nodes = new Set<string>()
    const edges: Edge[] = []

    lines.forEach(line => {
      // Format: A-B:5
      const match = line.match(/^([a-zA-Z0-9]+)-([a-zA-Z0-9]+):(\d+)$/)
      if (match) {
        const u = match[1]
        const v = match[2]
        const cost = parseInt(match[3])
        nodes.add(u)
        nodes.add(v)
        edges.push({ from: u, to: v, cost })
      } else {
        throw new Error(`Invalid format: "${line}". Use "NodeA-NodeB:Cost"`)
      }
    })

    if (nodes.size < 2) throw new Error("At least 2 nodes required.")

    const nodeList = Array.from(nodes).sort()
    graph.value = {
      nodes: nodeList,
      edges
    }
    sourceNode.value = nodeList[0]
    
    // Auto-layout
    currentCoords.value = generateCircularLayout(nodeList)
    initSolver()

  } catch (e: any) {
    errorMsg.value = e.message
  }
}

// Circular Layout Generator
const generateCircularLayout = (nodes: string[]) => {
  const count = nodes.length
  const centerX = 250
  const centerY = 150
  const radius = 120
  const coords: Record<string, {x: number, y: number}> = {}
  
  nodes.forEach((node, i) => {
    const angle = (2 * Math.PI * i) / count - Math.PI / 2 // Start at top
    coords[node] = {
      x: centerX + radius * Math.cos(angle),
      y: centerY + radius * Math.sin(angle)
    }
  })
  return coords
}

const nextStep = () => {
  if (currentStepIndex.value < steps.value.length - 1) {
    currentStepIndex.value++
  }
}

const prevStep = () => {
  if (currentStepIndex.value > 0) {
    currentStepIndex.value--
  }
}

const reset = () => {
  currentStepIndex.value = 0
  pause()
}

const goToStep = (index: number) => {
  currentStepIndex.value = index
}

// Helper to format N' set string like "uvx"
const formatSet = (set: string[]) => {
  return set.join('')
}

// Helper to format "cost, parent"
const formatDp = (cost: number, parent: string) => {
  if (cost === Infinity) return '∞'
  return `${cost}, ${parent}`
}

// Visualization helpers
const isEdgeActive = (edge: Edge) => {
  // Highlight edge if it was used to update a neighbor in the current step
  const step = currentStep.value
  if (!step.current_u) return false
  
  const isConnected = (edge.from === step.current_u && step.updated_neighbors.includes(edge.to)) ||
                      (edge.to === step.current_u && step.updated_neighbors.includes(edge.from))
  return isConnected
}

const isEdgeInTree = (edge: Edge) => {
  // Check if edge is part of the shortest path tree defined by p()
  // An edge (a, b) is in tree if p(b) == a or p(a) == b
  const p = currentStep.value.p
  return (p[edge.to] === edge.from) || (p[edge.from] === edge.to)
}

onMounted(() => {
  initSolver()
})
</script>

<style scoped>
.dijkstra-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-top: 20px;
}

.top-controls {
  display: flex;
  flex-direction: column;
  gap: 15px;
  background: #f9f9f9;
  padding: 15px;
  border-radius: 8px;
  border: 1px solid #eee;
}

.selector-group {
  display: flex;
  gap: 10px;
  align-items: center;
}

.selector-group select {
  padding: 5px;
  border-radius: 4px;
  border: 1px solid #ccc;
}

.custom-input-area {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.input-textarea {
  width: 100%;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-family: monospace;
}

.error-msg {
  color: #F44336;
  font-size: 12px;
}

.control-actions {
  display: flex;
  gap: 10px;
  align-items: center;
  flex-wrap: wrap;
}

.control-btn {
  padding: 8px 16px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: #fff;
  cursor: pointer;
  transition: all 0.2s;
}

.control-btn.small {
  padding: 4px 8px;
  font-size: 12px;
}

.control-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.control-btn:hover:not(:disabled) {
  background: #f0f0f0;
}

.control-btn.primary {
  background: #2196F3;
  color: white;
  border-color: #1976D2;
}

.control-btn.primary:hover:not(:disabled) {
  background: #1976D2;
}

.visualization-layout {
  display: flex;
  flex-direction: column; /* Mobile first */
  gap: 20px;
}

@media (min-width: 768px) {
  .visualization-layout {
    flex-direction: row;
  }
}

.graph-panel {
  flex: 1;
  border: 1px solid #eee;
  border-radius: 8px;
  background: #fafafa;
  min-height: 300px;
}

.graph-svg {
  width: 100%;
  height: 100%;
}

.edge-line {
  stroke: #999;
  stroke-width: 2;
  transition: all 0.3s;
}

.edge-line.active {
  stroke: #FF5722; /* Orange for updates */
  stroke-width: 4;
}

.edge-line.tree {
  stroke: #2196F3; /* Blue for finalized tree */
  stroke-width: 4;
}

.edge-label {
  font-size: 12px;
  fill: #666;
  text-anchor: middle;
  background: white;
  paint-order: stroke;
  stroke: white;
  stroke-width: 3px;
}

.node-circle {
  fill: white;
  stroke: #333;
  stroke-width: 2;
  transition: all 0.3s;
}

.node-circle.in-n-prime {
  fill: #2196F3;
  stroke: #1976D2;
}

.node-circle.just-added {
  fill: #FF5722;
  stroke: #E64A19;
}

.node-label {
  font-size: 14px;
  text-anchor: middle;
  fill: #333;
  font-weight: bold;
  pointer-events: none;
}

.dist-label {
  font-size: 12px;
  text-anchor: middle;
  fill: #666;
}

.table-panel {
  flex: 1;
  overflow-x: auto;
}

.algo-table {
  width: 100%;
  border-collapse: collapse;
  font-family: monospace;
  font-size: 14px;
}

.algo-table th, .algo-table td {
  border: 1px solid #ddd;
  padding: 8px;
  text-align: center;
}

.algo-table th {
  background: #f5f5f5;
}

.current-row {
  background-color: #e3f2fd;
  font-weight: bold;
}

.current-row td {
  border-top: 2px solid #2196F3;
  border-bottom: 2px solid #2196F3;
}
</style>
