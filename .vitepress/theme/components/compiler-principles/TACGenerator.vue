<script setup lang="ts">
import { ref, computed } from 'vue'
import { simulateC } from './utils/c-runtime-simulator'

// 我们需要稍微改造一下 c-runtime-simulator 或者重写一个简单的 generator
// 因为 simulator 是为了执行，而这里是为了生成 IR。
// 为了简单起见，我们在这里实现一个简单的 AST -> TAC 转换器。
// 仅支持：赋值、算术运算、数组访问、if/while

interface Quadruple {
  id: number
  op: string
  arg1: string
  arg2: string
  result: string
  desc?: string // 解释说明，例如 "数组地址计算: i*width"
}

// 示例代码：数组访问与循环
const defaultCode = `int main() {
  int i = 0;
  int a[10];
  while (i < 10) {
    a[i] = i * 2;
    i = i + 1;
  }
}`

const userCode = ref(defaultCode)
const quadruples = ref<Quadruple[]>([])
const tempCounter = ref(0)
const labelCounter = ref(0)

function newTemp() { return `t${++tempCounter.value}` }
function newLabel() { return `L${++labelCounter.value}` }

// 简易 TAC 生成器
function generateTAC() {
  quadruples.value = []
  tempCounter.value = 0
  labelCounter.value = 0
  
  // 这里我们用正则简单模拟一下生成过程，
  // 因为完整的编译器前端太重了。
  // 我们针对特定模式进行生成演示。
  
  // 1. 预处理：去掉空白行
  const lines = userCode.value.split('\n').map(l => l.trim()).filter(l => l)
  
  let currentQuadId = 100
  function emit(op: string, arg1: string, arg2: string, result: string, desc: string = '') {
    quadruples.value.push({ id: currentQuadId++, op, arg1, arg2, result, desc })
  }

  // 模拟遍历
  lines.forEach(line => {
    // 数组赋值: a[i] = i * 2
    if (line.match(/(\w+)\[(\w+)\]\s*=\s*(.+);/)) {
      const match = line.match(/(\w+)\[(\w+)\]\s*=\s*(.+);/)!
      const arr = match[1]
      const index = match[2]
      const rhs = match[3] // 假设是简单表达式 i * 2
      
      // RHS 计算
      let rhsTemp = ''
      if (rhs.includes('*')) {
        const parts = rhs.split('*').map(s => s.trim())
        rhsTemp = newTemp()
        emit('*', parts[0], parts[1], rhsTemp, '计算右值')
      } else {
        rhsTemp = rhs
      }

      // 地址计算
      const t1 = newTemp()
      emit('*', index, '4', t1, `计算偏移: ${index} * elem_size`) // 假设 int 是 4 字节
      const t2 = newTemp()
      emit('+', arr, t1, t2, `基址 + 偏移: &${arr} + ${t1}`)
      emit('[]=', rhsTemp, '', t2, `存储: *${t2} = ${rhsTemp}`)
    }
    // While 循环
    else if (line.startsWith('while')) {
      const cond = line.match(/\((.+)\)/)![1] // i < 10
      const startLabel = newLabel()
      const endLabel = newLabel()
      
      // 这里的逻辑比较难通过正则完全模拟结构
      // 我们直接硬编码一个 while 的样子作为演示
      emit('label', '', '', startLabel, '循环开始')
      
      // Condition
      const parts = cond.split('<')
      emit('if<', parts[0].trim(), parts[1].trim(), 'goto ' + newLabel(), '条件跳转') // 简化
      emit('goto', '', '', endLabel, '跳出循环')
    }
  })
  
  // 如果用户输入的是默认代码，我们直接展示一个完美的标准答案
  if (userCode.value.trim() === defaultCode.trim()) {
    quadruples.value = []
    currentQuadId = 100
    
    // i = 0
    emit('=', '0', '', 'i', '初始化 i')
    
    // L1:
    const L1 = 'L1'
    const L2 = 'L2'
    emit('label', '', '', L1, '循环入口')
    
    // if i < 10 goto L3 (body) -> 实际是 ifFalse i < 10 goto L2
    emit('if>=', 'i', '10', `goto ${L2}`, '循环条件检查')
    
    // Body: a[i] = i * 2
    // 1. t1 = i * 2
    const t1 = 't1'
    emit('*', 'i', '2', t1, '计算右值')
    
    // 2. Address: t2 = i * 4
    const t2 = 't2'
    emit('*', 'i', '4', t2, '计算偏移量 (int=4B)')
    
    // 3. t3 = a[t2] -> a[t2] = t1
    // In TAC usually: x[i] = y is: []= y, , x[i]
    // Or: * (a + t2) = t1
    const t3 = 't3'
    emit('+', 'a', t2, t3, '计算绝对地址')
    emit('*=', t1, '', t3, '间接寻址存储')
    
    // i = i + 1
    emit('+', 'i', '1', 'i', '循环变量自增')
    
    // goto L1
    emit('goto', '', '', L1, '跳回循环开始')
    
    // L2:
    emit('label', '', '', L2, '循环结束')
  }
}

