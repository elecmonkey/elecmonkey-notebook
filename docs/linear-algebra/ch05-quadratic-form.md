# 二次型

## 5.1 二次型及其矩阵表示

### 5.1.1 二次型的定义

#### 二次型

​	含有$n$个变量的多项式中每一项次数均为二次，该多项式称为$n$元二次型。

​	由某个变量的平方构成的项称为平方项，两个变量相乘构成的项称为交叉项。

#### 二次型的矩阵表示

​	二次型的一般形式：
$$
\begin{align*}
f(x_1,\cdots,x_n)=a_{11}x_1^2+&2a_{12}x_1x_2+2a_{13}x_1x_3+\cdots+2a_{1n}x_1x_n\\
+&a_{22}x_2^2+2a_{23}x_2x_3+\cdots+2a_{2n}x_2x_n\\
&\cdots\\
+&a_{nn}x_n^2
\end{align*}
$$
​	令$a_{ij}=a_{ji}\space(1\leq j<i\leq n)$，即将交叉项的系数平分为两项，该二次型可以写成：
$$
\begin{align*}
f(x_1,\cdots,x_n)
=& a_{11}x_1^2  &+& a_{12}x_1x_2 &+ a_{13}x_1x_3 &+ \quad\cdots\quad +& a_{1n}x_1x_n\\
+& a_{21}x_2x_1 &+& a_{22}x_2^2  &+ a_{23}x_2x_3 &+ \quad\cdots\quad +& a_{2n}x_2x_n\\
&\cdots\\
+& a_{n1}x_nx_1 &+& a_{n2}x_nx_2 &+ a_{n3}x_nx_3 &+ \quad\cdots\quad +& a_{nn}x_n^2

\end{align*}
$$
​	于是可以将系数整理成一个矩阵，
$$
\boldsymbol A=\pmatrix{a_{11}&a_{12}&\cdots&a_{1n}\\a_{21}&a_{22}&\cdots&a_{2n}\\\vdots&\vdots&\ddots&\vdots\\a_{n1}&a_{n2}&\cdots&a_{nn}}
$$
​	该矩阵称为二次型$f(x_1,\cdots,x_n)$的矩阵，是一个实对称矩阵。显然，每个二次型的矩阵是唯一的，这个矩阵和二次型的关系为
$$
f(x_1,\cdots,x_n)=\pmatrix{x_1&x_2&\cdots&x_n}\pmatrix{a_{11}&a_{12}&\cdots&a_{1n}\\a_{21}&a_{22}&\cdots&a_{2n}\\\vdots&\vdots&\ddots&\vdots\\a_{n1}&a_{n2}&\cdots&a_{nn}}\pmatrix{x_1\\x_2\\\vdots\\x_n}
$$
​	令$\boldsymbol x=\pmatrix{x_1\\x_2\\\vdots\\x_n}$，该式也可写作$f(x_1,\cdots,x_n)=\boldsymbol x^{\mathrm T}\boldsymbol A\boldsymbol x$.

#### 可逆线性变换

​	令$\boldsymbol y=\pmatrix{y_1\\y_2\\\vdots\\y_n}$，如果$\boldsymbol P$为$n$阶可逆矩阵，则$\boldsymbol x=\boldsymbol{Py}$称为一个可逆线性变换。

​	$n$元二次型$f(x_1,\cdots,x_n)=\boldsymbol x^{\mathrm T}\boldsymbol A\boldsymbol x$经过可逆线性变换$\boldsymbol x=\boldsymbol{Py}$变成
$$
g(y_1,\cdots,y_n)=(\boldsymbol{Py})^{\mathrm T}\boldsymbol A(\boldsymbol{Py})=\boldsymbol y^{\mathrm T}(\boldsymbol P^{\mathrm T}\boldsymbol{AP})\boldsymbol y
$$
记$\boldsymbol B=\boldsymbol P^{\mathrm T}\boldsymbol{AP}$，则$g(y_1,\cdots,y_n)=\boldsymbol y^{\mathrm T}\boldsymbol{By}$，由于$\boldsymbol B^{\mathrm T}=(\boldsymbol  P^{\mathrm T}\boldsymbol {AP})^{\mathrm T}=\boldsymbol P^{\mathrm T}\boldsymbol A^{\mathrm T}\boldsymbol P=\boldsymbol P^{\mathrm T}\boldsymbol {AP}=\boldsymbol B$，$\boldsymbol B$也是对称矩阵，为二次型$g(y_1,\cdots,y_n)$的矩阵。

