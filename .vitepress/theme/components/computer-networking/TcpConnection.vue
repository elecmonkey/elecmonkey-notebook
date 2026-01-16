<template>
  <div class="tcp-viz-container">
    <div class="controls-bar">
      <button class="btn primary" @click="startHandshake" :disabled="isBusy || clientState !== 'CLOSED'">建立连接 (三次握手)</button>
      <button class="btn danger" @click="startTeardown" :disabled="isBusy || clientState !== 'ESTABLISHED'">断开连接 (四次挥手)</button>
      <button class="btn secondary" @click="reset" :disabled="isBusy">重置</button>
    </div>

    <div class="diagram-area">
      <!-- Client Side -->
      <div class="host-column">
        <div class="host-icon">💻</div>
        <h3>Client</h3>
        <div class="state-box" :class="getStateClass(clientState)">
          {{ clientState }}
        </div>
      </div>

      <!-- Packet Channel -->
      <div class="channel-column">
        <div class="packet-track">
          <transition-group name="packet-fade">
            <div v-for="pkt in packets" :key="pkt.id" 
                 class="packet"
                 :data-id="pkt.id"
                 :class="pkt.from === 'client' ? 'packet-right' : 'packet-left'"
                 :style="{ left: pkt.x + '%' }">
              <div class="packet-body">
                <div class="packet-flags">{{ pkt.flags }}</div>
                <div class="packet-info">seq={{ pkt.seq }} ack={{ pkt.ack }}</div>
              </div>
              <div class="arrow"></div>
            </div>
          </transition-group>
        </div>
      </div>

      <!-- Server Side -->
      <div class="host-column">
        <div class="host-icon">🖥️</div>
        <h3>Server</h3>
        <div class="state-box" :class="getStateClass(serverState)">
          {{ serverState }}
        </div>
      </div>
    </div>

    <div class="status-log">
      <div v-for="(log, idx) in logs" :key="idx" class="log-entry">
        <span class="time">[{{ log.time }}]</span> {{ log.msg }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick } from 'vue'

type State = 'CLOSED' | 'LISTEN' | 'SYN_SENT' | 'SYN_RCVD' | 'ESTABLISHED' | 'FIN_WAIT_1' | 'FIN_WAIT_2' | 'CLOSE_WAIT' | 'LAST_ACK' | 'TIME_WAIT'

const clientState = ref<State>('CLOSED')
const serverState = ref<State>('CLOSED')
const isBusy = ref(false)
const packets = ref<any[]>([])
const logs = ref<{time: string, msg: string}[]>([])

let packetId = 0
const seq = ref(100)
const ack = ref(0)

const getStateClass = (s: State) => {
  if (s === 'ESTABLISHED') return 'state-success'
  if (s === 'CLOSED') return 'state-gray'
  if (s.includes('WAIT')) return 'state-warning'
  return 'state-info'
}

const addLog = (msg: string) => {
  const time = new Date().toLocaleTimeString().split(' ')[0]
  logs.value.unshift({ time, msg })
}

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms))

const sendPacket = async (from: 'client' | 'server', flags: string, s: number, a: number) => {
  const id = packetId++
  // x represents position percentage: 0 = client, 100 = server
  const startX = from === 'client' ? 0 : 100
  const endX = from === 'client' ? 100 : 0
  
  const pkt = { id, from, flags, seq: s, ack: a, x: startX, y: 50 }
  packets.value.push(pkt)
  
  // Wait for Vue to render the new element
  await nextTick()
  
  // Force browser reflow to register start position
  const el = document.querySelector(`.packet[data-id="${id}"]`)
  if (el) void (el as HTMLElement).offsetHeight
  
  // Wait a bit to be safe
  await new Promise(resolve => requestAnimationFrame(resolve))
  
  // Find the reactive packet in the array and update it
  const reactivePkt = packets.value.find(p => p.id === id)
  if (reactivePkt) {
    reactivePkt.x = endX
  }
  
  // Wait for transition duration (must match CSS)
  await sleep(2000)
  
  // Stack packets at destination (move up/down slightly to avoid full overlap)
  // But wait! We need to keep them visible for a bit.
  if (reactivePkt) {
     reactivePkt.y = from === 'client' ? 20 : 80 // Move out of the "wire"
  }
  
  // Keep packet visible for history context
  // Only remove oldest packets if too many
  if (packets.value.length > 5) {
     packets.value.shift()
  }
  
  return pkt
}

const reset = () => {
  clientState.value = 'CLOSED'
  serverState.value = 'CLOSED'
  packets.value = []
  logs.value = []
  isBusy.value = false
  seq.value = 100
  ack.value = 0
  addLog('系统已重置')
}

const startHandshake = async () => {
  if (isBusy.value) return
  isBusy.value = true
  reset()
  
  // Step 0: Server Listen
  serverState.value = 'LISTEN'
  addLog('Server 进入 LISTEN 状态')
  await sleep(500)

  // Step 1: SYN
  addLog('Client 发送 SYN, 进入 SYN_SENT')
  clientState.value = 'SYN_SENT'
  const clientSeq = 100
  await sendPacket('client', 'SYN', clientSeq, 0)
  
  // Step 2: SYN+ACK
  addLog('Server 收到 SYN, 发送 SYN+ACK, 进入 SYN_RCVD')
  serverState.value = 'SYN_RCVD'
  const serverSeq = 200
  await sleep(300)
  await sendPacket('server', 'SYN+ACK', serverSeq, clientSeq + 1)
  
  // Step 3: ACK
  addLog('Client 收到 SYN+ACK, 发送 ACK, 进入 ESTABLISHED')
  clientState.value = 'ESTABLISHED'
  await sleep(300)
  await sendPacket('client', 'ACK', clientSeq + 1, serverSeq + 1)
  
  addLog('Server 收到 ACK, 进入 ESTABLISHED')
  serverState.value = 'ESTABLISHED'
  addLog('连接建立完成！')
  isBusy.value = false
}

