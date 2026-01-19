<template>
  <div class="csma-ca-container">
    <div class="controls-bar">
      <div class="status-panel">
        <span class="status-label">当前阶段:</span>
        <span class="badge" :class="globalState">{{ globalStateText }}</span>
      </div>
      <button class="btn secondary" @click="reset">重置</button>
    </div>

    <div class="diagram-area">
      <!-- Wireless Medium (Air) -->
      <div class="air-medium">
        <div class="range-indicator" style="left: 10%; width: 50%; opacity: 0.1; background: blue;" title="A的覆盖范围"></div>
        <div class="range-indicator" style="left: 40%; width: 50%; opacity: 0.1; background: green;" title="B的覆盖范围"></div>
        <div class="range-indicator" style="left: 10%; width: 80%; opacity: 0.05; background: orange;" title="AP的覆盖范围"></div>
      </div>

      <!-- Nodes -->
      <div v-for="node in nodes" :key="node.id" 
           class="node" 
           :style="{ left: node.position + '%' }">
        <div class="node-icon" :class="getNodeClass(node)">
          <span class="icon">{{ node.type === 'AP' ? '📡' : '💻' }}</span>
          <span class="name">{{ node.name }}</span>
        </div>
        
        <!-- NAV / Timer / Status -->
        <div class="node-status">
          <div v-if="node.nav > 0" class="nav-timer">NAV: {{ (node.nav/1000).toFixed(1) }}s</div>
          <div v-if="node.timer > 0" class="action-timer">{{ node.timerLabel }}: {{ (node.timer/1000).toFixed(1) }}s</div>
          <div v-if="node.state === 'backoff'" class="backoff-timer">退避: {{ node.backoff }}</div>
        </div>

        <div class="node-controls" v-if="node.type !== 'AP'">
          <button class="btn-send" 
                  @click="startTx(node)" 
                  :disabled="node.state !== 'idle' || node.nav > 0 || globalState !== 'idle'">
            发送数据
          </button>
        </div>
      </div>

      <!-- Packets -->
      <div v-for="pkt in packets" :key="pkt.id" 
           class="packet" 
           :class="pkt.type"
           :style="{ left: pkt.left + '%', opacity: pkt.opacity }">
        {{ pkt.type.toUpperCase() }}
      </div>
    </div>

    <div class="log-area" ref="logContainer">
      <div v-for="(log, i) in logs" :key="i" class="log-line">
        <span class="time">[{{ log.time }}]</span> {{ log.msg }}
      </div>
    </div>
    
    <div class="instruction">
      <p><strong>隐藏终端实验场景 (RTS/CTS 模式)：</strong></p>
      <ul>
        <li><strong>拓扑：</strong> A (左) —— AP (中) —— B (右)。</li>
        <li><strong>范围：</strong> A 和 B 互不可见（隐藏终端），但都能连接 AP。</li>
        <li><strong>操作：</strong> 点击 A 发送数据，观察 RTS/CTS 握手如何通知 B 设置 NAV (网络分配矢量) 从而避免冲突。</li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted, computed, nextTick } from 'vue'

interface Node {
  id: string
  name: string
  type: 'STA' | 'AP'
  position: number
  state: 'idle' | 'difs_wait' | 'rts_sent' | 'cts_wait' | 'data_sent' | 'ack_wait' | 'sifs_wait' | 'backoff'
  nav: number // ms
  timer: number // ms
  timerLabel: string
  backoff: number
  color: string
  nextAction?: () => void
}

interface Packet {
  id: number
  type: 'rts' | 'cts' | 'data' | 'ack'
  sourceId: string
  targetId: string
  left: number
  direction: 1 | -1 // 1 right, -1 left
  speed: number
  active: boolean
  opacity: number
  hitList?: string[]
}

const nodes = reactive<Node[]>([
  { id: 'A', name: '站点 A', type: 'STA', position: 15, state: 'idle', nav: 0, timer: 0, timerLabel: '', backoff: 0, color: '#2196f3' },
  { id: 'AP', name: 'AP 基站', type: 'AP', position: 50, state: 'idle', nav: 0, timer: 0, timerLabel: '', backoff: 0, color: '#9c27b0' },
  { id: 'B', name: '站点 B', type: 'STA', position: 85, state: 'idle', nav: 0, timer: 0, timerLabel: '', backoff: 0, color: '#4caf50' }
])

const packets = ref<Packet[]>([])
const logs = ref<{time: string, msg: string}[]>([])
const logContainer = ref<HTMLElement | null>(null)
let packetIdCounter = 0
let lastTime = 0
let animationFrameId: number

// Config
const SPEED = 0.04 // % per ms
const DIFS_TIME = 1000
const SIFS_TIME = 500
const DATA_DURATION = 2000 // Time reserved for data

const globalState = computed(() => {
  if (packets.value.length > 0) return 'busy'
  if (nodes.some(n => n.state !== 'idle')) return 'processing'
  return 'idle'
})

const globalStateText = computed(() => {
  if (globalState.value === 'idle') return '信道空闲'
  return '信道忙 / 处理中'
})

