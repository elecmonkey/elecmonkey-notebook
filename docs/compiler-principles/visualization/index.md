# 可视化实验平台

本课程提供了一系列交互式可视化工具，帮助理解抽象的编译算法：

## 词法分析 (Lexical Analysis)
- [正则表达式转 NFA (Thompson算法)](./regex-to-nfa)
- [NFA 转 DFA (子集构造法)](./nfa-to-dfa)
- [DFA 最小化 (Hopcroft算法)](./dfa-minimizer)

## 语法分析 (Syntax Analysis)
- [FIRST & FOLLOW 集合计算](./first-follow)
- [文法转换 (消左递归/提左公因子)](./grammar-transformer)
- [LL(1) 分析表构造](./ll1-analyzer)
- [LR(1) 分析表构造](./lr1-analyzer)

## 语义分析与中间代码 (Semantics & IR)
- [语法制导翻译 (SDD/SDT)](./sdd-analyzer)
- [中间代码生成 (TAC)](./tac-generation)
- [DAG 与基本块优化](./dag-optimizer)
- [控制流分析 (CFG)](./control-flow-analysis)
- [回填技术 (Backpatching)](./backpatching)

## 运行时环境 (Runtime)
- [活动记录与栈式分配 (Activation Record)](./activation-record)
