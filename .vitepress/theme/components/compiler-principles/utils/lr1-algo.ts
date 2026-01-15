
import { Grammar, Production, EPSILON } from './grammar';
import { SymbolMap } from './first-follow';

// LR(1) Item: [A -> α·β, a]
export interface LR1Item {
  production: Production; // A -> αβ
  dotIndex: number;       // dot position in rhs
  lookahead: string;      // lookahead symbol
  id?: string;            // unique key for caching/comparison
}

export interface LR1State {
  id: number;
  items: LR1Item[];
  transitions: Map<string, number>; // symbol -> target state id
}

export type ActionType = 'SHIFT' | 'REDUCE' | 'ACCEPT' | 'ERROR';

export interface Action {
  type: ActionType;
  value?: number | Production; // state id for SHIFT, production for REDUCE
}

export interface LR1Table {
  action: Map<number, Map<string, Action[]>>; // state -> term -> actions (list for conflicts)
  goto: Map<number, Map<string, number>>;     // state -> nonterm -> state
  states: LR1State[];
}

// Helper: Calculate FIRST of a string of symbols
function firstOfString(symbols: string[], firstMap: SymbolMap): Set<string> {
  const result = new Set<string>();
  let allNullable = true;

  for (const sym of symbols) {
    if (sym === EPSILON) continue;
    
    const f = firstMap.get(sym);
    if (!f) {
      // Should treat as terminal if not in map, or error
      // Assuming valid grammar, if not in map it might be a literal terminal not caught?
      // But grammar parser catches all.
      // If symbol is terminal, FIRST is {symbol}
      result.add(sym);
      allNullable = false;
      break;
    }

    for (const t of f) {
      if (t !== EPSILON) result.add(t);
    }

    if (!f.has(EPSILON)) {
      allNullable = false;
      break;
    }
  }

  if (allNullable) {
    result.add(EPSILON);
  }

  return result;
}

// Helper: Unique ID for item
function getItemId(item: LR1Item): string {
  // prod: LHS -> RHS
  const rhsStr = item.production.rhs.join(' ');
  return `${item.production.lhs}|${rhsStr}|${item.dotIndex}|${item.lookahead}`;
}

// Equality check for items
function isSameItem(a: LR1Item, b: LR1Item): boolean {
  return a.production === b.production && 
         a.dotIndex === b.dotIndex && 
         a.lookahead === b.lookahead;
}

// Closure operation
function closure(items: LR1Item[], grammar: Grammar, firstMap: SymbolMap): LR1Item[] {
  const closureItems = [...items];
  const itemSet = new Set<string>(items.map(getItemId));
  const queue = [...items];

  while (queue.length > 0) {
    const current = queue.pop()!;
    const { production, dotIndex, lookahead } = current;
    
    // A -> α·Bβ, a
    if (dotIndex < production.rhs.length) {
      const B = production.rhs[dotIndex];
      
      // If B is non-terminal
      if (grammar.nonTerminals.has(B)) {
        // βa
        const beta = production.rhs.slice(dotIndex + 1);
        // FIRST(βa)
        const firstOfBetaA = firstOfString([...beta, lookahead], firstMap);
        
        // For each prod B -> γ
        const bProds = grammar.productions.filter(p => p.lhs === B);
        for (const prod of bProds) {
          // For each b in FIRST(βa)
          for (const b of firstOfBetaA) {
            // Note: b cannot be epsilon here because lookahead is a terminal (or $)
            // But firstOfString might return epsilon if lookahead was epsilon (which shouldn't happen in LR1 usually, lookahead is terminal or $)
            if (b === EPSILON) continue; 

            // Add [B -> ·γ, b]
            // Handle epsilon production B -> ε specially? 
            // If B -> ε, rhs is [ε]. dotIndex 0 means before ε.
            // Actually usually we represent B -> ε as rhs=[], but our parser uses [ε].
            // If rhs is [ε], dot is before ε.
            
            const newItem: LR1Item = {
              production: prod,
              dotIndex: 0,
              lookahead: b
            };
            const id = getItemId(newItem);
            
            if (!itemSet.has(id)) {
              itemSet.add(id);
              closureItems.push(newItem);
              queue.push(newItem);
            }
          }
        }
      }
    }
  }
  
  return closureItems;
}

// Goto operation
function goto(items: LR1Item[], symbol: string, grammar: Grammar, firstMap: SymbolMap): LR1Item[] {
  const movedItems: LR1Item[] = [];
  
  for (const item of items) {
    // A -> α·Xβ, a
    if (item.dotIndex < item.production.rhs.length) {
      const X = item.production.rhs[item.dotIndex];
      
      // Handle epsilon: A -> ·ε is effectively A -> ε· immediately?
      // If rhs is [ε], item.dotIndex=0. X=ε. 
      // We don't "shift" epsilon. Epsilon productions are reducible immediately.
      // So goto(I, ε) is not standard.
      if (X === EPSILON) continue;

      if (X === symbol) {
        movedItems.push({
          production: item.production,
          dotIndex: item.dotIndex + 1,
          lookahead: item.lookahead
        });
      }
    }
  }
  
  if (movedItems.length === 0) return [];
  return closure(movedItems, grammar, firstMap);
}

