# 第1章 计算机网络与互联网

## 1.1 互联网是什么：基础设施与服务视角
### 1.1.1 “螺母与螺栓”视角（nuts and bolts）
互联网（Internet）从工程角度看是由大量硬件与软件组件构成的基础设施：
- 端系统（end systems）/主机（hosts）：运行应用程序，是网络“边缘”（edge）部分的主体。
- 分组交换设备（packet switches）：路由器（router）与交换机（switch）负责在网络核心转发分组（packet）。
- 通信链路（communication links）：铜缆（copper）、光纤（fiber）、无线电（radio）、卫星（satellite）等媒介。
- 传输速率（transmission rate）/带宽（bandwidth）：链路单位时间内传输比特的能力，通常以 bps 表示。
- 协议（protocol）：用于控制发送与接收消息的规则集合。

这类视角强调“互联网是一套设备+协议的组合”，非常适合从工程实现角度理解网络。

### 1.1.2 服务视角（services）
互联网也可以被视作“提供服务的基础设施”（a networking infrastructure）：
- 为应用提供通信服务：Web、流媒体（streaming video）、电子邮件（email）、社交网络、在线游戏、电子商务等。
- 为应用提供编程接口（API）：应用不需要关心复杂的网络细节，只需调用传输服务即可进行数据发送与接收。

### 1.1.3 互联网是“网络的网络”（network of networks）
互联网由大量自治网络（ISP、企业网、校园网、内容提供商网络、数据中心网络等）互联组成。不同组织管理的网络通过协议标准互通，形成全球范围的“网络的网络”。

## 1.2 协议与协议设计
### 1.2.1 协议的三要素
协议（protocol）定义网络实体之间如何通信，包含三要素：
- 语法（syntax）：消息格式、字段位置与长度。
- 语义（semantics）：字段含义与应采取的动作。
- 时序（timing）：消息发送顺序与时间要求。

### 1.2.2 协议的作用
没有协议就无法互通。HTTP 定义了网页请求与响应格式，TCP 规定可靠传输机制，IP 规定寻址与路由方式，WiFi 与以太网规定链路访问规则。协议让“不同厂商、不同设备”可以相互理解。

### 1.2.3 协议设计的基本思路
- 先明确需求：是否需要可靠性、实时性、可扩展性？
- 再选择机制：握手、序号、确认、重传、拥塞控制等。
- 协议必须兼顾：性能、复杂度、兼容性与可部署性。

## 1.3 网络边缘：主机与接入网络
### 1.3.1 主机类型与角色
- 客户端（client）：发起请求，如浏览器。
- 服务器（server）：提供服务，如 Web 服务器。
主机位于网络边缘，通过接入网络连接到核心路由器。

### 1.3.2 住宅接入网络
#### 1.3.2.1 HFC（Hybrid Fiber Coax）
混合光纤同轴（HFC）使用光纤连接到小区，再用同轴电缆分配到家庭。
- 频分复用（FDM）：数据、语音、视频占用不同频段。
- 下行带宽通常更高，上行较低，体现非对称（asymmetric）特性。

#### 1.3.2.2 ADSL（Asymmetric Digital Subscriber Line）
利用既有电话线：
- DSLAM 集中接入数据，语音仍进入电话网。
- 下行速率高于上行，适合“下载多、上传少”的家庭场景。

#### 1.3.2.3 FTTH（Fiber To The Home）
光纤直接到户，带宽高、时延低。
- 可采用波分复用（WDM, Wavelength Division Multiplexing）。

### 1.3.3 机构接入与数据中心
- 校园/企业网络：以太网（Ethernet）与 WiFi 为主。
- 数据中心网络：高带宽（10–100 Gbps）连接大量服务器。

### 1.3.4 移动蜂窝接入
广域蜂窝网络（4G/5G）覆盖范围大，由运营商部署基站并接入核心网。

### 1.3.5 家庭网络示例
典型家庭路由器集成：
- 调制解调器（modem）
- 路由器（router）
- NAT、DHCP、防火墙（firewall）
- 无线接入点（AP）

## 1.4 物理媒体：有线与无线
### 1.4.1 有线介质（guided media）
#### 1.4.1.1 双绞线（twisted pair）
两根绝缘铜线绞合，减少电磁干扰与串扰（crosstalk）。

