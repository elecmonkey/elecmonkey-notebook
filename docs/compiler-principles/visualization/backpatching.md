---
outline: false
pageClass: visualization-page no-print-button
---

# 实验：回填技术 (Backpatching)

本实验演示布尔表达式翻译中的**回填 (Backpatching)** 技术。

**核心考点：**
1. **真/假链 (True/False List)**：理解如何用链表管理待定的跳转目标。
2. **短路求值**：观察 `||` 和 `&&` 运算符如何触发中间的回填操作。
3. **回填动作**：当目标地址确定时，如何将地址填入之前的空坑位（`_?_`）。

<BackpatchingAnalyzer />
