<template>
  <div class="bgp-viz-container">
    <div class="controls-bar">
      <button class="btn" :class="{ active: step === 1 }" @click="nextStep" :disabled="isBusy || step >= 4">
        {{ step === 0 ? 'Start BGP' : step === 1 ? 'Next: Advertise' : step === 2 ? 'Next: Propagate' : 'Finish' }}
      </button>
      <button class="btn secondary" @click="reset" :disabled="isBusy">Reset</button>
      <div class="step-desc">{{ stepDescriptions[step] }}</div>
    </div>

    <div class="diagram-area">
      <!-- AS Areas -->
      <div class="as-box" style="left: 5%; width: 20%; border-color: #e91e63;">
        <span class="as-label">AS 100</span>
      </div>
      <div class="as-box" style="left: 30%; width: 35%; border-color: #2196f3;">
        <span class="as-label">AS 200</span>
      </div>
      <div class="as-box" style="left: 70%; width: 20%; border-color: #ff9800;">
        <span class="as-label">AS 300</span>
      </div>

      <!-- Routers -->
      <div class="router" style="left: 15%; top: 50%" id="r1">R1</div>
      <div class="router" style="left: 40%; top: 50%" id="r2">R2</div>
      <div class="router" style="left: 55%; top: 50%" id="r3">R3</div>
      <div class="router" style="left: 80%; top: 50%" id="r4">R4</div>

      <!-- Links (SVG Overlay) -->
      <svg class="links-overlay">
        <!-- eBGP R1-R2 -->
        <line x1="15%" y1="50%" x2="40%" y2="50%" class="link" :class="{ active: step >= 1 }" />
        <!-- iBGP R2-R3 -->
        <line x1="40%" y1="50%" x2="55%" y2="50%" class="link dashed" :class="{ active: step >= 1 }" />
        <!-- eBGP R3-R4 -->
        <line x1="55%" y1="50%" x2="80%" y2="50%" class="link" :class="{ active: step >= 1 }" />
      </svg>

      <!-- Messages -->
      <transition-group name="fade">
        <div v-for="msg in messages" :key="msg.id" class="bgp-msg" 
             :style="{ left: msg.left + '%', top: '40%' }">
          Update
        </div>
      </transition-group>
    </div>

    <!-- BGP Table (Dynamic View) -->
    <div class="table-container">
      <div class="table-header">
        <span class="router-selector">
          Viewing BGP Table of: 
          <select v-model="selectedRouter">
            <option value="r1">R1 (AS 100)</option>
            <option value="r2">R2 (AS 200)</option>
            <option value="r3">R3 (AS 200)</option>
            <option value="r4">R4 (AS 300)</option>
          </select>
        </span>
      </div>
      <table class="bgp-table">
        <thead>
          <tr>
            <th>Network</th>
            <th>Next Hop</th>
            <th>AS Path</th>
            <th>Local Pref</th>
            <th>State</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="entry in currentTable" :key="entry.net">
            <td>{{ entry.net }}</td>
            <td>{{ entry.nextHop }}</td>
            <td>{{ entry.asPath }}</td>
            <td>{{ entry.localPref }}</td>
            <td>
              <span class="badge valid">Valid</span>
              <span v-if="entry.best" class="badge best">Best ></span>
            </td>
          </tr>
          <tr v-if="currentTable.length === 0">
            <td colspan="5" class="empty">No routes received yet</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="logs">
      <div v-for="(log, i) in logs" :key="i">{{ log }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const step = ref(0)
const isBusy = ref(false)
const selectedRouter = ref('r1')
const logs = ref<string[]>([])
const messages = ref<{id: number, left: number}[]>([])

const stepDescriptions = [
  'Ready to start.',
  'Step 1: Establish BGP Sessions (eBGP & iBGP)',
  'Step 2: R1 advertises 1.0.0.0/8 to R2',
  'Step 3: R2 propagates to R3 (iBGP)',
  'Step 4: R3 propagates to R4 (eBGP)'
]

// Data Model
interface BgpRoute { net: string, nextHop: string, asPath: string, localPref: number, best: boolean }
const tables = ref<Record<string, BgpRoute[]>>({
  r1: [],
  r2: [],
  r3: [],
  r4: []
})

// Initial State
tables.value.r1 = [{ net: '1.0.0.0/8', nextHop: '0.0.0.0', asPath: '', localPref: 100, best: true }]

const currentTable = computed(() => tables.value[selectedRouter.value] || [])

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms))