#### 1.4.1.2 同轴电缆（coaxial cable）
内导体+绝缘层+屏蔽层，抗干扰强、成本低。

#### 1.4.1.3 光纤（fiber optic）
光脉冲传输比特：高带宽、低误码率、抗电磁干扰，但成本较高。

### 1.4.2 无线介质（unguided media）
无线电（radio）通过电磁波传播：
- 广播式传输（broadcast）
- 易受反射、遮挡与噪声干扰

## 1.5 网络核心：电路交换与分组交换
### 1.5.1 网络核心功能
由路由器构成网络核心，负责分组转发与路径选择。

### 1.5.2 电路交换（circuit switching）
通信前建立专用链路并预留资源：
- 建立电路 → 数据传输 → 拆除电路
- 复用方式：FDM（频分复用）、TDM（时分复用）
- 优点：带宽可预测，适合稳定会话；缺点：资源利用率低

### 1.5.3 分组交换（packet switching）
报文拆分为分组逐个发送：
- 存储转发（store-and-forward）：完整分组到达才转发
- 统计复用（statistical multiplexing）：按需共享资源
- 优点：资源利用率高；缺点：排队与丢包

### 1.5.4 转发与路由
- 转发（forwarding）：路由器局部动作，根据转发表将分组送到输出端口。
- 路由（routing）：全局动作，决定路径。

## 1.6 分组时延、丢包与吞吐量
### 1.6.1 四种节点时延
节点时延（nodal delay）由四个部分组成：
$$ d_{nodal} = d_{proc} + d_{queue} + d_{trans} + d_{prop} $$

```viz
digraph NodalDelay {
  rankdir=LR;
  node [shape=box, fontname="Helvetica"];
  bgcolor="transparent";
  
  Packet [label="分组到达", shape=plaintext];
  Router [label="路由器 A"];
  Link [label="链路"];
  NextRouter [label="路由器 B"];

  subgraph cluster_delay {
    label="节点时延 (Nodal Delay)";
    style=dashed;
    color=gray;
    
    proc [label="1. 处理时延\n(检查头部, 决定去向)", style=filled, fillcolor="#e1f5fe"];
    queue [label="2. 排队时延\n(等待输出链路空闲)", style=filled, fillcolor="#fff9c4"];
    trans [label="3. 传输时延\n(推送到链路)", style=filled, fillcolor="#ffe0b2"];
    prop [label="4. 传播时延\n(链路上传输)", style=filled, fillcolor="#e8f5e9"];
  }

  Packet -> proc;
  proc -> queue;
  queue -> trans;
  trans -> prop [label="比特流"];
  prop -> NextRouter;
}
```

1.  **处理时延（Processing Delay, $d_{proc}$）**：
    *   检查分组首部（是否有误码）。
    *   决定将分组导向哪个输出链路（查表转发）。
    *   通常是微秒（$\mu s$）级或更低。

2.  **排队时延（Queueing Delay, $d_{queue}$）**：
    *   分组在输出缓冲区中等待发送的时间。
    *   取决于路由器的拥塞程度（流量强度）。
    *   波动大：无拥塞时为 0，拥塞时可达毫秒（ms）级甚至丢包。

3.  **传输时延（Transmission Delay, $d_{trans}$）**：
    *   将所有分组比特推向链路所需要的时间。
    *   取决于分组长度 $L$ 和链路传输速率 $R$（带宽）。
    *   **公式**：$d_{trans}=\frac{L}{R}$

4.  **传播时延（Propagation Delay, $d_{prop}$）**：
    *   比特从链路一端传播到另一端所需的时间。
    *   取决于物理链路长度 $d$ 和信号传播速度 $s$（光纤中约为 $2 \times 10^8$ m/s）。
    *   **公式**：$d_{prop}=\frac{d}{s}$

### 1.6.2 传输时延与传播时延区别
初学者容易混淆这两个概念，类比**车队过收费站**：
*   **传输时延**：整个车队经过收费站的时间（取决于车队长度和收费速度）。
*   **传播时延**：车队离开收费站后，在高速公路上行驶到下一个收费站的时间（取决于路程和车速）。

