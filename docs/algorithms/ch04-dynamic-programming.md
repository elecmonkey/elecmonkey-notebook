# 四、动态规划

## 4.1 基础概念

动态规划（Dynamic Programming，简称DP）是一种通过将复杂问题分解为更简单的子问题来解决的算法设计范式。它特别适用于具有重叠子问题和最优子结构性质的问题。

### 4.1.1 最优子结构与重叠子问题

#### 最优子结构

最优子结构是指问题的最优解包含其子问题的最优解。换句话说，可以通过组合子问题的最优解来构建原问题的最优解。

**最优子结构的特点**：
- 问题的解可以由子问题的解构造出来
- 子问题的解必须是最优的
- 子问题相互独立，一个子问题的解不影响另一个子问题的解

**例子**：在最短路径问题中，如果从顶点A到顶点C的最短路径经过顶点B，那么A到B的路径必然是A到B的最短路径，B到C的路径必然是B到C的最短路径。

#### 重叠子问题

重叠子问题是指在解决问题的过程中，同一个子问题会被多次计算。动态规划通过存储子问题的解来避免重复计算。

**重叠子问题的特点**：
- 递归算法中反复求解相同的子问题
- 子问题数量相对较少，但重复计算次数多

**例子**：斐波那契数列计算中，F(n) = F(n-1) + F(n-2)，求解F(5)时，F(3)会被重复计算：
```
F(5) = F(4) + F(3)
F(4) = F(3) + F(2)
```
这里F(3)被计算了两次。在复杂问题中，这种重复计算会呈指数级增长。

### 4.1.2 状态定义与转移方程

动态规划的核心在于找到问题的数学模型，主要体现在状态定义和状态转移方程上。

#### 状态定义

状态是对问题在特定阶段的描述，通常以一个或多个变量表示。

**状态定义的原则**：
- 完整性：能够描述问题的所有可能情况
- 无后效性：当前状态确定后，未来状态与过去决策无关
- 最小表示：使用尽可能少的变量描述问题

**常见的状态表示**：
- 一维状态：`dp[i]` 表示与索引i相关的问题解
- 二维状态：`dp[i][j]` 通常表示二维空间或两个条件下的问题解
- 多维状态：`dp[i][j][k]...` 表示多个条件下的问题解

#### 状态转移方程

状态转移方程描述了状态之间的递推关系，即如何由已知状态推导出新状态。

**状态转移方程的特点**：
- 表示子问题解与原问题解的关系
- 通常是递推形式
- 包含选择逻辑（如取最大、最小、求和等）

**例子**：
- 最长递增子序列（LIS）：`dp[i] = max(dp[j] + 1)` 其中`j < i` 且 `nums[j] < nums[i]`
- 0-1背包问题：`dp[i][w] = max(dp[i-1][w], dp[i-1][w-weight[i]] + value[i])`
- 编辑距离：`dp[i][j] = min(dp[i-1][j]+1, dp[i][j-1]+1, dp[i-1][j-1]+(s1[i]!=s2[j]))`

### 4.1.3 记忆化搜索与迭代 DP

动态规划可以通过两种主要方式实现：自顶向下的记忆化搜索和自底向上的迭代方法。

#### 记忆化搜索

记忆化搜索是对递归算法的优化，通过存储已计算的子问题解来避免重复计算。

**实现步骤**：
1. 递归函数定义：设计表示子问题的递归函数
2. 记忆数组：使用数组存储已计算的结果
3. 递归调用：先检查结果是否已存在，不存在才递归计算

**优点**：
- 直观，接近问题的自然思考方式
- 代码结构简单
- 只计算必要的子问题
- 适合状态转移复杂或状态空间大的问题

**缺点**：
- 递归调用开销
- 可能导致栈溢出
- 缓存命中率可能不高

**斐波那契数列的记忆化搜索实现**：

```cpp
int fibonacci(int n, vector<int>& memo) {
    if (memo[n] != -1) {
        return memo[n];
    }
    if (n <= 1) {
        return n;
    }
    memo[n] = fibonacci(n-1, memo) + fibonacci(n-2, memo);
    return memo[n];
}

int fib(int n) {
    if (n <= 1) return n;
    vector<int> memo(n+1, -1);
    return fibonacci(n, memo);
}
```

#### 迭代 DP

迭代DP采用自底向上的方法，从最小的子问题开始，逐步构建更大问题的解。

**实现步骤**：
1. 定义DP数组：设计状态表示
2. 初始化基础情况
3. 按照一定顺序填充DP数组
4. 提取最终结果

**优点**：
- 避免递归开销
- 不会栈溢出
- 通常运行更快
- 空间优化可能性大

