# 第四章 随机变量的数字特征

## 4.1 随机变量的数学期望

数学期望（或期望、均值）是描述随机变量集中趋势的数字特征，它表示随机变量的平均取值。

### 4.1.1 数学期望的定义

对于离散型随机变量$X$，若其分布律为$P(X = x_i) = p_i, i = 1, 2, \cdots$，如果级数$\sum_{i=1}^{\infty}x_i p_i$绝对收敛，则称$E(X) = \sum_{i=1}^{\infty}x_i p_i$为随机变量$X$的数学期望。

对于连续型随机变量$X$，若其概率密度函数为$f(x)$，如果积分$\int_{-\infty}^{+\infty}x f(x) dx$绝对收敛，则称$E(X) = \int_{-\infty}^{+\infty}x f(x) dx$为随机变量$X$的数学期望。

从几何意义上看，对于连续型随机变量，数学期望表示概率密度曲线的"重心"。

### 4.1.2 常见的随机变量的数学期望

#### 0-1分布

若$X \sim B(1, p)$，则：

$$E(X) = 0 \cdot (1-p) + 1 \cdot p = p$$

#### 二项分布

若$X \sim B(n, p)$，则：

$$E(X) = np$$

证明可以利用二项分布的概率函数，或者将$X$看作$n$个独立的$B(1, p)$随机变量之和。

#### 泊松分布

若$X \sim P(\lambda)$，则：

$$E(X) = \lambda$$

证明：

$$E(X) = \sum_{k=0}^{\infty}k \cdot \frac{\lambda^k e^{-\lambda}}{k!} = \lambda e^{-\lambda} \sum_{k=1}^{\infty}\frac{\lambda^{k-1}}{(k-1)!} = \lambda e^{-\lambda} \cdot e^{\lambda} = \lambda$$

#### 超几何分布

若$X \sim H(n, M, N)$表示从$N$个物品中（其中$M$个有某种特征）抽取$n$个不放回时，具有该特征的物品数，则：

$$E(X) = n \cdot \frac{M}{N}$$

#### 均匀分布

若$X \sim U[a, b]$，则：

$$E(X) = \int_{a}^{b}x \cdot \frac{1}{b-a}dx = \frac{a+b}{2}$$

#### 指数分布

若$X \sim Exp(\lambda)$，则：

$$E(X) = \int_{0}^{\infty}x \cdot \lambda e^{-\lambda x}dx = \frac{1}{\lambda}$$

#### 正态分布

若$X \sim N(\mu, \sigma^2)$，则：

$$E(X) = \mu$$

### 4.1.3 随机变量函数的数学期望

设$Y = g(X)$是随机变量$X$的函数，则：

对于离散型随机变量$X$，若$P(X = x_i) = p_i$，则：

$$E(Y) = E[g(X)] = \sum_{i=1}^{\infty}g(x_i)p_i$$

对于连续型随机变量$X$，若其概率密度为$f(x)$，则：

$$E(Y) = E[g(X)] = \int_{-\infty}^{+\infty}g(x)f(x)dx$$

特别地，如果$g(X) = X^n$，则$E(X^n)$称为$X$的$n$阶原点矩。

对于二元函数$Z = h(X, Y)$，如果$X$和$Y$的联合分布已知，可以利用类似方法计算$E(Z)$。

### 4.1.4 数学期望的性质

1. **线性性质**：若$X$和$Y$是随机变量，$a$和$b$是常数，则：
   $$E(aX + bY) = aE(X) + bE(Y)$$
   更一般地，对于$n$个随机变量$X_1, X_2, \cdots, X_n$和常数$a_1, a_2, \cdots, a_n$，有：
   $$E\left(\sum_{i=1}^{n}a_i X_i\right) = \sum_{i=1}^{n}a_i E(X_i)$$

2. **独立性质**：若$X$和$Y$相互独立，则：
   $$E(XY) = E(X) \cdot E(Y)$$

3. **常数性质**：若$c$是常数，则：
   $$E(c) = c$$

4. **单调性**：若对所有$\omega \in \Omega$都有$X(\omega) \leq Y(\omega)$，则$E(X) \leq E(Y)$。

5. **绝对值不等式**：$|E(X)| \leq E(|X|)$

## 4.2 随机变量的方差

方差是描述随机变量取值分散程度的数字特征，它表示随机变量与其期望的偏离程度。

### 4.2.1 方差的定义

若随机变量$X$的数学期望$E(X) = \mu$存在，则随机变量$(X - \mu)^2$的数学期望称为$X$的方差，记作$D(X)$或$Var(X)$：

$$D(X) = E[(X - \mu)^2] = E[(X - E(X))^2]$$

方差的计算公式：

$$D(X) = E(X^2) - [E(X)]^2$$