### 1.6.3 流量强度与丢包
*   **流量强度（Traffic Intensity）**：$\frac{La}{R}$
    *   $L$：分组长度（bits）
    *   $a$：分组平均到达率（pkt/s）
    *   $R$：链路带宽（bps）
    *   当 $\frac{La}{R} > 1$ 时，比特到达速率超过服务速率，队列将无限增长，导致**丢包（Packet Loss）**。
*   **丢包**：队列缓冲有限，分组到达过快时溢出丢包，需要上层（如 TCP）重传或处理。

### 1.6.4 吞吐量（Throughput）
吞吐量指发送端与接收端之间传输数据的速率（bps）。
1.  **瞬时吞吐量（Instantaneous Throughput）**：特定时间点的传输速率。
2.  **平均吞吐量（Average Throughput）**：一段时间内的平均传输速率。

**瓶颈链路（Bottleneck Link）**：
端到端的吞吐量取决于路径上**带宽最小**的那条链路。
*   如果路径上有 $R_1, R_2, \dots, R_n$ 条链路，则端到端吞吐量 $\approx \min(R_1, R_2, \dots, R_n)$。
*   就好比“木桶效应”，水管最细的地方决定了总流量。

### 1.6.5 traceroute 与时延测量
traceroute（Linux）/tracert（Windows）利用 TTL 逐跳测量时延。


## 1.7 计算机网络体系结构
网络体系结构（Network Architecture）是计算机网络的**各层及其协议的集合**。它定义了计算机网络应当提供哪些功能，但**不涉及具体的实现细节**（硬件/软件实现由厂商决定）。

### 1.7.1 分层思想与优点
为什么需要分层（Layering）？
*   **复杂系统管理**：将庞大复杂的网络系统拆分为若干个较小的、易于管理的模块（层）。
*   **模块化与透明性**：每层只通过接口向下层请求服务，向上层提供服务。下层的具体实现细节（如用光纤还是铜缆）对上层是**透明**的。
*   **易于更新**：只要接口不变，替换某一层的实现技术（如物理层从 4G 升级到 5G）不会影响其他层。

### 1.7.2 协议与服务（核心概念）
这是网络体系结构中最容易混淆的两个概念：

1.  **协议（Protocol）**：
    *   **定义**：**对等实体**（Peer Entity，如主机 A 的传输层与主机 B 的传输层）之间进行通信的规则集合。
    *   **三要素**：
        *   **语法（Syntax）**：数据格式、编码、信号电平等（“怎么说”）。
        *   **语义（Semantics）**：控制信息、动作响应、差错处理（“做什么”）。
        *   **同步/时序（Timing）**：速度匹配、排序（“什么时候做”）。
    *   **关系**：协议是水平的。

2.  **服务（Service）**：
    *   **定义**：**下层向上层**提供的功能调用（通过层间接口 SAP）。
    *   **关系**：服务是垂直的。
    *   **原语**：请求（Request）、指示（Indication）、响应（Response）、确认（Confirm）。

**总结**：本层的**服务用户**（上层）只能看见服务而无法看见下面的**协议**。协议是“水平”的，服务是“垂直”的。

