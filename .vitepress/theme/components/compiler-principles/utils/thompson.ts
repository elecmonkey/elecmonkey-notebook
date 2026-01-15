
// NFA 状态定义
export interface NFAState {
  id: number;
  transitions: Map<string, NFAState[]>;
  isAccepting: boolean;
}

// NFA 片段定义
export interface NFAFragment {
  start: NFAState;
  end: NFAState;
}

// 状态 ID 计数器
let stateIdCounter = 0;

function createState(isAccepting: boolean = false): NFAState {
  return {
    id: stateIdCounter++,
    transitions: new Map(),
    isAccepting,
  };
}

function addTransition(from: NFAState, to: NFAState, symbol: string) {
  if (!from.transitions.has(symbol)) {
    from.transitions.set(symbol, []);
  }
  from.transitions.get(symbol)!.push(to);
}

// 预处理正则表达式，插入连接符 '.'
// 规则：在以下情况插入 '.'
// 1. 字符与字符之间 (e.g., ab -> a.b)
// 2. 字符与左括号之间 (e.g., a( -> a.( )
// 3. 右括号与字符之间 (e.g., )a -> ).a )
// 4. 星号与字符之间 (e.g., *a -> *.a )
// 5. 星号与左括号之间 (e.g., *( -> *.( )
// 6. 右括号与左括号之间 (e.g., )( -> ).( )
function preprocessRegex(regex: string): string {
  let result = '';
  const operators = ['|', '*', '(', ')'];
  
  for (let i = 0; i < regex.length; i++) {
    const c1 = regex[i];
    result += c1;

    if (i + 1 < regex.length) {
      const c2 = regex[i + 1];
      
      const isC1Op = operators.includes(c1);
      const isC2Op = operators.includes(c2);
      
      // 检查是否需要插入连接符
      let insertConcat = false;

      // 1. 两个非运算符字符 (a b)
      if (!isC1Op && !isC2Op) insertConcat = true;
      // 2. 字符接左括号 (a ()
      else if (!isC1Op && c2 === '(') insertConcat = true;
      // 3. 右括号接字符 () a)
      else if (c1 === ')' && !isC2Op) insertConcat = true;
      // 4. 星号接字符 (* a)
      else if (c1 === '*' && !isC2Op) insertConcat = true;
      // 5. 星号接左括号 (* ()
      else if (c1 === '*' && c2 === '(') insertConcat = true;
      // 6. 右括号接左括号 () ()
      else if (c1 === ')' && c2 === '(') insertConcat = true;

      if (insertConcat) {
        result += '.';
      }
    }
  }
  return result;
}

// 将中缀表达式转换为后缀表达式 (Shunting-yard algorithm)
function infixToPostfix(regex: string): string {
  const precedence: { [key: string]: number } = {
    '|': 1,
    '.': 2,
    '*': 3,
  };
  
  let output = '';
  const stack: string[] = [];
  
  for (const char of regex) {
    if (!['|', '.', '*', '(', ')'].includes(char)) {
      output += char;
    } else if (char === '(') {
      stack.push(char);
    } else if (char === ')') {
      while (stack.length > 0 && stack[stack.length - 1] !== '(') {
        output += stack.pop();
      }
      
      if (stack.length === 0) {
        throw new Error('Mismatched parentheses: too many closing parentheses');
      }
      stack.pop(); // Pop '('
    } else {
      while (
        stack.length > 0 &&
        stack[stack.length - 1] !== '(' &&
        precedence[stack[stack.length - 1]] >= precedence[char]
      ) {
        output += stack.pop();
      }
      stack.push(char);
    }
  }
  
  while (stack.length > 0) {
    const top = stack.pop();
    if (top === '(') {
      throw new Error('Mismatched parentheses: unclosed parenthesis');
    }
    output += top;
  }
  
  return output;
}

