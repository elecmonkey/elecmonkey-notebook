<template>
  <div class="ospf-viz-container">
    <div class="controls-bar">
      <div class="step-controls">
        <button class="btn" :class="{ active: currentPhase === 'hello' }" @click="runPhase('hello')" :disabled="isBusy || currentPhase !== 'idle'">1. 邻居发现 (Hello)</button>
        <button class="btn" :class="{ active: currentPhase === 'dr' }" @click="runPhase('dr')" :disabled="isBusy || currentPhase !== 'hello_done'">2. DR/BDR 选举</button>
        <button class="btn" :class="{ active: currentPhase === 'lsa' }" @click="runPhase('lsa')" :disabled="isBusy || currentPhase !== 'dr_done'">3. LSA 泛洪</button>
        <button class="btn" :class="{ active: currentPhase === 'spf' }" @click="runPhase('spf')" :disabled="isBusy || currentPhase !== 'lsa_done'">4. SPF 计算</button>
      </div>
      <button class="btn secondary" @click="reset" :disabled="isBusy">重置</button>
    </div>

    <div class="main-area">
      <!-- Topology Diagram -->
      <div class="topology-area">
        <svg width="100%" height="300" viewBox="0 0 600 300">
          <!-- Links -->
          <g v-for="link in links" :key="link.id">
            <line :x1="getRouter(link.u).x" :y1="getRouter(link.u).y"
                  :x2="getRouter(link.v).x" :y2="getRouter(link.v).y"
                  stroke="#999" stroke-width="2" />
            <text :x="(getRouter(link.u).x + getRouter(link.v).x)/2" 
                  :y="(getRouter(link.u).y + getRouter(link.v).y)/2 - 5" 
                  text-anchor="middle" font-size="10" fill="#666">{{ link.cost }}</text>
            
            <!-- Animated Packets -->
            <circle v-if="link.packet" r="5" fill="#ff5722">
              <animateMotion :dur="link.packet.duration" repeatCount="1" :path="`M${getRouter(link.packet.from).x},${getRouter(link.packet.from).y} L${getRouter(link.packet.to).x},${getRouter(link.packet.to).y}`" />
            </circle>
          </g>

          <!-- Broadcast Network Segment (Ethernet) -->
          <ellipse cx="150" cy="150" rx="100" ry="80" fill="rgba(66, 185, 131, 0.1)" stroke="#42b983" stroke-dasharray="5,5" />
          <text x="150" y="250" text-anchor="middle" fill="#42b983" font-size="12">Area 0 (Broadcast)</text>

          <!-- Routers -->
          <g v-for="r in routers" :key="r.id" class="router-node" :transform="`translate(${r.x}, ${r.y})`">
            <circle r="20" :fill="getRouterColor(r)" stroke="#333" stroke-width="2" />
            <text dy="5" text-anchor="middle" fill="white" font-weight="bold" font-size="12">{{ r.name }}</text>
            <!-- Role Badge -->
            <rect v-if="r.role" x="-15" y="-35" width="30" height="14" rx="4" fill="#333" opacity="0.8" />
            <text v-if="r.role" x="0" y="-25" text-anchor="middle" fill="white" font-size="9">{{ r.role }}</text>
          </g>
        </svg>
      </div>

      <!-- Info Panels -->
      <div class="info-panels">
        <div class="panel lsdb-panel">
          <h4>LSDB (R1 View)</h4>
          <table>
            <thead><tr><th>Router ID</th><th>Seq</th><th>Links</th></tr></thead>
            <tbody>
              <tr v-for="lsa in lsdb" :key="lsa.advRouter">
                <td>{{ lsa.advRouter }}</td>
                <td>{{ lsa.seq }}</td>
                <td>{{ lsa.links }}</td>
              </tr>
              <tr v-if="lsdb.length === 0"><td colspan="3" class="empty">Empty</td></tr>
            </tbody>
          </table>
        </div>
        <div class="panel route-panel">
          <h4>Routing Table (R1)</h4>
          <table>
            <thead><tr><th>Dest</th><th>Next Hop</th><th>Cost</th></tr></thead>
            <tbody>
              <tr v-for="route in routingTable" :key="route.dest">
                <td>{{ route.dest }}</td>
                <td>{{ route.nextHop }}</td>
                <td>{{ route.cost }}</td>
              </tr>
              <tr v-if="routingTable.length === 0"><td colspan="3" class="empty">Calculated after SPF</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <div class="log-area" ref="logContainer">
      <div v-for="(log, i) in logs" :key="i" class="log-line">
        <span class="time">[{{ log.time }}]</span> {{ log.msg }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, nextTick } from 'vue'

