# 矩阵的特征值和特征向量

## 4.1 相似矩阵

#### 矩阵相似

​	设$\boldsymbol A,\boldsymbol B$为$n$阶矩阵，如果存在可逆矩阵$\boldsymbol P$，使得$\boldsymbol P^{-1}\boldsymbol{AP}=\boldsymbol B$，则称$\boldsymbol A$与$\boldsymbol B$是相似的，记作$\boldsymbol A\sim\boldsymbol B$.

#### 矩阵相似的性质

​	$\boldsymbol A,\boldsymbol B,\boldsymbol C$均为$n$阶矩阵：

​		反身性：$\boldsymbol A\sim\boldsymbol A$.

​		对称性：若$\boldsymbol A\sim\boldsymbol B$，则$\boldsymbol B\sim\boldsymbol A$.

​		传递性：若$\boldsymbol A\sim\boldsymbol B$，$\boldsymbol B\sim\boldsymbol C$，则$\boldsymbol A\sim\boldsymbol C$.

​	$\boldsymbol A\sim\boldsymbol B$，$f(x)$为矩阵多项式，则$f(\boldsymbol A)\sim f(\boldsymbol B)$.

​	相似矩阵的行列式相等。

​	相似矩阵秩相同。

#### 矩阵的迹

​	$n$阶矩阵$\boldsymbol A=(a_{ij})_{n\times n}$的主对角线上元素之和称为$\boldsymbol A$的迹，记为$\mathrm{tr}(\boldsymbol A)$，即$\mathrm{tr}(\boldsymbol A)=a_{11}+a_{22}+\cdots+a_{nn}$.

#### 矩阵迹的性质

​	$\boldsymbol A,\boldsymbol B$均为$n$阶矩阵，$k$为任意数，则

​		$\mathrm{tr}(\boldsymbol A+\boldsymbol B)=\mathrm{tr}(\boldsymbol A)+\mathrm{tr}(\boldsymbol B)$

​		$\mathrm{tr}(k\boldsymbol A)=k\mathrm{tr}(\boldsymbol A)$

​		$\mathrm{tr}(\boldsymbol{AB})=\mathrm{tr}(\boldsymbol{BA})$

​	相似矩阵有相同的迹。

## 4.2 特征值与特征向量

#### 特征值、特征向量

​	设$\boldsymbol A$为$n$阶矩阵，如果存在数$\lambda$和非零向量$\boldsymbol\xi$，满足$\boldsymbol{A\xi}=\lambda\boldsymbol\xi$，则称$\lambda$为$\boldsymbol A$的一个特征值，$\boldsymbol\xi$为$\boldsymbol A$属于特征值$\lambda$的特征向量。

​	如果$\boldsymbol{A\xi}=\lambda\boldsymbol\xi$，$\boldsymbol\xi\neq0$，那么$\forall k$，有$\boldsymbol A(k\boldsymbol\xi)=k(\boldsymbol{A\xi})=k(\lambda\boldsymbol\xi)=\lambda(k\boldsymbol\xi)$，所以$k\boldsymbol\xi$都是$\boldsymbol A$属于特征值$\lambda$的特征向量。

#### 求全部特征值与特征向量

​	设$\lambda_0$为$\boldsymbol A$的一个特征值，$\boldsymbol\xi$为属于特征值$\lambda_0$的一个特征向量，即$\boldsymbol{A\xi}=\lambda_0\boldsymbol\xi$，易知$(\lambda_0\boldsymbol E-\boldsymbol A)\boldsymbol\xi=\boldsymbol0\;(\boldsymbol\xi\neq\boldsymbol0)$。即$\boldsymbol\xi$为$(\lambda_0\boldsymbol E-\boldsymbol A)\boldsymbol x=\boldsymbol0$的一个非零解，由齐次线性方程组有非零解的充要条件可知$|\lambda_0\boldsymbol E-\boldsymbol A|=0$.

​	设$\boldsymbol A=(a_{ij})$为$n$阶方阵，则$\lambda\boldsymbol E-\boldsymbol A$称为$\boldsymbol A$的特征矩阵，其行列式
$$
|\lambda\boldsymbol E-\boldsymbol A|=\left|\matrix{\lambda-a_{11}&-a_{12}&\cdots&-a_{1n}\\-a_{21}&\lambda-a_{22}&\cdots&-a_{2n}\\\vdots&\vdots&\ddots&\vdots\\-a_{n1}&-a_{n2}&\cdots&\lambda-a_{nn}}\right|
$$
称为$\boldsymbol A$的特征多项式，$|\lambda\boldsymbol E-\boldsymbol A|=0$称为$\boldsymbol A$的特征方程。

