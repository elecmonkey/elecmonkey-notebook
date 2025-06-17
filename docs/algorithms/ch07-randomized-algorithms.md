# 七、随机化算法

## 7.1 随机化模型

随机化算法（Randomized Algorithms）是一类在算法执行过程中使用随机数的算法。通过引入随机性，这类算法通常能在效率、简洁性或鲁棒性方面获得优势。与确定性算法不同，随机化算法可能在相同输入下产生不同的输出或执行路径。

### 7.1.1 Monte Carlo 与 Las Vegas 算法

随机化算法主要分为两种类型：Monte Carlo 算法和 Las Vegas 算法。

#### Monte Carlo 算法

Monte Carlo 算法是一类可能产生错误结果的随机化算法，但错误概率可以被控制在较低水平。

**特点**：
- 总是在有限时间内终止
- 可能返回错误的结果
- 错误概率通常可以通过增加运行时间来减小
- 适用于对结果要求不是100%准确的场景

**示例**：Miller-Rabin 素性测试算法是一个典型的 Monte Carlo 算法，它可以快速判断一个数是否为素数，但有小概率将合数误判为素数。

#### 蒙特卡洛法素性测试（Miller-Rabin算法）

使用随机性来快速检测一个大数是否为素数，该算法是概率性的，可能产生误判，但可以通过增加测试次数降低错误概率。

```cpp
// 快速幂取模，计算 a^n % mod
long long powMod(long long a, long long n, long long mod) {
    long long result = 1;
    a %= mod;
    while (n > 0) {
        if (n & 1) {
            result = (result * a) % mod;
        }
        a = (a * a) % mod;
        n >>= 1;
    }
    return result;
}

// Miller-Rabin 素性测试
bool millerRabinTest(long long n, int iterations = 5) {
    if (n <= 1) return false;
    if (n <= 3) return true;
    if (n % 2 == 0) return false;  // 偶数都不是素数
    
    // 将 n-1 表示为 d*2^r
    long long d = n - 1;
    int r = 0;
    while (d % 2 == 0) {
        d /= 2;
        r++;
    }
    
    // 使用随机数进行多次测试
    for (int i = 0; i < iterations; i++) {
        long long a = 2 + rand() % (n - 3);  // 随机选择测试基数
        long long x = powMod(a, d, n);
        
        if (x == 1 || x == n - 1) continue;
        
        bool composite = true;
        for (int j = 0; j < r - 1; j++) {
            x = powMod(x, 2, n);
            if (x == n - 1) {
                composite = false;
                break;
            }
        }
        
        if (composite) return false;  // 确定为合数
    }
    
    return true;  // 可能为素数
}
```

该算法的基本原理是费马小定理的推广：如果p是素数，a是小于p的正整数，则a^(p-1) ≡ 1 (mod p)。

#### Las Vegas 算法

Las Vegas 算法是一类总是返回正确结果的随机化算法，但运行时间是随机的。

**特点**：
- 总是返回正确结果
- 运行时间是随机变量
- 对于某些输入可能不终止，但概率极低
- 通常关注期望运行时间

**示例**：随机快速排序是一个经典的 Las Vegas 算法，通过随机选择枢轴元素来避免最坏情况。

```cpp
void randomizedQuickSort(vector<int>& arr, int low, int high) {
    if (low < high) {
        // 随机选择枢轴
        int pivotIndex = low + rand() % (high - low + 1);
        swap(arr[pivotIndex], arr[high]);
        
        // 分区操作
        int p = partition(arr, low, high);
        
        // 递归排序
        randomizedQuickSort(arr, low, p - 1);
        randomizedQuickSort(arr, p + 1, high);
    }
}

int partition(vector<int>& arr, int low, int high) {
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
```

通过随机选择枢轴，该算法的期望时间复杂度为 O(n log n)，避免了传统快速排序在有序或近乎有序数组上的 O(n²) 最坏情况。

### 7.1.2 错误概率与期望运行时间

#### 错误概率分析

对于 Monte Carlo 算法，错误概率分析是评估算法可靠性的关键。

