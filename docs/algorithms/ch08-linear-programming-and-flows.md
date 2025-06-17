# 八、线性规划与网络流

## 8.1 线性规划基础

线性规划（Linear Programming，简称LP）是一种寻找线性目标函数在一系列线性约束条件下最优值的数学优化方法。它是运筹学和优化理论中最重要的技术之一，广泛应用于资源分配、生产计划、运输问题、网络流等领域。

### 8.1.1 标准形式与建模技巧

#### 线性规划的标准形式

一个线性规划问题的标准形式是：

**目标函数**：
最大化或最小化 $z = \sum_{j=1}^{n} c_j x_j$

**约束条件**：
$\sum_{j=1}^{n} a_{ij} x_j \leq b_i, \quad i = 1, 2, \cdots, m$

**非负约束**：
$x_j \geq 0, \quad j = 1, 2, \cdots, n$

其中：
- $c_j$ 是目标函数中的系数
- $a_{ij}$ 是约束条件中的系数
- $b_i$ 是约束条件的右侧常数
- $x_j$ 是决策变量

#### 矩阵表示

线性规划问题可以用矩阵形式表示为：

最大化 $\mathbf{c}^T \mathbf{x}$

约束条件：$\mathbf{A} \mathbf{x} \leq \mathbf{b}, \mathbf{x} \geq \mathbf{0}$

其中 $\mathbf{A}$ 是系数矩阵，$\mathbf{b}$ 是约束右侧常数向量，$\mathbf{c}$ 是目标函数系数向量。

#### 标准形式变换技巧

1. **最大化转最小化**：最小化 $-z$ 等价于最大化 $z$
2. **大于等于约束转换**：$\sum a_{ij} x_j \geq b_i$ 可以通过两边乘以 $-1$ 转换为 $\sum (-a_{ij}) x_j \leq -b_i$
3. **等式约束转换**：$\sum a_{ij} x_j = b_i$ 可以拆分为两个不等式 $\sum a_{ij} x_j \leq b_i$ 和 $\sum a_{ij} x_j \geq b_i$
4. **无限制变量处理**：将 $x_j$ (无限制) 替换为 $x_j = x_j^+ - x_j^-$，其中 $x_j^+, x_j^- \geq 0$

#### 建模技巧

1. **决策变量选择**：
   - 变量应该明确、完整地表示所有可能的决策
   - 优先选择直接可量化的变量

2. **约束构建**：
   - 资源限制：设备、人力、材料等资源的限制
   - 逻辑约束：互斥关系、依赖关系等
   - 平衡约束：流入=流出等平衡关系

3. **常见模型范式**：
   - 分配问题：将 n 个任务分配给 m 个资源
   - 混合问题：确定不同产品的最优生产比例
   - 运输问题：从供应点到需求点的最优运输方案
   - 多商品流问题：多种商品在网络中的最优流动

### 8.1.2 单纯形法基本思路

单纯形法（Simplex Method）是解决线性规划问题的经典算法，由George Dantzig于1947年发明。它通过在可行域的顶点间移动，寻找目标函数的最优值。

#### 基本概念

1. **基本解**：对于含有 m 个约束和 n 个变量的标准形式线性规划，基本解是指设置 n-m 个变量为 0，求解其余 m 个变量的解。
2. **基本可行解**：满足非负约束的基本解。
3. **基变量**：在基本解中非零的变量。
4. **非基变量**：在基本解中为零的变量。

#### 单纯形法的步骤

1. **初始化**：找到一个初始基本可行解（通常通过引入人工变量）
2. **最优性检验**：检查是否可以通过引入某个非基变量来改善目标函数值
3. **确定进基变量**：选择能够最大程度改善目标函数的非基变量
4. **确定出基变量**：使用比率测试确定哪个基变量应该变为非基变量
5. **更新**：计算新的基本可行解
6. **迭代**：重复步骤2-5直到达到最优解或确定无解

