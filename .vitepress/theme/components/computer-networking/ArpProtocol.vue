<template>
  <div class="arp-viz-container">
    <div class="controls-bar">
      <button class="btn primary" @click="startArp" :disabled="isBusy">Host A 请求 Host B 的 MAC</button>
      <button class="btn secondary" @click="reset" :disabled="isBusy">重置</button>
    </div>

    <div class="network-diagram">
      <!-- Bus/Switch Line -->
      <div class="bus-line"></div>

      <!-- Hosts -->
      <div class="host" style="left: 10%">
        <div class="icon">💻</div>
        <div class="name">Host A</div>
        <div class="detail">IP: 10.0.0.1<br>MAC: AA:AA</div>
        <div class="arp-table">
          <div class="table-title">ARP Table</div>
          <div v-if="arpTableA.length === 0" class="empty">Empty</div>
          <div v-for="entry in arpTableA" :key="entry.ip">{{ entry.ip }} -> {{ entry.mac }}</div>
        </div>
      </div>

      <div class="host" style="left: 50%">
        <div class="icon">💻</div>
        <div class="name">Host B</div>
        <div class="detail">IP: 10.0.0.2<br>MAC: BB:BB</div>
      </div>

      <div class="host" style="left: 90%">
        <div class="icon">💻</div>
        <div class="name">Host C</div>
        <div class="detail">IP: 10.0.0.3<br>MAC: CC:CC</div>
      </div>

      <!-- Packets -->
      <div v-for="pkt in packets" :key="pkt.id" 
           class="packet" 
           :data-id="pkt.id"
           :class="pkt.type"
           :style="{ left: pkt.x + '%', top: '50px' }">
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

const isBusy = ref(false)
const packets = ref<any[]>([])
const logs = ref<{time: string, msg: string}[]>([])
const arpTableA = ref<{ip: string, mac: string}[]>([])

let packetId = 0

const addLog = (msg: string) => {
  const time = new Date().toLocaleTimeString().split(' ')[0]
  logs.value.unshift({ time, msg })
}

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms))

const spawnPacket = async (fromX: number, toX: number, type: 'broadcast' | 'unicast') => {
  const id = packetId++
  const pkt = { id, x: fromX, type }
  packets.value.push(pkt)
  
  // Wait for Vue render
  await sleep(0)
  
  // Force reflow
  const el = document.querySelector(`.packet[data-id="${id}"]`)
  if (el) void (el as HTMLElement).offsetHeight
  
  await new Promise(resolve => requestAnimationFrame(resolve))
  
  const reactivePkt = packets.value.find(p => p.id === id)
  if (reactivePkt) {
    reactivePkt.x = toX
  }
  
  await sleep(2000) // Slower animation (2s)
  
  packets.value = packets.value.filter(p => p.id !== id)
}

const startArp = async () => {
  if (isBusy.value) return
  isBusy.value = true
  reset()
  
  // 1. Broadcast Request
  addLog('Host A 广播 ARP 请求: "谁是 10.0.0.2? 请告诉 10.0.0.1"')
  
  // Spawn 2 packets from A to B and C
  const p1 = spawnPacket(10, 50, 'broadcast')
  const p2 = spawnPacket(10, 90, 'broadcast')
  await Promise.all([p1, p2])
  
  // 2. Host C ignores
  addLog('Host C: "IP 不匹配，忽略"')
  
  // 3. Host B replies
  addLog('Host B: "我是 10.0.0.2，我的 MAC 是 BB:BB"')
  await sleep(500)
  await spawnPacket(50, 10, 'unicast')
  
  // 4. Host A updates table
  addLog('Host A 收到响应，更新 ARP 缓存表')
  arpTableA.value.push({ ip: '10.0.0.2', mac: 'BB:BB' })
  
  isBusy.value = false
}

const reset = () => {
  packets.value = []
  logs.value = []
  arpTableA.value = []
  isBusy.value = false
}
</script>

<style scoped>
.arp-viz-container {
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

.network-diagram {
  height: 300px;
  position: relative;
  background: white;
  border: 1px solid #ddd;
  margin-bottom: 20px;
  padding-top: 50px; /* Space for packets */
}

.bus-line {
  position: absolute;
  top: 65px; /* Packet line */
  left: 5%;
  width: 90%;
  height: 4px;
  background: #333;
  border-radius: 2px;
}

.host {
  position: absolute;
  top: 100px;
  transform: translateX(-50%);
  text-align: center;
  width: 120px;
}
.host::before { /* Connection line */
  content: '';
  position: absolute;
  top: -35px;
  left: 50%;
  width: 2px;
  height: 35px;
  background: #333;
}

.icon { font-size: 40px; }
.name { font-weight: bold; margin: 5px 0; }
.detail { font-size: 11px; font-family: monospace; color: #666; background: #eee; padding: 4px; border-radius: 4px; }

.arp-table {
  margin-top: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
  padding: 5px;
  background: #fff9c4;
  font-size: 10px;
  text-align: left;
}
.table-title { font-weight: bold; border-bottom: 1px solid #ccc; margin-bottom: 2px; text-align: center; }
.empty { color: #999; font-style: italic; text-align: center; }

.packet {
  position: absolute;
  font-size: 24px;
  transform: translate(-50%, -50%);
  transition: left 2s linear, opacity 0.3s ease; /* Match new duration */
  z-index: 10;
}
.packet.broadcast { filter: drop-shadow(0 0 5px orange); }
.packet.unicast { filter: drop-shadow(0 0 5px blue); }

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
</style>
