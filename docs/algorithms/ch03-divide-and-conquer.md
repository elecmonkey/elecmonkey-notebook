# 三、递归与分治

## 3.1 递归思想

递归是一种算法设计技术，通过函数调用自身来解决问题。递归思想基于"将大问题分解为同类的小问题"这一核心理念。

### 3.1.1 递归与迭代

递归和迭代是两种不同的问题求解方式：

#### 递归的特点

1. **自我调用**：函数内部调用自身。
2. **边界条件**：必须有停止递归的条件，避免无限递归。
3. **问题规模递减**：每次递归调用处理更小规模的子问题。
4. **自顶向下**：从大问题开始，分解为小问题。

#### 迭代的特点

1. **循环结构**：使用循环语句重复执行。
2. **状态更新**：每次迭代更新变量状态。
3. **显式终止条件**：根据循环条件决定是否继续。
4. **自底向上**：从小问题开始，逐步构建大问题的解。

#### 递归与迭代的比较

| 特性 | 递归 | 迭代 |
|------|------|------|
| 代码可读性 | 通常更高，更接近问题描述 | 可能复杂，需要手动维护状态 |
| 空间复杂度 | 较高（调用栈开销） | 较低 |
| 时间复杂度 | 可能有额外函数调用开销 | 通常更高效 |
| 适用场景 | 树、图等自然递归结构 | 线性问题，对效率要求高的场景 |
| 错误风险 | 栈溢出风险 | 无限循环风险 |

#### 递归到迭代的转换

许多递归算法可以转换为迭代形式，通常通过显式使用栈结构来模拟函数调用栈：

```cpp
// 递归版本的阶乘函数
int factorialRecursive(int n) {
    if (n <= 1) {
        return 1;
    } else {
        return n * factorialRecursive(n - 1);
    }
}

// 迭代版本的阶乘函数
int factorialIterative(int n) {
    int result = 1;
    for (int i = 1; i <= n; i++) {
        result *= i;
    }
    return result;
}
```

### 3.1.2 递归终止条件与堆栈消耗分析

#### 递归终止条件

1. **基本情况（Base Case）**：问题可以直接解决的最小规模。
2. **确定性**：终止条件必须保证能在有限步骤内达到。
3. **完备性**：所有可能的输入最终都能归约到基本情况。

常见的终止条件示例：
- 阶乘：`if n ≤ 1 then return 1`
- 斐波那契：`if n ≤ 1 then return n`
- 二分查找：`if left > right then return -1`

#### 堆栈消耗分析

递归函数的堆栈消耗主要取决于：

1. **递归深度**：最大的嵌套递归调用数量。
2. **每层递归的局部变量大小**：函数参数和局部变量占用的空间。

**递归深度分析方法**：
- 线性递归（如阶乘）：递归深度为 O(n)
- 二分递归（如归并排序）：递归深度为 O(log n)
- 多路递归（如汉诺塔）：递归深度为函数参数的某个函数

**避免栈溢出的技术**：
1. **尾递归优化**：将递归调用作为函数的最后一个操作，某些编译器会优化为迭代。
2. **记忆化**：存储已计算结果，避免重复计算。
3. **转换为迭代**：手动使用栈或其他数据结构替代系统调用栈。

**尾递归示例**：

```cpp
// 尾递归的阶乘
int factorialTail(int n, int acc = 1) {
    if (n <= 1) {
        return acc;
    } else {
        return factorialTail(n - 1, n * acc);  // 递归调用是最后操作
    }
}
```

## 3.2 分治策略

分治法（Divide and Conquer）是将一个复杂问题分解为多个相似的子问题，解决子问题后再合并结果的策略。

### 3.2.1 分治法设计模式

分治法的基本步骤：

1. **分解（Divide）**：将原问题分解为若干个规模较小的子问题。
2. **解决（Conquer）**：递归地解决这些子问题。如果子问题足够小，则直接求解。
3. **合并（Combine）**：将子问题的解合并成原问题的解。

**分治法的适用条件**：

1. 问题可以分解为同类的子问题。
2. 子问题相互独立，没有重叠。
3. 子问题的解可以合并。
4. 存在可直接求解的基本情况。

**分治法的框架**：

```cpp
template<typename Problem, typename Solution>
Solution divideAndConquer(const Problem& problem) {
    if (isSmallEnough(problem)) {
        // 直接解决小规模问题
        return solveDirect(problem);
    } else {
        // 将问题分解为更小的子问题
        vector<Problem> subproblems = divide(problem);
        
        // 递归解决每个子问题
        vector<Solution> subSolutions;
        for (const auto& subproblem : subproblems) {
            subSolutions.push_back(divideAndConquer(subproblem));
        }
        
        // 合并子问题的解
        return combine(subSolutions);
    }
}
```

