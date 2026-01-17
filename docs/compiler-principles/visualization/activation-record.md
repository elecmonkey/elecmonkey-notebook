---
outline: false
pageClass: visualization-page no-print-button
---

# 实验：活动记录 (Activation Record) 可视化

本实验演示 C 语言函数调用时的**运行时栈（Runtime Stack）**变化，以及单个**活动记录（栈帧）**的内部结构。

**核心概念：**
1. **Typical Subdivision**: C 语言活动记录的典型分区（参数、返回地址、控制链、局部变量等）。
2. **LIFO**: 函数调用遵循“后进先出”原则。
3. **递归**: 观察递归调用时，栈中如何同时存在多个 `fact` 函数的活动记录。

<ActivationRecord />

<FeedbackFooter />
