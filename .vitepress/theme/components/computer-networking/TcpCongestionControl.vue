<script setup lang="ts">
import { ref, computed, nextTick, onMounted, watch } from 'vue'

// Types
type Phase = 'Slow Start' | 'Congestion Avoidance' | 'Fast Recovery'
type EventType = 'Normal' | 'Timeout' | '3-Dup ACKs'

interface DataPoint {
  round: number
  cwnd: number
  ssthresh: number
  phase: Phase
  event: EventType
}

// State
const algorithm = ref<'Reno' | 'Tahoe'>('Reno')
const cwnd = ref(1)
const ssthresh = ref(16) // Initial threshold
const round = ref(0)
const phase = ref<Phase>('Slow Start')
const history = ref<DataPoint[]>([
  { round: 0, cwnd: 1, ssthresh: 16, phase: 'Slow Start', event: 'Normal' }
])
const isAutoPlaying = ref(false)

// Watch algorithm change to reset
watch(algorithm, () => {
  reset()
})

// Config
const MAX_Y = 40
const X_STEP = 40
const Y_SCALE = 10
const VIEW_WIDTH = 800
const VIEW_HEIGHT = 450
const PADDING = { top: 20, right: 20, bottom: 40, left: 50 }

// Actions
const nextRound = () => {
  const last = history.value[history.value.length - 1]
  let nextCwnd = cwnd.value
  let nextPhase = phase.value
  let evt: EventType = 'Normal'

  // Logic for next round (successful transmission)
  if (phase.value === 'Slow Start') {
    nextCwnd = cwnd.value * 2
    if (nextCwnd >= ssthresh.value) {
      nextPhase = 'Congestion Avoidance'
      // If we overshoot, we could cap it or just let it transition
      // Standard: slow start grows exponentially until >= ssthresh
    }
  } else if (phase.value === 'Congestion Avoidance') {
    nextCwnd = cwnd.value + 1
  } else if (phase.value === 'Fast Recovery') {
    // In Fast Recovery, receiving a NEW ACK (not duplicate) exits Fast Recovery
    // Reno: Deflate window back to ssthresh
    nextPhase = 'Congestion Avoidance'
    nextCwnd = ssthresh.value
  }

  updateState(nextCwnd, ssthresh.value, nextPhase, evt)
}

const triggerDupAcks = () => {
  if (algorithm.value === 'Reno') {
    if (phase.value === 'Fast Recovery') {
      // In Fast Recovery, each additional dup ACK increases cwnd by 1 (inflation)
      const newCwnd = cwnd.value + 1
      updateState(newCwnd, ssthresh.value, 'Fast Recovery', '3-Dup ACKs')
    } else {
      // Enter Fast Recovery
      // ssthresh = cwnd / 2
      const newSsthresh = Math.max(2, Math.floor(cwnd.value / 2))
      // cwnd = ssthresh + 3
      const newCwnd = newSsthresh + 3
      updateState(newCwnd, newSsthresh, 'Fast Recovery', '3-Dup ACKs')
    }
  } else {
    // TCP Tahoe: 3-Dup ACKs -> Fast Retransmit & Slow Start
    // ssthresh = cwnd / 2
    const newSsthresh = Math.max(2, Math.floor(cwnd.value / 2))
    // cwnd = 1
    const newCwnd = 1
    updateState(newCwnd, newSsthresh, 'Slow Start', '3-Dup ACKs')
  }
}

const triggerTimeout = () => {
  // TCP Tahoe/Reno: Timeout -> Slow Start
  // ssthresh = cwnd / 2
  // cwnd = 1
  const newSsthresh = Math.max(2, Math.floor(cwnd.value / 2))
  const newCwnd = 1
  
  updateState(newCwnd, newSsthresh, 'Slow Start', 'Timeout')
}

const updateState = (newCwnd: number, newSsthresh: number, newPhase: Phase, evt: EventType) => {
  round.value++
  cwnd.value = newCwnd
  ssthresh.value = newSsthresh
  phase.value = newPhase
  
  history.value.push({
    round: round.value,
    cwnd: newCwnd,
    ssthresh: newSsthresh,
    phase: newPhase,
    event: evt
  })
  
  // Auto scroll
  scrollToRight()
}

const reset = () => {
  cwnd.value = 1
  ssthresh.value = 16
  round.value = 0
  phase.value = 'Slow Start'
  history.value = [{ round: 0, cwnd: 1, ssthresh: 16, phase: 'Slow Start', event: 'Normal' }]
  isAutoPlaying.value = false
}

