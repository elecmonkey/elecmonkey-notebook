# 线性方程组

## 3.1 线性方程组和高斯消元法

### 3.1.1 线性方程组的概念

$$
\begin{cases}
\begin{align*}
a_{11}x_1+a_{12}x_2+\cdots+a_{1n}x_n&=b_1\\
a_{21}x_1+a_{22}x_2+\cdots+a_{2n}x_n&=b_2\\
&\vdots\\
a_{s1}x_1+a_{s2}x_2+\cdots+a_{sn}x_n&=b_s
\end{align*}
\end{cases}
$$

称为一个线性方程组。$a_{ij}$称为这个方程组的系数，$x_i$称为这个方程组的未知量，$b_i$称为这个方程组的常数项。

​	常数项$b_i$全为$0$的方程组称为齐次线性方程组，常数项不全为$0$的方程组称为非齐次线性方程组。
$$
\begin{cases}
\begin{align*}
a_{11}x_1+a_{12}x_2+\cdots+a_{1n}x_n&=0\\
a_{21}x_1+a_{22}x_2+\cdots+a_{2n}x_n&=0\\
&\vdots\\
a_{s1}x_1+a_{s2}x_2+\cdots+a_{sn}x_n&=0
\end{align*}
\end{cases}
$$
称为与原方程组相应的齐次线性方程组，或称为其的导出组。

​	令$\boldsymbol A=\pmatrix{a_{11}&\cdots&a_{1n}\\\vdots&\ddots&\vdots\\a_{s1}&\cdots&a_{sn}}$，$\boldsymbol x=\pmatrix{x_1\\x_2\\\vdots\\x_n}$，$\boldsymbol b=\pmatrix{b_1\\b_2\\\vdots\\b_s}$，则线性方程组可写成矩阵形式$\boldsymbol{Ax}=\boldsymbol b$.

​	称$\boldsymbol A$是这个方程组的系数矩阵，$\bar{\boldsymbol{A}}=(\boldsymbol A, \boldsymbol b)=\pmatrix{a_{11}&\cdots&a_{1n}&b_1\\\vdots&\ddots&\vdots&\vdots\\a_{s1}&\cdots&a_{sn}&b_s}$是这个方程组的增广矩阵。

​	将解$x_1=c_1,x_2=c_2,\ldots,x_n=c_n$构成的向量$\boldsymbol x=\pmatrix{c_1\\c_2\\\vdots\\c_n}$称为线性方程组的解向量。

​	如果线性方程组有解，称这个线性方程组是相容的，否则称该线性方程组为不相容的。

### 3.1.2 高斯消元法

#### 高斯消元法

​	对增广矩阵作初等行变换不会改变相应线性方程组的解，如果能将增广矩阵$(\boldsymbol A,\boldsymbol b)$化成阶梯形矩阵则很容易判断线性方程组是否有解，进而求出其解。先用初等行变换将增广矩阵化成阶梯形矩阵在求解的办法称为高斯消元法。

#### 判断解的个数

​	$n$是方程组未知数的个数：

​	当$\mathrm r(\boldsymbol A)=\mathrm r(\bar{\boldsymbol A})=n$，方程组有唯一解

​	当$\mathrm r(\boldsymbol A)=\mathrm r(\bar{\boldsymbol A})<n$，方程组有无穷多解

​	当$\mathrm r(\boldsymbol A)\neq\mathrm r(\bar{\boldsymbol A})$，方程组无解

## 3.2 齐次线性方程组

​	齐次线性方程组一定是相容的，令每个未知量均等于$0$就是它的一组解，称为零解或平凡解，否则称为非零解或非平凡解。

### 3.2.1 有非零解的条件

​	齐次线性方程组$\boldsymbol A\boldsymbol x=\boldsymbol0$有非零解当且仅当$\mathrm r(\boldsymbol A)<n$，也即构成$\boldsymbol A$的列向量线性相关。

​	如果$s<n$，则任意含$n$个未知量$s$个方程的齐次线性方程组一定有非零解。

​	如果$\boldsymbol A$是方阵，则齐次线性方程组$\boldsymbol{Ax}=\boldsymbol0$有非零解的充分必要条件是$|\boldsymbol A|=0$.

