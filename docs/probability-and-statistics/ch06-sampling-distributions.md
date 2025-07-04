# 第六章 抽样分布

## 6.1 数理统计中的基本概念

数理统计是以概率论为基础，研究如何有效地收集、整理、分析带有随机性的数据，以便对所考察的问题作出推断或预测的一门学科。

### 6.1.1 总体

**总体**（Population）是指所研究问题中的全体对象（个体）的集合。在统计学中，一般不是直接研究总体本身，而是研究总体某个数量指标的取值的全体，这个数量指标称为**随机变量**。

为了研究的方便，常常用一个随机变量$X$来表示总体，其分布函数$F(x)$或概率密度函数$f(x)$（对连续型）或分布律（对离散型）称为总体分布。

总体的分类：
1. **有限总体**：个体数有限的总体。
2. **无限总体**：个体数无限的总体。

在数理统计中，一般假设总体是无限的或者总体虽然有限但样本容量远小于总体容量，此时可以视为无限总体处理。

**例子**：
- 某批产品的质量指标构成总体，总体分布描述了质量指标的概率分布；
- 某地区成年男子的身高构成总体，服从某个正态分布；
- 某设备的使用寿命构成总体，可能服从指数分布。

### 6.1.2 简单随机样本

**样本**（Sample）是从总体中抽取的若干个个体的集合。设总体为随机变量$X$，从中抽取$n$个个体，得到$n$个随机变量$X_1, X_2, \ldots, X_n$，称为样本。

如果样本$X_1, X_2, \ldots, X_n$满足以下条件，则称为**简单随机样本**（Simple Random Sample）：

1. **代表性**：每个$X_i$与总体$X$有相同的分布；
2. **独立性**：$X_1, X_2, \ldots, X_n$相互独立。

**样本容量**（Sample Size）：样本中个体的个数$n$。

**样本观测值**：在一次具体的抽样中，样本$X_1, X_2, \ldots, X_n$的取值$x_1, x_2, \ldots, x_n$称为样本观测值，简称观测值。

**抽样方法**：
1. **有放回抽样**：每次抽取后将个体放回总体，然后进行下一次抽取；
2. **无放回抽样**：每次抽取后不将个体放回总体。

当总体容量远大于样本容量时，有放回抽样和无放回抽样的结果相差很小，都可以看作简单随机样本。

### 6.1.3 统计量

**统计量**（Statistic）是样本的函数，即不含任何未知参数的样本函数$T = T(X_1, X_2, \ldots, X_n)$。

统计量是随机变量，其分布称为**抽样分布**（Sampling Distribution）。

**常用统计量**：

1. **样本均值**：
   $$\overline{X} = \frac{1}{n}\sum_{i=1}^{n}X_i$$

2. **样本方差**：
   $$S^2 = \frac{1}{n-1}\sum_{i=1}^{n}(X_i - \overline{X})^2$$
   
   计算公式：
   $$S^2 = \frac{1}{n-1}\left(\sum_{i=1}^{n}X_i^2 - n\overline{X}^2\right)$$

3. **样本标准差**：
   $$S = \sqrt{S^2}$$

4. **样本$k$阶原点矩**：
   $$A_k = \frac{1}{n}\sum_{i=1}^{n}X_i^k, \quad k = 1, 2, \ldots$$

5. **样本$k$阶中心矩**：
   $$B_k = \frac{1}{n}\sum_{i=1}^{n}(X_i - \overline{X})^k, \quad k = 1, 2, \ldots$$

6. **顺序统计量**：
   将样本$X_1, X_2, \ldots, X_n$按从小到大顺序排列，得到：
   $$X_{(1)} \leq X_{(2)} \leq \cdots \leq X_{(n)}$$
   称为顺序统计量，其中$X_{(1)} = \min\{X_1, X_2, \ldots, X_n\}$，$X_{(n)} = \max\{X_1, X_2, \ldots, X_n\}$。

7. **样本中位数**：
   $$M = \begin{cases}
   X_{(\frac{n+1}{2})}, & n\text{为奇数} \\
   \frac{1}{2}[X_{(\frac{n}{2})} + X_{(\frac{n}{2}+1)}], & n\text{为偶数}
   \end{cases}$$

8. **样本极差**：
   $$R = X_{(n)} - X_{(1)}$$

**注意**：样本方差$S^2$的分母是$n-1$而不是$n$，这是为了保证$E(S^2) = \sigma^2$（无偏性）。

## 6.2 数理统计中的三个重要分布

在数理统计中，有三个重要的分布：$\chi^2$分布、$t$分布和$F$分布。这些分布在统计推断中起着基础性作用。