const nextStep = async () => {
  if (isBusy.value) return
  isBusy.value = true
  step.value++

  if (step.value === 1) {
    logs.value.push('Sessions established: R1-R2 (eBGP), R2-R3 (iBGP), R3-R4 (eBGP)')
  }
  else if (step.value === 2) {
    logs.value.push('R1 sends Update to R2: Prefix 1.0.0.0/8, AS-Path [100]')
    messages.value.push({ id: 1, left: 15 })
    // Animate
    for(let i=15; i<=40; i+=2) {
      messages.value[0].left = i
      await sleep(50)
    }
    messages.value = []
    
    // Update R2 Table
    tables.value.r2.push({
      net: '1.0.0.0/8',
      nextHop: '10.1.1.1 (R1)', // Logic Next Hop
      asPath: '100',
      localPref: 100,
      best: true
    })
    selectedRouter.value = 'r2'
  }
  else if (step.value === 3) {
    logs.value.push('R2 propagates to R3 (iBGP): Next-Hop Unchanged, AS-Path Unchanged')
    messages.value.push({ id: 2, left: 40 })
    for(let i=40; i<=55; i+=2) {
      messages.value[0].left = i
      await sleep(50)
    }
    messages.value = []

    // Update R3 Table
    tables.value.r3.push({
      net: '1.0.0.0/8',
      nextHop: '10.1.1.1 (R1)', // iBGP preserves Next Hop usually
      asPath: '100',
      localPref: 100,
      best: true
    })
    selectedRouter.value = 'r3'
  }
  else if (step.value === 4) {
    logs.value.push('R3 propagates to R4 (eBGP): Prepend AS 200, Set Next-Hop to Self')
    messages.value.push({ id: 3, left: 55 })
    for(let i=55; i<=80; i+=2) {
      messages.value[0].left = i
      await sleep(50)
    }
    messages.value = []

    // Update R4 Table
    tables.value.r4.push({
      net: '1.0.0.0/8',
      nextHop: '20.1.1.2 (R3)',
      asPath: '200 100',
      localPref: 100,
      best: true
    })
    selectedRouter.value = 'r4'
  }

  isBusy.value = false
}

const reset = () => {
  step.value = 0
  logs.value = []
  tables.value = {
    r1: [{ net: '1.0.0.0/8', nextHop: '0.0.0.0', asPath: '', localPref: 100, best: true }],
    r2: [], r3: [], r4: []
  }
  selectedRouter.value = 'r1'
}
</script>

<style scoped>
.bgp-viz-container {
  border: 1px solid #eee;
  padding: 20px;
  background: white;
  font-family: sans-serif;
}
.controls-bar {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 20px;
}
.step-desc { font-weight: bold; color: #666; margin-left: auto; }
.diagram-area {
  position: relative;
  height: 200px;
  border: 1px solid #eee;
  margin-bottom: 20px;
  background: #fafafa;
}
.as-box {
  position: absolute;
  top: 10px; bottom: 10px;
  border: 2px dashed;
  border-radius: 8px;
  background: rgba(255,255,255,0.5);
}
.as-label {
  position: absolute;
  top: 5px; left: 5px;
  font-weight: bold;
  font-size: 12px;
  color: #666;
}
.router {
  position: absolute;
  width: 30px; height: 30px;
  background: #333;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  transform: translate(-50%, -50%);
  z-index: 2;
  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
}
.links-overlay {
  position: absolute;
  width: 100%; height: 100%;
  z-index: 1;
}
.link {
  stroke: #ddd;
  stroke-width: 2;
  transition: stroke 0.5s;
}
.link.active { stroke: #333; }
.link.dashed { stroke-dasharray: 4,4; }

.bgp-msg {
  position: absolute;
  background: #ff5722;
  color: white;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 10px;
  transform: translate(-50%, -50%);
  z-index: 10;
}

.table-container {
  border: 1px solid #eee;
  border-radius: 4px;
  padding: 10px;
}
.table-header { margin-bottom: 10px; }
.bgp-table { width: 100%; border-collapse: collapse; font-size: 13px; }
.bgp-table th, .bgp-table td { border: 1px solid #eee; padding: 6px; text-align: left; }
.bgp-table th { background: #f5f5f5; }
.badge { padding: 2px 4px; border-radius: 2px; font-size: 10px; color: white; margin-right: 4px; }
.badge.valid { background: #999; }
.badge.best { background: #4caf50; }

.logs {
  margin-top: 10px;
  padding: 10px;
  background: #f5f5f5;
  font-family: monospace;
  font-size: 12px;
  color: #666;
  max-height: 100px;
  overflow-y: auto;
}
.btn {
  padding: 6px 12px;
  background: #2196f3;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
.btn.secondary { background: #999; }
.btn:disabled { opacity: 0.5; cursor: not-allowed; }
</style>
