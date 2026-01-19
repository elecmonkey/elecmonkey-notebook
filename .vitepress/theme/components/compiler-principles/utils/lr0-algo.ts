
import { Grammar, Production, EPSILON } from './grammar';
import { SymbolMap } from './first-follow';

// LR(0) Item: [A -> α·β] (No lookahead)
export interface LR0Item {
  production: Production; // A -> αβ
  dotIndex: number;       // dot position in rhs
}

export interface LR0State {
  id: number;
  items: LR0Item[];
  transitions: Map<string, number>; // symbol -> target state id
}

export type ActionType = 'SHIFT' | 'REDUCE' | 'ACCEPT' | 'ERROR';

export interface Action {
  type: ActionType;
  value?: number | Production; // state id for SHIFT, production for REDUCE
}

export interface LRTable {
  action: Map<number, Map<string, Action[]>>; // state -> term -> actions
  goto: Map<number, Map<string, number>>;     // state -> nonterm -> state
  states: LR0State[];
}

// Helper: Unique ID for item
function getItemId(item: LR0Item): string {
  const rhsStr = item.production.rhs.join(' ');
  return `${item.production.lhs}|${rhsStr}|${item.dotIndex}`;
}

// Closure operation for LR(0)
function closure(items: LR0Item[], grammar: Grammar): LR0Item[] {
  const closureItems = [...items];
  const itemSet = new Set<string>(items.map(getItemId));
  const queue = [...items];

  while (queue.length > 0) {
    const current = queue.pop()!;
    const { production, dotIndex } = current;
    
    // A -> α·Bβ
    if (dotIndex < production.rhs.length) {
      const B = production.rhs[dotIndex];
      
      // If B is non-terminal
      if (grammar.nonTerminals.has(B)) {
        // For each prod B -> γ
        const bProds = grammar.productions.filter(p => p.lhs === B);
        for (const prod of bProds) {
          // Add [B -> ·γ]
          const newItem: LR0Item = {
            production: prod,
            dotIndex: 0
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
  
  return closureItems;
}

// Goto operation for LR(0)
function goto(items: LR0Item[], symbol: string, grammar: Grammar): LR0Item[] {
  const movedItems: LR0Item[] = [];
  
  for (const item of items) {
    // A -> α·Xβ
    if (item.dotIndex < item.production.rhs.length) {
      const X = item.production.rhs[item.dotIndex];
      
      if (X === EPSILON) continue;

      if (X === symbol) {
        movedItems.push({
          production: item.production,
          dotIndex: item.dotIndex + 1
        });
      }
    }
  }
  
  if (movedItems.length === 0) return [];
  return closure(movedItems, grammar);
}

// Helper: Canonical Collection ID (sorted item IDs)
function getStateId(items: LR0Item[]): string {
  return items.map(getItemId).sort().join('||');
}

// Build LR(0) Automaton (Canonical Collection of LR0 States)
export function buildLR0Automaton(grammar: Grammar): { states: LR0State[], augmentedGrammar: Grammar, startProd: Production } {
  // 1. Augment grammar: S' -> S
  const startProd: Production = {
    lhs: grammar.startSymbol + "'",
    rhs: [grammar.startSymbol]
  };
  
  const augmentedGrammar = {
    ...grammar,
    productions: [startProd, ...grammar.productions],
    nonTerminals: new Set(grammar.nonTerminals),
    terminals: new Set(grammar.terminals)
  };
  augmentedGrammar.nonTerminals.add(startProd.lhs);
  augmentedGrammar.terminals.add('$');

  // 2. Initial State: Closure({[S' -> ·S]})
  const initialItem: LR0Item = {
    production: startProd,
    dotIndex: 0
  };
  
  const initialStateItems = closure([initialItem], augmentedGrammar);
  const states: LR0State[] = [];
  const stateMap = new Map<string, number>();
  
  let stateCounter = 0;
  const initialState: LR0State = {
    id: stateCounter++,
    items: initialStateItems,
    transitions: new Map()
  };
  
  states.push(initialState);
  stateMap.set(getStateId(initialStateItems), initialState.id);
  
  const queue = [initialState];
  
  const allSymbols = new Set([...augmentedGrammar.terminals, ...augmentedGrammar.nonTerminals]);
  allSymbols.delete(EPSILON);
  allSymbols.delete(startProd.lhs);

  while (queue.length > 0) {
    const currentState = queue.shift()!;
    
    for (const symbol of allSymbols) {
      const nextItems = goto(currentState.items, symbol, augmentedGrammar);
      if (nextItems.length === 0) continue;
      
      const nextStateIdStr = getStateId(nextItems);
      let targetStateId = stateMap.get(nextStateIdStr);
      
      if (targetStateId === undefined) {
        targetStateId = stateCounter++;
        const newState: LR0State = {
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

  return { states, augmentedGrammar, startProd };
}

// Build LR(0) Table
export function buildLR0Table(grammar: Grammar): LRTable {
  const { states, augmentedGrammar, startProd } = buildLR0Automaton(grammar);
  
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
    
    // b) Reductions (LR0: Reduce on all terminals if complete item exists)
    for (const item of state.items) {
      const isComplete = 
        item.dotIndex === item.production.rhs.length || 
        (item.production.rhs.length === 1 && item.production.rhs[0] === EPSILON && item.dotIndex === 0);
      
      if (isComplete) {
        if (item.production.lhs === startProd.lhs) {
          // S' -> S·  => Accept on $
          if (!actionTable.get(state.id)!.has('$')) {
             actionTable.get(state.id)!.set('$', []);
          }
          actionTable.get(state.id)!.get('$')!.push({ type: 'ACCEPT' });
        } else {
          // Reduce A -> α
          // For LR(0), reduce on ALL terminals in the grammar + $
          for (const t of augmentedGrammar.terminals) {
            if (!actionTable.get(state.id)!.has(t)) {
              actionTable.get(state.id)!.set(t, []);
            }
            actionTable.get(state.id)!.get(t)!.push({ type: 'REDUCE', value: item.production });
          }
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

// Build SLR(1) Table
export function buildSLR1Table(grammar: Grammar, followMap: SymbolMap): LRTable {
  const { states, augmentedGrammar, startProd } = buildLR0Automaton(grammar);
  
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
    
    // b) Reductions (SLR1: Reduce only on FOLLOW(A))
    for (const item of state.items) {
      const isComplete = 
        item.dotIndex === item.production.rhs.length || 
        (item.production.rhs.length === 1 && item.production.rhs[0] === EPSILON && item.dotIndex === 0);
      
      if (isComplete) {
        if (item.production.lhs === startProd.lhs) {
          // S' -> S· => Accept on $
          if (!actionTable.get(state.id)!.has('$')) {
             actionTable.get(state.id)!.set('$', []);
          }
          actionTable.get(state.id)!.get('$')!.push({ type: 'ACCEPT' });
        } else {
          // Reduce A -> α
          // For SLR(1), reduce on t if t in FOLLOW(A)
          const followA = followMap.get(item.production.lhs);
          if (followA) {
            for (const t of followA) {
              if (t === EPSILON) continue;
              if (!actionTable.get(state.id)!.has(t)) {
                actionTable.get(state.id)!.set(t, []);
              }
              actionTable.get(state.id)!.get(t)!.push({ type: 'REDUCE', value: item.production });
            }
          }
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