### 1.7.3 OSI 参考模型与 TCP/IP 模型
```viz
digraph Layers {
  rankdir=TB;
  newrank=true;
  nodesep=1.5;
  ranksep=0.4;
  node [shape=box, fontname="Helvetica", width=2.8, height=0.7, style=filled];
  edge [fontname="Helvetica", fontsize=10];
  bgcolor="transparent";

  // OSI Stack
  subgraph cluster_osi {
    label="OSI 七层模型";
    style=dashed;
    color="#90a4ae";
    node [fillcolor="#e1f5fe", group=g_osi];

    osi7 [label="7. 应用层 (Application)"];
    osi6 [label="6. 表示层 (Presentation)"];
    osi5 [label="5. 会话层 (Session)"];
    osi4 [label="4. 传输层 (Transport)"];
    osi3 [label="3. 网络层 (Network)"];
    osi2 [label="2. 数据链路层 (Data Link)"];
    osi1 [label="1. 物理层 (Physical)"];

    // Vertical Backbone
    edge [style=invis, weight=100];
    osi7 -> osi6 -> osi5 -> osi4 -> osi3 -> osi2 -> osi1;
  }

  // TCP/IP Stack
  subgraph cluster_tcpip {
    label="TCP/IP 五层模型";
    style=dashed;
    color="#90a4ae";
    node [fillcolor="#fff9c4", group=g_tcpip];

    tcpip5 [label="5. 应用层 (Application)\n(合并 OSI 高三层)"];
    tcpip4 [label="4. 传输层 (Transport)"];
    tcpip3 [label="3. 网络层 (Network)"];
    tcpip2 [label="2. 数据链路层 (Link)"];
    tcpip1 [label="1. 物理层 (Physical)"];

    // Vertical Backbone with spacer
    edge [style=invis, weight=100];
    tcpip5 -> tcpip4 [minlen=3]; // Reserve vertical space for mapping
    tcpip4 -> tcpip3 -> tcpip2 -> tcpip1;
  }

  // Horizontal Alignment
  { rank=same; osi7; tcpip5; }
  { rank=same; osi4; tcpip4; }
  { rank=same; osi3; tcpip3; }
  { rank=same; osi2; tcpip2; }
  { rank=same; osi1; tcpip1; }

  // Mappings (Constraint=false to prevent layout distortion)
  edge [style=dashed, color="#546e7a", constraint=false];
  
  // Merge Mappings
  osi7 -> tcpip5;
  osi6 -> tcpip5;
  osi5 -> tcpip5;

  // Direct Mappings
  edge [dir=both, arrowtail=dot, arrowhead=dot];
  osi4 -> tcpip4;
  osi3 -> tcpip3;
  osi2 -> tcpip2;
  osi1 -> tcpip1;
}
```

#### 1. OSI 七层参考模型（开放系统互连）
由 ISO 提出，虽然理论完整但市场失败。
1.  **应用层 (Application)**：为应用程序提供网络服务接口（HTTP, FTP）。
2.  **表示层 (Presentation)**：处理数据格式、加密、解密、压缩（JPEG, ASCII）。
3.  **会话层 (Session)**：建立、管理和终止会话（Session tokens）。
4.  **传输层 (Transport)**：提供端到端的报文段传输、可靠性、流量控制（TCP, UDP）。
5.  **网络层 (Network)**：负责分组的路由选择和转发（IP）。
6.  **数据链路层 (Data Link)**：在相邻节点间传输帧，处理差错检测（Ethernet, WiFi）。
7.  **物理层 (Physical)**：传输比特流，定义电压、接口形状、引脚（光纤, 双绞线）。

#### 2. TCP/IP 五层模型（事实标准）
实际互联网采用的模型，将 OSI 的高三层合并。
1.  **应用层**：支持网络应用（HTTP, SMTP, DNS）。**PDU：报文 (Message)**。
2.  **传输层**：进程间的数据传输。**PDU：报文段 (Segment)**。
3.  **网络层**：主机间的路由与转发。**PDU：数据报 (Datagram)**。
4.  **链路层**：相邻节点间的帧传输。**PDU：帧 (Frame)**。
5.  **物理层**：比特传输。**PDU：比特 (Bit)**。

#### 3. 比较
*   **OSI**：先有模型后有协议，学术完善，但复杂且效率低。
*   **TCP/IP**：先有协议后有模型，实用性强，但物理/链路层边界定义不严格。

### 1.7.4 数据封装（Encapsulation）
数据发送时自上而下封装，接收时自下而上解封装。

```viz
digraph Encapsulation {
  rankdir=TD;
  nodesep=0.5;
  ranksep=0.6;
  node [shape=record, fontname="Helvetica"];
  edge [fontname="Helvetica", fontsize=10];
  bgcolor="transparent";
  
  app [label="应用层\nData (Message)", style=filled, fillcolor="#fff9c4"];
  trans [label="传输层\n{ Header | Data } (Segment)", style=filled, fillcolor="#ffe0b2"];
  net [label="网络层\n{ IP Head | Header | Data } (Datagram)", style=filled, fillcolor="#ffccbc"];
  link [label="链路层\n{ Frame Head | IP Head | Header | Data | Trailer } (Frame)", style=filled, fillcolor="#c8e6c9"];
  phy [label="物理层\n10101010101... (Bits)", style=filled, fillcolor="#e1f5fe"];

  app -> trans [label="  加 TCP 头"];
  trans -> net [label="  加 IP 头"];
  net -> link [label="  加 MAC 头/尾"];
  link -> phy [label="  转比特流"];
}
```
每一层都在上层数据的基础上加上自己的**首部（Header）**（链路层还要加尾部），形成本层的协议数据单元（PDU）。

