# 五、贪心算法

## 5.1 贪心策略基础

贪心算法是一种在每一步选择中都采取当前状态下最好或最优的选择，从而希望导致全局最优解的算法设计范式。

### 5.1.1 贪心策略的基本原理

贪心算法的核心思想是通过一系列局部最优的选择来达到全局最优解。每一步都选择当前看起来最好的选择，而不考虑未来的后果。

**贪心算法的一般步骤**：
1. 将问题分解为若干个子问题
2. 对每个子问题做出局部最优的贪心选择
3. 将局部最优的解组合得到全局最优解

**贪心算法的优缺点**：
- **优点**：
  - 简单直观，容易实现
  - 计算效率通常很高
  - 在适用的问题上比动态规划更高效
- **缺点**：
  - 不是所有问题都适用
  - 难以证明算法的正确性
  - 有时难以识别一个问题是否适合贪心策略

### 5.1.2 贪心策略与动态规划的比较

贪心算法和动态规划都是解决优化问题的重要方法，但它们有本质的区别：

| 特性 | 贪心算法 | 动态规划 |
|------|---------|----------|
| 决策方式 | 每步做出局部最优选择 | 考虑所有可能的选择，记录并使用之前的计算结果 |
| 适用条件 | 问题具有贪心选择性质和最优子结构 | 问题具有重叠子问题和最优子结构 |
| 时间复杂度 | 通常较低 | 通常较高 |
| 解的保证 | 不一定能得到全局最优解 | 保证全局最优解 |
| 实现复杂度 | 通常较简单 | 通常较复杂 |
| 解决的问题范围 | 较窄 | 较广 |

**例子**：硬币找零问题
- 在美元系统下（1, 5, 10, 25美分），贪心算法（每次选择最大面额的硬币）可以得到最优解
- 在某些货币系统下，贪心算法可能无法得到最优解，而动态规划总能得到最优解

### 5.1.3 贪心算法的适用条件

贪心算法只在满足特定条件的问题上才能获得全局最优解：

1. **贪心选择性质（Greedy Choice Property）**：
   - 通过局部最优选择可以导致全局最优解
   - 当前的选择不会影响未来的选择
   - 当前的最优选择不会被后续的选择所改变

2. **最优子结构（Optimal Substructure）**：
   - 问题的最优解包含其子问题的最优解
   - 这个子问题与原问题结构相同，可以用相同的贪心策略解决

## 5.2 应用示例

### 5.2.1 活动选择问题

活动选择问题是贪心算法的经典应用：给定n个活动，每个活动有开始时间s和结束时间f，选择最大数量的互不重叠的活动。

#### 贪心策略

按照活动的结束时间升序排序，然后每次选择结束最早且与已选活动不冲突的活动。

#### 算法实现

```cpp
struct Activity {
    int start, finish;
};

vector<Activity> activitySelection(vector<Activity>& activities) {
    // 按照结束时间排序活动
    sort(activities.begin(), activities.end(), 
         [](const Activity& a, const Activity& b) {
             return a.finish < b.finish;
         });
    
    vector<Activity> selected;
    selected.push_back(activities[0]);  // 选择第一个活动
    int lastFinish = activities[0].finish;
    
    for (int i = 1; i < activities.size(); i++) {
        if (activities[i].start >= lastFinish) {
            selected.push_back(activities[i]);
            lastFinish = activities[i].finish;
        }
    }
    
    return selected;
}
```

#### 算法分析

- **时间复杂度**：O(n log n)，主要来自于排序
- **空间复杂度**：O(n)，用于存储结果
- **正确性**：基于贪心选择性质和最优子结构

### 5.2.2 Huffman 编码

Huffman编码是一种变长前缀编码算法，用于无损数据压缩。它基于字符出现的频率构建最优二叉树。

#### 问题描述

给定一组字符及其出现频率，设计一种编码方式，使得编码后的总长度最小。

#### 贪心策略

每次合并两个出现频率最低的节点，构建一棵哈夫曼树。频率低的字符获得更长的编码，频率高的字符获得更短的编码。

#### 算法实现

