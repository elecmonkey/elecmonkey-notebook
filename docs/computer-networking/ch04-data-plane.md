# 第4章 网络层：数据平面

## 4.1 网络层概述 (Network Layer Overview)
### 4.1.1 位置与职责
*   **位置**：位于传输层（L4）和链路层（L2）之间。
*   **核心职责**：将分组从**源主机 (Source Host)** 一路传输到**目的主机 (Destination Host)**。
    *   *区别*：传输层负责“进程到进程”，网络层负责“主机到主机”。
*   **实现范围**：网络层协议不仅运行在端系统（主机）中，还必须运行在网络核心的每一个**路由器 (Router)** 中。
*   **数据单元**：网络层的协议数据单元 (PDU) 称为**数据报 (Datagram)**。

### 4.1.2 网络层的两大核心功能
网络层通过两个平面的协同工作来实现其职责：

#### 1. 转发 (Forwarding) —— 数据平面 (Data Plane)
*   **定义**：当一个分组到达路由器的输入链路时，路由器将其移动到合适的输出链路。
*   **性质**：**本地 (Local)**、微观动作。
*   **时间尺度**：纳秒 (ns) 级，通常由硬件实现。
*   **关键部件**：**转发表 (Forwarding Table)**。路由器根据分组首部的值（如目的 IP），查找转发表来决定输出端口。

#### 2. 路由 (Routing) —— 控制平面 (Control Plane)
*   **定义**：确定分组从源到目的地的**路径 (Path)**（即路由选择）。
*   **性质**：**全局 (Global)**、宏观动作。
*   **时间尺度**：秒 (s) 级，通常由软件实现。
*   **关键任务**：计算并维护转发表。

```viz
digraph Plane {
  rankdir=LR;
  node [shape=box, fontname="Helvetica"];
  bgcolor="transparent";

  subgraph cluster_CP {
    label="控制平面 (Control Plane)\n软件/慢速/全局";
    style=dashed;
    Algo [label="路由算法\n(Routing Algorithm)"];
  }

  subgraph cluster_DP {
    label="数据平面 (Data Plane)\n硬件/快速/本地";
    style=dashed;
    Table [label="转发表\n(Forwarding Table)", shape=record];
    Switch [label="交换结构\n(Switching Fabric)"];
  }

  Algo -> Table [label="计算并下发"];
  Input [label="输入分组", shape=plaintext];
  Output [label="输出分组", shape=plaintext];
  
  Input -> Switch;
  Switch -> Output;
  Table -> Switch [style=dotted, label="指导转发"];
}
```

### 4.1.3 控制平面的两种实现方式
1.  **传统方法 (Per-router control)**：
    *   **分布式**：路由算法运行在**每台**路由器中。
    *   路由器之间相互交互控制报文（如 OSPF, BGP），共同计算转发表。
2.  **SDN (Software-Defined Networking)**：
    *   **集中式**：路由算法运行在远程的**逻辑集中控制器 (Remote Controller)** 中。
    *   控制器计算好转发表后，通过南向接口（如 OpenFlow）下发给各路由器（此时路由器变得很“傻”，只负责转发）。

### 4.1.4 网络服务模型 (Service Model)
网络层可以提供多种服务，但 Internet 的网络层（IP 协议）只提供一种服务：
*   **尽力而为服务 (Best-Effort Service)**：
    *   **不保证**交付（可能丢包）。
    *   **不保证**按序交付。
    *   **不保证**时延。
    *   **不保证**最小带宽。
*   **优点**：机制简单，使得网络核心（路由器）极其精简、低成本、高性能，将复杂性（如可靠性）推给边缘（端系统）。这被证明是 Internet 成功的关键因素。
*   **对比**：ATM 网络曾尝试提供保证带宽和时延的 CBR/VBR 服务，但因过于复杂而未成为主流。

## 4.2 虚电路与数据报网络
网络层连接服务的两种基本模式：

