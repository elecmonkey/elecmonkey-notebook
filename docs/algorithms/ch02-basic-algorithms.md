# 二、基础算法

## 2.1 排序与查找

排序与查找是最基础也是最常用的算法操作，它们构成了许多高级算法的基石。

### 2.1.1 常见排序算法（冒泡、选择、插入、归并、快速）

#### 冒泡排序

冒泡排序通过重复遍历待排序序列，比较并交换相邻元素，使较大元素"冒泡"到序列末端。

```cpp
void bubbleSort(vector<int>& arr) {
    int n = arr.size();
    for (int i = 0; i < n; i++) {
        for (int j = 0; j < n - i - 1; j++) {
            if (arr[j] > arr[j + 1]) {
                swap(arr[j], arr[j + 1]);
            }
        }
    }
}
```

- **时间复杂度**：最坏情况 O(n²)，最好情况 O(n)（已排序）
- **空间复杂度**：O(1)
- **稳定性**：稳定
- **适用场景**：数据量小且基本有序的情况

#### 选择排序

选择排序每次从未排序部分选择最小元素，放到已排序部分的末尾。

```cpp
void selectionSort(vector<int>& arr) {
    int n = arr.size();
    for (int i = 0; i < n; i++) {
        int min_idx = i;
        for (int j = i + 1; j < n; j++) {
            if (arr[j] < arr[min_idx]) {
                min_idx = j;
            }
        }
        swap(arr[i], arr[min_idx]);
    }
}
```

- **时间复杂度**：一致为 O(n²)
- **空间复杂度**：O(1)
- **稳定性**：不稳定
- **适用场景**：数据量小且交换成本高的情况

#### 插入排序

插入排序将序列分为已排序和未排序两部分，逐一将未排序元素插入到已排序部分的适当位置。

```cpp
void insertionSort(vector<int>& arr) {
    int n = arr.size();
    for (int i = 1; i < n; i++) {
        int key = arr[i];
        int j = i - 1;
        while (j >= 0 && arr[j] > key) {
            arr[j + 1] = arr[j];
            j--;
        }
        arr[j + 1] = key;
    }
}
```

- **时间复杂度**：最坏情况 O(n²)，最好情况 O(n)（已排序）
- **空间复杂度**：O(1)
- **稳定性**：稳定
- **适用场景**：数据量小且基本有序，或需要在线处理

#### 归并排序

归并排序采用分治策略，将序列分成两半分别排序，然后合并有序子序列。

```cpp
void merge(vector<int>& arr, int low, int mid, int high) {
    int n1 = mid - low + 1;
    int n2 = high - mid;
    
    // 创建临时数组
    vector<int> L(n1), R(n2);
    
    // 复制数据到临时数组
    for (int i = 0; i < n1; i++)
        L[i] = arr[low + i];
    for (int j = 0; j < n2; j++)
        R[j] = arr[mid + 1 + j];
    
    // 合并临时数组
    int i = 0, j = 0, k = low;
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

void mergeSort(vector<int>& arr, int low, int high) {
    if (low < high) {
        int mid = low + (high - low) / 2;
        mergeSort(arr, low, mid);
        mergeSort(arr, mid + 1, high);
        merge(arr, low, mid, high);
    }
}
```

- **时间复杂度**：一致为 O(n log n)
- **空间复杂度**：O(n)
- **稳定性**：稳定
- **适用场景**：数据量大且要求稳定排序的情况

#### 快速排序

快速排序也是分治策略，选择一个基准元素，将小于基准的元素放在左侧，大于基准的放在右侧，递归处理左右子序列。

```cpp
int partition(vector<int>& arr, int low, int high) {
    int pivot = arr[high];  // 选择最后一个元素作为基准
    int i = low - 1;  // 小于基准区域的右边界
    
    for (int j = low; j < high; j++) {
        // 当前元素小于基准时，扩展小于基准区域
        if (arr[j] <= pivot) {
            i++;
            swap(arr[i], arr[j]);
        }
    }
    
    // 将基准放到正确位置
    swap(arr[i + 1], arr[high]);
    return i + 1;  // 返回基准位置
}

void quickSort(vector<int>& arr, int low, int high) {
    if (low < high) {
        // 分区
        int pivotIndex = partition(arr, low, high);
        
        // 递归排序左右子数组
        quickSort(arr, low, pivotIndex - 1);
        quickSort(arr, pivotIndex + 1, high);
    }
}
```

