
export interface TAC {
  op: string;
  arg1: string;
  arg2: string;
  result: string;
  id?: number; // 原始行号，可选
}

export interface DAGNode {
  id: string;
  op: string; // 'leaf' for variables/constants
  val?: string; // value for leaf nodes (e.g. 'a', '10')
  left?: DAGNode;
  right?: DAGNode;
  identifiers: string[]; // attached identifiers
  isLive: boolean; // for dead code elimination
  isConstant: boolean;
  constValue?: number;
}

export interface DAGResult {
  nodes: DAGNode[];
  rootNodes: DAGNode[]; // Nodes that are roots of the DAG forest
}

// 1. Parse TAC String
export function parseTACBlock(input: string): TAC[] {
  const lines = input.split('\n').filter(l => l.trim());
  const tacs: TAC[] = [];
  
  lines.forEach((line, idx) => {
    // 假设格式: result = arg1 op arg2  或者 result = arg1
    // 简单处理：去空格
    // 支持形式:
    // A = B + C
    // A = B
    // A = 10
    
    // 移除注释
    const cleanLine = line.split('//')[0].trim();
    if (!cleanLine) return;

    const parts = cleanLine.split('=');
    if (parts.length !== 2) return;

    const res = parts[0].trim();
    const rhs = parts[1].trim();
    
    // Check op
    // 常见 op: +, -, *, /
    // 简单正则匹配
    const binMatch = rhs.match(/^(.+)([\+\-\*\/])(.+)$/);
    if (binMatch) {
      tacs.push({
        op: binMatch[2].trim(),
        arg1: binMatch[1].trim(),
        arg2: binMatch[3].trim(),
        result: res,
        id: idx + 1
      });
    } else {
      // Assignment: A = B
      tacs.push({
        op: '=',
        arg1: rhs,
        arg2: '',
        result: res,
        id: idx + 1
      });
    }
  });
  return tacs;
}

