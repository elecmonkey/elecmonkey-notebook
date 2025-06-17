# 六、回溯与分支限界

## 6.1 回溯法

回溯法（Backtracking）是一种通过探索所有可能的解来找出所有解决方案的算法设计范式。它通过构建一棵解空间树，在搜索过程中通过剪枝来避免不必要的路径探索。

### 6.1.1 解空间树的构建与搜索

#### 解空间树

解空间树是表示问题所有可能解的树形结构：

- **根节点**：表示搜索的起点，通常是一个空解或初始状态
- **中间节点**：表示部分解或中间状态
- **叶节点**：表示完整解或最终状态
- **分支**：表示做出的选择

解空间树的构建原则：
1. 保证解空间的完备性，即包含所有可能的解
2. 避免重复解
3. 便于剪枝操作

#### 深度优先搜索策略

回溯法使用深度优先搜索（DFS）策略来遍历解空间树：

1. 从根节点开始，向下探索一个分支
2. 当到达无法继续的节点，回退到上一个节点
3. 尝试另一个未探索的分支
4. 重复直到遍历整个解空间树

```cpp
void backtrack(State state, vector<Choice>& choices) {
    if (isValid(state, choice)) {  // 前剪枝判断
        make choice
        backtrack(new_state, new_choices)
        undo choice
    }
}
```

#### 解空间的遍历顺序

回溯法的遍历顺序特点：
- **深度优先**：优先探索当前路径到最深处
- **系统性**：确保覆盖所有可能的解
- **回溯点**：记录状态以便能够回退
- **剪枝优化**：避免不必要的探索

### 6.1.2 剪枝策略

剪枝是提高回溯法效率的关键，它通过预判断、约束传播等技术，避免探索无效分支。

#### 前剪枝（进入分支前剪枝）

前剪枝在进入某个分支前，判断该分支是否可能导致有效解，如果不可能，则不进入该分支。

**特点**：
- 在递归调用前判断
- 可以大幅减少搜索空间
- 需要足够强的剪枝条件

**实现方式**：

```cpp
void backtrack(State state, vector<Choice>& choices) {
    if (isGoal(state)) {
        addToResult(state);
        return;
    }
    
    for (const Choice& choice : choices) {
        if (isValid(state, choice)) {  // 前剪枝判断
            State newState = makeChoice(state, choice);
            backtrack(newState, getNewChoices(newState, choices));
            undoChoice(state, choice);
        }
    }
}
```

#### 后剪枝（探索后剪枝）

后剪枝在探索某个分支过程中，如果发现当前分支已经无法得到有效解，则立即回溯。

**特点**：
- 在递归过程中判断
- 当发现无法继续时，提前返回
- 避免无谓的深层递归

**实现方式**：

```cpp
void backtrack(State state, vector<Choice>& choices) {
    if (isFailed(state)) {  // 后剪枝判断
        return;
    }
    
    if (isGoal(state)) {
        addToResult(state);
        return;
    }
    
    for (const Choice& choice : choices) {
        State newState = makeChoice(state, choice);
        backtrack(newState, getNewChoices(newState, choices));
        undoChoice(state, choice);
    }
}
```

#### 剪枝策略的优化方向

1. **问题特性剪枝**：利用问题的特殊性质进行剪枝
2. **对称性剪枝**：避免搜索等价的解
3. **约束传播**：利用一个选择对其他选择的约束来减少搜索空间
4. **启发式剪枝**：根据启发函数选择更有希望的分支优先探索

### 6.1.3 N 皇后、图着色、子集和问题

#### N 皇后问题

**问题描述**：在 n×n 的棋盘上放置 n 个皇后，使得它们彼此不能相互攻击（同行、同列、同对角线不能有多个皇后）。

**回溯策略**：逐行放置皇后，每放置一个皇后，就排除它所能攻击到的位置。