#### 单纯形表

单纯形法通常使用单纯形表来组织计算，例如：

| 基变量 | $x_1$ | $x_2$ | $\ldots$ | $x_n$ | 右侧常数 |
|-------|------|------|---------|------|-------|
| $x_{B1}$ | $a_{11}$ | $a_{12}$ | $\ldots$ | $a_{1n}$ | $b_1$ |
| $\vdots$ | $\vdots$ | $\vdots$ | $\ddots$ | $\vdots$ | $\vdots$ |
| $x_{Bm}$ | $a_{m1}$ | $a_{m2}$ | $\ldots$ | $a_{mn}$ | $b_m$ |
| $z-c$ | $z_1-c_1$ | $z_2-c_2$ | $\ldots$ | $z_n-c_n$ | $z$ |

#### 单纯形法的计算复杂度

- 理论上的最坏情况下，单纯形法可能需要指数级别的迭代
- 在实际应用中，单纯形法通常表现非常高效，平均复杂度接近多项式级别
- Klee-Minty立方体是单纯形法性能较差的一类问题，它需要遍历几乎所有顶点

#### 单纯形法的优化

1. **改进的初始化方法**：两阶段法、大M法
2. **改进的枢轴选择规则**：最陡下降法、Dantzig规则
3. **修订单纯形法**：利用稀疏性提高效率
4. **双重单纯形法**：从不可行但目标值优的解开始迭代

### 8.1.3 对偶性与灵敏度分析

#### 对偶问题

每个线性规划问题（原问题）都有一个对应的对偶问题。如果原问题是：

最大化 $\mathbf{c}^T \mathbf{x}$

约束条件：$\mathbf{A} \mathbf{x} \leq \mathbf{b}, \mathbf{x} \geq \mathbf{0}$

则其对偶问题是：

最小化 $\mathbf{b}^T \mathbf{y}$

约束条件：$\mathbf{A}^T \mathbf{y} \geq \mathbf{c}, \mathbf{y} \geq \mathbf{0}$

其中 $\mathbf{y}$ 是对偶变量。

#### 对偶理论的重要结论

1. **弱对偶性**：原问题任何可行解的目标值 ≤ 对偶问题任何可行解的目标值
2. **强对偶性**：如果原问题有有限的最优解，则对偶问题也有有限的最优解，且二者最优值相等
3. **互补松弛性**：在最优解处，对于每个约束和变量，要么约束等式成立，要么对应的对偶变量为零

#### 对偶问题的经济解释

对偶变量可以解释为原问题中资源的边际价值或影子价格：
- 对偶变量 $y_i$ 表示增加一单位资源 $b_i$ 能够带来的目标函数值的增加
- 对偶约束 $\mathbf{A}^T \mathbf{y} \geq \mathbf{c}$ 表示每个活动的价值不应低于其成本

#### 灵敏度分析

灵敏度分析研究当原问题的参数（如资源限制、成本系数）发生变化时，最优解会如何变化。

**常见的灵敏度分析问题**：
1. 目标函数系数变化：确定非基变量系数变化的允许范围
2. 右侧常数变化：确定资源限制变化的允许范围
3. 技术系数变化：确定约束矩阵中系数变化的允许范围

**灵敏度分析的方法**：
1. 利用最优单纯形表中的信息
2. 通过检查对偶变量和约束条件松弛量
3. 分析范围后，确定最优解的稳定性

#### 灵敏度分析的应用

1. **资源分配优化**：确定增加哪种资源最有效
2. **定价决策**：确定产品价格变化对利润的影响
3. **风险评估**：评估参数误差对解的影响

## 8.2 网络流问题

网络流问题是一类研究如何在有容量限制的网络中高效传输物质或信息的问题。它是线性规划的一个重要分支，可以通过特殊的算法高效求解。

### 8.2.1 最大流（Ford-Fulkerson、Edmonds-Karp）

