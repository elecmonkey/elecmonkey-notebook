# 编译原理

## 课程概述

编译原理是计算机科学的核心课程之一，主要研究如何将高级程序语言翻译成机器语言的理论、技术和工具。

## 课程目标

- 理解编译过程的各个阶段及其相互关系
- 掌握词法分析、语法分析等核心技术
- 学习语法制导翻译和中间代码生成
- 了解运行时环境的组织和管理

## 课程内容

### [第一章：编译原理简介](./ch01-introduction)
- 编译器的基本概念和结构
- 编译过程概述
- 编译器的发展历史

### [第二章：词法分析](./ch02-lexical-analysis)
- 词法分析器的设计
- 正则表达式和有限自动机
- 词法分析器的实现

### [第三章：语法分析](./ch03-syntax-analysis)
- 自顶向下分析法
- 自底向上分析法
- LR分析器的构造

### [第四章：语法制导翻译](./ch04-syntax-directed-translation)
- 语法制导定义
- 属性文法
- 翻译模式

### [第五章：中间表示生成](./ch05-intermediate-representation)
- 中间代码的形式
- 三地址代码
- 语法树到中间代码的翻译

### [第六章：运行时环境](./ch06-runtime-environment)
- 存储组织
- 栈式存储分配
- 动态存储管理

## 可视化实验平台

本笔记提供了一系列交互式可视化工具，帮助理解抽象的编译算法：

### 词法分析 (Lexical Analysis)
- [正则表达式转 NFA (Thompson算法)](./visualization/regex-to-nfa)
- [NFA 转 DFA (子集构造法)](./visualization/nfa-to-dfa)
- [DFA 最小化 (Hopcroft算法)](./visualization/dfa-minimizer)

### 语法分析 (Syntax Analysis)
- [FIRST & FOLLOW 集合计算](./visualization/first-follow)
- [文法转换 (消左递归/提左公因子)](./visualization/grammar-transformer)
- [LL(1) 分析表构造](./visualization/ll1-analyzer)
- [LR(1) 分析表构造](./visualization/lr1-analyzer)

### 语义分析与中间代码 (Semantics & IR)
- [语法制导翻译 (SDD/SDT)](./visualization/sdd-analyzer)
- [中间代码生成 (TAC)](./visualization/tac-generation)
- [DAG 与基本块优化](./visualization/dag-optimizer)
- [控制流分析 (CFG)](./visualization/control-flow-analysis)
- [回填技术 (Backpatching)](./visualization/backpatching)

### 运行时环境 (Runtime)
- [活动记录与栈式分配 (Activation Record)](./visualization/activation-record)

## 学习资源

- **教材**: 《Compilers Principles, Techniques, & Tools》