```cpp
vector<vector<string>> solveNQueens(int n) {
    vector<vector<string>> result;
    vector<int> queens(n, -1);  // queens[i] = j 表示在第i行第j列放置皇后
    
    function<void(int)> backtrack = [&](int row) {
        if (row == n) {
            // 将当前解添加到结果集
            vector<string> board(n, string(n, '.'));
            for (int i = 0; i < n; i++) {
                board[i][queens[i]] = 'Q';
            }
            result.push_back(board);
            return;
        }
        
        for (int col = 0; col < n; col++) {
            if (isValid(queens, row, col)) {
                queens[row] = col;
                backtrack(row + 1);
                queens[row] = -1;  // 回溯
            }
        }
    };
    
    function<bool(vector<int>&, int, int)> isValid = [](const vector<int>& queens, int row, int col) {
        for (int i = 0; i < row; i++) {
            // 检查列冲突
            if (queens[i] == col) return false;
            // 检查对角线冲突
            if (abs(queens[i] - col) == abs(i - row)) return false;
        }
        return true;
    };
    
    backtrack(0);
    return result;
}
```

**时间复杂度**：最坏情况下 O(n!)，但实际上由于剪枝，复杂度会小很多。

#### 图着色问题

**问题描述**：给定一个无向图和 m 种颜色，为图的每个顶点分配一种颜色，使得相邻顶点的颜色不同。问是否存在这样的着色方案。

**回溯策略**：逐个顶点尝试分配颜色，如果当前顶点的所有颜色都不可行，则回溯到上一个顶点。

```cpp
bool graphColoring(vector<vector<int>>& graph, int m, int n) {  // n是顶点数
    vector<int> colors(n, 0);  // 0表示未着色
    
    function<bool(int)> backtrack = [&](int vertex) {
        if (vertex == n) {
            return true;  // 所有顶点都已着色
        }
        
        for (int color = 1; color <= m; color++) {
            if (isSafe(graph, colors, vertex, color)) {
                colors[vertex] = color;
                
                if (backtrack(vertex + 1)) {
                    return true;
                }
                
                colors[vertex] = 0;  // 回溯
            }
        }
        
        return false;  // 当前顶点无法着色
    };
    
    function<bool(vector<vector<int>>&, vector<int>&, int, int)> isSafe = 
        [](const vector<vector<int>>& graph, const vector<int>& colors, int vertex, int color) {
            for (int i = 0; i < graph.size(); i++) {
                // 检查相邻顶点是否有相同颜色
                if (graph[vertex][i] && colors[i] == color) {
                    return false;
                }
            }
            return true;
        };
    
    return backtrack(0);
}
```

**时间复杂度**：O(m^n)，其中 m 是颜色数，n 是顶点数。

#### 子集和问题

**问题描述**：给定一组正整数和一个目标和 target，判断是否存在一个子集，使得子集中元素的和等于 target。

**回溯策略**：对于每个元素，有两种选择：选择它或不选择它。通过递归尝试所有可能的组合。

```cpp
bool subsetSum(vector<int>& nums, int target) {
    function<bool(int, int)> backtrack = [&](int index, int currentSum) {
        if (currentSum == target) {
            return true;
        }
        
        if (index == nums.size() || currentSum > target) {
            return false;
        }
        
        // 选择当前元素
        if (backtrack(index + 1, currentSum + nums[index])) {
            return true;
        }
        
        // 不选择当前元素
        return backtrack(index + 1, currentSum);
    };
    
    return backtrack(0, 0);
}
```

**优化**：
1. 排序数组，使较小的元素先被考虑
2. 当剩余所有元素之和小于还需要的和时，提前剪枝
3. 使用动态规划解决更大规模的问题

**时间复杂度**：O(2^n)，其中 n 是数组长度。

## 6.2 分支限界法

分支限界法（Branch and Bound）是一种用于求解优化问题的算法设计范式，它通过计算解空间树中每个节点的界限值来丢弃不可能产生最优解的分支，从而提高搜索效率。

