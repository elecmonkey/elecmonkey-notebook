# $n$维向量

## 2.1 $n$维向量及其运算

### 2.1.1 $n$维向量的概念

​	每个分量都为0的向量称为零向量。$n$维零向量：$\boldsymbol{\mathrm{0}}=\boldsymbol\theta=\pmatrix{0\\0\\\vdots\\0}$.

​	向量$\boldsymbol\alpha$视为矩阵时的负矩阵称为$\boldsymbol\alpha$的负向量，记为$-\boldsymbol\alpha$.

​	单位向量$\boldsymbol\varepsilon_n$：$\boldsymbol\varepsilon_1=\pmatrix{1\\0\\0\\\vdots\\0}$，$\boldsymbol\varepsilon_2=\pmatrix{0\\1\\0\\\vdots\\0}$，……

### 2.1.2 $n$维向量的线性运算

​	$n$维向量的加法与数乘统称为线性运算，同矩阵的线性运算。

### 2.1.3 线性运算的性质

​	$\boldsymbol\alpha+\boldsymbol\beta=\boldsymbol\beta+\boldsymbol\alpha$

​	$(\boldsymbol\alpha+\boldsymbol\beta)+\boldsymbol\gamma=\boldsymbol\alpha+(\boldsymbol\beta+\boldsymbol\gamma)$

​	$\boldsymbol\alpha+\boldsymbol0=\boldsymbol\alpha$

​	$\boldsymbol\alpha+(-\boldsymbol\alpha)=\boldsymbol0$

​	$1\boldsymbol\alpha=\boldsymbol\alpha$

​	$k(l\boldsymbol\alpha)=(kl)\boldsymbol\alpha$

​	$k(\boldsymbol\alpha+\boldsymbol\beta)+k\boldsymbol\alpha+k\boldsymbol\beta$

​	$(k+l)\boldsymbol\alpha=k\boldsymbol\alpha+l\boldsymbol\alpha$

### 2.1.4 线性组合和线性表示

#### 线性组合

​	给定维数相同的向量构成的向量组$\{\boldsymbol{\alpha}_1,\ldots,\boldsymbol{\alpha}_s\}$，设$k_1,\ldots,k_s$是数，则称向量$k_1\boldsymbol{\alpha}_1+\ldots+k_s\boldsymbol{\alpha}_s$是向量组的一个线性组合，$k_1,\ldots,k_s$是这个线性组合的组合系数。

#### 线性表示

​	如果$n$维向量$\eta$可以写成向量组$\{\boldsymbol{\alpha}_1,\ldots,\boldsymbol{\alpha}_s\}$的线性组合，则称$\eta$可以由向量组$\{\boldsymbol{\alpha}_1,\ldots,\boldsymbol{\alpha}_s\}$线性表示。

​	设$\boldsymbol A_{s\times n}=\pmatrix{\boldsymbol\alpha_1&\ldots&\boldsymbol\alpha_n}$，则$\boldsymbol A\boldsymbol x=\boldsymbol\beta$有解当且仅当$\boldsymbol\beta$可以由$\boldsymbol\alpha_1,\ldots,\boldsymbol\alpha_n$线性表示。

#### $n$维基本单位向量组

​	$\boldsymbol A=\pmatrix{\boldsymbol\varepsilon_1&\ldots&\boldsymbol\varepsilon_n}=\pmatrix{1&&\\&\ddots&\\&&1}=\boldsymbol E_n$

​	$\boldsymbol\alpha$可以由$\boldsymbol\varepsilon_1,\ldots,\boldsymbol\varepsilon_n$线性表示，由于$\boldsymbol E_nx=\boldsymbol \alpha$的解是唯一的，所以$\boldsymbol\alpha$可以由$\boldsymbol\varepsilon_1,\ldots,\boldsymbol\varepsilon_n$线性表示的方式唯一。

​	$\boldsymbol\varepsilon_1,\boldsymbol\varepsilon_2,\ldots,\boldsymbol\varepsilon_n$称为**$n$维基本单位向量组**。

#### 平凡表示与非平凡表示

​	平凡表示：$0\cdot\boldsymbol{\alpha}_1 +0\cdot\boldsymbol{\alpha}_2 + \ldots + 0\cdot\boldsymbol{\alpha}_n = \boldsymbol0$

