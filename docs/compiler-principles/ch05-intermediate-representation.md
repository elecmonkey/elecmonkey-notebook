# 第5章 中间代码生成

## 5.1 核心问题

如何把**声明 + 表达式 + 控制流**翻译成**机器无关的中间代码**。

目标：

- 前端与后端解耦
- 便于优化
- 语义清晰、结构化



## 5.2 中间表示（IR）

常见形式：

| 形式 | 特点 | 适用 |
| ---- | ---- | ---- |
| 语法树 | 结构清晰 | 前端分析 |
| 后缀表达式 | 简洁 | 表达式计算 |
| 三地址代码（TAC） | 规则统一 | 生成与优化 |
| 四元式 | 结构化 | 后续处理 |

本章重点：**三地址代码与四元式**。



## 5.3 三地址代码（TAC）

### 5.3.1 基本格式

```
x = y op z
```

- 每条语句最多 3 个地址
- 地址可以是变量、常量或临时变量

### 5.3.2 常见语句类型

1. **算术 / 逻辑**

```
x = y op z
x = op y
x = y
```

2. **跳转**

```
goto L
if x goto L
ifFalse x goto L
if x relop y goto L
```

3. **过程调用**

```
param x1
param x2
call p, n
y = call p, n
return y
```

4. **数组 / 指针**

```
x = y[i]
x[i] = y
x = &y
x = *y
*x = y
```

### 5.3.3 临时变量

- 编译器自动生成
- 保存中间计算结果

示例：

```
a = b + -c
```

翻译：

```
t1 = minus c
t2 = b + t1
a = t2
```

<VisualizationLink 
  title="实验：中间代码生成 (TAC)" 
  desc="C 代码到四元式的翻译过程" 
  href="/compiler-principles/visualization/tac-generation" 
/>

<VisualizationLink 
  title="实验：控制流分析 (CFG)" 
  desc="基本块划分、流图构建与循环识别" 
  href="/compiler-principles/visualization/control-flow-analysis" 
/>

<VisualizationLink 
  title="实验：DAG 与基本块优化" 
  desc="公共子表达式消除、死代码消除与常量折叠" 
  href="/compiler-principles/visualization/dag-optimizer" 
/>

<VisualizationLink 
  title="实验：回填技术 (Backpatching)" 
  desc="布尔表达式翻译中的回填演示" 
  href="/compiler-principles/visualization/backpatching" 
/>


## 5.4 四元式（Quadruples）

四元式结构：

```
(op, arg1, arg2, result)
```

特点：

- 把三地址代码“表格化”
- 更便于优化和后端处理

例子：

```
t1 = b + c
```

表示：

```
(+, b, c, t1)
```



## 5.5 语句标号 vs 语句序号

### 5.5.1 语句标号（Label）

- 可任意命名
- 不要求连续

### 5.5.2 语句序号（Position Number）

- 严格递增
- 生成时才知道

### 5.5.3 关键区别

- 跳转目标**未出现时**，无法填序号
- 这就是**回填（Backpatching）**的根源



## 5.6 类型与声明的翻译

### 5.6.1 类型表达式

类型可以递归定义：

- 基本类型：`int, float, char, boolean`
- 构造类型：
  - `array(n, T)`
  - `record(...)`
  - `pointer(T)`
  - `S → T`（函数类型）

### 5.6.2 类型等价

- **结构等价**：结构相同即等价
- **按名等价**：名字相同才等价

不同语言选择不同规则。



## 5.7 表达式翻译

### 5.7.1 经典方式（.code 属性）

每个非终结符有 `.code`，保存中间代码片段。

组合时：

```
E.code = E1.code || T.code || gen(E.place = E1.place + T.place)
```

### 5.7.2 增量翻译（Incremental Translation）

- 不再保存 `.code`
- 边分析边生成
- 更接近真实编译器实现



## 5.8 数组元素寻址（重点）

### 5.8.1 一维数组

```
A[i]
addr = base + i * w
```

- `w`：单个元素宽度

### 5.8.2 二维数组（行主序）

```
A[i1][i2]
addr = base + i1 * w1 + i2 * w2
w1 = n2 * w2
```

### 5.8.3 k 维数组

```
addr = base + i1*w1 + i2*w2 + ... + ik*wk
```

### 5.8.4 非 0 起始下标

```
addr = base + (i - l) * w
```

`l` 为下标起始值，可在编译期折叠。



## 5.9 控制流语句翻译

控制流靠**条件跳转 + goto**实现。

### 5.9.1 关键属性

- `B.true`
- `B.false`
- `S.next`

这些属性描述**跳转目标**。

### 5.9.2 if-else 示例

逻辑：

- 条件为真 → then
- 条件为假 → else
- 两者结束后 → 统一跳转到 `S.next`

### 5.9.3 while 示例

- 条件为真 → 回到循环体
- 条件为假 → 跳出



## 5.10 Backpatching（并链与回填）

### 5.10.1 为什么需要回填

- 生成代码时，跳转目标位置未知
- 先“占坑”，后补充

### 5.10.2 三个核心链表

- `truelist`
- `falselist`
- `nextlist`

它们保存“等待回填”的跳转语句位置。

### 5.10.3 三个基本操作

```
makelist(i)   // 新建链表
merge(p1,p2)  // 合并链表
backpatch(p,i) // 把链表中所有空目标填为 i
```

### 5.10.4 回填的本质规则

是否回填**不取决于大小序号**，只取决于：

- 目标是否由当前产生式决定



## 5.11 本章结构回顾

1. **IR 形式**：树、后缀、TAC、四元式
2. **表达式翻译**：临时变量 + 增量生成
3. **数组寻址**：宽度决定偏移
4. **控制流**：goto + 条件跳转
5. **回填机制**：未知地址的统一处理