### 4.2.1 虚电路网络 (Virtual Circuit, VC)
*   **思路**：模仿电话网，面向连接。
*   **工作流程**：
    1.  **建立连接 (Setup)**：确定路径，沿途路由器预留资源（带宽、缓存），并在转发表中建立 VC 记录。
    2.  **数据传输**：分组携带**虚电路标识符 (VC ID)** 而非目的地址。路由器根据 VC ID 转发。
    3.  **拆除连接 (Teardown)**：释放资源。
*   **特点**：
    *   **有状态**：路由器必须维护通过它的所有连接的状态。
    *   **严格顺序**。
    *   如果某个路由器故障，经过它的所有 VC 都会中断。

### 4.2.2 数据报网络 (Datagram Network)
*   **思路**：模仿邮政系统，无连接。
*   **工作流程**：
    *   **无连接建立**：有数据直接发。
    *   **独立路由**：每个分组携带**完整的目的主机地址**。路由器根据目的地址独立为每个分组选择路径。
    *   **动态性**：同一对主机之间的不同分组可能走不同的路径（如果网络拓扑发生变化）。
*   **特点**：
    *   **无状态**：路由器不维护端到端连接的状态（更健壮，路由器坏了只需换条路）。
    *   **Internet 的选择**：Internet 是数据报网络。

| 特性 | 数据报网络 (Internet) | 虚电路网络 (ATM) |
| :--- | :--- | :--- |
| **连接建立** | 不需要 | 需要 |
| **寻址方式** | 目的主机 IP 地址 | VC ID (链路局部有效) |
| **路由器状态** | 无连接状态 | 维护每个连接的状态 |
| **分组顺序** | 不保证 | 保证 |
| **复杂性位置** | 边缘 (端系统) | 核心 (路由器) |

## 4.3 路由器体系结构
路由器是网络层最核心的设备。从高层来看，它由**路由选择处理器**（控制平面）和**三个数据平面组件**（输入端口、交换结构、输出端口）组成。

```viz
digraph RouterArch {
  rankdir=LR;
  node [shape=box, fontname="Helvetica"];
  bgcolor="transparent";

  subgraph cluster_CP {
    label="控制平面";
    style=dashed;
    CPU [label="路由选择处理器\n(Routing Processor)", style=filled, fillcolor="#fff9c4"];
  }

  subgraph cluster_DP {
    label="数据平面";
    style=dashed;
    
    subgraph cluster_In {
      label="输入端口";
      In1 [label="Input Port", width=1.2];
      In2 [label="Input Port", width=1.2];
    }
    
    Fabric [label="交换结构\n(Switching Fabric)", shape=circle, style=filled, fillcolor="#e1f5fe", width=1.5];
    
    subgraph cluster_Out {
      label="输出端口";
      Out1 [label="Output Port", width=1.2];
      Out2 [label="Output Port", width=1.2];
    }
  }

  CPU -> In1 [style=dotted, label="下发转发表"];
  CPU -> In2 [style=dotted];
  
  In1 -> Fabric;
  In2 -> Fabric;
  Fabric -> Out1;
  Fabric -> Out2;
}
```

### 4.3.1 输入端口 (Input Ports)
输入端口不仅仅是一根网线接口，它包含了物理层到网络层处理的完整逻辑：
1.  **物理层接收**：将光/电信号转换为比特流。
2.  **数据链路层处理**：解封装帧，提取 IP 数据报。
3.  **网络层处理（核心）**：
    *   **查找转发 (Lookup)**：这是输入端口最重要的功能。根据数据报的目的 IP 地址，在**转发表**中查找对应的输出端口。这一步必须要在“纳秒级”完成，因此通常使用硬件（如 TCAM）实现。
    *   **排队 (Queuing)**：如果交换结构忙，数据报需要在输入端口缓存，可能导致**队首阻塞 (HOL Blocking)**。

### 4.3.2 交换结构 (Switching Fabric)
交换结构是路由器的核心，负责将数据报从输入端口实际搬运到输出端口。有三种主要类型：

#### 1. 经内存交换 (Switching via Memory)
*   **原理**：类似传统计算机。输入端口通过中断通知 CPU，CPU 将分组从输入内存拷贝到输出内存。
*   **特点**：
    *   速度受限于**内存带宽** (Bandwidth)。
    *   一次只能转发一个分组（不能并行）。
    *   适用于早期路由器或低端设备。