​	非平凡表示：$k_1\boldsymbol{\alpha}_1 + k_2\boldsymbol{\alpha}_2 + \ldots + k_n\boldsymbol{\alpha}_n = \boldsymbol0$（$k_1,k_2,\ldots,k_n$不全为零）



## 2.2 向量组的秩与线性相关性

### 2.2.1 向量组的秩与线性相关性

#### 向量组的秩

​	给定$n$维列向量组$\boldsymbol{\alpha}_1,\ldots,\boldsymbol{\alpha}_s$，令$\boldsymbol A=\pmatrix{\boldsymbol\alpha_1&\ldots&\boldsymbol\alpha_s}$，定义向量组的秩$\mathrm r\{\boldsymbol{\alpha}_1,\ldots,\boldsymbol{\alpha}_s\}=\mathrm r(\boldsymbol A)$.

​	向量组的秩实际上就是其极小生成元集中向量的个数。向量组的秩在某种意义上刻画了这个向量组中向量间相互独立的程度。

#### 线性相关性

​	对于向量组$$\boldsymbol{\alpha}_1,\ldots,\boldsymbol{\alpha}_s$$，

​		若$\mathrm r\{\boldsymbol{\alpha}_1,\ldots,\boldsymbol{\alpha}_s\}=s$，则称向量组$\boldsymbol{\alpha}_1,\ldots,\boldsymbol{\alpha}_s$线性无关，

​		若$\mathrm r\{\boldsymbol{\alpha}_1,\ldots,\boldsymbol{\alpha}_s\}<s$，则称向量组$\boldsymbol{\alpha}_1,\ldots,\boldsymbol{\alpha}_s$线性相关。

​	$\boldsymbol A_{n\times s}=\pmatrix{\boldsymbol\alpha_1&\ldots&\boldsymbol\alpha_s}$，则下列命题等价：

​		$\boldsymbol\alpha_1,\ldots,\boldsymbol\alpha_s$线性无关

​		$\mathrm r(\boldsymbol A)=s$

​		方程$\boldsymbol A\boldsymbol x=\boldsymbol0$只有零解

​		零向量$\boldsymbol0$只有平凡表示

​	下列命题也等价：

​		$\boldsymbol\alpha_1,\ldots,\boldsymbol\alpha_s$线性相关

​		$\mathrm r(\boldsymbol A)<s$

​		方程$\boldsymbol A\boldsymbol x=\boldsymbol0$有非零解

​		零向量$\boldsymbol0$有非平凡表示

​	由一个向量构成的向量组是线性相关的，当且仅当这个向量为零向量。

​	由两个向量构成的向量组是线性相关的，当且仅当这两个向量的分量成比例。

​	当$s>n$时，任意$s$个$n$维向量一定线性相关。

### 2.2.2 向量组秩的性质

#### 向量组等价

​	如果向量组$\boldsymbol\beta_1,\boldsymbol\beta_2,\dots,\boldsymbol\beta_t$中每个向量都可以由$\boldsymbol\alpha_1,\boldsymbol\alpha_2,\dots,\boldsymbol\alpha_s$线性表示，则称向量组$\boldsymbol\beta_1,\boldsymbol\beta_2,\dots,\boldsymbol\beta_t$可以由$\boldsymbol\alpha_1,\boldsymbol\alpha_2,\dots,\boldsymbol\alpha_s$线性表示。

​	如果这两个向量组可以相互线性表示，则称它们等价。

​	向量组的等价具有反身性、对称性、传递性。

#### 向量组等价的性质

​	反身性：$\{\boldsymbol\alpha_1,\boldsymbol\alpha_2,\dots,\boldsymbol\alpha_s\}\cong\{\boldsymbol\alpha_1,\boldsymbol\alpha_2,\dots,\boldsymbol\alpha_s\}$.

​	对称性：若$\{\boldsymbol\alpha_1,\boldsymbol\alpha_2,\dots,\boldsymbol\alpha_s\}\cong\{\boldsymbol\beta_1,\boldsymbol\beta_2,\dots,\boldsymbol\beta_t\}$，则$\{\boldsymbol\beta_1,\boldsymbol\beta_2,\dots,\boldsymbol\beta_t\}\cong\{\boldsymbol\alpha_1,\boldsymbol\alpha_2,\dots,\boldsymbol\alpha_s\}$.