**缺点**：
- 必须求解所有子问题
- 需要考虑计算顺序
- 代码可能不如递归直观

**斐波那契数列的迭代DP实现**：

```cpp
int fibonacci_dp(int n) {
    if (n <= 1) {
        return n;
    }
    
    vector<int> dp(n+1);
    dp[0] = 0;
    dp[1] = 1;
    
    for (int i = 2; i <= n; i++) {
        dp[i] = dp[i-1] + dp[i-2];
    }
    
    return dp[n];
}
```

**空间优化**：

许多DP问题的空间复杂度可以优化。例如，如果当前状态只依赖于前几个状态，可以使用滚动数组或有限变量。

```cpp
int fibonacci_optimized(int n) {
    if (n <= 1) {
        return n;
    }
    
    int a = 0;
    int b = 1;
    
    for (int i = 2; i <= n; i++) {
        int c = a + b;
        a = b;
        b = c;
    }
    
    return b;
}
```

## 4.2 常见模型

动态规划有多种经典模型，针对不同类型的问题。

### 4.2.1 线性 DP（LIS、斐波那契、跳台阶）

线性DP是最基础的DP形式，通常状态按线性顺序推进。

#### 最长递增子序列（LIS）

问题：找出一个数组中最长的严格递增子序列的长度。

**状态定义**：`dp[i]` 表示以第i个元素结尾的最长递增子序列长度。

**状态转移方程**：`dp[i] = max(dp[j] + 1)` 其中 `j < i` 且 `nums[j] < nums[i]`

**初始化**：`dp[i] = 1`（每个元素自成一个子序列）

```cpp
int longestIncreasingSubsequence(vector<int>& nums) {
    int n = nums.size();
    vector<int> dp(n, 1);
    
    for (int i = 0; i < n; i++) {
        for (int j = 0; j < i; j++) {
            if (nums[i] > nums[j]) {
                dp[i] = max(dp[i], dp[j] + 1);
            }
        }
    }
    
    return *max_element(dp.begin(), dp.end());
}
```

**时间复杂度**：O(n²)
**空间复杂度**：O(n)

注：LIS问题有O(n log n)的解法，使用二分查找和贪心策略。

#### 斐波那契数列

问题：计算斐波那契数列的第n项，F(0)=0, F(1)=1, F(n)=F(n-1)+F(n-2)。

**状态定义**：`dp[i]` 表示第i个斐波那契数。

**状态转移方程**：`dp[i] = dp[i-1] + dp[i-2]`

**初始化**：`dp[0] = 0, dp[1] = 1`

```cpp
int fibonacci(int n) {
    if (n <= 1) {
        return n;
    }
    
    vector<int> dp(n+1);
    dp[0] = 0;
    dp[1] = 1;
    
    for (int i = 2; i <= n; i++) {
        dp[i] = dp[i-1] + dp[i-2];
    }
    
    return dp[n];
}
```

**时间复杂度**：O(n)
**空间复杂度**：O(n)，可优化至O(1)

#### 跳台阶问题

问题：一次可以跳1或2个台阶，问跳上n个台阶有多少种方法。

**状态定义**：`dp[i]` 表示跳上i个台阶的方法数。

**状态转移方程**：`dp[i] = dp[i-1] + dp[i-2]`（最后一步跳1阶或2阶）

**初始化**：`dp[1] = 1, dp[2] = 2`

```cpp
int climbStairs(int n) {
    if (n <= 2) {
        return n;
    }
    
    vector<int> dp(n+1);
    dp[1] = 1;
    dp[2] = 2;
    
    for (int i = 3; i <= n; i++) {
        dp[i] = dp[i-1] + dp[i-2];
    }
    
    return dp[n];
}
```

**时间复杂度**：O(n)
**空间复杂度**：O(n)，可优化至O(1)

### 4.2.2 区间 DP（石子合并、矩阵链乘）

区间DP处理区间上的最优化问题，通常按区间长度递增的顺序求解。

#### 石子合并问题

问题：n堆石子排成一行，每次合并相邻的两堆，合并代价为两堆石子的总数。求将所有石子合并成一堆的最小代价。

**状态定义**：`dp[i][j]` 表示将第i堆到第j堆石子合并成一堆的最小代价。

**状态转移方程**：`dp[i][j] = min(dp[i][k] + dp[k+1][j] + sum[i..j])` 其中 `i ≤ k < j`

**初始化**：`dp[i][i] = 0`（单个堆不需要合并）

