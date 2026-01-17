# 计算机网络

## 课程概述

计算机网络研究计算机系统之间如何进行可靠、高效、可扩展的数据通信。本课程采用自顶向下的视角，覆盖应用层到链路层的协议与实现要点，并结合网络体系结构、路由与转发、网络安全和无线网络等热点内容，帮助你从理论与实践两方面理解网络运作。

## 学习目标

- 理解计算机网络的分层结构与设计原则
- 掌握常用网络协议（HTTP、DNS、TCP、UDP、IP、Ethernet等）的工作机制
- 理解路由、交换与数据转发的基本算法与协议
- 学会使用抓包与分析工具（如 Wireshark）调试和分析网络流量
- 掌握拥塞控制、流量控制与可靠传输的核心思想
- 了解网络安全基础（TLS、认证、常见攻击与防御）和无线网络的特殊问题

## 章节概览

2. [第一章：计算机网络与互联网](/computer-networking/ch01-overview) - 网络体系结构、协议栈与网络服务
3. [第二章：应用层](/computer-networking/ch02-application-layer) - HTTP、DNS、电子邮件与应用层设计
4. [第三章：传输层](/computer-networking/ch03-transport-layer) - UDP、TCP、可靠传输与拥塞控制
5. [第四章：网络层数据平面](/computer-networking/ch04-data-plane) - IP、分组转发、路由选择与子网划分
6. [第五章：网络层控制平面](/computer-networking/ch05-control-plane) - 路由协议、BGP、OSPF 与控制平面设计
7. [第六章：链路层与局域网](/computer-networking/ch06-link-layer) - 以太网、交换、ARP 与局域网技术
8. [第七章：无线网络](/computer-networking/ch07-wireless-network) - 无线信道、Wi-Fi、移动网络与无线协议挑战

## 可视化实验平台

本笔记提供了一系列交互式可视化工具，帮助理解抽象的网络协议与算法：

### 应用层 (Application Layer)
- [DNS 域名解析 (迭代/递归)](./visualization/dns-query)
- [DHCP 动态主机配置](./visualization/dhcp-process)

### 传输层 (Transport Layer)
- [TCP 连接管理 (握手/挥手)](./visualization/tcp-connection)
- [TCP 拥塞控制 (Reno/Tahoe)](./visualization/tcp-congestion)

### 网络层与链路层 (Network & Link Layer)
- [ARP 地址解析协议](./visualization/arp-protocol)
- [Dijkstra 最短路径算法 (链路状态)](./visualization/dijkstra-algorithm)
- [距离向量路由算法 (Distance Vector)](./visualization/distance-vector)

## 参考资料

- River 的计算机网络笔记 - [https://notes.river177.com/Network/](https://notes.river177.com/Network/)
- 《计算机网络：自顶向下方法》(Computer Networking: A Top-Down Approach) — James F. Kurose & Keith W. Ross
- 《TCP/IP Illustrated》— W. Richard Stevens
- RFC 文档集合 - [https://www.rfc-editor.org/](https://www.rfc-editor.org/)

## 相关项目

- [Wireshark](https://www.wireshark.org/) — 强大的网络分析工具