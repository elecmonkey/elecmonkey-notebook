
export interface Production {
  lhs: string;
  rhs: string[]; // 符号列表
}

export interface Grammar {
  productions: Production[];
  nonTerminals: Set<string>;
  terminals: Set<string>;
  startSymbol: string;
}

export const EPSILON = 'ε';

export function parseGrammar(input: string): Grammar {
  const lines = input.split(/\n+/).filter(l => l.trim().length > 0);
  const productions: Production[] = [];
  const nonTerminals = new Set<string>();
  const terminals = new Set<string>();
  let startSymbol = '';

  // 第一遍扫描：识别所有非终结符（左部）
  lines.forEach(line => {
    // 支持 "S -> A B" 或 "S : A B"
    const parts = line.split(/\s*(?:->|:)\s*/);
    if (parts.length >= 1) {
      const lhs = parts[0].trim();
      if (lhs) {
        nonTerminals.add(lhs);
        if (!startSymbol) startSymbol = lhs;
      }
    }
  });

  // 第二遍扫描：构建产生式并识别终结符
  lines.forEach(line => {
    const parts = line.split(/\s*(?:->|:)\s*/);
    if (parts.length < 2) return;

    const lhs = parts[0].trim();
    const rhsStr = parts[1].trim();

    // 处理 "A -> a | b" 这种情况
    const alternatives = rhsStr.split(/\s*\|\s*/);

    alternatives.forEach(alt => {
      // 按空格分割符号，过滤掉空串
      let symbols = alt.trim().split(/\s+/).filter(s => s.length > 0);
      
      // 规范化 epsilon
      symbols = symbols.map(s => {
        if (['ε', 'epsilon', 'eps', "''", '""'].includes(s.toLowerCase())) {
          return EPSILON;
        }
        return s;
      });

      // 如果整个右部就是空（可能是 split 导致的空数组，或者是显式的 epsilon）
      if (symbols.length === 0) {
        symbols = [EPSILON];
      }

      // 识别终结符：不在 nonTerminals 中的符号，且不是 EPSILON
      symbols.forEach(s => {
        if (!nonTerminals.has(s) && s !== EPSILON) {
          terminals.add(s);
        }
      });

      productions.push({ lhs, rhs: symbols });
    });
  });

  return {
    productions,
    nonTerminals,
    terminals,
    startSymbol
  };
}