### 3.2.2 典型问题：归并排序、快速排序、最大子段和、矩阵乘法

#### 归并排序

归并排序是分治法的典型应用，将数组分为两半，分别排序后再合并。

```cpp
void merge(vector<int>& arr, int start, int mid, int end) {
    // 创建临时数组存储合并结果
    int n1 = mid - start + 1;
    int n2 = end - mid;
    
    vector<int> L(n1), R(n2);
    
    // 复制数据到临时数组
    for (int i = 0; i < n1; i++)
        L[i] = arr[start + i];
    for (int j = 0; j < n2; j++)
        R[j] = arr[mid + 1 + j];
    
    // 合并两个有序数组
    int i = 0, j = 0, k = start;
    while (i < n1 && j < n2) {
        if (L[i] <= R[j]) {
            arr[k] = L[i];
            i++;
        } else {
            arr[k] = R[j];
            j++;
        }
        k++;
    }
    
    // 复制L[]的剩余元素
    while (i < n1) {
        arr[k] = L[i];
        i++;
        k++;
    }
    
    // 复制R[]的剩余元素
    while (j < n2) {
        arr[k] = R[j];
        j++;
        k++;
    }
}

void mergeSort(vector<int>& arr, int start, int end) {
    if (start < end) {
        int mid = start + (end - start) / 2;  // 防止整数溢出
        mergeSort(arr, start, mid);           // 分解左半部分
        mergeSort(arr, mid + 1, end);         // 分解右半部分
        merge(arr, start, mid, end);          // 合并已排序的子数组
    }
}
```

- **时间复杂度**：O(n log n)
- **空间复杂度**：O(n)
- **稳定性**：稳定

#### 快速排序

快速排序也使用分治思想，选择一个基准元素，将小于基准的放在左侧，大于基准的放在右侧。

```cpp
int partition(vector<int>& arr, int low, int high) {
    // 选择最后一个元素作为基准
    int pivot = arr[high];
    int i = low - 1;
    
    for (int j = low; j < high; j++) {
        if (arr[j] <= pivot) {
            i++;
            swap(arr[i], arr[j]);
        }
    }
    
    swap(arr[i + 1], arr[high]);
    return i + 1;
}

void quickSort(vector<int>& arr, int low, int high) {
    if (low < high) {
        // 分区操作，返回基准元素的位置
        int pivotIndex = partition(arr, low, high);
        
        // 递归地对基准左右两部分进行排序
        quickSort(arr, low, pivotIndex - 1);
        quickSort(arr, pivotIndex + 1, high);
    }
}
```

- **时间复杂度**：平均 O(n log n)，最坏 O(n²)
- **空间复杂度**：平均 O(log n)，最坏 O(n)
- **稳定性**：不稳定

#### 最大子段和问题

最大子段和问题是指在一个整数数组中，找出一段连续的子数组，使其和最大。

**分治解法**：

```cpp
int maxCrossingSum(vector<int>& arr, int low, int mid, int high) {
    // 计算左半部分的最大和（必须包含mid）
    int leftSum = INT_MIN;
    int sum = 0;
    for (int i = mid; i >= low; i--) {
        sum += arr[i];
        leftSum = max(leftSum, sum);
    }
    
    // 计算右半部分的最大和（必须包含mid+1）
    int rightSum = INT_MIN;
    sum = 0;
    for (int i = mid + 1; i <= high; i++) {
        sum += arr[i];
        rightSum = max(rightSum, sum);
    }
    
    // 返回跨越中点的最大子段和
    return leftSum + rightSum;
}

int maxSubarraySum(vector<int>& arr, int low, int high) {
    if (low == high) {
        return arr[low];  // 基本情况：只有一个元素
    }
    
    int mid = low + (high - low) / 2;
    
    // 最大子段和可能在左半部分
    int leftSum = maxSubarraySum(arr, low, mid);
    
    // 最大子段和可能在右半部分
    int rightSum = maxSubarraySum(arr, mid + 1, high);
    
    // 最大子段和可能横跨中点
    int crossSum = maxCrossingSum(arr, low, mid, high);
    
    // 返回三种情况中的最大值
    return max({leftSum, rightSum, crossSum});
}
```

- **时间复杂度**：O(n log n)

注：这个问题有一个更高效的线性时间解法（Kadane算法），但这里展示分治解法。

#### Strassen矩阵乘法

传统的矩阵乘法需要O(n³)的时间复杂度，Strassen算法通过巧妙的分治，将复杂度降至O(n^log₂7)≈O(n^2.81)。

对于两个n×n矩阵A和B的乘法，当n为2的幂时：

