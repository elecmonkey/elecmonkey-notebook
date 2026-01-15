
// 简易 C 语言运行时模拟器
// 用于生成可视化步骤

export interface ExecutionStep {
  line: number;
  code: string;
  desc: string;
  action: 'push' | 'pop' | 'update' | 'none';
  funcName?: string;
  data?: any;
}

// --- AST 定义 ---

type NodeType = 'Program' | 'FunctionDef' | 'Block' | 'VarDecl' | 'Return' | 'If' | 'ExprStmt' | 'Binary' | 'Call' | 'Literal' | 'Identifier';

interface Node {
  type: NodeType;
  line?: number; // 源代码行号
}

interface Program extends Node {
  type: 'Program';
  globals: VarDecl[];
  functions: FunctionDef[];
}

interface FunctionDef extends Node {
  type: 'FunctionDef';
  name: string;
  params: string[];
  body: Block;
}

interface Block extends Node {
  type: 'Block';
  statements: Node[];
}

interface VarDecl extends Node {
  type: 'VarDecl';
  name: string;
  init?: Expression;
}

interface ReturnStmt extends Node {
  type: 'Return';
  argument?: Expression;
}

interface IfStmt extends Node {
  type: 'If';
  test: Expression;
  consequent: Node; // Block or Stmt
  alternate?: Node;
}

interface ExprStmt extends Node {
  type: 'ExprStmt';
  expression: Expression;
}

type Expression = BinaryExpr | CallExpr | Literal | Identifier;

interface BinaryExpr extends Node {
  type: 'Binary';
  operator: string;
  left: Expression;
  right: Expression;
}

interface CallExpr extends Node {
  type: 'Call';
  callee: string;
  arguments: Expression[];
}

interface Literal extends Node {
  type: 'Literal';
  value: any;
}

interface Identifier extends Node {
  type: 'Identifier';
  name: string;
}

// --- 1. Tokenizer ---

interface Token {
  type: 'keyword' | 'identifier' | 'number' | 'operator' | 'punctuation';
  value: string;
  line: number;
}

function tokenize(code: string): Token[] {
  const tokens: Token[] = [];
  const lines = code.split('\n');
  
  lines.forEach((lineStr, lineIdx) => {
    let current = 0;
    while (current < lineStr.length) {
      let char = lineStr[current];

      // 空白
      if (/\s/.test(char)) {
        current++;
        continue;
      }

      // 关键字或标识符
      if (/[a-zA-Z_]/.test(char)) {
        let value = '';
        while (current < lineStr.length && /[a-zA-Z0-9_]/.test(lineStr[current])) {
          value += lineStr[current];
          current++;
        }
        const keywords = ['int', 'void', 'return', 'if', 'else'];
        tokens.push({
          type: keywords.includes(value) ? 'keyword' : 'identifier',
          value,
          line: lineIdx
        });
        continue;
      }

      // 数字
      if (/[0-9]/.test(char)) {
        let value = '';
        while (current < lineStr.length && /[0-9]/.test(lineStr[current])) {
          value += lineStr[current];
          current++;
        }
        tokens.push({ type: 'number', value, line: lineIdx });
        continue;
      }

      // 运算符和标点
      // 处理双字符运算符 <=, >=, ==
      if (current + 1 < lineStr.length) {
        const twoChar = char + lineStr[current + 1];
        if (['<=', '>=', '==', '!='].includes(twoChar)) {
          tokens.push({ type: 'operator', value: twoChar, line: lineIdx });
          current += 2;
          continue;
        }
      }

      if (['+', '-', '*', '/', '%', '=', '<', '>'].includes(char)) {
        tokens.push({ type: 'operator', value: char, line: lineIdx });
        current++;
        continue;
      }

      if (['(', ')', '{', '}', ';', ','].includes(char)) {
        tokens.push({ type: 'punctuation', value: char, line: lineIdx });
        current++;
        continue;
      }

      current++;
    }
  });

  return tokens;
}

