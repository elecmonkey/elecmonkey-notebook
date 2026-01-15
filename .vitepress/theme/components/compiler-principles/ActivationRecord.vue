<script setup lang="ts">
import { ref, computed } from 'vue'

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

// 模拟的 C 代码执行步骤
interface ExecutionStep {
  line: number
  code: string
  desc: string
  action: 'push' | 'pop' | 'update' | 'none'
  funcName?: string
  data?: Partial<StackFrame>
}

// 示例 C 代码
const codeLines = [
  'int main() {',
  '  int a = 10;',
  '  int result = fact(3);',
  '  return 0;',
  '}',
  '',
  'int fact(int n) {',
  '  if (n <= 1) return 1;',
  '  int temp = fact(n - 1);',
  '  return n * temp;',
  '}'
]

// 预定义执行步骤
const steps: ExecutionStep[] = [
  { line: 0, code: 'int main() {', desc: '程序开始，main 函数入栈', action: 'push', funcName: 'main', data: { returnAddr: 'OS', oldFP: '0x0000', params: {}, locals: { a: '?', result: '?' } } },
  { line: 1, code: 'int a = 10;', desc: '初始化局部变量 a = 10', action: 'update', funcName: 'main', data: { locals: { a: '10', result: '?' } } },
  { line: 2, code: 'int result = fact(3);', desc: '准备调用 fact(3)，压入参数', action: 'push', funcName: 'fact(3)', data: { returnAddr: 'main:3', oldFP: 'main_FP', params: { n: '3' }, locals: { temp: '?' } } },
  { line: 7, code: 'if (n <= 1) return 1;', desc: 'fact(3): n=3 > 1，继续执行', action: 'none' },
  { line: 8, code: 'int temp = fact(n - 1);', desc: '调用 fact(2)', action: 'push', funcName: 'fact(2)', data: { returnAddr: 'fact:8', oldFP: 'fact3_FP', params: { n: '2' }, locals: { temp: '?' } } },
  { line: 7, code: 'if (n <= 1) return 1;', desc: 'fact(2): n=2 > 1，继续执行', action: 'none' },
  { line: 8, code: 'int temp = fact(n - 1);', desc: '调用 fact(1)', action: 'push', funcName: 'fact(1)', data: { returnAddr: 'fact:8', oldFP: 'fact2_FP', params: { n: '1' }, locals: { temp: '?' } } },
  { line: 7, code: 'if (n <= 1) return 1;', desc: 'fact(1): n=1 <= 1，返回 1', action: 'none' },
  { line: 7, code: 'return 1;', desc: 'fact(1) 返回，栈帧弹出', action: 'pop' },
  { line: 8, code: 'int temp = fact(n - 1);', desc: 'fact(2): 收到返回值 1，赋值给 temp', action: 'update', funcName: 'fact(2)', data: { locals: { temp: '1' } } },
  { line: 9, code: 'return n * temp;', desc: 'fact(2): 返回 2 * 1 = 2', action: 'pop' },
  { line: 8, code: 'int temp = fact(n - 1);', desc: 'fact(3): 收到返回值 2，赋值给 temp', action: 'update', funcName: 'fact(3)', data: { locals: { temp: '2' } } },
  { line: 9, code: 'return n * temp;', desc: 'fact(3): 返回 3 * 2 = 6', action: 'pop' },
  { line: 2, code: 'int result = fact(3);', desc: 'main: 收到返回值 6，赋值给 result', action: 'update', funcName: 'main', data: { locals: { a: '10', result: '6' } } },
  { line: 3, code: 'return 0;', desc: 'main 函数返回，程序结束', action: 'pop' }
]

const currentStepIndex = ref(0)
const stack = ref<StackFrame[]>([])
const activeLine = computed(() => steps[currentStepIndex.value].line)
const currentDesc = computed(() => steps[currentStepIndex.value].desc)

function reset() {
  currentStepIndex.value = 0
  stack.value = []
  executeStep(0)
}

function nextStep() {
  if (currentStepIndex.value < steps.length - 1) {
    currentStepIndex.value++
    executeStep(currentStepIndex.value)
  }
}

function prevStep() {
  if (currentStepIndex.value > 0) {
    currentStepIndex.value--
    // 回退比较麻烦，简单处理：重置然后执行到前一步
    const target = currentStepIndex.value
    stack.value = []
    for (let i = 0; i <= target; i++) {
      executeStep(i)
    }
  }
}

function executeStep(index: number) {
  const step = steps[index]
  
  if (step.action === 'push') {
    const newFrame: StackFrame = {
      id: `frame-${Date.now()}`,
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
      // 这里的 update 逻辑简化，直接合并属性
      if (step.data?.locals) {
        Object.assign(top.locals, step.data.locals)
      }
      top.isHighlight = true
    }
  }
  
  // 清除其他高亮
  stack.value.forEach((frame, idx) => {
    if (idx !== stack.value.length - 1) frame.isHighlight = false
  })
}

// 初始化
reset()

// 布局相关
const FRAME_WIDTH = 280
</script>

<template>
  <div class="activation-record-viz">
    <div class="layout">
      <!-- 左侧：代码区 -->
      <div class="code-panel">
        <h3>C 源代码</h3>
        <div class="code-box">
          <div 
            v-for="(line, idx) in codeLines" 
            :key="idx"
            class="code-line"
            :class="{ 'active': activeLine === idx }"
          >
            <span class="line-num">{{ idx }}</span>
            <span class="line-content">{{ line }}</span>
          </div>
        </div>
        
        <div class="controls">
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
            <span>低地址 (栈增长方向)</span>
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

@media (max-width: 960px) {
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

/* 代码区域 */
.code-box {
  background: var(--vp-c-bg);
  border: 1px solid var(--vp-c-divider);
  border-radius: 4px;
  padding: 12px;
  font-family: monospace;
  font-size: 14px;
  line-height: 1.5;
  overflow-x: auto;
}

.code-line {
  display: flex;
  padding: 2px 4px;
}

.code-line.active {
  background-color: var(--vp-c-brand-soft);
  color: var(--vp-c-brand-1);
  font-weight: bold;
}

.line-num {
  width: 24px;
  color: var(--vp-c-text-3);
  text-align: right;
  margin-right: 12px;
  user-select: none;
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
