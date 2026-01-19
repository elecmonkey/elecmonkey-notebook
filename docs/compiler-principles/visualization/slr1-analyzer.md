---
outline: false
pageClass: visualization-page no-print-button
---

# 实验：SLR(1) 分析表

SLR(1) (Simple LR) 分析法是对 LR(0) 的改进。

它使用 LR(0) 的状态集（项目集族），但在构建分析表时，利用 FOLLOW 集来解决归约冲突。只有当下一个输入符号在归约产生式左部的 FOLLOW 集中时，才进行归约。

<SLR1Analyzer />

<FeedbackFooter />