- **时间复杂度**：平均 O(n log n)，最坏 O(n²)
- **空间复杂度**：平均 O(log n)，最坏 O(n)
- **稳定性**：不稳定
- **适用场景**：一般用途，平均性能最佳的比较排序

### 2.1.2 排序算法比较与选择

#### 排序算法比较

| 算法 | 平均时间复杂度 | 最坏时间复杂度 | 最好时间复杂度 | 空间复杂度 | 稳定性 |
|------|----------------|----------------|----------------|------------|--------|
| 冒泡排序 | O(n²) | O(n²) | O(n) | O(1) | 稳定 |
| 选择排序 | O(n²) | O(n²) | O(n²) | O(1) | 不稳定 |
| 插入排序 | O(n²) | O(n²) | O(n) | O(1) | 稳定 |
| 归并排序 | O(n log n) | O(n log n) | O(n log n) | O(n) | 稳定 |
| 快速排序 | O(n log n) | O(n²) | O(n log n) | O(log n) | 不稳定 |
| 堆排序 | O(n log n) | O(n log n) | O(n log n) | O(1) | 不稳定 |
| 计数排序 | O(n+k) | O(n+k) | O(n+k) | O(n+k) | 稳定 |
| 基数排序 | O(d(n+k)) | O(d(n+k)) | O(d(n+k)) | O(n+k) | 稳定 |
| 桶排序 | O(n+k) | O(n²) | O(n) | O(n+k) | 稳定 |

注：k是计数排序中数值范围，d是基数排序中数字位数。

#### 排序算法选择指南

1. **数据规模小**：
   - 插入排序（尤其当数据接近有序）
   - 选择排序（交换操作少）

2. **数据规模大**：
   - 快速排序（平均性能最佳）
   - 归并排序（稳定排序）
   - 堆排序（空间效率高）

3. **特殊需求**：
   - 稳定性要求高：归并排序、插入排序
   - 内存受限：堆排序
   - 数据分布已知且范围小：计数排序
   - 数字/字符串：基数排序

4. **实际应用**：
   - C++ STL sort：内省排序（Introsort，结合快排、堆排和插入排序）
   - Java Arrays.sort：TimSort（结合归并排序和插入排序）
   - Python sorted：TimSort
   - 数据库系统：常用B树相关结构，维护有序性

### 2.1.3 二分查找及其变种

二分查找是在有序数组中定位目标值的高效算法，时间复杂度为O(log n)。

#### 标准二分查找

```cpp
int binarySearch(const vector<int>& arr, int target) {
    int left = 0;
    int right = arr.size() - 1;
    
    while (left <= right) {
        int mid = left + (right - left) / 2;  // 避免整数溢出
        
        if (arr[mid] == target) {
            return mid;  // 找到目标
        } else if (arr[mid] < target) {
            left = mid + 1;  // 目标在右半部分
        } else {
            right = mid - 1;  // 目标在左半部分
        }
    }
    
    return -1;  // 未找到目标
}
```

- **时间复杂度**：O(log n)
- **空间复杂度**：O(1)
- **适用场景**：有序数组中精确查找元素

#### 查找第一个等于目标值的元素

```cpp
int findFirstEqual(const vector<int>& arr, int target) {
    int left = 0;
    int right = arr.size() - 1;
    int result = -1;
    
    while (left <= right) {
        int mid = left + (right - left) / 2;
        
        if (arr[mid] == target) {
            result = mid;  // 记录当前位置
            right = mid - 1;  // 继续查找左侧
        } else if (arr[mid] < target) {
            left = mid + 1;
        } else {
            right = mid - 1;
        }
    }
    
    return result;
}
```

#### 查找最后一个等于目标值的元素