**单侧错误与双侧错误**：
- **单侧错误**：只在一种情况下出错。例如，算法可能将素数误判为合数（假阴性），但绝不会将合数误判为素数（无假阳性）。
- **双侧错误**：可能在两种情况下出错。例如，算法可能将素数误判为合数，也可能将合数误判为素数。

**错误放大与缩小**：
- **错误放大**：通过多次运行并取"或"关系，放大找到正确结果的概率（适用于寻找正例）。
- **错误缩小**：通过多次运行并取"与"关系，缩小错误判断的概率（适用于证明否例）。

**示例**：假设一个 Monte Carlo 算法有 1/4 的错误概率，通过独立运行 k 次并采用多数投票，错误概率可降至 P(错误) < exp(-ck)，其中 c 是常数。

#### 期望运行时间分析

对于 Las Vegas 算法，期望运行时间是评估性能的主要指标。

**例子：计算随机快速排序的期望运行时间**：

设 T(n) 为排序 n 个元素的期望时间。随机选择枢轴将数组分为大小为 i 和 n-i-1 的两部分，其中 i 以相同概率取 0 到 n-1 的任何值。

这可以表示为递归关系：
T(n) = O(n) + (1/n) * ∑(i=0 to n-1) [T(i) + T(n-i-1)]

通过数学归纳和计算，可以证明 T(n) = O(n log n)。

**阿姆达尔定律（Amdahl's Law）**：
当算法的某一部分以概率 p 运行得更快（加速 S 倍），整体加速为 1/((1-p) + p/S)。

## 7.2 应用实例

### 7.2.1 快速选择算法（随机快排）

快速选择（Quickselect）是一个在未排序数组中找到第 k 小元素的随机化算法，是随机快速排序的变种。

**基本思想**：
与快速排序类似，但每次只需要递归处理一侧。

```cpp
int randomizedSelect(vector<int>& arr, int low, int high, int k) {
    if (low == high) {
        return arr[low];
    }
    
    // 随机选择枢轴
    int pivotIndex = low + rand() % (high - low + 1);
    swap(arr[pivotIndex], arr[high]);
    
    // 分区操作
    int p = partition(arr, low, high);
    
    // 计算枢轴的位置（第几小）
    int rank = p - low + 1;
    
    // 根据枢轴位置决定递归方向
    if (k == rank) {
        return arr[p];
    } else if (k < rank) {
        return randomizedSelect(arr, low, p - 1, k);
    } else {
        return randomizedSelect(arr, p + 1, high, k - rank);
    }
}

// 与快速排序相同的分区函数
int partition(vector<int>& arr, int low, int high) {
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
```

**性能分析**：
- 期望时间复杂度：O(n)，远优于排序后选择的 O(n log n)
- 最坏情况：O(n²)，但概率极低
- 可以通过中位数的中位数（BFPRT）算法改进为确定性的 O(n)

### 7.2.2 Rabin-Karp 字符串匹配

Rabin-Karp算法使用哈希函数处理字符串匹配问题，特别适合多模式匹配。

**基本思想**：
使用滚动哈希函数计算模式串的哈希值，并在文本中使用滑动窗口高效计算子串的哈希值。

```cpp
// Rabin-Karp字符串匹配算法的C++实现
vector<int> rabinKarp(const string& text, const string& pattern) {
    vector<int> positions;
    int n = text.length();
    int m = pattern.length();
    
    if (m > n) return positions;
    
    // 选择一个大素数作为模数，避免溢出
    const long long prime = 1000000007;
    // 使用的基数（通常选择比字符集大小大的素数）
    const int base = 256;
    
    // 计算 base^(m-1) % prime
    long long h = 1;
    for (int i = 0; i < m - 1; i++) {
        h = (h * base) % prime;
    }
    
    // 计算pattern的哈希值和text第一个窗口的哈希值
    long long patternHash = 0;
    long long textHash = 0;
    
    for (int i = 0; i < m; i++) {
        patternHash = (patternHash * base + pattern[i]) % prime;
        textHash = (textHash * base + text[i]) % prime;
    }
    
    // 滑动窗口，检查每个可能的匹配
    for (int i = 0; i <= n - m; i++) {
        // 如果哈希值匹配，进行字符串比较确认
        if (patternHash == textHash) {
            bool match = true;
            for (int j = 0; j < m; j++) {
                if (text[i + j] != pattern[j]) {
                    match = false;
                    break;
                }
            }
            if (match) {
                positions.push_back(i);
            }
        }
        
        // 计算下一个窗口的哈希值
        if (i < n - m) {
            textHash = ((textHash - text[i] * h) * base + text[i + m]) % prime;
            // 处理负数情况
            if (textHash < 0) textHash += prime;
        }
    }
    
    return positions;
}
```

