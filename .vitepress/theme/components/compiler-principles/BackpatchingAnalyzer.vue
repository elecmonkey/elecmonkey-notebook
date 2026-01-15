<script setup lang="ts">
import { ref, computed } from 'vue'

interface Instruction {
  id: number
  code: string
  target: string // 跳转目标，可能是 _?_ 或具体行号
  isFilled: boolean
}

// 示例布尔表达式
// if (a < b || c > d && e != f)
const expression = ref('a < b || c > d && e != f')
const instructions = ref<Instruction[]>([])
const currentStep = ref(0)
const steps = ref<{ desc: string, action: () => void }[]>([])

// 模拟回填过程
function initSimulation() {
  instructions.value = []
  steps.value = []
  currentStep.value = 0
  
  // 1. 生成初始代码 (带有空跳转)
  // E -> E1 || E2
  // E1: a < b
  // E2: E3 && E4
  // E3: c > d
  // E4: e != f
  
  // 代码生成逻辑：
  // 100: if a < b goto _?_ (TrueList of E1)
  // 101: goto _?_        (FalseList of E1)
  // 102: if c > d goto _?_ (TrueList of E3)
  // 103: goto _?_        (FalseList of E3)
  // 104: if e != f goto _?_ (TrueList of E4)
  // 105: goto _?_        (FalseList of E4)
  
  instructions.value = [
    { id: 100, code: 'if a < b goto', target: '_?_', isFilled: false },
    { id: 101, code: 'goto', target: '_?_', isFilled: false },
    { id: 102, code: 'if c > d goto', target: '_?_', isFilled: false },
    { id: 103, code: 'goto', target: '_?_', isFilled: false },
    { id: 104, code: 'if e != f goto', target: '_?_', isFilled: false },
    { id: 105, code: 'goto', target: '_?_', isFilled: false },
  ]
  
  // 2. 构建步骤
  
  // Step 1: 分析 E1 (a < b)
  steps.value.push({
    desc: '生成 E1 (a < b) 的跳转指令。E1.true={100}, E1.false={101}',
    action: () => {}
  })

  // Step 2: 遇到 ||，回填 E1.false
  // M = 102 (E2 的起始地址)
  // Backpatch(E1.false, 102)
  steps.value.push({
    desc: '解析 OR (||)：E1 为假时应检查 E2。回填 E1.false ({101}) -> 102',
    action: () => {
      instructions.value[1].target = '102'
      instructions.value[1].isFilled = true
    }
  })
  
  // Step 3: 分析 E3 (c > d)
  steps.value.push({
    desc: '生成 E3 (c > d) 的跳转指令。E3.true={102}, E3.false={103}',
    action: () => {}
  })
  
  // Step 4: 遇到 &&，回填 E3.true
  // M = 104 (E4 的起始地址)
  // Backpatch(E3.true, 104)
  steps.value.push({
    desc: '解析 AND (&&)：E3 为真时应检查 E4。回填 E3.true ({102}) -> 104',
    action: () => {
      instructions.value[2].target = '104'
      instructions.value[2].isFilled = true
    }
  })
  
  // Step 5: 分析 E4 (e != f)
  steps.value.push({
    desc: '生成 E4 (e != f) 的跳转指令。E4.true={104}, E4.false={105}',
    action: () => {}
  })
  
  // Step 6: 合并 E2 的链
  // E2 = E3 && E4
  // E2.true = E4.true = {104}
  // E2.false = E3.false U E4.false = {103, 105}
  steps.value.push({
    desc: '计算 E2 (E3 && E4) 的链：E2.true={104}, E2.false={103, 105}',
    action: () => {}
  })
  
  // Step 7: 合并 E 的链
  // E = E1 || E2
  // E.true = E1.true U E2.true = {100, 104}
  // E.false = E2.false = {103, 105}
  steps.value.push({
    desc: '计算 E (E1 || E2) 的链：E.true={100, 104}, E.false={103, 105}',
    action: () => {}
  })
  
  // Step 8: 假设这是 if (E) S，回填 E.true -> S.begin (106)
  steps.value.push({
    desc: '进入 if 语句体 (S)：回填 E.true ({100, 104}) -> 106 (S 的入口)',
    action: () => {
      instructions.value[0].target = '106'
      instructions.value[0].isFilled = true
      instructions.value[4].target = '106'
      instructions.value[4].isFilled = true
    }
  })
  
  // Step 9: 回填 E.false -> Next (例如 200)
  steps.value.push({
    desc: '跳出 if 语句：回填 E.false ({103, 105}) -> 200 (后续代码)',
    action: () => {
      instructions.value[3].target = '200'
      instructions.value[3].isFilled = true
      instructions.value[5].target = '200'
      instructions.value[5].isFilled = true
    }
  })
}