```cpp
int findLastEqual(const vector<int>& arr, int target) {
    int left = 0;
    int right = arr.size() - 1;
    int result = -1;
    
    while (left <= right) {
        int mid = left + (right - left) / 2;
        
        if (arr[mid] == target) {
            result = mid;  // 记录当前位置
            left = mid + 1;  // 继续查找右侧
        } else if (arr[mid] < target) {
            left = mid + 1;
        } else {
            right = mid - 1;
        }
    }
    
    return result;
}
```

#### 查找第一个大于等于目标值的元素

```cpp
int findFirstGreaterEqual(const vector<int>& arr, int target) {
    int left = 0;
    int right = arr.size() - 1;
    int result = arr.size();  // 默认为数组长度（未找到）
    
    while (left <= right) {
        int mid = left + (right - left) / 2;
        
        if (arr[mid] >= target) {
            result = mid;  // 记录当前位置
            right = mid - 1;  // 继续查找左侧
        } else {
            left = mid + 1;
        }
    }
    
    return result;
}
```

#### 查找最后一个小于等于目标值的元素

```cpp
int findLastLessEqual(const vector<int>& arr, int target) {
    int left = 0;
    int right = arr.size() - 1;
    int result = -1;  // 默认为-1（未找到）
    
    while (left <= right) {
        int mid = left + (right - left) / 2;
        
        if (arr[mid] <= target) {
            result = mid;  // 记录当前位置
            left = mid + 1;  // 继续查找右侧
        } else {
            right = mid - 1;
        }
    }
    
    return result;
}
```

二分查找要注意以下几点：

1. 循环条件：`left <= right` vs `left < right`
2. 中点计算：`mid = left + (right - left) / 2` 防止整数溢出
3. 区间更新：左闭右闭 `[left, right]` 或左闭右开 `[left, right)`
4. 边界条件：处理数组为空、只有一个元素的情况
5. 返回值：未找到时的返回约定

## 2.2 基础数据结构

### 2.2.1 数组与链表

#### 数组

数组是最基本的数据结构，它在内存中分配一段连续的空间来存储一组同类型数据。

**特点**：
- 随机访问：O(1)时间内访问任意元素
- 插入/删除：O(n)时间复杂度（需要移动元素）
- 内存连续，空间局部性好，缓存命中率高
- 固定大小（静态数组）或可动态调整（动态数组）

**C++ 实现**：
```cpp
// 静态数组
int arr[10];

// 动态数组 (vector)
#include <vector>
std::vector<int> dynamicArray;
dynamicArray.push_back(10);  // 添加元素
dynamicArray.pop_back();     // 移除末尾元素
int element = dynamicArray[0]; // 随机访问
```

#### 链表

链表是由节点组成的线性集合，每个节点包含数据和指向下一个节点的指针。

**特点**：
- 随机访问：O(n)时间复杂度
- 插入/删除：O(1)时间复杂度（知道位置的情况下）
- 内存不连续，空间开销略大（需要额外的指针）
- 大小可动态变化

**链表的类型**：
- 单向链表：每个节点只有一个指向下一个节点的指针
- 双向链表：每个节点有两个指针，分别指向前一个和后一个节点
- 循环链表：最后一个节点指向第一个节点

**C++ 实现**：
```cpp
// 单向链表节点
struct ListNode {
    int val;
    ListNode* next;
    ListNode(int x) : val(x), next(nullptr) {}
};

// 创建和操作链表
ListNode* head = new ListNode(1);
head->next = new ListNode(2);
head->next->next = new ListNode(3);

// 遍历链表
ListNode* current = head;
while (current) {
    cout << current->val << " ";
    current = current->next;
}

// 在头部插入
ListNode* newHead = new ListNode(0);
newHead->next = head;
head = newHead;

// 删除节点（假设要删除值为2的节点）
current = head;
while (current && current->next) {
    if (current->next->val == 2) {
        ListNode* temp = current->next;
        current->next = current->next->next;
        delete temp;
        break;
    }
    current = current->next;
}
```

### 2.2.2 栈与队列

#### 栈

栈是一种遵循后进先出（LIFO）原则的线性数据结构。

**主要操作**：
- push：将元素添加到栈顶
- pop：移除栈顶元素
- top/peek：查看栈顶元素
- isEmpty：检查栈是否为空