#### 标准二次型

​	只含平方项，不含交叉项的二次型称为标准形式的二次型，简称标准形。

​	$\boldsymbol x^{\mathrm T}\boldsymbol A\boldsymbol x$为标准形当且仅当$\boldsymbol A$为对角阵。

​	如果二次型经过可逆线性变换使得$\boldsymbol P^{\mathrm T}\boldsymbol {AP}=\pmatrix{d_1&&\\&\ddots&\\&&d_n}$，则该二次型被化为了标准形。二次型$f(x_1,\cdots,x_n)$经过可逆线性变换化成标准形等价于对于实对称矩阵$\boldsymbol A$，找到一个可逆矩阵$\boldsymbol P$，使得$\boldsymbol P^{\mathrm T}\boldsymbol{AP}$为对角矩阵。

### 5.1.2 矩阵的合同

#### 矩阵合同

​	设$\boldsymbol A,\boldsymbol B$为$n$阶矩阵，如果存在$n$阶可逆矩阵$\boldsymbol P$，使得$\boldsymbol P^{\mathrm T}\boldsymbol {AP}=\boldsymbol B$，那么称矩阵$\boldsymbol A$与$\boldsymbol B$合同，记$\boldsymbol  A\simeq\boldsymbol B$.

#### 合同的性质

​	$\boldsymbol A,\boldsymbol B,\boldsymbol C$均为$n$阶矩阵：

​		反身性：$\boldsymbol A\simeq\boldsymbol A$.

​		对称性：若$\boldsymbol A\simeq\boldsymbol B$，则$\boldsymbol B\simeq\boldsymbol A$.

​		传递性：若$\boldsymbol A\simeq\boldsymbol B$，$\boldsymbol B\simeq\boldsymbol C$，则$\boldsymbol A\simeq\boldsymbol C$.

​	若$\boldsymbol A\simeq\boldsymbol B$，则$\mathrm r(\boldsymbol A)=\mathrm r(\boldsymbol B)$.

​	若$\boldsymbol A\simeq\boldsymbol B$，则$\boldsymbol A$是对称矩阵和$\boldsymbol B$是对称矩阵互为充要条件。

​	若$\boldsymbol A\simeq\boldsymbol B$，$\boldsymbol A$、$\boldsymbol B$均可逆，则$\boldsymbol A^{-1}\simeq\boldsymbol B^{-1}$.

​	若$\boldsymbol A\simeq\boldsymbol B$，则$\boldsymbol A^{\mathrm T}\simeq\boldsymbol B^{\mathrm T}$.

​	若$\boldsymbol A$为实对称矩阵，则$\boldsymbol A$合同于对角阵。

## 5.2 化二次型为标准形

### 5.2.1 用正交变换化二次型为标准形

#### 正交变换

​	设$\boldsymbol Q$为正交矩阵，那么$\boldsymbol x=\boldsymbol {Qy}$称为一个正交变换，这是一种特殊的可逆线性变换。

​	正交变换的一个重要作用是它能保持向量的长度，
$$
\begin{align*}
\|\boldsymbol x\|&=\sqrt{\langle\boldsymbol x,\boldsymbol x\rangle}=\sqrt{\langle\boldsymbol {Qy},\boldsymbol {Qy}\rangle}=\sqrt{(\boldsymbol {Qy})^{\mathrm T}\boldsymbol {Qy}}\\
&=\sqrt{\boldsymbol y^{\mathrm T}\boldsymbol Q^{\mathrm T}\boldsymbol {Qy}}=\sqrt{\boldsymbol y^{\mathrm T}\boldsymbol y}=\sqrt{\langle\boldsymbol y,\boldsymbol y\rangle}=\|\boldsymbol y\|
\end{align*}
$$