### 6.2.1 上界估计与可行性剪枝

分支限界法的核心是通过上界（最大化问题）或下界（最小化问题）估计来剪枝，避免搜索不可能得到最优解的分支。

#### 上界与下界

- **上界（Upper Bound）**：问题解的最大可能值
- **下界（Lower Bound）**：问题解的最小可能值

在最小化问题中，如果某个节点的下界大于当前找到的最优解，那么该节点及其所有子节点都不可能产生更优的解，可以直接剪枝。

#### 可行性剪枝

除了基于界限的剪枝外，还可以通过问题的约束条件进行可行性剪枝：

1. **约束违反剪枝**：如果当前部分解已经违反了问题的某些约束条件，则可以立即剪枝
2. **资源耗尽剪枝**：如果问题涉及资源分配，且当前已耗尽资源，则剪枝
3. **不可能达到最优剪枝**：根据问题性质，判断当前分支是否可能达到最优解

#### 与回溯法的区别

分支限界法与回溯法的主要区别：

1. **搜索策略**：
   - 回溯法：通常使用深度优先搜索（DFS）
   - 分支限界法：可以使用广度优先搜索（BFS）、最佳优先搜索或其他搜索策略

2. **目标**：
   - 回溯法：通常找出所有可行解
   - 分支限界法：通常找出最优解

3. **剪枝策略**：
   - 回溯法：主要基于约束条件剪枝
   - 分支限界法：主要基于界限值剪枝

4. **适用问题**：
   - 回溯法：适用于组合优化和约束满足问题
   - 分支限界法：主要用于优化问题

### 6.2.2 搜索策略（DFS、BFS、最佳优先）

分支限界法可以采用不同的搜索策略，每种策略都有其特点和适用场景。

#### 深度优先分支限界（DFS Branch and Bound）

**特点**：
- 使用栈存储待探索的节点
- 优先探索深层节点
- 内存占用少
- 可能较快找到一个可行解，但不一定最优

**实现**：

```cpp
void dfsBranchAndBound(Node root) {
    stack<Node> nodes;
    int bestValue = INT_MIN;  // 假设是最大化问题
    
    nodes.push(root);
    
    while (!nodes.empty()) {
        Node current = nodes.top();
        nodes.pop();
        
        if (current.isLeaf()) {
            // 更新最优解
            bestValue = max(bestValue, current.value);
        } else if (current.upperBound > bestValue) {  // 剪枝判断
            // 生成子节点并按照某种顺序压栈
            vector<Node> children = current.generateChildren();
            for (const Node& child : children) {
                nodes.push(child);
            }
        }
    }
}
```

#### 广度优先分支限界（BFS Branch and Bound）

**特点**：
- 使用队列存储待探索的节点
- 按照层次顺序探索节点
- 内存占用大
- 保证找到最优解（在相同代价的情况下）

**实现**：

```cpp
void bfsBranchAndBound(Node root) {
    queue<Node> nodes;
    int bestValue = INT_MIN;  // 假设是最大化问题
    
    nodes.push(root);
    
    while (!nodes.empty()) {
        Node current = nodes.front();
        nodes.pop();
        
        if (current.isLeaf()) {
            // 更新最优解
            bestValue = max(bestValue, current.value);
        } else if (current.upperBound > bestValue) {  // 剪枝判断
            // 生成子节点并入队
            vector<Node> children = current.generateChildren();
            for (const Node& child : children) {
                nodes.push(child);
            }
        }
    }
}
```

#### 最佳优先分支限界（Best-First Branch and Bound）

**特点**：
- 使用优先队列存储待探索的节点
- 优先探索最有希望的节点（根据某种启发函数）
- 更快地向最优解收敛
- 需要设计合适的启发函数

**实现**：

