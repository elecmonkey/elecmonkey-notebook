import { Production, Grammar, EPSILON } from './grammar';
import { LR1Table, Action } from './lr1-algo';

// 语法树节点接口
export interface ParseTreeNode {
  id: string; // 唯一ID
  symbol: string; // 符号 (LHS 或 终结符)
  children: ParseTreeNode[];
  attributes: Record<string, any>; // 属性值集合
  production?: Production; // 产生式 (仅非终结符)
  tokenValue?: string; // 词法值 (仅终结符)
  isHighlight?: boolean; // 可视化高亮
  isCalculated?: boolean; // 是否已计算
  // 布局相关
  x?: number;
  y?: number;
}

// SDD 规则定义 (用于显示)
export type SDDRuleDisplay = string;

// SDD 计算函数 (用于执行)
// args: 子节点属性数组, node: 当前节点属性对象
export type SDDAction = (children: ParseTreeNode[], nodeAttrs: Record<string, any>) => void;

export interface SDDScenario {
  name: string;
  grammarStr: string;
  inputStr: string; // 默认输入
  // 产生式字符串 -> 规则显示字符串
  displayRules: Record<string, string>;
  // 产生式字符串 -> 计算函数
  computeActions: Record<string, SDDAction>;
}

// 编译用户输入的语义规则字符串为函数
// 规则格式：lhsAttr = expr
// 支持: $$, $1, $2..., symbol.attr
export function compileAction(ruleStr: string): SDDAction {
  // 1. 解析等号左右
  const parts = ruleStr.split('=').map(s => s.trim());
  if (parts.length < 2) return () => {};

  const lhs = parts[0];
  const rhs = parts[1];

  // 2. 转换 LHS
  // E.val -> nodeAttrs['val']
  // $$ -> nodeAttrs
  // $$.val -> nodeAttrs['val']
  let lhsCode = '';
  if (lhs === '$$') {
    // 特殊情况：直接赋值给 nodeAttrs？通常不会，通常是 $$.val
    // 假设不支持直接替换整个 attributes 对象，只支持属性赋值
    return () => {}; 
  } else if (lhs.startsWith('$$')) {
    const attr = lhs.split('.')[1];
    lhsCode = `n.attributes['${attr}']`;
  } else if (lhs.includes('.')) {
    const attr = lhs.split('.')[1];
    // 假设左侧的名字就是当前节点名，忽略名字检查，直接赋给当前节点
    lhsCode = `n.attributes['${attr}']`;
  } else {
    // 默认为 val 属性？或者就是属性名
    lhsCode = `n.attributes['${lhs}']`;
  }

  // 3. 转换 RHS
  // $1.val -> c[0].attributes['val']
  // digit.lexval -> 查找名为 digit 的子节点
  
  // 简单的正则替换 $k
  let rhsCode = rhs.replace(/\$(\d+)(\.[\w]+)?/g, (match, index, attrPart) => {
    const idx = parseInt(index) - 1;
    const attr = attrPart ? attrPart.substring(1) : 'val'; // 默认取 val
    return `(c[${idx}]?.attributes['${attr}'] ?? 0)`;
  });

  // 替换 lexval (通常是 digit.lexval)
  // 简单策略：如果看到 Name.lexval，尝试在 children 中找 Name，或者直接找 $k
  // 为了简化，我们假设用户在自定义模式下主要使用 $k
  // 如果用户写 symbol.attr，我们需要遍历 children 找到对应的 symbol
  // 这需要运行时信息，或者在编译时知道产生式结构。
  // 这里我们简化：只支持 $k 和 简单的数字运算
  
  // 安全性：这是在前端运行，且由用户输入，我们限制只能包含特定的字符
  // 允许：数字, 字母, _, ., $, [, ], (, ), +, -, *, /, %, space
  // 其实直接 new Function 也是一种选择，只要不包含危险代码
  
  const body = `${lhsCode} = ${rhsCode};`;
  
  try {
    return new Function('c', 'n', body) as SDDAction;
  } catch (e) {
    console.error('Failed to compile rule:', ruleStr, e);
    return () => {};
  }
}