### 3.2.2 齐次线性方程组的解的结构

​	若$\boldsymbol\eta_1,\boldsymbol\eta_2$都是齐次线性方程组$\boldsymbol{Ax}=\boldsymbol0$的解，则$\boldsymbol\eta_1+\boldsymbol\eta_2$也是$\boldsymbol{Ax}=\boldsymbol0$的解。

​	若$\boldsymbol\eta$是是齐次线性方程组$\boldsymbol{Ax}=\boldsymbol0$的解，$k$是实数，则$k\boldsymbol\eta$也是$\boldsymbol{Ax}=\boldsymbol0$的解。

### 3.2.3 基础解系

​	如果$\boldsymbol\eta_1,\boldsymbol\eta_2,\cdots,\boldsymbol\eta_t$为齐次线性方程组$\boldsymbol{Ax}=\boldsymbol0$的一组解，如果这组解满足

​		(1) $\boldsymbol\eta_1,\boldsymbol\eta_2,\cdots,\boldsymbol\eta_t$是线性无关的

​		(2) $\boldsymbol{Ax}=\boldsymbol0$的每个解都可由$\boldsymbol\eta_1,\boldsymbol\eta_2,\cdots,\boldsymbol\eta_t$线性表出

​	则称$\boldsymbol\eta_1,\boldsymbol\eta_2,\cdots,\boldsymbol\eta_t$为方程组$\boldsymbol{Ax}=\boldsymbol0$的基础解系。

​	$\boldsymbol{Ax}=\boldsymbol0$的基础解系实际上就是这个齐次线性方程组的解空间的基。

​	方程组$\boldsymbol{Ax}=\boldsymbol0$的通解可以写成$k_1\boldsymbol\eta_1+k_2\boldsymbol\eta_2+\cdots+k_t\boldsymbol\eta_t$，其中$k_1,k_2,\cdots,k_t$是任意常数，这种形式的通解称为方程组$\boldsymbol{Ax}=\boldsymbol0$的一般解。

​	设含$n$个未知量的齐次线性方程组$\boldsymbol{Ax}=\boldsymbol0$的系数矩阵$\boldsymbol A$的秩为$r$，若$r<n$，则$\boldsymbol{Ax}=\boldsymbol0$的任一基础解系中均含$n-r$个解向量。

## 3.3 非齐次线性方程组

### 3.3.1 非齐次线性方程组的相容性

​	将系数矩阵写成按列分块矩阵$\boldsymbol A=(\boldsymbol\alpha_1,\boldsymbol\alpha_2,\cdots,\boldsymbol\alpha_n)$，常数项列向量记为$\boldsymbol b$，则有非齐次线性方程组$x_1\boldsymbol\alpha_1+x_2\boldsymbol\alpha_2+\cdots+x_n\boldsymbol\alpha_n=\boldsymbol b$.

​	方程组是相容的，当且仅当$\boldsymbol b$可以由向量组$\boldsymbol\alpha_1,\boldsymbol\alpha_2,\cdots,\boldsymbol\alpha_n$线性表示。

​	非齐次线性方程组有解当且仅当它的系数矩阵$\boldsymbol A$与增广矩阵$(\boldsymbol A,\boldsymbol b)$有相同的秩。

​	如果它们的秩均为$r$，则方程组的通解中含有$n-r$个自由未知量。

### 3.3.2 非齐次线性方程组的解的结构

​	若$\boldsymbol\gamma_1,\boldsymbol\gamma_2$都是线性方程组$\boldsymbol{Ax}=\boldsymbol b$的解，则$\boldsymbol\gamma_1-\boldsymbol\gamma_2$是其导出组$\boldsymbol{Ax}=\boldsymbol0$的解。

​	若$\boldsymbol\gamma$是线性方程组$\boldsymbol{Ax}=\boldsymbol b$的解，$\boldsymbol\eta$是其导出组$\boldsymbol{Ax}=\boldsymbol0$的解，则$\boldsymbol\gamma+\boldsymbol\eta$是方程组$\boldsymbol{Ax}=\boldsymbol b$的解。

