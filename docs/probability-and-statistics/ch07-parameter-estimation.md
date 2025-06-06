# 第七章 参数估计

## 7.1 问题的提出

在概率论中，我们通常假设随机变量的分布是已知的，然后研究其性质。但在实际问题中，我们往往只知道随机变量的分布类型（如正态分布、泊松分布等），而分布中的参数（如均值、方差等）是未知的。

**参数估计**的任务就是利用样本信息来估计未知参数。

设总体$X$的分布函数为$F(x; \theta)$，其中$\theta$是未知参数（可以是向量）。根据样本$X_1, X_2, \ldots, X_n$，我们要对参数$\theta$进行估计。

参数估计分为两类：

1. **点估计**（Point Estimation）：用样本统计量的某个取值作为未知参数的估计值。

2. **区间估计**（Interval Estimation）：在一定置信度下，用一个区间来估计未知参数的可能取值范围。

**例子**：
- 某厂生产的灯泡寿命$X \sim N(\mu, \sigma^2)$，$\mu$和$\sigma^2$未知，根据样本估计这两个参数；
- 某地区新生儿中男婴的比例$p$未知，根据样本估计$p$；
- 某电话交换台单位时间内接到的电话次数$X \sim P(\lambda)$，$\lambda$未知，根据样本估计$\lambda$。

## 7.2 两种常用的参数估计方法

### 7.2.1 矩估计法

**矩估计法**（Method of Moments）是最古老的参数估计方法之一，由Pearson于1894年提出。其基本思想是用样本矩来估计总体矩，进而估计参数。

#### 基本原理

设总体$X$的$k$阶原点矩为：
$$\mu_k = E(X^k), \quad k = 1, 2, \ldots$$

样本的$k$阶原点矩为：
$$A_k = \frac{1}{n}\sum_{i=1}^{n}X_i^k, \quad k = 1, 2, \ldots$$

当样本容量$n$较大时，由大数定律知$A_k$依概率收敛于$\mu_k$。

#### 矩估计法的步骤

设总体分布中有$m$个未知参数$\theta_1, \theta_2, \ldots, \theta_m$：

1. 用参数表示总体的前$m$阶原点矩：
   $$\mu_k = \mu_k(\theta_1, \theta_2, \ldots, \theta_m), \quad k = 1, 2, \ldots, m$$

2. 建立矩方程组：
   $$\mu_k(\theta_1, \theta_2, \ldots, \theta_m) = A_k, \quad k = 1, 2, \ldots, m$$

3. 解方程组得到参数的矩估计量：
   $$\hat{\theta}_k = \hat{\theta}_k(X_1, X_2, \ldots, X_n), \quad k = 1, 2, \ldots, m$$

#### 常见分布的矩估计

**1. 正态分布$N(\mu, \sigma^2)$**

参数：$\mu$，$\sigma^2$

矩方程：
$$\begin{cases}
\mu = A_1 = \overline{X} \\
\mu^2 + \sigma^2 = A_2 = \frac{1}{n}\sum_{i=1}^{n}X_i^2
\end{cases}$$

矩估计量：
$$\hat{\mu} = \overline{X}, \quad \hat{\sigma}^2 = A_2 - A_1^2 = \frac{1}{n}\sum_{i=1}^{n}(X_i - \overline{X})^2$$

**2. 泊松分布$P(\lambda)$**

参数：$\lambda$

矩方程：$\lambda = A_1 = \overline{X}$

矩估计量：$\hat{\lambda} = \overline{X}$

**3. 均匀分布$U[a,b]$**

参数：$a$，$b$

矩方程：
$$\begin{cases}
\frac{a+b}{2} = A_1 = \overline{X} \\
\frac{(b-a)^2}{12} + \left(\frac{a+b}{2}\right)^2 = A_2 = \frac{1}{n}\sum_{i=1}^{n}X_i^2
\end{cases}$$

矩估计量：
$$\hat{a} = \overline{X} - \sqrt{3(A_2 - A_1^2)}, \quad \hat{b} = \overline{X} + \sqrt{3(A_2 - A_1^2)}$$

### 7.2.2 最大似然估计

**最大似然估计法**（Maximum Likelihood Estimation, MLE）由Fisher于1912年提出，是最重要的参数估计方法之一。

#### 基本思想

在已知试验结果的条件下，应该选择使得这个结果出现的可能性（似然性）最大的参数值作为估计值。

#### 似然函数

设$X_1, X_2, \ldots, X_n$是来自总体$X$的样本：