#### 主轴定理

​	二次型$f(x_1,\cdots,x_n)=\boldsymbol x^{\mathrm T}\boldsymbol{Ax}$可经正交变换$\boldsymbol x=\boldsymbol{Qy}$化成标准形$\lambda_1y_1^2+\cdots+\lambda_ny_n^2$，其中$\lambda_1,\cdots,\lambda_n$为$\boldsymbol A$的特征值。

### 5.2.2 用配方法化二次型为标准形

#### 配方法化二次型为标准形

​	对于一般的二次型$f(x_1,\cdots,x_n)$，先集中所有含$x_1$的项，将其配成平方项并确保剩余的式子不再含有$x_1$。然后对剩余的式子集中所有含$x_2$的项，重复该过程直到将所有项配成平方项。

​	⚠️注意，线性变换的表达式为$\boldsymbol x=\boldsymbol {Py}$，而不是$\boldsymbol y=\boldsymbol{Px}$.

​	如果二次型不含平方项，可以令
$$
\begin{align*}
x_1&=y_1+y_2\\
x_2&=y_1-y_2\\
x_3&=y_3\\
&\,\,\,\vdots\\
x_n&=y_n
\end{align*}
$$
先进行一步线性变换，得到新的二次型后继续使用配方法。

#### 初等变换化二次型为标准形

​	对于二次型的矩阵$\boldsymbol A$，构造$\pmatrix{\boldsymbol A\\\boldsymbol E}$. 对$\boldsymbol A$作初等行变换，并对于每一步的初等行变换都配套进行相同的初等列变换（即对$\boldsymbol A$每次左乘初等矩阵$\boldsymbol P_0$时右乘$\boldsymbol P_0^{\mathrm T}$）。当$\boldsymbol A$被转化为对角矩阵时，即为二次型的标准形的矩阵。$\boldsymbol E$位置对应的矩阵即为从原二次型转换为新二次型的线性变换$\boldsymbol P$。

## 5.3 正定二次型

### 5.3.1 惯性定理

#### 二次型的秩

​	对于二次型$f(x_1,\cdots,x_n)=\boldsymbol x^{\mathrm T}\boldsymbol{Ax}$，称$\boldsymbol A$的秩为这个二次型的秩，记为$\mathrm r(f)$.

​	线性变换不改变二次型的秩。

#### 二次型的规范型

​	上述将二次型从一般形式转化为标准形的过程都可以继续进行，直到将二次型转化为$z_1^2+\cdots+z_p^2-z^2_{p+1}-\cdots-z^2_r$的形式。即：所有的系数均为0、1或-1，且各项系数按照1、-1、0的顺序排列。这种形式称为二次型的规范型。

​	即对于$n$阶对称实矩阵$\boldsymbol A$，存在可逆矩阵$\boldsymbol P$，使得
$$
\boldsymbol P^{\mathrm T}\boldsymbol{AP}=\pmatrix{1\\&\ddots\\&&1\\&&&-1\\&&&&\ddots\\&&&&&-1\\&&&&&&0\\&&&&&&&\ddots\\&&&&&&&&0}=\pmatrix{\boldsymbol E_{p\times p}\\&-\boldsymbol E_{q\times q}\\&&\boldsymbol O}
$$
该矩阵即为二次型的规范型的矩阵。其中$p$也称为$\boldsymbol A$的正惯性指数，$q$称为$\boldsymbol A$的负惯性指数。二次型的秩$\mathrm r=p+q$.

#### 惯性定理

​	二次型的规范型是唯一的。

### 5.3.2 二次型的正定性

#### 正定性、负定性

​	若对于任意非零实向量$\boldsymbol x=\pmatrix{x_1\\\vdots\\x_n}$，总有$f(x_1,\cdots,x_n)=\boldsymbol x^{\mathrm T}\boldsymbol{Ax}>0$，则称$f(x_1,\cdots,x_n)$为正定二次型，它对应的矩阵为正定矩阵。