#### 网络流的基本概念

**流网络**是一个有向图 $G=(V,E)$，其中：
- 每条边 $(u,v) \in E$ 有一个非负容量 $c(u,v) \geq 0$
- 图中有一个源点 $s$ 和一个汇点 $t$
- 对于 $V$ 中的任何其他顶点 $v$，都存在一条从 $s$ 到 $v$ 的路径和一条从 $v$ 到 $t$ 的路径

**网络流**是一个函数 $f: V \times V \rightarrow \mathbb{R}$ 满足：
1. **容量限制**：对于所有 $u,v \in V$，有 $0 \leq f(u,v) \leq c(u,v)$
2. **流量守恒**：对于所有 $u \in V - \{s,t\}$，有 $\sum_{v \in V} f(v,u) = \sum_{v \in V} f(u,v)$

**网络流值**是离开源点的总流量：$|f| = \sum_{v \in V} f(s,v) - \sum_{v \in V} f(v,s)$

**最大流问题**是找到一个流 $f$，使得 $|f|$ 最大。

#### Ford-Fulkerson 算法

Ford-Fulkerson 算法是解决最大流问题的经典算法：

```cpp
// 使用邻接表表示图
class FlowNetwork {
private:
    int V;  // 顶点数
    vector<vector<Edge>> adj;  // 邻接表
    
    struct Edge {
        int to;         // 边的终点
        int capacity;   // 容量
        int flow;       // 当前流量
        int rev;        // 反向边在邻接表中的索引
        
        Edge(int t, int c, int f, int r) : to(t), capacity(c), flow(f), rev(r) {}
    };
    
    // 使用BFS查找增广路径
    bool bfs(int s, int t, vector<int>& parent) {
        fill(parent.begin(), parent.end(), -1);
        parent[s] = -2;  // 标记起点已访问
        
        queue<int> q;
        q.push(s);
        
        while (!q.empty()) {
            int u = q.front();
            q.pop();
            
            for (int i = 0; i < adj[u].size(); i++) {
                Edge& e = adj[u][i];
                
                if (parent[e.to] == -1 && e.capacity > e.flow) {
                    parent[e.to] = u;
                    parent.push_back(i);  // 保存边的索引
                    
                    if (e.to == t)
                        return true;
                        
                    q.push(e.to);
                }
            }
        }
        
        return false;  // 未找到增广路径
    }
    
public:
    FlowNetwork(int vertices) : V(vertices) {
        adj.resize(V);
    }
    
    // 添加边，同时添加反向边
    void addEdge(int u, int v, int capacity) {
        // 正向边
        Edge forward(v, capacity, 0, adj[v].size());
        // 反向边
        Edge backward(u, 0, 0, adj[u].size());
        
        adj[u].push_back(forward);
        adj[v].push_back(backward);
    }
    
    // Ford-Fulkerson 算法实现
    int fordFulkerson(int s, int t) {
        int maxFlow = 0;
        vector<int> parent(V, -1);
        vector<int> edgeIndex(V, -1);
        
        // 寻找增广路径
        while (bfs(s, t, parent)) {
            // 找到路径上的最小剩余容量
            int pathFlow = INT_MAX;
            
            for (int v = t; v != s; v = parent[v]) {
                int u = parent[v];
                int i = edgeIndex[v];
                pathFlow = min(pathFlow, adj[u][i].capacity - adj[u][i].flow);
            }
            
            // 更新路径上的流量
            for (int v = t; v != s; v = parent[v]) {
                int u = parent[v];
                int i = edgeIndex[v];
                adj[u][i].flow += pathFlow;
                adj[v][adj[u][i].rev].flow -= pathFlow;  // 更新反向边
            }
            
            maxFlow += pathFlow;
        }
        
        return maxFlow;
    }
};
```