​	综上，$\lambda_0$为$\boldsymbol A$的特征值当且仅当$\lambda_0$是$\boldsymbol A$的特征多项式的一个根，$\boldsymbol\xi$为$\boldsymbol A$的属于特征值$\lambda_0$的一个特征向量当且仅当$\boldsymbol\xi$是齐次线性方程组$(\lambda_0\boldsymbol E-\boldsymbol A)\boldsymbol x=\boldsymbol0$的一个非零解。

​	所以，有求特征值与特征向量的一般方法：

​		**第一步** 计算$\boldsymbol A$的特征多项式$|\lambda\boldsymbol E-\boldsymbol A|$

​		**第二步** 计算$|\lambda\boldsymbol E-\boldsymbol A|=0$的全部根，即为$\boldsymbol A$的全部特征值

​		**第三步** 对于每一个特征值$\lambda_i\;(i=1,2,\cdots,n)$，求齐次线性方程组$(\lambda_i\boldsymbol E-\boldsymbol A)\boldsymbol x=\boldsymbol0$的一个基础解系$\boldsymbol\eta_1,\cdots,\boldsymbol\eta_t$，此时$\boldsymbol A$的属于$\lambda_i$的全部特征向量为$k_1\boldsymbol\eta_1+\cdots+k_t\boldsymbol\eta_t$，其中$k_1,\cdots,k_t$为任意不全为$0$的数。

#### 特征值的性质

​	相似矩阵具有相同的特征多项式，有相同的特征值。但特征多项式相同的矩阵未必相似。

​	设$n$阶矩阵$\boldsymbol A=(a_{ij})$的特征值为$\lambda_1,\cdots,\lambda_n$，则：

​		(1) $\lambda_1+\cdots+\lambda_n=\mathrm{tr}(\boldsymbol A)$

​		(2) $\lambda_1\cdots\lambda_n=|\boldsymbol A|$

#### 化零多项式

​	矩阵$\boldsymbol A$的化零多项式是一个非零多项式$p(x)$使得$p(\boldsymbol A)=\boldsymbol 0$。换句话说，将矩阵$\boldsymbol A$带入该多项式后得到零矩阵。化零多项式的根是$\boldsymbol A$的特征值。

​	同一个矩阵的化零多项式可以有很多。

​	**Cayley-Hamilton定理** $\boldsymbol A$的特征多项式$c(x)$是$\boldsymbol A$的一个化零多项式。

#### 最小多项式

​	最小多项式是一个矩阵$\boldsymbol A$上的最小次数的化零多项式。它是次数最低的单项式，使得$m(\boldsymbol A)=\boldsymbol 0$. 最小多项式的根是也$\boldsymbol A$的特征值。

​	同一个矩阵的最小多项式只有一个。

​	$\lambda$是$\boldsymbol A$的特征值，当且仅当$\lambda$是最小多项式$m(x)$的根，即$m(\lambda)=0$.

​	$\boldsymbol A$可被相似对角化，当且仅当最小多项式$m(x)$没有重根。

​	最小多项式$m(x)$可以整除化零多项式$p(x)$、特征多项式$c(x)$.

​	相似的矩阵一定有相同的最小多项式。

#### 最小多项式的求法

​	若特征多项式$\begin{align*}c(x)=\prod_{i=1}^s(x-\lambda_i)^{k_i}\end{align*}$，$\lambda_1,\cdots,\lambda_s$互不相同，则最小多项式一定可以写成如下形式：$\begin{align*}m(x)=\prod_{i=1}^s(x-\lambda_i)^{k_i}\end{align*}$，其中$1\le a_i\le k_i$.

​	计算过程：

​		**第一步** 求出特征多项式。

​		**第二步** 写出所有可能的候选多项式$p_1(x),\cdots,p_t(x)$.

​		**第三步** 从低次到高次带入求$p_i(x)$，判断$p_i(\boldsymbol A)$是否为零矩阵。



## 4.3 矩阵可相似对角化的条件

