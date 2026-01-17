<template>
  <div class="arp-viz-container">
    <div class="controls-bar">
      <button class="btn primary" @click="startArp" :disabled="isBusy">Host A 请求 Host B 的 MAC</button>
      <button class="btn secondary" @click="() => reset()" :disabled="isBusy">重置</button>
    </div>

    <div class="network-diagram">
      <!-- Bus/Switch Line -->
      <div class="bus-line"></div>

      <!-- Hosts -->
      <div v-for="host in hosts" :key="host.id" 
           class="host" 
           :style="{ left: host.x + '%' }">
        <div class="icon">💻</div>
        <div class="name">Host {{ host.id }}</div>
        <div class="detail">
          IP: {{ host.ip }}<br>
          MAC: {{ host.mac }}
        </div>
        
        <!-- ARP Table for EACH host -->
        <div class="arp-table">
          <div class="table-title">ARP Table</div>
          <div v-if="host.arpTable.length === 0" class="empty">Empty</div>
          <div v-for="entry in host.arpTable" :key="entry.ip" class="arp-entry">
            {{ entry.ip }} → {{ entry.mac }}
          </div>
        </div>
      </div>

      <!-- Packets -->
      <div v-for="pkt in packets" :key="pkt.id" 
           class="packet" 
           :data-id="pkt.id"
           :class="[pkt.type, { arrived: pkt.isArrived }]"
           :style="{ 
             left: pkt.x + '%', 
             top: '105px',
             transition: `left ${animationDuration}s linear, transform 0.5s ease, opacity 0.5s ease`
           }">
        <div class="packet-icon">✉️</div>
        <div class="packet-info">
          <div class="pkt-type">{{ pkt.label }}</div>
          <div class="pkt-detail">Src: {{ pkt.srcIp }}</div>
          <div class="pkt-detail">Dst: {{ pkt.dstIp }}</div>
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
import { ref, reactive } from 'vue'

interface ArpEntry {
  ip: string
  mac: string
}

interface Host {
  id: string
  ip: string
  mac: string
  x: number
  arpTable: ArpEntry[]
}

interface Packet {
  id: number
  x: number
  type: 'broadcast' | 'unicast'
  label: string
  srcIp: string
  dstIp: string
  payload?: string
  isArrived?: boolean
}

const isBusy = ref(false)
const animationDuration = ref(2) // Normal speed (2s)

// Define 5 Hosts
const hosts = ref<Host[]>([
  { id: 'A', ip: '10.0.0.1', mac: 'AA:AA', x: 10, arpTable: [] },
  { id: 'B', ip: '10.0.0.2', mac: 'BB:BB', x: 30, arpTable: [] },
  { id: 'C', ip: '10.0.0.3', mac: 'CC:CC', x: 50, arpTable: [] },
  { id: 'D', ip: '10.0.0.4', mac: 'DD:DD', x: 70, arpTable: [] },
  { id: 'E', ip: '10.0.0.5', mac: 'EE:EE', x: 90, arpTable: [] }
])

const packets = ref<Packet[]>([])
const logs = ref<{time: string, msg: string}[]>([])

let packetId = 0

const addLog = (msg: string) => {
  const time = new Date().toLocaleTimeString().split(' ')[0]
  logs.value.unshift({ time, msg })
}

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms))

const spawnPacket = async (
  fromHost: Host, 
  toHost: Host | null, // null for broadcast
  type: 'broadcast' | 'unicast',
  label: string
) => {
  const id = packetId++
  const targetX = toHost ? toHost.x : (fromHost.x < 50 ? 95 : 5) // Simple broadcast direction logic
  
  // For broadcast, we might need multiple packets visually or just one moving across?
  // Ideally, a broadcast goes to ALL.
  // Let's simplify: A broadcast spawns multiple packets from Source to All other Hosts.
  
  const packetPromises: Promise<void>[] = []

  if (type === 'broadcast') {
    // Spawn a packet for EACH other host
    hosts.value.forEach(h => {
      if (h.id === fromHost.id) return
      
      packetPromises.push(animatePacket(fromHost, h, type, label))
    })
  } else if (toHost) {
    packetPromises.push(animatePacket(fromHost, toHost, type, label))
  }
  
  await Promise.all(packetPromises)
}

const animatePacket = async (from: Host, to: Host, type: 'broadcast' | 'unicast', label: string) => {
  const id = packetId++
  const pkt: Packet = {
    id,
    x: from.x,
    type,
    label,
    srcIp: from.ip,
    dstIp: type === 'broadcast' ? 'Broadcast' : to.ip
  }
  
  packets.value.push(pkt)
  
  // Wait for Vue render
  await sleep(20)
  
  // Force reflow not strictly needed with Vue usually, but safe
  
  // Move packet
  const reactivePkt = packets.value.find(p => p.id === id)
  if (reactivePkt) {
    reactivePkt.x = to.x
  }
  
  // Wait for animation
  await sleep(animationDuration.value * 1000)

  // Stay for 1s
  await sleep(1000)

  // Arrival Animation (Absorb/Fade)
  if (reactivePkt) {
    reactivePkt.isArrived = true // Trigger fade/scale out
  }
  await sleep(500) // Wait for fade out
  
  // Packet Arrived - Handle Logic
  handlePacketArrival(to, from, type)
  
  // Remove packet
  packets.value = packets.value.filter(p => p.id !== id)
}