const addLog = (msg: string) => {
  const time = new Date().toLocaleTimeString().split(' ')[0]
  logs.value.push({ time, msg })
  nextTick(() => {
    if (logContainer.value) logContainer.value.scrollTop = logContainer.value.scrollHeight
  })
}

const getNodeClass = (node: Node) => {
  return {
    'transmitting': ['rts_sent', 'data_sent', 'cts_sent', 'ack_sent'].includes(node.state), // Simplified states check
    'nav-blocked': node.nav > 0,
    'waiting': ['difs_wait', 'sifs_wait', 'cts_wait', 'ack_wait'].includes(node.state)
  }
}

const startTx = (node: Node) => {
  if (node.state !== 'idle' || node.nav > 0) return
  
  addLog(`${node.name} 准备发送，侦听信道 (DIFS等待)...`)
  node.state = 'difs_wait'
  node.timer = DIFS_TIME
  node.timerLabel = 'DIFS'
}

const sendPacket = (type: 'rts' | 'cts' | 'data' | 'ack', source: Node, targetPos: number) => {
  addLog(`${source.name} 发送 ${type.toUpperCase()}`)
  
  // Create packet(s)
  // AP sends to both sides (broadcast nature)
  // STA sends to AP (directional in this 1D view, but realistically omni)
  
  if (source.type === 'AP') {
    // AP Broadcasts CTS/ACK
    packets.value.push({
      id: packetIdCounter++, type, sourceId: source.id, targetId: 'ALL',
      left: source.position, direction: -1, speed: SPEED, active: true, opacity: 1
    })
    packets.value.push({
      id: packetIdCounter++, type, sourceId: source.id, targetId: 'ALL',
      left: source.position, direction: 1, speed: SPEED, active: true, opacity: 1
    })
  } else {
    // STA sends to AP
    const dir = (source.position < 50 ? 1 : -1) as 1 | -1
    packets.value.push({
      id: packetIdCounter++, type, sourceId: source.id, targetId: 'AP',
      left: source.position, direction: dir, speed: SPEED, active: true, opacity: 1
    })
    
    // STA also radiates away from AP (but hits nothing in this model, maybe fades)
    packets.value.push({
      id: packetIdCounter++, type, sourceId: source.id, targetId: 'NONE',
      left: source.position, direction: (-dir) as 1 | -1, speed: SPEED, active: true, opacity: 0.3 // Fades out
    })
  }
}

const handlePacketArrival = (pkt: Packet, target: Node) => {
  // Logic for receiving packets
  if (target.id === pkt.sourceId) return // Don't receive own
  
  // Hidden Terminal Logic:
  // A and B cannot hear each other.
  if ((pkt.sourceId === 'A' && target.id === 'B') || (pkt.sourceId === 'B' && target.id === 'A')) {
    return // Signal too weak/hidden
  }

  addLog(`${target.name} 收到 ${pkt.type.toUpperCase()}`)

  // AP Logic
  if (target.type === 'AP') {
    if (pkt.type === 'rts') {
      addLog(`AP 收到 RTS，等待 SIFS 后回复 CTS...`)
      target.state = 'sifs_wait'
      target.timer = SIFS_TIME
      target.timerLabel = 'SIFS'
      // Plan next action: Send CTS
      target.nextAction = () => sendPacket('cts', target, 0)
    } else if (pkt.type === 'data') {
      addLog(`AP 收到 DATA，等待 SIFS 后回复 ACK...`)
      target.state = 'sifs_wait'
      target.timer = SIFS_TIME
      target.timerLabel = 'SIFS'
      target.nextAction = () => sendPacket('ack', target, 0)
    }
  }
  
  // STA Logic
  else if (target.type === 'STA') {
    if (pkt.type === 'cts') {
      // Is it for me? We don't have explicit addresses in pkt for simplicity, 
      // but we assume state context.
      if (target.state === 'cts_wait') {
        // I am the sender
        addLog(`${target.name} 收到 CTS (许可)，等待 SIFS 后发送 DATA...`)
        target.state = 'sifs_wait'
        target.timer = SIFS_TIME
        target.timerLabel = 'SIFS'
        target.nextAction = () => sendPacket('data', target, 50)
      } else {
        // I am the other node -> NAV
        addLog(`${target.name} 侦听到 CTS (非己)，设置 NAV (静默)...`)
        target.nav = DATA_DURATION + 2000 // Simplified NAV duration
      }
    } else if (pkt.type === 'ack') {
       if (target.state === 'ack_wait') {
         addLog(`${target.name} 收到 ACK，传输成功！`)
         target.state = 'idle'
       } else {
         addLog(`${target.name} 收到 ACK，NAV 即使未到期也可提前结束(简化)`)
         target.nav = 0
       }
    }
  }
}

