<template>
  <div class="dhcp-viz-container">
    <div class="controls-bar">
      <div class="mode-selector">
        <label :class="{ active: mode === 'initial' }">
          <input type="radio" v-model="mode" value="initial" :disabled="isBusy"> 首次连接 (Initial)
        </label>
        <label :class="{ active: mode === 'renew' }">
          <input type="radio" v-model="mode" value="renew" :disabled="isBusy"> 租约更新 (Renew)
        </label>
      </div>
      <button class="btn primary" @click="startProcess" :disabled="isBusy">
        {{ mode === 'initial' ? '开始获取 IP (DORA)' : '开始更新租约 (Renew)' }}
      </button>
      <button class="btn secondary" @click="reset" :disabled="isBusy">重置</button>
    </div>

    <div class="diagram-area">
      <!-- Devices -->
      <div v-for="dev in devices" :key="dev.id" class="host" :class="dev.type" :style="{ left: dev.left + '%' }">
        <div class="icon">{{ dev.icon }}</div>
        <div class="label">{{ dev.name }}</div>
        <div class="ip">{{ dev.id === 'client-new' ? clientIp : dev.ip }}</div>
      </div>

      <!-- Animation Area -->
      <transition name="fade">
        <div v-if="currentStep" class="message-box" :class="currentStep.type">
          <div class="msg-title">{{ currentStep.name }}</div>
          <div class="msg-detail">{{ currentStep.detail }}</div>
        </div>
      </transition>
      
      <!-- Packet Animations -->
      <div v-for="pkt in packets" :key="pkt.id" class="packet" 
           :class="pkt.type"
           :style="{ left: pkt.currentLeft + '%', opacity: pkt.opacity }">
        ✉️
      </div>
    </div>

    <div class="timeline">
      <template v-if="mode === 'initial'">
        <div class="step" :class="{ active: step >= 1 }">Discover (Broadcast)</div>
        <div class="line"></div>
        <div class="step" :class="{ active: step >= 2 }">Offer (Broadcast)</div>
        <div class="line"></div>
        <div class="step" :class="{ active: step >= 3 }">Request (Broadcast)</div>
        <div class="line"></div>
        <div class="step" :class="{ active: step >= 4 }">ACK (Broadcast)</div>
      </template>
      <template v-else>
        <div class="step" :class="{ active: step >= 1 }">Request (Unicast)</div>
        <div class="line"></div>
        <div class="step" :class="{ active: step >= 2 }">ACK (Unicast)</div>
      </template>
    </div>

    <div class="status-log">
      <div v-for="(log, idx) in logs" :key="idx" class="log-entry">
        <span class="time">[{{ log.time }}]</span> {{ log.msg }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

const isBusy = ref(false)
const clientIp = ref('0.0.0.0')
const step = ref(0)
const logs = ref<{time: string, msg: string}[]>([])
const currentStep = ref<any>(null)
const mode = ref<'initial' | 'renew'>('initial')

// Devices configuration
const devices = [
  { id: 'client-new', name: 'Client A', icon: '💻', ip: '0.0.0.0', type: 'client', left: 10 },
  { id: 'client-b', name: 'Client B', icon: '🖥️', ip: '192.168.1.5', type: 'peer', left: 35 },
  { id: 'client-c', name: 'Client C', icon: '🖨️', ip: '192.168.1.6', type: 'peer', left: 60 },
  { id: 'server', name: 'DHCP Server', icon: '⚙️', ip: '192.168.1.1', type: 'server', left: 85 }
]

interface Packet {
  id: number
  type: 'broadcast' | 'unicast'
  currentLeft: number
  opacity: number
}

const packets = ref<Packet[]>([])
let packetIdCounter = 0

watch(mode, () => {
  reset()
  if (mode.value === 'renew') {
    clientIp.value = '192.168.1.100 (Expired)'
  } else {
    clientIp.value = '0.0.0.0'
  }
})

const addLog = (msg: string) => {
  const time = new Date().toLocaleTimeString().split(' ')[0]
  logs.value.unshift({ time, msg })
}

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms))