​	若$f(x_1,\cdots,x_n)<0$、$\ge0$、$\le0$，则分别称为负定、半正定、半负定。

​	可逆线性变换不改变二次型的正定性。

#### 正定矩阵的性质

​	矩阵$\boldsymbol A$为正定矩阵，与以下条件为充要关系：

​		(1) $\boldsymbol A$的正惯性指数为$n$

​		(2) $\boldsymbol A$的特征值均大于$0$.

​		(3) $\boldsymbol A\simeq\boldsymbol E$

​		(4) 存在可逆矩阵$\boldsymbol P$，使得$\boldsymbol A=\boldsymbol P^{\mathrm T}\boldsymbol P$

#### Sylvester定理

​	二次型$f(x_1,\cdots,x_n)=\boldsymbol x^{\mathrm T}\boldsymbol {Ax}$是正定的的充分必要条件是其矩阵$\boldsymbol A=(a_{ij})_{n\times n}$的各阶顺序主子式$\Delta_n$均大于0.

​	$\begin{align*}\Delta_1&=a_{11}\\\Delta_2&=\left|\matrix{a_{11}&a_{12}\\a_{21}&a_{22}}\right|\\\vdots\\\Delta_n&=\left|\matrix{a_{11}&\cdots&a_{1n}\\\,\,\,\vdots&\ddots&\,\,\,\vdots\\a_{n1}&\cdots&a_{nn}}\right|\end{align*}$

#### 矩阵正定的推论

​	矩阵$\boldsymbol A$为正定矩阵，$|\boldsymbol A|>0$.

​	若$\boldsymbol A$正定，$\boldsymbol A^{-1}$、$\boldsymbol A^*$、$\boldsymbol A^k$也正定。

​	若$\boldsymbol A$正定，$\boldsymbol B$正定或半正定，$\boldsymbol A+\boldsymbol B$正定。

​	若$\boldsymbol A$正定，则$\boldsymbol A$的主对角线元素全部大于0.

## 5.4 二次曲面

​	椭球面：$\dfrac{x^2}{a^2}+\dfrac{y^2}{b^2}+\dfrac{z^2}{c^2}=1$

​	虚椭球面：$\dfrac{x^2}{a^2}+\dfrac{y^2}{b^2}+\dfrac{z^2}{c^2}=-1$

​	点：$\dfrac{x^2}{a^2}+\dfrac{y^2}{b^2}+\dfrac{z^2}{c^2}=0$

​	单叶双曲面：$\dfrac{x^2}{a^2}+\dfrac{y^2}{b^2}-\dfrac{z^2}{c^2}=1$

​	双叶双曲面：$-\dfrac{x^2}{a^2}-\dfrac{y^2}{b^2}+\dfrac{z^2}{c^2}=1$

​	二次锥面：$\dfrac{x^2}{a^2}+\dfrac{y^2}{b^2}-\dfrac{z^2}{c^2}=0$

​	椭圆抛物面：$\dfrac{x^2}{a^2}+\dfrac{y^2}{b^2}=z$

​	双曲抛物面：$\dfrac{x^2}{a^2}-\dfrac{y^2}{b^2}=z$

​	椭圆柱面：$\dfrac{x^2}{a^2}+\dfrac{y^2}{b^2}=1$

​	虚椭圆柱面：$\dfrac{x^2}{a^2}+\dfrac{y^2}{b^2}=-1$

​	直线$z$轴：$\dfrac{x^2}{a^2}+\dfrac{y^2}{b^2}=0$

​	双曲柱面：$\dfrac{x^2}{a^2}-\dfrac{y^2}{b^2}=1$

​	一对相交平面：$\dfrac{x^2}{a^2}-\dfrac{y^2}{b^2}=0$

​	一对平行平面：$x^2=a^2$

​	一对虚平行平面：$x^2=-a^2$

​	一对重合平面：$x^2=0$

​	抛物柱面：$x^2=2py$