1. 将A和B分为四个n/2×n/2的子矩阵：
   ```
   A = [ A₁₁ A₁₂ ]    B = [ B₁₁ B₁₂ ]
       [ A₂₁ A₂₂ ]        [ B₂₁ B₂₂ ]
   ```

2. 计算七个辅助矩阵：
   ```
   M₁ = (A₁₁ + A₂₂)(B₁₁ + B₂₂)
   M₂ = (A₂₁ + A₂₂)B₁₁
   M₃ = A₁₁(B₁₂ - B₂₂)
   M₄ = A₂₂(B₂₁ - B₁₁)
   M₅ = (A₁₁ + A₁₂)B₂₂
   M₆ = (A₂₁ - A₁₁)(B₁₁ + B₁₂)
   M₇ = (A₁₂ - A₂₂)(B₂₁ + B₂₂)
   ```

3. 计算C = A×B的四个子矩阵：
   ```
   C₁₁ = M₁ + M₄ - M₅ + M₇
   C₁₂ = M₃ + M₅
   C₂₁ = M₂ + M₄
   C₂₂ = M₁ - M₂ + M₃ + M₆
   ```

这种方法将矩阵乘法的8个递归调用减少到7个，从而降低了时间复杂度。

### 3.2.3 Master 定理及其应用

Master定理是用于求解形如 T(n) = aT(n/b) + f(n) 的递推关系式的方法，其中a ≥ 1，b > 1，f(n)是一个渐近正函数。

**Master定理**：对于递推关系 T(n) = aT(n/b) + f(n)，有以下三种情况：

1. 若 f(n) = O(n^c)，其中 c < log_b(a)，则 T(n) = Θ(n^log_b(a))。
   
2. 若 f(n) = Θ(n^c)，其中 c = log_b(a)，则 T(n) = Θ(n^c log n)。
   
3. 若 f(n) = Ω(n^c)，其中 c > log_b(a)，并且存在常数 k < 1 使得对所有足够大的 n 有 af(n/b) ≤ kf(n)，则 T(n) = Θ(f(n))。

**应用示例**：

1. **归并排序**：T(n) = 2T(n/2) + Θ(n)
   - a = 2, b = 2, f(n) = Θ(n), c = 1
   - log_b(a) = log_2(2) = 1 = c
   - 应用情况2，得 T(n) = Θ(n log n)

2. **二分查找**：T(n) = T(n/2) + Θ(1)
   - a = 1, b = 2, f(n) = Θ(1), c = 0
   - log_b(a) = log_2(1) = 0 = c
   - 应用情况2，得 T(n) = Θ(log n)

3. **Strassen矩阵乘法**：T(n) = 7T(n/2) + Θ(n²)
   - a = 7, b = 2, f(n) = Θ(n²), c = 2
   - log_b(a) = log_2(7) ≈ 2.81 > c = 2
   - 应用情况1，得 T(n) = Θ(n^log_2(7)) ≈ Θ(n^2.81)

4. **普通矩阵乘法**：T(n) = 8T(n/2) + Θ(n²)
   - a = 8, b = 2, f(n) = Θ(n²), c = 2
   - log_b(a) = log_2(8) = 3 > c = 2
   - 应用情况1，得 T(n) = Θ(n^3)

Master定理是分析分治算法时间复杂度的有力工具，但也有其局限性，如不适用于f(n)不是多项式的情况、递归深度不均匀的情况等。

## 3.3 二分查找算法

### 3.3.1 二分查找算法

二分查找是一种在有序数组中查找特定元素的经典算法，它将搜索空间在每一步减半，从而实现对数时间复杂度。

```cpp
int binarySearch(const vector<int>& arr, int target, int left, int right) {
    if (left > right) {
        return -1;  // 目标元素不存在
    }
    
    int mid = left + (right - left) / 2;  // 避免整数溢出
    
    if (arr[mid] == target) {
        return mid;
    } else if (arr[mid] > target) {
        return binarySearch(arr, target, left, mid - 1);
    } else {
        return binarySearch(arr, target, mid + 1, right);
    }
}

// 迭代版本
int binarySearchIterative(const vector<int>& arr, int target) {
    int left = 0;
    int right = arr.size() - 1;
    
    while (left <= right) {
        int mid = left + (right - left) / 2;
        
        if (arr[mid] == target) {
            return mid;
        } else if (arr[mid] > target) {
            right = mid - 1;
        } else {
            left = mid + 1;
        }
    }
    
    return -1;  // 目标元素不存在
}
```

- **时间复杂度**：O(log n)
- **空间复杂度**：递归版本 O(log n)，迭代版本 O(1)
- **适用场景**：在有序数组中查找元素