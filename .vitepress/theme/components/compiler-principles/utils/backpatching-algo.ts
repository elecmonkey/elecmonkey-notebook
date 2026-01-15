
// 布尔表达式回填算法模拟器

// 指令结构
export interface BPInstruction {
  id: number;
  code: string;
  target: string;
  isFilled: boolean;
}

// 模拟步骤
export interface BPStep {
  desc: string;
  action: (insts: BPInstruction[]) => void;
}

// 简单的 AST 节点
type NodeType = 'Or' | 'And' | 'Rel' | 'Not' | 'True' | 'False';

interface Node {
  type: NodeType;
  left?: Node;
  right?: Node;
  expr: string; // 显示用的表达式文本，如 "a < b"
  trueList: number[];
  falseList: number[];
}

// 状态管理
let nextQuad = 100;
let instructions: BPInstruction[] = [];
let steps: BPStep[] = [];

function emit(code: string): number {
  const id = nextQuad++;
  instructions.push({
    id,
    code,
    target: '_?_',
    isFilled: false
  });
  return id;
}

function merge(l1: number[], l2: number[]): number[] {
  // 返回去重后的合并列表
  return Array.from(new Set([...l1, ...l2])).sort((a, b) => a - b);
}

function backpatch(list: number[], target: number) {
  // 生成一个 backpatch 动作步骤
  // 注意：这里我们不直接修改 instructions，而是生成一个闭包 action
  // 但为了生成 step 描述，我们需要知道 list 里的内容
  const listCopy = [...list];
  
  steps.push({
    desc: `回填列表 {${listCopy.join(', ')}} -> ${target}`,
    action: (insts: BPInstruction[]) => {
      listCopy.forEach(id => {
        const inst = insts.find(i => i.id === id);
        if (inst) {
          inst.target = target.toString();
          inst.isFilled = true;
        }
      });
    }
  });
}

// 简单的递归下降解析器
// Grammar:
// E -> T || E | T
// T -> F && T | F
// F -> !F | (E) | rel
// rel -> a < b | true | false

class Parser {
  tokens: string[];
  pos: number = 0;

  constructor(input: string) {
    // 简易分词：支持 ||, &&, !, (, ), true, false, 以及关系表达式 (a < b)
    // 这里的关系表达式我们作为一个整体 token 处理，或者简单点：非关键符号都当做 rel 的一部分
    // 为了简化，我们先把 ||, &&, !, (, ) 分开
    this.tokens = input
      .replace(/\|\|/g, ' || ')
      .replace(/&&/g, ' && ')
      .replace(/!/g, ' ! ')
      .replace(/\(/g, ' ( ')
      .replace(/\)/g, ' ) ')
      .split(/\s+/)
      .filter(t => t.length > 0);
  }

  peek(): string {
    return this.tokens[this.pos];
  }

  consume(): string {
    return this.tokens[this.pos++];
  }

  parseE(): Node {
    let left = this.parseT();

    while (this.peek() === '||') {
      this.consume(); // skip ||
      
      // M: 记录当前指令地址，用于回填 left.false
      const mQuad = nextQuad;
      
      // 生成回填步骤
      // 注意：这里我们在 parse 阶段直接生成步骤是不对的，因为 parse 是静态的。
      // 但回填算法本身就是一边 parse 一边生成代码。
      // 这里的 steps 是“仿真步骤”，用于前端展示。
      
      backpatch(left.falseList, mQuad);
      
      const right = this.parseE(); // 右递归或者迭代，这里简化为递归 E -> T || E
      // 实际上应该是 E -> E || T 左结合，但布尔表达式通常左结合右结合对逻辑无影响（除了求值顺序）
      // 标准回填是左结合的：E -> E1 || M E2
      
      // 修正：上面的递归写法其实是右结合 T || (T || T)
      // 我们需要模拟左结合吗？
      // 标准的 LR 解析是自底向上。
      // 这里为了简单，我们用递归，但是逻辑上我们要模拟 "E1 || M E2"
      // 对于右结合：E -> T || (M E')
      // backpatch(left.false, M) 依然成立
      
      left = {
        type: 'Or',
        left,
        right,
        expr: `${left.expr} || ${right.expr}`,
        trueList: merge(left.trueList, right.trueList),
        falseList: right.falseList
      };
      
      steps.push({
        desc: `归约 OR (||): E.true = merge({${left.left!.trueList}}, {${right.trueList}}), E.false = {${right.falseList}}`,
        action: () => {}
      });
    }
    return left;
  }

