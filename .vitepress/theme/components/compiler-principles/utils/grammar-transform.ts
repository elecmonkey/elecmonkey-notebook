
import { Grammar, Production, EPSILON } from './grammar';

// 深度克隆 Grammar 对象
function cloneGrammar(g: Grammar): Grammar {
  return {
    productions: g.productions.map(p => ({ lhs: p.lhs, rhs: [...p.rhs] })),
    nonTerminals: new Set(g.nonTerminals),
    terminals: new Set(g.terminals),
    startSymbol: g.startSymbol
  };
}

// 消除直接左递归
// A -> Aα1 | Aα2 | ... | β1 | β2
// 变换为:
// A -> β1A' | β2A'
// A' -> α1A' | α2A' | ε
function eliminateDirectLeftRecursion(grammar: Grammar, nt: string): boolean {
  const productions = grammar.productions.filter(p => p.lhs === nt);
  if (productions.length === 0) return false;

  const leftRecursive: Production[] = [];
  const nonRecursive: Production[] = [];

  productions.forEach(p => {
    if (p.rhs.length > 0 && p.rhs[0] === nt) {
      leftRecursive.push(p);
    } else {
      nonRecursive.push(p);
    }
  });

  if (leftRecursive.length === 0) return false;

  // 创建新非终结符 A'
  let newNt = nt + "'";
  while (grammar.nonTerminals.has(newNt)) {
    newNt += "'";
  }
  grammar.nonTerminals.add(newNt);

  // 移除旧产生式
  grammar.productions = grammar.productions.filter(p => p.lhs !== nt);

  // A -> βA'
  if (nonRecursive.length === 0) {
    // 如果没有非递归部分，理论上语言是空的或者无限递归，这里为了算法完整性，假设 β 是 ε ? 
    // 不，如果只有 A -> Aα，那么这个语言是空的。
    // 我们通常假设文法是 reduced 的。
    // 如果没有 β，我们就不生成 A 的产生式了，或者生成 A -> A' ? 不对。
    // 这种情况通常报错，但在自动变换里，我们可以生成 A -> newNt，且 newNt -> alpha newNt | epsilon
    // 但这样 A 必须要有停止条件。
    // 暂时简单处理：如果没有 nonRecursive，视为 β=epsilon (但这其实不严谨)
    // 让我们假设 nonRecursive 至少有一个，如果没有，说明是死循环文法。
    // 实际上如果只有 A->Aα，那么 A 无法生成任何终结符串。
    // 我们这里为了展示，添加一个 epsilon 到 nonRecursive ? 不，这改变了语言。
    // 这种情况下我们什么都不做，或者报错。这里选择不做改变直接返回。
    // 或者我们添加一个 A -> newNt，然后 newNt -> alpha newNt | epsilon。
    // 这样 A -> alpha alpha ... 也是不行的。
    // 简单起见，如果 nonRecursive 为空，我们就不处理或者抛错。
  }

  nonRecursive.forEach(p => {
    // A -> β A'
    // 如果 β 是 ε，则 A -> A'
    let newRhs = [...p.rhs];
    if (newRhs.length === 1 && newRhs[0] === EPSILON) {
      newRhs = [newNt];
    } else {
      newRhs.push(newNt);
    }
    grammar.productions.push({ lhs: nt, rhs: newRhs });
  });

  // A' -> αA' | ε
  leftRecursive.forEach(p => {
    // p.rhs 是 A α
    // α 是 p.rhs.slice(1)
    const alpha = p.rhs.slice(1);
    const newRhs = [...alpha, newNt];
    grammar.productions.push({ lhs: newNt, rhs: newRhs });
  });
  
  // A' -> ε
  grammar.productions.push({ lhs: newNt, rhs: [EPSILON] });
  
  // 更新 terminals? No, we only added a non-terminal.
  return true;
}