```cpp
void bestFirstBranchAndBound(Node root) {
    // 优先队列，按照上界排序
    priority_queue<Node, vector<Node>, CompareByUpperBound> nodes;
    int bestValue = INT_MIN;  // 假设是最大化问题
    
    nodes.push(root);
    
    while (!nodes.empty()) {
        Node current = nodes.top();
        nodes.pop();
        
        if (current.upperBound <= bestValue) {  // 剪枝
            continue;
        }
        
        if (current.isLeaf()) {
            // 更新最优解
            bestValue = max(bestValue, current.value);
        } else {
            // 生成子节点并加入优先队列
            vector<Node> children = current.generateChildren();
            for (const Node& child : children) {
                if (child.upperBound > bestValue) {
                    nodes.push(child);
                }
            }
        }
    }
}
```

### 6.2.3 0-1 背包和旅行商问题

#### 0-1 背包问题

**问题描述**：给定 n 个物品，每个物品有重量 weight[i] 和价值 value[i]。在背包容量为 W 的限制下，选择若干物品放入背包，使得总价值最大。每个物品只能选择一次（0-1）。

**分支限界策略**：
1. 按照价值/重量比排序物品
2. 使用贪心方法计算上界
3. 使用最佳优先搜索

```cpp
struct Item {
    int weight;
    int value;
    double ratio;  // 价值/重量比
};

struct Node {
    int level;         // 当前考虑的物品
    int weight;        // 当前重量
    int value;         // 当前价值
    double upperBound; // 上界
};

bool operator<(const Node& a, const Node& b) {
    return a.upperBound < b.upperBound;  // 优先队列默认是最大堆
}

// 计算上界，使用分数物品填充剩余空间
double calculateBound(Node node, int n, int W, vector<Item>& items) {
    if (node.weight >= W) {
        return 0;
    }
    
    double bound = node.value;
    int j = node.level + 1;
    int totalWeight = node.weight;
    
    // 尽可能多地添加后续物品
    while (j < n && totalWeight + items[j].weight <= W) {
        totalWeight += items[j].weight;
        bound += items[j].value;
        j++;
    }
    
    // 尝试添加分数物品
    if (j < n) {
        bound += (W - totalWeight) * items[j].ratio;
    }
    
    return bound;
}

int knapsackBranchAndBound(vector<Item>& items, int W) {
    int n = items.size();
    
    // 按照价值/重量比排序
    for (int i = 0; i < n; i++) {
        items[i].ratio = (double)items[i].value / items[i].weight;
    }
    sort(items.begin(), items.end(), [](const Item& a, const Item& b) {
        return a.ratio > b.ratio;
    });
    
    // 创建优先队列
    priority_queue<Node> pq;
    
    // 创建根节点
    Node root = {-1, 0, 0, 0};
    root.upperBound = calculateBound(root, n, W, items);
    pq.push(root);
    
    int maxValue = 0;
    
    while (!pq.empty()) {
        Node current = pq.top();
        pq.pop();
        
        if (current.upperBound <= maxValue) {
            continue;  // 剪枝
        }
        
        // 尝试包含下一个物品
        Node withItem = {
            current.level + 1,
            current.weight + (current.level + 1 < n ? items[current.level + 1].weight : 0),
            current.value + (current.level + 1 < n ? items[current.level + 1].value : 0),
            0
        };
        
        // 检查是否是有效解
        if (withItem.weight <= W && withItem.level < n) {
            maxValue = max(maxValue, withItem.value);
            withItem.upperBound = calculateBound(withItem, n, W, items);
            if (withItem.upperBound > maxValue) {
                pq.push(withItem);
            }
        }
        
        // 尝试不包含下一个物品
        Node withoutItem = {current.level + 1, current.weight, current.value, 0};
        if (withoutItem.level < n) {
            withoutItem.upperBound = calculateBound(withoutItem, n, W, items);
            if (withoutItem.upperBound > maxValue) {
                pq.push(withoutItem);
            }
        }
    }
    
    return maxValue;
}
```

