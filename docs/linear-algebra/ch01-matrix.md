# 行列式

## 1.1 矩阵的基本概念

### 1.1.1 矩阵的概念

​	由$m\times n$个数$a_{ij}(i=1,2,\cdots,m; j=1,2,\cdots,n)$按一定次序排列成$m$行$n$列的表：
$$
\boldsymbol{A}=\begin{pmatrix}
a_{11} & a_{12} & \cdots & a_{1n} \\
a_{21} & a_{22} & \cdots & a_{2n} \\
\vdots & \vdots & \ddots & \vdots \\
a_{m1} & a_{m2} & \cdots & a_{mn}
\end{pmatrix}_{m\times n}
$$

​	可记作$(a_{ij})$，$(a_{ij})_{m\times n}$或$\boldsymbol{A}_{m\times n}$.

​	对于元素$a_{ij}$，$i$和$j$分别叫做$a_{ij}$的**行指标**和**列指标**。

​	元素都是实数的矩阵称为**实矩阵**，元素是复数的矩阵称为**复矩阵**。

### 1.1.2 几种特殊矩阵

#### 方阵

​	行列数相同，即$m=n$的矩阵为方阵。

​	方阵从左上到右下为**主对角线**，从右上到左下为**次对角线**。非方阵的矩阵没有对角线。

#### 向量

​	一个$1$行$n$列的矩阵$\boldsymbol{A}_{1\times n}=\begin{pmatrix}
1 & 2 & 3
\end{pmatrix}$可以称为一个**行矩阵**或**行向量**。

​	一个$m$行$1$列的矩阵$\boldsymbol{A}_{m\times 1}\begin{pmatrix}1 \\2 \\3\end{pmatrix}$可以称为一个**列矩阵**或**列向量**。

#### 零矩阵

​	一个矩阵的所有元素均为0，称为零矩阵，记为$\boldsymbol{O}$.

​	两个零矩阵不一定相等，因为类型不一定相同，如$\boldsymbol{O}_{1\times 2}\neq\boldsymbol{O}_{2\times 3}$.

#### 对角、数量、单位矩阵

​	除主对角线外其它位置元素都为0的矩阵称为对角矩阵：

​		$
\boldsymbol{\varLambda}=
\begin{pmatrix}
​	a_{11} & & & \\
​	& a_{22} & & \\
​	& & ... & \\
​	& & & a_{mn}
\end{pmatrix}
= diag(a_{11},a_{22},...,a_{mn})
$

​	这些位置上的数字都相同，称为数量矩阵：

​		$\boldsymbol{A}=\begin{pmatrix}a & & & \\ & a & & \\ & & \ldots & \\ & & & a\end{pmatrix}=diag(a,a,\ldots,a)$

​	这些位置上的数字都为1，称为单位矩阵：

​		$
\boldsymbol{E}_n=\boldsymbol I_n=\begin{pmatrix}
1 & & & \\
& 1 & & \\
& & ... & \\
& & & 1
\end{pmatrix}_{n\times n}=diag(1,1,...,1)
$，也可写作$\boldsymbol{E}$或$\boldsymbol{I}$.

#### 三角矩阵

​	若一个方阵的主对角线下（上）面的元素全为零，则此矩阵称为上（下）三角矩阵。

​	E.g. 上三角矩阵 $\pmatrix{1&2&3\\0&4&5\\0&0&6}$	下三角矩阵 $\pmatrix{1&0&0\\2&3&0\\4&5&6}$

#### 行列阶梯矩阵

​	若有一个矩阵$\boldsymbol{A}=(a_{ij})_{m\times n}$中各非零行的非零首元的列指标随着行指标的增大而严格增大，若有零行零行均在非零行下方，则此矩阵称为行列阶梯矩阵。

​		E.g. $\pmatrix{1&2&0&1\\0&0&3&5\\0&0&0&0}$

#### 行最简形矩阵

​	若有一个行列阶梯矩阵的每个非零行的非零首元均为1，并且此非零首元所在列的其余元素均为零，则此矩阵称为行最简形矩阵。

​		E.g. $\pmatrix{1&-1&0&1\\0&0&1&3\\0&0&0&0}$



## 1.2 矩阵的基本运算

### 1.2.1 矩阵的线性运算

#### 矩阵关系

​	**同型矩阵**：两个矩阵的行数和列数都相等。

​		$\boldsymbol{A}=(a_{ij})_{m\times n}$，$\boldsymbol{B}=(b_{ij})_{m\times n}$，$\boldsymbol{AB}$为同型矩阵。

​	**矩阵相等**：两个同型矩阵的对应位置的元素均相等。

​		$a_{ij}=b_{ij}$，$\boldsymbol{AB}$矩阵相等，记为$\boldsymbol{A}=\boldsymbol{B}$.

#### 矩阵加法

​	类型相的矩阵才能相加，矩阵的相加即对应位置元素相加。

​	设矩阵$\boldsymbol A=(a_{ij})_{m\times n}$，$\boldsymbol B=(b_{ij})_{m\times n}$，$\boldsymbol C=\boldsymbol A+\boldsymbol B=(a_{ij}+b_{ij})_{m\times n}$.

​	将$-\boldsymbol A=(-a_{ij})_{m\times n}$称为$\boldsymbol A$的负矩阵，$\boldsymbol A+(-\boldsymbol A)=\boldsymbol O$.

​	矩阵加法具有交换律、结合律。

​	任何矩阵加零矩阵$\boldsymbol O$后不变。

#### 矩阵数乘

​	数乘$k$即所有元素乘以系数$k$。

​	设矩阵$\boldsymbol A=(a_{ij})_{m\times n}$，$k\boldsymbol A=(ka_{ij})_{m\times n}$.

​	数乘的性质：

​		$(k+l)\boldsymbol A=k\boldsymbol A+l\boldsymbol A$

​		$k(\boldsymbol A+\boldsymbol B)=k\boldsymbol A+k\boldsymbol B$

​		$k(l\boldsymbol A)=(kl)\boldsymbol A$

​		$1\boldsymbol A=\boldsymbol A$

### 1.2.2 矩阵的乘法

#### 矩阵相乘

​	只有左边矩阵$\boldsymbol{A}$的列数等于右边矩阵$\boldsymbol{B}$的行数时，乘积$\boldsymbol{AB}$才有意义。

​	两个矩阵相乘，结果矩阵的行数为左边矩阵的行数、列数为右边矩阵的列数。

​	设矩阵$\boldsymbol{A}=(a_{ik})_{m\times s}$，$\boldsymbol{B}=(b_{kj})_{s\times n}$，$\boldsymbol{C}=\boldsymbol{AB}=(c_{ij})_{m\times n}$，其中
$$
c_{ij}=\sum_{k=1}^sa_{ik}b_{kj}.
$$
​	$\boldsymbol{A}_{m\times s}\boldsymbol{B}_{s\times n}=\boldsymbol{C}_{m\times n}$，**“中间相等，取两头”**。

#### 运算律

​	**结合律**：$(\boldsymbol{AB})\boldsymbol{C}=\boldsymbol{A}(\boldsymbol{BC})$.

​	**分配律**：$\boldsymbol{A}(\boldsymbol{B}+\boldsymbol{C})=\boldsymbol{AB}+\boldsymbol{AC}$，$(\boldsymbol B+\boldsymbol C)\boldsymbol A=\boldsymbol{BA}+\boldsymbol{CA}$.

​	**数乘系数位置可变**：$k(\boldsymbol{AB})=(k\boldsymbol A)\boldsymbol B=\boldsymbol A(k\boldsymbol B)$.

​	**没有交换律**。

​	$\boldsymbol{AB}=\boldsymbol{O}$，**不能**推出$\boldsymbol{A}=\boldsymbol{O}$或$\boldsymbol{B}=\boldsymbol{O}$. 两非零矩阵的乘积也可能是零矩阵。

#### 可交换

​	如果$\boldsymbol{AB}=\boldsymbol{BA}$，我们称$\boldsymbol A$和$\boldsymbol B$可交换。

​	当$\boldsymbol{A}$，$\boldsymbol{B}$为同阶对角矩阵时，有$\boldsymbol{AB}=\boldsymbol{BA}$.