// 初始化
generateTAC()
</script>

<template>
  <div class="tac-generator">
    <div class="panel source-panel">
      <h3>1. C 源代码 (Source)</h3>
      <textarea v-model="userCode" spellcheck="false"></textarea>
      <div class="controls">
        <button class="primary" @click="generateTAC">生成四元式</button>
        <div class="hint">注：当前演示仅针对默认代码提供完美翻译，自定义代码暂未支持完整编译。</div>
      </div>
    </div>

    <div class="panel tac-panel">
      <h3>2. 四元式序列 (Quadruples)</h3>
      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Op</th>
              <th>Arg1</th>
              <th>Arg2</th>
              <th>Result</th>
              <th>说明</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="q in quadruples" :key="q.id">
              <td class="id">({{ q.id }})</td>
              <td class="op">{{ q.op }}</td>
              <td>{{ q.arg1 }}</td>
              <td>{{ q.arg2 }}</td>
              <td class="res">{{ q.result }}</td>
              <td class="desc">{{ q.desc }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<style scoped>
.tac-generator {
  display: grid;
  grid-template-columns: 1fr 1.5fr;
  gap: 20px;
  height: 500px;
}

@media (max-width: 960px) {
  .tac-generator {
    grid-template-columns: 1fr;
    height: auto;
  }
}

.panel {
  background: var(--vp-c-bg-soft);
  border-radius: 8px;
  padding: 16px;
  border: 1px solid var(--vp-c-divider);
  display: flex;
  flex-direction: column;
}

h3 {
  margin: 0 0 12px 0;
  font-size: 1.1em;
}

textarea {
  flex: 1;
  background: var(--vp-c-bg);
  border: 1px solid var(--vp-c-divider);
  border-radius: 4px;
  padding: 12px;
  font-family: monospace;
  resize: none;
  font-size: 14px;
  line-height: 1.6;
}

.controls {
  margin-top: 12px;
}

.hint {
  margin-top: 8px;
  font-size: 12px;
  color: var(--vp-c-text-3);
}

button.primary {
  background: var(--vp-c-brand-1);
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
}

.table-container {
  flex: 1;
  overflow-y: auto;
  background: var(--vp-c-bg);
  border: 1px solid var(--vp-c-divider);
  border-radius: 4px;
}

table {
  width: 100%;
  border-collapse: collapse;
  font-family: monospace;
  font-size: 13px;
}

th, td {
  padding: 8px;
  border-bottom: 1px solid var(--vp-c-divider);
  text-align: left;
}

th {
  background: var(--vp-c-bg-alt);
  font-weight: bold;
  position: sticky;
  top: 0;
}

.id { color: var(--vp-c-text-3); width: 60px; }
.op { color: var(--vp-c-brand-1); font-weight: bold; width: 60px; }
.res { font-weight: bold; }
.desc { color: var(--vp-c-text-3); font-style: italic; font-size: 12px; }
</style>
