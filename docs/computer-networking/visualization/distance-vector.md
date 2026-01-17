---
outline: false
pageClass: visualization-page no-print-button
---

# 实验：距离向量路由算法 (Distance Vector)

本实验模拟距离向量路由协议在链路故障时的行为，重点演示“无穷计数”问题及其解决方案（毒性逆转）。

<DistanceVectorAlgorithm />

## 实验说明

- **场景**：经典的 x-y-z 三节点环路。初始状态下，链路代价为 x-y=4, y-z=1, z-x=50。
- **故障模拟**：点击 "Break Link" 将 x-y 链路代价增加到 60（模拟链路故障或拥塞）。
- **无穷计数**：
  - y 检测到 x 不可达（或代价变大），试图经由 z 到达 x。
  - z 此时仍认为自己经由 y 到达 x 的代价是 5 (1+4)。
  - y 更新代价为 $c(y,z) + D_z(x) = 1 + 5 = 6$。
  - z 收到 y 的更新后，更新代价为 $c(z,y) + D_y(x) = 1 + 6 = 7$。
  - 如此循环，直到代价超过 50（z-x 直接链路）。
- **毒性逆转 (Poison Reverse)**：如果 z 经由 y 到达 x，则 z 通告给 y 的 $D_z(x) = \infty$，从而阻止 y 选路回环。

<FeedbackFooter />