// Visualization Helpers
const svgContainer = ref<HTMLElement | null>(null)

const scrollToRight = async () => {
  await nextTick()
  if (svgContainer.value) {
    svgContainer.value.scrollLeft = svgContainer.value.scrollWidth
  }
}

// Coordinate mapping
const getX = (r: number) => PADDING.left + r * X_STEP
const getY = (val: number) => VIEW_HEIGHT - PADDING.bottom - val * Y_SCALE

// SVG Paths
const cwndPath = computed(() => {
  if (history.value.length === 0) return ''
  return history.value.map((p, i) => {
    const x = getX(p.round)
    const y = getY(p.cwnd)
    return `${i === 0 ? 'M' : 'L'} ${x} ${y}`
  }).join(' ')
})

const ssthreshPath = computed(() => {
  if (history.value.length === 0) return ''
  // Step function look for ssthresh? Or just points?
  // Usually ssthresh is constant for a period. Let's draw it as a step line.
  let d = ''
  history.value.forEach((p, i) => {
    const x = getX(p.round)
    const y = getY(p.ssthresh)
    if (i === 0) {
      d += `M ${x} ${y}`
    } else {
      // Step line logic: Horizontal then Vertical? Or just connect points?
      // Since ssthresh changes instantly at event, connecting points might be misleading if we don't handle the "instant" drop.
      // But for simplicity, let's just connect points for now, or use a step-after logic.
      const prev = history.value[i-1]
      const prevX = getX(prev.round)
      const prevY = getY(prev.ssthresh)
      
      // Draw horizontal from prev to current X
      d += ` L ${x} ${prevY}`
      // Draw vertical to current Y
      d += ` L ${x} ${y}`
    }
  })
  return d
})

const getPhaseColor = (p: Phase) => {
  switch (p) {
    case 'Slow Start': return '#e8f5e9' // Green-ish
    case 'Congestion Avoidance': return '#fff3e0' // Orange-ish
    case 'Fast Recovery': return '#ffebee' // Red-ish
    default: return '#fff'
  }
}

const getPhaseLabel = (p: Phase) => {
  switch (p) {
    case 'Slow Start': return 'SS'
    case 'Congestion Avoidance': return 'CA'
    case 'Fast Recovery': return 'FR'
    default: return ''
  }
}

// Background Areas
// Merge consecutive rounds with same phase
const phaseAreas = computed(() => {
  const areas: { start: number, end: number, phase: Phase }[] = []
  if (history.value.length === 0) return []
  
  let currentStart = 0
  let currentPhase = history.value[0].phase
  
  for (let i = 1; i < history.value.length; i++) {
    const p = history.value[i]
    if (p.phase !== currentPhase) {
      areas.push({ start: currentStart, end: i - 1, phase: currentPhase }) // End at prev point?
      // Actually phase applies to the interval leading up to the point or the state AT the point?
      // State at point.
      // Let's visualize intervals. From round i to i+1, the behavior is determined by state at i?
      // Actually it's simpler: draw rect for each column.
      
      // Let's change strategy: Draw a rect for each point i centered or spanning to i+1?
      // Let's span from i to i+1 with the color of phase at i+1 (the result of the transition).
      // Wait, if at round 1 (SS), we double to round 2. Round 2 is still SS.
      // If at round 2 (SS), we cross ssthresh, round 3 becomes CA.
      // So interval 2->3 is the transition.
      
      currentStart = i // Start new phase area
      currentPhase = p.phase
    }
  }
  // Add last area
  areas.push({ start: currentStart, end: history.value.length - 1, phase: currentPhase })
  
  return areas.map(area => ({
    x: getX(area.start),
    width: getX(area.end) - getX(area.start),
    color: getPhaseColor(area.phase),
    label: getPhaseLabel(area.phase)
  }))
})

// Auto Play
let timer: any = null
const toggleAuto = () => {
  if (isAutoPlaying.value) {
    clearInterval(timer)
    isAutoPlaying.value = false
  } else {
    isAutoPlaying.value = true
    timer = setInterval(() => {
      // Simple logic: Normal growth until 30, then random drop
      if (cwnd.value > 30) {
        if (Math.random() > 0.5) triggerDupAcks()
        else triggerTimeout()
      } else {
        nextRound()
      }
      
      if (history.value.length > 50) {
        // Stop auto if too long
        clearInterval(timer)
        isAutoPlaying.value = false
      }
    }, 800)
  }
}