随机变量$X$的标准差定义为方差的算术平方根，记作$\sigma(X)$：

$$\sigma(X) = \sqrt{D(X)}$$

### 4.2.2 常见随机变量的方差

#### 0-1分布

若$X \sim B(1, p)$，则：

$$D(X) = p(1-p)$$

#### 二项分布

若$X \sim B(n, p)$，则：

$$D(X) = np(1-p)$$

#### 泊松分布

若$X \sim P(\lambda)$，则：

$$D(X) = \lambda$$

#### 超几何分布

若$X \sim H(n, M, N)$，则：

$$D(X) = n\frac{M}{N}\left(1-\frac{M}{N}\right)\frac{N-n}{N-1}$$

#### 均匀分布

若$X \sim U[a, b]$，则：

$$D(X) = \frac{(b-a)^2}{12}$$

#### 指数分布

若$X \sim Exp(\lambda)$，则：

$$D(X) = \frac{1}{\lambda^2}$$

#### 正态分布

若$X \sim N(\mu, \sigma^2)$，则：

$$D(X) = \sigma^2$$

### 4.2.3 方差的性质

1. **非负性**：$D(X) \geq 0$，当且仅当$X$是常数时，$D(X) = 0$。

2. **常数的方差**：若$c$是常数，则$D(c) = 0$。

3. **线性变换**：若$a$和$b$是常数，则：
   $$D(aX + b) = a^2 D(X)$$

4. **独立随机变量的和的方差**：若$X$和$Y$相互独立，则：
   $$D(X + Y) = D(X) + D(Y)$$
   更一般地，若$X_1, X_2, \cdots, X_n$相互独立，则：
   $$D\left(\sum_{i=1}^{n}X_i\right) = \sum_{i=1}^{n}D(X_i)$$

5. **一般情况下的和的方差**：对于任意随机变量$X$和$Y$（不一定独立），有：
   $$D(X + Y) = D(X) + D(Y) + 2Cov(X, Y)$$
   其中$Cov(X, Y)$是$X$和$Y$的协方差。

6. **切比雪夫不等式**：若随机变量$X$的数学期望$E(X) = \mu$和方差$D(X) = \sigma^2$存在，则对于任意$\varepsilon > 0$，有：
   $$P(|X - \mu| \geq \varepsilon) \leq \frac{\sigma^2}{\varepsilon^2}$$
   等价地：
   $$P(|X - \mu| < \varepsilon) \geq 1 - \frac{\sigma^2}{\varepsilon^2}$$

## 4.3 协方差与相关系数

### 4.3.1 协方差与相关系数的概念

**协方差**是描述两个随机变量之间线性相关程度的数字特征。设随机变量$X$和$Y$的数学期望分别为$E(X) = \mu_X$和$E(Y) = \mu_Y$，则$X$和$Y$的协方差定义为：

$$Cov(X, Y) = E[(X - \mu_X)(Y - \mu_Y)] = E(XY) - E(X)E(Y)$$

协方差的计算公式：

$$Cov(X, Y) = E(XY) - E(X)E(Y)$$

**相关系数**是一个无量纲的量，它消除了量纲的影响，只反映两个随机变量之间线性相关的程度。设随机变量$X$和$Y$的标准差分别为$\sigma_X$和$\sigma_Y$，且均不为零，则$X$和$Y$的相关系数定义为：

$$\rho_{XY} = \frac{Cov(X, Y)}{\sigma_X \sigma_Y} = \frac{Cov(X, Y)}{\sqrt{D(X)D(Y)}}$$

相关系数$\rho_{XY}$的取值范围是$[-1, 1]$：
- 若$\rho_{XY} = 1$，称$X$和$Y$完全正相关；
- 若$\rho_{XY} = -1$，称$X$和$Y$完全负相关；
- 若$\rho_{XY} = 0$，称$X$和$Y$不相关。

### 4.3.2 协方差与相关系数的性质

1. **对称性**：$Cov(X, Y) = Cov(Y, X)$，$\rho_{XY} = \rho_{YX}$。

2. **线性性质**：对于常数$a, b, c, d$，有：
   $$Cov(aX + b, cY + d) = ac \cdot Cov(X, Y)$$

3. **自协方差**：$Cov(X, X) = D(X)$，即随机变量与自身的协方差等于其方差。

4. **柯西-施瓦茨不等式**：$|Cov(X, Y)| \leq \sqrt{D(X)D(Y)}$，等号成立当且仅当$X$和$Y$之间存在严格的线性关系。

5. **相关系数的性质**：
   - $|\rho_{XY}| \leq 1$
   - $|\rho_{XY}| = 1$当且仅当$Y = aX + b$（$a \neq 0$）
   - 若$a > 0$，则$\rho_{XY} = 1$；若$a < 0$，则$\rho_{XY} = -1$

