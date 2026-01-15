# 第2章 应用层

## 2.1 应用层与网络应用开发原则
### 2.1.1 应用层的角色与位置
应用层（application layer）直接面向用户与应用，是我们“看得见”的网络：浏览网页、发邮件、看视频、打游戏等都属于应用层范围。它运行在端系统（end systems）中，网络核心只负责转发分组，不需要理解具体应用内容。这种设计使得应用可以快速演化，而不会破坏互联网整体结构。

### 2.1.2 网络体系结构 vs 应用体系结构
- 网络体系结构（network architecture）：如 TCP/IP 五层模型或 OSI 模型，固定、统一，决定了网络“提供什么样的服务”。
- 应用体系结构（application architecture）：由应用开发者决定，描述应用如何分布在多个端系统上。

举例：HTTP 是应用层协议，但 HTTP 使用 TCP 还是 UDP 由开发者决定；使用 C/S 还是 P2P 由应用体系结构决定。

### 2.1.3 开发网络应用的基本原则
- 把复杂性放在边缘（edge）：核心网只做转发，端系统负责应用逻辑。
- 复用成熟协议：尽量使用 TCP/UDP，不重复实现底层功能。
- 需求驱动：是否可靠、是否实时、是否安全，决定协议选择与设计。

## 2.2 应用体系结构：C/S 与 P2P
### 2.2.1 客户端/服务器（Client/Server, C/S）
特点：
- 服务器（server）常在线、有固定 IP，通常部署在数据中心。
- 客户端（client）发起连接，IP 可变且可能间歇在线。
- 客户端之间一般不直接通信。

优点：
- 集中管理，安全与维护成本可控。
- 易于扩展：可通过多台服务器或负载均衡扩容。

缺点：
- 服务器压力大，成本高。
- 单点故障风险（可通过冗余缓解）。

典型应用：Web（HTTP）、FTP、电子邮件访问（IMAP）。

### 2.2.2 对等体（Peer-to-Peer, P2P）
特点：
- 没有长期在线的中心服务器。
- 终端之间直接通信。
- 新节点既提供服务能力也提出需求，具有自扩展性（self-scalability）。

优点：
- 节省中心服务器成本。
- 理论上更易扩展。

缺点：
- 节点不稳定（随时上线/下线）。
- 管理复杂，安全与内容治理困难。

典型应用：P2P 文件共享，部分实时通信。

### 2.2.3 混合架构
很多应用实际采用混合模式：
- 登录、目录、认证由服务器管理。
- 数据传输可能 P2P（如部分视频会议、文件分发）。

## 2.3 进程通信、套接字与寻址
### 2.3.1 进程间通信
进程（process）是运行在主机上的程序。不同主机上的进程通过网络交换消息。角色划分：
- 客户端进程：主动发起通信。
- 服务器进程：等待请求并响应。

### 2.3.2 套接字（socket）
套接字是应用与传输层之间的接口，类似“门”。应用对传输层的控制有限，主要能决定：
- 选用 TCP 还是 UDP。
- 设置缓冲区大小或最大段大小（MSS）。

### 2.3.3 进程寻址方式
要定位一个进程，需要：
- IP 地址（IP address）：定位主机。
- 端口号（port number）：定位主机内具体进程。

示例：HTTP 默认端口 80，HTTPS 默认端口 443。

## 2.4 应用层协议与传输层服务需求
### 2.4.1 应用层协议定义
应用层协议规定：
- 报文类型（request/response）
- 报文格式（字段与分隔方式）
- 报文语义（字段含义）
- 交互规则（时序与响应方式）

### 2.4.2 开放协议与专有协议
- 开放协议（open protocol）：RFC 标准，任何人可实现，如 HTTP、SMTP。
- 专有协议（proprietary）：由厂商控制，如 Skype、Zoom。

开放协议带来互操作性，专有协议可能带来更快迭代与功能差异化。

### 2.4.3 应用对传输层的服务需求
不同应用对传输服务的需求不同：
- 数据可靠性（reliability）：文件传输、Web 交易需要 100% 正确。
- 吞吐量（throughput）：视频/音频需要一定最低速率。
- 时延（delay）：实时语音、在线游戏要求低时延。
- 安全（security）：加密、认证、完整性。

### 2.4.4 TCP 与 UDP 对比
TCP（Transmission Control Protocol）：
- 可靠、按序交付
- 流量控制（flow control）
- 拥塞控制（congestion control）
- 面向连接（connection-oriented）