​	$\boldsymbol{AB}=\boldsymbol{A}+\boldsymbol{B}$，则$\boldsymbol{BA}=\boldsymbol{A}+\boldsymbol{B}$.
​		证明：$\because \boldsymbol{AB}=\boldsymbol{A}+\boldsymbol{B}$，$\therefore \boldsymbol{AB}-\boldsymbol{A}-\boldsymbol{B}+\boldsymbol{E}=\boldsymbol{E}$，
​			$\therefore(\boldsymbol{A}-\boldsymbol{E})(\boldsymbol{B}-\boldsymbol{E})=\boldsymbol{E}$，$\therefore\boldsymbol{A}-\boldsymbol{E}$ 可逆且$(\boldsymbol{A}-\boldsymbol{E})^{-1}=\boldsymbol{B}-\boldsymbol{E}\\$.

​	矩阵相乘可交换的情况：

​		$\boldsymbol{A}$，$\boldsymbol{B}$为同阶对角矩阵

​		$\boldsymbol{A}$，$\boldsymbol{B}$中有一个为数量矩阵

​		$\boldsymbol{A}$与$\boldsymbol{A}^*$、$\boldsymbol{A}$与$\boldsymbol{A}^{-1}$

#### 乘特殊矩阵

​	左乘或右乘零矩阵，结果得零矩阵。

​	左乘或右乘单位矩阵，结果不变。

#### 乘对角矩阵

​	左乘对角矩阵，相当于每一行乘以对应元素；右乘对角矩阵，相当于每一列乘以对应元素。
$$
\begin{pmatrix}d_1 & & & \\& d_2 & & \\& & \ddots & \\& & & d_m\end{pmatrix}\begin{pmatrix}
a_{11} & a_{12} & \ldots & a_{1n} \\ 
a_{21} & a_{22} & \ldots & a_{2n} \\
\vdots & \vdots & \ddots & \vdots \\
a_{m1} & a_{m2} & \ldots & a_{mn}
\end{pmatrix}
=\begin{pmatrix}
d_1a_{11} & d_1a_{12} & \ldots & d_1a_{1n} \\ 
d_2a_{21} & d_2a_{22} & \ldots & d_2a_{2n} \\
\vdots & \vdots & \ddots & \vdots \\
d_ma_{m1} & d_ma_{m2} & \ldots & d_ma_{mn}
\end{pmatrix},
$$

$$
\begin{pmatrix}
a_{11} & a_{12} & \ldots & a_{1n} \\ 
a_{21} & a_{22} & \ldots & a_{2n} \\
\vdots & \vdots & \ddots & \vdots \\
a_{m1} & a_{m2} & \ldots & a_{mn}
\end{pmatrix}
\begin{pmatrix}d_1 & & & \\& d_2 & & \\& & \ddots & \\& & & d_m\end{pmatrix}
=\begin{pmatrix}
d_1a_{11} & d_2a_{12} & \ldots & d_ma_{1n} \\ 
d_1a_{21} & d_2a_{22} & \ldots & d_ma_{2n} \\
\vdots & \vdots & \ddots & \vdots \\
d_1a_{m1} & d_2a_{m2} & \ldots & d_ma_{mn}
\end{pmatrix}.
$$

​	特别的，若$\boldsymbol{A}$与$\boldsymbol{B}$为同阶对角矩阵，其乘积$\boldsymbol{AB}$仍为对角矩阵，且有
$$
\pmatrix{a_{11}&&\\&\ddots&\\&&a_{nn}}\pmatrix{b_{11}&&\\&\ddots&\\&&b_{nn}}=\pmatrix{a_{11}b_{11}&&\\&\ddots&\\&&a_{nn}b_{nn}}.
$$

#### 矩阵的方幂

​	设$k\ge2$，定义$\boldsymbol{A}^k=\underbrace{\boldsymbol{A}\cdot\boldsymbol{A}\cdot\boldsymbol{A}\cdot\ldots\cdot\boldsymbol{A}}_{k个}$，称为$\boldsymbol{A}$的$k$次幂。要求$\boldsymbol{A}$为方阵。

​	定义$\boldsymbol{A}^0=\boldsymbol{E}$.

​	$\boldsymbol{A}$的方幂总是和$\boldsymbol{A}$类型相同的方阵。

​	$\boldsymbol{A}^k\cdot\boldsymbol{A}^l=\boldsymbol{A}^{k+l}$

​	$(\boldsymbol{A}^k)^l=\boldsymbol{A}^{kl}$.

​	$(\boldsymbol{AB})^k$与$\boldsymbol{A}^k\boldsymbol{B}^k$未必相等。原因：无交换律。

#### 矩阵多项式

​	$f(x)=a_mx^m+a_{m-1}x^{m-1}+\ldots+a_1x+a_0$称为关于$x$的$m$次多项式（$a_m\neq0$）。

​	定义$f(\boldsymbol{A})=a_m\boldsymbol{A}^m+a_{m-1}\boldsymbol{A}^{m-1}+\ldots+a_0\boldsymbol{E}$，称为矩阵$\boldsymbol{A}$的$m$次多项式（$a_m\neq0$）。

​	$\boldsymbol A^k$与$\boldsymbol A^l$、$\boldsymbol A^k$与$\boldsymbol E$都是可交换的，故矩阵多项式也可交换，即$\varphi(\boldsymbol A)f(\boldsymbol A)=f(\boldsymbol A)\varphi(\boldsymbol A)$.


​	$\boldsymbol{B}=f(\boldsymbol{A})$，则$\boldsymbol{AB}=\boldsymbol{BA}$.

​	$\boldsymbol{B}=f(\boldsymbol{A})$，$\boldsymbol{C}=g(\boldsymbol{A})$，则$\boldsymbol{BC}=\boldsymbol{CB}$.

​	当$\boldsymbol{AB}=\boldsymbol{BA}$时，有二项式定理$(\boldsymbol A+\boldsymbol B)^n=\sum_{i=0}^n\mathrm{C}_n^i\boldsymbol{A}^iB^{n-i}$.

### 1.2.3 矩阵的转置

#### 转置

​	若$\boldsymbol{A}_{m\texttimes n}=\begin{pmatrix}a_{11}&\ldots&a_{1n}\\\vdots&\ddots&\vdots\\a_{m1}&\ldots&a_{mn}\end{pmatrix}_{m\texttimes n}$，记$\boldsymbol{A}^\mathrm{T}=\begin{pmatrix}a_{11}&\ldots&a_{m1}\\\vdots&\ddots&\vdots\\a_{1n}&\ldots&a_{mn}\end{pmatrix}_{n\texttimes m}$，称为矩阵的转置。

​	原来的行成为现在的列，原来的列成为现在的行。

#### 转置的性质

​	$(\boldsymbol{A}^\mathrm{T})^\mathrm{T}=\boldsymbol{A}$

​	$(\boldsymbol{A}+\boldsymbol{B})^\mathrm{T}=\boldsymbol{A}^\mathrm{T}+\boldsymbol{B}^\mathrm{T}$

​	$(k\boldsymbol{A})^\mathrm{T}=k\boldsymbol{A}^\mathrm{T}$

​	$(\boldsymbol{AB})^\mathrm{T}=\boldsymbol{B}^\mathrm{T}\boldsymbol{A}^\mathrm{T}$

#### 对称矩阵与反对称矩阵

​	满足$\boldsymbol{A}^\mathrm{T}=\boldsymbol{A}$的矩阵叫对称矩阵，关于主对角线对称的数字相同。

​		E.g.$\begin{pmatrix}1&1&2\\1&5&4\\2&4&8\end{pmatrix}$.

​	满足$\boldsymbol{A}^\mathrm{T}=-\boldsymbol{A}$的矩阵叫反对称矩阵，关于主对角对称的数字相反，主对角线上数字均为0。

​		E.g.$\begin{pmatrix}0&1&2\\-1&0&-4\\-2&4&0\end{pmatrix}$.