#### 2. 经总线交换 (Switching via Bus)
*   **原理**：输入端口通过共享总线直接将分组传送到输出端口，无需 CPU 干预。
*   **特点**：
    *   速度受限于**总线带宽**。
    *   一次只能转发一个分组（总线被占用时，其他分组必须等待）。
    *   适用于中端企业级路由器。

#### 3. 经互连网络交换 (Switching via Interconnection Network)
*   **原理**：使用复杂的互连网络（如纵横式 Crossbar），连接 N 个输入和 N 个输出。
*   **特点**：
    *   **并行转发**：不同输入端口可以同时向不同输出端口发送数据。
    *   高性能，适用于核心骨干路由器（如 Cisco CRS）。

| 交换类型 | 核心机制 | 速度瓶颈 | 并行转发 | 适用场景 |
| :--- | :--- | :--- | :--- | :--- |
| **经内存** | CPU 拷贝 (Input -> Mem -> Output) | 内存带宽 | 否 | 早期/低端设备 |
| **经总线** | 共享总线 (Input -> Bus -> Output) | 总线带宽 | 否 | 中端企业路由器 |
| **经互连网络** | 纵横式开关 (Crossbar) | 互连网络速率 | **是** | 高端骨干路由器 |

### 4.3.3 输出端口 (Output Ports)
1.  **排队 (Queuing)**：当交换结构送来的速度超过链路发送速度时，需要缓冲。**丢包**通常发生在这里（弃尾策略或随机丢弃 AQM）。
2.  **链路层处理**：将 IP 数据报封装成帧（如以太网帧）。
3.  **物理层发送**：将比特流发送到物理链路。

### 4.3.4 路由选择处理器 (Routing Processor)
*   **归属**：控制平面。
*   **功能**：
    *   运行**路由协议** (OSPF, BGP, RIP)。
    *   维护路由表 (Routing Table) 和链路状态信息。
    *   **计算转发表** (Forwarding Table) 并下发给各个输入端口。
    *   在 SDN 架构中，该处理器负责与远程控制器通信。

## 4.4 转发与最长前缀匹配
### 4.4.1 基于目的地址转发
传统转发依据目的 IP 地址选择输出端口。

### 4.4.2 最长前缀匹配（Longest Prefix Matching）
当多个前缀匹配目的地址时，选择最长前缀：
- 更具体的前缀优先
- 保证路由的精确性

### 4.4.3 泛化转发
除目的地址外，可匹配更多首部字段（如端口、协议号），支持更灵活的转发策略。

## 4.5 分组调度 (Packet Scheduling)
当分组到达输出端口的速度超过链路发送速度时，分组需要在输出队列中排队。调度程序决定下一个发送哪个分组。

### 4.5.1 先进先出 (FIFO / FCFS)
*   **规则**：按到达顺序发送。如果缓冲满了，通常采用**弃尾 (Drop-tail)** 策略（丢弃新到达的包）。
*   **特点**：简单，但无法区分业务优先级（视频流和文件下载一视同仁）。

### 4.5.2 优先权排队 (Priority Queuing)
*   **规则**：
    1.  将分组分类（如高优先级的 VoIP，低优先级的 Email）。
    2.  维护多个队列（高优先队列，低优先队列）。
    3.  **非抢占式**：只要高优先队列有包，就先发高优先的；只有高优先队列空了，才发低优先的。
*   **问题**：可能导致低优先级队列**饥饿 (Starvation)**，永远发不出去。

### 4.5.3 循环排队 (Round Robin, RR)
*   **规则**：
    1.  将分组分类并排入不同队列。
    2.  调度器轮流扫描每个队列，从每个队列发送一个分组（如果非空）。
*   **特点**：工作保持 (Work-conserving)，无饥饿，但没有考虑分组大小和优先级差异。

### 4.5.4 加权公平排队 (Weighted Fair Queuing, WFQ)
*   **规则**：
    1.  这是 RR 的通用形式。
    2.  每个队列 $i$ 分配一个权重 $w_i$。
    3.  每个队列获得的链路带宽比例为 $w_i / (\sum w_j)$。