```cpp
struct HuffmanNode {
    char data;
    int freq;
    HuffmanNode *left, *right;
    
    HuffmanNode(char data, int freq) : 
        data(data), freq(freq), left(nullptr), right(nullptr) {}
};

struct Compare {
    bool operator()(HuffmanNode* l, HuffmanNode* r) {
        return l->freq > r->freq;  // 最小堆
    }
};

HuffmanNode* buildHuffmanTree(vector<char>& characters, vector<int>& frequencies) {
    int n = characters.size();
    
    // 创建最小堆
    priority_queue<HuffmanNode*, vector<HuffmanNode*>, Compare> minHeap;
    
    // 创建叶节点并加入最小堆
    for (int i = 0; i < n; i++) {
        minHeap.push(new HuffmanNode(characters[i], frequencies[i]));
    }
    
    // 构建Huffman树
    while (minHeap.size() > 1) {
        // 移除两个最小频率的节点
        HuffmanNode* left = minHeap.top(); minHeap.pop();
        HuffmanNode* right = minHeap.top(); minHeap.pop();
        
        // 创建新的内部节点，频率为两子节点频率之和
        HuffmanNode* newNode = new HuffmanNode('$', left->freq + right->freq);
        newNode->left = left;
        newNode->right = right;
        
        minHeap.push(newNode);
    }
    
    // 返回根节点
    return minHeap.top();
}

// 递归函数，为每个字符分配编码
void assignCodes(HuffmanNode* root, string code, unordered_map<char, string>& codes) {
    if (!root) return;
    
    // 如果是叶节点
    if (!root->left && !root->right) {
        codes[root->data] = code;
    }
    
    assignCodes(root->left, code + "0", codes);
    assignCodes(root->right, code + "1", codes);
}

unordered_map<char, string> huffmanCoding(vector<char>& characters, vector<int>& frequencies) {
    HuffmanNode* root = buildHuffmanTree(characters, frequencies);
    unordered_map<char, string> codes;
    assignCodes(root, "", codes);
    return codes;
}
```

#### 算法分析

- **时间复杂度**：O(n log n)，其中n是字符数量
- **空间复杂度**：O(n)
- **最优性**：可以证明Huffman编码生成的前缀码是最优的

### 5.2.3 区间调度与 Kruskal 最小生成树

#### 区间调度问题

区间调度问题是活动选择问题的一个变种，目标是在给定的时间段内安排最多的活动。

**变种1：带权重的区间调度**

每个活动有一个权重（价值），目标是选择不重叠活动使总权重最大。

- 这个问题通常不能用贪心算法解决，需要动态规划
- 按照结束时间排序，然后使用DP: dp[i] = max(dp[i-1], weight[i] + dp[j])
  - 其中j是最大的索引，使得activities[j].finish <= activities[i].start

**变种2：区间着色（或者说区间划分）**

给定一组区间，将它们划分为最少数量的组，使得每个组内的区间互不重叠。

- 贪心策略：按照区间的开始时间排序，然后尽可能将区间放入已有的组中
- 这实际上是图着色问题在区间图上的应用

#### Kruskal 最小生成树算法

最小生成树是图论中的经典问题：在连通加权无向图中，找到一棵包含所有顶点的树，使得边的权重总和最小。

**贪心策略**：每次选择权重最小的边，如果该边不会形成环，则将其加入生成树。

```cpp
struct Edge {
    int src, dest, weight;
};

// 并查集实现
class DisjointSet {
private:
    vector<int> parent, rank;
    
public:
    DisjointSet(int n) {
        parent.resize(n);
        rank.resize(n, 0);
        for (int i = 0; i < n; i++) {
            parent[i] = i;  // 每个元素初始时是自己的父节点
        }
    }
    
    // 查找元素所属的集合（路径压缩）
    int find(int x) {
        if (parent[x] != x) {
            parent[x] = find(parent[x]);
        }
        return parent[x];
    }
    
    // 合并两个集合（按秩合并）
    void unionSets(int x, int y) {
        int rootX = find(x);
        int rootY = find(y);
        
        if (rootX == rootY) return;
        
        if (rank[rootX] < rank[rootY]) {
            parent[rootX] = rootY;
        } else {
            parent[rootY] = rootX;
            if (rank[rootX] == rank[rootY]) {
                rank[rootX]++;
            }
        }
    }
};

vector<Edge> kruskalMST(vector<Edge>& edges, int V) {
    // 初始化结果
    vector<Edge> mst;
    
    // 按权重排序所有边
    sort(edges.begin(), edges.end(), 
         [](const Edge& a, const Edge& b) {
             return a.weight < b.weight;
         });
    
    // 创建并查集
    DisjointSet ds(V);
    
    // 按权重从小到大处理每条边
    for (const Edge& edge : edges) {
        int u = edge.src;
        int v = edge.dest;
        
        // 检查添加这条边是否会形成环
        if (ds.find(u) != ds.find(v)) {
            mst.push_back(edge);
            ds.unionSets(u, v);
        }
    }
    
    return mst;
}
```

**算法分析**：
- **时间复杂度**：O(E log E)或O(E log V)，其中E是边数，V是顶点数
- **空间复杂度**：O(V + E)
- **正确性**：基于切分定理，可以证明贪心选择的正确性

**最小生成树的应用场景**：
- 网络设计（最小成本连接所有节点）
- 近似算法（如解决旅行商问题的近似算法）
- 聚类分析（单链接聚类算法）
- 图像分割

贪心算法虽然不像动态规划那样通用，但在适用的问题上，它通常能提供更高效的解决方案。识别问题是否适合贪心策略，证明贪心选择的正确性，是应用贪心算法的关键。