</script>

<template>
  <div class="tcp-congestion-viz">
    <div class="controls">
      <div class="status-panel">
        <div class="stat-item">
          <span class="label">Algorithm:</span>
          <div class="radio-group">
            <label class="radio-label">
              <input type="radio" value="Reno" v-model="algorithm" :disabled="isAutoPlaying"> Reno
            </label>
            <label class="radio-label">
              <input type="radio" value="Tahoe" v-model="algorithm" :disabled="isAutoPlaying"> Tahoe
            </label>
          </div>
        </div>
        <div class="stat-item">
          <span class="label">Round (RTT):</span>
          <span class="value">{{ round }}</span>
        </div>
        <div class="stat-item">
          <span class="label">cwnd:</span>
          <span class="value cwnd">{{ cwnd }}</span>
        </div>
        <div class="stat-item">
          <span class="label">ssthresh:</span>
          <span class="value ssthresh">{{ ssthresh }}</span>
        </div>
        <div class="stat-item">
          <span class="label">Phase:</span>
          <span class="value phase" :class="phase.toLowerCase().replace(' ', '-')">{{ phase }}</span>
        </div>
      </div>

      <div class="buttons">
        <button class="btn primary" @click="nextRound">
          Next Round (ACK)
        </button>
        <button class="btn warning" @click="triggerDupAcks">
          {{ phase === 'Fast Recovery' && algorithm === 'Reno' ? 'Simulate Dup ACK' : 'Simulate 3-Dup ACKs' }}
        </button>
        <button class="btn danger" @click="triggerTimeout">
          Simulate Timeout
        </button>
        <button class="btn secondary" @click="reset" :disabled="isAutoPlaying">
          Reset
        </button>
        <button class="btn outline" @click="toggleAuto">
          {{ isAutoPlaying ? 'Pause' : 'Auto Play' }}
        </button>
      </div>
    </div>

    <div class="chart-container" ref="svgContainer">
      <svg :width="Math.max(VIEW_WIDTH, getX(history.length))" :height="VIEW_HEIGHT">
        <!-- Background Phase Areas -->
        <g v-for="(area, idx) in phaseAreas" :key="'area-'+idx">
          <rect 
            :x="area.x" 
            :y="PADDING.top" 
            :width="Math.max(area.width, 2)" 
            :height="VIEW_HEIGHT - PADDING.top - PADDING.bottom" 
            :fill="area.color"
            opacity="0.5"
          />
          <text 
            v-if="area.width > 20"
            :x="area.x + area.width/2" 
            :y="PADDING.top + 20" 
            font-size="10" 
            text-anchor="middle"
            fill="#666"
          >
            {{ area.label }}
          </text>
        </g>

        <!-- Grid Lines (Y axis) -->
        <g class="grid-lines">
          <line v-for="i in 10" :key="i"
            :x1="PADDING.left" 
            :y1="getY(i * 5)" 
            :x2="Math.max(VIEW_WIDTH, getX(history.length))" 
            :y2="getY(i * 5)" 
            stroke="#eee" 
            stroke-dasharray="4"
          />
        </g>

        <!-- Ssthresh Line -->
        <path :d="ssthreshPath" fill="none" stroke="#ff9800" stroke-width="2" stroke-dasharray="5,5" opacity="0.6" />
        
        <!-- Cwnd Line -->
        <path :d="cwndPath" fill="none" stroke="#2196f3" stroke-width="3" />

        <!-- Data Points -->
        <g v-for="p in history" :key="p.round">
          <circle 
            :cx="getX(p.round)" 
            :cy="getY(p.cwnd)" 
            r="4" 
            fill="white" 
            :stroke="p.event === 'Normal' ? '#2196f3' : (p.event === 'Timeout' ? '#f44336' : '#ff9800')"
            stroke-width="2"
          />
          
          <!-- Event Labels -->
          <g v-if="p.event !== 'Normal'" :transform="`translate(${getX(p.round)}, ${getY(p.cwnd) - 15})`">
            <text text-anchor="middle" font-size="12" font-weight="bold" :fill="p.event === 'Timeout' ? '#f44336' : '#ff9800'">
              {{ p.event === 'Timeout' ? 'Timeout' : '3-Dup' }}
            </text>
            <text text-anchor="middle" font-size="10" y="12" fill="#666">
              cwnd -> {{ p.cwnd }}
            </text>
          </g>
          
          <!-- Hover Info (Simple title for now) -->
          <title>Round: {{p.round}}, cwnd: {{p.cwnd}}, ssthresh: {{p.ssthresh}}, {{p.event}}</title>
        </g>

        <!-- Axes -->
        <line :x1="PADDING.left" :y1="VIEW_HEIGHT - PADDING.bottom" :x2="Math.max(VIEW_WIDTH, getX(history.length))" :y2="VIEW_HEIGHT - PADDING.bottom" stroke="#333" />
        <line :x1="PADDING.left" :y1="PADDING.top" :x2="PADDING.left" :y2="VIEW_HEIGHT - PADDING.bottom" stroke="#333" />

        <!-- X Axis Labels -->
        <g v-for="p in history" :key="'x-'+p.round">
          <text :x="getX(p.round)" :y="VIEW_HEIGHT - PADDING.bottom + 20" text-anchor="middle" font-size="10">{{ p.round }}</text>
        </g>
        
        <!-- Y Axis Labels -->
         <g v-for="i in 8" :key="'y-'+i">
          <text :x="PADDING.left - 10" :y="getY(i * 5) + 4" text-anchor="end" font-size="10">{{ i * 5 }}</text>
        </g>
        <text :x="PADDING.left - 10" :y="getY(0) + 4" text-anchor="end" font-size="10">0</text>

        <!-- Legend -->
        <g :transform="`translate(${PADDING.left + 20}, ${PADDING.top + 10})`">
          <line x1="0" y1="0" x2="20" y2="0" stroke="#2196f3" stroke-width="3" />
          <text x="25" y="4" font-size="12">cwnd</text>
          
          <line x1="70" y1="0" x2="90" y2="0" stroke="#ff9800" stroke-width="2" stroke-dasharray="5,5" />
          <text x="95" y="4" font-size="12">ssthresh</text>
        </g>
      </svg>
    </div>
  </div>