**时间复杂度**：最坏情况下 O(2^n)，但通过分支限界通常能大幅减少探索的节点数。

#### 旅行商问题 (TSP)

**问题描述**：给定 n 个城市和城市间的距离矩阵，需要访问每个城市恰好一次，并返回起点，求最短路径长度。

**分支限界策略**：
1. 使用最小生成树或最小1-树作为下界
2. 优先探索有较小下界的分支

```cpp
struct Node {
    int level;        // 当前路径包含的城市数量
    vector<int> path; // 当前的路径
    int cost;         // 当前路径的代价
    int bound;        // 下界估计
};

// 自定义比较器，用于优先队列
struct CompareNodes {
    bool operator()(const Node& lhs, const Node& rhs) const {
        return lhs.bound > rhs.bound;  // 最小堆
    }
};

// 计算下界估计
int calculateBound(Node node, const vector<vector<int>>& graph) {
    int n = graph.size();
    int bound = node.cost;
    
    // 对于当前路径中的最后一个城市
    int last = node.path.back();
    
    // 添加未访问城市的最小出边
    vector<bool> visited(n, false);
    for (int city : node.path) {
        visited[city] = true;
    }
    
    for (int i = 0; i < n; i++) {
        if (!visited[i]) {
            int minEdge = INT_MAX;
            for (int j = 0; j < n; j++) {
                if (i != j && (!visited[j] || j == 0)) {
                    minEdge = min(minEdge, graph[i][j]);
                }
            }
            bound += minEdge;
        }
    }
    
    // 添加返回起点的最小出边
    if (node.level < n) {
        int minEdge = INT_MAX;
        for (int i = 0; i < n; i++) {
            if (!visited[i]) {
                minEdge = min(minEdge, graph[last][i]);
            }
        }
        bound += minEdge;
    }
    
    return bound;
}

int tspBranchAndBound(const vector<vector<int>>& graph) {
    int n = graph.size();
    
    // 使用优先队列存储节点，按照下界升序排列
    priority_queue<Node, vector<Node>, CompareNodes> pq;
    
    // 创建初始节点，从城市0开始
    Node root = {1, {0}, 0, 0};
    root.bound = calculateBound(root, graph);
    pq.push(root);
    
    int minCost = INT_MAX;
    
    while (!pq.empty()) {
        Node current = pq.top();
        pq.pop();
        
        // 如果下界大于当前最小代价，则剪枝
        if (current.bound >= minCost) {
            continue;
        }
        
        // 如果已经访问了所有城市，检查是否形成一个完整的回路
        if (current.level == n) {
            int lastCity = current.path.back();
            if (graph[lastCity][0] != 0) {  // 如果可以返回起点
                int totalCost = current.cost + graph[lastCity][0];
                minCost = min(minCost, totalCost);
            }
        } else {
            // 尝试将下一个未访问的城市添加到路径中
            for (int i = 0; i < n; i++) {
                // 检查城市i是否已在路径中
                if (find(current.path.begin(), current.path.end(), i) == current.path.end()) {
                    int lastCity = current.path.back();
                    
                    // 创建新节点
                    Node newNode = {
                        current.level + 1,
                        current.path,
                        current.cost + graph[lastCity][i],
                        0
                    };
                    newNode.path.push_back(i);
                    
                    // 计算下界
                    newNode.bound = calculateBound(newNode, graph);
                    
                    // 如果下界小于当前最小代价，则加入优先队列
                    if (newNode.bound < minCost) {
                        pq.push(newNode);
                    }
                }
            }
        }
    }
    
    return minCost == INT_MAX ? -1 : minCost;
}
```

**时间复杂度**：最坏情况下 O(n!)，但通过分支限界通常能显著减少搜索空间。

分支限界法的效率取决于界限函数的紧密性和搜索策略。好的界限函数能更有效地剪枝，而合适的搜索策略则能更快地找到较好的解，从而提高进一步剪枝的效果。