**离散型总体**：设总体的分布律为$P(X = x) = p(x; \theta)$，则似然函数为：
$$L(\theta) = \prod_{i=1}^{n}p(x_i; \theta)$$

**连续型总体**：设总体的概率密度为$f(x; \theta)$，则似然函数为：
$$L(\theta) = \prod_{i=1}^{n}f(x_i; \theta)$$

#### 最大似然估计量

使似然函数$L(\theta)$达到最大值的$\theta$值称为$\theta$的**最大似然估计量**，记作$\hat{\theta}$。

由于$\ln L(\theta)$与$L(\theta)$有相同的最大值点，且$\ln L(\theta)$更容易处理，通常通过求解**对数似然方程**：

$$\frac{d \ln L(\theta)}{d \theta} = 0$$

来得到最大似然估计量。

对于多参数情况，需要解偏导数方程组：

$$\frac{\partial \ln L(\theta_1, \ldots, \theta_m)}{\partial \theta_i} = 0, \quad i = 1, 2, \ldots, m$$

#### 常见分布的最大似然估计

**1. 正态分布$N(\mu, \sigma^2)$**

似然函数：
$$L(\mu, \sigma^2) = \prod_{i=1}^{n}\frac{1}{\sqrt{2\pi}\sigma}e^{-\frac{(x_i-\mu)^2}{2\sigma^2}} = \frac{1}{(2\pi\sigma^2)^{n/2}}e^{-\frac{1}{2\sigma^2}\sum_{i=1}^{n}(x_i-\mu)^2}$$

对数似然函数：
$$\ln L = -\frac{n}{2}\ln(2\pi) - \frac{n}{2}\ln\sigma^2 - \frac{1}{2\sigma^2}\sum_{i=1}^{n}(x_i-\mu)^2$$

求偏导并令其为零：
$$\frac{\partial \ln L}{\partial \mu} = \frac{1}{\sigma^2}\sum_{i=1}^{n}(x_i-\mu) = 0$$
$$\frac{\partial \ln L}{\partial \sigma^2} = -\frac{n}{2\sigma^2} + \frac{1}{2(\sigma^2)^2}\sum_{i=1}^{n}(x_i-\mu)^2 = 0$$

最大似然估计量：
$$\hat{\mu} = \overline{X}, \quad \hat{\sigma}^2 = \frac{1}{n}\sum_{i=1}^{n}(X_i - \overline{X})^2$$

**2. 泊松分布$P(\lambda)$**

似然函数：
$$L(\lambda) = \prod_{i=1}^{n}\frac{\lambda^{x_i}e^{-\lambda}}{x_i!} = \frac{\lambda^{\sum_{i=1}^{n}x_i}e^{-n\lambda}}{\prod_{i=1}^{n}x_i!}$$

对数似然函数：
$$\ln L = \sum_{i=1}^{n}x_i \ln\lambda - n\lambda - \ln\left(\prod_{i=1}^{n}x_i!\right)$$

求导并令其为零：
$$\frac{d \ln L}{d \lambda} = \frac{\sum_{i=1}^{n}x_i}{\lambda} - n = 0$$

最大似然估计量：
$$\hat{\lambda} = \overline{X}$$

**3. 指数分布$Exp(\lambda)$**

似然函数：
$$L(\lambda) = \prod_{i=1}^{n}\lambda e^{-\lambda x_i} = \lambda^n e^{-\lambda\sum_{i=1}^{n}x_i}$$

对数似然函数：
$$\ln L = n\ln\lambda - \lambda\sum_{i=1}^{n}x_i$$

求导并令其为零：
$$\frac{d \ln L}{d \lambda} = \frac{n}{\lambda} - \sum_{i=1}^{n}x_i = 0$$

最大似然估计量：
$$\hat{\lambda} = \frac{1}{\overline{X}}$$

#### 最大似然估计的性质

1. **不变性**：若$\hat{\theta}$是$\theta$的最大似然估计量，$g(\cdot)$是一一对应函数，则$g(\hat{\theta})$是$g(\theta)$的最大似然估计量。

2. **渐近正态性**：在正则条件下，当$n \to \infty$时，最大似然估计量渐近服从正态分布。

3. **相合性**：在正则条件下，最大似然估计量是相合的。

4. **渐近有效性**：在正则条件下，最大似然估计量是渐近有效的。

## 7.3 评选估计量的标准

一个参数可能有多个不同的估计量，如何评价估计量的优劣？我们从三个方面来评价：无偏性、有效性和相合性。

### 7.3.1 无偏性

**定义**：设$\hat{\theta} = \hat{\theta}(X_1, X_2, \ldots, X_n)$是参数$\theta$的估计量，若