​	设$\boldsymbol\gamma_0$是线性方程组$\boldsymbol{Ax}=\boldsymbol b$的特解，$\boldsymbol\eta_1,\boldsymbol\eta_2,\cdots,\boldsymbol\eta_{n-r}$是其导出组$\boldsymbol{Ax}=\boldsymbol0$的基础解系，则$\boldsymbol{Ax}=\boldsymbol b$的通解可以写成形式$\boldsymbol x=\boldsymbol\gamma_0+k_1\boldsymbol\eta_1+k_2\boldsymbol\eta_2+\cdots+k_{n-r}\boldsymbol\eta_{n-r}$，其中$k_1,k_2,\cdots,k_{n-r}$是任意常数，这种形式的通解称为非齐次线性方程组$\boldsymbol{Ax}=\boldsymbol b$的一般解。

### 3.3.3 向量组的极大无关组的计算$(\mathrm{II})$

​	初等行变换不改变矩阵的列向量间的线性关系。有
$$
\boldsymbol A=(\boldsymbol\alpha_1,\boldsymbol\alpha_2,\cdots,\boldsymbol\alpha_n)\xrightarrow{\text{初等行变换}}\boldsymbol B=(\boldsymbol\beta_1,\boldsymbol\beta_2,\cdots,\boldsymbol\beta_n)
$$
对于任意给定的$1\leq i_1,i_2,\cdots,i_s\leq n$，$\boldsymbol A$的列向量组$\boldsymbol\alpha_{i_1},\boldsymbol\alpha_{i_2},\cdots,\boldsymbol\alpha_{i_s}$是线性相关的当且仅当$\boldsymbol B$的相应列向量组$\boldsymbol\beta_{i_1},\boldsymbol\beta_{i_2},\cdots,\boldsymbol\beta_{i_s}$是线性相关的。

​	如果矩阵
$$
\boldsymbol A=(\boldsymbol\alpha_1,\boldsymbol\alpha_2,\cdots,\boldsymbol\alpha_n)\xrightarrow{\text{初等行变换}}\boldsymbol B=(\boldsymbol\beta_1,\boldsymbol\beta_2,\cdots,\boldsymbol\beta_n)
$$
则对于任意给定的$1\leq i_1,i_2,\cdots,i_s\leq n$，$\boldsymbol A$的列向量$\boldsymbol\alpha_{i_1},\boldsymbol\alpha_{i_2},\cdots,\boldsymbol\alpha_{i_s}$是$\boldsymbol A$的列向量组的极大线性无关组当且仅当$\boldsymbol B$的相应列向量$\boldsymbol\beta_{i_1},\boldsymbol\beta_{i_2},\cdots,\boldsymbol\beta_{i_s}$是$\boldsymbol B$的列向量组的极大线性无关组。

​	此时，对于$\boldsymbol A$的第$j$个列向量$\boldsymbol\alpha_j$，有$k_1,k_2,\cdots,k_s\in\mathbb{R}$满足$\boldsymbol\alpha_j=k_1\boldsymbol\alpha_{i_1}+k_2\boldsymbol\alpha_{i_2}+\cdots+k_s\boldsymbol\alpha_{i_s}$当且仅当对于$\boldsymbol B$的第$j$个列向量$\boldsymbol\beta_j$有$\boldsymbol\beta_j=k_1\boldsymbol\beta_{i_1}+k_2\boldsymbol\beta_{i_2}+\cdots+k_s\boldsymbol\beta_{i_s}$.

​	在一个阶梯形矩阵中，非零首元所在的列向量是该矩阵的列向量组的一个极大线性无关组。

## 3.4 线性方程组的最佳近似解

​	设$\boldsymbol\alpha,\boldsymbol\beta\in\mathbb{R}^n$，定义$\boldsymbol\alpha$和$\boldsymbol\beta$之间的距离为$\|\boldsymbol\alpha-\boldsymbol\beta\|$. 矩阵$\boldsymbol A$列向量构成的向量组生成的向量空间称为$\boldsymbol A$的列空间或像空间。

