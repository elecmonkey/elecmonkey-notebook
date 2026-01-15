<script setup lang="ts">
import { ref, computed } from 'vue'

// 复用 c-runtime-simulator 的 Parser 部分，但需要扩展
// 由于原来的 Parser 只支持函数调用和简单逻辑，不支持数组和 While
// 我们需要在这里增强 Parser 和 Tokenizer，或者直接重新实现一个更强大的 Mini-C Parser
// 考虑到工作量和一致性，我们在本文件内实现一个支持 Array 和 Loop 的增强版 Parser

interface Quadruple {
  id: number
  op: string
  arg1: string
  arg2: string
  result: string
  desc?: string
  tac?: string
}

// --- Enhanced Mini-C Parser & TAC Generator ---

interface Token {
  type: string
  value: string
  line: number
}

function tokenize(code: string): Token[] {
  const tokens: Token[] = []
  let line = 1
  let pos = 0
  
  while (pos < code.length) {
    const char = code[pos]
    
    if (/\s/.test(char)) {
      if (char === '\n') line++
      pos++
      continue
    }
    
    if (/[a-zA-Z_]/.test(char)) {
      let value = ''
      while (pos < code.length && /[a-zA-Z0-9_]/.test(code[pos])) {
        value += code[pos++]
      }
      tokens.push({ type: ['int', 'void', 'if', 'else', 'while', 'return'].includes(value) ? 'keyword' : 'identifier', value, line })
      continue
    }
    
    if (/[0-9]/.test(char)) {
      let value = ''
      while (pos < code.length && /[0-9]/.test(code[pos])) {
        value += code[pos++]
      }
      tokens.push({ type: 'number', value, line })
      continue
    }
    
    if (pos + 1 < code.length) {
      const two = char + code[pos + 1]
      if (['<=', '>=', '==', '!='].includes(two)) {
        tokens.push({ type: 'operator', value: two, line })
        pos += 2
        continue
      }
    }
    
    if (['+', '-', '*', '/', '%', '=', '<', '>', '!', '&', '|'].includes(char)) {
      tokens.push({ type: 'operator', value: char, line })
      pos++
      continue
    }
    
    if (['(', ')', '[', ']', '{', '}', ';', ','].includes(char)) {
      tokens.push({ type: 'punctuation', value: char, line })
      pos++
      continue
    }
    
    pos++ // Skip unknown
  }
  return tokens
}

class TACBuilder {
  tokens: Token[]
  current = 0
  quadruples: Quadruple[] = []
  tempCount = 0
  labelCount = 0
  quadId = 100

  constructor(tokens: Token[]) {
    this.tokens = tokens
  }

  newTemp() { return `t${++this.tempCount}` }
  newLabel() { return `L${++this.labelCount}` }

  emit(op: string, arg1: string, arg2: string, result: string, desc: string = '') {
    let tac = ''
    if (op === '=') {
      tac = `${result} = ${arg1}`
    } else if (op === '[]=' ) { // x[i] = y
      // emit('[]=', y, '', x[i]) -> *t_addr = y
      tac = `*${result} = ${arg1}`
    } else if (op === '=[]') { // y = x[i]
      tac = `${result} = *${arg1}` // arg1 is address
    } else if (op.startsWith('if')) {
      const rel = op.replace('if', '')
      tac = `if ${arg1} ${rel} ${arg2} goto ${result}`
    } else if (op === 'goto') {
      tac = `goto ${result}`
    } else if (op === 'label') {
      tac = `${result}:`
    } else if (op === 'param') {
      tac = `param ${arg1}`
    } else if (op === 'call') {
      tac = `${result} = call ${arg1}, ${arg2}`
    } else {
      tac = `${result} = ${arg1} ${op} ${arg2}`
    }

    this.quadruples.push({
      id: this.quadId++,
      op,
      arg1,
      arg2,
      result,
      desc,
      tac
    })
  }

  peek() { return this.tokens[this.current] }
  consume(val?: string) {
    const t = this.tokens[this.current]
    if (!t) return null
    if (val && t.value !== val) return null
    this.current++
    return t
  }
  expect(val: string) {
    const t = this.consume(val)
    if (!t) throw new Error(`Expected '${val}'`)
    return t
  }