​	任何一个$n$阶方阵都可以表示成一个对称矩阵与一个反对称矩阵之和。
$$
\boldsymbol{A}=\dfrac{1}{2}(\boldsymbol{A}+\boldsymbol{A}^T)+\dfrac{1}{2}(\boldsymbol{A}-\boldsymbol{A}^\mathrm{T})
$$
​		$\left[\dfrac{1}{2}(\boldsymbol{A}+\boldsymbol{A}^\mathrm{T})\right]^\mathrm{T}=\dfrac{1}{2}[\boldsymbol{A}^\mathrm{T}+(\boldsymbol{A}^\mathrm{T})^\mathrm{T}]=\dfrac{1}{2}(\boldsymbol{A}+\boldsymbol{A}^\mathrm{T})$，为对称矩阵；

​		$\left[\dfrac{1}{2}(\boldsymbol{A}-\boldsymbol{A}^\mathrm{T})\right]^\mathrm{T}=\dfrac{1}{2}[\boldsymbol{A}^\mathrm{T}-(\boldsymbol{A}^\mathrm{T})^\mathrm{T}]=-\dfrac{1}{2}(\boldsymbol{A}-\boldsymbol{A}^\mathrm{T})$，为反对称矩阵。

​	对称矩阵的逆矩阵仍为对称矩阵，即若$\boldsymbol{A}^\mathrm{T}=\boldsymbol{A}$，则$(\boldsymbol{A}^{-1})^\mathrm{T}=\boldsymbol{A}^{-1}$.



## 1.3 分块矩阵

### 1.3.1 基本概念

​	E.g. $\boldsymbol{A}=\begin{pmatrix}1&2&1&0\\0&1&0&1\\0&0&2&1\\0&0&0&3\end{pmatrix}=\left(\begin{array}{cc:cc}1 & 2 & 1 & 0 \\ 0 & 1 & 0 & 1 \\\hdashline 0 & 0 & 2 & 1 \\ 0 & 0 & 0 & 3 \end{array}\right)=\begin{pmatrix}\boldsymbol{A}_1 & \boldsymbol{E}_2 \\ \boldsymbol{O}_2 & \boldsymbol{A}_2\end{pmatrix}$，

​	其中$\boldsymbol{A}_1=\pmatrix{1&2\\0&1}$，$\boldsymbol{A}_2=\pmatrix{2&1\\0&3}$.

​	用一些横线和纵线把矩阵$\boldsymbol{A}$分成$s\times t$个“小矩阵”，得到的形如$\begin{pmatrix}\boldsymbol A_{11} & \ldots & \boldsymbol A_{1t} \\ \vdots & \ddots &\vdots \\ \boldsymbol A_{s1} & \ldots & \boldsymbol A_{st}\end{pmatrix}$的矩阵，这种形式的矩阵称为分块矩阵。

### 1.3.2 常见分块矩阵

#### 按列分块

​	$\boldsymbol{A}_{m\times n}=(\boldsymbol{\alpha}_1,\space \ldots,\space\boldsymbol{\alpha}_n)$，其中$\boldsymbol{\alpha}_j$称为$\boldsymbol{A}$的列向量。

#### 按行分块

​	$\boldsymbol{B}_{m\times n}=\pmatrix{\boldsymbol{\beta}_1\\\vdots\\\boldsymbol{\beta}_m}$，其中$\boldsymbol{\beta}_i$称为$\boldsymbol{B}$的行向量。

#### 分块对角矩阵

​	若分块矩阵主对角线上都是方阵，对角线之外均为零矩阵，则称为一个分块对角矩阵。

### 1.3.3 基本运算

#### 分块矩阵的加法

​	分块矩阵$\boldsymbol{A}=(\boldsymbol{A}_{kl})_{s\times t}$与$\boldsymbol{B}=(\boldsymbol{B}_{kl})_{s\times t}$的对应子块$\boldsymbol{A}_{kl}$和$\boldsymbol{B}_{kl}$均为同型矩阵时可以相加，且有$\boldsymbol A+\boldsymbol B=(\boldsymbol A_{kl}+\boldsymbol B_{kl})_{s\times t}$.

#### 分块矩阵的数乘

​	$\lambda$是一个数，$\lambda\boldsymbol{A}=(\lambda\boldsymbol{A}_{kl})_{s\times t}$.

#### 分块矩阵的乘法

​	两个分块矩阵和分块矩阵的每个小块都要满足矩阵能够相乘的条件，即左矩阵的列数=右矩阵的行数。若左矩阵列的划分和右矩阵行的划分匹配，分块矩阵可以相乘并应用普通矩阵相乘的规则。

​	设矩阵$\boldsymbol{A}=(\boldsymbol{A}_{ij})_{r\times s}$与$\boldsymbol{B}=(\boldsymbol{B}_{jk})_{s\times t}$，$\boldsymbol{C}=\boldsymbol{AB}=(\boldsymbol C_{ik})$，其中
$$
\boldsymbol C_{ik}=\sum_{m=1}^s\boldsymbol A_{im}\boldsymbol B_{mk}.
$$

#### 分块矩阵的转置

​	$\boldsymbol A=\pmatrix{\boldsymbol A_{11}&\boldsymbol A_{12}&\ldots&\boldsymbol A_{1t}\\\boldsymbol A_{21}&\boldsymbol A_{22}&\ldots&\boldsymbol A_{2t}\\\vdots&\vdots&\ddots&\vdots\\\boldsymbol A_{s1}&\boldsymbol A_{s2}&\ldots&\boldsymbol A_{st}}$，$\boldsymbol A^\mathrm{T}=\pmatrix{\boldsymbol A_{11}^\mathrm{T}&\boldsymbol A_{21}^\mathrm{T}&\ldots&\boldsymbol A_{s1}^\mathrm{T}\\\boldsymbol A_{12}^\mathrm{T}&\boldsymbol A_{22}^\mathrm{T}&\ldots&\boldsymbol A_{s2}^\mathrm{T}\\\vdots&\vdots&\ddots&\vdots\\\boldsymbol A_{1t}^\mathrm{T}&\boldsymbol A_{2t}^\mathrm{T}&\ldots&\boldsymbol A_{st}^\mathrm{T}}$.

​	要将分块转置，也要将分块换成它自身的转置。



## 1.4 初等变换与初等矩阵

### 1.4.1 初等变换

#### 线性方程组

​	有线性方程组$\begin{cases}x+2y=1 \\ 3x+4y=2,\end{cases}$

​	可写作$\begin{pmatrix}x+2y\\3x+4y\end{pmatrix}=\begin{pmatrix}1\\2\end{pmatrix}$，即$\begin{pmatrix}1&2\\3&4\end{pmatrix}\begin{pmatrix}x\\y\end{pmatrix}=\begin{pmatrix}1\\2\end{pmatrix}$.

​	令$\boldsymbol{A}=\begin{pmatrix}1&2\\3&4\end{pmatrix}$，$\boldsymbol{X}=\begin{pmatrix}x\\y\end{pmatrix}$，$\boldsymbol{\beta}=\begin{pmatrix}1\\2\end{pmatrix}$，则方程组可记为$\boldsymbol{AX}=\boldsymbol{\beta}$.	——**方程组的矩阵形式**

​	还可写作$x\begin{pmatrix}1\\3\end{pmatrix}+y\begin{pmatrix}2\\4\end{pmatrix}=\begin{pmatrix}1\\2\end{pmatrix}.$ 令$\boldsymbol{\alpha_1}=\begin{pmatrix}1\\3\end{pmatrix}$，$\boldsymbol{\alpha_2}=\begin{pmatrix}2\\4\end{pmatrix}$，$\boldsymbol{\beta}=\begin{pmatrix}1\\2\end{pmatrix}$，则方程组可记为$x\boldsymbol{\alpha_1}+y\boldsymbol{\alpha_2}=\boldsymbol{\beta}$.	——**方程组的向量形式**

​	解线性方程组的方法：高斯消元。

#### 初等变换

​	来源于解线性方程组的高斯消元法。

​	初等变换分为**初等行变换**和**初等列变换**，包含**对换变换**、**倍乘变换**、**倍加变换**。	

