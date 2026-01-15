# 第6章 运行时环境

## 6.1 核心问题

1. **为什么函数调用可以采用栈式存储？**
2. **函数调用和返回需要记录哪些信息？如何记录？**



## 6.2 预备知识：Environment 与 State

### 6.2.1 基本概念

- **Environment（环境）**：名字 → 存储位置（l-value）
- **State（状态）**：存储位置 → 当前值（r-value）

### 6.2.2 重要结论

- **赋值语句只改变 state，不改变 environment**

```
x := y
```



## 6.3 静态 vs 动态

### 6.3.1 静态（编译期确定）

- 类型信息
- 作用域结构
- 变量相对地址（偏移量）

### 6.3.2 动态（运行期确定）

- 函数调用次数
- 递归导致的多个“同名变量实体”
- 动态分配对象（heap）



## 6.4 存储组织（Storage Organization）

三类主要存储区：

| 区域 | 典型用途 | 特点 |
| ---- | -------- | ---- |
| Static Area | 全局变量、静态数据 | 生命周期贯穿整个程序 |
| Stack | 函数调用的局部数据 | 后进先出 |
| Heap | 动态分配对象 | 生命周期不固定 |



## 6.5 为什么栈适合函数调用

关键性质：**函数调用的生命周期严格嵌套**。

- 调用顺序：后调用先返回
- 局部变量：集体分配、集体回收
- 相对地址固定，便于编译期确定

这正好符合**栈（LIFO）**模型。



## 6.6 Activation Tree（活动树）

**活动树**描述函数调用的嵌套关系：

- 每个节点：一次函数调用（activation）
- 子节点的生命周期**完全包含**在父节点内

这也是栈可行的根本原因。



## 6.7 Activation Record（活动记录 / 栈帧）

### 6.7.1 定义

每次函数激活，在控制栈上分配一个**活动记录**。

### 6.7.2 控制栈

控制栈保存所有“活着”的调用。

### 6.7.3 典型字段（以 C 为例）

- **Return address**：返回地址
- **Caller’s SP**：调用者栈指针
- **Control link**：指向调用者的活动记录
- **Access link**：用于访问外层作用域（嵌套函数，了解）
- **Formal parameters**：形参区
- **Local variables**：局部变量区
- **Temporaries**：编译器临时变量
- **Saved machine status**：寄存器现场

<VisualizationLink 
  title="实验：活动记录 (Activation Record)" 
  desc="C 语言函数调用栈的动态演示" 
  href="/compiler-principles/visualization/activation-record" 
/>



## 6.8 调用序列（Calling Sequence）

### 6.8.1 函数调用时（Call）

1. 调用者计算实参
2. 分配活动记录空间
3. 保存返回地址、旧 SP
4. 被调用者初始化局部数据

### 6.8.2 函数返回时（Return）

1. 放置返回值
2. 恢复寄存器与 SP
3. 跳回返回地址



## 6.9 C 语言的存储布局（重点）

### 6.9.1 整体布局

```viz
digraph {
  rankdir=TB;
  bgcolor="transparent";
  node [shape=record, fontname="Helvetica"];
  edge [fontname="Helvetica"];

  memory [label="{ <high> 高地址 | { 栈区 (Stack)\n↓ 向下增长 | <stack_free> } | { <heap_free> | 堆区 (Heap)\n↑ 向上增长 } | { 全局/静态数据区 (Static) } | { 代码区 (Code) } | <low> 低地址 }"];

  // Invisible edges to enforce structure if needed, but record is usually enough
}
```

> **说明**：
> - **栈区**：存放函数调用的活动记录，从高地址向低地址增长。
> - **堆区**：存放动态分配的对象（`malloc`/`new`），从低地址向高地址增长。
> - 两者中间是**空闲区域**，直到相遇（内存溢出）。

### 6.9.2 C 函数的典型栈帧

- 返回值单元
- 临时变量区
- 局部变量区
- 形参区
- 形参数量
- 返回地址
- 调用者 SP



## 6.10 递归调用示意

同一函数递归多次：

- 每次调用都有**独立栈帧**
- 同名变量对应**不同存储位置**

这解释了：

- 名字相同 ≠ 数据对象相同



## 6.11 本章结构回顾

1. **Environment / State**：名称与值的区分
2. **存储组织**：静态区、栈、堆
3. **活动树**：生命周期嵌套
4. **活动记录**：栈帧字段
5. **调用序列**：调用/返回时的动作