**性能分析**：
- 平均时间复杂度：O(n + m)，其中n是文本长度，m是模式长度
- 最坏情况：O(n*m)，当所有哈希值都相同时
- 空间复杂度：O(1)，不考虑输出结果所需空间

哈希函数的选择至关重要，一个好的哈希函数可以最小化碰撞并提高算法效率。

### 7.2.3 模拟退火

模拟退火算法是基于物理退火过程的随机化优化方法，可以跳出局部最优解。

**基本思想**：
通过随机扰动和概率接受劣解的方式，在解空间中探索最优解。随着"温度"降低，算法越来越倾向于接受更好的解。

```cpp
// 模拟退火算法的C++实现（以TSP问题为例）
vector<int> simulatedAnnealing(const vector<vector<double>>& distanceMatrix, double initialTemp = 100.0, 
                             double coolingRate = 0.995, int iterations = 10000) {
    int n = distanceMatrix.size();
    
    // 初始解：城市的随机排列
    vector<int> currentSolution(n);
    for (int i = 0; i < n; i++) {
        currentSolution[i] = i;
    }
    random_shuffle(currentSolution.begin(), currentSolution.end());
    
    vector<int> bestSolution = currentSolution;
    
    // 计算路径长度函数
    auto pathLength = [&](const vector<int>& path) {
        double length = 0.0;
        for (int i = 0; i < n; i++) {
            int from = path[i];
            int to = path[(i + 1) % n]; // 回到起点
            length += distanceMatrix[from][to];
        }
        return length;
    };
    
    double currentEnergy = pathLength(currentSolution);
    double bestEnergy = currentEnergy;
    
    double temperature = initialTemp;
    
    // 主循环
    for (int i = 0; i < iterations; i++) {
        // 产生邻居解（交换两个城市的位置）
        vector<int> newSolution = currentSolution;
        int pos1 = rand() % n;
        int pos2 = rand() % n;
        while (pos1 == pos2) {
            pos2 = rand() % n;
        }
        swap(newSolution[pos1], newSolution[pos2]);
        
        // 计算新解的能量
        double newEnergy = pathLength(newSolution);
        
        // 决定是否接受新解
        if (newEnergy < currentEnergy || 
            ((double)rand() / RAND_MAX) < exp((currentEnergy - newEnergy) / temperature)) {
            currentSolution = newSolution;
            currentEnergy = newEnergy;
            
            // 更新最优解
            if (currentEnergy < bestEnergy) {
                bestSolution = currentSolution;
                bestEnergy = currentEnergy;
            }
        }
        
        // 降低温度
        temperature *= coolingRate;
    }
    
    return bestSolution;
}
```

**应用场景**：
- 旅行商问题（TSP）和其他组合优化问题
- 图像处理和模式识别
- 神经网络训练
- 电路布局和VLSI设计

**算法优势**：
- 能够避开局部最优解
- 适用于非连续、非凸函数优化
- 易于实现，参数可调整性强

### 7.2.4 其他随机化算法应用

#### 随机化数据结构

**跳表（Skip List）**：
跳表是一种随机化的数据结构，通过概率层次结构实现了近似 O(log n) 的查找、插入和删除操作。