​	**对换变换**：$\boldsymbol{A}_{m\texttimes n} \xrightarrow{r_i\leftrightarrow r_j} \boldsymbol{B}_{m\texttimes n}$，$\boldsymbol{A}_{m\texttimes n} \xrightarrow{c_i\leftrightarrow c_j} \boldsymbol{B}_{m\texttimes n}$.

​	**倍乘变换**：$\boldsymbol{A}_{m\texttimes n} \xrightarrow{kr_i} \boldsymbol{B}_{m\texttimes n}$，$\boldsymbol{A}_{m\texttimes n} \xrightarrow{kc_i} \boldsymbol{B}_{m\texttimes n}$. **不能用0倍乘**。

​	**倍加变换**：$\boldsymbol{A}_{m\texttimes n} \xrightarrow{r_i+kr_j} \boldsymbol{B}_{m\texttimes n}$，$\boldsymbol{A}_{m\texttimes n} \xrightarrow{c_i+kc_j} \boldsymbol{B}_{m\texttimes n}$.

#### 矩阵等价

​	如果矩阵$\boldsymbol A$经有限次初等行变换变成矩阵$\boldsymbol B$，就称矩阵$\boldsymbol A$与$\boldsymbol B$行等价，矩阵$\boldsymbol A$经有限次初等列变换变成矩阵$\boldsymbol B$，就称矩阵$\boldsymbol A$与$\boldsymbol B$列等价。

​	若矩阵$\boldsymbol A$经有限次初等行变换变成矩阵$\boldsymbol B$，就称矩阵$\boldsymbol A$与$\boldsymbol B$行等价，记作$\boldsymbol A\stackrel{r}{\cong}\boldsymbol B$.

​	若矩阵$\boldsymbol A$经有限次初等列变换变成矩阵$\boldsymbol B$，就称矩阵$\boldsymbol A$与$\boldsymbol B$列等价，记作$\boldsymbol A\stackrel{c}{\cong}\boldsymbol B$.

​	若矩阵$\boldsymbol{A}$经过有限次初等变换化为$\boldsymbol{B}$，则称$\boldsymbol{A}$与$\boldsymbol{B}$等价，记作$\boldsymbol A\cong\boldsymbol B$.

​	矩阵等价的性质：

​		**反身性** $\boldsymbol A\cong\boldsymbol A$.

​		**对称性** $\boldsymbol A\cong\boldsymbol B$则$\boldsymbol B\cong\boldsymbol A$.

​		**传递性** $\boldsymbol A\cong\boldsymbol B$，$\boldsymbol B\cong\boldsymbol C$，则$\boldsymbol A\cong\boldsymbol C$.

​	判断矩阵等价，最好先把矩阵用初等变换化成一种“标准形式”，然后再判断是否等价。

#### 用初等变换化简矩阵

​	等价标准形：$\boldsymbol{E}_{m\texttimes n}^{(r)}=\begin{pmatrix}\boldsymbol{E}_{r\texttimes r} & \boldsymbol{O}_{r\texttimes(n-r)}\\\boldsymbol{O}_{(m-r)\texttimes r} & \boldsymbol{O}_{(m-r)\texttimes(n-r)}\end{pmatrix}$.

​	任何一个矩阵都可以经过有限次初等行变换，化为行列阶梯矩阵（不唯一）。

​	任何一个矩阵都可以通过有限次初等行变换，化为行最简形矩阵（唯一）。

​	任何一个矩阵都可以经过有限次初等变换化为等价标准形（唯一）。

### 1.4.2 初等矩阵

#### 三种初等矩阵

​	**对换矩阵**：交换单位矩阵的第$i$行（列）与第$j$行（列）得到的矩阵，

​		$\boldsymbol E(i,j)=\pmatrix{1&&&&&&&&&&\\&\ddots&&&&&&&&&\\&&1&&&&&&&&\\&&&0&\ldots&\ldots&\ldots&\stackrel{i行j列}{1}&&&\\&&&\vdots&1&&&\vdots&&&\\&&&\vdots&&\ddots&&\vdots&&&\\&&&\vdots&&&1&\vdots&&&\\&&&\stackrel{j行i列}{1}&\ldots&\ldots&\ldots&0&&&\\&&&&&&&&1&&\\&&&&&&&&&\ddots&\\&&&&&&&&&&1}$.

​	**倍乘矩阵**：用不为零的数$k$去乘单位矩阵的第$i$行（列）得到的矩阵，

​		$\boldsymbol E(i(k))=\pmatrix{1&&&&&&\\&\ddots&&&&&\\&&1&&&&\\&&&\stackrel{i行i列}{k}&&&\\&&&&1&&\\&&&&&\ddots&\\&&&&&&1}$.

​	**倍加矩阵**：将单位矩阵的第$j$行（$i$列）乘以常数$k$加到第$i$行（$j$列）得到的矩阵，

​		$\boldsymbol E(i,j(k))=\pmatrix{1&&&&&&\\&\ddots&&&&&\\&&1&\ldots&\stackrel{i行j列}{k}&&\\&&&\ddots&\vdots&&\\&&&&1&&\\&&&&&\ddots&\\&&&&&&1}$.

#### 初等矩阵与初等变换

​	对换变换 $\boldsymbol{A} \xrightarrow{r_i\leftrightarrow r_j} \boldsymbol{B}$，则$\boldsymbol B=\boldsymbol E(i,j)\boldsymbol A$. $\boldsymbol{A} \xrightarrow{c_i\leftrightarrow c_j} \boldsymbol{B}$，则$\boldsymbol B=\boldsymbol A \boldsymbol E(i,j)$.

​	倍加变换 $\boldsymbol{A} \xrightarrow{kr_i} \boldsymbol{B}$，则$\boldsymbol B=\boldsymbol E(i(k))\boldsymbol A$. $\boldsymbol{A} \xrightarrow{kc_i} \boldsymbol{B}$，则$\boldsymbol B=\boldsymbol A \boldsymbol E(i(k))$.

​	倍乘变换 $\boldsymbol A\xrightarrow{r_i+kr_j}\boldsymbol B$，则$\boldsymbol B=\boldsymbol E(i,j(k))\boldsymbol A$. $\boldsymbol A\xrightarrow{c_i+kc_j}\boldsymbol B$，则$\boldsymbol B=\boldsymbol A \boldsymbol E(i,j(k))$.

​	初等行变换相当于把相应的初等矩阵乘在左边，初等列变换相当于把相应的初等矩阵乘在右边。

​	**“左乘行，右乘列”**。

#### 标准分解

​	当且仅当$\boldsymbol P_s\ldots\boldsymbol P_2\boldsymbol P_1\boldsymbol A=\boldsymbol B$，$\boldsymbol A$与$\boldsymbol B$行等价；当且仅当$\boldsymbol A\boldsymbol Q_1\boldsymbol Q_2\ldots\boldsymbol Q_t=\boldsymbol B$，$\boldsymbol A$与$\boldsymbol B$列等价。$\boldsymbol{PQ}$均为初等矩阵。

​	当且仅当$\boldsymbol P_s\ldots\boldsymbol P_2\boldsymbol P_1\boldsymbol A\boldsymbol Q_1\boldsymbol Q_2\ldots\boldsymbol Q_t=\boldsymbol B$，$\boldsymbol A$与$\boldsymbol B$等价，$\boldsymbol{PQ}$均为初等矩阵。

​	即：$\boldsymbol{PAQ}=\boldsymbol B$，$\boldsymbol{PQ}$均为可逆矩阵。

​	设$\boldsymbol A$的等价标准形为$\boldsymbol E^{(r)}_{m\texttimes n}$，则存在可逆矩阵$\boldsymbol P_{m\texttimes m}$和可逆矩阵$\boldsymbol Q_{n\times n}$，使得$\boldsymbol A=\boldsymbol P\boldsymbol E^{(r)}_{m\texttimes n}\boldsymbol Q$，称为$\boldsymbol A$的标准分解。

​	标准分解**不唯一**。



## 1.5 方阵的逆矩阵

### 1.5.1 逆矩阵的概念

#### 可逆运算