UDP（User Datagram Protocol）：
- 无连接
- 不保证可靠性
- 无拥塞控制
- 头部小、延迟低

选择建议：
- 可靠性优先 → TCP
- 实时性优先 → UDP（应用层可自行容错）

### 2.4.5 TLS 安全
TLS（Transport Layer Security）位于应用层与传输层之间，提供：
- 加密（confidentiality）
- 完整性（integrity）
- 端点认证（authentication）

TLS 常基于 TCP（如 HTTPS），使得“明文”数据在传输中被加密。

## 2.5 Web 与 HTTP
### 2.5.1 Web 页面与对象
*   **Web 页面 (Web Page)**：通常包含一个**HTML 基本文件**（Base HTML file）以及若干个**引用对象**（Referenced Objects）。
*   **对象 (Object)**：可以是一个 HTML 文件、一张 JPEG 图片、一个 Java 小程序或一个视频片段等。
*   **URL (Uniform Resource Locator)**：每个对象都由 URL 统一寻址。
    *   格式：`http://www.school.edu/someDept/pic.gif`
    *   组成：主机名 (`www.school.edu`) + 路径名 (`/someDept/pic.gif`)。

### 2.5.2 HTTP 协议概况
**HTTP (HyperText Transfer Protocol，超文本传输协议)** 是 Web 的核心应用层协议。
*   **C/S 模式**：
    *   **客户端 (Client)**：浏览器（Browser），请求、接收、展示 Web 对象。
    *   **服务器 (Server)**：Web 服务器（如 Apache, Nginx, IIS），响应请求，发送对象。
*   **底层传输协议**：**TCP**。
    *   服务器在端口 **80** 监听客户端请求。
    *   客户端发起 TCP 连接（三次握手）。
    *   服务器接受连接，无需担心数据丢失（TCP 提供可靠传输）。
*   **无状态 (Stateless)**：
    *   服务器**不维护**关于客户的任何信息（历史请求）。
    *   优点：服务器设计简单，支持高性能。
    *   缺点：无法识别用户身份（需借助 Cookie 解决）。

### 2.5.3 非持续连接与持续连接
#### 1. 非持续连接 (Non-persistent HTTP)
*   **特点**：每个 TCP 连接只传输**一个**请求/响应对。
*   **流程**：
    1.  建立 TCP 连接（1 RTT）。
    2.  发送 HTTP 请求，接收 HTTP 响应（1 RTT + 传输时间）。
    3.  关闭 TCP 连接。
*   **耗时**：每个对象需要 **2 RTT + 传输时间**。
*   **缺点**：
    *   每个对象都要 2 RTT，延迟高。
    *   服务器需频繁建立/关闭连接，OS 开销大。

#### 2. 持续连接 (Persistent HTTP)
*   **特点**：服务器在发送响应后**保持 TCP 连接打开**。后续的 HTTP 消息可以通过相同的连接发送。
*   **模式**：
    *   **非流水线 (Without Pipelining)**：收到前一个响应后才能发下一个请求（类似停等）。
    *   **流水线 (With Pipelining)**：客户端可以连续发送所有请求，无需等待响应（默认 HTTP/1.1）。
*   **优势**：后续对象只需 **1 RTT** 即可请求并接收。

```viz
digraph HTTP_Connection {
  rankdir=LR;
  node [shape=box, fontname="Helvetica"];
  bgcolor="transparent";
  
  subgraph cluster_non_persistent {
    label="非持续连接 (Non-persistent)";
    style=dashed;
    
    np_step1 [label="建立 TCP (1 RTT)"];
    np_step2 [label="请求/响应 (1 RTT)"];
    np_step3 [label="关闭连接"];
    np_step4 [label="建立 TCP (1 RTT)"];
    np_step5 [label="请求/响应 (1 RTT)"];
    
    np_step1 -> np_step2 -> np_step3 -> np_step4 -> np_step5;
  }
  
  subgraph cluster_persistent {
    label="持续连接 (Persistent)";
    style=dashed;
    
    p_step1 [label="建立 TCP (1 RTT)"];
    p_step2 [label="请求/响应 1 (1 RTT)"];
    p_step3 [label="请求/响应 2 (1 RTT)"];
    p_step4 [label="请求/响应 3 (1 RTT)"];
    
    p_step1 -> p_step2 -> p_step3 -> p_step4;
  }
}
```