```cpp
// 跳表的简化C++实现
class SkipList {
private:
    struct Node {
        int key;
        int value;
        vector<Node*> forward;  // 前向指针数组
        
        Node(int k, int v, int level) : key(k), value(v), forward(level, nullptr) {}
    };
    
    Node* head;       // 头节点
    int maxLevel;     // 最大层数
    float probability; // 层级概率
    int currentLevel; // 当前最大层级
    
    // 随机生成节点的层数
    int randomLevel() {
        int level = 1;
        // 随机生成层数，每一层的概率为 probability
        while ((float)rand() / RAND_MAX < probability && level < maxLevel) {
            level++;
        }
        return level;
    }
    
public:
    SkipList(int maxLevel = 16, float p = 0.5) 
        : maxLevel(maxLevel), probability(p), currentLevel(1) {
        // 创建头节点
        head = new Node(-1, -1, maxLevel);
    }
    
    ~SkipList() {
        Node* current = head;
        while (current) {
            Node* next = current->forward[0];
            delete current;
            current = next;
        }
    }
    
    // 搜索操作
    bool search(int key, int& value) {
        Node* current = head;
        
        // 从最高层开始向下搜索
        for (int i = currentLevel - 1; i >= 0; i--) {
            while (current->forward[i] && current->forward[i]->key < key) {
                current = current->forward[i];
            }
        }
        
        // 最底层包含所有节点
        current = current->forward[0];
        
        if (current && current->key == key) {
            value = current->value;
            return true;
        }
        
        return false;
    }
    
    // 插入操作
    void insert(int key, int value) {
        Node* current = head;
        vector<Node*> update(maxLevel, nullptr);
        
        // 从最高层开始向下搜索，记录每层的更新位置
        for (int i = currentLevel - 1; i >= 0; i--) {
            while (current->forward[i] && current->forward[i]->key < key) {
                current = current->forward[i];
            }
            update[i] = current;
        }
        
        // 最底层包含所有节点
        current = current->forward[0];
        
        // 如果key已存在，更新值
        if (current && current->key == key) {
            current->value = value;
            return;
        }
        
        // 随机生成新节点的层数
        int newLevel = randomLevel();
        
        // 如果新层数大于当前层数，更新update数组
        if (newLevel > currentLevel) {
            for (int i = currentLevel; i < newLevel; i++) {
                update[i] = head;
            }
            currentLevel = newLevel;
        }
        
        // 创建新节点
        Node* newNode = new Node(key, value, newLevel);
        
        // 更新指针
        for (int i = 0; i < newLevel; i++) {
            newNode->forward[i] = update[i]->forward[i];
            update[i]->forward[i] = newNode;
        }
    }
    
    // 删除操作
    bool remove(int key) {
        Node* current = head;
        vector<Node*> update(maxLevel, nullptr);
        
        // 从最高层开始向下搜索，记录每层的更新位置
        for (int i = currentLevel - 1; i >= 0; i--) {
            while (current->forward[i] && current->forward[i]->key < key) {
                current = current->forward[i];
            }
            update[i] = current;
        }
        
        // 最底层包含所有节点
        current = current->forward[0];
        
        // 如果key不存在，返回false
        if (!current || current->key != key) {
            return false;
        }
        
        // 更新指针
        for (int i = 0; i < currentLevel; i++) {
            if (update[i]->forward[i] != current) {
                break;
            }
            update[i]->forward[i] = current->forward[i];
        }
        
        // 删除节点
        delete current;
        
        // 更新当前层数
        while (currentLevel > 1 && head->forward[currentLevel - 1] == nullptr) {
            currentLevel--;
        }
        
        return true;
    }
};
```

跳表的期望空间复杂度为 O(n)，期望时间复杂度为 O(log n)，是红黑树的一个随机化替代品。

#### 随机化算法在机器学习中的应用

**随机梯度下降（SGD）**：
随机选择子集样本来估计梯度，加速训练过程。

