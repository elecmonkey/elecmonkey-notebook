# 一、算法分析与复杂性

## 1.1 时间与空间复杂度分析

算法分析是计算机科学中的重要环节，主要目标是评估算法的效率，预测其在不同输入规模下的资源消耗。资源主要指时间（计算步骤数量）和空间（内存使用量）。

### 1.1.1 渐进符号（O, Ω, Θ）

渐进符号用于描述算法在输入规模趋于无穷大时的行为特征：

- **大O符号（O）**：表示算法的上界。若 f(n) = O(g(n))，则存在常数 c 和 n₀，使得当 n ≥ n₀ 时，有 0 ≤ f(n) ≤ c·g(n)。
  
- **大Ω符号（Ω）**：表示算法的下界。若 f(n) = Ω(g(n))，则存在常数 c 和 n₀，使得当 n ≥ n₀ 时，有 0 ≤ c·g(n) ≤ f(n)。
  
- **大Θ符号（Θ）**：表示算法的紧确界。若 f(n) = Θ(g(n))，则 f(n) = O(g(n)) 且 f(n) = Ω(g(n))，即存在常数 c₁、c₂ 和 n₀，使得当 n ≥ n₀ 时，有 0 ≤ c₁·g(n) ≤ f(n) ≤ c₂·g(n)。

- **小o符号（o）**：比O更严格的上界。若 f(n) = o(g(n))，则对任意常数 c > 0，存在 n₀，使得当 n ≥ n₀ 时，有 0 ≤ f(n) < c·g(n)。

- **小ω符号（ω）**：比Ω更严格的下界。若 f(n) = ω(g(n))，则对任意常数 c > 0，存在 n₀，使得当 n ≥ n₀ 时，有 0 ≤ c·g(n) < f(n)。

### 1.1.2 常见复杂度等级比较

复杂度从低到高排序：

1. **O(1)** - 常数复杂度：不随输入规模变化的算法，如数组的随机访问。
   
2. **O(log n)** - 对数复杂度：每次将问题规模缩小一定比例，如二分查找。
   
3. **O(n)** - 线性复杂度：需要遍历一次输入数据，如线性查找。
   
4. **O(n log n)** - 线性对数复杂度：许多高效排序算法的复杂度，如归并排序、快速排序。
   
5. **O(n²)** - 平方复杂度：通常包含嵌套循环，如冒泡排序、插入排序。
   
6. **O(n³)** - 立方复杂度：如朴素的矩阵乘法算法。
   
7. **O(2ⁿ)** - 指数复杂度：如未经优化的斐波那契数列递归求解。
   
8. **O(n!)** - 阶乘复杂度：如暴力解决旅行商问题。

算法的空间复杂度分析逻辑相似，但衡量的是内存使用量而非时间。

### 1.1.3 递推关系求解技巧（代入法、主定理、递归树）

递推关系常用于分析递归算法的复杂度，主要解法：

1. **代入法**：猜测复杂度级别，然后通过数学归纳法证明。
   
   例：T(n) = 2T(n/2) + n
   假设 T(n) ≤ c·n log n，代入得：
   T(n) ≤ 2c·(n/2)log(n/2) + n = c·n(log n - 1) + n = c·n log n - c·n + n
   当 c ≥ 1 时，有 T(n) ≤ c·n log n，证明成立。

2. **递归树法**：将递归调用可视化为树，计算每层成本总和。
   
   例：T(n) = 2T(n/2) + n
   - 第0层：n
   - 第1层：2个子问题，每个代价n/2，总计n
   - 第2层：4个子问题，每个代价n/4，总计n
   - 共有log n层，每层代价n，总复杂度O(n log n)

3. **主定理（Master Theorem）**：针对形如 T(n) = aT(n/b) + f(n) 的递推关系：
   
   - 若 f(n) = O(nᶜ)，其中 c < log_b a，则 T(n) = Θ(n^(log_b a))
   - 若 f(n) = Θ(nᶜ)，其中 c = log_b a，则 T(n) = Θ(nᶜ log n)
   - 若 f(n) = Ω(nᶜ)，其中 c > log_b a，且满足正则条件：af(n/b) ≤ kf(n)，其中k < 1，则 T(n) = Θ(f(n))

## 1.2 问题的计算复杂性

计算复杂性理论研究问题的固有难度，探索可解性边界和各类问题之间的关系。

### 1.2.1 可解性与不可解性

一个问题是否可解，意味着是否存在算法能在有限时间内解决它。

- **可判定问题**：存在算法可以判定任意实例的是否成立。
  
- **不可判定问题**：不存在通用算法能够解决所有实例，如停机问题（Halting Problem）。

【停机问题】：给定任意程序和输入，判断该程序在给定输入下是否会终止运行。图灵证明这个问题不存在通用解法。

### 1.2.2 递归可枚举与图灵不可判定问题

- **递归可枚举（RE）**：存在算法能列举所有"是"的实例，但可能无法识别所有"否"的实例。

- **递归（R）**：存在算法能判定任意实例是"是"还是"否"。

- **图灵不可判定问题**：不存在图灵机能解决的问题，如：
  - 停机问题
  - 程序等价性问题：判断两个程序是否对所有输入产生相同输出
  - 逻辑中的蕴含问题：判断一阶逻辑公式是否有效

### 1.2.3 问题难度层次结构概述（P, NP, PSPACE 等）

计算复杂性类别构成了问题难度的层次结构：

- **P（多项式时间）**：存在多项式时间算法可解的判定问题，如排序、搜索等。

- **NP（非确定性多项式时间）**：在非确定性计算模型下，可在多项式时间内验证"是"答案的判定问题。P 是 NP 的子集。

- **NP-Hard（NP 难）**：至少与 NP 中最难问题一样难的问题。NP 中的所有问题都可规约到这类问题。

- **NP-Complete（NP 完全）**：既是 NP 又是 NP-Hard 的问题，如布尔可满足性问题（SAT）、哈密顿回路问题等。

- **PSPACE**：可用多项式空间解决的问题集合。

- **EXPTIME**：可在指数时间内解决的问题集合。

当前我们仍不知道 P 是否等于 NP，这是计算机科学中最著名的未解问题之一。若证明 P=NP，将彻底改变密码学和计算理论的基础。