### 2.5.4 HTTP 报文结构
HTTP 报文分为**请求报文**和**响应报文**，均由 ASCII 码组成。

#### 1. 请求报文 (Request Message)
```viz
digraph HTTP_Request {
  rankdir=TD;
  node [shape=record, fontname="Courier New"];
  bgcolor="transparent";
  
  request [label="{ <line> 请求行 (Request Line) | <header> 首部行 (Header Lines) | <blank> 空行 (CRLF) | <body> 实体主体 (Entity Body) }"];
  
  details [shape=plaintext, fontname="Helvetica", label=<<TABLE BORDER="0" CELLBORDER="1" CELLSPACING="0" WIDTH="100%">
    <TR><TD WIDTH="80">请求行</TD><TD WIDTH="300">GET /index.html HTTP/1.1</TD></TR>
    <TR><TD>首部行</TD><TD>Host: www.example.com<BR/>User-Agent: Mozilla/5.0<BR/>Connection: keep-alive</TD></TR>
    <TR><TD>实体主体</TD><TD>(POST 方法时存放数据)</TD></TR>
  </TABLE>>];
  
  request:line -> details;
}
```
*   **方法 (Method)**：
    *   `GET`：请求对象（参数在 URL 中）。
    *   `POST`：提交表单数据（数据在 Body 中）。
    *   `HEAD`：仅请求首部，用于调试或检查更新。
    *   `PUT`：上传对象到指定路径。
    *   `DELETE`：删除指定对象。

#### 2. 响应报文 (Response Message)
```viz
digraph HTTP_Response {
  rankdir=TD;
  node [shape=record, fontname="Courier New"];
  bgcolor="transparent";
  
  response [label="{ <line> 状态行 (Status Line) | <header> 首部行 (Header Lines) | <blank> 空行 (CRLF) | <body> 实体主体 (Entity Body) }"];
  
  details [shape=plaintext, fontname="Helvetica", label=<<TABLE BORDER="0" CELLBORDER="1" CELLSPACING="0" WIDTH="100%">
    <TR><TD WIDTH="80">状态行</TD><TD WIDTH="300">HTTP/1.1 200 OK</TD></TR>
    <TR><TD>首部行</TD><TD>Date: Mon, 27 Jul 2024...<BR/>Server: Apache<BR/>Content-Length: 1024<BR/>Content-Type: text/html</TD></TR>
    <TR><TD>实体主体</TD><TD>(请求的数据，如 HTML 内容)</TD></TR>
  </TABLE>>];
  
  response:line -> details;
}
```
*   **状态码 (Status Codes)**：
    *   `200 OK`：请求成功。
    *   `301 Moved Permanently`：对象永久移动（重定向）。
    *   `400 Bad Request`：请求报文语法错误。
    *   `404 Not Found`：服务器上找不到对象。
    *   `505 HTTP Version Not Supported`：版本不支持。

### 2.5.5 Cookie (用户与服务器状态管理)
由于 HTTP 是无状态的，**Cookie** 技术被设计用来在无状态的 HTTP 之上建立用户会话（Session）。

#### 1. Cookie 的四个组件
1.  **响应报文中的首部行**：`Set-Cookie: 1678`
2.  **请求报文中的首部行**：`Cookie: 1678`
3.  **用户端文件**：浏览器管理的 Cookie 文件（由浏览器保存）。
4.  **后端数据库**：Web 网站的后端数据库（记录 ID 与用户状态的映射）。

#### 2. Cookie 工作流程
```viz
digraph Cookie_Workflow {
  rankdir=LR;
  node [shape=box, fontname="Helvetica"];
  bgcolor="transparent";
  
  Client [label="客户端 (Browser)"];
  Server [label="服务器 (Amazon)"];
  Database [label="后端数据库"];
  
  step1 [label="1. HTTP 请求 (首次访问)", shape=plaintext];
  step2 [label="2. 生成 ID: 1678\n记录入库", shape=plaintext];
  step3 [label="3. HTTP 响应\nSet-Cookie: 1678", shape=plaintext];
  step4 [label="4. 再次请求\nCookie: 1678", shape=plaintext];
  step5 [label="5. 根据 ID 查询状态", shape=plaintext];
  step6 [label="6. 个性化响应", shape=plaintext];
  
  Client -> Server [label="msg 1"];
  Server -> Database [style=dashed, label="Create Entry"];
  Server -> Client [label="msg 2 (Set-Cookie)"];
  Client -> Server [label="msg 3 (Cookie: 1678)"];
  Server -> Database [style=dashed, label="Query ID"];
  Server -> Client [label="msg 4"];
}
```