​	传递性：若$\{\boldsymbol\alpha_1,\boldsymbol\alpha_2,\dots,\boldsymbol\alpha_s\}\cong\{\boldsymbol\beta_1,\boldsymbol\beta_2,\dots,\boldsymbol\beta_t\}$，$\{\boldsymbol\beta_1,\boldsymbol\beta_2,\dots,\boldsymbol\beta_t\}\cong\{\boldsymbol\gamma_1,\boldsymbol\gamma_2,\dots,\boldsymbol\gamma_n\}$，则$\{\boldsymbol\alpha_1,\boldsymbol\alpha_2,\dots,\boldsymbol\alpha_s\}\cong\{\boldsymbol\gamma_1,\boldsymbol\gamma_2,\dots,\boldsymbol\gamma_n\}$.

​	如果向量组$\boldsymbol\alpha_1,\boldsymbol\alpha_2,\dots,\boldsymbol\alpha_s$和$\boldsymbol\beta_1,\boldsymbol\beta_2,\dots,\boldsymbol\beta_t$等价，则$\mathrm r\{\boldsymbol\alpha_1,\boldsymbol\alpha_2,\dots,\boldsymbol\alpha_s\}=\mathrm r\{\boldsymbol\alpha_1,\boldsymbol\alpha_2,\dots,\boldsymbol\alpha_s\}$.

​	如果向量组$\boldsymbol\alpha_1,\boldsymbol\alpha_2,\dots,\boldsymbol\alpha_s$和$\boldsymbol\beta_1,\boldsymbol\beta_2,\dots,\boldsymbol\beta_t$都线性无关且等价，则$s=t$.



## 2.3 向量组线性相关性的等价刻画

### 2.3.1 等价刻画 $\mathbb{R}m I$

​	在几何空间中，两个矢量$\boldsymbol\alpha,\boldsymbol\beta$线性相关当且仅当它们共线，三个矢量$\boldsymbol\alpha,\boldsymbol\beta,\boldsymbol\gamma$线性相关当且仅当它们共工面。

​	$n$维向量组$\boldsymbol\alpha_1,\boldsymbol\alpha_2,\dots,\boldsymbol\alpha_s$是线性相关的的充分必要条件是存在不全为0的数$k_1,k_2,\ldots,k_s$，使得$k_1\boldsymbol\alpha_1+k_2\boldsymbol\alpha_2+\dots+k_s\boldsymbol\alpha_s=\boldsymbol0$.

​	如果某个向量组的部分是线性相关的，则整个向量组是线性相关的。

​	向量组$\boldsymbol\alpha_1,\boldsymbol\alpha_2,\dots,\boldsymbol\alpha_s$是线性无关的当且仅当由$k_1\boldsymbol\alpha_1+k_2\boldsymbol\alpha_2+\dots+k_s\boldsymbol\alpha_s=\boldsymbol0$可以推出$k_1,k_2,\ldots,k_s$全为$0$.

### 2.3.2 等价刻画 $\mathbb{R}m II$

​	向量组$\boldsymbol\alpha_1,\boldsymbol\alpha_2,\dots,\boldsymbol\alpha_s$线性相关当且仅当在$\boldsymbol\alpha_1,\boldsymbol\alpha_2,\dots,\boldsymbol\alpha_s$中存在一个向量$\boldsymbol\alpha_j$，使得$\boldsymbol\alpha_j$可以由其余$s-1$个向量线性表示。

​	若向量组$\boldsymbol\alpha_1,\boldsymbol\alpha_2,\dots,\boldsymbol\alpha_s$线性无关，$\boldsymbol\alpha_1,\boldsymbol\alpha_2,\dots,\boldsymbol\alpha_s,\boldsymbol\beta$线性相关，则$\boldsymbol\beta$可由$\boldsymbol\alpha_1,\boldsymbol\alpha_2,\dots,\boldsymbol\alpha_s$线性表示，且表示方式是唯一的。



## 2.4 向量组的极大线性无关组

### 2.4.1 向量组的极大线性无关组

