
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

export function dfaToMermaid(startState: DFAState, direction: 'LR' | 'TD' = 'LR'): string {
  let mermaid = `graph ${direction}\n`;
  
  // 样式定义
  mermaid += '    %% Styles\n';
  mermaid += '    classDef start fill:#e1f5fe,stroke:#01579b,stroke-width:2px;\n';
  mermaid += '    classDef accept fill:#e8f5e9,stroke:#2e7d32,stroke-width:2px,stroke-dasharray: 5 5;\n';
  mermaid += '    classDef normal fill:#fff,stroke:#333,stroke-width:1px;\n';

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
    let className = 'normal';
    let label = state.id.toString();
    
    // 显示包含的 NFA 状态，增强可视化效果
    const nfaIds = Array.from(state.nfaStates).sort((a,b)=>a-b).join(',');

    if (state.isStart) {
        className = 'start';
        label = `start\n{${nfaIds}}`;
    } else if (state.isAccepting) {
        className = 'accept';
        label = `end\n{${nfaIds}}`;
    } else {
        label = `${state.id}\n{${nfaIds}}`;
    }

    // 替换 label 中的换行符以适应 Mermaid 字符串语法
    // Mermaid 字符串中换行需要引号
    
    const shapeStart = state.isAccepting ? '((' : '(';
    const shapeEnd = state.isAccepting ? '))' : ')';
    
    mermaid += `    ${state.id}${shapeStart}"${label.replace(/\n/g, '<br/>')}"${shapeEnd}:::${className}\n`;
  });

  // 边
  states.forEach(state => {
    state.transitions.forEach((target, symbol) => {
      mermaid += `    ${state.id} -->|"${symbol}"| ${target.id}\n`;
    });
  });

  return mermaid;
}