// --- 2. Parser ---

class Parser {
  tokens: Token[];
  current: number = 0;

  constructor(tokens: Token[]) {
    this.tokens = tokens;
  }

  peek() { return this.tokens[this.current]; }
  
  consume(type?: string, value?: string) {
    const token = this.peek();
    if (!token) return null;
    if (type && token.type !== type) return null;
    if (value && token.value !== value) return null;
    this.current++;
    return token;
  }

  expect(value: string) {
    const token = this.consume();
    if (!token || token.value !== value) {
      throw new Error(`Expected '${value}' at line ${token?.line}`);
    }
    return token;
  }

  parseProgram(): Program {
    const globals: VarDecl[] = [];
    const functions: FunctionDef[] = [];

    while (this.current < this.tokens.length) {
      // 假设都是 int/void 开头
      const typeToken = this.consume('keyword');
      if (!typeToken) break;

      const nameToken = this.consume('identifier');
      if (!nameToken) throw new Error('Expected identifier');

      if (this.peek().value === '(') {
        // Function Def
        functions.push(this.parseFunctionDef(nameToken.value, typeToken.line));
      } else if (this.peek().value === '=' || this.peek().value === ';') {
        // Global Var
        globals.push(this.parseVarDecl(nameToken.value, typeToken.line));
      } else {
        throw new Error(`Unexpected token '${this.peek().value}' at line ${this.peek().line}`);
      }
    }

    return { type: 'Program', globals, functions };
  }

  parseFunctionDef(name: string, line: number): FunctionDef {
    this.expect('(');
    const params: string[] = [];
    while (this.peek().value !== ')') {
      this.consume('keyword'); // int
      const paramName = this.consume('identifier');
      if (paramName) params.push(paramName.value);
      if (this.peek().value === ',') this.consume();
    }
    this.expect(')');
    const body = this.parseBlock();
    return { type: 'FunctionDef', name, params, body, line };
  }

  parseBlock(): Block {
    const startToken = this.expect('{');
    const statements: Node[] = [];
    while (this.peek().value !== '}') {
      statements.push(this.parseStatement());
    }
    this.expect('}');
    return { type: 'Block', statements, line: startToken.line };
  }

  parseStatement(): Node {
    const token = this.peek();
    if (token.value === 'int') {
      this.consume();
      const name = this.consume('identifier')!.value;
      return this.parseVarDecl(name, token.line);
    }
    if (token.value === 'return') {
      this.consume();
      let arg;
      if (this.peek().value !== ';') {
        arg = this.parseExpression();
      }
      this.expect(';');
      return { type: 'Return', argument: arg, line: token.line } as ReturnStmt;
    }
    if (token.value === 'if') {
      this.consume();
      this.expect('(');
      const test = this.parseExpression();
      this.expect(')');
      // 简化：如果后面是 { 则是 Block，否则是单行
      let consequent;
      if (this.peek().value === '{') {
        consequent = this.parseBlock();
      } else {
        consequent = this.parseStatement();
      }
      return { type: 'If', test, consequent, line: token.line } as IfStmt;
    }
    
    // 表达式语句 (Assignment or Call)
    // 简单处理：如果是 identifier = expr;
    // 或者是 identifier(args);
    // 这里统一当做 ExprStmt，由 Expression 解析处理赋值?
    // 简化：这里我们只支持简单的 VarDecl 初始化，不支持独立赋值语句 'a = 10;' 如果不是声明
    // 但用户可能会写。
    // 让我们先解析 Expression，然后 expect ';'
    const expr = this.parseExpression();
    this.expect(';');
    return { type: 'ExprStmt', expression: expr, line: token.line } as ExprStmt;
  }

  parseVarDecl(name: string, line: number): VarDecl {
    let init;
    if (this.peek().value === '=') {
      this.consume();
      init = this.parseExpression();
    }
    this.expect(';');
    return { type: 'VarDecl', name, init, line };
  }

  parseExpression(): Expression {
    return this.parseBinary();
  }

