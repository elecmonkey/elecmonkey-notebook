---
outline: false
pageClass: visualization-page no-print-button
---

# 实验：OSPF 协议 (Open Shortest Path First)

本实验可视化演示 OSPF 协议的核心机制，包括邻居发现、DR/BDR 选举、LSA 泛洪与 SPF 计算。

<OspfProtocol />

## 核心机制

### 1. 邻居发现 (Hello Protocol)
路由器周期性发送 Hello 报文来发现邻居并维持邻接关系。
- **2-Way State**: 双方互相收到 Hello。
- **Full State**: 邻接关系完全建立（在广播链路上需经过 DR 选举）。

### 2. DR/BDR 选举
在广播型网络（如以太网）中，为了减少邻接关系数量（由 $O(N^2)$ 降为 $O(N)$），需要选举 **DR (Designated Router)** 和 **BDR (Backup DR)**。
- **DR**: 负责与所有其他路由器建立邻接关系，并向全网泛洪 LSA。
- **BDR**: DR 的备份，同时也与所有路由器建立邻接关系。
- **DROther**: 仅与 DR/BDR 建立邻接关系。

### 3. LSA 泛洪与 LSDB 同步
当链路状态发生变化时，路由器产生 **LSA (Link State Advertisement)**。
- LSA 包含路由器的直连链路信息。
- 通过可靠泛洪机制，LSA 传播到区域内所有路由器。
- 最终，所有路由器拥有相同的 **LSDB (Link State Database)**。

### 4. SPF 计算
每个路由器以自己为根，使用 **Dijkstra 算法** 基于 LSDB 计算最短路径树 (Shortest Path Tree)，生成路由表。

<FeedbackFooter />
