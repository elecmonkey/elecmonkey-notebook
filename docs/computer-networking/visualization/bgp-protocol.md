---
outline: false
pageClass: visualization-page no-print-button
---

# 实验：BGP 协议 (Border Gateway Protocol)

本实验可视化演示 BGP 协议在 AS（自治系统）间的路由传播与路径选择过程。

<BgpProtocol />

## 核心机制

### 1. eBGP 与 iBGP
- **eBGP (External BGP)**: 建立在不同 AS 的路由器之间，用于在 AS 间传递路由。通常需直连。
- **iBGP (Internal BGP)**: 建立在同一 AS 的路由器之间，用于在 AS 内部传递从外部学到的路由。

### 2. 路径属性 (Path Attributes)
BGP 依靠属性进行选路和防环，而非简单的度量值。
- **AS-PATH**: 记录路由经过的 AS 序列。用于防环（看到自己的 AS 号则丢弃）和选路（越短越好）。
- **NEXT-HOP**: 下一跳 IP 地址。eBGP 传递时会修改为自己，iBGP 传递时通常保持不变。
- **LOCAL-PREF**: 本地偏好，仅在 AS 内传播，值越高越优先。

### 3. 路由选择 (Decision Process)
当存在多条路径到达同一目的地时，BGP 按顺序执行策略：
1. **Local Preference** 最高。
2. **AS-PATH** 最短。
3. **Origin** 类型（IGP > EGP > Incomplete）。
4. **MED** (Multi-Exit Discriminator) 最小。
5. **eBGP** 优于 iBGP。
6. **IGP Cost** 到下一跳最小。

<FeedbackFooter />