// 2. Build DAG
export function buildDAG(tacs: TAC[], enableOptimizations: boolean = false): DAGResult {
  const nodes: DAGNode[] = [];
  let nodeIdCounter = 1;
  
  // Map to store current node for each identifier
  // 变量名 -> 指向的 DAG 节点
  const varMap = new Map<string, DAGNode>();
  
  // Map for Value Numbering: key -> DAGNode
  // key format: "op,leftID,rightID" or "leaf,val"
  const valueMap = new Map<string, DAGNode>();

  // Helper to get or create leaf node
  function getOrCreateLeaf(val: string): DAGNode {
    // Check if it's a number (constant)
    const isNum = !isNaN(parseFloat(val));
    const key = `leaf,${val}`;
    
    // 如果是变量，且已经有定义，直接返回该变量当前的节点
    // 注意：如果是变量出现在右侧（使用），我们应该查找它当前指向的节点。
    // 如果该变量还没定义过（例如输入变量），我们需要为它创建一个初始叶子节点。
    if (!isNum && varMap.has(val)) {
      return varMap.get(val)!;
    }
    
    // 如果是常量，或者未定义的变量（作为初始值），检查是否已经有相同的叶子节点
    // 常量折叠优化：如果已经有这个常量的节点，复用它
    if (valueMap.has(key)) {
      return valueMap.get(key)!;
    }
    
    const node: DAGNode = {
      id: `n${nodeIdCounter++}`,
      op: 'leaf',
      val: val,
      identifiers: [],
      isLive: false, // will be marked later
      isConstant: isNum,
      constValue: isNum ? parseFloat(val) : undefined
    };
    
    // 只有初始变量（作为输入）才把名字附上去？
    // 不，"identifiers" 列表通常表示“当前值为此节点的变量集合”。
    // 对于初始叶子节点，如果它是变量 X 的初始值，那么 X 应该在它的列表里。
    // 但是，如果后续 X 被重新赋值，X 就会从这个列表“逻辑上”移动到新节点。
    // 在我们的实现中，varMap 决定了变量当前指向哪个节点。
    // identifiers 数组可以用来最后生成代码，或者可视化显示“哪些变量当前拥有这个值”。
    
    // 如果是变量初始值，先把变量名加上
    if (!isNum) {
      node.identifiers.push(val);
      varMap.set(val, node); // Update varMap
    }

    valueMap.set(key, node);
    nodes.push(node);
    return node;
  }

  // Process each TAC
  tacs.forEach(tac => {
    // 1. Get/Create operands
    let leftNode = getOrCreateLeaf(tac.arg1);
    
    if (tac.op === '=') {
      // Assignment: result = arg1
      // 这是一个 copy 操作。
      // 在 DAG 中，这意味着 result 变量现在指向 arg1 对应的节点。
      // 我们不需要创建新节点，只需要更新 varMap 和 identifiers
      
      // Remove result from previous node's identifiers list (optional, but good for visualization)
      // 实际上很难高效找到之前的节点并删除，且一个变量可能在不同时间点指向不同节点。
      // 简单的做法：identifiers 字段只在最后代码重构时有用，
      // 或者我们在遍历时动态维护：
      // 当 result 被赋值时，它就“属于”新的节点。
      // 为了可视化，我们可以在每个节点上记录“当前指向该节点的变量”。
      // 但由于这是静态 DAG，我们可能需要记录的是“在该基本块结束时，哪些变量指向该节点”。
      
      // 更新映射
      varMap.set(tac.result, leftNode);
      
      // 我们暂且把 result 加到 leftNode 的 identifiers 里
      // 注意：如果 result 之前在别的节点，是否要移除？
      // 在 DAG 图示中，通常显示的是基本块结束时的状态。
      // 所以我们应该维护一个全局的 "当前 identifiers 归属"。
      
      return; 
    }
    
    // Binary Op
    let rightNode = getOrCreateLeaf(tac.arg2);
    
    // Constant Folding check
    if (enableOptimizations && leftNode.isConstant && rightNode.isConstant && leftNode.constValue !== undefined && rightNode.constValue !== undefined) {
      // 计算结果
      let resVal = 0;
      switch(tac.op) {
        case '+': resVal = leftNode.constValue + rightNode.constValue; break;
        case '-': resVal = leftNode.constValue - rightNode.constValue; break;
        case '*': resVal = leftNode.constValue * rightNode.constValue; break;
        case '/': resVal = leftNode.constValue / rightNode.constValue; break; // 简单处理除法
      }
      // 创建或获取常量节点
      const constNode = getOrCreateLeaf(resVal.toString());
      varMap.set(tac.result, constNode);
      return;
    }

    // Algebraic Identities (代数恒等式)
    // x+0=x, 0+x=x, x*1=x, 1*x=x, x-0=x, x/1=x, x*0=0, 0*x=0
    if (enableOptimizations && ['+', '-', '*', '/'].includes(tac.op)) {
      let simplifiedNode: DAGNode | null = null;
      const isConst = (n: DAGNode, v: number) => n.isConstant && n.constValue === v;

      if (tac.op === '+') {
        if (isConst(rightNode, 0)) simplifiedNode = leftNode;
        else if (isConst(leftNode, 0)) simplifiedNode = rightNode;
      } else if (tac.op === '*') {
        if (isConst(rightNode, 1)) simplifiedNode = leftNode;
        else if (isConst(leftNode, 1)) simplifiedNode = rightNode;
        else if (isConst(rightNode, 0)) simplifiedNode = rightNode; // Result is 0
        else if (isConst(leftNode, 0)) simplifiedNode = leftNode;   // Result is 0
      } else if (tac.op === '-') {
        if (isConst(rightNode, 0)) simplifiedNode = leftNode;
      } else if (tac.op === '/') {
        if (isConst(rightNode, 1)) simplifiedNode = leftNode;
      }

      if (simplifiedNode) {
        varMap.set(tac.result, simplifiedNode);
        return; // Skip creating new node
      }
    }

    // Associative Constant Folding (Advanced)
    // Handle (A op C1) op C2 -> A op (C1 op C2) or (C1 op A) op C2 -> A op (C1 op C2)
    // Only for + and *
    if (enableOptimizations && (tac.op === '+' || tac.op === '*') && rightNode.isConstant && rightNode.constValue !== undefined) {
      if (leftNode.op === tac.op) {
        // Case 1: (A op C1) op C2
        if (leftNode.right && leftNode.right.isConstant && leftNode.right.constValue !== undefined) {
          const c1 = leftNode.right.constValue;
          const c2 = rightNode.constValue;
          const newC = tac.op === '+' ? c1 + c2 : c1 * c2;
          
          // Update operands: New Left is A, New Right is (C1 op C2)
          leftNode = leftNode.left!; 
          rightNode = getOrCreateLeaf(newC.toString());
        }
        // Case 2: (C1 op A) op C2
        else if (leftNode.left && leftNode.left.isConstant && leftNode.left.constValue !== undefined) {
           const c1 = leftNode.left.constValue;
           const c2 = rightNode.constValue;
           const newC = tac.op === '+' ? c1 + c2 : c1 * c2;
           
           leftNode = leftNode.right!; 
           rightNode = getOrCreateLeaf(newC.toString());
        }
      }
    }
    
    // Value Numbering check
    const key = `${tac.op},${leftNode.id},${rightNode.id}`;
    let node: DAGNode;
    
    if (valueMap.has(key)) {
      node = valueMap.get(key)!;
    } else {
      node = {
        id: `n${nodeIdCounter++}`,
        op: tac.op,
        left: leftNode,
        right: rightNode,
        identifiers: [],
        isLive: false,
        isConstant: false
      };
      valueMap.set(key, node);
      nodes.push(node);
    }
    
    // Update varMap
    varMap.set(tac.result, node);
  });
  
  // Final pass to populate identifiers for visualization
  // 遍历 varMap，把变量名加到对应节点的 identifiers 列表中
  // 这样能反映“最终状态”
  // 为了避免重复，先清空所有节点的 identifiers (除了初始叶子节点可能保留初始名？)
  // 策略：重置所有 identifiers，只保留 varMap 中的映射
  nodes.forEach(n => n.identifiers = []);
  
  // 但我们也要保留初始值的变量名吗？
  // 比如 a = b + c。 b 和 c 是初始叶子。
  // 如果我们清空了 b 节点的 identifiers，图中就不知道它是 b 了。
  // 所以：
  // 1. 初始叶子节点创建时，val 就是它的名字（如果是变量）。我们保留 val 字段用于显示。
  // 2. identifiers 列表仅用于显示“计算出的变量”（LHS）。
  
  varMap.forEach((node, varName) => {
    if (!node.identifiers.includes(varName)) {
      // 只有当变量名和 val 不一样，或者节点是操作符节点时，才添加？
      // 为了清晰，全部添加。
      // 但对于叶子节点 leaf 'a'，如果 identifiers 里又有 'a'，显示会冗余 'a, {a}'。
      // 我们在显示时过滤一下。
      node.identifiers.push(varName);
    }
  });

  return { nodes, rootNodes: nodes }; 
}

