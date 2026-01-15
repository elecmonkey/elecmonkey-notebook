<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { simulateBackpatching, type BPInstruction, type BPStep } from './utils/backpatching-algo'

// 示例布尔表达式
const expression = ref('a < b || c > d && e != f')
const instructions = ref<BPInstruction[]>([])
const currentStep = ref(0)
const steps = ref<{ desc: string, action: (insts: BPInstruction[]) => void }[]>([])
const isValid = ref(true)
const errorMsg = ref('')
const autoPlayTimer = ref<number | null>(null)
const justFilledIds = ref<number[]>([])

const tokens = computed(() => {
  if (!expression.value) return []
  // 简易 tokenizer for highlighting
  const regex = /(\|\||&&|!|\(|\)|true|false|[a-zA-Z_]\w*|\d+|[<>=!]+)/g
  const result: { text: string, type: string }[] = []
  let match
  let lastIndex = 0
  
  while ((match = regex.exec(expression.value)) !== null) {
    // Add whitespace/skipped chars
    if (match.index > lastIndex) {
      result.push({ text: expression.value.slice(lastIndex, match.index), type: 'space' })
    }
    
    const text = match[0]
    let type = 'identifier'
    if (['||', '&&', '!'].includes(text)) type = 'operator'
    else if (['(', ')'].includes(text)) type = 'paren'
    else if (['true', 'false'].includes(text)) type = 'keyword'
    else if (/^[<>=!]+$/.test(text)) type = 'relop'
    
    result.push({ text, type })
    lastIndex = regex.lastIndex
  }
  
  if (lastIndex < expression.value.length) {
    result.push({ text: expression.value.slice(lastIndex), type: 'space' })
  }
  
  return result
})

// 模拟回填过程
function initSimulation() {
  errorMsg.value = ''
  isValid.value = true
  stopAutoPlay()
  justFilledIds.value = []
  
  if (!expression.value.trim()) {
    isValid.value = false
    return
  }

  const result = simulateBackpatching(expression.value)
  
  // 检查是否有解析错误
  if (result.steps.length === 1 && result.steps[0].desc.startsWith('解析错误')) {
    isValid.value = false
    errorMsg.value = result.steps[0].desc
    instructions.value = []
    steps.value = []
  } else {
    instructions.value = result.instructions
    steps.value = result.steps
  }
  
  currentStep.value = 0
}

function nextStep() {
  if (currentStep.value < steps.value.length) {
    // 捕获哪些指令在这个步骤被填充了
    const beforeFilled = instructions.value.map(i => i.isFilled)
    steps.value[currentStep.value].action(instructions.value)
    
    // 计算差异
    justFilledIds.value = []
    instructions.value.forEach((inst, idx) => {
      if (!beforeFilled[idx] && inst.isFilled) {
        justFilledIds.value.push(inst.id)
      }
    })
    
    currentStep.value++
  } else {
    stopAutoPlay()
  }
}

function stopAutoPlay() {
  if (autoPlayTimer.value) {
    clearInterval(autoPlayTimer.value)
    autoPlayTimer.value = null
  }
}

function toggleAutoPlay() {
  if (autoPlayTimer.value) {
    stopAutoPlay()
  } else {
    if (currentStep.value >= steps.value.length) {
      reset()
    }
    autoPlayTimer.value = window.setInterval(() => {
      nextStep()
    }, 1000)
  }
}

function reset() {
  initSimulation()
}

// 监听输入
watch(expression, () => {
  initSimulation()
})

initSimulation()
</script>

<template>
  <div class="backpatching-analyzer">
    <div class="header">
      <div class="input-row" :class="{ 'invalid': !isValid }">
        <h3>布尔表达式：</h3>
        <div class="input-wrapper">
          <div class="highlight-overlay">
            <span v-for="(t, i) in tokens" :key="i" :class="t.type">{{ t.text }}</span>
          </div>
          <input 
            v-model="expression" 
            placeholder="a < b || c > d && e != f" 
            :class="{ 'error-input': !isValid }"
            spellcheck="false"
          />
        </div>
        <span v-if="!isValid" class="error-badge">无效</span>
      </div>
      <div v-if="errorMsg" class="error-msg">{{ errorMsg }}</div>
      <div class="status">
        <span class="label">当前步骤：</span>
        <span class="desc">{{ currentStep > 0 ? steps[currentStep-1].desc : '准备开始...' }}</span>
      </div>
      <div class="controls">
        <button class="primary" @click="nextStep" :disabled="currentStep >= steps.length">下一步</button>
        <button @click="toggleAutoPlay">
          {{ autoPlayTimer ? '暂停' : '自动播放' }}
        </button>
        <button @click="reset">重置</button>
      </div>
    </div>

    <div class="visualization">
      <div class="code-list">
        <div 
          v-for="inst in instructions" 
          :key="inst.id"
          class="inst-row"
          :class="{ 
            'filled': inst.isFilled,
            'just-filled': justFilledIds.includes(inst.id)
          }"
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

.input-row {
  display: flex;
  align-items: center;
  gap: 12px;
  background: var(--vp-c-bg);
  padding: 8px;
  border-radius: 4px;
  transition: all 0.3s;
}

.input-row.invalid {
  border: 1px solid var(--vp-c-red-2);
  background-color: var(--vp-c-red-soft);
}

.input-wrapper {
  flex: 1;
  position: relative;
  height: 34px;
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  border-radius: 4px;
  overflow: hidden;
}

.highlight-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  padding: 6px;
  font-family: monospace;
  font-size: 14px;
  pointer-events: none;
  white-space: pre;
  color: transparent; /* Text itself is transparent, but we style spans */
  z-index: 1;
}

.highlight-overlay span {
  color: var(--vp-c-text-1); /* Default color */
}

.highlight-overlay .operator { color: #d946ef; font-weight: bold; } /* Purple for || && ! */
.highlight-overlay .keyword { color: #3b82f6; } /* Blue for true/false */
.highlight-overlay .relop { color: #ea580c; } /* Orange for < > = */
.highlight-overlay .paren { color: #8b5cf6; font-weight: bold; } /* Violet for () */
.highlight-overlay .identifier { color: var(--vp-c-text-1); }

input {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  padding: 6px;
  font-family: monospace;
  font-size: 14px;
  border: none;
  background: transparent;
  color: transparent; /* Hide input text so overlay shows through */
  caret-color: var(--vp-c-text-1); /* Keep cursor visible */
  z-index: 2;
}

input:focus {
  outline: none;
}

.error-badge {
  color: var(--vp-c-red-1);
  font-weight: bold;
  font-size: 12px;
  background: rgba(255,255,255,0.8);
  padding: 2px 6px;
  border-radius: 4px;
}

.error-msg {
  color: var(--vp-c-red-1);
  font-size: 13px;
  padding: 0 4px;
}

h3 {
  margin: 0;
  white-space: nowrap;
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

.inst-row.just-filled {
  background: #dcfce7;
  box-shadow: 0 0 8px var(--vp-c-brand-soft);
  transform: scale(1.02);
  border-left: 4px solid var(--vp-c-brand-1);
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
