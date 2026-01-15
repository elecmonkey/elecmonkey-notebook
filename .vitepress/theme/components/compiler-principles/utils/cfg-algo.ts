
// 三地址码 (TAC) 结构定义
export interface TACInstruction {
  id: number; // 行号 (1-based)
  op: string; // if, goto, =, +, -, *, /
  arg1: string;
  arg2: string;
  result: string;
  original: string; // 原始文本
  target?: number; // 跳转目标行号
}

// 基本块定义
export interface BasicBlock {
  id: number; // 块ID (通常用入口行号或序列号)
  instructions: TACInstruction[];
  leaders: Set<number>; // 该块内的 Leader 行号 (通常只有第一行，除非合并)
  next: number[]; // 后继块 ID 列表
  prev: number[]; // 前驱块 ID 列表
}

// 控制流图定义
export interface ControlFlowGraph {
  blocks: BasicBlock[];
  edges: { from: number, to: number, type: 'normal' | 'back' }[];
  loops: { backEdge: { from: number, to: number }, nodes: number[] }[];
}

// 1. TAC 解析器
export function parseTAC(input: string): TACInstruction[] {
  const lines = input.split('\n').filter(l => l.trim().length > 0);
  const instructions: TACInstruction[] = [];

  lines.forEach((line) => {
    // 简单解析：假设格式 "(1) if a < b goto 3" 或 "1: t1 = a + b"
    // 提取行号和内容
    const match = line.match(/^\s*\(?(\d+)\)?[:\s]+(.*)$/);
    if (!match) return;

    const id = parseInt(match[1], 10);
    const content = match[2].trim();
    let op = '', arg1 = '', arg2 = '', result = '', target: number | undefined = undefined;

    // 识别指令类型
    if (content.startsWith('if')) {
      // if x < y goto L
      const ifMatch = content.match(/^if\s+(.+)\s+goto\s+(\d+)$/);
      if (ifMatch) {
        op = 'if';
        arg1 = ifMatch[1]; // condition
        target = parseInt(ifMatch[2], 10);
      }
    } else if (content.startsWith('goto')) {
      // goto L
      const gotoMatch = content.match(/^goto\s+(\d+)$/);
      if (gotoMatch) {
        op = 'goto';
        target = parseInt(gotoMatch[1], 10);
      }
    } else if (content.includes('=')) {
      // x = y op z  OR  x = y
      const parts = content.split('=').map(s => s.trim());
      result = parts[0];
      const rhs = parts[1];
      
      // 检查 RHS 是否有运算符
      // 简单起见，支持 + - * /
      const binMatch = rhs.match(/^(.+)\s+([\+\-\*\/])\s+(.+)$/);
      if (binMatch) {
        arg1 = binMatch[1];
        op = binMatch[2];
        arg2 = binMatch[3];
      } else {
        op = '=';
        arg1 = rhs;
      }
    }

    instructions.push({
      id,
      op,
      arg1,
      arg2,
      result,
      original: line,
      target
    });
  });

  return instructions.sort((a, b) => a.id - b.id);
}

// 2. 查找 Leaders
export function findLeaders(instructions: TACInstruction[]): Set<number> {
  const leaders = new Set<number>();
  
  if (instructions.length === 0) return leaders;

  // 规则1: 第一条指令是 Leader
  leaders.add(instructions[0].id);

  instructions.forEach((inst, index) => {
    // 规则2: 跳转指令的目标是 Leader
    if (inst.target !== undefined) {
      leaders.add(inst.target);
    }

    // 规则3: 跳转指令的下一条是 Leader
    if ((inst.op === 'goto' || inst.op === 'if') && index + 1 < instructions.length) {
      leaders.add(instructions[index + 1].id);
    }
  });

  return leaders;
}

// 3. 构建基本块
export function buildBasicBlocks(instructions: TACInstruction[], leaders: Set<number>): BasicBlock[] {
  const blocks: BasicBlock[] = [];
  let currentBlock: BasicBlock | null = null;

  instructions.forEach((inst) => {
    if (leaders.has(inst.id)) {
      // 新块开始
      if (currentBlock) {
        blocks.push(currentBlock);
      }
      currentBlock = {
        id: inst.id,
        instructions: [],
        leaders: new Set([inst.id]),
        next: [],
        prev: []
      };
    }

    if (currentBlock) {
      currentBlock.instructions.push(inst);
    }
  });

  if (currentBlock) {
    blocks.push(currentBlock);
  }

  return blocks;
}