const sendPacket = async (fromIdx: number, targetIdx: number | 'broadcast', type: 'broadcast' | 'unicast') => {
  const startLeft = devices[fromIdx].left
  const newPackets: Packet[] = []

  if (targetIdx === 'broadcast') {
    // Send to all other devices
    devices.forEach((dev, idx) => {
      if (idx !== fromIdx) {
        newPackets.push({
          id: packetIdCounter++,
          type: type,
          currentLeft: startLeft,
          opacity: 1
        })
      }
    })
  } else {
    // Send to specific device
    newPackets.push({
      id: packetIdCounter++,
      type: type,
      currentLeft: startLeft,
      opacity: 1
    })
  }

  // Add to state
  const startIndex = packets.value.length
  packets.value.push(...newPackets)

  // Trigger animation next frame
  await new Promise(resolve => requestAnimationFrame(resolve))
  await new Promise(resolve => requestAnimationFrame(resolve))

  // Update positions
  for (let i = 0; i < newPackets.length; i++) {
    const pkt = packets.value[startIndex + i]
    let targetLeft = 0
    
    if (targetIdx === 'broadcast') {
      let count = 0
      devices.forEach((dev, idx) => {
        if (idx !== fromIdx) {
          if (count === i) targetLeft = dev.left
          count++
        }
      })
    } else {
      targetLeft = devices[targetIdx].left
    }
    
    pkt.currentLeft = targetLeft
  }

  // Wait for animation
  await sleep(2000)

  // Fade out
  for (let i = 0; i < newPackets.length; i++) {
    const pkt = packets.value[startIndex + i]
    if (pkt) pkt.opacity = 0
  }
  
  await sleep(500)
  
  // Remove packets
  const idsToRemove = new Set(newPackets.map(p => p.id))
  packets.value = packets.value.filter(p => !idsToRemove.has(p.id))
}

const startProcess = async () => {
  if (isBusy.value) return
  isBusy.value = true
  
  // Clear previous state but keep IP if renew
  step.value = 0
  logs.value = []
  currentStep.value = null
  
  if (mode.value === 'initial') {
    clientIp.value = '0.0.0.0'
    
    // 1. Discover
    step.value = 1
    addLog('Client A 广播 DHCP Discover: "有 DHCP 服务器吗？"')
    addLog('(Client B, C 收到但忽略)')
    currentStep.value = { name: 'DISCOVER', detail: 'Src: 0.0.0.0, Dest: 255.255.255.255', type: 'broadcast' }
    await sendPacket(0, 'broadcast', 'broadcast')
    
    // 2. Offer
    step.value = 2
    addLog('Server 广播 DHCP Offer: "我提供 IP 192.168.1.100"')
    currentStep.value = { name: 'OFFER', detail: 'Yiaddr: 192.168.1.100 (Broadcast)', type: 'broadcast' }
    // Server (3) broadcasts (per user request)
    await sendPacket(3, 'broadcast', 'broadcast')
    
    // 3. Request
    step.value = 3
    addLog('Client A 广播 DHCP Request: "我接受 192.168.1.100"')
    addLog('(告知全网已选定 Server)')
    currentStep.value = { name: 'REQUEST', detail: 'Req IP: 192.168.1.100', type: 'broadcast' }
    await sendPacket(0, 'broadcast', 'broadcast')
    
    // 4. ACK
    step.value = 4
    addLog('Server 广播 DHCP ACK: "确认分配，租期 8h"')
    currentStep.value = { name: 'ACK', detail: 'Lease: 8 hours (Broadcast)', type: 'broadcast' }
    // Server (3) broadcasts (per user request)
    await sendPacket(3, 'broadcast', 'broadcast')
    
    clientIp.value = '192.168.1.100'
    addLog('配置完成！Client A 获得 IP: 192.168.1.100')

  } else {
    // Renew Mode
    clientIp.value = '192.168.1.100 (Expired)'

    // 1. Request (Unicast)
    step.value = 1
    addLog('Client A 单播 DHCP Request: "请求续租 192.168.1.100"')
    currentStep.value = { name: 'REQUEST', detail: 'Dest: Server (Unicast)', type: 'unicast' }
    // Client A (0) unicasts to Server (3)
    await sendPacket(0, 3, 'unicast')
    
    // 2. ACK (Unicast)
    step.value = 2
    addLog('Server 单播 DHCP ACK: "同意续租，租期延长"')
    currentStep.value = { name: 'ACK', detail: 'Lease Extended (Unicast)', type: 'unicast' }
    // Server (3) unicasts to Client A (0)
    await sendPacket(3, 0, 'unicast')
    
    clientIp.value = '192.168.1.100'
    addLog('续租完成！Client A 租期已更新')
  }

  isBusy.value = false
}