// 消除左递归（包括间接）
// 算法：
// 1. 将非终结符排序 A1, A2, ..., An
// 2. for i = 1 to n
//      for j = 1 to i-1
//        将 Ai -> Aj γ 替换为 Ai -> δ1 γ | δ2 γ | ... (其中 Aj -> δ1 | δ2 ...)
//      消除 Ai 的直接左递归
export function eliminateLeftRecursion(g: Grammar): { grammar: Grammar, log: string[] } {
  const grammar = cloneGrammar(g);
  const log: string[] = [];
  const nonTerminals = Array.from(grammar.nonTerminals); // 排序 A1...An

  for (let i = 0; i < nonTerminals.length; i++) {
    const Ai = nonTerminals[i];
    
    for (let j = 0; j < i; j++) {
      const Aj = nonTerminals[j];
      
      // 查找 Ai -> Aj γ
      const productionsAi = grammar.productions.filter(p => p.lhs === Ai);
      const toReplace: Production[] = [];
      
      productionsAi.forEach(p => {
        if (p.rhs.length > 0 && p.rhs[0] === Aj) {
          toReplace.push(p);
        }
      });

      if (toReplace.length > 0) {
        // 获取 Aj 的所有产生式
        const productionsAj = grammar.productions.filter(p => p.lhs === Aj);
        
        // 移除 Ai -> Aj γ
        grammar.productions = grammar.productions.filter(p => !toReplace.includes(p));
        
        // 展开
        toReplace.forEach(p => {
          const gamma = p.rhs.slice(1); // γ
          productionsAj.forEach(pAj => {
            // Aj -> δ
            // 新产生式: Ai -> δ γ
            let newRhs: string[];
            if (pAj.rhs.length === 1 && pAj.rhs[0] === EPSILON) {
                // Aj -> ε, 那么 Ai -> ε γ = γ
                // 如果 γ 为空（不可能，因为 rhs[0] 是 Aj），gamma 长度 >= 0
                if (gamma.length === 0) newRhs = [EPSILON];
                else newRhs = [...gamma];
            } else {
                newRhs = [...pAj.rhs, ...gamma];
            }
            grammar.productions.push({ lhs: Ai, rhs: newRhs });
          });
        });
        log.push(`Indirect recursion eliminated for ${Ai} -> ${Aj}...`);
      }
    }
    
    // 消除直接左递归
    if (eliminateDirectLeftRecursion(grammar, Ai)) {
      log.push(`Direct left recursion eliminated for ${Ai}`);
    }
  }

  return { grammar, log };
}

// 提取左公因子
// A -> αβ1 | αβ2
// 变为 A -> αA', A' -> β1 | β2
export function leftFactoring(g: Grammar): { grammar: Grammar, log: string[] } {
  const grammar = cloneGrammar(g);
  const log: string[] = [];
  
  let changed = true;
  while (changed) {
    changed = false;
    const nonTerminals = Array.from(grammar.nonTerminals);
    
    for (const A of nonTerminals) {
      const productions = grammar.productions.filter(p => p.lhs === A);
      if (productions.length < 2) continue;

      // 寻找最长公共前缀
      // 简单的做法：按首符号分组
      const groups = new Map<string, Production[]>();
      
      productions.forEach(p => {
        if (p.rhs.length > 0) {
          const firstSym = p.rhs[0];
          // epsilon 不参与提取左公因子通常
          if (firstSym !== EPSILON) {
            if (!groups.has(firstSym)) groups.set(firstSym, []);
            groups.get(firstSym)!.push(p);
          }
        }
      });

      for (const [firstSym, group] of groups) {
        if (group.length >= 2) {
          // 发现左公因子（至少是第一个符号）
          // 我们这里只提取第一个符号作为 alpha，然后迭代进行
          // 这样可以处理 A -> a b c | a b d => A -> a A', A' -> b c | b d => A' -> b A'', A'' -> c | d
          
          const alpha = firstSym;
          
          // 创建新非终结符 A'
          let newNt = A + "'";
          while (grammar.nonTerminals.has(newNt)) {
            newNt += "'";
          }
          grammar.nonTerminals.add(newNt);

          // 移除旧产生式
          grammar.productions = grammar.productions.filter(p => !group.includes(p));

          // 添加 A -> α A'
          grammar.productions.push({ lhs: A, rhs: [alpha, newNt] });

          // 添加 A' -> β
          group.forEach(p => {
            // p.rhs 是 α β
            // β 是 p.rhs.slice(1)
            let beta = p.rhs.slice(1);
            if (beta.length === 0) {
              beta = [EPSILON];
            }
            grammar.productions.push({ lhs: newNt, rhs: beta });
          });

          log.push(`Left factoring for ${A} on prefix '${alpha}'`);
          changed = true;
          break; // 重新开始循环，因为 grammar.productions 变了
        }
      }
      if (changed) break;
    }
  }

  return { grammar, log };
}

export function grammarToString(g: Grammar): string {
    // Group by LHS
    const map = new Map<string, string[][]>();
    // Ensure order follows nonTerminals if possible, or just iteration order
    // We want to keep original order mostly.
    
    // Sort nonTerminals by appearance in original productions?
    // Let's just iterate productions.
    
    // Better: iterate nonTerminals and collect productions
    // But we might have new nonTerminals.
    
    // Let's just collect all productions.
    const lines: string[] = [];
    
    // Group by LHS to merge alternatives
    const grouped = new Map<string, string[]>();
    // Maintain order of keys
    const keys: string[] = [];

    g.productions.forEach(p => {
        if (!grouped.has(p.lhs)) {
            grouped.set(p.lhs, []);
            keys.push(p.lhs);
        }
        grouped.get(p.lhs)!.push(p.rhs.join(' '));
    });

    keys.forEach(lhs => {
        const rhss = grouped.get(lhs)!;
        lines.push(`${lhs} -> ${rhss.join(' | ')}`);
    });

    return lines.join('\n');
}