// 3. Mark Dead Code
export function markDeadCode(nodes: DAGNode[], liveOutVars: string[], varMap: Map<string, DAGNode>) {
  // Reset live status
  nodes.forEach(n => n.isLive = false);
  
  // 辅助函数：递归标记
  function mark(node: DAGNode) {
    if (node.isLive) return; // Already marked
    node.isLive = true;
    if (node.left) mark(node.left);
    if (node.right) mark(node.right);
  }
  
  // 从 liveOutVars 出发
  liveOutVars.forEach(v => {
    // 找到该变量在 DAG 中对应的节点
    // 我们需要重新构建 varMap 或者传入 varMap
    // 简单起见，我们在 buildDAG 里实际上已经有了 varMap 的最终状态。
    // 这里为了解耦，我们假设 varMap 是已知的，或者我们通过 identifiers 倒推。
    // 倒推：遍历所有节点，看 identifiers 是否包含 v
    const node = nodes.find(n => n.identifiers.includes(v));
    if (node) {
      mark(node);
    }
  });
}

// 4. Reconstruct Code
export function reconstructCode(nodes: DAGNode[]): string[] {
  const lines: string[] = [];
  const processed = new Set<number>();
  
  // 拓扑排序 (Topological Sort)
  // 简单的 DFS 后序遍历的逆序，或者直接遍历 nodes（如果 nodes 是按创建顺序排列的，本身就是拓扑序）
  // 因为新节点总是依赖旧节点，所以 nodes 数组顺序本身就是合法的计算顺序。
  
  nodes.forEach(node => {
    if (!node.isLive) return; // Skip dead code
    if (node.op === 'leaf') return; // Skip leaf declarations (unless we need to print initial values? No, TAC doesn't decl)
    
    // 生成代码
    // 目标： A = B op C
    // A 是该节点上的一个变量名。如果没有变量名附着（例如临时结果），我们需要生成临时变量。
    // 但根据题目，通常会有变量附着。如果没有，说明这个计算是中间步骤，需要生成临时变量。
    
    let target = node.identifiers.length > 0 ? node.identifiers[0] : node.id;
    
    // 左操作数
    let arg1 = getOperandName(node.left!);
    // 右操作数
    let arg2 = getOperandName(node.right!);
    
    lines.push(`${target} = ${arg1} ${node.op} ${arg2}`);
    
    // 如果有多个变量指向这个节点（公共子表达式的结果赋给了多个变量）
    // 生成拷贝指令：X = target
    for (let i = 1; i < node.identifiers.length; i++) {
      lines.push(`${node.identifiers[i]} = ${target}`);
    }
  });
  
  return lines;
}

