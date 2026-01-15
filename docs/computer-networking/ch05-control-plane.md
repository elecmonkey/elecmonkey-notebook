# 第5章 网络层：控制平面

## 5.1 路由问题与算法分类
### 5.1.1 路由问题的本质
路由（routing）解决“从源到目的走哪条路更好”的问题。路径被抽象为一系列路由器（router）组成的序列，路径“好”通常意味着代价最小、延迟最小或拥塞最小。

### 5.1.2 图模型与链路代价
网络通常被抽象为图 G=(N,E)：
- N：路由器集合
- E：链路集合
- c(x,y)：链路代价，可能与带宽、时延、负载相关

### 5.1.3 路由算法的分类
- 全局（global）：掌握完整拓扑与链路代价，如链路状态（link-state）。
- 分布式（decentralized）：只知道邻居信息，如距离向量（distance-vector）。
- 静态（static）：变化慢，人工配置多。
- 动态（dynamic）：周期或事件驱动更新。

## 5.2 链路状态路由（Link-State, Dijkstra）
### 5.2.1 基本思想
每个路由器通过链路状态广播（link-state broadcast）获得全网拓扑与链路代价，然后运行 Dijkstra 计算最短路径树。

### 5.2.2 Dijkstra 算法核心
- 维护已确定最短路径的节点集合 N'
- 每次选择 D(v) 最小节点加入 N'
- 更新邻居的最短路径估计

### 5.2.3 算法复杂度
时间复杂度约 O(n^2)，优化后可达 O(n log n)。
消息复杂度约 O(n^2)。

### 5.2.4 路由振荡问题
若链路代价依赖流量，可能产生路由震荡（oscillation），导致网络不稳定。

## 5.3 距离向量路由（Distance-Vector, Bellman-Ford）
### 5.3.1 Bellman-Ford 方程
Dx(y) = min_v { c(x,v) + Dv(y) }

### 5.3.2 距离向量更新过程
- 每个节点周期性向邻居发送距离向量
- 收到更新后按公式重新计算
- 若发生变化，再通知邻居

### 5.3.3 特点与问题
- 分布式、异步、自停止
- 可能出现“计数到无穷”（count-to-infinity）问题

## 5.4 自治系统与域内/域间路由
### 5.4.1 自治系统（AS）概念
自治系统（Autonomous System, AS）是由单一管理机构控制的一组网络。AS 之间通过网关路由器相连。

### 5.4.2 域内与域间的区别
- 域内路由（intra-AS）：性能优先，协议统一。
- 域间路由（inter-AS）：策略优先，管理控制重要。

### 5.4.3 选择不同协议的原因
- 域内：一个管理者，强调效率
- 域间：多个管理者，强调策略与商业控制

## 5.5 OSPF 域内路由
### 5.5.1 OSPF 特点
OSPF（Open Shortest Path First）：
- 链路状态协议
- 在 IP 上运行
- 支持认证
- 支持多种度量（带宽、时延）

### 5.5.2 OSPF 工作流程
- 路由器洪泛链路状态通告（LSA）
- 每个路由器获得完整拓扑
- 使用 Dijkstra 计算转发表

### 5.5.3 层次化 OSPF
- 划分区域（area）与骨干（backbone）
- 区域内洪泛减少开销
- 边界路由器汇总区域信息

## 5.6 BGP 域间路由
### 5.6.1 BGP 概述
BGP（Border Gateway Protocol）是事实标准的域间路由协议：
- 基于 TCP
- 使用路径向量（path vector）

### 5.6.2 eBGP 与 iBGP
- eBGP：AS 之间交换路由信息
- iBGP：AS 内传播路由信息

### 5.6.3 BGP 路由属性
- AS-PATH：经过的 AS 列表
- NEXT-HOP：下一跳路由器

### 5.6.4 路由选择策略
常见选择规则：
1) 本地偏好（local preference）
2) 最短 AS-PATH
3) 热土豆路由（hot potato）

### 5.6.5 策略驱动
BGP 强调策略控制：AS 可选择是否接受某条路由，是否向外通告。

## 5.7 ICMP 与诊断
### 5.7.1 ICMP 功能
ICMP（Internet Control Message Protocol）用于传递控制与差错信息。

### 5.7.2 ICMP 报文结构
包含 type、code 以及导致错误的数据报前 8 字节。

### 5.7.3 Traceroute
通过递增 TTL 发送探测包，触发路由器返回 ICMP time exceeded 报文，最终目的返回 port unreachable。

## 5.8 IP 组播与 IGMP
### 5.8.1 组播概念
组播（multicast）是一对多传输方式，适用于视频直播、会议等场景。

### 5.8.2 IGMP
IGMP（Internet Group Management Protocol）用于管理组播成员，路由器根据成员信息转发数据。

### 5.8.3 组播注意事项
组播数据报一般不产生 ICMP 差错报文。
