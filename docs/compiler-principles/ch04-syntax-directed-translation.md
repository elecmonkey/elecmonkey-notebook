# 第4章 语法制导翻译

## 4.1 核心问题

**语法制导翻译（Syntax-Directed Translation, SDT）**：

- 把**语法分析过程**和**语义动作**绑定
- 让“结构”决定“翻译”

常见应用：

- 表达式求值
- 类型检查
- 中间代码生成



## 4.2 属性文法（Attribute Grammar）

### 4.2.1 属性的两大类型

1. **综合属性（Synthesized）**
   - 从子节点向父节点汇报
   - 例如：表达式的值

2. **继承属性（Inherited）**
   - 从父节点或左兄弟传递
   - 例如：类型环境、期望类型

### 4.2.2 SDD 与 SDT

- **SDD（Syntax-Directed Definition）**：
  - 把语义规则写在产生式旁边
  - 仅定义**要计算什么**

- **SDT（Syntax-Directed Translation）**：
  - 把语义动作嵌入产生式
  - 规定**什么时候计算**

示例（SDD）：

```
E → E1 + T
E.val = E1.val + T.val
```

示例（SDT）：

```
E → E1 + T { E.val = E1.val + T.val }
```



## 4.3 语义规则的求值顺序

### 4.3.1 依赖图（Dependency Graph）

属性之间的依赖关系可以画成有向图：

- **无环** → 可以求值
- **有环** → 说明语义规则不一致

### 4.3.2 S-Attributed

仅含**综合属性**的 SDD。

特点：

- 可在**自底向上**分析时直接求值
- 实现简单

### 4.3.3 L-Attributed

**继承属性**只依赖：

- 父节点属性
- 左兄弟的综合属性

因此可以在**自顶向下**或**自底向上**顺序扫描时求值。



## 4.4 表达式翻译（计算与类型）

### 4.4.1 表达式求值

典型规则：

```
E → E1 + T
E.val = E1.val + T.val

T → T1 * F
T.val = T1.val * F.val

F → (E)
F.val = E.val

F → num
F.val = num.lexval
```

<VisualizationLink 
  title="实验：语法制导翻译 (SDD)" 
  desc="交互式演示表达式求值过程" 
  href="/compiler-principles/visualization/sdd-analyzer" 
/>


### 4.4.2 类型检查

为表达式加上 `type` 属性：

- 若 `E1.type == T.type`，则 `E.type` 相同
- 否则报错或插入强制类型转换



## 4.5 声明与符号表

### 4.5.1 典型翻译目标

- 把**标识符**加入符号表
- 记录：类型、宽度、偏移量

### 4.5.2 示例（变量声明）

```
D → T L
L → L , id | id
```

语义要点：

- `T.type` 向下继承给每个 `id`
- 每个 `id` 进入符号表



## 4.6 布尔表达式与控制流

### 4.6.1 短路计算

- `B1 && B2`
  - 若 B1 为 false，不计算 B2
- `B1 || B2`
  - 若 B1 为 true，不计算 B2

实现方式：

- 用 `true/false` 跳转地址
- 依靠“继承属性”把目标地址传下来

<VisualizationLink 
  title="实验：回填技术 (Backpatching)" 
  desc="布尔表达式短路计算与跳转生成" 
  href="/compiler-principles/visualization/backpatching" 
/>

### 4.6.2 控制流语句

经典语句：

- `if` / `if-else`
- `while`

语义信息：

- `B.true` / `B.false`
- `S.next`

这些属性告诉翻译器：**跳到哪里**。

<VisualizationLink 
  title="实验：控制流分析 (CFG)" 
  desc="基本块划分与控制流图可视化" 
  href="/compiler-principles/visualization/control-flow-analysis" 
/>



## 4.7 SDT 的实现方式

### 4.7.1 嵌入式动作

动作写在产生式中间：

```
E → T { print(T.val) } E'
```

### 4.7.2 翻译方案

把动作移动到合适位置，保证依赖满足。

### 4.7.3 与语法分析器结合

- LL：从左到右，逐步执行
- LR：归约时执行综合属性动作



## 4.8 本章结构回顾

1. **SDD/SDT**：语法控制语义
2. **属性类型**：综合 / 继承
3. **依赖图**：决定求值顺序
4. **L/S-attributed**：可实现性
5. **应用**：表达式、声明、控制流