### 2.5.6 Web 缓存 (Web Caching / Proxy Server)
**Web 缓存器**（也叫代理服务器）是能够代表初始 Web 服务器来满足 HTTP 请求的网络实体。
*   **工作原理**：
    1.  浏览器配置代理服务器地址。
    2.  所有 HTTP 请求先发给**缓存**。
    3.  若**命中 (Hit)**：缓存直接返回对象。
    4.  若**未命中 (Miss)**：缓存向**初始服务器 (Origin Server)** 请求对象，并在本地保存一份，然后返回给客户端。
*   **优点**：
    *   减少客户端请求的**响应时间**。
    *   减少机构接入链路的**通信量**（节省带宽）。

```viz
digraph Web_Cache {
  rankdir=LR;
  node [shape=box, fontname="Helvetica"];
  bgcolor="transparent";
  
  Client [label="客户端"];
  Proxy [label="Web 缓存/代理\n(Proxy Server)", style=filled, fillcolor="#fff9c4"];
  Origin [label="初始服务器\n(Origin Server)"];
  
  Client -> Proxy [label="1. 请求"];
  Proxy -> Client [label="2a. 命中返回", style=dashed, color=green];
  Proxy -> Origin [label="2b. 未命中转发"];
  Origin -> Proxy [label="3. 返回对象"];
  Proxy -> Client [label="4. 转发并缓存"];
}
```

### 2.5.7 条件 GET (Conditional GET)
为了防止缓存中的对象过期（Stale），HTTP 提供了条件 GET 机制。
*   **请求**：客户端（或缓存）在 GET 请求中包含 `If-Modified-Since: <date>` 首部。
*   **响应**：
    *   若对象**未修改**：服务器返回 `304 Not Modified`（**不包含实体对象**，节省带宽）。
    *   若对象**已修改**：服务器返回 `200 OK` 及新的实体对象。

### 2.5.8 HTTP/2 与 HTTP/3 (简述)
HTTP/1.1 虽然支持持续连接和流水线，但仍存在**队头阻塞 (Head-of-Line Blocking)** 问题（如果前面的请求处理慢，后面的请求就得等着）。

*   **HTTP/2**：
    *   **二进制分帧 (Binary Framing)**：将报文拆分为更小的二进制帧，是 HTTP/2 的基础。
    *   **多路复用 (Multiplexing)**：在一个 TCP 连接中**并行**传输多个请求/响应的帧。帧被打乱发送，接收端根据 ID 重新组装。彻底解决了应用层的队头阻塞。
    *   **首部压缩 (Header Compression)**：使用 **HPACK** 算法维护首部表，压缩冗余的首部信息。
    *   **服务器推送 (Server Push)**：服务器可以预测客户端需要什么资源（如 CSS/JS），在客户端请求前主动推送给它。
*   **HTTP/3**：
    *   底层不再使用 TCP，而是基于 **UDP** 的 **QUIC** 协议。
    *   进一步解决 TCP 传输层的队头阻塞（TCP 一个包丢了，整个窗口都要重传，QUIC 不需要）。
    *   提升弱网环境（如移动网络）下的性能。

## 2.6 电子邮件 (E-mail)

电子邮件是互联网最古老且最重要的应用之一，它是一种**异步**通信方式。

### 2.6.1 电子邮件系统的组成
一个完整的电子邮件系统由三个主要部分组成：
1.  **用户代理 (User Agent, UA)**：
    *   用户与电子邮件系统的接口（如 Outlook, Apple Mail, 或 Web 浏览器）。
    *   功能：撰写、显示、阅读、管理邮件。
2.  **邮件服务器 (Mail Server)**：
    *   系统的核心。每个用户在服务器上都有一个**邮箱 (Mailbox)** 存放收到的邮件。
    *   维护一个**报文队列 (Message Queue)** 存放等待发送的邮件。
3.  **邮件传输协议**：
    *   **发送**：**SMTP** (Simple Mail Transfer Protocol)。
    *   **接收/读取**：**POP3**, **IMAP**, **HTTP**。