​	若向量组$\boldsymbol\alpha_1,\boldsymbol\alpha_2,\ldots,\boldsymbol\alpha_s$的秩为$r(r>0)$，其中存在部分组$\boldsymbol\alpha_{i_1},\boldsymbol\alpha_{i_2},\ldots,\boldsymbol\alpha_{i_r}$，使得$\boldsymbol\alpha_{i_1},\boldsymbol\alpha_{i_2},\ldots,\boldsymbol\alpha_{i_r}$线性无关且$\boldsymbol\alpha_1,\boldsymbol\alpha_2,\ldots,\boldsymbol\alpha_s$中的每一个向量都可以用$\boldsymbol\alpha_{i_1},\boldsymbol\alpha_{i_2},\ldots,\boldsymbol\alpha_{i_r}$线性表示，则称$\boldsymbol\alpha_{i_1},\boldsymbol\alpha_{i_2},\ldots,\boldsymbol\alpha_{i_r}$为向量组$\boldsymbol\alpha_1,\boldsymbol\alpha_2,\ldots,\boldsymbol\alpha_s$的一个极大线性无关组，简称极大无关组。

​	一个向量组的极大无关组一般而言不唯一。但是都应含有$r$个向量。

### 2.4.2 向量组的极大无关组的计算$(\mathrm I)$

​	观察向量组中的$r$个向量线性无关，就可以得到一组极大无关组。



## 2.5 向量空间

### 2.5.1 向量空间的概念

​	设$V$为$\mathbb{R}^n$的一个非空子集，若对任意的$\alpha,\beta\in V$及$\forall k\in\mathbb{R}$，有**加法封闭**$\alpha+\beta\in V$、**数乘封闭**$k\alpha\in V$，则称$V$是$\mathbb{R}^n$的一个子空间，或简称向量空间。

​	不包含零向量的不可能是向量空间。

​	向量空间要用集合的语言来研究线性表示、线性无关、线性相关这三个概念。
$$
\begin{align*}
L\{\boldsymbol\alpha_1,\boldsymbol\alpha_2,\ldots,\boldsymbol\alpha_s\}=&R(\boldsymbol A)=\{k_1\boldsymbol\alpha_1+k_2\boldsymbol\alpha_2+\ldots+k_s\boldsymbol\alpha_s|k_1,k_2,\ldots,k_s\in\mathbb{R}\}
\\
K\{\boldsymbol\alpha_1,\boldsymbol\alpha_2,\ldots,\boldsymbol\alpha_s\}=&K(\boldsymbol A)=\left\{\left.\pmatrix{k_1\\k_2\\\vdots\\k_s}\right|k_1\boldsymbol\alpha_1+k_2\boldsymbol\alpha_2+\ldots+k_s\boldsymbol\alpha_s=\boldsymbol0\right\}
\end{align*}
$$
​	$L$表示$\boldsymbol\alpha_1,\boldsymbol\alpha_2,\ldots,\boldsymbol\alpha_s$的所有线性组合，是该向量组生成的向量空间。

​	$K$表示零向量的所有表示方式的系数构成的列向量，也是向量空间。

### 2.5.2 向量空间的基和维数

​	设$V$为一向量空间，若$V$中向量$\boldsymbol\alpha_1,\boldsymbol\alpha_2,\ldots,\boldsymbol\alpha_s$线性无关且$V$中每个向量均可由$\boldsymbol\alpha_1,\boldsymbol\alpha_2,\ldots,\boldsymbol\alpha_s$线性表示，则称$\boldsymbol\alpha_1,\boldsymbol\alpha_2,\ldots,\boldsymbol\alpha_s$为向量空间$V$的一组基

​	向量空间$V$的基通常不唯一，但是基中的向量个数唯一，这个数叫做向量空间$V$的维数，记作$\dim V$.

​	$n$维基本单位向量组$\boldsymbol\varepsilon_1,\boldsymbol\varepsilon_2,\ldots,\boldsymbol\varepsilon_n$线性无关，$\mathbb{R}^n$中的每个向量都可以由它们线性表示，故$\boldsymbol\varepsilon_1,\boldsymbol\varepsilon_2,\ldots,\boldsymbol\varepsilon_n$是$\mathbb{R}^n$的基，从而$\dim\mathbb{R}^n=n$.

