# 第7章 无线网络

## 7.1 无线网络概述

无线网络使我们摆脱了网线的束缚，已成为接入互联网的主要方式。

### 7.1.1 基本要素
*   **无线主机 (Wireless Hosts)**：笔记本、手机、IoT设备等。
*   **基站 (Base Station)**：如 WiFi 的 **AP (Access Point)** 或蜂窝网的基塔。负责中继数据。
*   **无线链路 (Wireless Link)**：主机与基站之间的物理连接。

### 7.1.2 两种组网模式
1.  **基础设施模式 (Infrastructure Mode)**：
    *   所有通信通过基站中转。
    *   主机需**关联 (Associate)** 到基站。
    *   场景：家庭 WiFi、企业办公网、4G/5G。
2.  **自组织模式 (Ad Hoc Mode)**：
    *   无基站，节点间直接通信。
    *   场景：蓝牙直连、战场通信、灾难救援 Mesh 网络。

## 7.2 无线链路的特殊性

与有线网络（以太网）相比，无线环境极其复杂，主要面临三大挑战：

1.  **信号衰减 (Path Loss)**：电磁波能量随距离急剧下降，且穿墙能力有限。
2.  **干扰 (Interference)**：
    *   无线频谱是共享的（如 2.4GHz 频段拥挤）。
    *   微波炉、蓝牙、邻居家 WiFi 都会成为干扰源。
3.  **多径传播 (Multipath Propagation)**：
    *   信号经墙壁、地面反射，导致多份信号在不同时间到达接收端，造成信号模糊。

> **结论**：无线链路的**误码率 (Bit Error Rate)** 远高于有线链路，且性能波动大。

## 7.3 隐藏终端与暴露终端

无线信号覆盖范围有限，导致了有线网络中不存在的特殊问题，使得传统的“听前发送”（CSMA/CD）失效。

### 7.3.1 隐藏终端 (Hidden Terminal)
*   **现象**：A 和 C 都在 B 的覆盖范围内，但 A 和 C 互不可见（隔得远或有障碍）。
*   **问题**：A 向 B 发送数据时，C 听不到，以为信道空闲也向 B 发送。
*   **结果**：信号在 B 处发生**碰撞**。

### 7.3.2 暴露终端 (Exposed Terminal)
*   **现象**：B 在 A 的覆盖范围内，C 在 B 的覆盖范围内（但不在 A 的）。
*   **问题**：A 正在向他人发送，B 听到了，不敢向 C 发送。
*   **结果**：实际上 B 发给 C 并不会干扰 A，导致**信道资源浪费**。

## 7.4 WiFi (IEEE 802.11) 核心机制

WiFi 是最成功的无线局域网技术。

### 7.4.1 802.11 协议族
*   **802.11b/g/n** (2.4GHz)：穿透力强，但干扰大、频段窄。
*   **802.11ac/ax (WiFi 5/6)** (5GHz/6GHz)：带宽极大，干扰少，但穿墙弱。

### 7.4.2 多路访问协议：CSMA/CA
由于无法像以太网那样精准检测碰撞（无线发送信号远强于接收信号），WiFi 采用了 **碰撞避免 (Collision Avoidance)** 机制。

1.  **CSMA (载波侦听)**：发送前先听，忙则等待。
2.  **CA (碰撞避免)**：
    *   信道忙时，进入**随机退避 (Random Backoff)** 倒计时。
    *   谁先倒数完谁先发，减少争抢概率。
3.  **ACK (确认机制)**：
    *   无线丢包率高，接收端收到数据后必须立即回复 **ACK**。
    *   发送端未收到 ACK 即认为丢包，进行重传。

> **RTS/CTS 机制**（可选）：
> 发送大数据包前，先发短包 **RTS (请求发送)**，接收端回 **CTS (允许发送)**。
> *   作用：告诉周围所有节点“我要占座了”，解决隐藏终端问题。
> *   代价：增加了额外开销，通常仅在长帧或高冲突环境下开启。

```viz
digraph RTS_CTS {
  rankdir=LR;
  bgcolor="transparent";
  node [shape=box, fontname="Helvetica"];
  edge [fontname="Helvetica"];
  
  // Timeline nodes
  { rank=same; Sender; AP; HiddenNode; }
  
  Sender [label="发送方 A"];
  AP [label="接收方 B (AP)"];
  HiddenNode [label="隐藏节点 C"];

  // Flow (Conceptual sequence using subgraph to simulate time is hard in dot, using simplified flowchart)
  // Better to use a Sequence Diagram conceptualization in Graphviz or just a flow
  
  // Let's use a flowchart to show the logic
  
  step1 [label="1. A 发送 RTS\n(预约需 T 时间)", shape=parallelogram];
  step2 [label="2. B 广播 CTS\n(同意 A 发送，锁定 T 时间)", shape=parallelogram];
  step3 [label="3. A 发送 DATA", shape=box];
  step4 [label="C 收到 CTS\n进入静默 (NAV)", shape=note];
  step5 [label="4. B 回复 ACK", shape=parallelogram];
  
  Sender -> step1;
  step1 -> AP [label="RTS"];
  AP -> step2;
  step2 -> Sender [label="CTS"];
  step2 -> HiddenNode [label="CTS (Detected)"];
  HiddenNode -> step4 [style=dashed];
  Sender -> step3;
  step3 -> AP [label="DATA"];
  AP -> step5;
  step5 -> Sender [label="ACK"];
}
```

<VisualizationLink
  title="CSMA/CA 协议与隐藏终端"
  href="/computer-networking/visualization/csma-ca-protocol"
  desc="交互式模拟 WiFi 协议的 RTS/CTS 握手过程，展示隐藏终端问题的解决方案及 NAV 机制。"
/>

### 7.4.3 帧结构特点
WiFi 帧比以太网帧复杂得多，最显著的区别是包含 **4 个地址字段**，用于在自组网或中继模式下标识源、目的、中转 AP 等信息。

## 7.5 移动性与管理

*   **关联 (Association)**：手机开机后通过扫描（主动/被动）发现 AP，完成认证（输密码）和关联，并通过 DHCP 获取 IP。
*   **速率自适应**：离 AP 越近，信号越好，使用高阶调制（传得快）；离得远则自动降速以保证不丢包。
*   **安全**：
    *   **开放网络**：数据裸奔，极度危险。
    *   **WPA2/WPA3**：现代标准，提供加密保护。