**C++ 实现**：
```cpp
#include <stack>

std::stack<int> s;
s.push(1);        // 添加元素
s.push(2);
s.push(3);
int top = s.top(); // 访问栈顶元素 (3)
s.pop();           // 移除栈顶元素
bool empty = s.empty(); // 检查是否为空
```

**应用场景**：
- 函数调用栈
- 表达式求值
- 括号匹配
- 深度优先搜索
- 撤销操作

#### 队列

队列是一种遵循先进先出（FIFO）原则的线性数据结构。

**主要操作**：
- enqueue：将元素添加到队尾
- dequeue：移除队首元素
- front：查看队首元素
- isEmpty：检查队列是否为空

**C++ 实现**：
```cpp
#include <queue>

std::queue<int> q;
q.push(1);         // 添加元素
q.push(2);
q.push(3);
int front = q.front(); // 访问队首元素 (1)
q.pop();               // 移除队首元素
bool empty = q.empty(); // 检查是否为空
```

**特殊队列类型**：
- 循环队列：使用固定大小的数组和两个指针实现
- 双端队列：两端都可以进行插入和删除操作
- 优先队列：元素有优先级，高优先级元素先出队

**优先队列实现**：
```cpp
#include <queue>

// 默认是大顶堆
std::priority_queue<int> maxHeap;
maxHeap.push(3);
maxHeap.push(1);
maxHeap.push(4);
int highest = maxHeap.top();  // 返回4

// 小顶堆
std::priority_queue<int, std::vector<int>, std::greater<int>> minHeap;
minHeap.push(3);
minHeap.push(1);
minHeap.push(4);
int lowest = minHeap.top();  // 返回1
```

**应用场景**：
- 广度优先搜索
- 任务调度
- 缓冲区管理
- 事件处理

### 2.2.3 树（二叉树、BST）

#### 二叉树

二叉树是每个节点最多有两个子节点的树结构。

**基本概念**：
- 根节点：树的顶部节点
- 叶节点：没有子节点的节点
- 高度：从根到最远叶节点的路径上的节点数
- 深度：从根到指定节点的路径上的节点数
- 层数：从根开始计数，根是第1层

**C++ 实现**：
```cpp
struct TreeNode {
    int val;
    TreeNode* left;
    TreeNode* right;
    TreeNode(int x) : val(x), left(nullptr), right(nullptr) {}
};

// 创建一个简单的二叉树
TreeNode* root = new TreeNode(1);
root->left = new TreeNode(2);
root->right = new TreeNode(3);
root->left->left = new TreeNode(4);
root->left->right = new TreeNode(5);
```

**遍历方式**：
- 前序遍历（根-左-右）
```cpp
void preorder(TreeNode* root) {
    if (!root) return;
    cout << root->val << " ";  // 访问根节点
    preorder(root->left);      // 遍历左子树
    preorder(root->right);     // 遍历右子树
}
```

- 中序遍历（左-根-右）
```cpp
void inorder(TreeNode* root) {
    if (!root) return;
    inorder(root->left);       // 遍历左子树
    cout << root->val << " ";  // 访问根节点
    inorder(root->right);      // 遍历右子树
}
```

- 后序遍历（左-右-根）
```cpp
void postorder(TreeNode* root) {
    if (!root) return;
    postorder(root->left);     // 遍历左子树
    postorder(root->right);    // 遍历右子树
    cout << root->val << " ";  // 访问根节点
}
```

- 层序遍历（逐层从左到右）
```cpp
void levelOrder(TreeNode* root) {
    if (!root) return;
    
    queue<TreeNode*> q;
    q.push(root);
    
    while (!q.empty()) {
        TreeNode* node = q.front();
        q.pop();
        
        cout << node->val << " ";
        
        if (node->left) q.push(node->left);
        if (node->right) q.push(node->right);
    }
}
```

#### 二叉搜索树 (BST)

二叉搜索树是一种特殊的二叉树，对于树中的每个节点，其左子树中的所有节点的值都小于该节点的值，右子树中的所有节点的值都大于该节点的值。