​	设有$n$阶方阵$\boldsymbol A$，存在$n$阶方阵$\boldsymbol B$使得$\boldsymbol{AB}=\boldsymbol{BA}=\boldsymbol{E}_n$，则称$\boldsymbol A$为可逆矩阵，$\boldsymbol B$为$\boldsymbol A$的逆矩阵，记为$\boldsymbol B=\boldsymbol A^{-1}$.

​	可逆矩阵的逆矩阵是**唯一的**。

​	若不存在这样的$\boldsymbol B$，则说$\boldsymbol A$不可逆。

#### 矩阵可逆的判定

​	对角阵可逆当且仅当对角元均不等于$0$.

​	等价标准形矩阵$\boldsymbol{E}^{(r)}_{n\texttimes n}$可逆当且仅当$r=n$.

​	若干个可逆矩阵的乘积矩阵仍然可逆。

#### 矩阵可逆的性质

​	$(\boldsymbol A^{-1})^{-1}=\boldsymbol A$

​	$(\boldsymbol A^\mathrm{T})^{-1}=(\boldsymbol A^{-1})^\mathrm{T}$

​	$(k\boldsymbol A)^{-1}=\dfrac1k\boldsymbol A^{-1}$

​	$(\boldsymbol{AB})^{-1}=\boldsymbol B^{-1}\boldsymbol A^{{-1}}$

### 1.5.2 初等矩阵与可逆矩阵

​	初等矩阵都可逆，初等矩阵的逆矩阵仍然是初等矩阵。

​	方阵$\boldsymbol{A}$可逆，当且仅当$\boldsymbol{A}$可以写成有限个初等矩阵的乘积。

​	若$\boldsymbol{A}$与$\boldsymbol{B}$等价，则$\boldsymbol{A}$可逆当且仅当$\boldsymbol{B}$可逆。

### 1.5.3 用初等变换求逆矩阵

#### 求逆矩阵的方法

1. 用定义

   ​	若$\boldsymbol A\texttimes \boldsymbol B=\boldsymbol E$，或$\boldsymbol B\texttimes\boldsymbol A=\boldsymbol E$，则$\boldsymbol A$可逆，且$\boldsymbol B$是$\boldsymbol A$的逆矩阵。

2. 用初等变换解矩阵方程

   ​	若$\boldsymbol A_{n\times n}\boldsymbol X=\boldsymbol E_{n\times n}$，则$\boldsymbol X=\boldsymbol A^{-1}$.

   ​	若$\boldsymbol X\boldsymbol A_{n\times n}=\boldsymbol E_{n\times n}$，则$\boldsymbol X=\boldsymbol A^{-1}$.

   ​	$(\boldsymbol{A},\boldsymbol{E})\xrightarrow{行变换}(\boldsymbol{E},\boldsymbol{C})$，则$\boldsymbol{A}^{-1}=\boldsymbol{C}$.

   ​	$\pmatrix{\boldsymbol{A}\\\boldsymbol{E}}\xrightarrow{列变换}\pmatrix{\boldsymbol{E}\\\boldsymbol{C}}$，则$\boldsymbol{A}^{-1}=\boldsymbol{C}$.

3. 用伴随矩阵

​	二阶矩阵的逆矩阵公式：$\pmatrix{a&b\\c&d}^{-1}=\dfrac{1}{ad-bc}\pmatrix{d&-b\\-c&a}$

#### 解矩阵方程的方法

​	$\boldsymbol A_{n\times n}\boldsymbol X=\boldsymbol E_{n\times n}$，左右同乘$\boldsymbol{PAX}=\boldsymbol{PE}$.

​	构造分块矩阵$(\boldsymbol A\boldsymbol X,\boldsymbol E)$，可以写作$(\boldsymbol A,\boldsymbol E)$.

​	进行行变换，$\boldsymbol P_1(\boldsymbol A\boldsymbol X,\boldsymbol E)=(\boldsymbol P_1\boldsymbol{AX},\boldsymbol P_1\boldsymbol E)$，$\boldsymbol P_2(\boldsymbol P_1\boldsymbol{AX},\boldsymbol P_1\boldsymbol E)=(\boldsymbol P_2\boldsymbol P_1\boldsymbol A\boldsymbol X,\boldsymbol P_2\boldsymbol P_1\boldsymbol E)$…

​	最终转化为$(\boldsymbol{EX},\boldsymbol C)$的形式，可知$\boldsymbol{EX}=\boldsymbol{C}，\therefore \boldsymbol{X}=\boldsymbol{C}$. 得解。

​	对于方程$\boldsymbol X\boldsymbol A_{n\times n}=\boldsymbol E_{n\times n}$可以用同样的方法：构造分块矩阵$\pmatrix{\boldsymbol X\boldsymbol A \\\boldsymbol E}$，可以写作$\pmatrix{\boldsymbol A\\\boldsymbol E}$.

​	若$(\boldsymbol{AX},\boldsymbol B)\xrightarrow{行变换}(\boldsymbol{CX},\boldsymbol D)$，则$\boldsymbol{AX}=\boldsymbol{B}$与$\boldsymbol{CX}=\boldsymbol{D}$同解；

​	若$\pmatrix{\boldsymbol{XA}\\\boldsymbol B}\xrightarrow{列变换}\pmatrix{\boldsymbol{XC}\\\boldsymbol D}$，则$\boldsymbol{XA}=\boldsymbol B$与$\boldsymbol{XC}=\boldsymbol D$同解。

​	$\boldsymbol X$同样可以省略不写。



## 1.6 方阵的行列式

### 1.6.1 行列式的定义

#### 行列式

​	设方阵$\boldsymbol{A}=\begin{pmatrix}
a_{11} & a_{12} & \cdots & a_{1n} \\
a_{21} & a_{22} & \cdots & a_{2n} \\
\vdots & \vdots & \ddots & \vdots \\
a_{m1} & a_{m2} & \cdots & a_{mn}
\end{pmatrix}$，用记号$\left|\begin{array}
aa_{11} & a_{12} & \cdots & a_{1n} \\
a_{21} & a_{22} & \cdots & a_{2n} \\
\vdots & \vdots & \ddots & \vdots \\
a_{m1} & a_{m2} & \cdots & a_{mn}
\end{array}\right|$表示$\boldsymbol{A}$的行列式，记作$D$，$D_n$，$\det \boldsymbol{A}$或$|\boldsymbol{A}|$.

​	一阶方阵的行列式$|a_{11}|=a_{11}$.

#### 对角线法则

​	$n=2$时，$\left|\begin{array}aa_{11}&a_{12}\\a_{21}&a_{22}\end{array}\right|=a_{11}a_{22}-a_{12}a_{21}$.

​	$n=3$时，$\left|\begin{array}aa_{11}&a_{12}&a_{13}\\a_{21}&a_{22}&a_{23}\\a_{31}&a_{32}&a_{33}\end{array}\right|=\begin{align*}a_{11}a_{22}a_{33}&+a_{12}a_{23}a_{31}+a_{13}a_{21}a_{32}\\-a_{13}a_{22}a_{31}&-a_{12}a_{21}a_{33}-a_{11}a_{23}a_{32}\end{align*}$.

​	行列式中一共有 $n!$ 项，一半的项为正、一半的项为负，每一项都是$n$项相乘。

​	对角线法则适用于二阶行列式和三阶行列式。
#### 高阶行列式

​	**$n$级排列**：由$n$个自然数$1,2,\ldots,n$按任意次序排成一列所得的$n$元数组。注意：$n$级排列不能缺数。

​		$n$级排列一共有$n!$种。

​	**逆序数**：大数排在小数前面的情况总数。如$\tau(2,1,3)=1$，$\tau(3,2,1)=3$.

​		逆序数为偶数的叫**偶排列**，逆序数为奇数的叫**奇排列**。

​		$\tau=0$的排列法为自然排列或标准排列。

​		排列中发生一次对换，排列的奇偶性反转一次。

​		奇排列对换成标准排列的对换次数为奇数，偶排列对换成标准排列的对换次数为偶数。