## 1.8 物理层通信基础：信号、编码与调制

物理层的主要任务是确定与传输媒体的接口有关的一些特性（机械、电气、功能、过程），在传输媒体上透明地传输比特流。

### 1.8.1 基本概念：信道、信号与带宽

1.  **信号 (Signal)**：数据的电气或电磁表现。
    *   **模拟信号 (Analog)**：代表消息的参数的取值是连续的（如人声）。
    *   **数字信号 (Digital)**：代表消息的参数的取值是离散的（如计算机的 0/1）。
2.  **信道 (Channel)**：信号传输的媒介。
    *   **单工 (Simplex)**：只能单方向传输（如广播）。
    *   **半双工 (Half-duplex)**：双方均可发送，但不能同时（如对讲机）。
    *   **全双工 (Full-duplex)**：双方可同时发送和接收（如电话、以太网）。
3.  **带宽 (Bandwidth)**：
    *   在模拟信号领域：指信号具有的频带宽度，单位是赫兹 (Hz)。
    *   在计算机网络领域：指通道传送数据的能力（最高数据率），单位是比特每秒 (bps)。

### 1.8.2 码元、波特率与速率（重点）

这是物理层最容易混淆的一组概念，必须严格区分。

*   **码元 (Symbol)**：
    *   在使用时间域（时域）的波形表示数字信号时，代表不同离散数值的基本波形。
    *   简单来说，**码元就是“一个波形”**。这个波形可能代表 1 个比特（如高电平=1，低电平=0），也可能代表多个比特（如 4 种电平状态，每个波形代表 2 bit）。
*   **波特率 (Baud Rate, B)**：
    *   单位时间内传输的**码元个数**（即信号波形变换的次数）。单位是 **Baud (波特)**。
    *   它反映了信号变化的快慢。
*   **数据率 / 比特率 (Data Rate / Bit Rate, C)**：
    *   单位时间内传输的**比特 (bit) 数**。单位是 **bps (bit/s)**。
    *   它反映了信息传输的快慢。

**二者的关系**：
如果一个码元携带 $n$ 比特的信息（即码元有 $V = 2^n$ 种离散状态），则：
$$ \text{数据率 } (bps) = \text{波特率 } (Baud) \times \log_2 V $$
或者：
$$ C = B \times n $$

> **举例**：
> *   **普通二进制**：1 个码元只有 2 种状态（0 或 1），携带 1 bit。此时 **波特率 = 比特率**。
> *   **4 种相位调制 (QPSK)**：1 个码元有 4 种状态，携带 $\log_2 4 = 2$ bit。此时 **比特率 = 2 × 波特率**。
> *   **16-QAM**：1 个码元有 16 种状态，携带 $\log_2 16 = 4$ bit。此时 **比特率 = 4 × 波特率**。

### 1.8.3 编码 (Encoding) 与调制 (Modulation)

数据（Data）转换为信号（Signal）的过程。
*   **编码**：数字数据 $\rightarrow$ 数字信号（基带传输）。
*   **调制**：数字数据 $\rightarrow$ 模拟信号（带通传输）。

#### 1. 常见编码方式（基带传输）

基带传输是将数字信号直接在信道上传输。为了解决同步、直流分量等问题，有多种编码方式。假设我们要传输比特流：**0 1 0 0 1 1 1 0 0 1 0 1**。

##### (1) 不归零编码 (NRZ, Non-Return-to-Zero)
*   **原理**：正电平代表 1，负电平（或零电平）代表 0。
*   **优点**：实现简单，带宽利用率高。
*   **缺点**：
    *   **无法自同步**：如果连续传输长串的 0 或 1，信号电平保持不变，接收端无法判断到底有多少个比特。
    *   **有直流分量**：不适合变压器耦合的链路。