$$E(\hat{\theta}) = \theta$$

则称$\hat{\theta}$是$\theta$的**无偏估计量**。

无偏性表示估计量的期望值等于被估计参数的真值，即估计量没有系统性偏差。

**例子**：

1. **样本均值**：$E(\overline{X}) = \mu$，所以$\overline{X}$是$\mu$的无偏估计量。

2. **样本方差**：$E(S^2) = \sigma^2$，所以$S^2$是$\sigma^2$的无偏估计量。

3. **修正样本方差**：$E\left[\frac{1}{n}\sum_{i=1}^{n}(X_i - \overline{X})^2\right] = \frac{n-1}{n}\sigma^2 \neq \sigma^2$，所以$\frac{1}{n}\sum_{i=1}^{n}(X_i - \overline{X})^2$是$\sigma^2$的有偏估计量。

**渐近无偏性**：若$\lim_{n \to \infty}E(\hat{\theta}_n) = \theta$，则称$\hat{\theta}_n$是$\theta$的渐近无偏估计量。

### 7.3.2 有效性

当有多个无偏估计量时，我们希望选择方差最小的那一个。

**定义**：设$\hat{\theta}_1$和$\hat{\theta}_2$都是$\theta$的无偏估计量，若

$$D(\hat{\theta}_1) \leq D(\hat{\theta}_2)$$

则称$\hat{\theta}_1$比$\hat{\theta}_2$**有效**。

**最小方差无偏估计量**（MVUE）：在所有$\theta$的无偏估计量中，方差最小的估计量称为$\theta$的最小方差无偏估计量。

**Cramer-Rao不等式**：在正则条件下，对于$\theta$的任意无偏估计量$\hat{\theta}$，有

$$D(\hat{\theta}) \geq \frac{1}{nI(\theta)}$$

其中$I(\theta) = E\left[\left(\frac{\partial \ln f(X; \theta)}{\partial \theta}\right)^2\right]$称为Fisher信息量。

达到Cramer-Rao下界的无偏估计量是最小方差无偏估计量。

**相对效率**：设$\hat{\theta}_1$和$\hat{\theta}_2$都是$\theta$的无偏估计量，则$\hat{\theta}_1$相对于$\hat{\theta}_2$的效率为：

$$e(\hat{\theta}_1, \hat{\theta}_2) = \frac{D(\hat{\theta}_2)}{D(\hat{\theta}_1)}$$

### 7.3.3 相合性

**定义**：设$\hat{\theta}_n = \hat{\theta}_n(X_1, X_2, \ldots, X_n)$是基于样本容量为$n$的样本的$\theta$的估计量，若对于任意$\varepsilon > 0$，有

$$\lim_{n \to \infty}P(|\hat{\theta}_n - \theta| < \varepsilon) = 1$$

则称$\hat{\theta}_n$是$\theta$的**相合估计量**（一致估计量）。

相合性是估计量的大样本性质，表示当样本容量趋于无穷时，估计量依概率收敛到参数的真值。

**判定相合性的充分条件**：若

$$\lim_{n \to \infty}E(\hat{\theta}_n) = \theta, \quad \lim_{n \to \infty}D(\hat{\theta}_n) = 0$$

则$\hat{\theta}_n$是$\theta$的相合估计量。

**例子**：
- $\overline{X}$是$\mu$的相合估计量；
- $S^2$是$\sigma^2$的相合估计量；
- 在正则条件下，最大似然估计量是相合的。

## 7.4 区间估计的概念

点估计给出了参数的一个具体估计值，但没有指出这个估计值的精确程度。区间估计用一个区间来估计参数，并给出这个区间包含参数真值的概率。

**定义**：设$\theta$是待估参数，对于给定的$\alpha \in (0,1)$，若统计量$\underline{\theta} = \underline{\theta}(X_1, \ldots, X_n)$和$\overline{\theta} = \overline{\theta}(X_1, \ldots, X_n)$满足：

$$P(\underline{\theta} \leq \theta \leq \overline{\theta}) = 1 - \alpha$$

则称随机区间$[\underline{\theta}, \overline{\theta}]$为$\theta$的置信水平为$1-\alpha$的**置信区间**，$\underline{\theta}$和$\overline{\theta}$分别称为置信下限和置信上限，$1-\alpha$称为**置信水平**或**置信度**。

**置信区间的解释**：
- 置信区间是随机的，参数$\theta$是固定的；
- 置信水平$1-\alpha$表示，如果我们重复多次抽样并构造置信区间，大约有$(1-\alpha) \times 100\%$的区间会包含参数的真值；
- 常用的置信水平有0.90、0.95、0.99等。