*   **特点**：既保证了公平性（每个类都能分到带宽），又支持优先级（权重不同）。这是目前路由器中广泛使用的调度算法。

## 4.6 网际协议：IPv4 (The Internet Protocol)
### 4.6.1 IPv4 数据报格式
IPv4 首部通常为 **20 字节**（无选项时）。

```viz
digraph IPv4Header {
  rankdir=TB;
  node [shape=none, fontname="Helvetica"];
  bgcolor="transparent";

  frame [label=<
  <table border="0" cellborder="1" cellspacing="0" cellpadding="6">
    <tr>
      <td width="40" bgcolor="#e3f2fd">Ver(4)</td>
      <td width="40" bgcolor="#e3f2fd">HLen(4)</td>
      <td width="80" bgcolor="#e3f2fd">TOS(8)</td>
      <td width="160" bgcolor="#e3f2fd"><b>Total Length (16 bits)</b></td>
    </tr>
    <tr>
      <td colspan="2" bgcolor="#fff9c4"><b>Identification (16)</b></td>
      <td width="40" bgcolor="#fff9c4">Flg(3)</td>
      <td width="120" bgcolor="#fff9c4"><b>Fragment Offset (13)</b></td>
    </tr>
    <tr>
      <td width="80" bgcolor="#c8e6c9"><b>TTL (8)</b></td>
      <td width="80" bgcolor="#c8e6c9"><b>Protocol(8)</b></td>
      <td colspan="2" bgcolor="#c8e6c9">Header Checksum (16)</td>
    </tr>
    <tr>
      <td colspan="4" bgcolor="#ffccbc"><b>Source IP Address (32 bits)</b></td>
    </tr>
    <tr>
      <td colspan="4" bgcolor="#ffccbc"><b>Destination IP Address (32 bits)</b></td>
    </tr>
    <tr>
      <td colspan="4" bgcolor="#f5f5f5">Options (if any) + Padding</td>
    </tr>
    <tr>
      <td colspan="4" height="40">Data (Payload)</td>
    </tr>
  </table>
  >];
}
```
*   **Ver**：版本号（4）。
*   **HLen**：首部长度（单位是 4 字节）。默认 5 (=20字节)。
*   **TOS**：服务类型（区分服务）。
*   **Total Length**：首部+数据的总字节数。
*   **TTL (Time To Live)**：生存时间。每经过一个路由器减 1，为 0 时丢弃（防止环路）。
*   **Protocol**：上层协议（6=TCP, 17=UDP）。
*   **Source/Dest IP**：32 位源/目的 IP 地址。

