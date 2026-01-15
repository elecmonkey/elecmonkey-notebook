---
outline: false
pageClass: visualization-page no-print-button
---

# DAG 与基本块优化

本页面演示如何通过构建 **DAG (有向无环图)** 对基本块内的代码进行局部优化。

## 功能演示

<DAGOptimizer />

## 优化原理

1.  **公共子表达式消除 (Common Subexpression Elimination)**：
    如果多个变量的计算表达式完全相同（操作符和操作数都相同），它们在 DAG 中会指向同一个节点，从而避免重复计算。

2.  **常量折叠 (Constant Folding)**：
    如果一个节点的两个操作数都是常量，可以在构建 DAG 时直接计算出结果，生成一个新的常量节点。

3.  **死代码消除 (Dead Code Elimination)**：
    如果一个 DAG 节点计算出的值没有被后续引用（即不是任何活跃变量的来源），那么该节点的计算指令可以被安全删除。

4.  **代数恒等式 (Algebraic Identities)**：
    例如 `x + 0 = x`, `x * 1 = x` 等，可以在构建 DAG 时直接简化。

## 考试题型解法

1.  **构建 DAG**：自底向上构建，对于每个形如 `A = B op C` 的指令：
    *   查找或创建 B 和 C 对应的节点。
    *   检查是否存在 `op(nodeB, nodeC)` 的节点。若存在，复用之；否则创建新节点。
    *   将变量 A 附加到该结果节点上。
2.  **标记活跃节点**：根据题目给定的“最后会被用到的变量”（Live-out Variables），在 DAG 上进行标记。
3.  **重构代码**：仅为被标记为“活跃”的节点生成三地址码。