const reset = () => {
  step.value = 0
  if (mode.value === 'renew') {
    clientIp.value = '192.168.1.100 (Expired)'
  } else {
    clientIp.value = '0.0.0.0'
  }
  logs.value = []
  currentStep.value = null
  packets.value = []
  isBusy.value = false
}
</script>

<style scoped>
.dhcp-viz-container {
  border: 1px solid #eee;
  border-radius: 8px;
  padding: 20px;
  background: #f9f9f9;
  font-family: sans-serif;
}
.controls-bar {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;
}
.mode-selector {
  display: flex;
  gap: 15px;
  background: white;
  padding: 5px 15px;
  border-radius: 20px;
  border: 1px solid #ddd;
}
.mode-selector label {
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 0.9em;
}
.mode-selector label.active {
  color: #3eaf7c;
  font-weight: bold;
}
.btn {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
}
.btn:disabled { opacity: 0.5; cursor: not-allowed; }
.primary { background: #3eaf7c; color: white; }
.secondary { background: #909399; color: white; }

.diagram-area {
  height: 300px;
  position: relative;
  background: white;
  border: 1px solid #ddd;
  overflow: hidden;
  margin-bottom: 20px;
}
/* ... rest of existing styles ... */
.host {
  position: absolute;
  top: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  z-index: 2;
  width: 100px;
}

.host.peer { opacity: 0.7; }

.icon { font-size: 40px; margin-bottom: 8px; }
.label { font-weight: bold; font-size: 12px; margin-bottom: 4px; color: #333; }
.ip { font-family: monospace; background: #eee; padding: 2px 6px; border-radius: 4px; font-size: 10px; display: inline-block; }

.packet {
  position: absolute;
  top: 40%;
  transform: translate(-50%, -50%);
  font-size: 24px;
  transition: left 2s ease-in-out, opacity 0.5s;
  z-index: 10;
}
.packet.broadcast { filter: drop-shadow(0 0 5px orange); }
.packet.unicast { filter: drop-shadow(0 0 5px blue); }

.message-box {
  position: absolute;
  top: 75%;
  left: 50%;
  transform: translateX(-50%);
  padding: 8px 16px;
  border-radius: 8px;
  text-align: center;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  background: white;
  border: 2px solid #ddd;
  z-index: 20;
  min-width: 200px;
}
.message-box.broadcast { border-color: orange; color: #e65100; }
.message-box.unicast { border-color: blue; color: #1565c0; }
.msg-title { font-weight: bold; font-size: 14px; }
.msg-detail { font-size: 12px; color: #666; }

.timeline {
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 20px 0;
  flex-wrap: wrap;
  gap: 10px;
}
.step {
  padding: 5px 10px;
  background: #eee;
  border-radius: 15px;
  font-size: 12px;
  color: #999;
  transition: all 0.3s;
}
.step.active {
  background: #3eaf7c;
  color: white;
  font-weight: bold;
}
.line {
  width: 20px;
  height: 2px;
  background: #eee;
}

.status-log {
  background: #333;
  color: #eee;
  padding: 15px;
  border-radius: 4px;
  height: 150px;
  overflow-y: auto;
  font-family: monospace;
  font-size: 12px;
}
.log-entry { margin-bottom: 4px; }
.time { color: #888; margin-right: 8px; }
</style>
