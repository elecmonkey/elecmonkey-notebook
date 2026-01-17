
<template>
  <div class="dv-container">
    <div class="controls">
      <div class="control-group">
        <label>
          <input type="checkbox" v-model="poisonReverse" :disabled="simulationStarted">
          Enable Poison Reverse
        </label>
      </div>
      <button @click="startSimulation" :disabled="simulationStarted" class="control-btn primary">
        Break Link x-y (Cost 4 -> 60)
      </button>
      <button @click="reset" class="control-btn">Reset</button>
    </div>

    <div class="step-controls" v-if="simulationStarted">
      <div class="btn-group">
        <button @click="prevStep" :disabled="currentStepIndex <= 0" class="control-btn">Previous Step</button>
        <button @click="togglePlay" class="control-btn">
          {{ isPlaying ? 'Pause' : 'Auto Play' }}
        </button>
        <button @click="nextStep" :disabled="currentStepIndex >= steps.length - 1" class="control-btn primary">Next Step</button>
      </div>
      <span class="step-info">{{ currentStep?.description }}</span>
    </div>

    <div class="viz-container">
      <!-- Left: Graph -->
      <div class="graph-panel">
        <svg viewBox="0 0 500 400" class="dv-svg">
          <!-- Links -->
          <g v-for="link in links" :key="link.id">
             <line 
               :x1="getNode(link.from).x" 
               :y1="getNode(link.from).y" 
               :x2="getNode(link.to).x" 
               :y2="getNode(link.to).y" 
               class="link-line"
               :class="{ 'broken': link.cost === 60 }"
             />
             <text 
               :x="(getNode(link.from).x + getNode(link.to).x) / 2" 
               :y="(getNode(link.from).y + getNode(link.to).y) / 2"
               class="link-label"
               :dy="-8"
             >{{ link.cost }}</text>
          </g>

          <!-- Nodes -->
          <g v-for="node in nodes" :key="node.id">
            <circle 
              :cx="getNode(node.id).x" 
              :cy="getNode(node.id).y" 
              r="22" 
              class="node-circle"
            />
            <text 
              :x="getNode(node.id).x" 
              :y="getNode(node.id).y" 
              class="node-name"
              dy="5"
            >{{ node.id }}</text>
          </g>
        </svg>
      </div>

      <!-- Right: Routing Tables -->
      <div class="tables-panel">
        <div 
          v-for="node in nodes" 
          :key="'table-' + node.id"
          class="node-table-card"
        >
          <div class="table-header">Node {{ node.id }}'s Table</div>
          <table class="node-table">
            <thead>
              <tr>
                <th>Dest</th>
                <th>Cost</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="dest in ['x', 'y', 'z']" :key="dest">
                <td>{{ dest }}</td>
                <td :class="{ 
                  'infinity': getCost(node.id, dest) >= 50,
                  'changed': isCostChanged(node.id, dest) 
                }">
                  {{ formatCost(getCost(node.id, dest)) }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { DVSimulator, type DVStep, type NodeState } from './utils/distance-vector'

const poisonReverse = ref(false)
const simulationStarted = ref(false)
const simulator = ref(new DVSimulator())
const steps = ref<DVStep[]>([])
const currentStepIndex = ref(0)
const initialStates = ref<NodeState[]>([])

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
    // If at end, maybe restart or just do nothing? 
    // Let's assume user wants to continue or just stop if done.
    return
  }
  isPlaying.value = true
  playTimer = window.setInterval(() => {
    if (currentStepIndex.value < steps.value.length - 1) {
      currentStepIndex.value++
    } else {
      pause()
    }
  }, 1000) // 1.0s per step
}

const pause = () => {
  isPlaying.value = false
  if (playTimer) {
    clearInterval(playTimer)
    playTimer = null
  }
}

const nodes = [
  { id: 'x' }, { id: 'y' }, { id: 'z' }
]

// Adjusted coordinates for better centering in the left panel
const nodeCoords: Record<string, {x: number, y: number}> = {
  x: { x: 250, y: 60 },
  y: { x: 100, y: 300 },
  z: { x: 400, y: 300 }
}

const getNode = (id: string) => nodeCoords[id]

const links = computed(() => {
  if (!simulationStarted.value) {
    return [
      { id: 'xy', from: 'x', to: 'y', cost: 4 },
      { id: 'yz', from: 'y', to: 'z', cost: 1 },
      { id: 'zx', from: 'z', to: 'x', cost: 50 }
    ]
  } else {
    return [
      { id: 'xy', from: 'x', to: 'y', cost: 60 },
      { id: 'yz', from: 'y', to: 'z', cost: 1 },
      { id: 'zx', from: 'z', to: 'x', cost: 50 }
    ]
  }
})

const currentStep = computed(() => {
  if (!simulationStarted.value) return null
  return steps.value[currentStepIndex.value]
})