```viz
digraph Email_System {
  rankdir=LR;
  node [shape=box, fontname="Helvetica"];
  bgcolor="transparent";
  
  subgraph cluster_sender {
    label="发送方 (Alice)";
    style=dashed;
    UA_Alice [label="用户代理\n(User Agent)"];
    Server_Alice [label="发送方邮件服务器\n(Sender Mail Server)"];
  }
  
  subgraph cluster_receiver {
    label="接收方 (Bob)";
    style=dashed;
    Server_Bob [label="接收方邮件服务器\n(Receiver Mail Server)"];
    UA_Bob [label="用户代理\n(User Agent)"];
  }
  
  UA_Alice -> Server_Alice [label="SMTP\n(Push)"];
  Server_Alice -> Server_Bob [label="SMTP\n(Push, TCP, Port 25)", weight=2];
  Server_Bob -> UA_Bob [label="POP3/IMAP/HTTP\n(Pull)"];
}
```

### 2.6.2 SMTP (简单邮件传输协议)
**SMTP (Simple Mail Transfer Protocol)** 是互联网电子邮件的核心传输协议。
*   **端口与协议**：使用 **TCP**，端口 **25**。
*   **直接传输**：发送方邮件服务器与接收方邮件服务器建立 **TCP 连接**，直接将邮件推送到对方，中间不经过其他中转服务器。
*   **推 (Push) 协议**：SMTP 是由发送方主动发起连接，将文件“推”给接收方。
*   **依赖 TCP**：SMTP 依赖 TCP 提供可靠的数据传输服务，确保邮件不丢失。
*   **特点**：
    *   使用 7-bit ASCII 码（二进制文件需编码为 ASCII，如 Base64）。
    *   是一个持续连接协议（一个连接可发多封邮件）。

**SMTP 交互过程**：
1.  **握手 (Handshaking)**：`HELO` (Hello)。
2.  **传输 (Transfer)**：`MAIL FROM` (发件人), `RCPT TO` (收件人), `DATA` (内容), `.` (结束)。
3.  **关闭 (Closure)**：`QUIT`。

### 2.6.3 邮件访问协议 (获取邮件)
SMTP 用于将邮件从 UA 推送到服务器，以及在服务器之间传输。但由于 SMTP 是“推”协议，接收方 UA 无法使用 SMTP 从服务器“拉取”邮件。因此需要专门的**邮件访问协议**。

| 协议 | 端口 | 传输层 | 特点与描述 |
| :--- | :--- | :--- | :--- |
| **POP3** | 110 | **TCP** | **邮局协议 (Post Office Protocol version 3)**。<br>• **特许 (Authorization)**：用户名/密码认证。<br>• **事务 (Transaction)**：下载邮件。<br>• **模式**：<br>&nbsp;&nbsp;1. **下载并删除** (Download and delete)：用户换个设备就看不到旧邮件了。<br>&nbsp;&nbsp;2. **下载并保留** (Download and keep)。<br>• **无状态**：服务器不记录用户操作（如已读/未读），管理简单。 |
| **IMAP** | 143 | **TCP** | **互联网邮件访问协议 (Internet Message Access Protocol)**。<br>• **有状态**：服务器维护用户状态（目录结构、已读/未读、草稿等）。<br>• **复杂**：允许用户在服务器上创建文件夹、移动邮件。<br>• **同步**：所有设备看到的内容一致。 |
| **HTTP** | 80/443 | TCP | **Webmail (基于网页的邮件)**。<br>• 用户代理是浏览器。<br>• 发送/接收邮件均使用 HTTP 协议与自己的邮件服务器通信。<br>• 但邮件服务器之间仍然使用 SMTP。 |

**重点总结**：
*   **SMTP** 用于发送（Push），依赖 TCP (25)。
*   **POP3/IMAP** 用于接收（Pull），依赖 TCP (110/143)。
*   所有邮件传输的核心底层都是 **TCP**。

## 2.7 域名系统 DNS (Domain Name System)

### 2.7.1 DNS 的功能与服务
**DNS** 是互联网的“目录服务”，它是一个运行在 UDP 上的应用层协议。
*   **端口与协议**：使用 **UDP**，端口 **53**。
*   **核心功能**：将人类可读的**主机名** (Hostname, 如 `www.google.com`) 转换为机器可读的 **IP 地址** (如 `172.217.160.142`)。
*   **DNS 提供的其他服务**：
    1.  **主机别名 (Host Aliasing)**：一个复杂的主机名（规范主机名）可以有一个或多个好记的别名。DNS 可以解析别名并返回规范名和 IP。
    2.  **邮件服务器别名 (Mail Server Aliasing)**：允许邮件服务器的主机名与 Web 服务器相同（如 `company.com` 既是 Web 也是邮件域）。通过 MX 记录区分。
    3.  **负载分配 (Load Distribution)**：对于高访问量网站，DNS 可以将一个域名映射到**一组 IP 地址**，并在回答查询时循环返回这些 IP，实现简单的负载均衡。