​	对于向量组$\boldsymbol\alpha_1,\boldsymbol\alpha_2,\ldots,\boldsymbol\alpha_s$，$V=L\{\boldsymbol\alpha_1,\boldsymbol\alpha_2,\ldots,\boldsymbol\alpha_s\}$，若$\boldsymbol\alpha_{i_1},\boldsymbol\alpha_{i_2},\ldots.\boldsymbol\alpha_{i_r}$是$\boldsymbol\alpha_1,\boldsymbol\alpha_2,\ldots,\boldsymbol\alpha_s$的一个极大无关组，则$\boldsymbol\alpha_{i_1},\boldsymbol\alpha_{i_2},\ldots.\boldsymbol\alpha_{i_r}$是$V$的一组基，且$\dim V=r=\mathrm r(\boldsymbol\alpha_1,\boldsymbol\alpha_2,\ldots,\boldsymbol\alpha_s)$.

### 2.5.3 向量在基下的坐标

​	设$\boldsymbol\alpha_1,\boldsymbol\alpha_2,\ldots,\boldsymbol\alpha_s$为空间向量$V$的一组基，若$\boldsymbol\eta\in V$，则存在唯一一组数$k_1,k_2,\ldots,k_s$，使得$\boldsymbol\eta=k_1\boldsymbol\alpha_1,k_2\boldsymbol\alpha_2,\ldots,k_s\boldsymbol\alpha_s=(\boldsymbol\alpha_1,\boldsymbol\alpha_2,\ldots,\boldsymbol\alpha_s)\pmatrix{k_1\\k_2\\\vdots\\k_s}=\boldsymbol{Ak}$，则称列向量$\pmatrix{k_1\\k_2\\\vdots\\k_s}$是向量$\boldsymbol{\eta}$在$V$的基$\boldsymbol\alpha_1,\boldsymbol\alpha_2,\ldots,\boldsymbol\alpha_s$下的坐标。

### 2.5.4 基变换与坐标变换

​	设$\boldsymbol\alpha_1,\boldsymbol\alpha_2,\cdots,\boldsymbol\alpha_s$和$\boldsymbol\beta_1,\boldsymbol\beta_2,\cdots,\boldsymbol\beta_s$都是向量空间$V$的基，如果对每个$j$，$\boldsymbol\beta_j$在$V$的基$\boldsymbol\alpha_1,\boldsymbol\alpha_2,\cdots,\boldsymbol\alpha_s$下的坐标是$\boldsymbol p_j$，令矩阵$\boldsymbol P=(\boldsymbol p_1,\boldsymbol p_2,\cdots,\boldsymbol p_s)$，则$\boldsymbol P$是$s$阶可逆矩阵。称$\boldsymbol P$是从基$\boldsymbol\alpha_1,\boldsymbol\alpha_2,\cdots,\boldsymbol\alpha_s$到基$\boldsymbol\beta_1,\boldsymbol\beta_2,\cdots,\boldsymbol\beta_s$的过渡矩阵。

​	如果$V$是列向量空间$\mathbb{R}^n$的子空间，则$(\boldsymbol\alpha_1,\boldsymbol\alpha_2,\cdots,\boldsymbol\alpha_s)$、$(\boldsymbol\beta_1,\boldsymbol\beta_2,\cdots,\boldsymbol\beta_s)$为$n\times s$矩阵，满足
$$
(\boldsymbol\beta_1,\boldsymbol\beta_2,\cdots,\boldsymbol\beta_s)=(\boldsymbol\alpha_1,\boldsymbol\alpha_2,\cdots,\boldsymbol\alpha_s)\boldsymbol P
$$
设向量$\boldsymbol\eta\in V$在基$\boldsymbol\alpha_1,\boldsymbol\alpha_2,\cdots,\boldsymbol\alpha_s$和$\boldsymbol\beta_1,\boldsymbol\beta_2,\cdots,\boldsymbol\beta_s$下的坐标分别是$\boldsymbol x$和$\boldsymbol y$，则必定有$\boldsymbol x=\boldsymbol{Py}$，即$\boldsymbol y=\boldsymbol P^{-1}\boldsymbol x$，这被称为坐标变换公式。

## 2.6 内积与正交矩阵

### 2.6.1 $n$维向量的内积

#### 内积的定义

