
import { Grammar, EPSILON, Production } from './grammar';

export type SymbolSet = Set<string>;
export type SymbolMap = Map<string, SymbolSet>;

// 计算 First 集
export function computeFirst(grammar: Grammar): SymbolMap {
  const first: SymbolMap = new Map();

  // 初始化：所有终结符的 First 集包含自身
  grammar.terminals.forEach(t => {
    first.set(t, new Set([t]));
  });
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

      // 如果右部是 epsilon
      if (rhs.length === 1 && rhs[0] === EPSILON) {
        if (!lhsFirst.has(EPSILON)) {
          lhsFirst.add(EPSILON);
          changed = true;
        }
        continue;
      }

      // X -> Y1 Y2 ... Yk
      let allNullable = true;
      for (const symbol of rhs) {
        const symbolFirst = first.get(symbol);
        // 如果 symbol 不在 first map 中（可能是未定义的符号），跳过或报错
        // 这里假设所有符号都在 map 中（由 grammar 解析保证）
        if (!symbolFirst) {
            // Should be unreachable if parser works correctly
            allNullable = false;
            break;
        }

        // 把 First(symbol) - {ε} 加入 First(lhs)
        for (const f of symbolFirst) {
          if (f !== EPSILON && !lhsFirst.has(f)) {
            lhsFirst.add(f);
            changed = true; // 注意：只要有新元素加入，即使不是因为本轮循环的后续逻辑，也算 changed，但这里是直接操作 set
          }
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
          // changed = true; // 这里不能直接在这里置 true，因为上面的逻辑可能已经置了
        }
      }
      
      if (lhsFirst.size > initialSize) {
        changed = true;
      }
    }
  }

  return first;
}

// 计算 Follow 集
export function computeFollow(grammar: Grammar, first: SymbolMap): SymbolMap {
  const follow: SymbolMap = new Map();
  
  // 初始化
  grammar.nonTerminals.forEach(nt => {
    follow.set(nt, new Set());
  });

  // 规则 1: Start symbol 包含 $
  const startFollow = follow.get(grammar.startSymbol);
  if (startFollow) {
    startFollow.add('$');
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
        
        for (let j = i + 1; j < rhs.length; j++) {
            const betaSymbol = rhs[j];
            const betaFirst = first.get(betaSymbol)!;
            
            // Add First(betaSymbol) \ {ε} to Follow(B)
            for (const f of betaFirst) {
                if (f !== EPSILON) {
                    BFollow.add(f);
                }
            }

            if (!betaFirst.has(EPSILON)) {
                betaNullable = false;
                break;
            }
        }

        // 规则 3: 如果 A -> α B 或 A -> α B β 且 First(β) 包含 ε
        // 则 Follow(A) 加入 Follow(B)
        if (betaNullable) {
            for (const f of lhsFollow) {
                BFollow.add(f);
            }
        }

        if (BFollow.size > initialSize) {
            changed = true;
        }
      }
    }
  }

  return follow;
}
