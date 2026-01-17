
import { NFAState, NFAFragment } from './thompson';

export interface DFAState {
  id: number;
  nfaStates: Set<number>; // 该 DFA 状态包含的 NFA 状态集合
  transitions: Map<string, DFAState>;
  isAccepting: boolean;
  isStart?: boolean;
}

export interface ConstructionStep {
  dfaStateId: number;
  nfaStates: number[];
  symbol: string;
  moveResult: number[];
  targetClosure: number[];
  targetDfaStateId: number;
  isNewState: boolean;
}

export interface ConstructionResult {
  startState: DFAState;
  steps: ConstructionStep[];
}

// 计算 epsilon 闭包
function epsilonClosure(states: NFAState[]): Set<NFAState> {
  const closure = new Set<NFAState>(states);
  const stack = [...states];

  while (stack.length > 0) {
    const currentState = stack.pop()!;
    const transitions = currentState.transitions.get('ε');
    
    if (transitions) {
      for (const nextState of transitions) {
        if (!closure.has(nextState)) {
          closure.add(nextState);
          stack.push(nextState);
        }
      }
    }
  }

  return closure;
}

// 辅助函数：生成状态集合的唯一标识（排序后的 ID 字符串）
function getStateSetId(states: Set<NFAState>): string {
  return Array.from(states)
    .map(s => s.id)
    .sort((a, b) => a - b)
    .join(',');
}

export function subsetConstruction(nfa: NFAFragment): ConstructionResult {
  let dfaStateCounter = 0;
  const steps: ConstructionStep[] = [];
  const initialClosure = epsilonClosure([nfa.start]);
  
  const startDFAState: DFAState = {
    id: dfaStateCounter++,
    nfaStates: new Set(Array.from(initialClosure).map(s => s.id)),
    transitions: new Map(),
    isAccepting: Array.from(initialClosure).some(s => s.isAccepting),
    isStart: true
  };

  // 映射：状态集合 ID -> DFA 状态
  const dfaStatesMap = new Map<string, DFAState>();
  dfaStatesMap.set(getStateSetId(initialClosure), startDFAState);

  const workList: { dfaState: DFAState, nfaStates: Set<NFAState> }[] = [
    { dfaState: startDFAState, nfaStates: initialClosure }
  ];

  // 收集所有输入符号 (排除 epsilon)
  const inputSymbols = new Set<string>();
  const collectSymbols = (state: NFAState, visited: Set<number>) => {
    if (visited.has(state.id)) return;
    visited.add(state.id);
    for (const [symbol, targets] of state.transitions.entries()) {
      if (symbol !== 'ε') inputSymbols.add(symbol);
      targets.forEach(t => collectSymbols(t, visited));
    }
  };
  collectSymbols(nfa.start, new Set());
  
  // Sort symbols for consistent step order
  const sortedSymbols = Array.from(inputSymbols).sort();

  // Process worklist (BFS order usually)
  // To keep consistent order for table display, let's use a queue instead of stack (shift/push) if we want BFS
  // But array pop/push is DFS. Let's use index iteration or just keep using pop (DFS)
  // Actually, standard algorithm description often implies "mark T as processed", so order doesn't strictly matter for correctness
  // But for "Steps" display, maybe we want to sort states by ID?
  // Let's stick to the current logic but record steps.

  while (workList.length > 0) {
    // Use shift for BFS (process states in creation order usually looks better in tables)
    // But original code used pop() which is DFS/LIFO. Let's switch to shift() for BFS behavior which is more intuitive for students.
    const { dfaState, nfaStates } = workList.shift()!; 

    for (const symbol of sortedSymbols) {
      // 找到 move(nfaStates, symbol)
      const moveResult = new Set<NFAState>();
      for (const ns of nfaStates) {
        const targets = ns.transitions.get(symbol);
        if (targets) {
          targets.forEach(t => moveResult.add(t));
        }
      }

      if (moveResult.size === 0) continue;

      // 计算 epsilon-closure(moveResult)
      const targetClosure = epsilonClosure(Array.from(moveResult));
      const targetSetId = getStateSetId(targetClosure);

      let targetDFAState = dfaStatesMap.get(targetSetId);
      let isNewState = false;

      if (!targetDFAState) {
        isNewState = true;
        targetDFAState = {
          id: dfaStateCounter++,
          nfaStates: new Set(Array.from(targetClosure).map(s => s.id)),
          transitions: new Map(),
          isAccepting: Array.from(targetClosure).some(s => s.isAccepting)
        };
        dfaStatesMap.set(targetSetId, targetDFAState);
        workList.push({ dfaState: targetDFAState, nfaStates: targetClosure });
      }

      dfaState.transitions.set(symbol, targetDFAState);

      // Record step
      steps.push({
        dfaStateId: dfaState.id,
        nfaStates: Array.from(nfaStates).map(s => s.id).sort((a,b)=>a-b),
        symbol: symbol,
        moveResult: Array.from(moveResult).map(s => s.id).sort((a,b)=>a-b),
        targetClosure: Array.from(targetClosure).map(s => s.id).sort((a,b)=>a-b),
        targetDfaStateId: targetDFAState.id,
        isNewState
      });
    }
  }

  return { startState: startDFAState, steps };
}