​	设有线性方程组$\boldsymbol{Ax}=\boldsymbol b$，其中$\boldsymbol A$是$s\times n$矩阵。$\boldsymbol x_0$称为线性方程组$\boldsymbol{Ax}=\boldsymbol b$的最佳近似解，是指向量$\boldsymbol b$和$\boldsymbol A\boldsymbol x_0$的距离$\|\boldsymbol b-\boldsymbol A\boldsymbol x_0\|$达到最小值。求线性方程组$\boldsymbol{Ax}=\boldsymbol b$的最佳近似解，就是要在矩阵$\boldsymbol A$的像空间$V=\{\boldsymbol{A\eta}\space|\space\boldsymbol\eta\in\mathbb{R}^n\}$中找一个向量$\boldsymbol\xi$，使得$\begin{align*}\|\boldsymbol b-
\boldsymbol\xi\|=\min_{\boldsymbol\alpha\in V}\|\boldsymbol\beta-\boldsymbol\alpha\|\end{align*}$.

​	线性方程组$\boldsymbol{Ax}=\boldsymbol b$是相容的当且仅当$\boldsymbol b\in V$. 若$\boldsymbol{Ax}=\boldsymbol b$相容，则$\begin{align*}\min_{\boldsymbol\alpha\in V}\|\boldsymbol\beta-\boldsymbol\alpha\|=0\end{align*}$. 若不相容，则$\begin{align*}\min_{\boldsymbol\alpha\in V}\|\boldsymbol\beta-\boldsymbol\alpha\|>0\end{align*}$.

​	考虑三维情况，设$\pi$为一平面，$\boldsymbol b$为空间中一矢量，$\boldsymbol c\in\pi$，则$\begin{align*}\|\boldsymbol b-\boldsymbol c\|=\min_{\boldsymbol x\in V}\|\boldsymbol b-\boldsymbol x\|
\end{align*}$当且仅当$(\boldsymbol b-\boldsymbol c)\perp\pi$（$\boldsymbol b-\boldsymbol c$与$V$中每个矢量都正交），这时，我们称$\boldsymbol c$是$\boldsymbol b$在$\pi$上的正投影。

​	三维几何结论可以推广到一般的向量空间。对于线性方程组$\boldsymbol{Ax}=\boldsymbol b$，求它的最佳近似解就相当于求$\boldsymbol b$在系数矩阵$\boldsymbol A$的像空间$V=\{\boldsymbol{A\eta}\space|\space\boldsymbol\eta\in\mathbb{R}^n\}$上的正投影。也就是说，在$V$中找一个元素$\boldsymbol\xi_0=\boldsymbol A\boldsymbol x_0$使得$\boldsymbol b-\boldsymbol\xi_0=\boldsymbol b-\boldsymbol A\boldsymbol x_0$与$V$中每个向量都正交。

​	将线性方程组的系数矩阵$\boldsymbol A$按列分块，$\boldsymbol A=(\boldsymbol\alpha_1,\cdots,\boldsymbol\alpha_n)$，最佳近似解$\boldsymbol x_0$应满足$\boldsymbol b-\boldsymbol\xi_0=\boldsymbol b-\boldsymbol A\boldsymbol x_0$与$\boldsymbol\alpha_1,\cdots,\boldsymbol\alpha_n$每个向量都正交，即要求$\boldsymbol x_0$满足
$$
\langle\boldsymbol\alpha_i,\boldsymbol b-\boldsymbol{Ax}_0\rangle=\boldsymbol\alpha_i^{\mathrm T}(\boldsymbol b-\boldsymbol A\boldsymbol x_0)=\boldsymbol0,\quad i=1,2,\cdots,n
$$
即
$$
\boldsymbol A^{\mathrm T}\boldsymbol A\boldsymbol x_0=\boldsymbol A^{\mathrm T}\boldsymbol b
$$
​	综上，线性方程组$\boldsymbol{Ax}=\boldsymbol b$的最佳近似解就是线性方程组的$\boldsymbol A^{\mathrm T}\boldsymbol A\boldsymbol x_0=\boldsymbol A^{\mathrm T}\boldsymbol b$的精确解，用这种方式求得的近似解称为线性方程组$\boldsymbol{Ax}=\boldsymbol b$的**最小二乘解**。