**构造置信区间的一般方法**：

1. 寻找一个包含待估参数$\theta$的统计量$T = T(X_1, \ldots, X_n; \theta)$，其分布不依赖于未知参数；

2. 对于给定的置信水平$1-\alpha$，确定常数$a$和$b$，使得：
   $$P(a \leq T \leq b) = 1 - \alpha$$

3. 通过不等式$a \leq T \leq b$解出$\theta$的不等式$\underline{\theta} \leq \theta \leq \overline{\theta}$，则$[\underline{\theta}, \overline{\theta}]$为$\theta$的置信区间。

## 7.5 单个正态总体参数的置信区间

设$X_1, X_2, \ldots, X_n$是来自正态总体$N(\mu, \sigma^2)$的简单随机样本，$\overline{X}$和$S^2$分别是样本均值和样本方差。

### 7.5.1 均值$\mu$的置信区间

#### 情况1：$\sigma^2$已知

此时，统计量：
$$\frac{\overline{X} - \mu}{\sigma/\sqrt{n}} \sim N(0,1)$$

对于给定的置信水平$1-\alpha$，有：
$$P\left(-z_{\alpha/2} \leq \frac{\overline{X} - \mu}{\sigma/\sqrt{n}} \leq z_{\alpha/2}\right) = 1 - \alpha$$

其中$z_{\alpha/2}$是标准正态分布的上$\alpha/2$分位数。

解不等式得到$\mu$的置信水平为$1-\alpha$的置信区间：

$$\left[\overline{X} - z_{\alpha/2}\frac{\sigma}{\sqrt{n}}, \overline{X} + z_{\alpha/2}\frac{\sigma}{\sqrt{n}}\right]$$

#### 情况2：$\sigma^2$未知

此时，用样本标准差$S$代替$\sigma$，统计量：
$$\frac{\overline{X} - \mu}{S/\sqrt{n}} \sim t(n-1)$$

对于给定的置信水平$1-\alpha$，有：
$$P\left(-t_{\alpha/2}(n-1) \leq \frac{\overline{X} - \mu}{S/\sqrt{n}} \leq t_{\alpha/2}(n-1)\right) = 1 - \alpha$$

其中$t_{\alpha/2}(n-1)$是自由度为$n-1$的$t$分布的上$\alpha/2$分位数。

$\mu$的置信水平为$1-\alpha$的置信区间为：

$$\left[\overline{X} - t_{\alpha/2}(n-1)\frac{S}{\sqrt{n}}, \overline{X} + t_{\alpha/2}(n-1)\frac{S}{\sqrt{n}}\right]$$

### 7.5.2 方差$\sigma^2$的置信区间

#### 情况：$\mu$未知

此时，统计量：
$$\frac{(n-1)S^2}{\sigma^2} \sim \chi^2(n-1)$$

对于给定的置信水平$1-\alpha$，有：
$$P\left(\chi_{1-\alpha/2}^2(n-1) \leq \frac{(n-1)S^2}{\sigma^2} \leq \chi_{\alpha/2}^2(n-1)\right) = 1 - \alpha$$

其中$\chi_{\alpha/2}^2(n-1)$是自由度为$n-1$的$\chi^2$分布的上$\alpha/2$分位数。

$\sigma^2$的置信水平为$1-\alpha$的置信区间为：

$$\left[\frac{(n-1)S^2}{\chi_{\alpha/2}^2(n-1)}, \frac{(n-1)S^2}{\chi_{1-\alpha/2}^2(n-1)}\right]$$

#### 情况：$\mu$已知

此时，统计量：
$$\frac{\sum_{i=1}^{n}(X_i - \mu)^2}{\sigma^2} \sim \chi^2(n)$$

$\sigma^2$的置信水平为$1-\alpha$的置信区间为：

$$\left[\frac{\sum_{i=1}^{n}(X_i - \mu)^2}{\chi_{\alpha/2}^2(n)}, \frac{\sum_{i=1}^{n}(X_i - \mu)^2}{\chi_{1-\alpha/2}^2(n)}\right]$$

## 7.6 两个正态总体均值差和方差比的置信区间

设$X_1, X_2, \ldots, X_{n_1}$是来自$N(\mu_1, \sigma_1^2)$的样本，$Y_1, Y_2, \ldots, Y_{n_2}$是来自$N(\mu_2, \sigma_2^2)$的样本，且两个样本相互独立。