// 转换为 Graphviz DOT 格式
export function dfaToDot(startState: DFAState, direction: 'LR' | 'TD' = 'LR'): string {
  let dot = 'digraph DFA {\n';
  dot += `  rankdir=${direction};\n`;
  dot += '  graph [bgcolor="transparent", nodesep=0.5, ranksep=0.5, splines=spline];\n';
  dot += '  node [fontname="Helvetica", fontsize=14, shape=circle, fixedsize=true, width=0.8, height=0.8, style="filled", fillcolor="white", color="#333", penwidth=1.5];\n';
  dot += '  edge [fontname="Helvetica", fontsize=12, arrowsize=0.8];\n';

  // Add visual start node
  dot += '  start [shape=none, label="start"];\n';
  dot += `  start -> ${startState.id} [penwidth=1.5];\n`;

  const visited = new Set<number>();
  const queue = [startState];
  const states: DFAState[] = [];

  visited.add(startState.id);

  let head = 0;
  while(head < queue.length){
      const current = queue[head++];
      states.push(current);
      
      for(const target of current.transitions.values()){
          if(!visited.has(target.id)){
              visited.add(target.id);
              queue.push(target);
          }
      }
  }

  // 节点
  states.forEach(state => {
    let label = state.id.toString();
    let shape = 'circle';
    let fillcolor = 'white';
    let color = '#333';
    
    // 显示包含的 NFA 状态，增强可视化效果
    // 注意：Graphviz label 支持 HTML-like 标签，或者 \n 换行
    const nfaIds = Array.from(state.nfaStates).sort((a,b)=>a-b).join(',');
    
    // 统一设置 label
    label = `${state.id}\\n{${nfaIds}}`;

    // 优先判断接受态，设置双圈
    if (state.isAccepting) {
        shape = 'doublecircle';
        fillcolor = '#e8f5e9';
        color = '#2e7d32';
    }

    // 如果是开始态，覆盖颜色，但保持形状（如果是接受态则保持双圈）
    if (state.isStart) {
        fillcolor = '#e1f5fe';
        color = '#01579b';
    }

    // 动态调整节点大小和字体
    // 基础大小 0.8，根据内容长度适当增加
    // NFA集合可能会很长，如 {1,2,3,4,5,6,7,8,9,10}
    // 粗略估算字符长度
    const len = nfaIds.length;
    let width = 0.8;
    let fontsize = 14;

    if (len > 8) {
      // 增加系数 0.04 -> 0.06，让圈更大一点
      width = 0.8 + (len - 8) * 0.06; 
      // 限制最大宽度放宽到 3.0
      if (width > 3.0) width = 3.0;
      
      // 字体缩放更激进
      fontsize = 12;
      if (len > 15) fontsize = 11;
      if (len > 25) fontsize = 10;
    }
    
    // 保持正圆
    let height = width;

    dot += `  ${state.id} [label="${label}", shape=${shape}, fillcolor="${fillcolor}", color="${color}", width=${width}, height=${height}, fontsize=${fontsize}];\n`;
  });

  // 边
  // 为了合并多条边 (如 a,b 指向同一个节点)，我们需要先聚合
  states.forEach(state => {
      const targetMap = new Map<number, string[]>();
      
      state.transitions.forEach((target, symbol) => {
          if (!targetMap.has(target.id)) {
              targetMap.set(target.id, []);
          }
          targetMap.get(target.id)!.push(symbol);
      });

      targetMap.forEach((symbols, targetId) => {
          const label = symbols.sort().join(',');
          dot += `  ${state.id} -> ${targetId} [label="${label}"];\n`;
      });
  });

  dot += '}\n';
  return dot;
}