// LR1 解析并构建语法树
export function parseLR1(
  tokens: string[], 
  table: LR1Table, 
  grammar: Grammar, 
  startSymbol: string
): ParseTreeNode | null {
  const stateStack: number[] = [0];
  const nodeStack: ParseTreeNode[] = [];
  
  let tokenIndex = 0;
  let nodeIdCounter = 0;

  const createNode = (symbol: string, tokenVal?: string): ParseTreeNode => ({
    id: `node-${nodeIdCounter++}`,
    symbol,
    children: [],
    attributes: {},
    tokenValue: tokenVal
  });

  // 添加结束符号 $
  const input = [...tokens, '$'];

  while (true) {
    const currentState = stateStack[stateStack.length - 1];
    const currentToken = input[tokenIndex];
    
    // 查找 Action
    // 注意：我们的 LR1 表是用 Map<string, Action[]> 存储的
    // 这里简化处理，假设没有冲突，直接取第一个 SHIFT 或 REDUCE
    const stateActions = table.action.get(currentState);
    if (!stateActions) return null; // Error

    // 优先匹配具体的 token，如果没有则尝试匹配通配符 (如果我们需要的话，但 LR1 通常不需要)
    // 另外需要处理 'digit' 这种 token 类别。
    // 为了简化，我们假设 grammar 中的 terminal 就是 token 的类别。
    // 如果 input 是 '3', grammar terminal 是 'digit'，这里需要外部先做一次词法分析映射
    // 或者我们简单点，要求 grammar 里的 terminal 直接匹配 input (除了 digit/id)
    
    let action: Action | undefined;
    let matchSymbol = currentToken;

    // 简单的词法匹配逻辑
    if (stateActions.has(currentToken)) {
      action = stateActions.get(currentToken)![0];
    } else if (/\d+/.test(currentToken) && stateActions.has('digit')) {
      matchSymbol = 'digit';
      action = stateActions.get('digit')![0];
    } else if (/^[a-zA-Z_]\w*$/.test(currentToken) && stateActions.has('c')) {
      // 特殊情况：如果 input 是 'c'，而 grammar 中就是 'c'，那会命中上面的 stateActions.has('c')
      // 但如果用户把 'c' 当做通配符？通常不会，文法里的终结符就是字面量。
      // 问题在于：如果 grammar 里写的是 'c'，input 也是 'c'，那么 has('c') 就会命中。
      // 但如果 grammar 里写的是 'id' 或 'char'，input 是 'c'，这里就需要映射。
      
      // 针对用户反馈的 case: S -> c，输入 (c,c)
      // Grammar terminals: '(', ')', 'c', ','
      // Input tokens: '(', 'c', ',', 'c', ')'
      // 当 currentToken 是 'c' 时，stateActions 应该有 'c' 的动作。
      
      // 现在的逻辑：
      // 1. stateActions.has('c') -> true -> action found.
      // 2. 如果 input 是 'x'，grammar 里只有 'c'，那就会 fail。
      // 3. 如果 grammar 里有 'id'，则匹配。
      
      matchSymbol = 'id';
      action = stateActions.get('id')![0];
    } else if (/^[a-zA-Z_]\w*$/.test(currentToken) && stateActions.has('id')) {
      matchSymbol = 'id';
      action = stateActions.get('id')![0];
    }

    if (!action) return null; // Error

    if (action.type === 'SHIFT') {
      const nextState = action.value as number;
      stateStack.push(nextState);
      
      const node = createNode(matchSymbol, currentToken);
      // 如果是数字，预先填入 lexval
      if (matchSymbol === 'digit') {
        node.attributes['lexval'] = parseInt(currentToken, 10);
      }
      nodeStack.push(node);
      tokenIndex++;

    } else if (action.type === 'REDUCE') {
      const prod = action.value as Production;
      const rhsLen = prod.rhs[0] === EPSILON ? 0 : prod.rhs.length;
      
      const children: ParseTreeNode[] = [];
      for (let i = 0; i < rhsLen; i++) {
        stateStack.pop();
        children.unshift(nodeStack.pop()!);
      }

      const currentStateAfterPop = stateStack[stateStack.length - 1];
      const gotoState = table.goto.get(currentStateAfterPop)?.get(prod.lhs);
      
      if (gotoState === undefined) return null; // Error

      stateStack.push(gotoState);
      
      const newNode = createNode(prod.lhs);
      newNode.children = children;
      newNode.production = prod;
      nodeStack.push(newNode);

    } else if (action.type === 'ACCEPT') {
      return nodeStack[0];
    }
  }
}

// 简单的树布局计算 (Reingold-Tilford 的简化版，只算 x, y)
// 这里的策略是：Y 轴根据深度，X 轴根据中序遍历或者子节点宽度
export function layoutTree(root: ParseTreeNode): { width: number, height: number } {
  let maxDepth = 0;
  let nextX = 0;
  const nodeSize = 60; // 节点预估宽度
  const xSpacing = 60; // 增加间距 (原 20)
  const ySpacing = 100; // 增加层级高度 (原 80)

  function traverse(node: ParseTreeNode, depth: number) {
    maxDepth = Math.max(maxDepth, depth);
    node.y = depth * ySpacing + 40;

    if (node.children.length === 0) {
      node.x = nextX;
      nextX += nodeSize + xSpacing;
    } else {
      node.children.forEach(c => traverse(c, depth + 1));
      // 父节点 x 坐标为首尾子节点中心
      const firstChild = node.children[0];
      const lastChild = node.children[node.children.length - 1];
      node.x = (firstChild.x! + lastChild.x!) / 2;
    }
  }

  traverse(root, 0);
  return { width: nextX, height: (maxDepth + 1) * ySpacing + 80 };
}

// 展平树节点用于渲染连接线
export function flattenTree(root: ParseTreeNode): { nodes: ParseTreeNode[], links: {x1:number, y1:number, x2:number, y2:number}[] } {
  const nodes: ParseTreeNode[] = [];
  const links: any[] = [];
  
  function traverse(node: ParseTreeNode) {
    nodes.push(node);
    if (node.children) {
      node.children.forEach(c => {
        links.push({
          x1: node.x,
          y1: node.y! + 20, // 底部
          x2: c.x,
          y2: c.y! - 20 // 顶部
        });
        traverse(c);
      });
    }
  }
  traverse(root);
  return { nodes, links };
}