**残余网络**表示还能增加的流量，定义为：
- 对于每条边 $(u,v) \in E$ 且 $f(u,v) < c(u,v)$，有残余容量 $c_f(u,v) = c(u,v) - f(u,v)$
- 对于每条边 $(u,v) \in E$ 且 $f(u,v) > 0$，有残余容量 $c_f(v,u) = f(u,v)$

**时间复杂度**：如果使用 BFS 寻找增广路径（Edmonds-Karp 算法），复杂度为 $O(VE^2)$。

#### Edmonds-Karp 算法

Edmonds-Karp 算法是 Ford-Fulkerson 算法的一个具体实现，总是选择最短的增广路径：

```cpp
// Edmonds-Karp算法实现 - 基于BFS寻找最短增广路径
class EdmondsKarp {
private:
    struct Edge {
        int from, to;
        int capacity;
        int flow;
        
        Edge(int f, int t, int c, int fl = 0) 
            : from(f), to(t), capacity(c), flow(fl) {}
    };
    
    int n;                     // 顶点数
    vector<Edge> edges;        // 边的列表
    vector<vector<int>> graph; // 邻接表，存储边的索引
    
public:
    EdmondsKarp(int vertices) : n(vertices) {
        graph.resize(n);
    }
    
    // 添加边
    void addEdge(int from, int to, int capacity) {
        // 添加正向边
        edges.push_back(Edge(from, to, capacity));
        graph[from].push_back(edges.size() - 1);
        
        // 添加反向边（初始容量为0）
        edges.push_back(Edge(to, from, 0));
        graph[to].push_back(edges.size() - 1);
    }
    
    // 使用BFS寻找增广路径
    bool bfs(int s, int t, vector<int>& parent) {
        fill(parent.begin(), parent.end(), -1);
        parent[s] = -2; // 标记源点
        
        queue<int> q;
        q.push(s);
        
        while (!q.empty() && parent[t] == -1) {
            int u = q.front();
            q.pop();
            
            // 检查所有出边
            for (int edgeId : graph[u]) {
                Edge& e = edges[edgeId];
                
                // 如果有剩余容量且未访问过终点
                if (parent[e.to] == -1 && e.capacity > e.flow) {
                    parent[e.to] = edgeId;
                    q.push(e.to);
                }
            }
        }
        
        // 如果找到了到汇点的路径
        return parent[t] != -1;
    }
    
    // 计算最大流
    int maxFlow(int s, int t) {
        vector<int> parent(n);
        int flow = 0;
        
        // 不断寻找增广路径
        while (bfs(s, t, parent)) {
            // 找到路径上的最小剩余容量
            int pathFlow = INT_MAX;
            for (int v = t; v != s; ) {
                int edgeId = parent[v];
                Edge& e = edges[edgeId];
                pathFlow = min(pathFlow, e.capacity - e.flow);
                v = e.from;
            }
            
            // 更新路径上的流量
            for (int v = t; v != s; ) {
                int edgeId = parent[v];
                Edge& e = edges[edgeId];
                e.flow += pathFlow;
                
                // 更新反向边
                edges[edgeId ^ 1].flow -= pathFlow;
                v = e.from;
            }
            
            flow += pathFlow;
        }
        
        return flow;
    }
};
```

**性能优化**：
1. **容量缩放**：先考虑大容量边，再考虑小容量边
2. **最高标号预流推进**：使用预流而不是流，允许暂时违反流量守恒
3. **双向搜索**：同时从 $s$ 和 $t$ 进行搜索

### 8.2.2 最小费用最大流

最小费用最大流问题是在最大流的基础上，考虑每条边的单位流量费用，寻找具有最小总费用的最大流。

#### 问题定义

给定流网络 $G=(V,E)$，每条边 $(u,v) \in E$ 有容量 $c(u,v)$ 和单位费用 $a(u,v)$，求解最大流值的流 $f$ 中总费用最小的流。

总费用定义为：$cost(f) = \sum_{(u,v) \in E} a(u,v) \cdot f(u,v)$