```cpp
// 随机梯度下降的简化C++实现（用于线性回归）
class SGD {
private:
    vector<double> theta;  // 模型参数
    double learningRate;   // 学习率
    int batchSize;         // 批量大小
    
    // 计算一个批次的梯度
    vector<double> computeGradient(const vector<vector<double>>& X_batch, 
                                  const vector<double>& y_batch) {
        int n = X_batch.size();
        int features = theta.size();
        vector<double> gradient(features, 0.0);
        
        for (int i = 0; i < n; i++) {
            // 计算预测值
            double prediction = 0.0;
            for (int j = 0; j < features; j++) {
                prediction += theta[j] * X_batch[i][j];
            }
            
            // 计算误差
            double error = prediction - y_batch[i];
            
            // 更新梯度
            for (int j = 0; j < features; j++) {
                gradient[j] += (error * X_batch[i][j]) / n;
            }
        }
        
        return gradient;
    }
    
public:
    SGD(int features, double lr = 0.01, int batch = 32) 
        : learningRate(lr), batchSize(batch) {
        // 随机初始化参数
        theta.resize(features);
        for (int i = 0; i < features; i++) {
            theta[i] = ((double)rand() / RAND_MAX) * 0.1;
        }
    }
    
    // 训练模型
    void train(const vector<vector<double>>& X, const vector<double>& y, int epochs) {
        int n = X.size();
        
        // 创建索引数组用于随机打乱
        vector<int> indices(n);
        iota(indices.begin(), indices.end(), 0);  // 填充 0, 1, 2, ..., n-1
        
        for (int epoch = 0; epoch < epochs; epoch++) {
            // 随机打乱数据
            random_shuffle(indices.begin(), indices.end());
            
            // 按批次训练
            for (int i = 0; i < n; i += batchSize) {
                int batch_end = min(i + batchSize, n);
                
                // 构建批次数据
                vector<vector<double>> X_batch;
                vector<double> y_batch;
                
                for (int j = i; j < batch_end; j++) {
                    X_batch.push_back(X[indices[j]]);
                    y_batch.push_back(y[indices[j]]);
                }
                
                // 计算梯度并更新参数
                vector<double> gradient = computeGradient(X_batch, y_batch);
                
                for (int j = 0; j < theta.size(); j++) {
                    theta[j] -= learningRate * gradient[j];
                }
            }
            
            // 学习率衰减（可选）
            learningRate *= 0.99;
        }
    }
    
    // 预测
    double predict(const vector<double>& x) {
        double prediction = 0.0;
        for (int j = 0; j < theta.size(); j++) {
            prediction += theta[j] * x[j];
        }
        return prediction;
    }
    
    // 获取模型参数
    const vector<double>& getParameters() const {
        return theta;
    }
};
```

**随机特征选择（Random Forests）**：
在构建决策树时随机选择特征子集，提高模型多样性和泛化能力。

