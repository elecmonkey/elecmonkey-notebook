# 第五章 极限定理

## 5.1 大数定律

大数定律是概率论中的基本定理，它描述了大量重复试验的平均结果趋近于期望值的现象。这一定律为概率论与统计学的联系提供了重要的理论基础。

### 5.1.1 切比雪夫大数定律

**切比雪夫大数定律**适用于相互独立但不一定同分布的随机变量序列。

设随机变量序列$X_1, X_2, \ldots, X_n, \ldots$相互独立，数学期望$E(X_k) = \mu_k$存在，方差$D(X_k) = \sigma_k^2$有界，即存在常数$C > 0$，使得对一切$k$都有$\sigma_k^2 \leq C$，则对任意$\varepsilon > 0$，有：

$$\lim_{n \to \infty} P\left(\left|\frac{1}{n}\sum_{k=1}^{n}X_k - \frac{1}{n}\sum_{k=1}^{n}\mu_k\right| < \varepsilon\right) = 1$$

特别地，若$X_1, X_2, \ldots, X_n, \ldots$具有相同的数学期望$\mu$，则有：

$$\lim_{n \to \infty} P\left(\left|\frac{1}{n}\sum_{k=1}^{n}X_k - \mu\right| < \varepsilon\right) = 1$$

**证明思路**：利用切比雪夫不等式，对随机变量$\frac{1}{n}\sum_{k=1}^{n}X_k$应用，得到：

$$P\left(\left|\frac{1}{n}\sum_{k=1}^{n}X_k - \frac{1}{n}\sum_{k=1}^{n}\mu_k\right| \geq \varepsilon\right) \leq \frac{D\left(\frac{1}{n}\sum_{k=1}^{n}X_k\right)}{\varepsilon^2} = \frac{1}{n^2\varepsilon^2}\sum_{k=1}^{n}\sigma_k^2 \leq \frac{C}{n\varepsilon^2}$$

当$n \to \infty$时，右侧趋于0，因此定理成立。

### 5.1.2 辛钦大数定律

**辛钦大数定律**适用于独立同分布的随机变量序列。

设随机变量序列$X_1, X_2, \ldots, X_n, \ldots$相互独立且同分布，且具有相同的数学期望$E(X_k) = \mu$，则对任意$\varepsilon > 0$，有：

$$\lim_{n \to \infty} P\left(\left|\frac{1}{n}\sum_{k=1}^{n}X_k - \mu\right| < \varepsilon\right) = 1$$

也就是说，当$n$很大时，算术平均值$\frac{1}{n}\sum_{k=1}^{n}X_k$几乎必然地接近于$\mu$。这一定理不要求方差存在，条件比切比雪夫大数定律更弱，但适用范围更窄。

### 5.1.3 伯努利大数定律

**伯努利大数定律**是大数定律的一个特例，适用于伯努利试验序列。

设$n_A$是$n$次独立重复试验中事件$A$发生的次数，$p$是事件$A$在每次试验中发生的概率，则对任意$\varepsilon > 0$，有：

$$\lim_{n \to \infty} P\left(\left|\frac{n_A}{n} - p\right| < \varepsilon\right) = 1$$

伯努利大数定律说明，当试验次数$n$足够大时，事件$A$发生的频率$\frac{n_A}{n}$几乎必然地接近于概率$p$。这一定律为频率与概率之间的联系提供了理论依据。

事实上，伯努利大数定律可以看作是辛钦大数定律的特例。若令$X_k$为第$k$次试验中事件$A$是否发生的示性变量（发生为1，不发生为0），则$X_k \sim B(1,p)$，$E(X_k) = p$，且$n_A = \sum_{k=1}^{n}X_k$。

## 5.2 中心极限定理

中心极限定理说明，在适当条件下，大量独立随机变量的和的分布近似于正态分布。这一定理解释了为什么在自然和社会科学中正态分布如此普遍。

### 5.2.1 Lindeberg中心极限定理

**Lindeberg中心极限定理**适用于独立但不一定同分布的随机变量序列，是一个较为一般的中心极限定理。

设随机变量序列$X_1, X_2, \ldots, X_n, \ldots$相互独立，$E(X_k) = \mu_k$，$D(X_k) = \sigma_k^2 > 0$，记$B_n^2 = \sum_{k=1}^{n}\sigma_k^2$。如果对任意$\varepsilon > 0$，有：

$$\lim_{n \to \infty} \frac{1}{B_n^2}\sum_{k=1}^{n}E\left[(X_k - \mu_k)^2 \cdot I_{\{|X_k - \mu_k| > \varepsilon B_n\}}\right] = 0$$

其中$I_{\{|X_k - \mu_k| > \varepsilon B_n\}}$是示性函数，当$|X_k - \mu_k| > \varepsilon B_n$时取1，否则取0。

则随机变量和的标准化形式：

$$\frac{\sum_{k=1}^{n}X_k - \sum_{k=1}^{n}\mu_k}{B_n}$$

的分布函数$F_n(x)$对任意$x$都满足：

$$\lim_{n \to \infty} F_n(x) = \Phi(x)$$

其中$\Phi(x)$是标准正态分布的分布函数。

上述条件被称为Lindeberg条件，它实质上要求没有任何一个随机变量在和的分布中占主导地位。

### 5.2.2 Lévy-Lindeberg中心极限定理

**Lévy-Lindeberg中心极限定理**（又称独立同分布的中心极限定理）是中心极限定理的一个特例，适用于独立同分布的随机变量序列。

设随机变量序列$X_1, X_2, \ldots, X_n, \ldots$相互独立且同分布，$E(X_k) = \mu$，$D(X_k) = \sigma^2 > 0$，则随机变量和的标准化形式：

$$\frac{\sum_{k=1}^{n}X_k - n\mu}{\sigma\sqrt{n}}$$

的分布函数$F_n(x)$对任意$x$都满足：

$$\lim_{n \to \infty} F_n(x) = \Phi(x)$$

其中$\Phi(x)$是标准正态分布的分布函数。

这一定理表明，无论原始随机变量的分布如何（只要均值和方差存在），大量独立同分布随机变量的和经过适当标准化后，其分布都会趋近于正态分布。

### 5.2.3 De Moivre-Laplace中心极限定理

**De Moivre-Laplace中心极限定理**是中心极限定理在二项分布情况下的特例。

设随机变量$X_n \sim B(n,p)$表示$n$次独立重复的伯努利试验中成功的次数，则对任意实数$x$，有：

$$\lim_{n \to \infty} P\left(\frac{X_n - np}{\sqrt{np(1-p)}} \leq x\right) = \Phi(x)$$

其中$\Phi(x)$是标准正态分布的分布函数。

该定理的一个简化表述是：当$n$足够大时，二项分布$B(n,p)$可以用正态分布$N(np, np(1-p))$近似。在实际应用中，通常要求$np \geq 5$且$n(1-p) \geq 5$。

为了提高近似精度，可以采用连续性校正：

$$P(a \leq X_n \leq b) \approx \Phi\left(\frac{b + 0.5 - np}{\sqrt{np(1-p)}}\right) - \Phi\left(\frac{a - 0.5 - np}{\sqrt{np(1-p)}}\right)$$

中心极限定理在统计学、物理学、金融学等众多领域有广泛应用，它解释了为什么许多自然现象和实际问题中的随机变量近似服从正态分布。