  parseBinary(): Expression {
    let left = this.parsePrimary();
    while (['+', '-', '*', '/', '<=', '>=', '<', '>', '=='].includes(this.peek().value)) {
      const op = this.consume()!;
      const right = this.parsePrimary();
      left = { type: 'Binary', operator: op.value, left, right, line: op.line } as BinaryExpr;
    }
    return left;
  }

  parsePrimary(): Expression {
    const token = this.consume();
    if (!token) throw new Error('Unexpected end of input');

    if (token.type === 'number') {
      return { type: 'Literal', value: parseInt(token.value), line: token.line } as Literal;
    }
    if (token.type === 'identifier') {
      // Check if call
      if (this.peek().value === '(') {
        this.consume();
        const args: Expression[] = [];
        if (this.peek().value !== ')') {
          args.push(this.parseExpression());
          while (this.peek().value === ',') {
            this.consume();
            args.push(this.parseExpression());
          }
        }
        this.expect(')');
        return { type: 'Call', callee: token.value, arguments: args, line: token.line } as CallExpr;
      }
      return { type: 'Identifier', name: token.value, line: token.line } as Identifier;
    }
    if (token.value === '(') {
      const expr = this.parseExpression();
      this.expect(')');
      return expr;
    }
    throw new Error(`Unexpected token ${token.value} at line ${token.line}`);
  }
}

// --- 3. Interpreter & Step Generator ---

class Interpreter {
  program: Program;
  steps: ExecutionStep[] = [];
  globals: Record<string, any> = {};
  stack: any[] = []; // 模拟栈帧用于 step 生成逻辑

  constructor(program: Program) {
    this.program = program;
  }

  run() {
    // 1. Init Globals
    this.program.globals.forEach(g => {
      // 简单处理：全局变量初始化必须是常量？
      // 暂时忽略全局变量初始化执行步骤，直接赋值
      // 实际上我们可能希望看到全局变量初始化
      this.globals[g.name] = 0; // default
      if (g.init && g.init.type === 'Literal') {
        this.globals[g.name] = (g.init as Literal).value;
      }
      this.steps.push({
        line: g.line!,
        code: `int ${g.name} = ...;`,
        desc: `初始化全局变量 ${g.name}`,
        action: 'none'
      });
    });

    // 2. Call main
    const main = this.program.functions.find(f => f.name === 'main');
    if (!main) {
      this.steps.push({ line: 0, code: '', desc: '错误：未找到 main 函数', action: 'none' });
      return;
    }

    this.callFunction(main, []);
  }

  callFunction(func: FunctionDef, args: any[], callerLine?: number) {
    // Push Stack Frame
    const locals: Record<string, any> = {};
    const params: Record<string, any> = {};
    
    func.params.forEach((p, i) => {
      params[p] = args[i];
      locals[p] = args[i]; // 参数也是局部变量的一种
    });

    const frame = { funcName: func.name, params, locals };
    this.stack.push(frame);

    this.steps.push({
      line: func.line!,
      code: `int ${func.name}(...)`,
      desc: `调用 ${func.name}，入栈`,
      action: 'push',
      funcName: func.name,
      data: {
        returnAddr: callerLine ? `line:${callerLine}` : 'OS',
        oldFP: this.stack.length > 1 ? `0x${(1000 - (this.stack.length-2)*64).toString(16)}` : '0x0000',
        params: { ...params }, // snapshot
        locals: {} 
      }
    });

    // Execute Body
    const retVal = this.execBlock(func.body, locals);

    // Pop Stack Frame
    this.stack.pop();
    this.steps.push({
      line: func.body.statements[func.body.statements.length-1]?.line || func.line!,
      code: 'return ...;',
      desc: `${func.name} 返回 ${retVal}`,
      action: 'pop'
    });

    return retVal;
  }

  execBlock(block: Block, scope: Record<string, any>): any {
    for (const stmt of block.statements) {
      const result = this.execStatement(stmt, scope);
      if (result !== undefined && result !== null && (result as any).__isReturn) {
        return (result as any).value;
      }
    }
    return 0; // void return default
  }