### 4.3.3 独立与不相关的关系

如果随机变量$X$和$Y$相互独立，则它们一定不相关，即：

$$X \perp Y \Rightarrow Cov(X, Y) = 0 \Rightarrow \rho_{XY} = 0$$

但反之不一定成立，即不相关不一定独立。只有在特殊情况下，如$X$和$Y$服从二维正态分布时，不相关与独立等价。

简言之：
- 独立$\Rightarrow$不相关
- 不相关$\nRightarrow$独立
- 对于二维正态分布，不相关$\Leftrightarrow$独立

## 4.4 矩、协方差矩阵

### 4.4.1 矩

矩是描述随机变量分布的一系列数字特征。常见的矩有：

1. **$k$阶原点矩**：
   $$\mu_k = E(X^k), k = 1, 2, \cdots$$
   特别地，$\mu_1 = E(X)$为随机变量的数学期望。

2. **$k$阶中心矩**：
   $$\nu_k = E[(X - E(X))^k], k = 1, 2, \cdots$$
   特别地，$\nu_1 = 0$，$\nu_2 = D(X)$为随机变量的方差。

3. **偏度**：标准化的三阶中心矩，描述分布的对称性：
   $$\beta_1 = \frac{\nu_3}{\nu_2^{3/2}} = \frac{E[(X - \mu)^3]}{\sigma^3}$$
   若$\beta_1 = 0$，则分布关于均值对称；
   若$\beta_1 > 0$，则分布右偏（正偏）；
   若$\beta_1 < 0$，则分布左偏（负偏）。

4. **峰度**：标准化的四阶中心矩，描述分布的尖峭度：
   $$\beta_2 = \frac{\nu_4}{\nu_2^2} = \frac{E[(X - \mu)^4]}{\sigma^4}$$
   对于正态分布，$\beta_2 = 3$；
   若$\beta_2 > 3$，则分布比正态分布更尖峭（尖峰厚尾）；
   若$\beta_2 < 3$，则分布比正态分布更平坦（扁峰薄尾）。

### 4.4.2 协方差矩阵

设$\mathbf{X} = (X_1, X_2, \cdots, X_n)^T$是$n$维随机向量，其协方差矩阵定义为：

$$\Sigma = Cov(\mathbf{X}) = E[(\mathbf{X} - E(\mathbf{X}))(\mathbf{X} - E(\mathbf{X}))^T]$$

展开后，协方差矩阵的元素为：

$$\Sigma_{ij} = Cov(X_i, X_j) = E[(X_i - E(X_i))(X_j - E(X_j))]$$

协方差矩阵具有以下性质：
1. 对称性：$\Sigma = \Sigma^T$
2. 半正定性：对任意非零向量$\mathbf{a}$，有$\mathbf{a}^T \Sigma \mathbf{a} \geq 0$
3. 对角线元素为各随机变量的方差：$\Sigma_{ii} = D(X_i)$

**相关系数矩阵**可以从协方差矩阵导出：

$$R = \{r_{ij}\}, \quad r_{ij} = \frac{\Sigma_{ij}}{\sqrt{\Sigma_{ii}\Sigma_{jj}}} = \frac{Cov(X_i, X_j)}{\sqrt{D(X_i)D(X_j)}}$$

### 4.4.3 n维正态分布

$n$维随机向量$\mathbf{X} = (X_1, X_2, \cdots, X_n)^T$服从$n$维正态分布，记作$\mathbf{X} \sim N(\boldsymbol{\mu}, \Sigma)$，如果其概率密度函数为：

$$f(\mathbf{x}) = \frac{1}{(2\pi)^{n/2}|\Sigma|^{1/2}}\exp\left\{-\frac{1}{2}(\mathbf{x} - \boldsymbol{\mu})^T \Sigma^{-1} (\mathbf{x} - \boldsymbol{\mu})\right\}$$

其中：
- $\boldsymbol{\mu} = E(\mathbf{X}) = (E(X_1), E(X_2), \cdots, E(X_n))^T$是均值向量
- $\Sigma = Cov(\mathbf{X})$是协方差矩阵
- $|\Sigma|$是$\Sigma$的行列式

$n$维正态分布的性质：
1. 边缘分布：$n$维正态分布的任意边缘分布仍是正态分布
2. 条件分布：给定部分变量的条件下，其余变量的条件分布仍是正态分布
3. 线性变换：若$\mathbf{X} \sim N(\boldsymbol{\mu}, \Sigma)$，则线性变换$\mathbf{Y} = A\mathbf{X} + \mathbf{b}$仍服从正态分布，且$\mathbf{Y} \sim N(A\boldsymbol{\mu} + \mathbf{b}, A\Sigma A^T)$
4. 独立性：对于多维正态分布，分量之间不相关等价于独立