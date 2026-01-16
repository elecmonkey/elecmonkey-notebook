<template>
  <div class="dhcp-viz-container">
    <div class="controls-bar">
      <button class="btn primary" @click="startProcess" :disabled="isBusy">开始获取 IP (DORA)</button>
      <button class="btn secondary" @click="reset" :disabled="isBusy">重置</button>
    </div>

    <div class="diagram-area">
      <div class="host client">
        <div class="icon">💻</div>
        <div class="label">Client (New)</div>
        <div class="ip">{{ clientIp }}</div>
      </div>

      <div class="host server">
        <div class="icon">🖥️</div>
        <div class="label">DHCP Server</div>
        <div class="ip">192.168.1.1</div>
      </div>

      <!-- Animation Area -->
      <transition name="fade">
        <div v-if="currentStep" class="message-box" :class="currentStep.type">
          <div class="msg-title">{{ currentStep.name }}</div>
          <div class="msg-detail">{{ currentStep.detail }}</div>
        </div>
      </transition>
      
      <!-- Packet Animation -->
      <div v-if="packet" class="packet" 
           :class="packet.type"
           :style="{ left: packet.x + '%' }">
        ✉️
      </div>
    </div>

    <div class="timeline">
      <div class="step" :class="{ active: step >= 1 }">Discover</div>
      <div class="line"></div>
      <div class="step" :class="{ active: step >= 2 }">Offer</div>
      <div class="line"></div>
      <div class="step" :class="{ active: step >= 3 }">Request</div>
      <div class="line"></div>
      <div class="step" :class="{ active: step >= 4 }">ACK</div>
    </div>

    <div class="status-log">
      <div v-for="(log, idx) in logs" :key="idx" class="log-entry">
        <span class="time">[{{ log.time }}]</span> {{ log.msg }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const isBusy = ref(false)
const clientIp = ref('0.0.0.0')
const step = ref(0)
const logs = ref<{time: string, msg: string}[]>([])
const currentStep = ref<any>(null)
const packet = ref<any>(null)

const addLog = (msg: string) => {
  const time = new Date().toLocaleTimeString().split(' ')[0]
  logs.value.unshift({ time, msg })
}

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms))

const sendPacket = async (from: 'client' | 'server', type: 'broadcast' | 'unicast') => {
  const startX = from === 'client' ? 10 : 90
  const endX = from === 'client' ? 90 : 10
  
  packet.value = { x: startX, type }
  await new Promise(resolve => requestAnimationFrame(resolve))
  await new Promise(resolve => requestAnimationFrame(resolve))
  
  packet.value.x = endX
  await sleep(2000)
  packet.value = null
}

const startProcess = async () => {
  if (isBusy.value) return
  isBusy.value = true
  reset()
  
  // 1. Discover
  step.value = 1
  addLog('Client 广播 DHCP Discover: "有 DHCP 服务器吗？"')
  currentStep.value = { name: 'DISCOVER', detail: 'Src: 0.0.0.0, Dest: 255.255.255.255', type: 'broadcast' }
  await sendPacket('client', 'broadcast')
  
  // 2. Offer
  step.value = 2
  addLog('Server 响应 DHCP Offer: "我提供 IP 192.168.1.100"')
  currentStep.value = { name: 'OFFER', detail: 'Yiaddr: 192.168.1.100', type: 'unicast' }
  await sendPacket('server', 'unicast') // Or broadcast depending on flag
  
  // 3. Request
  step.value = 3
  addLog('Client 广播 DHCP Request: "我接受 192.168.1.100"')
  currentStep.value = { name: 'REQUEST', detail: 'Req IP: 192.168.1.100', type: 'broadcast' }
  await sendPacket('client', 'broadcast')
  
  // 4. ACK
  step.value = 4
  addLog('Server 发送 DHCP ACK: "确认分配，租期 8h"')
  currentStep.value = { name: 'ACK', detail: 'Lease: 8 hours', type: 'unicast' }
  await sendPacket('server', 'unicast')
  
  clientIp.value = '192.168.1.100'
  addLog('配置完成！Client 获得 IP: 192.168.1.100')
  isBusy.value = false
}

const reset = () => {
  step.value = 0
  clientIp.value = '0.0.0.0'
  logs.value = []
  currentStep.value = null
  packet.value = null
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
}
.btn:disabled { opacity: 0.5; cursor: not-allowed; }
.primary { background: #3eaf7c; color: white; }
.secondary { background: #909399; color: white; }

.diagram-area {
  height: 250px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 50px;
  background: white;
  border: 1px solid #ddd;
  position: relative;
  overflow: hidden;
}

.host {
  text-align: center;
  z-index: 2;
}
.icon { font-size: 48px; }
.label { font-weight: bold; margin: 5px 0; }
.ip { font-family: monospace; background: #eee; padding: 2px 6px; border-radius: 4px; font-size: 12px; }

.packet {
  position: absolute;
  top: 40%;
  font-size: 32px;
  transition: left 2s linear;
  z-index: 10;
}
.packet.broadcast { filter: drop-shadow(0 0 5px orange); }
.packet.unicast { filter: drop-shadow(0 0 5px blue); }

.message-box {
  position: absolute;
  top: 70%;
  left: 50%;
  transform: translateX(-50%);
  padding: 10px 20px;
  border-radius: 8px;
  text-align: center;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  background: white;
  border: 2px solid #ddd;
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
}
.step {
  padding: 5px 10px;
  background: #eee;
  border-radius: 15px;
  font-size: 12px;
  color: #999;
}
.step.active { background: #3eaf7c; color: white; font-weight: bold; }
.line { width: 40px; height: 2px; background: #eee; }

.status-log {
  min-height: 150px;
  background: #282c34;
  color: #abb2bf;
  padding: 10px;
  border-radius: 4px;
  font-family: monospace;
  font-size: 13px;
}
.log-entry { margin-bottom: 4px; }
.time { color: #61afef; margin-right: 8px; }

.fade-enter-active, .fade-leave-active { transition: opacity 0.5s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