const isBusy = ref(false)
const currentPhase = ref('idle') // idle, hello, hello_done, dr, dr_done, lsa, lsa_done, spf, spf_done
const logs = ref<{time: string, msg: string}[]>([])
const logContainer = ref<HTMLElement | null>(null)

// Topology Data
const routers = reactive([
  { id: 'r1', name: 'R1', x: 100, y: 100, role: '', color: '#546e7a' },
  { id: 'r2', name: 'R2', x: 200, y: 100, role: '', color: '#546e7a' },
  { id: 'r3', name: 'R3', x: 150, y: 200, role: '', color: '#546e7a' }, // Gateway to Area 1
  { id: 'r4', name: 'R4', x: 350, y: 150, role: '', color: '#546e7a' },
  { id: 'r5', name: 'R5', x: 500, y: 150, role: '', color: '#546e7a' }
])

const links = reactive([
  // Broadcast Segment (Mesh for simulation simplicity)
  { id: 'l1', u: 'r1', v: 'r2', cost: 1, type: 'broadcast', packet: null as any },
  { id: 'l2', u: 'r2', v: 'r3', cost: 1, type: 'broadcast', packet: null as any },
  { id: 'l3', u: 'r3', v: 'r1', cost: 1, type: 'broadcast', packet: null as any },
  // P2P
  { id: 'l4', u: 'r2', v: 'r4', cost: 10, type: 'p2p', packet: null as any },
  { id: 'l5', u: 'r4', v: 'r5', cost: 5, type: 'p2p', packet: null as any }
])

const lsdb = ref<{advRouter: string, seq: string, links: string}[]>([])
const routingTable = ref<{dest: string, nextHop: string, cost: number}[]>([])

const getRouter = (id: string) => routers.find(r => r.id === id)!
const getRouterColor = (r: any) => {
  if (r.role === 'DR') return '#e53935' // Red
  if (r.role === 'BDR') return '#fb8c00' // Orange
  return '#1e88e5' // Blue
}

const addLog = (msg: string) => {
  const time = new Date().toLocaleTimeString().split(' ')[0]
  logs.value.push({ time, msg })
  nextTick(() => {
    if (logContainer.value) logContainer.value.scrollTop = logContainer.value.scrollHeight
  })
}

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms))

const animatePacket = async (linkId: string, from: string, to: string, duration = '1s') => {
  const link = links.find(l => l.id === linkId)!
  link.packet = { from, to, duration }
  await sleep(1000)
  link.packet = null
}