​	**高阶行列式**
$$
D=\left|\begin{array}
aa_{11} & a_{12} & \cdots & a_{1n} \\
a_{21} & a_{22} & \cdots & a_{2n} \\
\vdots & \vdots & & \vdots \\
a_{n1} & a_{n2} & \cdots & a_{nn}
\end{array}\right|=\sum_{i_1,i_2,\ldots,i_n}(-1)^{\tau(i_1,i_2,\ldots,i_n)}a_{1i_1}a_{2i_2}\ldots a_{ni_n}
$$
​		其中$\begin{align*}\sum_{i_1,i_2,\ldots,i_n}\end{align*}$表示对所有$n$级排列$i_1,i_2,\ldots,i_n$求和，$\tau(i_1,i_2,\ldots,i_n)$是排列的逆序数。

​		行标为标准排列，列标为所有排列情况，符号为列标排列的奇偶性决定。

​		这里是行列式按行展开。操作过程中的行列互换即为按列展开。

​	判断一个式子是否是表达式中的项，充分必要条件是：$i_1,i_2,\ldots,i_n$互不相同，且$j_1,j_2,\ldots,j_n$也互不相同。即$i_1,i_2,\ldots,i_n$和$j_1,j_2,\ldots,j_n$都是$n$级排列。该项的符号是：$(-1)^{\tau(i_1,i_2,\ldots,i_n)+\tau(j_1,j_2,\ldots,j_n)}$.

#### 三角行列式

​	**上三角行列式**：$D_n=\left|\begin{matrix}a_{11}&a_{12}&\ldots&a_{1n}\\0&a_{22}&\ldots &a_{2n}\\\vdots&\vdots&\ddots&\vdots\\0&0&\ldots&a_{nn}\end{matrix}\right|=a_{11}a_{22}\ldots a_{nn}$

​	**下三角行列式**：$D_n=\left|\begin{matrix}a_{11}&0&\ldots&0\\a_{21}&a_{22}&\ldots &0\\\vdots&\vdots&\ddots&\vdots\\a_{n1}&a_{n2}&\ldots&a_{nn}\end{matrix}\right|=a_{11}a_{22}\ldots a_{nn}$

​	**对角形行列式**：$D_n=\left|\begin{matrix}a_{11}&&&\\&a_{22}& &\\&&\ddots&\\&&&a_{nn}\end{matrix}\right|=a_{11}a_{22}\ldots a_{nn}$

​		对角形行列式可视为上三角或下三角的一种。	

​	注意，上三角行列式、下三角行列式、对角形行列式都是关于主对角线两侧的差异。

​	关于次对角线两侧差异的“山寨三角形”，前面需要加上符号项$-1^{\tau(n,n-1,n-2,\ldots,1)}=-1^{\frac{n(n-1)}{2}}$.

​	**次对角线上三角**：$D_n=\left|\matrix{a_{11}&\dots&a_{1(n-1)}&a_{1n}\\a_{21}&\dots&a_{2(n-1)}\\\vdots&&&\\a_{n1}}\right|=(-1)^{\frac{n(n-1)}{2}}a_{1n}a_{2(n-1)}\ldots a_{n1}$

​	**次对角线下三角：**$D_n=\left|\matrix{&&&a_{1n}\\&&a_{2(n-1)}&a_{2n}\\&&\vdots&\vdots\\a_{n1}&a_{n2}&\ldots&a_{nn}}\right|=(-1)^{\frac{n(n-1)}{2}}a_{1n}a_{2(n-1)}\ldots a_{n1}$

#### 初等矩阵的行列式

​	由三角行列式、行列式对换变换的性质可得：

​	$|E(i,j)|=-1$

​	$|E(i(k))|=k$

​	$|E(i,j(k))|=1$

### 1.6.2 行列式的性质

#### 转置

​	$D=|\boldsymbol{A}|$，$\boldsymbol{A}^\mathrm{T}$的行列式也被称为$D$的转置，记为$D^\mathrm{T}$，$D^\mathrm{T}=|\boldsymbol{A}^\mathrm{T}|$.

​	转置不改变行列式的值。$D=D^\mathrm{T}$，即$|\boldsymbol{A}|=|\boldsymbol{A}^\mathrm{T}|$.

​	由转置性质可知行列式中，对行成立的性质对列也一定成立。

#### 对换变换

​	$\boldsymbol{A}$为$n(n\geq2)$阶矩阵，若对$\boldsymbol{A}$进行一次对换变换得到$\boldsymbol{B}$，则$|\boldsymbol{B}|=-|\boldsymbol{A}|$.

#### 倍乘变换

​	一行乘以一个倍数，等于这个数乘以行列式，$\left|\matrix{ka&kb\\a&b}\right|=k\left|\matrix{a&b\\a&b}\right|$.

​	因此，对于$n$阶矩阵$\boldsymbol{A}$有$|k\boldsymbol{A}|=k^n|\boldsymbol{A}|$. 特别地，$|-\boldsymbol{A}|=(-1)^n|\boldsymbol{A}|$.

#### 两行完全相同或成比例

​	若行列式中有两行（列）完全相同，则行列式$D=0$.

​	若行列式有两行（列）对应元素成比例，则行列式$D=0$.

​	若行列式中有零行（列），则行列式$D=0$.

​	通过对换和倍乘的性质可证。

#### 倍加变换

​	将行列式的某一行（列）的$k$倍加到另一行（列）上去，行列式的值不变。

​	由加性和其它性质可证。

#### 分块三角矩阵

​	分块矩阵没有对角线法则！

​	设$\boldsymbol{A}=(a_{ij})_{m\times m}$，$\boldsymbol{B}=(b_{ij})_{n\times n}$，$\boldsymbol{C}=(c_{ij})_{m\times n}$，

​	$\left|\matrix{\boldsymbol{A}&\boldsymbol{C}\\\boldsymbol{O}&\boldsymbol{B}}\right|=|\boldsymbol{A}||\boldsymbol{B}|$，$\left|\matrix{\boldsymbol{A}&\boldsymbol{O}\\\boldsymbol{C}&\boldsymbol{B}}\right|=|\boldsymbol{A}||\boldsymbol{B}|$.

​	$\left|\matrix{\boldsymbol{O}&\boldsymbol{A}\\\boldsymbol{B}&\boldsymbol{O}}\right|=(-1)^{mn}\left|\matrix{\boldsymbol{A}&\boldsymbol{O}\\\boldsymbol{O}&\boldsymbol{B}}\right|=(-1)^{mn}|\boldsymbol{A}|\cdot|\boldsymbol{B}|$.



​	$\left|\matrix{\boldsymbol{A}_1&&&&\\&\boldsymbol{A}_2&&&\\&&\boldsymbol{A}_3&&\\&&&\ddots&\\&&&&\boldsymbol{A}_n}\right|=|\boldsymbol{A}_1|\cdot|\boldsymbol{A}_2|\cdot\ldots\cdot|\boldsymbol{A}_n|$.

#### 行列式加性

​	$\left|\matrix{a+b&c+d\\e&f}\right|=\left|\matrix{a&c\\e&f}\right|+\left|\matrix{b&d\\e&f}\right|$.

#### 乘法定理

​	$|\boldsymbol{AB}|=|\boldsymbol{A}||\boldsymbol{B}|$.

​	$|\boldsymbol{A_1}\ldots\boldsymbol{A_s}|=|\boldsymbol{A_1}|\dots|\boldsymbol{A_s}|$.

#### 行列式的展开

$$
\left|\begin{array}
aa_{11} & a_{12} & \cdots & a_{1n} \\
a_{21} & a_{22} & \cdots & a_{2n} \\
\vdots & \vdots & \ddots & \vdots \\
a_{m1} & a_{m2} & \cdots & a_{mn}
\end{array}\right|=a_{11}\cdot A_{11}+a_{12}\cdot A_{12}+\ldots+a_{1n}\cdot A_{1n}
$$

​	$A_{11}$、$A_{12}$为代数余子式，即第一行的元素与第一行的代数余子式对应相乘再求和。

​	该式称为$n$阶行列式$\det\boldsymbol{A}$按第一行的展开式。

​	**余子式** 把第$i$行、第$j$列都划掉，剩下的$n-1$阶方阵的行列式记作$M_{ij}$，称为$A$的$i$行$j$列余子式。

​	**代数余子式** $A_{ij}=(-1)^{i+j}M_{ij}$，称为A的$i$行$j$列代数余子式。比余子式多出一个符号。

