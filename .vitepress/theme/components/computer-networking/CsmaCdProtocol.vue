<template>
  <div class="csma-viz-container">
    <div class="controls-bar">
      <div class="status-panel">
        <span class="status-label">总线状态:</span>
        <span class="badge" :class="busState">{{ busStateText }}</span>
      </div>
      <button class="btn secondary" @click="reset" :disabled="false">重置</button>
    </div>

    <div class="diagram-area">
      <!-- Bus Line -->
      <div class="bus-line"></div>

      <!-- Stations -->
      <div v-for="station in stations" :key="station.id" 
           class="station" 
           :style="{ left: station.position + '%' }">
        <div class="station-icon" :class="{ transmitting: station.state === 'transmitting', collision: station.state === 'collision', backoff: station.state === 'backoff' }">
          🖥️ {{ station.name }}
        </div>
        <div class="station-controls">
          <button class="btn-send" 
                  @click="startTransmission(station)" 
                  :disabled="station.state !== 'idle'">
            发送数据
          </button>
          <div v-if="station.state === 'backoff'" class="backoff-timer">
            退避: {{ station.backoffTimer }}s
          </div>
          <div v-if="station.state === 'collision'" class="jam-msg">
            💥 冲突!
          </div>
        </div>
        <!-- Connecting Line -->
        <div class="connector"></div>
      </div>

      <!-- Signals -->
      <div v-for="signal in signals" :key="signal.id" 
           class="signal" 
           :class="{ jam: signal.isJam }"
           :style="{ 
             left: signal.left + '%', 
             width: signal.width + '%',
             backgroundColor: signal.color 
           }">
      </div>
      
      <!-- Collision Effect -->
      <div v-if="collisionLocation !== null" 
           class="collision-explosion" 
           :style="{ left: collisionLocation + '%' }">
        💥
      </div>
    </div>

    <div class="log-area" ref="logContainer">
      <div v-for="(log, i) in logs" :key="i" class="log-line">
        <span class="time">[{{ log.time }}]</span> {{ log.msg }}
      </div>
    </div>
    
    <div class="instruction">
      <p><strong>操作指南：</strong></p>
      <ol>
        <li>点击任意站点的“发送数据”按钮。</li>
        <li>在信号到达其他站点之前（传播延迟期间），快速点击另一个站点的“发送”以触发冲突。</li>
        <li>观察冲突检测、发送干扰信号 (Jamming) 及二进制指数退避过程。</li>
      </ol>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted, nextTick } from 'vue'

interface Station {
  id: string
  name: string
  position: number // 0-100%
  state: 'idle' | 'transmitting' | 'collision' | 'backoff'
  color: string
  backoffTimer: number
  backoffStage: number // k in 0..2^k-1
  isTransmitting: boolean
}

interface Signal {
  id: number
  sourceId: string
  left: number // %
  right: number // % (calculated for rendering width)
  width: number // %
  direction: 'left' | 'right' | 'both'
  origin: number // %
  startTime: number
  color: string
  isJam: boolean
}

const PROPAGATION_SPEED = 0.03 // % per ms (slower for visualization)
const TRANSMISSION_DURATION = 2000 // ms to transmit a full packet

const stations = reactive<Station[]>([
  { id: 'A', name: 'A', position: 10, state: 'idle', color: '#2196f3', backoffTimer: 0, backoffStage: 0, isTransmitting: false },
  { id: 'B', name: 'B', position: 40, state: 'idle', color: '#4caf50', backoffTimer: 0, backoffStage: 0, isTransmitting: false },
  { id: 'C', name: 'C', position: 70, state: 'idle', color: '#ff9800', backoffTimer: 0, backoffStage: 0, isTransmitting: false },
  { id: 'D', name: 'D', position: 90, state: 'idle', color: '#9c27b0', backoffTimer: 0, backoffStage: 0, isTransmitting: false }
])

const signals = ref<Signal[]>([])
const logs = ref<{time: string, msg: string}[]>([])
const logContainer = ref<HTMLElement | null>(null)
const busState = ref<'idle' | 'busy' | 'collision'>('idle')
const collisionLocation = ref<number | null>(null)
let signalIdCounter = 0
let animationFrameId: number

const busStateText = computed(() => {
  switch (busState.value) {
    case 'idle': return '空闲 (Idle)'
    case 'busy': return '忙碌 (Busy)'
    case 'collision': return '冲突 (Collision)'
  }
})

import { computed } from 'vue'

const addLog = (msg: string) => {
  const time = new Date().toLocaleTimeString().split(' ')[0]
  logs.value.push({ time, msg })
  nextTick(() => {
    if (logContainer.value) logContainer.value.scrollTop = logContainer.value.scrollHeight
  })
}