```cpp
// 随机森林的简化C++实现
class RandomForest {
private:
    struct Node {
        bool isLeaf;
        int featureIndex;   // 分裂特征的索引
        double threshold;   // 分裂阈值
        int label;          // 叶节点的预测标签
        Node* left;         // 左子节点
        Node* right;        // 右子节点
        
        Node() : isLeaf(false), featureIndex(-1), threshold(0.0), 
                 label(-1), left(nullptr), right(nullptr) {}
    };
    
    struct DecisionTree {
        Node* root;
        
        DecisionTree() : root(new Node()) {}
        
        ~DecisionTree() {
            deleteTree(root);
        }
        
        void deleteTree(Node* node) {
            if (node) {
                deleteTree(node->left);
                deleteTree(node->right);
                delete node;
            }
        }
        
        // 预测单个样本
        int predict(const vector<double>& sample) const {
            return predictRecursive(root, sample);
        }
        
        int predictRecursive(const Node* node, const vector<double>& sample) const {
            if (node->isLeaf) {
                return node->label;
            }
            
            if (sample[node->featureIndex] <= node->threshold) {
                return predictRecursive(node->left, sample);
            } else {
                return predictRecursive(node->right, sample);
            }
        }
    };
    
    vector<DecisionTree> forest;
    int numTrees;
    int maxFeatures;
    int maxDepth;
    int minSamplesSplit;
    
    // 自助采样（有放回抽样）
    vector<vector<double>> bootstrapSample(const vector<vector<double>>& X, 
                                         vector<int>& sampleIndices) {
        int n = X.size();
        sampleIndices.resize(n);
        vector<vector<double>> sampledX;
        
        // 随机选择n个样本（有放回）
        for (int i = 0; i < n; i++) {
            int idx = rand() % n;
            sampleIndices[i] = idx;
            sampledX.push_back(X[idx]);
        }
        
        return sampledX;
    }
    
    // 随机选择特征子集
    vector<int> selectRandomFeatures(int numFeatures) {
        int m = min(maxFeatures, numFeatures);
        vector<int> allFeatures(numFeatures);
        iota(allFeatures.begin(), allFeatures.end(), 0);
        random_shuffle(allFeatures.begin(), allFeatures.end());
        
        return vector<int>(allFeatures.begin(), allFeatures.begin() + m);
    }
    
    // 构建决策树
    void buildTree(Node* node, const vector<vector<double>>& X, const vector<int>& y, 
                  int depth, const vector<int>& features) {
        int n = X.size();
        
        // 检查终止条件
        if (depth >= maxDepth || n <= minSamplesSplit || allSameLabels(y)) {
            node->isLeaf = true;
            node->label = majorityVote(y);
            return;
        }
        
        // 寻找最佳分裂
        int bestFeature = -1;
        double bestThreshold = 0.0;
        double bestGini = 1.0;
        
        for (int feature : features) {
            // 尝试不同的阈值
            for (int i = 0; i < n; i++) {
                double threshold = X[i][feature];
                
                // 计算基尼不纯度
                vector<int> leftIndices, rightIndices;
                for (int j = 0; j < n; j++) {
                    if (X[j][feature] <= threshold) {
                        leftIndices.push_back(j);
                    } else {
                        rightIndices.push_back(j);
                    }
                }
                
                if (leftIndices.empty() || rightIndices.empty()) continue;
                
                vector<int> leftLabels, rightLabels;
                for (int idx : leftIndices) leftLabels.push_back(y[idx]);
                for (int idx : rightIndices) rightLabels.push_back(y[idx]);
                
                double gini = (leftLabels.size() * giniImpurity(leftLabels) + 
                              rightLabels.size() * giniImpurity(rightLabels)) / n;
                
                if (gini < bestGini) {
                    bestGini = gini;
                    bestFeature = feature;
                    bestThreshold = threshold;
                }
            }
        }
        
        // 如果找不到好的分裂，创建叶节点
        if (bestFeature == -1) {
            node->isLeaf = true;
            node->label = majorityVote(y);
            return;
        }
        
        // 创建分裂
        node->featureIndex = bestFeature;
        node->threshold = bestThreshold;
        
        // 分割数据
        vector<vector<double>> leftX, rightX;
        vector<int> leftY, rightY;
        
        for (int i = 0; i < n; i++) {
            if (X[i][bestFeature] <= bestThreshold) {
                leftX.push_back(X[i]);
                leftY.push_back(y[i]);
            } else {
                rightX.push_back(X[i]);
                rightY.push_back(y[i]);
            }
        }
        
        // 创建子节点
        node->left = new Node();
        node->right = new Node();
        
        // 递归构建子树
        buildTree(node->left, leftX, leftY, depth + 1, selectRandomFeatures(X[0].size()));
        buildTree(node->right, rightX, rightY, depth + 1, selectRandomFeatures(X[0].size()));
    }
    
    // 计算基尼不纯度
    double giniImpurity(const vector<int>& labels) {
        if (labels.empty()) return 0.0;
        
        int n = labels.size();
        map<int, int> counts;
        
        for (int label : labels) {
            counts[label]++;
        }
        
        double impurity = 1.0;
        for (const auto& pair : counts) {
            double p = static_cast<double>(pair.second) / n;
            impurity -= p * p;
        }
        
        return impurity;
    }
    
    // 判断所有标签是否相同
    bool allSameLabels(const vector<int>& labels) {
        if (labels.empty()) return true;
        int first = labels[0];
        for (int label : labels) {
            if (label != first) return false;
        }
        return true;
    }
    
    // 多数投票
    int majorityVote(const vector<int>& labels) {
        if (labels.empty()) return -1;
        
        map<int, int> counts;
        for (int label : labels) {
            counts[label]++;
        }
        
        int majorityLabel = -1;
        int maxCount = 0;
        
        for (const auto& pair : counts) {
            if (pair.second > maxCount) {
                maxCount = pair.second;
                majorityLabel = pair.first;
            }
        }
        
        return majorityLabel;
    }
    
public:
    RandomForest(int trees = 100, int features = -1, int depth = 10, int minSamples = 2)
        : numTrees(trees), maxFeatures(features), maxDepth(depth), minSamplesSplit(minSamples) {
        forest.resize(numTrees);
    }
    
    // 训练随机森林
    void train(const vector<vector<double>>& X, const vector<int>& y) {
        if (maxFeatures == -1) {
            // 默认为特征总数的平方根
            maxFeatures = static_cast<int>(sqrt(X[0].size()));
        }
        
        for (int i = 0; i < numTrees; i++) {
            // 自助采样
            vector<int> sampleIndices;
            vector<vector<double>> sampledX = bootstrapSample(X, sampleIndices);
            
            // 获取对应的标签
            vector<int> sampledY;
            for (int idx : sampleIndices) {
                sampledY.push_back(y[idx]);
            }
            
            // 构建决策树
            buildTree(forest[i].root, sampledX, sampledY, 0, selectRandomFeatures(X[0].size()));
        }
    }
    
    // 预测（多数投票）
    int predict(const vector<double>& sample) const {
        map<int, int> votes;
        
        for (const auto& tree : forest) {
            int prediction = tree.predict(sample);
            votes[prediction]++;
        }
        
        int majorityLabel = -1;
        int maxVotes = 0;
        
        for (const auto& pair : votes) {
            if (pair.second > maxVotes) {
                maxVotes = pair.second;
                majorityLabel = pair.first;
            }
        }
        
        return majorityLabel;
    }
};
```