```cpp
int mergeStones(vector<int>& stones) {
    int n = stones.size();
    
    // 计算前缀和，方便求区间和
    vector<int> prefixSum(n + 1, 0);
    for (int i = 1; i <= n; i++) {
        prefixSum[i] = prefixSum[i-1] + stones[i-1];
    }
    
    // 初始化dp数组
    vector<vector<int>> dp(n, vector<int>(n, INT_MAX));
    for (int i = 0; i < n; i++) {
        dp[i][i] = 0;  // 单堆石子不需要合并
    }
    
    // 按区间长度填充dp数组
    for (int len = 2; len <= n; len++) {  // 区间长度
        for (int i = 0; i <= n - len; i++) {  // 左端点
            int j = i + len - 1;  // 右端点
            for (int k = i; k < j; k++) {  // 分割点
                dp[i][j] = min(dp[i][j], 
                               dp[i][k] + dp[k+1][j] + prefixSum[j+1] - prefixSum[i]);
            }
        }
    }
    
    return dp[0][n-1];
}
```

**时间复杂度**：O(n³)
**空间复杂度**：O(n²)

#### 矩阵链乘法

问题：给定n个矩阵的维度，找出连乘这些矩阵的最小乘法运算次数。

**状态定义**：`dp[i][j]` 表示计算从第i个到第j个矩阵的连乘积所需的最小运算次数。

**状态转移方程**：`dp[i][j] = min(dp[i][k] + dp[k+1][j] + p[i-1]*p[k]*p[j])` 其中 `i ≤ k < j`

**初始化**：`dp[i][i] = 0`（单个矩阵不需要乘法）

```cpp
int matrixChainMultiplication(vector<int>& p) {
    int n = p.size() - 1;  // 矩阵数量
    
    // 初始化dp数组
    vector<vector<int>> dp(n + 1, vector<int>(n + 1, 0));
    
    // 按区间长度填充dp数组
    for (int len = 2; len <= n; len++) {  // 区间长度
        for (int i = 1; i <= n - len + 1; i++) {  // 左端点
            int j = i + len - 1;  // 右端点
            dp[i][j] = INT_MAX;
            
            for (int k = i; k < j; k++) {  // 分割点
                dp[i][j] = min(dp[i][j], 
                               dp[i][k] + dp[k+1][j] + p[i-1]*p[k]*p[j]);
            }
        }
    }
    
    return dp[1][n];
}
```

**时间复杂度**：O(n³)
**空间复杂度**：O(n²)

### 4.2.3 背包 DP（0-1背包、完全背包、多重背包）

背包问题是一类经典的组合优化问题，涉及从给定项目集合中选择项目，以最大化总价值同时受到容量限制。

#### 0-1背包问题

问题：有n件物品和一个容量为W的背包。第i件物品的重量是weight[i]，价值是value[i]。每件物品只能选择一次，求解将哪些物品装入背包可使价值总和最大。

**状态定义**：`dp[i][w]` 表示前i件物品放入容量为w的背包的最大价值。

**状态转移方程**：`dp[i][w] = max(dp[i-1][w], dp[i-1][w-weight[i]] + value[i])` 如果 `w ≥ weight[i]`

**初始化**：`dp[0][w] = 0`（没有物品时价值为0）

```cpp
int knapsack01(vector<int>& weights, vector<int>& values, int W) {
    int n = weights.size();
    
    // 创建dp数组
    vector<vector<int>> dp(n + 1, vector<int>(W + 1, 0));
    
    // 填充dp数组
    for (int i = 1; i <= n; i++) {
        for (int w = 0; w <= W; w++) {
            if (weights[i-1] <= w) {
                // 可以放入第i件物品
                dp[i][w] = max(dp[i-1][w], 
                               dp[i-1][w-weights[i-1]] + values[i-1]);
            } else {
                // 不能放入第i件物品
                dp[i][w] = dp[i-1][w];
            }
        }
    }
    
    return dp[n][W];
}
```

**空间优化**：由于每个状态只依赖于上一行的状态，可以使用一维数组节省空间。

```cpp
int knapsack01Optimized(vector<int>& weights, vector<int>& values, int W) {
    int n = weights.size();
    
    // 创建dp数组
    vector<int> dp(W + 1, 0);
    
    // 填充dp数组
    for (int i = 0; i < n; i++) {
        for (int w = W; w >= weights[i]; w--) {
            dp[w] = max(dp[w], dp[w-weights[i]] + values[i]);
        }
    }
    
    return dp[W];
}
```

**时间复杂度**：O(nW)
**空间复杂度**：优化后 O(W)

#### 完全背包问题

问题：与0-1背包类似，但每种物品有无限数量。

**状态转移方程**：`dp[i][w] = max(dp[i-1][w], dp[i][w-weight[i]] + value[i])` 如果 `w ≥ weight[i]`

注意与0-1背包的区别：使用当前行的状态 `dp[i][w-weight[i]]` 而不是上一行的状态。

