---
outline: false
pageClass: visualization-page no-print-button
---

# 实验：中间代码生成 (TAC Generation)

本实验演示如何将 C 语言源代码翻译为**四元式 (Quadruples)** 形式的中间代码。

**核心考点：**
1. **数组引用翻译**：演示如何将 `a[i]` 展开为基址加偏移量的计算序列（`width * i`）。
2. **控制流翻译**：演示 `while` 循环如何被翻译为 `if` 跳转和 `label`。
3. **临时变量**：观察编译器自动生成的 `t1`, `t2` 等临时变量。

<TACGenerator />

<FeedbackFooter />