#### 随机化在密码学中的应用

**随机数生成**：
密码学安全的随机数生成器（CSPRNG）是现代密码系统的基石。

**密钥生成**：
随机生成加密密钥以确保安全性。

```cpp
// RSA密钥生成算法的简化C++实现
// 注意：这是教学示例，真实应用应使用专业密码库
struct RSAKeyPair {
    long long n;      // 模数
    long long e;      // 公钥指数
    long long d;      // 私钥指数
};

// 检查是否为素数（使用Miller-Rabin测试）
bool isPrime(long long n, int iterations = 5) {
    if (n <= 1) return false;
    if (n <= 3) return true;
    if (n % 2 == 0) return false;
    
    // 将 n-1 表示为 d*2^r
    long long d = n - 1;
    int r = 0;
    while (d % 2 == 0) {
        d /= 2;
        r++;
    }
    
    // 快速幂取模
    auto powMod = [](long long a, long long exp, long long mod) {
        long long res = 1;
        a %= mod;
        while (exp > 0) {
            if (exp & 1) res = (res * a) % mod;
            a = (a * a) % mod;
            exp >>= 1;
        }
        return res;
    };
    
    // 进行多次测试
    for (int i = 0; i < iterations; i++) {
        long long a = 2 + rand() % (n - 3);
        long long x = powMod(a, d, n);
        
        if (x == 1 || x == n - 1) continue;
        
        bool isProbablyComposite = true;
        for (int j = 0; j < r - 1; j++) {
            x = powMod(x, 2, n);
            if (x == n - 1) {
                isProbablyComposite = false;
                break;
            }
        }
        
        if (isProbablyComposite) return false;
    }
    
    return true;
}

// 生成指定位数的素数
long long generatePrime(int bits) {
    long long min = (1LL << (bits - 1));
    long long max = (1LL << bits) - 1;
    
    while (true) {
        // 生成随机奇数
        long long p = (min + (rand() % (max - min + 1))) | 1;
        if (isPrime(p)) {
            return p;
        }
    }
}

// 计算最大公约数
long long gcd(long long a, long long b) {
    while (b != 0) {
        long long temp = b;
        b = a % b;
        a = temp;
    }
    return a;
}

// 计算模反元素
long long modInverse(long long a, long long m) {
    long long m0 = m, t, q;
    long long x0 = 0, x1 = 1;
    
    if (m == 1) return 0;
    
    while (a > 1) {
        q = a / m;
        t = m;
        m = a % m;
        a = t;
        t = x0;
        x0 = x1 - q * x0;
        x1 = t;
    }
    
    if (x1 < 0) x1 += m0;
    
    return x1;
}

// 生成RSA密钥对
RSAKeyPair generateRSAKeyPair(int bits) {
    // 生成两个大素数p和q
    int halfBits = bits / 2;
    long long p = generatePrime(halfBits);
    long long q = generatePrime(halfBits);
    
    // 计算n = p*q
    long long n = p * q;
    
    // 计算欧拉函数φ(n) = (p-1)*(q-1)
    long long phi = (p - 1) * (q - 1);
    
    // 选择公钥e，通常为65537
    long long e = 65537;
    
    // 确保e与φ(n)互质
    while (gcd(e, phi) != 1) {
        e = e + 2;  // 尝试下一个奇数
    }
    
    // 计算私钥d，使得d*e ≡ 1 (mod φ(n))
    long long d = modInverse(e, phi);
    
    return {n, e, d};
}
```