<div style="background: #fcfcfc; padding: 10px; border: 1px solid #eee; border-radius: 4px; overflow-x: auto;">
<svg width="580" height="80" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <pattern id="grid" width="40" height="80" patternUnits="userSpaceOnUse">
      <path d="M 40 0 L 40 80" stroke="#eee" stroke-width="1" stroke-dasharray="4,2"/>
    </pattern>
  </defs>
  <rect width="580" height="80" fill="url(#grid)" />
  
  <g font-family="Courier New, monospace" font-size="14" text-anchor="middle" fill="#555">
    <text x="20" y="75">0</text>
    <text x="60" y="75">1</text>
    <text x="100" y="75">0</text>
    <text x="140" y="75">0</text>
    <text x="180" y="75">1</text>
    <text x="220" y="75">1</text>
    <text x="260" y="75">1</text>
    <text x="300" y="75">0</text>
    <text x="340" y="75">0</text>
    <text x="380" y="75">1</text>
    <text x="420" y="75">0</text>
    <text x="460" y="75">1</text>
  </g>
  
  <path d="M 0 50 L 40 50 L 40 20 L 80 20 L 80 50 L 160 50 L 160 20 L 280 20 L 280 50 L 360 50 L 360 20 L 400 20 L 400 50 L 440 50 L 440 20 L 480 20" stroke="#2196F3" stroke-width="2" fill="none"/>
    
  <text x="520" y="30" font-size="10" fill="#2196F3">High (1)</text>
  <text x="520" y="55" font-size="10" fill="#2196F3">Low (0)</text>
</svg>
</div>

##### (2) 曼彻斯特编码 (Manchester Encoding)
*   **原理**：将一个码元周期分为两半。
    *   **0**：前半周期为高，后半周期为低（**向下跳变**）。
    *   **1**：前半周期为低，后半周期为高（**向上跳变**）。
    *   *(注：此处采用 G.E.Thomas 标准，以太网 IEEE 802.3 标准正好相反，但核心都是**中间必有跳变**)*
*   **优点**：
    *   **自同步**：位中间的跳变既作为数据，也作为时钟信号。
    *   **无直流分量**。
*   **缺点**：占用频带宽度是 NRZ 的两倍（因为信号变化频率变快了）。**以太网**常采用此方式。

<div style="background: #fcfcfc; padding: 10px; border: 1px solid #eee; border-radius: 4px; overflow-x: auto;">
<svg width="580" height="80" xmlns="http://www.w3.org/2000/svg">
  <rect width="580" height="80" fill="url(#grid)" />
  
  <g font-family="Courier New, monospace" font-size="14" text-anchor="middle" fill="#555">
    <text x="20" y="75">0</text>
    <text x="60" y="75">1</text>
    <text x="100" y="75">0</text>
    <text x="140" y="75">0</text>
    <text x="180" y="75">1</text>
    <text x="220" y="75">1</text>
    <text x="260" y="75">1</text>
    <text x="300" y="75">0</text>
    <text x="340" y="75">0</text>
    <text x="380" y="75">1</text>
    <text x="420" y="75">0</text>
    <text x="460" y="75">1</text>
  </g>
  
  <path d="M 0 20 L 20 20 L 20 50 L 40 50 L 60 50 L 60 20 L 80 20 L 80 20 L 100 20 L 100 50 L 120 50 L 120 20 L 140 20 L 140 50 L 160 50 L 160 50 L 180 50 L 180 20 L 200 20 L 200 50 L 220 50 L 220 20 L 240 20 L 240 50 L 260 50 L 260 20 L 280 20 L 280 20 L 300 20 L 300 50 L 320 50 L 320 20 L 340 20 L 340 50 L 360 50 L 360 50 L 380 50 L 380 20 L 400 20 L 400 20 L 420 20 L 420 50 L 440 50 L 440 50 L 460 50 L 460 20 L 480 20" stroke="#4CAF50" stroke-width="2" fill="none"/>

</svg>
</div>