#### 算法思路

最小费用最大流问题可以通过组合最大流算法和最短路径算法求解：

```cpp
// 最小费用最大流算法
class MinCostMaxFlow {
private:
    struct Edge {
        int from, to;
        int capacity;
        int flow;
        int cost;
        
        Edge(int f, int t, int cap, int cst, int fl = 0) 
            : from(f), to(t), capacity(cap), cost(cst), flow(fl) {}
    };
    
    int n;                     // 顶点数
    vector<Edge> edges;        // 边的列表
    vector<vector<int>> graph; // 邻接表，存储边的索引
    
    // Bellman-Ford算法寻找最短路径
    bool shortestPath(int s, int t, vector<int>& parent, vector<int>& dist) {
        fill(dist.begin(), dist.end(), INT_MAX);
        fill(parent.begin(), parent.end(), -1);
        dist[s] = 0;
        
        // n-1次迭代
        bool updated = true;
        for (int i = 0; i < n && updated; i++) {
            updated = false;
            for (int j = 0; j < edges.size(); j++) {
                Edge& e = edges[j];
                
                // 如果有剩余容量且可以更新最短距离
                if (e.capacity > e.flow && dist[e.from] != INT_MAX &&
                    dist[e.to] > dist[e.from] + e.cost) {
                    dist[e.to] = dist[e.from] + e.cost;
                    parent[e.to] = j;
                    updated = true;
                }
            }
        }
        
        // 检查是否找到了到汇点的路径
        return dist[t] != INT_MAX;
    }
    
public:
    MinCostMaxFlow(int vertices) : n(vertices) {
        graph.resize(n);
    }
    
    // 添加边
    void addEdge(int from, int to, int capacity, int cost) {
        // 添加正向边
        edges.push_back(Edge(from, to, capacity, cost));
        graph[from].push_back(edges.size() - 1);
        
        // 添加反向边（初始容量为0，成本为负）
        edges.push_back(Edge(to, from, 0, -cost));
        graph[to].push_back(edges.size() - 1);
    }
    
    // 计算最小费用最大流
    pair<int, int> minCostMaxFlow(int s, int t) {
        int maxFlow = 0;
        int minCost = 0;
        vector<int> parent(n);
        vector<int> dist(n);
        
        // 不断寻找最短增广路径
        while (shortestPath(s, t, parent, dist)) {
            // 找到路径上的最小剩余容量
            int pathFlow = INT_MAX;
            for (int v = t; v != s; ) {
                int edgeId = parent[v];
                Edge& e = edges[edgeId];
                pathFlow = min(pathFlow, e.capacity - e.flow);
                v = e.from;
            }
            
            // 更新路径上的流量和成本
            for (int v = t; v != s; ) {
                int edgeId = parent[v];
                Edge& e = edges[edgeId];
                e.flow += pathFlow;
                edges[edgeId ^ 1].flow -= pathFlow;
                minCost += pathFlow * e.cost;
                v = e.from;
            }
            
            maxFlow += pathFlow;
        }
        
        return {maxFlow, minCost};
    }
    
    // 使用Dijkstra算法的优化版本（当所有成本为非负时）
    bool dijkstra(int s, int t, vector<int>& parent, vector<int>& dist) {
        fill(dist.begin(), dist.end(), INT_MAX);
        fill(parent.begin(), parent.end(), -1);
        dist[s] = 0;
        
        priority_queue<pair<int, int>, vector<pair<int, int>>, greater<pair<int, int>>> pq;
        pq.push({0, s});
        
        while (!pq.empty()) {
            int d = pq.top().first;
            int u = pq.top().second;
            pq.pop();
            
            if (d > dist[u]) continue;
            
            for (int edgeId : graph[u]) {
                Edge& e = edges[edgeId];
                
                if (e.capacity > e.flow && dist[e.to] > dist[u] + e.cost) {
                    dist[e.to] = dist[u] + e.cost;
                    parent[e.to] = edgeId;
                    pq.push({dist[e.to], e.to});
                }
            }
        }
        
        return dist[t] != INT_MAX;
    }
};
```

