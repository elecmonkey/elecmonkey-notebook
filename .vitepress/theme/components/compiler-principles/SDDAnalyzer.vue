<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { parseGrammar, EPSILON } from './utils/grammar'
import { buildLR1Table } from './utils/lr1-algo'
import { computeFirst } from './utils/first-follow'
import { parseLR1, layoutTree, flattenTree, compileAction, type ParseTreeNode, type SDDScenario, type SDDAction } from './utils/sdd-algo'

// --- 预定义场景 ---
const scenarios: SDDScenario[] = [
  {
    name: '整数四则运算 (S-属性)',
    grammarStr: `L -> E
E -> E + T
E -> T
T -> T * F
T -> F
F -> ( E )
F -> digit`,
    inputStr: '3 * 5 + 4',
    displayRules: {
      'L -> E': 'L.val = E.val',
      'E -> E + T': 'E.val = E1.val + T.val',
      'E -> T': 'E.val = T.val',
      'T -> T * F': 'T.val = T1.val * F.val',
      'T -> F': 'T.val = F.val',
      'F -> ( E )': 'F.val = E.val',
      'F -> digit': 'F.val = digit.lexval'
    },
    computeActions: {
      'L -> E': (c, n) => n.attributes.val = c[0].attributes.val,
      'E -> E + T': (c, n) => n.attributes.val = c[0].attributes.val + c[2].attributes.val,
      'E -> T': (c, n) => n.attributes.val = c[0].attributes.val,
      'T -> T * F': (c, n) => n.attributes.val = c[0].attributes.val * c[2].attributes.val,
      'T -> F': (c, n) => n.attributes.val = c[0].attributes.val,
      'F -> ( E )': (c, n) => n.attributes.val = c[1].attributes.val,
      'F -> digit': (c, n) => n.attributes.val = c[0].attributes.lexval
    }
  },
  {
    name: '二进制转十进制 (S-属性)',
    grammarStr: `N -> L
L -> L B
L -> B
B -> 0
B -> 1`,
    inputStr: '1 0 1',
    displayRules: {
      'N -> L': 'N.val = L.val',
      'L -> L B': 'L.val = L1.val * 2 + B.val',
      'L -> B': 'L.val = B.val',
      'B -> 0': 'B.val = 0',
      'B -> 1': 'B.val = 1'
    },
    computeActions: {
      'N -> L': (c, n) => n.attributes.val = c[0].attributes.val,
      'L -> L B': (c, n) => n.attributes.val = c[0].attributes.val * 2 + c[1].attributes.val,
      'L -> B': (c, n) => n.attributes.val = c[0].attributes.val,
      'B -> 0': (c, n) => n.attributes.val = 0,
      'B -> 1': (c, n) => n.attributes.val = 1
    }
  },
  {
    name: '列表元素计数 (S-属性)',
    grammarStr: `S -> L
L -> L , id
L -> id`,
    inputStr: 'a , b , c',
    displayRules: {
      'S -> L': 'S.cnt = L.cnt',
      'L -> L , id': 'L.cnt = L1.cnt + 1',
      'L -> id': 'L.cnt = 1'
    },
    computeActions: {
      'S -> L': (c, n) => n.attributes.cnt = c[0].attributes.cnt,
      'L -> L , id': (c, n) => n.attributes.cnt = c[0].attributes.cnt + 1,
      'L -> id': (c, n) => n.attributes.cnt = 1
    }
  },
  {
    name: '中缀转后缀表达式 (S-属性)',
    grammarStr: `E -> E + T
E -> T
T -> T * F
T -> F
F -> ( E )
F -> id`,
    inputStr: 'a + b * c',
    displayRules: {
      'E -> E + T': 'E.code = E1.code || T.code || "+"',
      'E -> T': 'E.code = T.code',
      'T -> T * F': 'T.code = T1.code || F.code || "*"',
      'T -> F': 'T.code = F.code',
      'F -> ( E )': 'F.code = E.code',
      'F -> id': 'F.code = id.lexval'
    },
    computeActions: {
      'E -> E + T': (c, n) => n.attributes.code = c[0].attributes.code + ' ' + c[2].attributes.code + ' +',
      'E -> T': (c, n) => n.attributes.code = c[0].attributes.code,
      'T -> T * F': (c, n) => n.attributes.code = c[0].attributes.code + ' ' + c[2].attributes.code + ' *',
      'T -> F': (c, n) => n.attributes.code = c[0].attributes.code,
      'F -> ( E )': (c, n) => n.attributes.code = c[1].attributes.code,
      'F -> id': (c, n) => n.attributes.code = c[0].attributes.lexval
    }
  }
]