const startTransmission = (station: Station) => {
  if (station.state !== 'idle') return
  
  // CSMA: Listen before talk
  // In this simplified viz, if bus is physically carrying signal at station location, it's busy.
  // But for "visualizing collision", we allow sending if the signal hasn't reached *this* station yet.
  // So we check if any signal covers station.position
  const isChannelBusyLocally = signals.value.some(s => 
    station.position >= s.left && station.position <= (s.left + s.width)
  )

  if (isChannelBusyLocally) {
    addLog(`站点 ${station.name} 侦听到信道忙，等待...`)
    return
  }

  addLog(`站点 ${station.name} 开始发送帧`)
  station.state = 'transmitting'
  station.isTransmitting = true
  busState.value = 'busy'

  // Create two signal fronts propagating left and right
  const newSignal: Signal = {
    id: signalIdCounter++,
    sourceId: station.id,
    left: station.position,
    width: 0,
    right: station.position, // logical right edge
    direction: 'both',
    origin: station.position,
    startTime: performance.now(),
    color: station.color,
    isJam: false
  }
  signals.value.push(newSignal)
}

const handleCollision = (loc: number, s1: Signal, s2: Signal) => {
  if (busState.value === 'collision') return // Already handling
  
  busState.value = 'collision'
  collisionLocation.value = loc
  addLog(`💥 检测到冲突！位置: ${loc.toFixed(1)}%`)

  // Find involved stations
  const involvedStations = stations.filter(s => s.isTransmitting)
  
  involvedStations.forEach(s => {
    s.state = 'collision'
    s.isTransmitting = false
    // Send Jamming signal (visualized by turning signals red/removing)
    addLog(`站点 ${s.name} 停止发送，广播干扰信号 (Jamming)`)
  })

  // Convert existing signals to JAM (visual effect)
  signals.value.forEach(s => s.isJam = true)

  // Clear signals after short delay and start backoff
  setTimeout(() => {
    signals.value = []
    collisionLocation.value = null
    busState.value = 'idle'
    
    involvedStations.forEach(s => {
      startBackoff(s)
    })
  }, 1000)
}

const startBackoff = (station: Station) => {
  station.state = 'backoff'
  station.backoffStage = Math.min(station.backoffStage + 1, 10) // Max 10 retransmissions
  const K = Math.pow(2, Math.min(station.backoffStage, 10)) - 1
  const r = Math.floor(Math.random() * (K + 1))
  const slotTime = 1000 // 1s visual slot time
  const waitTime = r * slotTime
  
  station.backoffTimer = r
  addLog(`站点 ${station.name} 进入第 ${station.backoffStage} 次退避，随机取值 r=${r} (范围 0~${K})，等待 ${r}s`)

  const timer = setInterval(() => {
    if (station.backoffTimer > 0) {
      station.backoffTimer--
    } else {
      clearInterval(timer)
      station.state = 'idle'
      addLog(`站点 ${station.name} 退避结束，准备重传`)
      // Auto retransmit? Or let user click? Let's let user click or auto.
      // For viz, maybe better to let user click or auto. 
      // Let's just go to idle so user can try again (simpler interaction).
    }
  }, 1000)
}

const updateLoop = () => {
  const now = performance.now()
  
  // Update signal positions
  signals.value.forEach(s => {
    const age = now - s.startTime
    // Expansion speed
    const distance = age * PROPAGATION_SPEED 
    
    // Calculate new bounds
    // Signal spreads from origin in both directions
    let newLeft = s.origin - distance
    let newRight = s.origin + distance
    
    // Clamp to bus ends
    // But logically, signal "falls off" the bus. Visual clamping 0-100.
    
    s.left = newLeft
    s.width = newRight - newLeft
  })

  // Cleanup signals that are off-screen (left < -width or left > 100)
  // Simplified: if left > 100 or right < 0. 
  // signals.value = signals.value.filter(...) 
  
  // Collision Detection
  // Check if any two signals from DIFFERENT sources overlap
  if (busState.value !== 'collision') {
    for (let i = 0; i < signals.value.length; i++) {
      for (let j = i + 1; j < signals.value.length; j++) {
        const s1 = signals.value[i]
        const s2 = signals.value[j]
        
        if (s1.sourceId !== s2.sourceId) {
          const s1Right = s1.left + s1.width
          const s2Right = s2.left + s2.width
          
          // Overlap check
          if (s1.left < s2Right && s1Right > s2.left) {
            // Calculate collision point (approximate center of overlap)
            const overlapStart = Math.max(s1.left, s2.left)
            const overlapEnd = Math.min(s1Right, s2Right)
            const collisionPt = (overlapStart + overlapEnd) / 2
            
            handleCollision(collisionPt, s1, s2)
          }
        }
      }
    }
  }

  // Check if transmission finished (if no collision)
  stations.forEach(s => {
    if (s.isTransmitting) {
      // Find the signal generated by this station
      const sig = signals.value.find(sig => sig.sourceId === s.id && !sig.isJam)
      if (sig) {
        const duration = now - sig.startTime
        if (duration > TRANSMISSION_DURATION) {
          s.isTransmitting = false
          s.state = 'idle'
          addLog(`站点 ${s.name} 发送帧完毕`)
          
          // Remove signal to clear the bus (simplified)
          signals.value = signals.value.filter(x => x.id !== sig.id)
          
          // If no signals left, bus is idle
          if (signals.value.length === 0) {
            busState.value = 'idle'
          }
        }
      }
    }
  })

  animationFrameId = requestAnimationFrame(updateLoop)
}