  parse() {
    while (this.current < this.tokens.length) {
      const t = this.peek()
      if (t.type === 'keyword' && (t.value === 'int' || t.value === 'void')) {
        this.parseDeclOrFunc()
      } else {
        this.current++ // Skip
      }
    }
  }

  parseDeclOrFunc() {
    this.consume() // type
    const name = this.consume()!.value
    if (this.peek().value === '(') {
      this.parseFunc(name)
    } else if (this.peek().value === '[') {
      this.parseArrayDecl(name)
    } else {
      this.parseVarDecl(name)
    }
  }

  parseFunc(name: string) {
    this.expect('(')
    while (this.peek().value !== ')') this.current++ // Skip params for now
    this.expect(')')
    this.expect('{')
    this.emit('label', '', '', name, 'Function Entry')
    this.parseBlockBody()
  }

  parseBlockBody() {
    while (this.peek().value !== '}') {
      this.parseStmt()
    }
    this.expect('}')
  }

  parseStmt() {
    const t = this.peek()
    if (t.value === 'int') {
      this.consume()
      const name = this.consume()!.value
      if (this.peek().value === '[') {
        this.parseArrayDecl(name)
      } else {
        this.parseVarDecl(name)
      }
    } else if (t.value === 'if') {
      this.parseIf()
    } else if (t.value === 'while') {
      this.parseWhile()
    } else if (t.value === 'return') {
      this.consume()
      if (this.peek().value !== ';') {
         const retVal = this.parseExpr()
         this.emit('return', retVal, '', '', 'Return value') // Simplified
      }
      this.expect(';')
    } else if (t.type === 'identifier') {
      // Assignment or Call?
      // Lookahead
      let isAssign = false
      let tempPos = this.current
      while (tempPos < this.tokens.length && this.tokens[tempPos].value !== ';') {
        if (this.tokens[tempPos].value === '=') {
          isAssign = true
          break
        }
        tempPos++
      }

      if (isAssign) {
        this.parseAssign()
      } else {
        this.parseExpr() // Could be func call
        this.expect(';')
      }
    } else {
      this.current++ // Skip unknown
    }
  }

  parseArrayDecl(name: string) {
    this.expect('[')
    const size = this.consume()!.value
    this.expect(']')
    this.expect(';')
    // Just metadata, maybe emit comment?
    // this.emit('comment', '', '', `Decl Array ${name}[${size}]`)
  }

  parseVarDecl(name: string) {
    if (this.peek().value === '=') {
      this.consume()
      const val = this.parseExpr()
      this.emit('=', val, '', name, 'Init var')
    }
    this.expect(';')
  }

  parseIf() {
    this.expect('if')
    this.expect('(')
    const cond = this.parseCondition()
    this.expect(')')
    
    const trueLabel = this.newLabel()
    const falseLabel = this.newLabel()
    
    this.emit(`if${cond.op}`, cond.arg1, cond.arg2, trueLabel, 'If condition')
    this.emit('goto', '', '', falseLabel, 'False jump')
    
    this.emit('label', '', '', trueLabel, 'True block')
    this.expect('{')
    this.parseBlockBody()
    
    this.emit('label', '', '', falseLabel, 'End If')
  }

  parseWhile() {
    this.expect('while')
    this.expect('(')
    
    const startLabel = this.newLabel()
    const trueLabel = this.newLabel()
    const endLabel = this.newLabel()
    
    this.emit('label', '', '', startLabel, 'While Start')
    
    // Condition needs to be re-evaluated, so we parse it here? 
    // Ideally we should parse condition expression nodes. 
    // Simplified: assume simple binary condition like i < 10
    const cond = this.parseCondition() 
    this.expect(')')
    
    this.emit(`if${cond.op}`, cond.arg1, cond.arg2, trueLabel, 'Check loop cond')
    this.emit('goto', '', '', endLabel, 'Exit loop')
    
    this.emit('label', '', '', trueLabel, 'Loop Body')
    this.expect('{')
    this.parseBlockBody()
    
    this.emit('goto', '', '', startLabel, 'Loop back')
    this.emit('label', '', '', endLabel, 'Loop End')
  }

  parseCondition() {
    const arg1 = this.parseExpr()
    const op = this.consume()!.value
    const arg2 = this.parseExpr()
    return { op, arg1, arg2 }
  }