​	设$\boldsymbol\alpha=\pmatrix{x_1\\\vdots\\x_b}$，$\boldsymbol\beta=\pmatrix{y_1\\\vdots\\y_n}$为两个$n$维向量，称它们的对应分量相乘再相加得到的数叫做它们的内积，记为$\langle\boldsymbol\alpha,\boldsymbol\beta\rangle$.

​	即：$\langle\boldsymbol\alpha,\boldsymbol\beta\rangle=\boldsymbol\alpha^\mathrm{T}\boldsymbol\beta=x_1y_1+\cdots+x_ny_n$.

#### 内积的性质

​	对于$n$维向量$\boldsymbol\alpha,\boldsymbol\beta,\boldsymbol\gamma$及实数$k$，有

​		(1) $\langle\boldsymbol\alpha,\boldsymbol\beta\rangle=\langle\boldsymbol\beta,\boldsymbol\alpha\rangle$

​		(2) $\langle k\boldsymbol\alpha,\boldsymbol\beta\rangle=k\langle\boldsymbol\alpha,\boldsymbol\beta\rangle$

​		(3) $\langle k_1\boldsymbol\alpha_1+k_2\boldsymbol\alpha_2,\boldsymbol\beta\rangle=k_1\langle\boldsymbol\alpha_1,\boldsymbol\beta\rangle+k_2\langle\boldsymbol\alpha_2,\boldsymbol\beta\rangle$

​			特别的，$\langle\boldsymbol\alpha+\boldsymbol\beta,\boldsymbol\gamma\rangle=\langle\boldsymbol\alpha,\boldsymbol\gamma\rangle+\langle\boldsymbol\beta,\boldsymbol\gamma\rangle$

​		(4) $\langle\boldsymbol\alpha,\boldsymbol\alpha\rangle\ge0$，且$\langle\boldsymbol\alpha,\boldsymbol\alpha\rangle=0$当且仅当$\boldsymbol\alpha=\boldsymbol0$

#### Cauchy不等式的向量表示

​	$|\langle\boldsymbol\alpha,\boldsymbol\beta\rangle|\le\sqrt{\langle\boldsymbol\alpha,\boldsymbol\alpha\rangle}\sqrt{\langle\boldsymbol\beta,\boldsymbol\beta\rangle}$

#### 向量的长度与性质

​	设$\boldsymbol\alpha$、$\boldsymbol\beta$都是$n$维向量，定义$\sqrt{\langle\boldsymbol\alpha,\boldsymbol\alpha\rangle}$为$\boldsymbol\alpha$的长度，记为$\|\boldsymbol\alpha\|$.

​	若均不为零向量，$\boldsymbol\alpha$和$\boldsymbol\beta$的夹角为$\arccos\dfrac{\langle\boldsymbol\alpha,\boldsymbol\beta\rangle}{\|\boldsymbol\alpha\|\|\boldsymbol\beta\|}$

​	对于$n$维向量$\boldsymbol\alpha,\boldsymbol\beta$及实数$k$，有

​		(1) **恒正性** $\|\boldsymbol\alpha\|\ge0$，且$\|\boldsymbol\alpha\|=0$当且仅当$\boldsymbol\alpha=\boldsymbol0$

​		(2) **齐次性** $\|k\boldsymbol\alpha\|=|k|\cdot\|\boldsymbol\alpha\|$

​		(3) **三角不等式** $\|\boldsymbol\alpha+\boldsymbol\beta\|\le\|\boldsymbol\alpha\|+\|\boldsymbol\beta\|$

​	对于非零向量$\boldsymbol\alpha$，$\dfrac{\boldsymbol\alpha}{\|\boldsymbol\alpha\|}$一定是单位向量，这一过程叫做将$\boldsymbol\alpha$单位化。

### 2.6.2 正交向量组和施密特(Schmidt)正交化方法

#### 向量的正交

​	若$\langle\boldsymbol\alpha,\boldsymbol\beta\rangle=0$，则称$\boldsymbol\alpha,\boldsymbol\beta$是正交的，记为$\boldsymbol\alpha\perp\boldsymbol\beta$.

​	零向量与任意向量都是正交的，两个非零向量正交当且仅当这两个向量的夹角为$\dfrac\pi2$.

#### 正交向量组

