---
pageClass: no-print-button
---

# 计算机网络可视化实验

本章节包含一系列交互式实验，旨在通过动态演示帮助理解网络协议的核心机制。

## 应用层 (Application Layer)

### [DNS 域名解析](./dns-query)
可视化演示 DNS 的迭代查询与递归查询过程。
- **功能特性**：
  - 支持切换迭代/递归模式
  - 展示根、TLD、权威服务器的交互

### [DHCP 动态主机配置](./dhcp-process)
演示 DHCP 协议的 DORA 四步交互流程。

## 传输层 (Transport Layer)

### [TCP 连接管理](./tcp-connection)
完整演示 TCP 三次握手建立连接与四次挥手释放连接的过程。
- **功能特性**：
  - 客户端/服务器状态机可视化
  - 报文交互动画 (SYN, FIN, ACK)

## 网络层 (Network Layer)

### [ARP 地址解析](./arp-protocol)
演示 ARP 请求与响应过程及缓存表更新。

### [Dijkstra 最短路径算法](./dijkstra-algorithm)
可视化演示链路状态（Link-State）路由算法的执行过程。
- **功能特性**：
  - 动态展示节点加入集合 $N'$ 的过程
  - 实时更新距离向量表 $D(v)$ 和前驱节点 $p(v)$
  - 支持多种预设拓扑（环路、菱形、星型）
  - 支持自定义图结构输入

### [距离向量 (DV) 路由算法](./distance-vector)
模拟距离向量（Distance-Vector）协议在网络故障场景下的行为。
- **功能特性**：
  - 模拟链路故障（Cost 突增）
  - 逐步演示路由表交换与收敛过程
  - 观察“无穷计数”问题 (Count-to-Infinity)
  - 启用“毒性逆转” (Poison Reverse) 解决方案
