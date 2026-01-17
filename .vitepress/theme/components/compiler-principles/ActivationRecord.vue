<script setup lang="ts">
import { ref, computed } from 'vue'

import { simulateC, type ExecutionStep } from './utils/c-runtime-simulator'

interface StackFrame {
  id: string
  funcName: string
  params: Record<string, string>
  returnAddr: string
  oldFP: string
  savedRegs: string
  locals: Record<string, string>
  temps: Record<string, string>
  // 视觉属性
  isHighlight?: boolean
  top?: number
  height?: number
}

// 示例 C 代码
const defaultCode = `int main() {
  int a = 10;
  int result = fact(3);
  return 0;
}

int fact(int n) {
  if (n <= 1) return 1;
  int temp = fact(n - 1);
  return n * temp;
}`

const userCode = ref(defaultCode)
const isCustomMode = ref(false)

// 计算 codeLines
const codeLines = computed(() => userCode.value.split('\n'))

// 响应式 steps
const steps = ref<ExecutionStep[]>([])

// 解析用户代码
function parseUserCodeAndGenSteps() {
  steps.value = simulateC(userCode.value)
  reset()
}

// 监听代码变化（防抖？或者手动点击运行）
// 这里简单处理：提供一个“重新加载”按钮

const currentStepIndex = ref(0)
const stack = ref<StackFrame[]>([])
const activeLine = computed(() => {
  if (steps.value.length === 0) return 0
  return steps.value[currentStepIndex.value].line
})
const currentDesc = computed(() => {
  if (steps.value.length === 0) return ''
  return steps.value[currentStepIndex.value].desc
})

function reset() {
  currentStepIndex.value = 0
  stack.value = []
  if (steps.value.length > 0) {
    executeStep(0)
  }
}

// ... prevStep, nextStep, executeStep 保持不变 ...
// 注意 executeStep 中 steps 改为 steps.value

function nextStep() {
  if (currentStepIndex.value < steps.value.length - 1) {
    currentStepIndex.value++
    executeStep(currentStepIndex.value)
  }
}

function prevStep() {
  if (currentStepIndex.value > 0) {
    currentStepIndex.value--
    const target = currentStepIndex.value
    stack.value = []
    for (let i = 0; i <= target; i++) {
      executeStep(i)
    }
  }
}

function executeStep(index: number) {
  const step = steps.value[index]
  // ... 逻辑不变
  if (step.action === 'push') {
    const newFrame: StackFrame = {
      id: `frame-${Date.now()}-${Math.random()}`, // 避免 id 冲突
      funcName: step.funcName!,
      params: step.data?.params || {},
      returnAddr: step.data?.returnAddr || '?',
      oldFP: step.data?.oldFP || '?',
      savedRegs: 'R1, R2...',
      locals: step.data?.locals || {},
      temps: step.data?.temps || {},
      isHighlight: true
    }
    stack.value.push(newFrame)
  } else if (step.action === 'pop') {
    stack.value.pop()
    if (stack.value.length > 0) {
      stack.value[stack.value.length - 1].isHighlight = true
    }
  } else if (step.action === 'update') {
    if (stack.value.length > 0) {
      const top = stack.value[stack.value.length - 1]
      if (step.data?.locals) {
        Object.assign(top.locals, step.data.locals)
      }
      top.isHighlight = true
    }
  }
  
  stack.value.forEach((frame, idx) => {
    if (idx !== stack.value.length - 1) frame.isHighlight = false
  })
}

// 初始化
parseUserCodeAndGenSteps()

// 布局相关
const FRAME_WIDTH = 280
</script>

<template>
  <div class="activation-record-viz">
    <div class="layout">
      <!-- 左侧：代码区 -->
      <div class="code-panel">
        <h3>C 源代码</h3>
        
        <!-- 可编辑代码区 -->
        <div class="code-editor">
          <textarea 
            v-model="userCode" 
            class="code-input"
            spellcheck="false"
            @change="parseUserCodeAndGenSteps"
          ></textarea>
          
          <!-- 高亮遮罩 (仅用于显示行高亮) -->
          <div class="code-overlay">
             <div 
              v-for="(line, idx) in codeLines" 
              :key="idx"
              class="code-line-highlight"
              :class="{ 'active': activeLine === idx }"
            ></div>
          </div>
        </div>

        <div class="controls">
          <button @click="parseUserCodeAndGenSteps" class="reload-btn">重载代码</button>
          <div class="divider"></div>
          <button @click="prevStep" :disabled="currentStepIndex === 0">上一步</button>
          <div class="step-info">
            <span class="desc">{{ currentDesc }}</span>
            <span class="progress">{{ currentStepIndex + 1 }} / {{ steps.length }}</span>
          </div>
          <button class="primary" @click="nextStep" :disabled="currentStepIndex === steps.length - 1">下一步</button>
          <button @click="reset">重置</button>
        </div>
      </div>

      <!-- 右侧：栈可视化 -->
      <div class="stack-panel">
        <h3>运行时栈 (Runtime Stack)</h3>
        <div class="stack-container">
          <div class="stack-growth-indicator">
            <span>高地址</span>
            <div class="arrow">↓</div>
            <span>低地址</span>
          </div>

          <transition-group name="list" tag="div" class="stack-frames">
            <div 
              v-for="(frame, idx) in stack.slice().reverse()" 
              :key="frame.id"
              class="stack-frame"
              :class="{ 'highlight': frame.isHighlight }"
            >
              <div class="frame-header">
                <span class="frame-title">{{ frame.funcName }}</span>
                <span class="frame-addr">FP: 0x{{ (1000 - idx * 64).toString(16) }}</span>
              </div>
              
              <!-- Typical Subdivision -->
              <div class="frame-body">
                <div class="section params" v-if="Object.keys(frame.params).length">
                  <span class="label">参数区 (Parameters)</span>
                  <div class="content">
                    <div v-for="(val, key) in frame.params" :key="key">{{ key }}: {{ val }}</div>
                  </div>
                </div>

                <div class="section control">
                  <span class="label">控制信息 (Control Info)</span>
                  <div class="content">
                    <div>Ret Addr: {{ frame.returnAddr }}</div>
                    <div>Old FP: {{ frame.oldFP }}</div>
                    <div>Saved Regs: {{ frame.savedRegs }}</div>
                  </div>
                </div>

                <div class="section locals" v-if="Object.keys(frame.locals).length">
                  <span class="label">局部变量 (Locals)</span>
                  <div class="content">
                    <div v-for="(val, key) in frame.locals" :key="key">{{ key }}: {{ val }}</div>
                  </div>
                </div>
                
                <div class="section temps" v-if="Object.keys(frame.temps).length">
                  <span class="label">临时变量 (Temporaries)</span>
                  <div class="content">
                    <div v-for="(val, key) in frame.temps" :key="key">{{ key }}: {{ val }}</div>
                  </div>
                </div>
              </div>
            </div>
          </transition-group>
          
          <div class="empty-stack" v-if="stack.length === 0">
            栈空 (Stack Empty)
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.activation-record-viz {
  display: flex;
  flex-direction: column;
  gap: 20px;
  font-family: sans-serif;
}