### 4.6.2 IPv4 分片与重组 (Fragmentation & Reassembly)
*   **MTU (Maximum Transmission Unit)**：链路层帧能承载的最大数据量（以太网通常 1500 字节）。
*   **分片**：当 IP 数据报长度 > 链路 MTU 时，路由器将其切分为多个片（Fragment）。
*   **重组**：分片**只在目的主机**进行重组，路由器不负责重组（减轻核心负担）。
*   **关键字段**：
    *   **Identification (ID)**：同一数据报的所有分片 ID 相同。
    *   **Flags**：MF=1 (More Fragments) 表示后面还有分片；DF=1 (Don't Fragment) 禁止分片。
    *   **Offset**：分片在原数据报中的偏移量（单位是 8 字节）。

### 4.6.3 IPv4 编址
*   **IP 地址**：32 位标识符，通常用**点分十进制**表示（如 192.168.1.1）。
*   **组成**：IP 地址 = **网络号 (Network ID)** + **主机号 (Host ID)**。
*   **接口 (Interface)**：主机/路由器与物理链路的连接点。IP 地址是分配给**接口**的，而不是分配给设备的。

#### 1. 子网 (Subnet)
*   **定义**：将 IP 地址的高位部分定义为**网络号 (Network Prefix)**，低位部分为**主机号 (Host Part)**。
*   **特征**：
    *   子网内的设备可以直接通信（不经过路由器）。
    *   子网掩码 (Subnet Mask) 用于区分网络号和主机号（如 /24 对应 255.255.255.0）。

#### 2. CIDR (无类别域间路由)
*   **格式**：`a.b.c.d/x`，其中 `/x` 是前缀长度。
*   **优势**：打破了传统 A/B/C 类地址的刚性限制，允许任意长度的子网划分，提高了地址利用率。

#### 3. 特殊 IP 地址
*   `0.0.0.0`：本网络上的本主机（启动时用）。
*   `255.255.255.255`：受限广播地址（本局域网广播）。
*   `127.0.0.1`：环回地址 (Loopback)。
*   私有地址（内网专用，不可路由到公网）：
    *   `10.0.0.0/8`
    *   `172.16.0.0/12`
    *   `192.168.0.0/16`

#### 4. 路由聚合 (Route Aggregation)
*   **原理**：ISP 可以将分配给多个客户的子网（如 200.23.16.0/24, ... .17.0/24）聚合成一个更大的超网前缀（如 200.23.16.0/20）向外通告。
*   **作用**：大幅减少全球路由表条目数量。

## 4.7 DHCP 与 NAT
### 4.7.1 DHCP (动态主机配置协议)
*   **功能**：**即插即用**。自动为新接入的主机分配 IP 地址、子网掩码、默认网关和 DNS 服务器地址。
*   **工作原理 (DORA)**：基于 UDP，Client 68 -> Server 67。
    1.  **Discover**：主机广播“有没有 DHCP 服务器？”（源 0.0.0.0，目 255.255.255.255）。
    2.  **Offer**：服务器广播/单播回复“我有个 IP (yiaddr) 给你”。
    3.  **Request**：主机广播“我选用了这个 IP”。
    4.  **ACK**：服务器确认。

### 4.7.2 NAT (网络地址转换)
*   **功能**：允许内网（私有 IP）的多个设备共享一个公网 IP 访问互联网。解决 IPv4 地址短缺问题。
*   **工作原理**：路由器维护一张 **NAT 转换表**。
    *   **出包**：将 (内网 IP, 内网端口) 替换为 (公网 IP, 新端口)。
    *   **入包**：根据 (公网 IP, 新端口) 查表，替换回 (内网 IP, 内网端口)。
*   **争议**：破坏了端到端原则（P2P 应用受限），路由器处理层级过高（修改了 L4 端口）。

## 4.8 IPv6
### 4.8.1 产生动机
1.  **初始动机 (Initial Motivation)**：
    *   **32 位地址空间耗尽**：IPv4 地址已完全分配，无法满足海量新设备的联网需求。
2.  **额外动机 (Additional Motivation)**：
    *   **加速处理与转发**：IPv6 采用了 **40 字节定长首部**，简化了路由器处理流程，提高了硬件转发速度。
    *   **支持流的处理 (Flow Treatment)**：引入了流标签 (Flow Label)，允许网络层对属于同一“流”的分组进行差异化服务（如 QoS）。

### 4.8.2 IPv6 与 IPv4 的区别
*   **地址长度**：扩大到 **128 位**（16 字节）。
*   **首部格式**：
    *   **取消了**：分片/重组字段（路由器不再分片，只由源主机分片）、首部校验和（由链路层/传输层保证）、选项字段（移至扩展首部）。
    *   **新增了**：流标签 (Flow Label)、优先级 (Priority)。
*   **ICMPv6**：整合了 IGMP（组播管理）和 ARP（邻居发现 ND）。
*   **迁移**：通过**隧道 (Tunneling)** 技术，让 IPv6 数据报封装在 IPv4 数据报中穿越 IPv4 网络。

| 特性 | IPv4 | IPv6 |
| :--- | :--- | :--- |
| **地址长度** | 32 位 (4 字节) | **128 位** (16 字节) |
| **首部长度** | 20 字节 + 选项 (变长) | **40 字节 (定长)** |
| **分片** | 路由器和主机均可分片 | **仅源主机**可分片 |
| **校验和** | 有 (首部校验和) | **无** (依赖链路/传输层) |
| **选项字段** | 在首部中 | 移至**扩展首部** (Next Header) |
| **配置方式** | DHCPv4 或 手动 | 自动配置 (SLAAC) / DHCPv6 |