const handlePacketArrival = (receiver: Host, sender: Host, type: 'broadcast' | 'unicast') => {
  // Logic: When receiving an ARP packet, update ARP table?
  // Standard ARP:
  // 1. If I am the target, I reply. And I update my table with sender info.
  // 2. If I am NOT the target, but I have sender in my cache, I update it.
  // 3. (Gratuitous/Optimization) Some implementations update cache on broadcast even if not target.
  // User requested: "Update B C ARP table" (implying everyone learns from broadcast).
  
  // So we will implement: Everyone who hears the broadcast learns Sender's MAC.
  
  const existingEntry = receiver.arpTable.find(e => e.ip === sender.ip)
  
  if (!existingEntry) {
    receiver.arpTable.push({ ip: sender.ip, mac: sender.mac })
    addLog(`Host ${receiver.id} 收到报文，学习到 ${sender.ip} is at ${sender.mac}`)
  } else {
    // Refresh?
  }
}

const startArp = async () => {
  if (isBusy.value) return
  isBusy.value = true
  reset(false) // Don't clear logs
  
  const hostA = hosts.value.find(h => h.id === 'A')!
  const hostB = hosts.value.find(h => h.id === 'B')!
  
  // 1. Broadcast Request
  addLog(`Host A 广播 ARP 请求: "谁是 ${hostB.ip}? 请告诉 ${hostA.ip}"`)
  
  await spawnPacket(hostA, null, 'broadcast', 'ARP Request')
  
  // 2. Logic processing (visualized via handlePacketArrival callbacks roughly)
  // But we need to orchestrate the Reply.
  
  // After broadcast finishes (spawnPacket awaits all), only B should reply.
  addLog('Host C, D, E: "不是找我，丢弃但更新缓存"')
  addLog(`Host B: "是找我! 准备单播响应"`)
  
  await sleep(1000)
  
  // 3. Unicast Reply B -> A
  addLog(`Host B 单播响应 Host A: "我是 ${hostB.ip}, MAC 是 ${hostB.mac}"`)
  await spawnPacket(hostB, hostA, 'unicast', 'ARP Reply')
  
  isBusy.value = false
}

const reset = (clearLogs = true) => {
  packets.value = []
  if (clearLogs) logs.value = []
  isBusy.value = false
  hosts.value.forEach(h => h.arpTable = [])
}
</script>

<style scoped>
.arp-viz-container {
  border: 1px solid #eee;
  border-radius: 8px;
  padding: 20px;
  background: #f9f9f9;
  font-family: sans-serif;
  user-select: none;
}
.controls-bar {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;
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
  height: 400px;
  position: relative;
  background: white;
  border: 1px solid #ddd;
  margin-bottom: 20px;
  padding-top: 50px;
  overflow: hidden;
}

.bus-line {
  position: absolute;
  top: 120px;
  left: 2%;
  width: 96%;
  height: 4px;
  background: #333;
  border-radius: 2px;
}

.host {
  position: absolute;
  top: 155px;
  transform: translateX(-50%);
  text-align: center;
  width: 100px; /* Narrower to fit 5 hosts */
  display: flex;
  flex-direction: column;
  align-items: center;
}
.host::before {
  content: '';
  position: absolute;
  top: -35px;
  left: 50%;
  width: 2px;
  height: 35px;
  background: #333;
}

.icon { font-size: 32px; }
.name { font-weight: bold; margin: 2px 0; font-size: 12px; }
.detail { 
  font-size: 10px; 
  font-family: monospace; 
  color: #666; 
  background: #eee; 
  padding: 2px 4px; 
  border-radius: 4px;
  margin-bottom: 4px;
  width: 100%;
}

.arp-table {
  width: 100%;
  border: 1px solid #ccc;
  border-radius: 4px;
  padding: 2px;
  background: #fff9c4;
  font-size: 9px;
  text-align: left;
  min-height: 20px;
}
.table-title { font-weight: bold; border-bottom: 1px solid #eee; margin-bottom: 2px; text-align: center; font-size: 9px; }
.empty { color: #999; font-style: italic; text-align: center; }
.arp-entry { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

.packet {
  position: absolute;
  transform: translate(-50%, -50%);
  z-index: 10;
  display: flex;
  flex-direction: column;
  align-items: center;
  pointer-events: none;
  transition: transform 0.5s ease, opacity 0.5s ease; /* Add transition for arrival animation */
}
.packet.arrived {
  transform: translate(-50%, -50%) scale(0.1);
  opacity: 0;
}
.packet-icon {
  font-size: 24px;
}
.packet-info {
  background: rgba(0,0,0,0.8);
  color: white;
  padding: 4px 6px;
  border-radius: 4px;
  font-size: 10px;
  white-space: nowrap;
  margin-top: 2px;
}
.pkt-type { font-weight: bold; color: #fbbf24; margin-bottom: 2px; }
.packet.broadcast .packet-icon { filter: drop-shadow(0 0 5px orange); }
.packet.unicast .packet-icon { filter: drop-shadow(0 0 5px blue); }

.status-log {
  min-height: 150px;
  max-height: 200px;
  overflow-y: auto;
  background: #282c34;
  color: #abb2bf;
  padding: 10px;
  border-radius: 4px;
  font-family: monospace;
  font-size: 13px;
}
.log-entry { margin-bottom: 4px; border-bottom: 1px solid #3e4451; padding-bottom: 2px; }
.time { color: #61afef; margin-right: 8px; }
</style>