// Helper: Canonical Collection ID (sorted item IDs)
function getStateId(items: LR1Item[]): string {
  return items.map(getItemId).sort().join('||');
}

export function buildLR1Table(grammar: Grammar, firstMap: SymbolMap): LR1Table {
  // 1. Augment grammar
  // Add S' -> S
  const startProd: Production = {
    lhs: grammar.startSymbol + "'",
    rhs: [grammar.startSymbol]
  };
  
  // Note: We don't strictly need to modify the Grammar object if we handle S' manually
  // But for closure/goto to work, S' needs to be handled.
  // Let's assume the user input grammar doesn't have S'.
  // We'll create an augmented list of productions locally or modify a clone.
  // Actually, closure() uses grammar.productions.
  // Let's create a temporary grammar wrapper.
  const augmentedGrammar = {
    ...grammar,
    productions: [startProd, ...grammar.productions],
    nonTerminals: new Set(grammar.nonTerminals),
    terminals: new Set(grammar.terminals)
  };
  augmentedGrammar.nonTerminals.add(startProd.lhs);
  augmentedGrammar.terminals.add('$'); // Ensure $ is known

  // 2. Initial State: Closure({[S' -> ·S, $]})
  const initialItem: LR1Item = {
    production: startProd,
    dotIndex: 0,
    lookahead: '$'
  };
  
  const initialStateItems = closure([initialItem], augmentedGrammar, firstMap);
  const states: LR1State[] = [];
  const stateMap = new Map<string, number>(); // StateID string -> State Index
  
  let stateCounter = 0;
  const initialState: LR1State = {
    id: stateCounter++,
    items: initialStateItems,
    transitions: new Map()
  };
  
  states.push(initialState);
  stateMap.set(getStateId(initialStateItems), initialState.id);
  
  const queue = [initialState];
  
  // All symbols (terminals + non-terminals)
  const allSymbols = new Set([...augmentedGrammar.terminals, ...augmentedGrammar.nonTerminals]);
  allSymbols.delete(EPSILON);
  allSymbols.delete(startProd.lhs); // S' doesn't appear in RHS usually

  while (queue.length > 0) {
    const currentState = queue.shift()!;
    
    for (const symbol of allSymbols) {
      const nextItems = goto(currentState.items, symbol, augmentedGrammar, firstMap);
      if (nextItems.length === 0) continue;
      
      const nextStateIdStr = getStateId(nextItems);
      let targetStateId = stateMap.get(nextStateIdStr);
      
      if (targetStateId === undefined) {
        targetStateId = stateCounter++;
        const newState: LR1State = {
          id: targetStateId,
          items: nextItems,
          transitions: new Map()
        };
        states.push(newState);
        stateMap.set(nextStateIdStr, targetStateId);
        queue.push(newState);
      }
      
      currentState.transitions.set(symbol, targetStateId);
    }
  }

  // 3. Build Table
  const actionTable = new Map<number, Map<string, Action[]>>();
  const gotoTable = new Map<number, Map<string, number>>();
  
  for (const state of states) {
    actionTable.set(state.id, new Map());
    gotoTable.set(state.id, new Map());
    
    // a) Transitions (Shift / Goto)
    for (const [symbol, targetId] of state.transitions) {
      if (augmentedGrammar.terminals.has(symbol)) {
        // Shift
        if (!actionTable.get(state.id)!.has(symbol)) {
          actionTable.get(state.id)!.set(symbol, []);
        }
        actionTable.get(state.id)!.get(symbol)!.push({ type: 'SHIFT', value: targetId });
      } else if (augmentedGrammar.nonTerminals.has(symbol)) {
        // Goto
        gotoTable.get(state.id)!.set(symbol, targetId);
      }
    }
    
    // b) Reductions
    for (const item of state.items) {
      // A -> α·, a
      // Check if dot is at end
      // Special case: A -> ε. rhs=[ε]. dotIndex=0?
      // If rhs=[ε], length is 1. If dotIndex=0, X=ε, we skip in loop.
      // But wait, closure logic for items:
      // If A->ε, dot is before ε (index 0).
      // But effectively it's A -> · (length 0).
      // Let's normalize: if rhs=[ε], treat as empty array for length check?
      // Or just check:
      const isComplete = 
        item.dotIndex === item.production.rhs.length || 
        (item.production.rhs.length === 1 && item.production.rhs[0] === EPSILON && item.dotIndex === 0); // Treated as dot at end
      
      if (isComplete) {
        if (item.production.lhs === startProd.lhs) {
          // S' -> S·, $
          if (item.lookahead === '$') {
            if (!actionTable.get(state.id)!.has('$')) {
               actionTable.get(state.id)!.set('$', []);
            }
            actionTable.get(state.id)!.get('$')!.push({ type: 'ACCEPT' });
          }
        } else {
          // Reduce A -> α
          // item.lookahead
          const symbol = item.lookahead;
          if (!actionTable.get(state.id)!.has(symbol)) {
            actionTable.get(state.id)!.set(symbol, []);
          }
          // Don't reduce S' productions (except accept above)
          actionTable.get(state.id)!.get(symbol)!.push({ type: 'REDUCE', value: item.production });
        }
      }
    }
  }
  
  return {
    action: actionTable,
    goto: gotoTable,
    states: states
  };
}