// 构造 NFA
export function buildNFA(regex: string): NFAFragment | null {
  stateIdCounter = 0; // Reset counter
  const preprocessed = preprocessRegex(regex);
  const postfix = infixToPostfix(preprocessed);
  const stack: NFAFragment[] = [];

  for (const char of postfix) {
    if (char === '.') {
      if (stack.length < 2) throw new Error('Invalid regex: missing operand for concatenation');
      const right = stack.pop()!;
      const left = stack.pop()!;
      
      // 连接: left.end -> right.start (epsilon)
      addTransition(left.end, right.start, 'ε');
      left.end.isAccepting = false;
      
      stack.push({ start: left.start, end: right.end });
    } else if (char === '|') {
      if (stack.length < 2) throw new Error('Invalid regex: missing operand for union (|)');
      const right = stack.pop()!;
      const left = stack.pop()!;
      
      const newStart = createState();
      const newEnd = createState(true);
      
      addTransition(newStart, left.start, 'ε');
      addTransition(newStart, right.start, 'ε');
      addTransition(left.end, newEnd, 'ε');
      addTransition(right.end, newEnd, 'ε');
      
      left.end.isAccepting = false;
      right.end.isAccepting = false;
      
      stack.push({ start: newStart, end: newEnd });
    } else if (char === '*') {
      if (stack.length < 1) throw new Error('Invalid regex: missing operand for closure (*)');
      const nfa = stack.pop()!;
      
      const newStart = createState();
      const newEnd = createState(true);
      
      addTransition(newStart, nfa.start, 'ε');
      addTransition(newStart, newEnd, 'ε');
      addTransition(nfa.end, nfa.start, 'ε');
      addTransition(nfa.end, newEnd, 'ε');
      
      nfa.end.isAccepting = false;
      
      stack.push({ start: newStart, end: newEnd });
    } else {
      // Literal
      const start = createState();
      const end = createState(true);
      addTransition(start, end, char);
      stack.push({ start, end });
    }
  }

  if (stack.length !== 1) {
     throw new Error('Invalid regex: incomplete expression or multiple fragments');
  }

  return stack[0];
}

// 转换为 Mermaid 格式
export function nfaToMermaid(nfa: NFAFragment, direction: 'LR' | 'TD' = 'LR'): string {
  if (!nfa) return '';
  
  let mermaid = `graph ${direction}\n`;
  const visited = new Set<number>();
  const queue: NFAState[] = [nfa.start];
  
  // 样式定义
  mermaid += '    %% Styles\n';
  mermaid += '    classDef start fill:#e1f5fe,stroke:#01579b,stroke-width:2px;\n';
  mermaid += '    classDef accept fill:#e8f5e9,stroke:#2e7d32,stroke-width:2px,stroke-dasharray: 5 5;\n';
  mermaid += '    classDef normal fill:#fff,stroke:#333,stroke-width:1px;\n';
  
  // 收集所有状态和边
  const states: NFAState[] = [];
  
  // BFS 遍历
  visited.add(nfa.start.id);
  
  // 重置 queue 为 BFS
  // 注意：上面的 queue 只是初始值
  let head = 0;
  while(head < queue.length){
      const current = queue[head++];
      states.push(current);
      
      for(const targets of current.transitions.values()){
          for(const target of targets){
              if(!visited.has(target.id)){
                  visited.add(target.id);
                  queue.push(target);
              }
          }
      }
  }
  
  // 生成 Mermaid 代码
  // 1. 定义节点和样式
  states.forEach(state => {
      let className = 'normal';
      if (state === nfa.start) className = 'start';
      if (state.isAccepting) className = 'accept';
      
      // 如果既是开始也是接受
      if (state === nfa.start && state.isAccepting) className = 'start'; // 优先显示开始，或者混合
      
      // 节点定义：id((Label)) 表示圆形节点
      // 修改：开始状态显示为 start，结束状态显示为 end，其他状态保持数字 ID
      let label = state.id.toString();
      if (state === nfa.start) {
        label = 'start';
      } else if (state.isAccepting) {
        label = 'end';
      }

      let shape = `(${label})`;
      if (state.isAccepting) shape = `((${label}))`; // 双圆圈表示接受状态 (Mermaid 语法限制，用双括号模拟)
      
      mermaid += `    ${state.id}${shape}:::${className}\n`;
  });
  
  // 2. 定义边
  states.forEach(state => {
      state.transitions.forEach((targets, symbol) => {
          targets.forEach(target => {
              const label = symbol === 'ε' ? '&epsilon;' : symbol;
              mermaid += `    ${state.id} -->|"${label}"| ${target.id}\n`;
          });
      });
  });

  return mermaid;
}