function getOperandName(node: DAGNode): string {
  if (node.op === 'leaf') {
    // 优先使用 val (常量或初始变量名)
    return node.val || '?';
  } else {
    // 内部节点，使用其关联的第一个变量名，或者临时名
    return node.identifiers.length > 0 ? node.identifiers[0] : node.id;
  }
}

// Helper to convert DAG to Dot for Viz.js
export function dagToDot(nodes: DAGNode[], showLiveness: boolean = true): string {
  let dot = 'digraph DAG {\n';
  // Increase nodesep and ranksep for looser layout
  dot += '  rankdir=BT;\n'; 
  dot += '  nodesep=0.8;\n'; 
  dot += '  ranksep=0.8;\n';
  dot += '  node [shape=circle, fontname="Helvetica"];\n';
  
  // Helper for HTML escaping
  const escapeHtml = (str: string) => str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

  // Format ID: n1 -> n1 (No subscript)
  const formatId = (id: string) => {
    return escapeHtml(id);
  }

  // Pre-calculate which nodes are parents (to detect orphaned leaves)
  const isParent = new Set<string>();
  nodes.forEach(n => {
    if (n.left) isParent.add(n.left.id);
    if (n.right) isParent.add(n.right.id);
  });

  nodes.forEach(node => {
    // Filter out orphaned nodes:
    // ... (logic unchanged)
    /*
    if (node.op === 'leaf' && 
        !isParent.has(node.id) && 
        node.identifiers.length === 0 &&
        !node.isLive) {
      return; // Skip rendering
    }
    */

    // Style
    let nodeColor = 'black';
    let nodeStyle = 'solid'; // Circle border
    let nodeFillColor = 'white'; // Transparent/White fill for circle
    
    // Edges
    let edgeColor = 'black';
    let edgeStyle = 'solid';

    if (showLiveness) {
       // Only change style if dead
       if (!node.isLive) {
         nodeColor = 'gray';
         nodeStyle = 'dashed';
         edgeColor = 'gray';
         edgeStyle = 'dashed';
         // Optional: make dead nodes lighter fill?
         nodeFillColor = '#fafafa';
       }
       if (node.isConstant) {
         // Highlight constant? Or just keep simple.
         // Let's keep constants simple circle too, maybe slight fill?
         // User asked for specific format: circle with ID inside.
       }
    }
    
    // Label Construction (HTML-like)
    let centerLabel = `<FONT POINT-SIZE="12">${formatId(node.id)}</FONT>`;
    
    let xLabelHtml = "";
    
    // Identifiers (Right side)
    if (node.identifiers.length > 0) {
      xLabelHtml += `<FONT POINT-SIZE="12">${node.identifiers.join(',')}</FONT><BR/>`;
    }
    
    // Operator/Value (Bottom)
    let content = node.op === 'leaf' ? (node.val || '?') : node.op;
    xLabelHtml += `<FONT POINT-SIZE="12"><B>${escapeHtml(content)}</B></FONT>`;
    
    // Using xlabel
    // Adjusted width/height for smaller nodes
    dot += `  ${node.id} [label=<${centerLabel}>, xlabel=<${xLabelHtml}>, shape="circle", width=0.5, height=0.5, fixedsize=true, color="${nodeColor}", style="${nodeStyle}", fillcolor="${nodeFillColor}"];\n`;
    
    // Edges
    // Adjust arrowsize for smaller scale
    const edgeAttr = `color="${edgeColor}", style="${edgeStyle}", arrowsize=0.8`;

    if (node.left) {
      dot += `  ${node.left.id} -> ${node.id} [${edgeAttr}];\n`; 
    }
    if (node.right) {
       dot += `  ${node.right.id} -> ${node.id} [${edgeAttr}];\n`;
    }
  });
  
  // Force xlabel placement?
  dot += '  forcelabels=true;\n';
  
  dot += '}';
  return dot;
}