const updateLoop = (timestamp: number) => {
  if (!lastTime) lastTime = timestamp
  const dt = timestamp - lastTime
  lastTime = timestamp

  // 1. Update Packets
  packets.value.forEach(p => {
    if (!p.active) return
    p.left += p.direction * p.speed * dt
    
    // Bounds check
    if (p.left < 0 || p.left > 100) {
      p.active = false
    }

    // Collision/Arrival Check
    nodes.forEach(n => {
      // Simple point check: if packet crosses node position
      // We need previous pos to detect crossing? Or just close enough.
      // Let's use distance threshold.
      if (Math.abs(p.left - n.position) < 1 && p.active) {
         // Prevent multiple triggers for same packet on same node?
         // In this simple loop, packet moves fast.
         // Let's mark packet as "processed_by_X" ? 
         // Simplified: Just trigger. But need to avoid re-trigger next frame.
         // Let's just say "active" becomes false for that node interaction? 
         // No, packet continues to other nodes.
         
         // Fix: Check if this packet has already hit this node
         if (!p.hitList) p.hitList = []
         if (!p.hitList.includes(n.id)) {
           p.hitList.push(n.id)
           handlePacketArrival(p, n)
         }
      }
    })
  })
  
  // Cleanup packets
  packets.value = packets.value.filter(p => p.active)

  // 2. Update Timers (DIFS, SIFS, NAV)
  nodes.forEach(n => {
    // NAV countdown
    if (n.nav > 0) {
      n.nav = Math.max(0, n.nav - dt)
    }

    // Action Timers
    if (n.timer > 0) {
      n.timer = Math.max(0, n.timer - dt)
      if (n.timer === 0) {
        // Timer expired, perform action
        if (n.state === 'difs_wait') {
           sendPacket('rts', n, 50)
           n.state = 'cts_wait'
           // Timeout for CTS? (Not implemented for sim)
        } else if (n.state === 'sifs_wait') {
           if (n.nextAction) {
             n.nextAction()
             n.nextAction = undefined
             // Update state after sending
             // If AP sent CTS -> waiting for DATA? No, AP just waits.
             // If AP sent ACK -> idle.
             // If STA sent DATA -> wait for ACK.
             
             // Infer state from what was sent (hacky but works for sim)
             // We can set state in the nextAction closure or here.
             // Let's refine nextAction to set state.
             
             // Actually, let's just hardcode logic here based on role
             if (n.type === 'AP') {
               // AP logic
               // If just sent CTS
               // We don't track "sent CTS" easily unless stored.
               // Let's rely on simple flow.
               // If I was waiting SIFS and am AP, I probably just received RTS or DATA.
               // If I received RTS, I send CTS.
               // If I received DATA, I send ACK.
               
               // But wait, the sendPacket was queued in nextAction.
               // Let's just assume nextAction handles state transition if needed?
               // Or simpler:
               n.state = 'idle' // AP returns to idle (listening) after sending
             } else {
               // STA logic
               // If sent DATA
               if (n.state === 'sifs_wait') {
                  // Must be transition to ack_wait
                  n.state = 'ack_wait'
               }
             }
           }
        }
      }
    }
  })

  animationFrameId = requestAnimationFrame(updateLoop)
}

const reset = () => {
  packets.value = []
  nodes.forEach(n => {
    n.state = 'idle'
    n.nav = 0
    n.timer = 0
    n.backoff = 0
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
.csma-ca-container {
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
  margin-bottom: 20px;
}
.status-panel { display: flex; align-items: center; gap: 10px; }
.badge {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  color: white;
  font-weight: bold;
}
.badge.idle { background: #4caf50; }
.badge.busy { background: #ff9800; }
.badge.processing { background: #2196f3; }

.diagram-area {
  position: relative;
  height: 200px;
  background: white;
  border: 1px solid #ddd;
  border-radius: 4px;
  margin-bottom: 20px;
  overflow: hidden;
}

.air-medium {
  position: absolute;
  top: 0; left: 0; width: 100%; height: 100%;
}
.range-indicator {
  position: absolute;
  top: 20%; height: 60%;
  border-radius: 50%; /* Ellipse approx */
}

.node {
  position: absolute;
  top: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  z-index: 10;
  width: 100px;
}

.node-icon {
  width: 50px; height: 50px;
  background: #eee;
  border-radius: 50%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  border: 2px solid #ccc;
  transition: all 0.3s;
}
.node-icon.transmitting {
  background: #e3f2fd; border-color: #2196f3;
  box-shadow: 0 0 15px #2196f3;
}
.node-icon.nav-blocked {
  background: #ffebee; border-color: #f44336;
  opacity: 0.7;
}
.node-icon.waiting {
  border-style: dashed;
}

.icon { font-size: 20px; }
.name { font-size: 10px; margin-top: 2px; }

.node-status {
  margin-top: 5px;
  font-size: 10px;
  height: 20px;
  text-align: center;
  color: #666;
  font-weight: bold;
}
.nav-timer { color: #f44336; }
.action-timer { color: #2196f3; }

.node-controls { margin-top: 5px; }
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

.packet {
  position: absolute;
  top: 50%;
  transform: translate(-50%, -50%);
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 10px;
  color: white;
  font-weight: bold;
  z-index: 5;
  white-space: nowrap;
}
.packet.rts { background: #9c27b0; }
.packet.cts { background: #009688; }
.packet.data { background: #2196f3; width: 60px; text-align: center; }
.packet.ack { background: #4caf50; }

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
.btn.secondary {
  padding: 6px 12px;
  background: #909399;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
</style>