```cpp
int unboundedKnapsack(vector<int>& weights, vector<int>& values, int W) {
    int n = weights.size();
    
    // 创建dp数组
    vector<int> dp(W + 1, 0);
    
    // 填充dp数组
    for (int i = 0; i < n; i++) {
        for (int w = weights[i]; w <= W; w++) {
            dp[w] = max(dp[w], dp[w-weights[i]] + values[i]);
        }
    }
    
    return dp[W];
}
```

**时间复杂度**：O(nW)
**空间复杂度**：O(W)

#### 多重背包问题

问题：每种物品有限定数量。

**方法1**：转化为0-1背包，将每种物品拆分为多个物品。

**方法2**：使用二进制优化，将数量为k的物品拆分为2^0, 2^1, ..., 2^(log k)数量的组合。

```cpp
int boundedKnapsack(vector<int>& weights, vector<int>& values, vector<int>& counts, int W) {
    int n = weights.size();
    
    // 扩展物品列表，将每种物品按二进制拆分
    vector<int> newWeights, newValues;
    
    for (int i = 0; i < n; i++) {
        int count = counts[i];
        for (int k = 1; count > 0; k *= 2) {
            int amount = min(k, count);
            newWeights.push_back(weights[i] * amount);
            newValues.push_back(values[i] * amount);
            count -= amount;
        }
    }
    
    // 使用0-1背包算法
    return knapsack01Optimized(newWeights, newValues, W);
}
```

**时间复杂度**：O(nW log C)，其中C是物品的最大数量。
**空间复杂度**：O(W)

### 4.2.4 状态压缩 DP（集合问题，位运算优化）

状态压缩是一种使用二进制表示集合状态的技术，通常用于状态数量较少（通常不超过20个元素）的问题。

#### 旅行商问题 (TSP)

问题：给定n个城市和城市间的距离，求解访问每个城市恰好一次并返回起点的最短路径。

**状态定义**：`dp[mask][i]` 表示当前访问过的城市集合为mask（二进制表示），当前位于城市i的最短路径长度。

**状态转移方程**：`dp[mask][i] = min(dp[mask - 2^i][j] + dist[j][i])` 其中j是mask中已访问的城市。

```cpp
int tsp(vector<vector<int>>& dist) {
    int n = dist.size();
    int allVisited = (1 << n) - 1;
    
    // 创建dp数组，初始化为无穷大
    vector<vector<int>> dp(1 << n, vector<int>(n, INT_MAX));
    
    // 初始状态：从城市0出发
    dp[1][0] = 0;  // 只访问城市0的状态
    
    // 填充dp数组
    for (int mask = 1; mask < (1 << n); mask++) {
        for (int i = 0; i < n; i++) {
            // 如果城市i不在当前状态mask中，跳过
            if (!(mask & (1 << i))) continue;
            
            // 前一个状态：移除城市i
            int prevMask = mask ^ (1 << i);
            
            // 如果是初始城市0且不是初始状态
            if (i == 0 && prevMask != 0) continue;
            
            // 尝试从每个已访问的城市j转移到城市i
            for (int j = 0; j < n; j++) {
                if (mask & (1 << j)) {
                    if (dp[prevMask][j] != INT_MAX && dist[j][i] != INT_MAX) {
                        dp[mask][i] = min(dp[mask][i], dp[prevMask][j] + dist[j][i]);
                    }
                }
            }
        }
    }
    
    // 返回所有城市都访问过，且最后位于城市0的最短路径
    return dp[allVisited][0];
}
```

**时间复杂度**：O(n² * 2^n)
**空间复杂度**：O(n * 2^n)

#### 集合覆盖问题

问题：有n个集合和m个元素，每个集合包含某些元素，求解最少使用多少个集合可以覆盖所有元素。

**状态定义**：`dp[mask]` 表示覆盖元素集合mask所需的最少集合数。

**状态转移方程**：`dp[mask] = min(dp[mask - set[i]] + 1)` 其中set[i]是第i个集合包含的元素的二进制表示。

```cpp
int setCover(vector<int>& sets, int m) {
    int n = sets.size();
    int allElements = (1 << m) - 1;
    
    // 创建dp数组，初始化为无穷大
    vector<int> dp(1 << m, INT_MAX);
    dp[0] = 0;  // 覆盖空集合需要0个集合
    
    // 填充dp数组
    for (int mask = 0; mask <= allElements; mask++) {
        if (dp[mask] == INT_MAX) continue;
        
        for (int i = 0; i < n; i++) {
            int newMask = mask | sets[i];
            dp[newMask] = min(dp[newMask], dp[mask] + 1);
        }
    }
    
    return dp[allElements];
}
```

**时间复杂度**：O(n * 2^m)
**空间复杂度**：O(2^m)