**随机化算法在区块链中的应用**：

工作量证明（Proof of Work）机制利用随机性来确保分布式共识。

```cpp
// 区块链挖矿简化实现（工作量证明）
#include <string>
#include <vector>
#include <ctime>
#include <iostream>
#include <sstream>
#include <iomanip>
#include <openssl/sha.h>

// 将字节数组转换为十六进制字符串
std::string bytesToHexString(const unsigned char* data, size_t length) {
    std::stringstream ss;
    ss << std::hex << std::setfill('0');
    for (size_t i = 0; i < length; i++) {
        ss << std::setw(2) << static_cast<int>(data[i]);
    }
    return ss.str();
}

// 计算SHA-256哈希
std::string calculateSHA256(const std::string& str) {
    unsigned char hash[SHA256_DIGEST_LENGTH];
    SHA256_CTX sha256;
    SHA256_Init(&sha256);
    SHA256_Update(&sha256, str.c_str(), str.size());
    SHA256_Final(hash, &sha256);
    
    return bytesToHexString(hash, SHA256_DIGEST_LENGTH);
}

// 区块结构
struct Block {
    int index;
    time_t timestamp;
    std::string data;
    std::string previousHash;
    std::string hash;
    int nonce;
    
    // 创建区块
    Block(int idx, const std::string& data, const std::string& prevHash) 
        : index(idx), timestamp(time(nullptr)), data(data), 
          previousHash(prevHash), nonce(0) {
        hash = calculateHash();
    }
    
    // 计算区块哈希
    std::string calculateHash() const {
        std::stringstream ss;
        ss << index << timestamp << data << previousHash << nonce;
        return calculateSHA256(ss.str());
    }
    
    // 挖矿（工作量证明）
    void mineBlock(int difficulty) {
        // 创建difficulty个前导零的目标字符串
        std::string target(difficulty, '0');
        
        // 计算哈希，直到找到符合难度要求的哈希
        while (hash.substr(0, difficulty) != target) {
            nonce++;
            hash = calculateHash();
        }
        
        std::cout << "区块已挖出！哈希: " << hash << std::endl;
    }
};

// 简化的区块链
class Blockchain {
private:
    std::vector<Block> chain;
    int difficulty;
    
public:
    Blockchain(int diff = 4) : difficulty(diff) {
        // 创建创世区块
        chain.push_back(Block(0, "创世区块", "0"));
    }
    
    // 获取最后一个区块
    Block getLatestBlock() const {
        return chain.back();
    }
    
    // 添加新区块
    void addBlock(const std::string& data) {
        Block previousBlock = getLatestBlock();
        Block newBlock(previousBlock.index + 1, data, previousBlock.hash);
        
        std::cout << "正在挖掘区块..." << std::endl;
        newBlock.mineBlock(difficulty);
        
        chain.push_back(newBlock);
    }
    
    // 验证区块链完整性
    bool isChainValid() const {
        for (size_t i = 1; i < chain.size(); i++) {
            const Block& currentBlock = chain[i];
            const Block& previousBlock = chain[i - 1];
            
            // 验证当前区块哈希
            if (currentBlock.hash != currentBlock.calculateHash()) {
                return false;
            }
            
            // 验证区块链接
            if (currentBlock.previousHash != previousBlock.hash) {
                return false;
            }
        }
        return true;
    }
};
```

随机化算法对于处理不确定性、提高效率和确保安全性具有重要作用。通过巧妙地引入随机性，这些算法可以在面对复杂问题时提供简单而有效的解决方案。