#### 相似对角化

​	$n$阶矩阵$\boldsymbol A$相似于对角矩阵的充分必要条件是存在$n$个线性无关的特征向量$\boldsymbol\xi_1,\cdots,\boldsymbol\xi_n$。

​	此时，令$\boldsymbol P=(\boldsymbol\xi_1,\cdots,\boldsymbol\xi_n)$，$\boldsymbol\varLambda=\pmatrix{\lambda_1&&\\&\ddots&\\&&\lambda_n}$，则$\boldsymbol P^{-1}\boldsymbol{AP}=\boldsymbol\varLambda$.

​	如果$\boldsymbol A$相似于对角阵$\boldsymbol \varLambda$，则称$\boldsymbol A$可相似对角化，$\boldsymbol \varLambda$称为$\boldsymbol A$的相似标准形。

​	矩阵$\boldsymbol A$属于不同特征值的特征向量是线性无关的。

​	如果$n$阶矩阵$\boldsymbol A$有$n$个互不相同的特征值，则$\boldsymbol A$可相似对角化。

#### Jordan块

​	一般来说，一个$n$阶矩阵未必相似于对角阵。例如，形如$\boldsymbol J_0=\pmatrix{\lambda_0&1\\&\lambda_0&\ddots\\&&\ddots&1\\&&&\lambda_0}_{k\times k}$的矩阵通常被称为$k$阶Jordan块。当$k>1$时，$\boldsymbol J_0$不能相似于对角阵。

​	设$\boldsymbol A$为$n$阶复矩阵，则$\boldsymbol A$一定相似于$\boldsymbol J=\pmatrix{\boldsymbol J_1\\&\ddots\\&&\boldsymbol J_s}$，其中$\boldsymbol J_i=\pmatrix{\lambda_i&1\\&\lambda_i&\ddots\\&&\ddots&1\\&&&\lambda_i}$为Jordan块，$i=1,\cdots,s$. $\boldsymbol J$称为$\boldsymbol A$的Jordan标准形。如果不考虑$\boldsymbol J_1,\cdots,\boldsymbol J_s$的排列次序，$\boldsymbol J$由$\boldsymbol A$唯一确定。

​	两个$n$阶矩阵相似的充分必要条件是它们具有相同的Jordan标准形。

​	**求Jordan标准形的方法** 若$\boldsymbol A\sim\boldsymbol J$，则对任意多项式$\varphi(x)$，有$\varphi(\boldsymbol A)\sim\varphi(\boldsymbol J)$. 特别地，若$\varphi(x)=(\lambda-x)^t$，则有$(\lambda\boldsymbol E-\boldsymbol A)^t\sim(\lambda\boldsymbol E-\boldsymbol J)^t$相似，$\mathrm r(\lambda\boldsymbol E-\boldsymbol A)^t=\mathrm r(\lambda\boldsymbol E-\boldsymbol J)^t$.

​	求出$\boldsymbol A$的所有特征值及其代数重数，写出所有可能的Jordan标准形$\boldsymbol J_1,\cdots,\boldsymbol J_n$，计算$\mathrm r(\lambda\boldsymbol E-\boldsymbol A)^t$和$\mathrm r(\lambda\boldsymbol E-\boldsymbol J)^t$进行比较排除，剩下的即为Jordan标准形。

## 4.4 实矩阵的相似对角化

​	一般而言，$n$阶矩阵$\boldsymbol A$的特征值未必是实数，它也未必相似于对角矩阵。

​	实对称矩阵的特征值为实数。

​	实对称矩阵$\boldsymbol A$的属于不同特征值的特征向量是正交的。

​	设$\boldsymbol A$为$n$阶实对称矩阵，则存在正交矩阵$\boldsymbol Q$使得
$$
\boldsymbol Q^{-1}\boldsymbol {AQ}=\boldsymbol Q^{\mathrm T}\boldsymbol {AQ}=\pmatrix{\lambda_1\\&\ddots\\&&\lambda_n}
$$
其中$\lambda_1,\cdots,\lambda_n$是$\boldsymbol A$的特征值，$\boldsymbol Q$的列向量组$\boldsymbol q_1,\cdots,\boldsymbol q_n$是$\boldsymbol A$的分别对应于$\lambda_1,\cdots,\lambda_n$的标准正交的特征向量组。