  parseAssign() {
    const name = this.consume()!.value
    let target = name
    let isArray = false
    
    if (this.peek().value === '[') {
      this.consume()
      const index = this.parseExpr()
      this.expect(']')
      
      // Calculate address
      const offset = this.newTemp()
      this.emit('*', index, '4', offset, 'Calc offset (int=4)')
      const addr = this.newTemp()
      this.emit('+', name, offset, addr, `Calc addr &${name}[${index}]`)
      target = addr
      isArray = true
    }
    
    this.expect('=')
    const val = this.parseExpr()
    this.expect(';')
    
    if (isArray) {
      this.emit('[]=', val, '', target, `*${target} = ${val}`)
    } else {
      this.emit('=', val, '', target, 'Assign')
    }
  }

  parseExpr(): string {
    // Simplified: handle term (+ term)*
    let left = this.parseTerm()
    
    while (this.peek() && ['+', '-'].includes(this.peek().value)) {
      const op = this.consume()!.value
      const right = this.parseTerm()
      const temp = this.newTemp()
      this.emit(op, left, right, temp, 'Calc expr')
      left = temp
    }
    return left
  }

  parseTerm(): string {
    let left = this.parseFactor()
    while (this.peek() && ['*', '/'].includes(this.peek().value)) {
      const op = this.consume()!.value
      const right = this.parseFactor()
      const temp = this.newTemp()
      this.emit(op, left, right, temp, 'Calc term')
      left = temp
    }
    return left
  }

  parseFactor(): string {
    const t = this.consume()!
    if (t.type === 'number') return t.value
    if (t.type === 'identifier') {
      const name = t.value
      if (this.peek().value === '[') {
        this.consume() // [
        const index = this.parseExpr()
        this.expect(']')
        // Array Access
        const offset = this.newTemp()
        this.emit('*', index, '4', offset, 'Calc offset')
        const addr = this.newTemp()
        this.emit('+', name, offset, addr, 'Calc addr')
        const val = this.newTemp()
        this.emit('=[]', addr, '', val, `Load ${val} = *${addr}`)
        return val
      }
      return name
    }
    if (t.value === '(') {
      const e = this.parseExpr()
      this.expect(')')
      return e
    }
    return ''
  }
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

// 简易 TAC 生成器
function generateTAC() {
  quadruples.value = []
  
  // 使用新的 TACBuilder
  try {
    const tokens = tokenize(userCode.value)
    const builder = new TACBuilder(tokens)
    builder.parse()
    quadruples.value = builder.quadruples
  } catch (e: any) {
    console.error(e)
    quadruples.value.push({
      id: 0,
      op: 'ERROR',
      arg1: '',
      arg2: '',
      result: '',
      desc: e.message
    })
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
        <div class="hint">已支持：变量/数组声明、赋值、算术表达式、if/while 控制流。</div>
      </div>
    </div>

    <div class="panel tac-panel">
      <h3>2. 四元式序列 (Quadruples)</h3>
      <!-- 移除 .table-container 的包裹，直接用 table，或者将 table-container 改为 full width -->
      <table class="tac-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Op</th>
            <th>Arg1</th>
            <th>Arg2</th>
            <th>Result</th>
            <th>TAC</th>
            <th>Desc</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="q in quadruples" :key="q.id">
            <td class="id">({{ q.id }})</td>
            <td class="op">{{ q.op }}</td>
            <td>{{ q.arg1 }}</td>
            <td>{{ q.arg2 }}</td>
            <td class="res">{{ q.result }}</td>
            <td class="tac-code">{{ q.tac }}</td>
            <td class="desc">{{ q.desc }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
.tac-generator {
  display: grid;
  grid-template-columns: 1fr 2fr;
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

.tac-table {
  width: 100% !important;
  border-collapse: collapse;
  font-size: 0.9em;
  table-layout: fixed !important;
  display: table !important;
}

.tac-table th,
.tac-table td {
  border: 1px solid var(--vp-c-divider);
  padding: 8px;
  text-align: left;
}

.tac-table th {
  background-color: var(--vp-c-bg-alt);
  font-weight: 600;
}

.id { color: var(--vp-c-text-3); width: 60px; }
.op { color: var(--vp-c-brand-1); font-weight: bold; width: 60px; }
.res { font-weight: bold; }
.tac-code { font-family: monospace; color: var(--vp-c-text-2); }
.desc { color: var(--vp-c-text-3); font-style: italic; font-size: 12px; }
</style>
