---
outline: false
pageClass: visualization-page no-print-button
---

# 实验：Dijkstra 最短路径算法

本实验可视化演示 Dijkstra 算法在链路状态路由中的执行过程。
左侧展示网络拓扑图，右侧动态生成算法迭代的转发表。

<DijkstraAlgorithm />

## 算法原理

Dijkstra 算法用于计算从源节点到网络中所有其他节点的最短路径。
1. **初始化**：源节点到自身的距离为0，到邻居的距离为链路代价，其他为 $\infty$。
2. **循环**：
   - 选择未在集合 $N'$ 中且距离最小的节点 $u$ 加入 $N'$。
   - 更新 $u$ 的所有邻居 $v$ 的距离：$D(v) = \min(D(v), D(u) + c(u,v))$。
3. **终止**：所有节点均加入 $N'$。