### 6.2.1 $\chi^2$分布

#### 定义

设$X_1, X_2, \ldots, X_n$是来自$N(0,1)$的简单随机样本，则统计量：

$$\chi^2 = \sum_{i=1}^{n}X_i^2$$

的分布称为自由度为$n$的**$\chi^2$分布**（卡方分布），记作$\chi^2 \sim \chi^2(n)$。

#### 概率密度函数

$\chi^2(n)$的概率密度函数为：

$$f(x) = \begin{cases}
\frac{1}{2^{n/2}\Gamma(n/2)}x^{n/2-1}e^{-x/2}, & x > 0 \\
0, & x \leq 0
\end{cases}$$

其中$\Gamma(\alpha) = \int_0^{+\infty}t^{\alpha-1}e^{-t}dt$是伽马函数。

#### 性质

1. **数学期望和方差**：
   若$X \sim \chi^2(n)$，则$E(X) = n$，$D(X) = 2n$。

2. **可加性**：
   若$X \sim \chi^2(n_1)$，$Y \sim \chi^2(n_2)$，且$X$与$Y$相互独立，则：
   $$X + Y \sim \chi^2(n_1 + n_2)$$

3. **分布形状**：
   - 当$n = 1, 2$时，密度函数单调递减；
   - 当$n \geq 3$时，密度函数先增后减，在$x = n-2$处达到最大值；
   - 当$n$较大时，$\chi^2(n)$近似正态分布$N(n, 2n)$。

4. **分位数**：
   对于给定的$\alpha \in (0,1)$，称满足$P(\chi^2 > \chi_\alpha^2(n)) = \alpha$的数$\chi_\alpha^2(n)$为$\chi^2(n)$分布的上$\alpha$分位数。

### 6.2.2 $t$分布

#### 定义

设$X \sim N(0,1)$，$Y \sim \chi^2(n)$，且$X$与$Y$相互独立，则统计量：

$$T = \frac{X}{\sqrt{Y/n}}$$

的分布称为自由度为$n$的**$t$分布**，记作$T \sim t(n)$。

#### 概率密度函数

$t(n)$的概率密度函数为：

$$f(t) = \frac{\Gamma(\frac{n+1}{2})}{\sqrt{n\pi}\Gamma(\frac{n}{2})}\left(1 + \frac{t^2}{n}\right)^{-\frac{n+1}{2}}, \quad t \in \mathbb{R}$$

#### 性质

1. **对称性**：$t$分布关于$t = 0$对称，即$f(-t) = f(t)$。

2. **数学期望和方差**：
   - 当$n > 1$时，$E(T) = 0$；
   - 当$n > 2$时，$D(T) = \frac{n}{n-2}$。

3. **极限性质**：
   当$n \to \infty$时，$t(n)$分布趋于标准正态分布$N(0,1)$。在实际应用中，当$n \geq 30$时，可以用标准正态分布近似$t$分布。

4. **分布形状**：
   $t$分布的形状类似于标准正态分布，但尾部更厚（方差更大）。

5. **分位数**：
   对于给定的$\alpha \in (0,1)$，称满足$P(T > t_\alpha(n)) = \alpha$的数$t_\alpha(n)$为$t(n)$分布的上$\alpha$分位数。
   
   由对称性：$t_{1-\alpha}(n) = -t_\alpha(n)$。

### 6.2.3 $F$分布

#### 定义

设$X \sim \chi^2(n_1)$，$Y \sim \chi^2(n_2)$，且$X$与$Y$相互独立，则统计量：

$$F = \frac{X/n_1}{Y/n_2}$$

的分布称为第一自由度为$n_1$、第二自由度为$n_2$的**$F$分布**，记作$F \sim F(n_1, n_2)$。

#### 概率密度函数

$F(n_1, n_2)$的概率密度函数为：

$$f(x) = \begin{cases}
\frac{\Gamma(\frac{n_1+n_2}{2})}{\Gamma(\frac{n_1}{2})\Gamma(\frac{n_2}{2})}\left(\frac{n_1}{n_2}\right)^{n_1/2}x^{n_1/2-1}\left(1+\frac{n_1}{n_2}x\right)^{-\frac{n_1+n_2}{2}}, & x > 0 \\
0, & x \leq 0
\end{cases}$$

#### 性质

1. **数学期望和方差**：
   若$F \sim F(n_1, n_2)$，则：
   - 当$n_2 > 2$时，$E(F) = \frac{n_2}{n_2-2}$；
   - 当$n_2 > 4$时，$D(F) = \frac{2n_2^2(n_1+n_2-2)}{n_1(n_2-2)^2(n_2-4)}$。