**优化技术**：
1. **费用缩放**：先考虑大费用，再考虑小费用
2. **电位法（势函数法）**：使用节点电位（势能）转换费用，使得所有边的重新加权费用非负
3. **最小均摊成本循环消除**：寻找负成本循环并优化

#### 应用场景

1. **运输问题**：不同供应点到需求点的运输
2. **任务分配**：不同能力和成本的工人分配到不同任务
3. **网络路由**：考虑延迟和成本的数据路由

### 8.2.3 二分图最大匹配与匈牙利算法

二分图最大匹配是网络流的一个重要应用，而匈牙利算法是一种专门解决二分图最大匹配问题的高效算法。

#### 二分图与最大匹配

**二分图**是一个图 $G=(V,E)$，其顶点集 $V$ 可以划分为两个不相交的子集 $X$ 和 $Y$，使得图中的每条边连接的两个顶点分别来自 $X$ 和 $Y$。

**匹配**是边集的一个子集，其中任意两条边不共享顶点。

**最大匹配**是基数最大的匹配，即包含最多边的匹配。

**完美匹配**是覆盖所有顶点的匹配。

#### 匈牙利算法（增广路径算法）

匈牙利算法基于增广路径的概念，增广路径是从未匹配点出发，经过交替的非匹配边和匹配边，最后到达另一个未匹配点的路径。

```cpp
// 匈牙利算法实现
class HungarianAlgorithm {
private:
    int n, m;                 // 二分图左右两侧的顶点数
    vector<vector<int>> graph; // 邻接表表示二分图
    vector<int> match;         // 右侧顶点的匹配
    vector<bool> visited;      // 访问标记
    
    // 使用DFS寻找增广路径
    bool dfs(int u) {
        // 尝试左侧顶点u的所有邻居
        for (int v : graph[u]) {
            // 如果右侧顶点v未被访问
            if (!visited[v]) {
                visited[v] = true;
                
                // 如果v未匹配或v的匹配可以找到新的匹配
                if (match[v] == -1 || dfs(match[v])) {
                    match[v] = u;
                    return true;
                }
            }
        }
        
        return false;
    }
    
public:
    HungarianAlgorithm(int left_size, int right_size) 
        : n(left_size), m(right_size) {
        graph.resize(n);
        match.assign(m, -1);
    }
    
    // 添加一条从左侧顶点u到右侧顶点v的边
    void addEdge(int u, int v) {
        graph[u].push_back(v);
    }
    
    // 计算最大匹配
    int maxMatching() {
        int matching = 0;
        
        // 尝试为每个左侧顶点寻找匹配
        for (int u = 0; u < n; u++) {
            visited.assign(m, false);
            if (dfs(u)) {
                matching++;
            }
        }
        
        return matching;
    }
    
    // 获取匹配结果
    vector<pair<int, int>> getMatching() {
        vector<pair<int, int>> result;
        for (int v = 0; v < m; v++) {
            if (match[v] != -1) {
                result.push_back({match[v], v});
            }
        }
        return result;
    }
    
    // 使用Hopcroft-Karp算法的优化版（更高效）
    int hopcroftKarp() {
        match.assign(m, -1);
        vector<int> matchLeft(n, -1);
        vector<int> dist(n + 1);
        
        int matching = 0;
        
        // 主循环
        while (bfs(matchLeft, dist)) {
            for (int u = 0; u < n; u++) {
                if (matchLeft[u] == -1 && dfsHK(u, matchLeft, dist)) {
                    matching++;
                }
            }
        }
        
        return matching;
    }
    
private:
    // Hopcroft-Karp算法的BFS部分
    bool bfs(vector<int>& matchLeft, vector<int>& dist) {
        queue<int> q;
        
        // 初始化距离
        for (int u = 0; u < n; u++) {
            if (matchLeft[u] == -1) {
                dist[u] = 0;
                q.push(u);
            } else {
                dist[u] = INT_MAX;
            }
        }
        
        dist[n] = INT_MAX;
        
        // 通过BFS计算最短增广路径的长度
        while (!q.empty()) {
            int u = q.front();
            q.pop();
            
            if (dist[u] < dist[n]) {
                for (int v : graph[u]) {
                    if (dist[match[v]] == INT_MAX) {
                        dist[match[v]] = dist[u] + 1;
                        q.push(match[v]);
                    }
                }
            }
        }
        
        return dist[n] != INT_MAX;
    }
    
    // Hopcroft-Karp算法的DFS部分
    bool dfsHK(int u, vector<int>& matchLeft, vector<int>& dist) {
        if (u == -1) return true;
        
        for (int v : graph[u]) {
            if (dist[match[v]] == dist[u] + 1 && dfsHK(match[v], matchLeft, dist)) {
                match[v] = u;
                matchLeft[u] = v;
                return true;
            }
        }
        
        dist[u] = INT_MAX;
        return false;
    }
};
```