const currentScenarioIndex = ref(0)
const inputStr = ref(scenarios[0].inputStr)
const customGrammarStr = ref(`E -> E + T { val = $1.val + $3.val }
E -> T { val = $1.val }
T -> digit { val = $1.lexval }`)

const errorMsg = ref('')
const parseTree = ref<ParseTreeNode | null>(null)
const treeLayout = ref<{width: number, height: number}>({ width: 800, height: 600 })
const renderNodes = ref<ParseTreeNode[]>([])
const renderLinks = ref<{x1:number, y1:number, x2:number, y2:number}[]>([])

// 计算状态
const executionQueue = ref<ParseTreeNode[]>([])
const currentStepNode = ref<ParseTreeNode | null>(null)
const currentRule = ref('')
const isComputed = ref(false)

const currentScenario = computed((): SDDScenario => {
  if (currentScenarioIndex.value === -1) {
    // 自定义场景
    return buildCustomScenario(customGrammarStr.value, inputStr.value)
  }
  return scenarios[currentScenarioIndex.value]
})

function buildCustomScenario(text: string, defaultInput: string): SDDScenario {
  const lines = text.split('\n').filter(l => l.trim().length > 0)
  
  // 1. 提取文法部分和语义规则部分
  // 假设格式: Prod { Rule }
  let grammarLines: string[] = []
  const displayRules: Record<string, string> = {}
  const computeActions: Record<string, SDDAction> = {}

  lines.forEach(line => {
    const match = line.match(/^([^\{]+)(\{(.+)\})?$/)
    if (match) {
      const prodPart = match[1].trim()
      const rulePart = match[3] ? match[3].trim() : ''
      
      grammarLines.push(prodPart)
      
      // 规范化 prodKey: 需要和 parseGrammar 的输出一致
      // parseGrammar 会 split('->') 然后 trim，rhs split(' ')
      // 我们这里简单处理：手动构建一下 key
      // 注意：parseGrammar 会处理 | 符号，这里暂不支持在自定义模式下用 | 混写语义规则
      // 建议用户每行写一个产生式
      const parts = prodPart.split(/->|:/)
      if (parts.length >= 2) {
        const lhs = parts[0].trim()
        const rhs = parts[1].trim().split(/\s+/).filter(s => s).join(' ')
        const key = `${lhs} -> ${rhs}`
        
        if (rulePart) {
          displayRules[key] = rulePart
          computeActions[key] = compileAction(rulePart)
        }
      }
    }
  })

  return {
    name: '自定义场景',
    grammarStr: grammarLines.join('\n'),
    inputStr: defaultInput,
    displayRules,
    computeActions
  }
}

// 监听场景切换，重置
watch(currentScenarioIndex, (newVal) => {
  if (newVal !== -1) {
    inputStr.value = scenarios[newVal].inputStr
  }
  reset()
})

function reset() {
  parseTree.value = null
  renderNodes.value = []
  renderLinks.value = []
  executionQueue.value = []
  currentStepNode.value = null
  currentRule.value = ''
  isComputed.value = false
  errorMsg.value = ''
}

function parse() {
  reset()
  try {
    const grammar = parseGrammar(currentScenario.value.grammarStr)
    const firstRes = computeFirst(grammar)
    const lr1Table = buildLR1Table(grammar, firstRes.map)
    
    // 简单的 token 分割：按空格分，保留数字作为一个 token，符号作为一个 token
    // 这里为了适配 '3 * 5' 这种，我们需要更智能一点的 tokenizer
    // 简易 Tokenizer: 匹配数字、ID、常见双字符运算符、或单字符符号
    const rawTokens = inputStr.value.match(/\d+|[a-zA-Z_]\w*|==|!=|<=|>=|->|:=|[^\s\w]/g)
    if (!rawTokens) {
      errorMsg.value = '无法识别输入串'
      return
    }

    const root = parseLR1(rawTokens, lr1Table, grammar, grammar.startSymbol)
    
    if (!root) {
      errorMsg.value = '语法分析失败：输入串不符合文法'
      return
    }

    // 布局
    const layout = layoutTree(root)
    treeLayout.value = layout
    parseTree.value = root
    
    const flat = flattenTree(root)
    renderNodes.value = flat.nodes
    renderLinks.value = flat.links

    // 生成后序遍历序列用于 S-属性计算
    generatePostOrder(root)

  } catch (e: any) {
    errorMsg.value = e.message
  }
}

function generatePostOrder(node: ParseTreeNode) {
  if (node.children) {
    node.children.forEach(c => generatePostOrder(c))
  }
  // 只有非终结符需要计算（或者终结符已经有 lexval 了）
  // 实际上我们把所有节点都放进去，如果是终结符，我们在 step 时跳过或仅高亮
  executionQueue.value.push(node)
}

function step() {
  if (executionQueue.value.length === 0) {
    isComputed.value = true
    currentStepNode.value = null
    currentRule.value = '计算完成！'
    return
  }

  const node = executionQueue.value.shift()!
  currentStepNode.value = node
  node.isHighlight = true
  
  // 如果是终结符，通常不需要计算，属性已在 lexval
  if (!node.production) {
    currentRule.value = `终结符 ${node.symbol} (值: ${node.attributes.lexval ?? node.tokenValue})`
    node.isCalculated = true
    return
  }

  // 非终结符，查找规则并计算
  const prodKey = `${node.production.lhs} -> ${node.production.rhs.join(' ')}`
  const action = currentScenario.value.computeActions[prodKey]
  const ruleDisplay = currentScenario.value.displayRules[prodKey]

  if (action) {
    currentRule.value = ruleDisplay || prodKey
    action(node.children, node)
  } else {
    currentRule.value = `无语义规则: ${prodKey}`
  }
  
  node.isCalculated = true
}

function autoPlay() {
  if (isComputed.value) return
  const timer = setInterval(() => {
    if (executionQueue.value.length === 0) {
      clearInterval(timer)
      step() // 触发完成状态
    } else {
      step()
    }
  }, 800)
}

// 格式化属性显示
function formatAttrs(attrs: Record<string, any>) {
  return Object.entries(attrs)
    .map(([k, v]) => `${k}=${v}`)
    .join('\n')
}
</script>

<template>
  <div class="sdd-analyzer">
    <div class="controls">
      <div class="control-group">
        <label>选择场景：</label>
        <select v-model="currentScenarioIndex">
          <option v-for="(s, i) in scenarios" :key="i" :value="i">{{ s.name }}</option>
          <option :value="-1">自定义场景</option>
        </select>
      </div>
      
      <div class="control-group full-width" v-if="currentScenarioIndex === -1">
        <label>自定义文法与语义规则 (格式: 产生式 { 语义规则 })：</label>
        <textarea v-model="customGrammarStr" rows="6" placeholder="E -> E + T { val = $1.val + $3.val }"></textarea>
        <div class="hint">说明: $1 代表右部第1个符号的属性, $3 代表第3个符号。例如 val = $1.val + $3.val</div>
      </div>
      
      <div class="control-group">
        <label>输入串：</label>
        <input v-model="inputStr" placeholder="例如: 3 * 5 + 4" @keyup.enter="parse" />
        <button class="primary-btn" @click="parse">生成语法树</button>
      </div>

      <div class="control-group" v-if="parseTree">
        <button class="action-btn" @click="step" :disabled="isComputed">
          单步计算
        </button>
        <button class="action-btn" @click="autoPlay" :disabled="isComputed">
          自动播放
        </button>
        <button class="reset-btn" @click="reset">重置</button>
      </div>
    </div>

    <div v-if="errorMsg" class="error-msg">{{ errorMsg }}</div>

    <div class="status-bar" v-if="parseTree">
      <div class="current-rule">
        <span class="label">当前执行：</span>
        <span class="content">{{ currentRule || '准备就绪' }}</span>
      </div>
    </div>

    <div class="canvas-container" v-if="parseTree">
      <svg :width="Math.max(800, treeLayout.width + 100)" :height="Math.max(500, treeLayout.height + 100)">
        <g transform="translate(50, 20)">
          <!-- 连线 -->
          <line v-for="(link, i) in renderLinks" :key="'link-'+i"
            :x1="link.x1" :y1="link.y1"
            :x2="link.x2" :y2="link.y2"
            stroke="#ccc" stroke-width="2"
          />
          
          <!-- 节点 -->
          <g v-for="node in renderNodes" :key="node.id"
             :transform="`translate(${node.x}, ${node.y})`"
             class="node-group"
             :class="{ 'highlight': node.isHighlight, 'calculated': node.isCalculated }"
          >
            <!-- 节点背景 -->
            <rect x="-30" y="-20" width="60" height="40" rx="6" ry="6" class="node-rect" />
            
            <!-- 符号 -->
            <text text-anchor="middle" y="5" class="node-symbol">{{ node.symbol }}</text>
            
            <!-- 属性值 (悬浮在节点右侧或下方) -->
            <foreignObject x="35" y="-25" width="120" height="60" v-if="Object.keys(node.attributes).length > 0">
              <div class="node-attrs">
                <div v-for="(val, key) in node.attributes" :key="key">
                  {{ key }}={{ val }}
                </div>
              </div>
            </foreignObject>
          </g>
        </g>
      </svg>
    </div>
    
    <div class="grammar-preview">
      <h3>当前文法与语义规则</h3>
      <div class="rules-grid">
        <div class="rule-row header">
          <div>产生式</div>
          <div>语义规则</div>
        </div>
        <div class="rule-row" v-for="(rule, prod) in currentScenario.displayRules" :key="prod">
          <div class="prod">{{ prod }}</div>
          <div class="rule">{{ rule }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.sdd-analyzer {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.controls {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  align-items: flex-end;
  padding: 16px;
  background-color: var(--vp-c-bg-soft);
  border-radius: 8px;
}

.control-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.control-group.full-width {
  width: 100%;
  flex-basis: 100%;
}

textarea {
  width: 100%;
  padding: 8px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 4px;
  background-color: var(--vp-c-bg);
  font-family: monospace;
  font-size: 14px;
}

.hint {
  font-size: 12px;
  color: var(--vp-c-text-2);
}

input, select {
  padding: 8px 12px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 4px;
  background-color: var(--vp-c-bg);
  min-width: 200px;
}

button {
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;
}

.primary-btn {
  background-color: var(--vp-c-brand-1);
  color: white;
  border: none;
}

.primary-btn:hover {
  background-color: var(--vp-c-brand-2);
}

.action-btn {
  background-color: var(--vp-c-green-soft);
  color: var(--vp-c-green-1);
  border: 1px solid var(--vp-c-green-2);
}

.reset-btn {
  background-color: var(--vp-c-red-soft);
  color: var(--vp-c-red-1);
  border: 1px solid var(--vp-c-red-2);
}

.error-msg {
  color: var(--vp-c-red-1);
  padding: 12px;
  background-color: var(--vp-c-red-soft);
  border-radius: 4px;
}

.status-bar {
  padding: 12px;
  background-color: var(--vp-c-bg-alt);
  border-left: 4px solid var(--vp-c-brand-1);
  border-radius: 4px;
}

.current-rule .label {
  font-weight: bold;
  color: var(--vp-c-text-2);
}

.current-rule .content {
  font-family: monospace;
  font-weight: bold;
  color: var(--vp-c-brand-1);
  margin-left: 8px;
}

.canvas-container {
  overflow: auto;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  background-color: white; /* 始终白底以便看清 */
}

/* 节点样式 */
.node-rect {
  fill: #fff;
  stroke: #666;
  stroke-width: 2px;
  transition: all 0.3s;
}

.node-symbol {
  font-weight: bold;
  font-family: monospace;
  fill: #333;
  pointer-events: none;
}

.node-group.highlight .node-rect {
  stroke: var(--vp-c-brand-1);
  stroke-width: 3px;
  fill: var(--vp-c-brand-soft);
}

.node-group.calculated .node-rect {
  stroke: var(--vp-c-green-1);
}

.node-attrs {
  font-size: 12px;
  color: #d63200;
  background: rgba(255, 255, 255, 0.9);
  padding: 2px 4px;
  border-radius: 4px;
  font-family: monospace;
  pointer-events: none;
}

.grammar-preview {
  margin-top: 20px;
}

.rules-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1px;
  background-color: var(--vp-c-divider);
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  overflow: hidden;
}

.rule-row {
  display: contents;
}

.rule-row > div {
  padding: 8px 12px;
  background-color: var(--vp-c-bg);
  font-family: monospace;
  font-size: 0.9em;
}

.rule-row.header > div {
  background-color: var(--vp-c-bg-soft);
  font-weight: bold;
  color: var(--vp-c-text-1);
}
</style>
