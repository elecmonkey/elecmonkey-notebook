---
outline: false
pageClass: visualization-page no-print-button
---

# 实验：控制流分析 (Control Flow Analysis)

本实验演示如何从**三地址码 (TAC)** 构建**控制流图 (CFG)**，并识别循环结构。

**核心步骤：**
1. **识别 Leaders**：找出基本块的入口指令。
2. **划分基本块**：将 Leaders 之间的指令打包。
3. **构建流图**：连接基本块，形成有向图。
4. **回边与循环**：识别回边（Back Edge）和自然循环。

<ControlFlowAnalyzer />

<FeedbackFooter />