**特点**：
- 中序遍历产生递增序列
- 平均查找、插入、删除时间复杂度为O(log n)
- 最坏情况（树退化为链表）时间复杂度为O(n)

**搜索操作**：
```cpp
TreeNode* search(TreeNode* root, int key) {
    if (!root || root->val == key)
        return root;
    
    if (key < root->val)
        return search(root->left, key);
    else
        return search(root->right, key);
}
```

**插入操作**：
```cpp
TreeNode* insert(TreeNode* root, int key) {
    if (!root)
        return new TreeNode(key);
    
    if (key < root->val)
        root->left = insert(root->left, key);
    else if (key > root->val)
        root->right = insert(root->right, key);
    
    return root;
}
```

**删除操作**：
```cpp
TreeNode* findMin(TreeNode* node) {
    while (node->left)
        node = node->left;
    return node;
}

TreeNode* deleteNode(TreeNode* root, int key) {
    if (!root) return nullptr;
    
    if (key < root->val)
        root->left = deleteNode(root->left, key);
    else if (key > root->val)
        root->right = deleteNode(root->right, key);
    else {
        // 节点有一个或没有子节点
        if (!root->left) {
            TreeNode* temp = root->right;
            delete root;
            return temp;
        } else if (!root->right) {
            TreeNode* temp = root->left;
            delete root;
            return temp;
        }
        
        // 节点有两个子节点
        TreeNode* temp = findMin(root->right);
        root->val = temp->val;
        root->right = deleteNode(root->right, temp->val);
    }
    
    return root;
}
```

### 2.2.4 图的基本表示

图是由顶点集和边集组成的数据结构，可以表示复杂的连接关系。

#### 图的表示方法

1. **邻接矩阵**：使用二维数组表示顶点间的连接关系。

```cpp
// 创建邻接矩阵表示图（n个顶点）
vector<vector<int>> adjacencyMatrix(n, vector<int>(n, 0));

// 添加无向边 (u, v) 权重为 w
void addEdge(vector<vector<int>>& graph, int u, int v, int w = 1) {
    graph[u][v] = w;
    graph[v][u] = w;  // 无向图需要双向添加
}
```

优点：
- 查询边是否存在的时间复杂度为O(1)
- 实现简单

缺点：
- 空间复杂度为O(V²)，对于稀疏图不高效
- 遍历顶点的所有邻居需要O(V)时间

2. **邻接表**：每个顶点维护一个列表，存储其相邻顶点。

```cpp
// 创建邻接表表示图（n个顶点）
vector<vector<pair<int, int>>> adjacencyList(n);

// 添加无向边 (u, v) 权重为 w
void addEdge(vector<vector<pair<int, int>>>& graph, int u, int v, int w = 1) {
    graph[u].push_back({v, w});
    graph[v].push_back({u, w});  // 无向图需要双向添加
}
```

优点：
- 空间复杂度为O(V+E)，适合稀疏图
- 快速遍历顶点的邻居

缺点：
- 查询边是否存在的时间复杂度为O(度)
- 实现略复杂

3. **边集数组**：使用数组存储所有边的信息。

```cpp
// 边的结构
struct Edge {
    int src, dest, weight;
};

// 创建边集数组
vector<Edge> edges;

// 添加边
void addEdge(vector<Edge>& edges, int u, int v, int w = 1) {
    edges.push_back({u, v, w});
}
```

优点：
- 适合某些特定算法（如Kruskal）
- 空间效率高，只存储边信息

缺点：
- 查询和遍历不便
- 不直接支持顶点操作

#### 图的类型

1. **有向图与无向图**：
   - 有向图：边有方向，从一个顶点指向另一个顶点
   - 无向图：边没有方向，顶点间可双向移动

2. **加权图与非加权图**：
   - 加权图：边有权重值
   - 非加权图：边没有权重或权重相同

3. **连通图与非连通图**：
   - 连通图：任意两个顶点之间都存在路径
   - 非连通图：存在顶点间没有路径

4. **特殊图**：
   - 完全图：任意两个顶点之间都有边
   - 二分图：顶点可分为两组，同组顶点间没有边
   - 有向无环图 (DAG)：有向且不含环的图
   - 树：连通且无环的无向图