.layout {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
}

@media (max-width: 1405px) {
  .layout {
    grid-template-columns: 1fr;
  }
}

.code-panel, .stack-panel {
  background: var(--vp-c-bg-soft);
  border-radius: 8px;
  padding: 16px;
  border: 1px solid var(--vp-c-divider);
}

h3 {
  margin-top: 0;
  margin-bottom: 16px;
  font-size: 1.1em;
  color: var(--vp-c-text-1);
}

/* 代码编辑器样式 */
.code-editor {
  position: relative;
  height: 300px;
  background: var(--vp-c-bg);
  border: 1px solid var(--vp-c-divider);
  border-radius: 4px;
  overflow: hidden;
}

.code-input {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  padding: 12px;
  font-family: monospace;
  font-size: 14px;
  line-height: 24px; /* 固定行高 */
  background: transparent;
  border: none;
  resize: none;
  z-index: 2;
  color: var(--vp-c-text-1);
  white-space: pre;
  overflow: auto;
}

.code-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  padding: 12px 0; /* 上下 padding 保持一致 */
  z-index: 1;
  pointer-events: none;
  overflow: hidden;
}

.code-line-highlight {
  height: 24px; /* 与 line-height 一致 */
  width: 100%;
}

.code-line-highlight.active {
  background-color: var(--vp-c-brand-soft);
}

.reload-btn {
  background-color: var(--vp-c-green-soft) !important;
  color: var(--vp-c-green-1) !important;
  border-color: var(--vp-c-green-1) !important;
}

.divider {
  width: 1px;
  height: 20px;
  background-color: var(--vp-c-divider);
  margin: 0 4px;
}

.controls {
  margin-top: 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.step-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.desc {
  font-weight: bold;
  color: var(--vp-c-brand-1);
  font-size: 0.9em;
}

.progress {
  font-size: 0.8em;
  color: var(--vp-c-text-3);
}

button {
  padding: 6px 12px;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg);
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9em;
}

button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

button.primary {
  background: var(--vp-c-brand-1);
  color: white;
  border-color: var(--vp-c-brand-1);
}

/* 栈区域 */
.stack-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-height: 400px;
  background: var(--vp-c-bg);
  border: 1px solid var(--vp-c-divider);
  border-radius: 4px;
  padding: 16px;
  position: relative;
}

.stack-growth-indicator {
  position: absolute;
  right: 10px;
  top: 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
  font-size: 12px;
  color: var(--vp-c-text-3);
}

.stack-growth-indicator .arrow {
  font-size: 20px;
  margin: 4px 0;
}

.stack-frames {
  width: 100%;
  max-width: 320px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.stack-frame {
  border: 2px solid var(--vp-c-divider);
  border-radius: 8px;
  overflow: hidden;
  background: white;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  transition: all 0.5s ease;
}

.stack-frame.highlight {
  border-color: var(--vp-c-brand-1);
  box-shadow: 0 0 12px var(--vp-c-brand-soft);
  transform: scale(1.02);
}

.frame-header {
  background: var(--vp-c-bg-soft);
  padding: 8px 12px;
  border-bottom: 1px solid var(--vp-c-divider);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.frame-title {
  font-weight: bold;
  color: var(--vp-c-text-1);
}

.frame-addr {
  font-size: 12px;
  color: var(--vp-c-text-3);
  font-family: monospace;
}

.frame-body {
  padding: 0;
}

.section {
  border-bottom: 1px dashed var(--vp-c-divider);
  padding: 6px 12px;
}

.section:last-child {
  border-bottom: none;
}

.section.params { background: #eef2ff; }
.section.control { background: #fffbeb; }
.section.locals { background: #f0fdf4; }
.section.temps { background: #fdf2f8; }

.section .label {
  display: block;
  font-size: 10px;
  text-transform: uppercase;
  color: var(--vp-c-text-3);
  margin-bottom: 4px;
}

.section .content {
  font-family: monospace;
  font-size: 13px;
  color: var(--vp-c-text-1);
}

/* 动画 */
.list-enter-active,
.list-leave-active {
  transition: all 0.5s ease;
}
.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateX(30px);
}
</style>