  execStatement(stmt: Node, scope: Record<string, any>): any {
    if (stmt.type === 'VarDecl') {
      const decl = stmt as VarDecl;
      let val = 0;
      if (decl.init) {
        val = this.evalExpression(decl.init, scope);
      }
      scope[decl.name] = val;
      
      this.steps.push({
        line: decl.line!,
        code: `int ${decl.name} = ...;`,
        desc: `初始化局部变量 ${decl.name} = ${val}`,
        action: 'update',
        data: { locals: { [decl.name]: val.toString() } }
      });
      return;
    }

    if (stmt.type === 'Return') {
      const ret = stmt as ReturnStmt;
      let val = 0;
      if (ret.argument) {
        val = this.evalExpression(ret.argument, scope);
      }
      // Return signal
      return { __isReturn: true, value: val };
    }

    if (stmt.type === 'If') {
      const ifStmt = stmt as IfStmt;
      // Record checking condition
      this.steps.push({
        line: ifStmt.line!,
        code: 'if (...)',
        desc: `检查条件`,
        action: 'none'
      });
      
      const cond = this.evalExpression(ifStmt.test, scope);
      if (cond) {
        if (ifStmt.consequent.type === 'Block') {
          return this.execBlock(ifStmt.consequent as Block, scope);
        } else {
          return this.execStatement(ifStmt.consequent, scope);
        }
      } else if (ifStmt.alternate) {
        // Handle else
      }
      return;
    }

    if (stmt.type === 'ExprStmt') {
      this.evalExpression((stmt as ExprStmt).expression, scope);
      return;
    }
  }

  evalExpression(expr: Expression, scope: Record<string, any>): any {
    if (expr.type === 'Literal') return (expr as Literal).value;
    
    if (expr.type === 'Identifier') {
      const name = (expr as Identifier).name;
      if (name in scope) return scope[name];
      if (name in this.globals) return this.globals[name];
      return 0;
    }

    if (expr.type === 'Binary') {
      const bin = expr as BinaryExpr;
      const left = this.evalExpression(bin.left, scope);
      const right = this.evalExpression(bin.right, scope);
      switch (bin.operator) {
        case '+': return left + right;
        case '-': return left - right;
        case '*': return left * right;
        case '/': return Math.floor(left / right);
        case '<=': return left <= right ? 1 : 0;
        case '>=': return left >= right ? 1 : 0;
        case '<': return left < right ? 1 : 0;
        case '>': return left > right ? 1 : 0;
        case '==': return left === right ? 1 : 0;
      }
      return 0;
    }

    if (expr.type === 'Call') {
      const call = expr as CallExpr;
      const args = call.arguments.map(a => this.evalExpression(a, scope));
      
      const func = this.program.functions.find(f => f.name === call.callee);
      if (func) {
        // Record "preparing to call"
        this.steps.push({
          line: call.line!,
          code: `${call.callee}(...)`,
          desc: `准备调用 ${call.callee}`,
          action: 'none'
        });
        
        const ret = this.callFunction(func, args, call.line);
        
        // Record "returned"
        // 这里的 line 应该是 call 的位置
        // 我们需要 update 之前的 context? 
        // 实际上 call 往往嵌在 var decl 或 return 中，外层会再次 record update
        // 所以这里不需要专门 record update，除非是 ExprStmt
        return ret;
      }
    }
    return 0;
  }
}

export function simulateC(code: string): ExecutionStep[] {
  try {
    const tokens = tokenize(code);
    const parser = new Parser(tokens);
    const program = parser.parseProgram();
    const interpreter = new Interpreter(program);
    interpreter.run();
    return interpreter.steps;
  } catch (e: any) {
    console.error(e);
    return [{
      line: 0,
      code: 'Error',
      desc: `解析错误: ${e.message}`,
      action: 'none'
    }];
  }
}