const reset = () => {
  signals.value = []
  busState.value = 'idle'
  collisionLocation.value = null
  stations.forEach(s => {
    s.state = 'idle'
    s.backoffStage = 0
    s.backoffTimer = 0
    s.isTransmitting = false
  })
  logs.value = []
}

onMounted(() => {
  animationFrameId = requestAnimationFrame(updateLoop)
})

onUnmounted(() => {
  cancelAnimationFrame(animationFrameId)
})

</script>

<style scoped>
.csma-viz-container {
  border: 1px solid #eee;
  border-radius: 8px;
  padding: 20px;
  background: #f9f9f9;
  font-family: sans-serif;
  user-select: none;
}
.controls-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 40px;
}
.status-panel { display: flex; align-items: center; gap: 10px; }
.status-label { font-weight: bold; font-size: 14px; }
.badge {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  color: white;
  font-weight: bold;
}
.badge.idle { background: #4caf50; }
.badge.busy { background: #ff9800; }
.badge.collision { background: #f44336; }

.diagram-area {
  position: relative;
  height: 250px;
  background: white;
  border: 1px solid #ddd;
  border-radius: 4px;
  margin-bottom: 20px;
  overflow: hidden; /* Hide signal overflow */
}

.bus-line {
  position: absolute;
  top: 60%;
  left: 0;
  width: 100%;
  height: 6px;
  background: #333;
  z-index: 1;
}

.station {
  position: absolute;
  top: 10%;
  width: 60px; /* Centering helper */
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  z-index: 2;
}
.station-icon {
  font-size: 24px;
  padding: 5px;
  border-radius: 4px;
  transition: all 0.3s;
}
.station-icon.transmitting { background: #e3f2fd; border: 2px solid #2196f3; }
.station-icon.collision { background: #ffebee; border: 2px solid #f44336; animation: shake 0.5s; }
.station-icon.backoff { opacity: 0.6; }

.connector {
  width: 2px;
  height: 60px; /* Connect icon to bus */
  background: #999;
  margin-top: 5px;
}

.station-controls {
  margin-top: 5px;
  text-align: center;
  min-height: 40px;
}
.btn-send {
  padding: 4px 8px;
  font-size: 10px;
  cursor: pointer;
  background: #2196f3;
  color: white;
  border: none;
  border-radius: 4px;
}
.btn-send:disabled { background: #ccc; cursor: not-allowed; }
.backoff-timer { font-size: 10px; color: #f57c00; font-weight: bold; }
.jam-msg { font-size: 10px; color: #d32f2f; font-weight: bold; }

.signal {
  position: absolute;
  top: 60%; /* On the bus */
  height: 6px;
  transform: translateY(0); /* Bus line is 6px, signal overlays it */
  opacity: 0.8;
  z-index: 10;
}
.signal.jam {
  background: #f44336 !important;
  box-shadow: 0 0 10px #f44336;
}

.collision-explosion {
  position: absolute;
  top: 55%;
  transform: translate(-50%, -50%);
  font-size: 40px;
  z-index: 20;
  animation: pop 0.3s ease-out;
}

.log-area {
  height: 120px;
  background: #333;
  color: #eee;
  padding: 10px;
  overflow-y: auto;
  font-family: monospace;
  font-size: 12px;
  border-radius: 4px;
}
.instruction {
  margin-top: 10px;
  font-size: 13px;
  color: #666;
  background: #fff3e0;
  padding: 10px;
  border-radius: 4px;
}

@keyframes shake {
  0% { transform: translate(1px, 1px) rotate(0deg); }
  10% { transform: translate(-1px, -2px) rotate(-1deg); }
  20% { transform: translate(-3px, 0px) rotate(1deg); }
  30% { transform: translate(3px, 2px) rotate(0deg); }
  40% { transform: translate(1px, -1px) rotate(1deg); }
  50% { transform: translate(-1px, 2px) rotate(-1deg); }
  60% { transform: translate(-3px, 1px) rotate(0deg); }
  70% { transform: translate(3px, 1px) rotate(-1deg); }
  80% { transform: translate(-1px, -1px) rotate(1deg); }
  90% { transform: translate(1px, 2px) rotate(0deg); }
  100% { transform: translate(1px, -2px) rotate(-1deg); }
}
@keyframes pop {
  0% { transform: translate(-50%, -50%) scale(0); opacity: 0; }
  50% { transform: translate(-50%, -50%) scale(1.5); opacity: 1; }
  100% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
}
.btn.secondary {
  padding: 6px 12px;
  background: #909399;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
</style>
