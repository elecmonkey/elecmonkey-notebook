
import { Grammar, Production, EPSILON } from './grammar';
import { SymbolMap } from './first-follow';

// Table cell can contain multiple productions (conflict)
export type TableCell = Production[];

// Map<NonTerminal, Map<Terminal, TableCell>>
export type ParsingTable = Map<string, Map<string, TableCell>>;

export interface LL1Result {
  table: ParsingTable;
  conflicts: string[]; // List of conflict descriptions
  isLL1: boolean;
}

export function buildLL1Table(grammar: Grammar, first: SymbolMap, follow: SymbolMap): LL1Result {
  const table: ParsingTable = new Map();
  const conflicts: string[] = [];
  let isLL1 = true;

  // Initialize table
  grammar.nonTerminals.forEach(nt => {
    table.set(nt, new Map());
    const row = table.get(nt)!;
    // Include all terminals and '$'
    grammar.terminals.forEach(t => row.set(t, []));
    row.set('$', []);
  });

  // Helper to add entry
  const addEntry = (nt: string, terminal: string, prod: Production) => {
    const row = table.get(nt);
    if (!row) return; // Should not happen
    
    // Auto-initialize if missing (e.g. terminals list issue)
    if (!row.has(terminal)) row.set(terminal, []);
    
    const cell = row.get(terminal)!;
    
    // Check for duplicates (conflict)
    const exists = cell.some(p => 
      p.lhs === prod.lhs && 
      p.rhs.length === prod.rhs.length && 
      p.rhs.every((s, i) => s === prod.rhs[i])
    );

    if (!exists) {
      if (cell.length > 0) {
        isLL1 = false;
        const existingStr = cell.map(p => `${p.lhs} -> ${p.rhs.join(' ')}`).join(', ');
        const newStr = `${prod.lhs} -> ${prod.rhs.join(' ')}`;
        conflicts.push(`Conflict at M[${nt}, ${terminal}]: { ${existingStr} } vs { ${newStr} }`);
      }
      cell.push(prod);
    }
  };

  // Iterate all productions
  for (const prod of grammar.productions) {
    const { lhs, rhs } = prod;

    // Calculate FIRST(rhs)
    // Note: We need a helper for FIRST(string of symbols), here we implement it inline or simplified
    
    let rhsFirst = new Set<string>();
    let allNullable = true;

    for (const symbol of rhs) {
      const symbolFirst = first.get(symbol);
      if (!symbolFirst) {
        allNullable = false; 
        break; 
      }

      for (const f of symbolFirst) {
        if (f !== EPSILON) rhsFirst.add(f);
      }

      if (!symbolFirst.has(EPSILON)) {
        allNullable = false;
        break;
      }
    }
    
    if (allNullable) {
      rhsFirst.add(EPSILON);
    }

    // Rule 1: For each terminal a in FIRST(rhs), add A->alpha to M[A, a]
    for (const a of rhsFirst) {
      if (a !== EPSILON) {
        addEntry(lhs, a, prod);
      }
    }

    // Rule 2: If epsilon in FIRST(rhs), add A->alpha to M[A, b] for each b in FOLLOW(A)
    if (rhsFirst.has(EPSILON)) {
      const lhsFollow = follow.get(lhs);
      if (lhsFollow) {
        for (const b of lhsFollow) {
          addEntry(lhs, b, prod);
        }
      }
    }
  }

  return { table, conflicts, isLL1 };
}
