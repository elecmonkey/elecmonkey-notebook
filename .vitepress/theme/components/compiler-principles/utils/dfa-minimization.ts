
import { DFAState } from './subset-construction';

export interface PartitionStep {
  round: number;
  groups: number[][]; // 每个组包含的状态 ID 列表
  splitReason?: string; // 描述发生了什么分裂
}

export interface MinimizedDFA {
  startState: DFAState;
  states: DFAState[]; // 所有状态列表，方便遍历
  steps: PartitionStep[];
}

// 辅助：获取所有可达状态
function getAllStates(startState: DFAState): DFAState[] {
  const visited = new Set<number>();
  const states: DFAState[] = [];
  const queue = [startState];
  visited.add(startState.id);

  while (queue.length > 0) {
    const s = queue.shift()!;
    states.push(s);
    for (const target of s.transitions.values()) {
      if (!visited.has(target.id)) {
        visited.add(target.id);
        queue.push(target);
      }
    }
  }
  return states.sort((a, b) => a.id - b.id);
}

// 辅助：获取字母表
function getAlphabet(states: DFAState[]): string[] {
  const alphabet = new Set<string>();
  for (const s of states) {
    for (const symbol of s.transitions.keys()) {
      alphabet.add(symbol);
    }
  }
  return Array.from(alphabet).sort();
}

export function minimizeDFA(startState: DFAState): MinimizedDFA {
  const allStates = getAllStates(startState);
  const alphabet = getAlphabet(allStates);
  
  // 0. 初始划分：接受态和非接受态
  let groups: DFAState[][] = [];
  const accepting = allStates.filter(s => s.isAccepting);
  const nonAccepting = allStates.filter(s => !s.isAccepting);
  
  if (accepting.length > 0) groups.push(accepting);
  if (nonAccepting.length > 0) groups.push(nonAccepting);
  
  const steps: PartitionStep[] = [];
  steps.push({
    round: 0,
    groups: groups.map(g => g.map(s => s.id).sort((a, b) => a - b)),
    splitReason: 'Initial partition: Accepting vs Non-Accepting'
  });

  let round = 1;
  let changed = true;

  while (changed) {
    changed = false;
    const newGroups: DFAState[][] = [];
    const stateToGroupIndex = new Map<number, number>();

    // 建立状态 ID 到组索引的映射，方便快速查找
    groups.forEach((g, idx) => {
      g.forEach(s => stateToGroupIndex.set(s.id, idx));
    });

    for (const group of groups) {
      if (group.length <= 1) {
        newGroups.push(group);
        continue;
      }

      // 尝试分裂当前组
      // 使用 Map<Signature, State[]> 进行分组
      // Signature 是一个字符串，表示该状态对每个输入符号转移到的目标组索引
      const buckets = new Map<string, DFAState[]>();

      for (const state of group) {
        const signature = alphabet.map(symbol => {
          const target = state.transitions.get(symbol);
          if (!target) return -1; // 无转移，视为特殊组 -1 (死状态)
          // 这里的 target 必须是 allStates 里的，如果 DFA 是完整的，一定能找到
          // 如果 target 是死状态且不在 allStates 里（未实现），则可能 undefined
          // 假设 subset construction 产生的 DFA 是部分转移函数形式
          return stateToGroupIndex.get(target.id) ?? -1;
        }).join('|');

        if (!buckets.has(signature)) {
          buckets.set(signature, []);
        }
        buckets.get(signature)!.push(state);
      }

      for (const subGroup of buckets.values()) {
        newGroups.push(subGroup);
      }

      if (buckets.size > 1) {
        changed = true;
      }
    }

    groups = newGroups;
    
    // 记录步骤
    steps.push({
      round: round++,
      groups: groups.map(g => g.map(s => s.id).sort((a, b) => a - b)),
      splitReason: changed ? 'Split based on transitions' : 'Stable (No changes)'
    });
  }

  // 构造最小化后的 DFA
  // 每个组选一个代表，或者创建一个新状态
  // 为了直观，我们创建一个新状态，ID 为该组第一个状态的 ID (或者新编号)
  // 为了让用户看懂，我们用新 ID，但在 Label 里说明它包含哪些旧状态
  
  const newStatesMap = new Map<number, DFAState>(); // group index -> new state
  const oldStateToGroupIndex = new Map<number, number>();
  
  groups.forEach((g, idx) => {
    g.forEach(s => oldStateToGroupIndex.set(s.id, idx));
  });

  // 创建新状态对象
  groups.forEach((g, idx) => {
    // 组内任何一个状态的属性都代表该组（因为它们是等价的）
    const representative = g[0];
    const isAccepting = representative.isAccepting;
    const isStart = g.some(s => s.isStart); // 如果组内包含原开始状态，则新状态为开始状态
    
    // 合并 nfaStates 以便显示信息
    const combinedNfaStates = new Set<number>();
    g.forEach(s => s.nfaStates.forEach(n => combinedNfaStates.add(n)));

    const newState: DFAState = {
      id: idx, // 使用组索引作为新 ID，简单明了
      nfaStates: combinedNfaStates, // 这里存的是合并后的 NFA 状态集，仅供展示
      transitions: new Map(),
      isAccepting,
      isStart
    };
    newStatesMap.set(idx, newState);
  });

  // 建立转移
  groups.forEach((g, idx) => {
    const sourceNewState = newStatesMap.get(idx)!;
    const representative = g[0];
    
    for (const symbol of alphabet) {
      const targetOld = representative.transitions.get(symbol);
      if (targetOld) {
        const targetGroupIdx = oldStateToGroupIndex.get(targetOld.id);
        if (targetGroupIdx !== undefined) {
          const targetNewState = newStatesMap.get(targetGroupIdx)!;
          sourceNewState.transitions.set(symbol, targetNewState);
        }
      }
    }
  });

  const finalStates = Array.from(newStatesMap.values());
  const finalStart = finalStates.find(s => s.isStart)!;

  return {
    startState: finalStart,
    states: finalStates,
    steps
  };
}