const startTeardown = async () => {
  if (isBusy.value) return
  isBusy.value = true
  
  // Step 1: FIN
  addLog('Client 发送 FIN, 进入 FIN_WAIT_1')
  clientState.value = 'FIN_WAIT_1'
  const clientSeq = 300
  const serverSeq = 400 // Assumption
  await sendPacket('client', 'FIN', clientSeq, serverSeq)
  
  // Step 2: ACK
  addLog('Server 收到 FIN, 发送 ACK, 进入 CLOSE_WAIT')
  serverState.value = 'CLOSE_WAIT'
  await sleep(300)
  await sendPacket('server', 'ACK', serverSeq, clientSeq + 1)
  
  addLog('Client 收到 ACK, 进入 FIN_WAIT_2')
  clientState.value = 'FIN_WAIT_2'
  
  // Server App closes
  await sleep(1000)
  addLog('Server 应用层关闭, 发送 FIN, 进入 LAST_ACK')
  serverState.value = 'LAST_ACK'
  await sendPacket('server', 'FIN', serverSeq, clientSeq + 1)
  
  // Step 4: ACK
  addLog('Client 收到 FIN, 发送 ACK, 进入 TIME_WAIT')
  clientState.value = 'TIME_WAIT'
  await sleep(300)
  await sendPacket('client', 'ACK', clientSeq + 1, serverSeq + 1)
  
  addLog('Server 收到 ACK, 进入 CLOSED')
  serverState.value = 'CLOSED'
  
  addLog('Client 等待 2MSL 后进入 CLOSED')
  await sleep(1500)
  clientState.value = 'CLOSED'
  
  addLog('连接已断开')
  isBusy.value = false
}
</script>

<style scoped>
.tcp-viz-container {
  border: 1px solid #eee;
  border-radius: 8px;
  padding: 20px;
  background: #f9f9f9;
  font-family: sans-serif;
}
.controls-bar {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
  justify-content: center;
}
.btn {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
  transition: opacity 0.2s;
}
.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.primary { background: #3eaf7c; color: white; }
.danger { background: #e06c75; color: white; }
.secondary { background: #909399; color: white; }

.diagram-area {
  display: flex;
  justify-content: space-between;
  height: 400px;
  position: relative;
  background: white;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 20px;
}

.host-column {
  width: 120px;
  display: flex;
  flex-direction: column;
  align-items: center;
  z-index: 2;
}
.host-icon { font-size: 48px; }
.state-box {
  margin-top: 10px;
  padding: 8px;
  border-radius: 4px;
  width: 100%;
  text-align: center;
  font-weight: bold;
  font-size: 14px;
  transition: all 0.3s;
}
.state-gray { background: #eee; color: #666; }
.state-info { background: #e3f2fd; color: #1976d2; border: 1px solid #bbdefb; }
.state-success { background: #e8f5e9; color: #2e7d32; border: 1px solid #c8e6c9; }
.state-warning { background: #fff3e0; color: #f57c00; border: 1px solid #ffe0b2; }

.channel-column {
  flex: 1;
  position: relative;
  margin: 0 40px; /* Increased margin to avoid overlap with hosts */
  border-bottom: 2px dashed #ddd; /* Wire metaphor */
  align-self: center; /* Center vertically in flex container */
  height: 2px; /* It's just a line */
}

.packet-track {
  position: absolute;
  top: 50%;
  left: 0;
  width: 100%;
  height: 0;
}

.packet {
  position: absolute;
  top: 50%; /* Centered on the wire */
  transform: translate(-50%, -50%);
  background: #fff;
  border: 2px solid #3eaf7c;
  padding: 8px 16px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  font-size: 12px;
  white-space: nowrap;
  color: #333;
  z-index: 10;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  transition: left 1s linear, opacity 0.3s ease; /* Ensure both transitions are present */
}
.packet-icon { font-size: 20px; }
.packet-flags { font-weight: bold; color: #3eaf7c; font-size: 14px; }
.packet-info { font-size: 11px; color: #666; font-family: monospace; }
.packet-right { border-color: #3eaf7c; } /* Client to Server */
.packet-left { border-color: #3eaf7c; } /* Server to Client */


.status-log {
  margin-top: 20px;
  height: 150px;
  overflow-y: auto;
  background: #282c34;
  color: #abb2bf;
  padding: 10px;
  border-radius: 4px;
  font-family: monospace;
  font-size: 13px;
}
.log-entry { margin-bottom: 4px; }
.packet-fade-enter-active,
.packet-fade-leave-active {
  transition: opacity 0.3s ease, left 2s linear;
}

.packet-fade-enter-from,
.packet-fade-leave-to {
  opacity: 0;
}
</style>
