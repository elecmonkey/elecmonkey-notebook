
import { Grammar, EPSILON, Production } from './grammar';

export type SymbolSet = Set<string>;
export type SymbolMap = Map<string, SymbolSet>;

export interface CalculationStep {
  symbol: string;
  added: string[];
  reason: string;
}

export interface FirstResult {
  map: SymbolMap;
  steps: CalculationStep[];
}

export interface FollowResult {
  map: SymbolMap;
  steps: CalculationStep[];
}

// 计算 First 集
export function computeFirst(grammar: Grammar): FirstResult {
  const first: SymbolMap = new Map();
  const steps: CalculationStep[] = [];

  // 初始化：所有终结符的 First 集包含自身
  grammar.terminals.forEach(t => {
    first.set(t, new Set([t]));
    // steps.push({ symbol: t, added: [t], reason: 'Terminal' }); // Usually not shown
  });
  // 特殊处理：EPSILON 的 First 集包含自身
  first.set(EPSILON, new Set([EPSILON]));

  // 初始化：非终结符 First 集为空
  grammar.nonTerminals.forEach(nt => {
    first.set(nt, new Set());
  });

  let changed = true;
  while (changed) {
    changed = false;

    for (const prod of grammar.productions) {
      const { lhs, rhs } = prod;
      const lhsFirst = first.get(lhs)!;
      const initialSize = lhsFirst.size;
      const newAdditions: string[] = [];

      // 如果右部是 epsilon
      if (rhs.length === 1 && rhs[0] === EPSILON) {
        if (!lhsFirst.has(EPSILON)) {
          lhsFirst.add(EPSILON);
          newAdditions.push(EPSILON);
          changed = true;
          steps.push({
            symbol: lhs,
            added: [EPSILON],
            reason: `${lhs} -> ε`
          });
        }
        continue;
      }

      // X -> Y1 Y2 ... Yk
      let allNullable = true;
      for (const symbol of rhs) {
        const symbolFirst = first.get(symbol);
        if (!symbolFirst) {
            allNullable = false;
            break;
        }

        // 把 First(symbol) - {ε} 加入 First(lhs)
        let addedFromSymbol = false;
        const currentAdditions: string[] = [];
        
        for (const f of symbolFirst) {
          if (f !== EPSILON && !lhsFirst.has(f)) {
            lhsFirst.add(f);
            currentAdditions.push(f);
            changed = true; 
            addedFromSymbol = true;
          }
        }
        
        if (addedFromSymbol) {
             steps.push({
                symbol: lhs,
                added: currentAdditions,
                reason: `${lhs} -> ... ${symbol} ... (First(${symbol}) ⊆ First(${lhs}))`
             });
        }

        // 检查 symbol 是否 nullable
        if (!symbolFirst.has(EPSILON)) {
          allNullable = false;
          break; // 后面的符号 First 集不能贡献给 First(lhs)
        }
      }

      // 如果所有符号都 nullable，则 ε 加入 First(lhs)
      if (allNullable) {
        if (!lhsFirst.has(EPSILON)) {
          lhsFirst.add(EPSILON);
          changed = true;
          steps.push({
            symbol: lhs,
            added: [EPSILON],
            reason: `${lhs} -> ${rhs.join(' ')} (All Nullable)`
          });
        }
      }
    }
  }

  return { map: first, steps };
}

// 计算 Follow 集
export function computeFollow(grammar: Grammar, first: SymbolMap): FollowResult {
  const follow: SymbolMap = new Map();
  const steps: CalculationStep[] = [];
  
  // 初始化
  grammar.nonTerminals.forEach(nt => {
    follow.set(nt, new Set());
  });

  // 规则 1: Start symbol 包含 $
  const startFollow = follow.get(grammar.startSymbol);
  if (startFollow) {
    startFollow.add('$');
    steps.push({
        symbol: grammar.startSymbol,
        added: ['$'],
        reason: 'Start Symbol'
    });
  }

  let changed = true;
  while (changed) {
    changed = false;

    for (const prod of grammar.productions) {
      const { lhs, rhs } = prod;
      const lhsFollow = follow.get(lhs)!;

      // A -> α B β
      for (let i = 0; i < rhs.length; i++) {
        const B = rhs[i];
        if (!grammar.nonTerminals.has(B)) continue;

        const BFollow = follow.get(B)!;
        const initialSize = BFollow.size;

        // 寻找 β (rhs[i+1]...rhs[k])
        // First(β) 的非 ε 元素加入 Follow(B)
        let betaNullable = true;
        let betaStr = '';
        
        for (let j = i + 1; j < rhs.length; j++) {
            const betaSymbol = rhs[j];
            betaStr += betaSymbol + ' ';
            const betaFirst = first.get(betaSymbol)!;
            
            const currentAdditions: string[] = [];
            // Add First(betaSymbol) \ {ε} to Follow(B)
            for (const f of betaFirst) {
                if (f !== EPSILON && !BFollow.has(f)) {
                    BFollow.add(f);
                    currentAdditions.push(f);
                }
            }
            
            if (currentAdditions.length > 0) {
                 steps.push({
                    symbol: B,
                    added: currentAdditions,
                    reason: `${lhs} -> ... ${B} ${betaSymbol} ... (First(${betaSymbol}) ⊆ Follow(${B}))`
                 });
            }

            if (!betaFirst.has(EPSILON)) {
                betaNullable = false;
                break;
            }
        }

        // 规则 3: 如果 A -> α B 或 A -> α B β 且 First(β) 包含 ε
        // 则 Follow(A) 加入 Follow(B)
        if (betaNullable) {
            const currentAdditions: string[] = [];
            for (const f of lhsFollow) {
                if (!BFollow.has(f)) {
                    BFollow.add(f);
                    currentAdditions.push(f);
                }
            }
            if (currentAdditions.length > 0) {
                 steps.push({
                    symbol: B,
                    added: currentAdditions,
                    reason: `${lhs} -> ... ${B} ... (Follow(${lhs}) ⊆ Follow(${B}))`
                 });
            }
        }

        if (BFollow.size > initialSize) {
            changed = true;
        }
      }
    }
  }

  return { map: follow, steps };
}
