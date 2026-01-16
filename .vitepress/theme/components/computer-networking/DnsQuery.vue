<template>
  <div class="dns-viz-container">
    <div class="controls-bar">
      <div class="mode-switch">
        <label>
          <input type="radio" value="iterative" v-model="mode" :disabled="isBusy"> 迭代查询 (Iterative)
        </label>
        <label>
          <input type="radio" value="recursive" v-model="mode" :disabled="isBusy"> 递归查询 (Recursive)
        </label>
      </div>
      <button class="btn primary" @click="startQuery" :disabled="isBusy">开始查询 (www.example.com)</button>
      <button class="btn secondary" @click="reset" :disabled="isBusy">重置</button>
    </div>

    <div class="diagram-area">
      <!-- Servers Layout -->
      <div class="server-node" style="left: 5%; top: 60%">
        <div class="icon">💻</div>
        <div class="label">Local Host</div>
      </div>
      
      <div class="server-node" style="left: 25%; top: 30%">
        <div class="icon">🏢</div>
        <div class="label">Local DNS</div>
      </div>

      <div class="server-node" style="left: 50%; top: 10%">
        <div class="icon">🌍</div>
        <div class="label">Root DNS</div>
      </div>

      <div class="server-node" style="left: 70%; top: 30%">
        <div class="icon">📂</div>
        <div class="label">TLD DNS (.com)</div>
      </div>

      <div class="server-node" style="left: 90%; top: 60%">
        <div class="icon">🎯</div>
        <div class="label">Auth DNS (example.com)</div>
      </div>

      <!-- Packet Animation -->
      <div v-if="packet" class="packet" :style="{ left: packet.x + '%', top: packet.y + '%' }">
        ✉️
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
import { ref } from 'vue'

const mode = ref<'iterative' | 'recursive'>('iterative')
const isBusy = ref(false)
const logs = ref<{time: string, msg: string}[]>([])
const packet = ref<{x: number, y: number} | null>(null)

// Coordinates for nodes
const coords = {
  host: { x: 5, y: 60 },
  local: { x: 25, y: 30 },
  root: { x: 50, y: 10 },
  tld: { x: 70, y: 30 },
  auth: { x: 90, y: 60 }
}

const addLog = (msg: string) => {
  const time = new Date().toLocaleTimeString().split(' ')[0]
  logs.value.unshift({ time, msg })
}

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms))

const movePacket = async (start: {x: number, y: number}, end: {x: number, y: number}) => {
  packet.value = { ...start }
  // Force reflow
  await new Promise(resolve => requestAnimationFrame(resolve))
  await new Promise(resolve => requestAnimationFrame(resolve))
  
  packet.value = { ...end }
  await sleep(1000) // Animation duration
}

const startQuery = async () => {
  if (isBusy.value) return
  isBusy.value = true
  logs.value = []
  
  if (mode.value === 'iterative') {
    await runIterative()
  } else {
    await runRecursive()
  }
  
  packet.value = null
  isBusy.value = false
}

const runIterative = async () => {
  addLog('Host 向 Local DNS 发起递归查询')
  await movePacket(coords.host, coords.local)
  
  addLog('Local DNS 向 Root DNS 发起迭代查询')
  await movePacket(coords.local, coords.root)
  addLog('Root DNS 返回 TLD DNS 地址')
  await movePacket(coords.root, coords.local)
  
  addLog('Local DNS 向 TLD DNS 发起迭代查询')
  await movePacket(coords.local, coords.tld)
  addLog('TLD DNS 返回 Auth DNS 地址')
  await movePacket(coords.tld, coords.local)
  
  addLog('Local DNS 向 Auth DNS 发起迭代查询')
  await movePacket(coords.local, coords.auth)
  addLog('Auth DNS 返回 IP 地址')
  await movePacket(coords.auth, coords.local)
  
  addLog('Local DNS 向 Host 返回最终 IP')
  await movePacket(coords.local, coords.host)
  addLog('查询完成！IP: 93.184.216.34')
}

const runRecursive = async () => {
  addLog('Host 向 Local DNS 发起递归查询')
  await movePacket(coords.host, coords.local)
  
  addLog('Local DNS 向 Root DNS 发起递归查询')
  await movePacket(coords.local, coords.root)
  
  addLog('Root DNS 向 TLD DNS 发起递归查询')
  await movePacket(coords.root, coords.tld)
  
  addLog('TLD DNS 向 Auth DNS 发起递归查询')
  await movePacket(coords.tld, coords.auth)
  
  addLog('Auth DNS 返回 IP 给 TLD DNS')
  await movePacket(coords.auth, coords.tld)
  
  addLog('TLD DNS 返回 IP 给 Root DNS')
  await movePacket(coords.tld, coords.root)
  
  addLog('Root DNS 返回 IP 给 Local DNS')
  await movePacket(coords.root, coords.local)
  
  addLog('Local DNS 返回 IP 给 Host')
  await movePacket(coords.local, coords.host)
  addLog('查询完成！IP: 93.184.216.34')
}

const reset = () => {
  logs.value = []
  packet.value = null
  isBusy.value = false
}
</script>

<style scoped>
.dns-viz-container {
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
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
}
.mode-switch {
  display: flex;
  gap: 15px;
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
  height: 400px;
  position: relative;
  background: white;
  border: 1px solid #ddd;
  border-radius: 4px;
  margin-bottom: 20px;
}

.server-node {
  position: absolute;
  transform: translate(-50%, -50%);
  text-align: center;
  z-index: 2;
}
.icon { font-size: 40px; }
.label { font-size: 12px; font-weight: bold; margin-top: 5px; background: rgba(255,255,255,0.8); padding: 2px 5px; border-radius: 4px; }

.packet {
  position: absolute;
  font-size: 24px;
  transform: translate(-50%, -50%);
  transition: all 1s ease-in-out;
  z-index: 10;
}

.status-log {
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
.time { color: #61afef; margin-right: 8px; }
</style>