const getCost = (nodeId: string, destId: string) => {
  if (!simulationStarted.value) {
    const state = initialStates.value.find(s => s.id === nodeId)
    return state ? state.table[destId] : Infinity
  }
  const state = currentStep.value?.nodes[nodeId]
  return state ? state.table[destId] : Infinity
}

const formatCost = (c: number) => c >= 1000 ? '∞' : c

// Highlight changed values
const isCostChanged = (nodeId: string, destId: string) => {
  if (!simulationStarted.value || currentStepIndex.value === 0) return false
  const prevStep = steps.value[currentStepIndex.value - 1]
  const currStep = steps.value[currentStepIndex.value]
  
  const prevCost = prevStep.nodes[nodeId].table[destId]
  const currCost = currStep.nodes[nodeId].table[destId]
  
  return prevCost !== currCost
}

const startSimulation = () => {
  simulator.value = new DVSimulator(poisonReverse.value)
  initialStates.value = simulator.value.getInitialState()
  steps.value = simulator.value.simulateLinkBreak(initialStates.value)
  simulationStarted.value = true
  currentStepIndex.value = 0
}

const nextStep = () => {
  if (currentStepIndex.value < steps.value.length - 1) currentStepIndex.value++
}

const prevStep = () => {
  if (currentStepIndex.value > 0) currentStepIndex.value--
}

const reset = () => {
  simulationStarted.value = false
  simulator.value = new DVSimulator()
  initialStates.value = simulator.value.getInitialState()
  steps.value = []
  pause()
}

onMounted(() => {
  reset()
})
</script>

<style scoped>
.dv-container {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.controls {
  display: flex;
  gap: 10px;
  align-items: center;
  flex-wrap: wrap;
}

.step-controls {
  display: flex;
  gap: 10px;
  align-items: center;
  background: #f0f8ff;
  padding: 10px;
  border-radius: 4px;
}

.btn-group {
  display: flex;
  gap: 10px;
  flex-shrink: 0;
}

.step-info {
  font-weight: 500;
  color: #333;
  flex-grow: 1;
  text-align: right;
  margin-left: 20px;
}

.control-btn {
  padding: 6px 12px;
  border: 1px solid #ccc;
  border-radius: 4px;
  cursor: pointer;
  background: white;
  transition: all 0.2s;
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

.control-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* New Layout Styles */
.viz-container {
  display: flex;
  flex-direction: column;
  border: 1px solid #eee;
  border-radius: 8px;
  overflow: hidden;
  background: #fafafa;
}

@media (min-width: 768px) {
  .viz-container {
    flex-direction: row;
  }
}

.graph-panel {
  flex: 2;
  min-height: 400px;
  border-bottom: 1px solid #eee;
}

@media (min-width: 768px) {
  .graph-panel {
    border-bottom: none;
    border-right: 1px solid #eee;
  }
}

.dv-svg {
  width: 100%;
  height: 100%;
}

.tables-panel {
  flex: 1;
  padding: 20px;
  background: #f5f5f5;
  display: flex;
  flex-direction: column;
  gap: 20px;
  /* Removed fixed height to allow full expansion */
  height: auto; 
}

.node-table-card {
  background: white;
  border-radius: 6px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
  /* overflow: hidden; Removed to avoid cutting off content if margins are weird */
  border: 1px solid #e0e0e0;
  width: 100%;
}

.table-header {
  background: #2196F3;
  color: white;
  padding: 8px;
  font-weight: bold;
  text-align: center;
  font-size: 14px;
}

.node-table {
  width: 100% !important;
  display: table !important;
  margin: 0 !important;
  border-collapse: collapse;
  table-layout: fixed;
}

.node-table th, .node-table td {
  padding: 8px;
  text-align: center;
  border-bottom: 1px solid #eee;
  font-size: 14px;
  width: 50%; /* Force even distribution */
}

.node-table th {
  background: #fafafa;
  color: #666;
  font-weight: 600;
}

.infinity {
  color: #F44336;
  font-weight: bold;
}

.changed {
  background-color: #fff3e0;
  animation: flash 1s;
}

@keyframes flash {
  0% { background-color: #ff9800; }
  100% { background-color: #fff3e0; }
}

.link-line {
  stroke: #999;
  stroke-width: 2;
  transition: all 0.3s;
}

.link-line.broken {
  stroke: #F44336;
  stroke-dasharray: 8,4;
  stroke-width: 3;
}

.link-label {
  fill: #333;
  font-weight: bold;
  text-anchor: middle;
  font-size: 14px;
  paint-order: stroke;
  stroke: white;
  stroke-width: 3px;
}

.node-circle {
  fill: white;
  stroke: #333;
  stroke-width: 2;
}

.node-name {
  text-anchor: middle;
  font-weight: bold;
  pointer-events: none;
  font-size: 16px;
  fill: #333;
}
</style>