function nextStep() {
  if (currentStep.value < steps.value.length) {
    steps.value[currentStep.value].action()
    currentStep.value++
  }
}

function reset() {
  initSimulation()
}

initSimulation()
</script>

<template>
  <div class="backpatching-analyzer">
    <div class="header">
      <h3>布尔表达式：<code>{{ expression }}</code></h3>
      <div class="status">
        <span class="label">当前步骤：</span>
        <span class="desc">{{ currentStep > 0 ? steps[currentStep-1].desc : '准备开始...' }}</span>
      </div>
      <div class="controls">
        <button class="primary" @click="nextStep" :disabled="currentStep >= steps.length">下一步</button>
        <button @click="reset">重置</button>
      </div>
    </div>

    <div class="visualization">
      <div class="code-list">
        <div 
          v-for="inst in instructions" 
          :key="inst.id"
          class="inst-row"
          :class="{ 'filled': inst.isFilled }"
        >
          <span class="id">({{ inst.id }})</span>
          <span class="code">{{ inst.code }}</span>
          <span class="target" :class="{ 'placeholder': !inst.isFilled }">{{ inst.target }}</span>
        </div>
        <!-- 模拟后续代码块 -->
        <div class="inst-row future">
          <span class="id">(106)</span>
          <span class="code">... if body ...</span>
        </div>
        <div class="inst-row future">
          <span class="id">...</span>
        </div>
        <div class="inst-row future">
          <span class="id">(200)</span>
          <span class="code">... next stmt ...</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.backpatching-analyzer {
  display: flex;
  flex-direction: column;
  gap: 20px;
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  padding: 20px;
}

.header {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

h3 {
  margin: 0;
  font-family: monospace;
  background: var(--vp-c-bg);
  padding: 8px;
  border-radius: 4px;
}

.status {
  background: var(--vp-c-bg-alt);
  padding: 12px;
  border-left: 4px solid var(--vp-c-brand-1);
  border-radius: 4px;
}

.status .label {
  font-weight: bold;
  color: var(--vp-c-text-2);
}

.status .desc {
  color: var(--vp-c-text-1);
}

.controls {
  display: flex;
  gap: 12px;
}

button {
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg);
}

button.primary {
  background: var(--vp-c-brand-1);
  color: white;
  border: none;
}

button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.code-list {
  background: var(--vp-c-bg);
  border: 1px solid var(--vp-c-divider);
  border-radius: 4px;
  padding: 20px;
  font-family: monospace;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.inst-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px;
  border-radius: 4px;
  transition: all 0.3s;
}

.inst-row.filled {
  background: #f0fdf4; /* Green tint */
}

.inst-row.future {
  opacity: 0.5;
  border-top: 1px dashed var(--vp-c-divider);
}

.id {
  color: var(--vp-c-text-3);
  width: 50px;
}

.code {
  font-weight: bold;
  color: var(--vp-c-text-1);
}

.target {
  font-weight: bold;
  color: var(--vp-c-brand-1);
  min-width: 40px;
  text-align: center;
}

.target.placeholder {
  color: var(--vp-c-red-1);
  background: var(--vp-c-red-soft);
  padding: 2px 6px;
  border-radius: 4px;
}
</style>