### 2.7.2 分布式层次结构
DNS 不使用集中式数据库（单点故障、流量巨大、距离远、维护难），而是采用**分布式、层次化**的数据库。

**DNS 服务器的 4 种类型**：
1.  **根 DNS 服务器 (Root DNS Servers)**：
    *   DNS 层次结构的最高层。
    *   全球共有 13 个逻辑根服务器集群（A-M），由不同组织管理。
    *   它们知道所有 TLD 服务器的地址。
2.  **顶级域 DNS 服务器 (TLD Servers)**：
    *   负责顶级域名（如 `.com`, `.org`, `.net`, `.edu`, `.gov`）和国家顶级域名（如 `.cn`, `.uk`, `.jp`）。
    *   它们知道权威 DNS 服务器的地址。
3.  **权威 DNS 服务器 (Authoritative DNS Servers)**：
    *   在互联网上具有公共可访问主机的组织机构，必须提供公共可访问的 DNS 记录。
    *   这些记录由权威 DNS 服务器保存（也就是最终保存 `www.example.com` -> `1.2.3.4` 映射的地方）。
4.  **本地 DNS 服务器 (Local DNS Server)**：
    *   **注意：严格来说，本地 DNS 不属于 DNS 的层次结构**，但它对 DNS 的运作至关重要。
    *   每个 ISP（如电信、学校、公司）都有一台本地 DNS（也叫默认名字服务器）。
    *   当主机发起 DNS 查询时，请求首先发往本地 DNS。本地 DNS 起到**代理 (Proxy)** 的作用，将请求转发到 DNS 层次结构中。

### 2.7.3 DNS 工作原理与查询方式
当用户访问 `www.example.com` 时，查询过程如下：

```viz
digraph DNS_Query {
  rankdir=LR;
  node [shape=box, fontname="Helvetica"];
  bgcolor="transparent";
  
  User [label="主机\n(User)"];
  Local [label="本地 DNS\n(Local DNS)", style=filled, fillcolor="#e1f5fe"];
  Root [label="根 DNS\n(Root)"];
  TLD [label="顶级域 DNS\n(TLD .com)"];
  Auth [label="权威 DNS\n(Auth example.com)"];
  
  User -> Local [label="1. 递归查询\n(www.example.com)"];
  Local -> Root [label="2. 迭代查询"];
  Root -> Local [label="3. 指向 .com TLD"];
  Local -> TLD [label="4. 迭代查询"];
  TLD -> Local [label="5. 指向 example.com Auth"];
  Local -> Auth [label="6. 迭代查询"];
  Auth -> Local [label="7. 返回 IP"];
  Local -> User [label="8. 返回 IP"];
}
```

*   **递归查询 (Recursive Query)**：
    *   “帮我查到底”。
    *   主机向本地 DNS 发起的通常是递归查询（本地 DNS 必须返回最终结果）。
*   **迭代查询 (Iterative Query)**：
    *   “我不知道，但你可以问它”。
    *   本地 DNS 向根、TLD、权威服务器发起的通常是迭代查询（对方返回下一跳地址，而不是最终 IP）。

**DNS 缓存 (Caching)**：
*   为了改善时延并减少网络流量，DNS 广泛使用缓存。
*   一旦本地 DNS 收到一个映射，它就会将其**缓存**一段时间（由 TTL 决定）。
*   实际上，根 DNS 的 IP 很少变动，本地 DNS 几乎总是缓存了根服务器的 IP，因此很少直接查询根服务器。

### 2.7.4 DNS 记录 (Resource Records, RR)
DNS 数据库中存储的条目称为资源记录，格式为 `(Name, Value, Type, TTL)`。
*   **Type=A**：`Name` 是主机名，`Value` 是 **IPv4 地址**。（最常用）
*   **Type=NS**：`Name` 是域（如 `foo.com`），`Value` 是该域的**权威 DNS 主机名**。
*   **Type=CNAME**：`Name` 是别名，`Value` 是**规范主机名**。
*   **Type=MX**：`Name` 是邮件域，`Value` 是**邮件服务器的主机名**。