2. **倒数性质**：
   若$F \sim F(n_1, n_2)$，则$\frac{1}{F} \sim F(n_2, n_1)$。

3. **与$t$分布的关系**：
   若$T \sim t(n)$，则$T^2 \sim F(1, n)$。

4. **分位数**：
   对于给定的$\alpha \in (0,1)$，称满足$P(F > F_\alpha(n_1, n_2)) = \alpha$的数$F_\alpha(n_1, n_2)$为$F(n_1, n_2)$分布的上$\alpha$分位数。
   
   由倒数性质：$F_{1-\alpha}(n_1, n_2) = \frac{1}{F_\alpha(n_2, n_1)}$。

## 6.3 正态总体中统计量的分布

当总体服从正态分布时，某些常用统计量具有确定的分布，这为统计推断提供了理论基础。

### 6.3.1 单个正态总体中的统计量的分布

设$X_1, X_2, \ldots, X_n$是来自正态总体$N(\mu, \sigma^2)$的简单随机样本，$\overline{X}$和$S^2$分别是样本均值和样本方差。

#### 定理1

样本均值$\overline{X}$的分布：

$$\overline{X} \sim N\left(\mu, \frac{\sigma^2}{n}\right)$$

标准化后：

$$\frac{\overline{X} - \mu}{\sigma/\sqrt{n}} \sim N(0,1)$$

#### 定理2

样本方差的分布：

$$\frac{(n-1)S^2}{\sigma^2} \sim \chi^2(n-1)$$

**推论**：$E(S^2) = \sigma^2$，$D(S^2) = \frac{2\sigma^4}{n-1}$。

#### 定理3（重要）

样本均值$\overline{X}$和样本方差$S^2$相互独立。

这个结论对于正态总体是成立的，但对于非正态总体一般不成立。

#### 定理4

$$\frac{\overline{X} - \mu}{S/\sqrt{n}} \sim t(n-1)$$

这个统计量在$\sigma^2$未知时进行$\mu$的推断中起重要作用。

#### 定理5

设$X_1, X_2, \ldots, X_n$是来自$N(\mu, \sigma^2)$的样本，则：

$$\frac{\sum_{i=1}^{n}(X_i - \mu)^2}{\sigma^2} \sim \chi^2(n)$$

### 6.3.2 两个正态总体中的统计量的分布

设$X_1, X_2, \ldots, X_{n_1}$是来自正态总体$N(\mu_1, \sigma_1^2)$的简单随机样本，$Y_1, Y_2, \ldots, Y_{n_2}$是来自正态总体$N(\mu_2, \sigma_2^2)$的简单随机样本，且两个样本相互独立。

设$\overline{X}$、$S_1^2$和$\overline{Y}$、$S_2^2$分别为两个样本的样本均值和样本方差。

#### 定理6

样本均值之差的分布：

$$\overline{X} - \overline{Y} \sim N\left(\mu_1 - \mu_2, \frac{\sigma_1^2}{n_1} + \frac{\sigma_2^2}{n_2}\right)$$

标准化后：

$$\frac{(\overline{X} - \overline{Y}) - (\mu_1 - \mu_2)}{\sqrt{\frac{\sigma_1^2}{n_1} + \frac{\sigma_2^2}{n_2}}} \sim N(0,1)$$

#### 定理7

样本方差比的分布：

$$\frac{S_1^2/\sigma_1^2}{S_2^2/\sigma_2^2} = \frac{S_1^2\sigma_2^2}{S_2^2\sigma_1^2} \sim F(n_1-1, n_2-1)$$

特别地，当$\sigma_1^2 = \sigma_2^2 = \sigma^2$时：

$$\frac{S_1^2}{S_2^2} \sim F(n_1-1, n_2-1)$$

#### 定理8（两个方差相等的情况）

当$\sigma_1^2 = \sigma_2^2 = \sigma^2$时，设：

$$S_w^2 = \frac{(n_1-1)S_1^2 + (n_2-1)S_2^2}{n_1 + n_2 - 2}$$

为合并样本方差（pooled sample variance），则：

$$\frac{(\overline{X} - \overline{Y}) - (\mu_1 - \mu_2)}{S_w\sqrt{\frac{1}{n_1} + \frac{1}{n_2}}} \sim t(n_1 + n_2 - 2)$$

其中：

$$\frac{(n_1 + n_2 - 2)S_w^2}{\sigma^2} \sim \chi^2(n_1 + n_2 - 2)$$

这些分布定理是参数估计和假设检验的理论基础，在数理统计的应用中具有重要地位。