</template>

<style scoped>
.tcp-congestion-viz {
  display: flex;
  flex-direction: column;
  gap: 20px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  padding: 20px;
  background: var(--vp-c-bg);
}

.controls {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.status-panel {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
  padding: 12px;
  background: var(--vp-c-bg-soft);
  border-radius: 6px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.radio-group {
  display: flex;
  gap: 12px;
}

.radio-label {
  display: flex;
  align-items: center;
  gap: 4px;
  cursor: pointer;
  font-size: 0.9em;
}

.radio-label input {
  cursor: pointer;
}

.label {
  font-weight: bold;
  color: var(--vp-c-text-2);
}

.value {
  font-family: monospace;
  font-size: 1.1em;
}

.value.cwnd { color: #2196f3; font-weight: bold; }
.value.ssthresh { color: #ff9800; font-weight: bold; }
.value.phase.slow-start { color: #2e7d32; }
.value.phase.congestion-avoidance { color: #f57c00; }
.value.phase.fast-recovery { color: #d32f2f; }

.buttons {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.btn {
  padding: 6px 12px;
  border: 1px solid transparent;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;
  background-color: var(--vp-c-bg-soft);
  border-color: var(--vp-c-divider);
  color: var(--vp-c-text-1);
}

.btn:hover {
  background-color: var(--vp-c-bg-mute);
}

.btn.primary { background-color: var(--vp-c-brand-1); color: white; border-color: var(--vp-c-brand-1); }
.btn.primary:hover { background-color: var(--vp-c-brand-2); border-color: var(--vp-c-brand-2); }

.btn.warning { background-color: #ff9800; color: white; border-color: #ff9800; }
.btn.warning:hover { background-color: #f57c00; border-color: #f57c00; }

.btn.danger { background-color: #f44336; color: white; border-color: #f44336; }
.btn.danger:hover { background-color: #d32f2f; border-color: #d32f2f; }

.btn.secondary { background-color: #909399; color: white; border-color: #909399; }
.btn.secondary:hover { background-color: #73767a; border-color: #73767a; }

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  pointer-events: none;
}

.chart-container {
  overflow-x: auto;
  background: white; /* Always white for chart readability */
  border: 1px solid #eee;
  border-radius: 4px;
  padding: 10px;
}

/* Ensure SVG text is readable */
text {
  font-family: sans-serif;
}
</style>