const runPhase = async (phase: string) => {
  if (isBusy.value) return
  isBusy.value = true
  currentPhase.value = phase

  if (phase === 'hello') {
    addLog('开始发送 Hello 报文...')
    // Sim: Broadcast Hello
    await Promise.all([
      animatePacket('l1', 'r1', 'r2'),
      animatePacket('l2', 'r2', 'r3'),
      animatePacket('l3', 'r3', 'r1')
    ])
    addLog('R1, R2, R3 发现彼此 (2-Way State)')
    await sleep(500)
    addLog('建立邻接关系 (Full State)')
    currentPhase.value = 'hello_done'
  } 
  else if (phase === 'dr') {
    addLog('进入 DR/BDR 选举阶段...')
    await sleep(1000)
    addLog('比较优先级(默认1) -> 比较 Router ID')
    addLog('R3 (ID highest?) -> 假设 R2 ID 最大 (2.2.2.2)')
    
    // Hardcode election result for demo
    getRouter('r2').role = 'DR'
    addLog('R2 当选 DR (Designated Router)')
    await sleep(500)
    
    getRouter('r3').role = 'BDR'
    addLog('R3 当选 BDR (Backup DR)')
    
    getRouter('r1').role = 'DROther'
    addLog('R1 为 DROther')
    
    currentPhase.value = 'dr_done'
  }
  else if (phase === 'lsa') {
    addLog('LSA 泛洪开始...')
    // R4 updates LSA
    addLog('R4 产生 LSA: Link to R2(10), R5(5)')
    await animatePacket('l4', 'r4', 'r2')
    addLog('DR (R2) 收到 R4 LSA，向广播域泛洪')
    
    // DR floods
    await Promise.all([
      animatePacket('l1', 'r2', 'r1'),
      animatePacket('l2', 'r2', 'r3')
    ])
    
    // Update LSDB
    lsdb.value = [
      { advRouter: 'R1', seq: '0x800001', links: 'R2, R3' },
      { advRouter: 'R2', seq: '0x800002', links: 'R1, R3, R4' },
      { advRouter: 'R3', seq: '0x800001', links: 'R1, R2' },
      { advRouter: 'R4', seq: '0x800001', links: 'R2, R5' },
      { advRouter: 'R5', seq: '0x800001', links: 'R4' }
    ]
    addLog('LSDB 同步完成 (All routers consistent)')
    currentPhase.value = 'lsa_done'
  }
  else if (phase === 'spf') {
    addLog('运行 Dijkstra 算法 (Root: R1)...')
    await sleep(500)
    addLog('1. Init: R1(0), others(inf)')
    addLog('2. Visit R1 -> Neighbors: R2(1), R3(1)')
    addLog('3. Visit R2 -> Neighbors: R4(1+10=11)')
    addLog('4. Visit R3 -> (No better path to R2)')
    addLog('5. Visit R4 -> Neighbors: R5(11+5=16)')
    
    routingTable.value = [
      { dest: 'R2', nextHop: 'Direct', cost: 1 },
      { dest: 'R3', nextHop: 'Direct', cost: 1 },
      { dest: 'R4', nextHop: 'R2', cost: 11 },
      { dest: 'R5', nextHop: 'R2', cost: 16 }
    ]
    addLog('路由表生成完毕')
    currentPhase.value = 'spf_done'
  }

  isBusy.value = false
}

const reset = () => {
  currentPhase.value = 'idle'
  logs.value = []
  lsdb.value = []
  routingTable.value = []
  routers.forEach(r => r.role = '')
}
</script>

<style scoped>
.ospf-viz-container {
  border: 1px solid #eee;
  border-radius: 8px;
  padding: 15px;
  background: #f9f9f9;
}
.controls-bar {
  display: flex;
  justify-content: space-between;
  margin-bottom: 15px;
  flex-wrap: wrap;
  gap: 10px;
}
.step-controls {
  display: flex;
  gap: 5px;
}
.btn {
  padding: 6px 12px;
  border: 1px solid #ddd;
  background: white;
  cursor: pointer;
  border-radius: 4px;
  font-size: 12px;
}
.btn.active {
  background: #42b983;
  color: white;
  border-color: #42b983;
}
.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.secondary {
  background: #909399;
  color: white;
}

.main-area {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.topology-area {
  background: white;
  border: 1px solid #eee;
  border-radius: 4px;
}

.info-panels {
  display: flex;
  gap: 15px;
}
.panel {
  flex: 1;
  background: white;
  padding: 10px;
  border: 1px solid #eee;
  border-radius: 4px;
}
.panel h4 { margin: 0 0 10px 0; font-size: 14px; }
table { width: 100%; border-collapse: collapse; font-size: 12px; }
th, td { border: 1px solid #eee; padding: 4px; text-align: left; }
th { background: #f5f5f5; }
.empty { text-align: center; color: #999; }

.log-area {
  margin-top: 15px;
  height: 120px;
  background: #333;
  color: #eee;
  padding: 10px;
  overflow-y: auto;
  font-family: monospace;
  font-size: 12px;
  border-radius: 4px;
}
.log-line { margin-bottom: 2px; }
.time { color: #888; }
</style>