### 7.6.1 两个正态总体均值差$\mu_1-\mu_2$的置信区间

#### 情况1：$\sigma_1^2$和$\sigma_2^2$已知

统计量：
$$\frac{(\overline{X} - \overline{Y}) - (\mu_1 - \mu_2)}{\sqrt{\frac{\sigma_1^2}{n_1} + \frac{\sigma_2^2}{n_2}}} \sim N(0,1)$$

$\mu_1 - \mu_2$的置信水平为$1-\alpha$的置信区间为：

$$\left[(\overline{X} - \overline{Y}) - z_{\alpha/2}\sqrt{\frac{\sigma_1^2}{n_1} + \frac{\sigma_2^2}{n_2}}, (\overline{X} - \overline{Y}) + z_{\alpha/2}\sqrt{\frac{\sigma_1^2}{n_1} + \frac{\sigma_2^2}{n_2}}\right]$$

#### 情况2：$\sigma_1^2 = \sigma_2^2 = \sigma^2$未知

使用合并样本方差：
$$S_w^2 = \frac{(n_1-1)S_1^2 + (n_2-1)S_2^2}{n_1 + n_2 - 2}$$

统计量：
$$\frac{(\overline{X} - \overline{Y}) - (\mu_1 - \mu_2)}{S_w\sqrt{\frac{1}{n_1} + \frac{1}{n_2}}} \sim t(n_1 + n_2 - 2)$$

$\mu_1 - \mu_2$的置信水平为$1-\alpha$的置信区间为：

$$\left[(\overline{X} - \overline{Y}) - t_{\alpha/2}(n_1 + n_2 - 2)S_w\sqrt{\frac{1}{n_1} + \frac{1}{n_2}}, (\overline{X} - \overline{Y}) + t_{\alpha/2}(n_1 + n_2 - 2)S_w\sqrt{\frac{1}{n_1} + \frac{1}{n_2}}\right]$$

#### 情况3：$\sigma_1^2 \neq \sigma_2^2$且均未知（Welch方法）

统计量：
$$T = \frac{(\overline{X} - \overline{Y}) - (\mu_1 - \mu_2)}{\sqrt{\frac{S_1^2}{n_1} + \frac{S_2^2}{n_2}}}$$

近似服从自由度为$\nu$的$t$分布，其中：

$$\nu = \frac{\left(\frac{S_1^2}{n_1} + \frac{S_2^2}{n_2}\right)^2}{\frac{(S_1^2/n_1)^2}{n_1-1} + \frac{(S_2^2/n_2)^2}{n_2-1}}$$

$\mu_1 - \mu_2$的近似置信水平为$1-\alpha$的置信区间为：

$$\left[(\overline{X} - \overline{Y}) - t_{\alpha/2}(\nu)\sqrt{\frac{S_1^2}{n_1} + \frac{S_2^2}{n_2}}, (\overline{X} - \overline{Y}) + t_{\alpha/2}(\nu)\sqrt{\frac{S_1^2}{n_1} + \frac{S_2^2}{n_2}}\right]$$

### 7.6.2 两个正态总体方差比$\dfrac{\sigma_1^2}{\sigma_2^2}$的置信区间

统计量：
$$\frac{S_1^2/\sigma_1^2}{S_2^2/\sigma_2^2} = \frac{S_1^2\sigma_2^2}{S_2^2\sigma_1^2} \sim F(n_1-1, n_2-1)$$

对于给定的置信水平$1-\alpha$，有：
$$P\left(F_{1-\alpha/2}(n_1-1, n_2-1) \leq \frac{S_1^2\sigma_2^2}{S_2^2\sigma_1^2} \leq F_{\alpha/2}(n_1-1, n_2-1)\right) = 1 - \alpha$$

$\frac{\sigma_1^2}{\sigma_2^2}$的置信水平为$1-\alpha$的置信区间为：

$$\left[\frac{S_1^2}{S_2^2} \cdot \frac{1}{F_{\alpha/2}(n_1-1, n_2-1)}, \frac{S_1^2}{S_2^2} \cdot \frac{1}{F_{1-\alpha/2}(n_1-1, n_2-1)}\right]$$

由于$F_{1-\alpha/2}(n_1-1, n_2-1) = \frac{1}{F_{\alpha/2}(n_2-1, n_1-1)}$，上述区间也可写成：

$$\left[\frac{S_1^2}{S_2^2} \cdot \frac{1}{F_{\alpha/2}(n_1-1, n_2-1)}, \frac{S_1^2}{S_2^2} \cdot F_{\alpha/2}(n_2-1, n_1-1)\right]$$