// 4. 构建控制流图 (连接边)
export function buildCFG(blocks: BasicBlock[]): ControlFlowGraph {
  const blockMap = new Map<number, BasicBlock>();
  blocks.forEach(b => blockMap.set(b.id, b));

  const edges: { from: number, to: number, type: 'normal' | 'back' }[] = [];

  blocks.forEach((block, index) => {
    const lastInst = block.instructions[block.instructions.length - 1];

    // 1. 如果有跳转，连接目标
    if (lastInst.target !== undefined) {
      // 目标块 ID 就是 target 行号 (前提是 target 也是 Leader)
      // 注意：findLeaders 保证了 target 一定是 Leader，所以一定对应某个 Block 的 ID
      if (blockMap.has(lastInst.target)) {
        block.next.push(lastInst.target);
        blockMap.get(lastInst.target)!.prev.push(block.id);
        edges.push({ from: block.id, to: lastInst.target, type: 'normal' });
      }
    }

    // 2. 如果不是无条件跳转，且不是最后一块，连接下一块
    if (lastInst.op !== 'goto' && index + 1 < blocks.length) {
      const nextBlock = blocks[index + 1];
      block.next.push(nextBlock.id);
      nextBlock.prev.push(block.id);
      edges.push({ from: block.id, to: nextBlock.id, type: 'normal' });
    }
  });

  // 5. 检测回边 (简单算法：DFS 查找指向祖先的边)
  // 这里的 back edge 定义为：n -> h，且 h 在 n 的支配节点集中 (Dominator)
  // 简化版：在 DFS 栈中的节点即为祖先
  
  const visited = new Set<number>();
  const recursionStack = new Set<number>();
  const backEdges = new Set<string>(); // "from-to"

  function dfs(blockId: number) {
    visited.add(blockId);
    recursionStack.add(blockId);

    const block = blockMap.get(blockId);
    if (block) {
      block.next.forEach(nextId => {
        if (recursionStack.has(nextId)) {
          // Found back edge
          backEdges.add(`${blockId}-${nextId}`);
        } else if (!visited.has(nextId)) {
          dfs(nextId);
        }
      });
    }

    recursionStack.delete(blockId);
  }

  if (blocks.length > 0) {
    dfs(blocks[0].id);
  }

  // 标记边类型
  edges.forEach(e => {
    if (backEdges.has(`${e.from}-${e.to}`)) {
      e.type = 'back';
    }
  });

  // 识别循环 (自然循环)
  // Back edge n -> h
  // Loop consists of h plus all nodes that can reach n without going through h
  const loops: { backEdge: { from: number, to: number }, nodes: number[] }[] = [];
  
  backEdges.forEach(key => {
    const [nStr, hStr] = key.split('-');
    const n = parseInt(nStr);
    const h = parseInt(hStr);

    const loopNodes = new Set<number>([h, n]);
    const queue = [n];
    
    while (queue.length > 0) {
      const m = queue.pop()!;
      const mBlock = blockMap.get(m);
      if (mBlock) {
        mBlock.prev.forEach(p => {
          if (!loopNodes.has(p)) {
            loopNodes.add(p);
            queue.push(p);
          }
        });
      }
    }
    
    loops.push({
      backEdge: { from: n, to: h },
      nodes: Array.from(loopNodes)
    });
  });

  return { blocks, edges, loops };
}

// 自动布局 (简单的分层布局，计算 x, y)
export function layoutCFG(cfg: ControlFlowGraph): Record<number, { x: number, y: number }> {
  const pos: Record<number, { x: number, y: number }> = {};
  const levels: number[][] = [];
  const visited = new Set<number>();

  // BFS 分层
  if (cfg.blocks.length === 0) return pos;

  let currentLevel = [cfg.blocks[0].id];
  visited.add(cfg.blocks[0].id);

  while (currentLevel.length > 0) {
    levels.push(currentLevel);
    const nextLevel: number[] = [];

    currentLevel.forEach(id => {
      const block = cfg.blocks.find(b => b.id === id);
      if (block) {
        block.next.forEach(nid => {
          // 忽略回边，避免死循环
          const isBack = cfg.edges.find(e => e.from === id && e.to === nid && e.type === 'back');
          if (!visited.has(nid) && !isBack) {
            visited.add(nid);
            nextLevel.push(nid);
          }
        });
      }
    });
    currentLevel = nextLevel;
  }

  // 处理未访问的块 (孤岛或死代码)
  cfg.blocks.forEach(b => {
    if (!visited.has(b.id)) {
      // 简单追加到最后
      levels.push([b.id]);
      visited.add(b.id);
    }
  });

  // 计算坐标
  const BLOCK_WIDTH = 180;
  const BLOCK_HEIGHT = 100; // 估算
  const X_SPACING = 40;
  const Y_SPACING = 80;

  levels.forEach((level, lvlIdx) => {
    const totalWidth = level.length * BLOCK_WIDTH + (level.length - 1) * X_SPACING;
    const startX = -totalWidth / 2 + BLOCK_WIDTH / 2;

    level.forEach((id, itemIdx) => {
      pos[id] = {
        x: startX + itemIdx * (BLOCK_WIDTH + X_SPACING) + 400, // +400 center offset
        y: lvlIdx * (BLOCK_HEIGHT + Y_SPACING) + 50
      };
    });
  });

  return pos;
}