​	**引理**  一个$n$阶行列式，如果其中第$i$行所有元素除$(i,j)$元$a_{ij}$外都为零，那么这行列式等于$a_{ij}$与它的代数余子式的乘积，即$D=a_{ij}A_{ij}$.

​	设$\boldsymbol{A}=(a_{ij})_{n\times n}$为$n$阶矩阵，分别按$i$行、$j$列展开：
$$
|\boldsymbol{A}|=a_{i1}A_{i1}+a_{i2}A_{i2}+\ldots+a_{in}A_{in}=\sum^{n}_{j=1}a_{ij}A_{ij}\\
|\boldsymbol{A}|=a_{1j}A_{1j}+a_{2j}A_{2j}+\ldots+a_{nj}A_{nj}=\sum^n_{i=1}a_{ij}A_{ij}
$$

​	**异乘变零定理** $\boldsymbol{A}=(a_{ij})_{n\times n}$的第$i$行元素与另一行$j$行的代数余子式对应相乘再求和等于$0$，即当$i\neq j$时，
$$
a_{i1}A_{j1}+a_{i2}A_{j2}+\ldots+a_{in}A_{jn}=\sum_{k=1}^{n}a_{ik}A_{jk}=0\\

a_{1i}A_{1j}+a_{2i}A_{2j}+\ldots+a_{ni}A_{nj}=\sum^n_{k=1}a_{ki}A_{kj}=0
$$
​	由行列式对换的性质、按行展开可证。

​	利用克罗内克(Kronecker)符号$\delta_{ij}=\cases{1,\quad i=j,\\0,\quad i\neq j}$，表示关于行列式和代数余子式的重要结论：
$$
\sum_{k=1}^{n}a_{ik}A_{jk}=\delta_{ij}D \\
\sum_{k=1}^{n}a_{ki}A_{kj}=\delta_{ij}D
$$


### 1.6.3 行列式的计算

​	二阶行列式、三阶行列式可用对角线法则计算。

​	计算数字型行列式最常用方法是把行列式化成三角形行列式。

​	化简数字型行列式为上三角行列式的一般步骤：

​		1.  用第一行将第一列的元素都处理为0

​		2.  先处理第1列，再处理第2列，以此类推

​		3.  处理完第1列后第1行不再参与运算

​	计算字母型行列式通常用行列式的性质，有时也用到按一行（列）展开，再利用数学归纳法和递推法。

#### Laplace展开

​	取定行列式的$k$行，在该$k$行中所有的$k$阶子式与对应代数余子式乘积之和等于原行列式的值。

​	E.g.$D=\left|\begin{array}{cc:ccc}1&2&0&0&0\\3&4&0&0&0\\\hdashline1&2&3&4&5\\1&1&1&1&1\\6&6&8&3&1\end{array}\right|$，

​	取定前两行，唯一取得的非零二阶子式为前两列，$D=\left|\matrix{1&2\\3&4}\right|\times(-1)^{1+2+1+2}\left|\matrix{3&4&5\\1&1&1\\8&3&1}\right|$.

#### Vandermonde行列式

$$
D_n=\left|\matrix{1&1&1&\ldots&1\\x_1&x_2&x_3&\ldots&x_n\\x_1^2&x_2^2&x_3^3&\ldots&x_n^2\\\vdots&\vdots&\vdots&\ddots&\vdots\\x_1^{n-1}&x_2^{n-1}&x_3^{n-1}&\ldots&x_n^{n-1}}\right|=\prod_{1\leq i<j\leq n}(x_j-x_i)
$$

​	共$C_n^2=\dfrac{n(n-1)}{2}$项相乘。可由数学归纳法证。

​	E.g. $D_3=\left|\matrix{1&1&1\\x_1&x_2&x_3\\x_1^2&x_2^2& x_3^2}\right|=(x_3-x_1)(x_3-x_2)(x_2-x_1)$.

### 1.6.4 行列式与逆矩阵

#### 方阵可逆性

​	$n$阶方阵$\boldsymbol{A}$可逆，当且仅当数字$|\boldsymbol A|\neq 0$.

​	当$\boldsymbol{A}$可逆且$n\geq 2$时，$\boldsymbol{A}^{-1}=\dfrac{1}{|\boldsymbol{A}|}\boldsymbol{A}^*$，$\boldsymbol A^*$为$\boldsymbol{A}$的伴随矩阵。

#### 伴随矩阵

​	矩阵$\boldsymbol{A}=\pmatrix{a_{11}&a_{12}&\ldots&a_{1n}\\a_{21}&a_{22}&\ldots&a_{2n}\\\vdots&\vdots&\ddots&\vdots\\a_{n1}&a_{n2}&\ldots&a_{nn}}$，称$\boldsymbol{A^*}=\pmatrix{A_{11}&A_{21}&\ldots&A_{n1}\\A_{12}&A_{22}&\ldots&A_{n2}\\\vdots&\vdots&\ddots&\vdots\\A_{1n}&A_{2n}&\ldots&A_{nn}}$为它的伴随矩阵。

​	$A_{11}$是代数余子式。

​	$\boldsymbol A^{-1}=\dfrac{1}{|\boldsymbol A|}\boldsymbol A^*$，$\therefore \boldsymbol A^*=\boldsymbol A^{-1}\times|\boldsymbol A|$.

​	**二阶矩阵的伴随矩阵**：主对角线元素交换，次对角线元素变号。$\boldsymbol{B}=\pmatrix{a&b\\c&d}$，$\boldsymbol B^*=\pmatrix{d&-b\\-c&a}$.

​	$|\boldsymbol A^*|=|\boldsymbol A|^{n-1}$

​	$(\boldsymbol A^*)^{-1}=\dfrac{\boldsymbol A}{|\boldsymbol A|}$

#### 伴随矩阵的性质

​	$\boldsymbol{A}$为$n(n\geq2)$阶矩阵，$\boldsymbol{AA}^*=\boldsymbol{A}^*\boldsymbol{A}=|\boldsymbol{A}|\boldsymbol{E}$.

​	分块对角矩阵$\boldsymbol{A}=\mathrm{diag}(\boldsymbol{A}_1,\boldsymbol{A}_2,\ldots,\boldsymbol{A}_s)$，$\boldsymbol{A}^{-1}=\mathrm{diag}(\boldsymbol{A}_1^{-1},\boldsymbol{A}_2^{-1},\ldots,\boldsymbol{A}_s^{-1})$.

#### Cramer法则

​	一类特殊的线性方程组的求解公式，适用于方程个数等于未知数的个数的情况。

​	设线性方程组$\boldsymbol{A_{n\times n}}\boldsymbol{X_{n\times1}}=\boldsymbol{b_{n\times1}}$，其中$\boldsymbol{A}=(a_{ij})_{n\times n}=(\boldsymbol{\alpha}_1,\ldots,\boldsymbol{\alpha}_n)$，$\boldsymbol{x}=\pmatrix{x_1\\\vdots\\x_n}$，$\boldsymbol{b}=\pmatrix{b_1\\\vdots\\b_n}$，若系数矩阵的行列式$D=|\boldsymbol{A}|\neq0$，则此线性方程组有唯一解：

​	$x_j=\dfrac{D_j}{D}$.

​	其中$D_j=\det(\boldsymbol{\alpha}_1,\ldots,\boldsymbol{\alpha}_{j-1},\boldsymbol{b},\boldsymbol{\alpha}_{j+1},\ldots,\boldsymbol{\alpha}_n)$，$j=1,\ldots,n$. 即$D_j$是用结果矩阵$\boldsymbol{b}$替换系数矩阵中的第$j$列得到的矩阵的行列式。

​	当$n$比较大时（例如$n\geq4$时），一般不用Cramer法则求解具体的线性方程组，而是用$(\boldsymbol{A},\boldsymbol{b})\xrightarrow{行变换}$求解。



## 1.7 矩阵的秩

### 1.7.1 基本概念

#### 矩阵的子式