##### (3) 差分曼彻斯特编码 (Differential Manchester)
*   **原理**：
    *   **位中间**：始终有跳变（用于同步）。
    *   **位开始**：
        *   有跳变 $\rightarrow$ 代表 **0**。
        *   无跳变 $\rightarrow$ 代表 **1**。
*   **优点**：抗干扰能力比曼彻斯特更强。常用于 **Token Ring (令牌环网)**。

<div style="background: #fcfcfc; padding: 10px; border: 1px solid #eee; border-radius: 4px; overflow-x: auto;">
<svg width="580" height="80" xmlns="http://www.w3.org/2000/svg">
  <rect width="580" height="80" fill="url(#grid)" />
  
  <g font-family="Courier New, monospace" font-size="14" text-anchor="middle" fill="#555">
    <text x="20" y="75">0</text>
    <text x="60" y="75">1</text>
    <text x="100" y="75">0</text>
    <text x="140" y="75">0</text>
    <text x="180" y="75">1</text>
    <text x="220" y="75">1</text>
    <text x="260" y="75">1</text>
    <text x="300" y="75">0</text>
    <text x="340" y="75">0</text>
    <text x="380" y="75">1</text>
    <text x="420" y="75">0</text>
    <text x="460" y="75">1</text>
  </g>
  
  <path d="M 0 50 L 0 20 L 20 20 L 20 50 L 40 50 L 60 50 L 60 20 L 80 20 L 80 50 L 100 50 L 100 20 L 120 20 L 120 50 L 140 50 L 140 20 L 160 20 L 180 20 L 180 50 L 200 50 L 220 50 L 220 20 L 240 20 L 260 20 L 260 50 L 280 50 L 280 20 L 300 20 L 300 50 L 320 50 L 320 20 L 340 20 L 340 50 L 360 50 L 380 50 L 380 20 L 400 20 L 400 50 L 420 50 L 420 20 L 440 20 L 460 20 L 460 50 L 480 50" stroke="#9C27B0" stroke-width="2" fill="none"/>
</svg>
</div>

#### 2. 常见调制方式（带通传输）
为了让数字信号在模拟信道（如电话线、无线电）上传输，需要将数字信号调制到载波上。
*   **调幅 (ASK)**：振幅随数字变化（容易受干扰）。
*   **调频 (FSK)**：频率随数字变化。
*   **调相 (PSK)**：相位随数字变化（如 0 度代表 0，180 度代表 1）。
*   **正交振幅调制 (QAM)**：**振幅 + 相位** 结合。例如 16-QAM 有 16 种状态（12 种相位 + 3 种振幅组合），一个码元传 4 bit，效率极高。

### 1.8.4 信道的极限容量
为了提高速率，我们希望波特率无限高，或者码元状态无限多。但物理规律限制了这两点：

1.  **奈氏准则 (Nyquist Criterion)**：
    *   针对**无噪声**的理想信道。
    *   限制了**码元传输速率**（带宽受限，波特率不能无限高，否则会出现码间串扰）。
    *   公式：$C_{max} = 2W \log_2 V$
        *   $W$：带宽 (Hz)
        *   $V$：码元离散电平数目

2.  **香农公式 (Shannon Theorem)**：
    *   针对**有噪声**的真实信道。
    *   限制了**信息传输速率**（信噪比太低，分不清太多电平）。
    *   公式：$C_{max} = W \log_2 (1 + S/N)$
        *   $S/N$：信噪比（注意通常给出 dB，需换算：$dB = 10 \log_{10}(S/N)$）。
    *   **结论**：要提高容量，要么增加带宽 $W$，要么提高信噪比 $S/N$。

## 1.9 互联网发展简史
### 1.9.1 1960s–1970s
- 分组交换思想（Kleinrock、Baran）
- ARPAnet 1969 上线

### 1.9.2 1970s–1980s
- ALOHA、Ethernet
- Cerf 与 Kahn 提出互联网络架构

### 1.9.3 1980s–1990s
- TCP/IP 部署
- DNS、SMTP、FTP 等协议出现

### 1.9.4 1990s–2000s
- Web 兴起（HTML/HTTP）
- 商业化与浏览器普及

### 1.9.5 2005 至今
- 宽带、4G/5G
- 云计算与大型服务提供商自建网络
- 智能手机推动移动互联网