  parseT(): Node {
    let left = this.parseF();

    while (this.peek() === '&&') {
      this.consume(); // skip &&
      
      const mQuad = nextQuad;
      backpatch(left.trueList, mQuad);
      
      const right = this.parseT();
      
      left = {
        type: 'And',
        left,
        right,
        expr: `${left.expr} && ${right.expr}`,
        trueList: right.trueList,
        falseList: merge(left.falseList, right.falseList)
      };

      steps.push({
        desc: `归约 AND (&&): T.true = {${right.trueList}}, T.false = merge({${left.left!.falseList}}, {${right.falseList}})`,
        action: () => {}
      });
    }
    return left;
  }

  parseF(): Node {
    const token = this.peek();

    if (token === '!') {
      this.consume();
      const f = this.parseF();
      // swap lists
      return {
        type: 'Not',
        left: f,
        expr: `!${f.expr}`,
        trueList: f.falseList,
        falseList: f.trueList
      };
    } else if (token === '(') {
      this.consume();
      const e = this.parseE();
      if (this.consume() !== ')') throw new Error('Missing )');
      return {
        ...e,
        expr: `(${e.expr})`
      };
    } else {
      // Rel expression (a < b) or true/false
      // 这里我们需要吞掉直到遇到 ||, &&, ) 之前的所有 token
      let exprStr = '';
      while (this.pos < this.tokens.length) {
        const t = this.peek();
        if (['||', '&&', ')'].includes(t)) break;
        exprStr += this.consume() + ' ';
      }
      exprStr = exprStr.trim();
      
      if (exprStr === 'true') {
        const id = emit('goto');
        return {
          type: 'True',
          expr: 'true',
          trueList: [id],
          falseList: []
        };
      } else if (exprStr === 'false') {
        const id = emit('goto');
        return {
          type: 'False',
          expr: 'false',
          trueList: [],
          falseList: [id]
        };
      } else {
        // a < b
        // if a < b goto _?_
        // goto _?_
        const idTrue = emit(`if ${exprStr} goto`);
        const idFalse = emit(`goto`);
        
        steps.push({
          desc: `生成关系表达式 "${exprStr}" 的跳转指令`,
          action: () => {}
        });

        return {
          type: 'Rel',
          expr: exprStr,
          trueList: [idTrue],
          falseList: [idFalse]
        };
      }
    }
  }
}

export function simulateBackpatching(expression: string) {
  // Reset
  nextQuad = 100;
  instructions = [];
  steps = [];

  try {
    const parser = new Parser(expression);
    const root = parser.parseE();
    
    // Final backpatch for root
    // 假设是 if (E) S
    // S.begin = nextQuad
    // backpatch(E.true, S.begin)
    // E.false -> next stmt
    
    const trueTarget = nextQuad;
    backpatch(root.trueList, trueTarget);
    
    // Simulate S body
    // 这里我们只生成占位符
    
    steps.push({
      desc: `解析完成。回填 E.true -> ${trueTarget} (True 出口)`,
      action: () => {} // backpatch 已生成
    });

    // False target
    // backpatch(root.false, nextQuad + 1) ? 
    // 通常 E.false 跳出 if
    const falseTarget = nextQuad + 100; // 假设很远
    backpatch(root.falseList, falseTarget);
    
    steps.push({
      desc: `回填 E.false -> ${falseTarget} (False 出口)`,
      action: () => {}
    });

    return { instructions, steps };
  } catch (e: any) {
    return { 
      instructions: [], 
      steps: [{ desc: `解析错误: ${e.message}`, action: () => {} }] 
    };
  }
}