​	从$\boldsymbol{A}_{m\times n}$中任取$k$行$k$列$(k\leq\min\{m,n\})$，这些行列相交处的元素按原顺序重组为$k$阶行列式，称为矩阵$\boldsymbol{A}$的$k$阶子式。矩阵$\boldsymbol{A}_{m\times n}$一共有$C_m^kC_n^k$个$k$阶子式。

​	子式是行列式，是数字。

#### 矩阵的秩

​	矩阵$\boldsymbol{A}_{m\times n}$的等价标准形$\boldsymbol{E}_{m\times n}^{(r)}$唯一确定，$r$称为矩阵的秩，记为$\mathrm r$。即$\mathrm r\left(\boldsymbol{E}_{m\times n}^{(r)}\right)=r$.

​	设$\boldsymbol{A}_{m\times n}$为$m\times n$非零矩阵，称$\boldsymbol{A}$中所有不为零的子式的最高阶数为矩阵$\boldsymbol{A}$的秩，记作$\mathrm r(\boldsymbol{A})$.

​	设$\boldsymbol A_{m\times n}$为行阶梯形矩阵，$\mathbb{R}m r(\boldsymbol A)$等于$\boldsymbol A$非零行的行数。

​	秩是一个自然数。

​	对于零矩阵，定义$\mathrm r(\boldsymbol{O})=0$.

#### 奇异方阵

​	$\boldsymbol{A}$为$n$阶方阵，若$|\boldsymbol{A}|\neq0$，则称$\boldsymbol{A}$为非奇异方阵，反之为奇异方阵。

​	对方阵$\boldsymbol A$而言，$\boldsymbol A$可逆、$\boldsymbol A$满秩、$|\boldsymbol A|\ne 0$、$\boldsymbol A$非奇异等表述等价。

#### 满秩

​	若$\mathrm r(\boldsymbol A_{m\times n})=m$，则称矩阵$\boldsymbol A$行满秩。

​	若$\mathrm r(\boldsymbol A_{m\times n})=n$，则称矩阵$\boldsymbol A$列满秩。

​	若$\mathrm r(\boldsymbol A_{n\times n})=n$，则称方阵$\boldsymbol A$满秩。

### 1.7.2 几个重要结论

​	任意初等变换均不改变矩阵的秩。

​		**推论1** 若$\boldsymbol{A}$与$\boldsymbol{B}$等价，则$\mathrm r(\boldsymbol{A})=\mathrm r(\boldsymbol{B})$.

​		**推论2** 若$\boldsymbol{A}_{m\times n}$的等价标准形为$\boldsymbol{E}_{m\times n}^{(r)}$，则$\mathrm r(\boldsymbol{A})=r$.

​		**推论3** 转置不改变矩阵的秩，$\mathrm r(\boldsymbol{A}^\mathrm{T})=\mathrm r(A)$.

​		**推论4** $\mathrm r(\boldsymbol{PAQ})=\mathrm r(\boldsymbol{A})$，其中$\boldsymbol{P}$、$\boldsymbol{Q}$可逆。

​	任意矩阵$\boldsymbol A$的等价标准形$\boldsymbol{E}_{m\texttimes n}^{(r)}=\begin{pmatrix}\boldsymbol{E}_{r\texttimes r} & \boldsymbol{O}_{r\texttimes(n-r)}\\\boldsymbol{O}_{(m-r)\texttimes r} & \boldsymbol{O}_{(m-r)\texttimes(n-r)}\end{pmatrix}$唯一确定，$r=\mathrm r(\boldsymbol A)$.

#### 求矩阵秩的方法

​	用初等变换把$\boldsymbol{A}_{m\times n}$化成行列阶梯矩阵，数行列阶梯矩阵的非零行的行数。

#### 矩阵秩的不等式

​	**秩与分块** $\mathrm{r}(\boldsymbol{A})\leq\mathrm{r}(\boldsymbol{A},\boldsymbol{B})\leq\mathrm{r}(\boldsymbol{A})+\mathrm{r}(\boldsymbol{B})$，$\mathrm r(\boldsymbol{B})\leq\mathrm r(\boldsymbol{A},\boldsymbol{B})\leq\mathrm r(\boldsymbol{A})+\mathrm r(\boldsymbol{B})$

​			$\pmatrix{\boldsymbol{A}\\\boldsymbol{B}}$同理。

​	**秩与加法** $\mathrm{r}(\boldsymbol{A}+\boldsymbol{B})\leq\mathrm{r}(\boldsymbol{A})+\mathrm{r}(\boldsymbol{B})$

​	**秩与乘法** $\mathrm{r}(\boldsymbol{AB})\leq\mathrm{r}(\boldsymbol{A})$，$\mathrm{r}(\boldsymbol{AB})\leq\mathrm r(\boldsymbol{B})$

​	**秩与分块下三角** $\mathrm r\pmatrix{\boldsymbol{A}&\boldsymbol{O}\\\boldsymbol{C}&\boldsymbol{B}}\geq\mathrm r(\boldsymbol{A})+\mathrm r(\boldsymbol{B})$

​		证明：令$\mathrm r_1=\mathrm r(\boldsymbol{A})$，$\mathrm r_2=\mathrm r(\boldsymbol{\boldsymbol{B}})$

​		有$\boldsymbol{P}_1\boldsymbol{A}\boldsymbol{Q}_1=\boldsymbol{E}_{s\times n}^{(\mathrm r_1)}$，$\boldsymbol{P}_2\boldsymbol{B}\boldsymbol{Q}=\boldsymbol{E}_{n\times t}^{(\mathrm r_2)}$

​		$\pmatrix{\boldsymbol{P}_1&\\&\boldsymbol{P}_2}\pmatrix{\boldsymbol{A}&\\&\boldsymbol{B}}\pmatrix{\boldsymbol{Q}_1&\\&\boldsymbol{Q}_2}=\pmatrix{\boldsymbol{E}_{s\times n}^{(\mathrm r_1)}&\\&\boldsymbol{E}_{n\times t}^{(\mathrm r_2)}}$

​		$\begin{align*}\mathrm r\pmatrix{\boldsymbol{A}&\boldsymbol{O}\\\boldsymbol{C}&\boldsymbol{B}}&=r\left(\pmatrix{\boldsymbol{P}_1&\\&\boldsymbol{P}_2}\pmatrix{\boldsymbol{A}&\boldsymbol{O}\\\boldsymbol{C}&\boldsymbol{D}}\pmatrix{\boldsymbol{Q}_1&\\&\boldsymbol{Q}_2}\right)\\&=\mathrm r\pmatrix{\boldsymbol{P}_1\boldsymbol{A}\boldsymbol{Q}_1&\boldsymbol{O}\\\boldsymbol{P}_2\boldsymbol{C}\boldsymbol{Q}_1&\boldsymbol{P}_2\boldsymbol{B}\boldsymbol{Q}_2}\\&=\mathrm r\pmatrix{\boldsymbol{E}_{s\times n}^{(\mathrm r_1)}&\\&\boldsymbol{E}_{n\times t}^{(\mathrm r_2)}}\geq \mathrm r_1 + \mathrm r_2\end{align*}$

​	**秩与正交** 若$\boldsymbol{A}_{s\times n}\boldsymbol{B}_{n\times t}=\boldsymbol{O}$，则$\mathrm r(\boldsymbol{A})+\mathrm r(\boldsymbol{B})\leq n$.

#### 逆矩阵与伴随矩阵的秩

​	设$n\geq2$，$\boldsymbol{A}_{n\times n}$，则$\mathrm r(\boldsymbol{A}^*)=\left\{ \begin{align*}n,\quad&\mathrm r(\boldsymbol A)=n \\1,\quad&\mathrm r(\boldsymbol A)=n -1\\0,\quad&\mathrm r(\boldsymbol A)<n-1. \\\end{align*}\right.$

​	若方阵$\boldsymbol A$可逆，$\mathrm r(\boldsymbol A)=\mathrm r(\boldsymbol A^*)=n$.

#### 消去律

​	当$\boldsymbol{A}_{m\times n}$列满秩（$\mathrm r(\boldsymbol{A}_{m\times n})=n$）时，若$\boldsymbol{AB}=\boldsymbol{AC}$，则$\boldsymbol{B}=\boldsymbol{C}$.