**时间复杂度**：匈牙利算法的时间复杂度为 $O(V \cdot E)$，Hopcroft-Karp优化版本的时间复杂度为 $O(E \cdot \sqrt{V})$。

#### 二分图最大匹配与网络流

二分图最大匹配问题可以转换为最大流问题：
1. 创建一个源点 $s$ 和一个汇点 $t$
2. 从 $s$ 到 $X$ 中的每个顶点添加容量为 1 的边
3. 从 $Y$ 中的每个顶点到 $t$ 添加容量为 1 的边
4. 保留原二分图中 $X$ 到 $Y$ 的边，容量设为 1
5. 求解最大流问题

#### 应用场景

1. **任务分配**：工人到任务的最优分配
2. **学生选课**：学生到课程的最优匹配
3. **员工调度**：员工到工作班次的安排
4. **最大独立集和最小覆盖集**：在二分图中，最大独立集和最小覆盖集问题可以通过最大匹配求解

### 8.2.4 最小割与最大流定理

**割（Cut）**：在流网络 $G=(V,E)$ 中，一个割 $(S,T)$ 是顶点集 $V$ 的一个划分，使得 $s \in S$ 且 $t \in T$。

**割的容量**：从 $S$ 到 $T$ 的边的容量之和，即 $c(S,T) = \sum_{u \in S, v \in T} c(u,v)$。

**最小割**：容量最小的割。

**最大流最小割定理**：在任何流网络中，最大流的值等于最小割的容量。

这个定理建立了最大流和最小割之间的深刻联系，它的证明基于以下观察：
1. 任何流的值不能超过任何割的容量（弱对偶性）
2. Ford-Fulkerson 算法终止时，无法找到增广路径
3. 定义 $S$ 为从源点可达的顶点集，$T$ 为其余顶点
4. 割 $(S,T)$ 的容量等于最大流值

#### 应用

1. **网络可靠性分析**：最小割对应网络中的"瓶颈"
2. **图像分割**：最小割可用于图像中的对象分割
3. **聚类**：最小割可用于将数据划分为不同的聚类

#### 全局最小割算法

对于无向图的全局最小割（不指定 $s$ 和 $t$），可以使用 Stoer-Wagner 算法，时间复杂度为 $O(V^3)$ 或使用 Karger 算法的随机化版本。

#### 多路径问题与边素独立路径

使用最大流最小割定理，可以证明：
- 从 $s$ 到 $t$ 的最大边素独立路径数 = 删除最少边使 $s$ 和 $t$ 不连通的数量
- 从 $s$ 到 $t$ 的最大顶点素独立路径数 = 删除最少顶点使 $s$ 和 $t$ 不连通的数量