​	称由两两正交的非零向量所构成的向量组为**正交向量组**，由两两正交的单位向量所构成的向量组为**标准正交向量组**或**正交规范向量组**。

​	例如，$n$维基本单位向量组$\boldsymbol\varepsilon_1,\boldsymbol\varepsilon_2,\cdots,\boldsymbol\varepsilon_n$是标准正交向量组。

​	正交向量组是线性无关的。

​	向量空间由两两正交的非零向量所构成的基为**正交基**，由两两正交的单位向量所构成的基为**标准正交基**或**正交规范基**。

#### Schmidt正交化方法

​	Schmidt正交化方法给出了由一个线性无关的向量组得到其生成的向量空间的标准正交向量组的一般化方法。

​	要将向量组$\boldsymbol\alpha_1,\boldsymbol\alpha_2,\cdots,\boldsymbol\alpha_s$改造成标准向量组，需进行两步：正交化、单位化。

​		$\begin{align*}
\boldsymbol\beta_1&=\boldsymbol\alpha_1\\
\boldsymbol\beta_2&=\boldsymbol\alpha_2-\dfrac{\langle\boldsymbol\alpha_2,\boldsymbol\beta_1\rangle}{\|\boldsymbol\beta_1\|^2}\boldsymbol\beta_1\\
\boldsymbol\beta_3&=\boldsymbol\alpha_3-\dfrac{\langle\boldsymbol\alpha_3,\boldsymbol\beta_2\rangle}{\|\boldsymbol\beta_2\|^2}\boldsymbol\beta_2-\dfrac{\langle\boldsymbol\alpha_3,\boldsymbol\beta_1\rangle}{\|\boldsymbol\beta_1\|^2}\boldsymbol\beta_1\\
&\vdots\\
\boldsymbol\beta_s&=\boldsymbol\alpha_s-\dfrac{\langle\boldsymbol\alpha_s,\boldsymbol\beta_{s-1}\rangle}{\|\boldsymbol\beta_{s-1}\|^2}\boldsymbol\beta_{s-1}-\cdots-\dfrac{\langle\boldsymbol\alpha_s,\boldsymbol\beta_1\rangle}{\|\boldsymbol\beta_1\|^2}\boldsymbol\beta_1
\end{align*}$

​	$\boldsymbol\beta_1,\boldsymbol\beta_2,\cdots,\boldsymbol\beta_s$为原向量组生成空间的一组正交基，下面对其进行单位化。
​		$\begin{align*}
\boldsymbol\gamma_1&=\dfrac{\boldsymbol\beta_1}{\|\boldsymbol\beta_1\|}\\
\boldsymbol\gamma_2&=\dfrac{\boldsymbol\beta_2}{\|\boldsymbol\beta_2\|}\\
&\vdots\\
\boldsymbol\gamma_s&=\dfrac{\boldsymbol\beta_s}{\|\boldsymbol\beta_s\|}\\
\end{align*}$

​	$\boldsymbol\gamma_1,\boldsymbol\gamma_2,\cdots,\boldsymbol\gamma_s$即为原向量组生成空间的一组标准正交基。

### 2.6.3 正交矩阵

#### 正交矩阵

​	如果$n$阶实矩阵$\boldsymbol A$满足$\boldsymbol A^\mathrm T\boldsymbol A=\boldsymbol E$，则称$\boldsymbol A$是正交矩阵，简称正交阵。

​	实矩阵$\boldsymbol A$是正交阵当且仅当$\boldsymbol A$是可逆的，且$\boldsymbol A^\mathrm T=\boldsymbol A^{-1}$.

​	$n$阶实矩阵$\boldsymbol A$是正交矩阵当且仅当$\boldsymbol A$的行向量组是$\mathbb{R}^n$的标准正交基，当且仅当$\boldsymbol A$的列向量组是$\mathbb{R}^n$的标准正交基。

#### 正交矩阵的性质

​	若$\boldsymbol A$是正交阵，$|\boldsymbol A|=\pm1$.

​	若$\boldsymbol A$是正交阵，则$\boldsymbol A^\mathrm T=\boldsymbol A^{-1}$，且也为正交阵。

​	若$\boldsymbol A,\boldsymbol B$为同阶正交阵，则$\boldsymbol{AB}$也为正交阵。



