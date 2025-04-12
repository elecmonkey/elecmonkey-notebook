# 第6章 进程同步

## 6.1 同步问题

**同步**指在多进程（或多线程）环境下，通过特定机制协调多个进程的执行顺序，确保它们有序、安全地访问共享资源（如内存、文件、设备等），避免因竞态条件导致的数据不一致或系统错误。

### 6.1.1 竞态条件

**竞态条件 (Race Condition)** 指的是两个或多个进程同时访问和操作共享数据，最终结果依赖于它们的执行顺序。即当多个进程的执行顺序不同时，可能产生不同的结果。不确定的结果一定不是我们想要的。

这一现象通常出现在并发/并行环境中。比如，两个进程同时读取计数器值，分别递增，再写回，最终只递增了一次而非两次。

```c
// 进程1执行
register1 = count;
register1 = register1 + 1;
count = register1;
```

```c
// 进程2执行
register2 = count;
register2 = register2 + 1;
count = register2;
```

假设初始count=5，并发执行后count=6（而非预期的7）。

### 6.1.2 临界区

#### 一、临界区与内核调度

**临界区 (Critical Section)** 指的是进程中访问共享资源的代码段，需要互斥访问。例如写一块内存数据、使用一台打印机。

在操作系统中，内核可以是非抢占式的或抢占式的。

**非抢占式内核 (nonpreemptive kernel)** 在内核态下不允许中断。一个进程在内核态执行时，其他进程不能打断它。非抢占式内核简化了内核的设计，因为不需要考虑内核态的上下文切换。在内核态中不需要使用锁来保护数据结构，因为不会被中断。

**抢占式内核 (preemptive kernel)** 则允许在内核态下被中断。内核可以在任何时候中断一个进程，以调度另一个进程。

在处理临界区问题时，非抢占式内核通过避免中断来确保临界区的互斥性，但现代操作系统几乎都是抢占式内核，则需要相关机制来保证互斥访问。

#### 二、临界区问题

如何确保当一个进程在临界区内执行时，其他进程不能进入临界区，这称为**临界区问题**。

```c
do {
    入口区 entry section;
    临界区 critical section;
    退出区 exit section;
    剩余区 remainder section;
} while (1);
```

这是一个通常的临界区处理的代码结构。临界区指的是实际操作需要互斥的资源的代码片段，入口区和退出区则是解决临界区问题的关键。

临界区问题的解决方案需要满足的三个要求：

- **互斥 (Mutual Exclusion)**：同一时刻只有一个进程可以在临界区内

- **空闲让进 (Progress)**：如果没有进程在临界区且有进程希望进入，则必须允许其中一个进程进入

- **有限等待 (Bounded Waiting)**：进程请求进入临界区后，在有限时间内必须获准进入


#### 三、软件解决方案
##### 1. Peterson 算法

适用于两个进程的临界区互斥控制算法。

- **基本思想**：使用两个共享变量实现互斥
  - `flag[]` 数组：表示进程希望进入临界区的意愿
  - `Turn` 变量：表示哪个进程应该让步

- **算法实现**：
  ```c
  // 全局变量
  boolean flag[2] = {false, false};  // 初始化为false
  int turn = 0;                     // 初始值可以是0或1
  
  // 进程i (i=0,1; j=1-i)的代码
  // 进入区
  flag[i] = true;                   // 表示进程i想进入临界区
  turn = j;                         // 让另一个进程j先进入(谦让)
  while (flag[j] && turn == j)      // 如果j想进且轮到j进入，则等待
      ; // 忙等待
  
  // 临界区
  // ...临界区代码...
  
  // 退出区
  flag[i] = false;                  // 表示进程i已离开临界区
  
  // 剩余区
  // ...其他代码...
  ```

- **工作原理**：
  1. 当进程 i 想进入临界区时，先设置 `flag[i]=true` 表明意愿
  2. 然后设置 `turn=j` 表示愿意让另一个进程 j 先进入
  3. 然后检查：如果进程 j 想进入 (`flag[j]=true`) 且轮到 j (`turn=j`)，则进程 i 等待
  4. 否则，进程 i 进入临界区
  5. 完成临界区操作后，设置 `flag[i]=false` 表示不再需要访问临界区

- **正确性证明**：满足临界区问题三个条件
  
  1. **互斥性**：两个进程不可能同时在临界区
     - 假设进程0和进程1同时在临界区，则 `flag[0]=flag[1]=true`
     - `turn `只能是0或1，假设 `turn=0`
     - 那么进程1在进入临界区前必须经过 `while(flag[0] && turn==0)` 判断
     - 由于条件为真，进程1应该等待，不可能进入临界区
     - 这与假设矛盾，因此互斥性成立
  
  2. **进展性**：如果没有进程在临界区且有进程想进入，则某个进程一定能进入
     - 如果只有一个进程i想进入，则 `flag[j]=false`，while条件为假，i可以进入
     - 如果两个进程都想进入，则至少有一个进程的while条件为假（因为turn只能有一个值）
  
  3. **有限等待**：进程等待进入临界区的时间是有限的
     - 如果进程 j 在临界区内，当它退出时会设置 `flag[j]=false`，进程 i 的while条件为假，可以进入
     - 如果进程 j 也在等待，则由于进程 i 已设置 `turn=j`，当 j 设置 `turn=i` 时，i可以进入临界区
  
- **局限性**：
  1. 仅适用于两个进程的情况
  2. 使用忙等待方式，浪费CPU资源
  3. 需要用户级代码自行保证互斥，容易出错

##### 2. 面包店算法

适用于多个进程的临界区互斥控制算法。

- **基本思想**：模拟面包店排号取号的场景
  - `choosing[]` 数组：表示进程是否正在选择号码
  - `number[]` 数组：表示每个进程的号码（优先级）

- **算法实现**：
  ```c
  // 全局变量
  boolean choosing[n] = {false, ..., false};  // 初始化为false
  int number[n] = {0, ..., 0};                // 初始化为0
  
  // 进程i的代码
  // 进入区
  choosing[i] = true;                         // 表示进程i正在选择号码
  number[i] = max(number[0], ..., number[n-1]) + 1;  // 选择一个号码
  choosing[i] = false;                        // 选择完成
  
  for (int j = 0; j < n; j++) {
      // 等待进程j选择号码完成
      while (choosing[j])
          ; // 忙等待
      
      // 等待所有号码更小的进程或号码相同但ID更小的进程
      while (number[j] != 0 && 
            (number[j] < number[i] || 
            (number[j] == number[i] && j < i)))
          ; // 忙等待
  }
  
  // 临界区
  // ...临界区代码...
  
  // 退出区
  number[i] = 0;                             // 表示进程i已离开临界区
  
  // 剩余区
  // ...其他代码...
  ```

- **工作原理**：
  1. 当进程 i 想进入临界区时，先设置 `choosing[i]=true` 表示正在选号
  2. 然后选择一个比当前所有号码都大的号码（这保证了新来的进程优先级较低）
  3. 设置 `choosing[i]=false` 表示选号完成
  4. 进程 i 等待所有其他进程 j 完成选号
  5. 然后等待所有号码比自己小的进程或号码相同但ID更小的进程优先进入临界区
  6. 当满足条件后，进程 i 进入临界区
  7. 完成临界区操作后，设置 `number[i]=0` 表示不再需要访问临界区

- **正确性证明**：满足临界区问题三个条件
  1. **互斥性**：两个进程不可能同时在临界区
     - 假设进程 i 和进程 j 同时在临界区
     - 则它们都有号码：`number[i]>0` 和 `number[j]>0`
     - 若 `number[i]<number[j]`，则j在进入前必须等待 i 完成
     - 若 `number[i]=number[j]` 且 `i<j`，则j必须等待 i 完成
     - 若 `number[i]>number[j]`，则 I 在进入前必须等待 j 完成
     - 这与假设矛盾，因此互斥性成立

  2. **进展性**：如果没有进程在临界区且有进程想进入，则某个进程一定能进入
     - 如果进程i想进入，它会获得一个号码
     - 具有最小号码（或相同号码但ID最小）的进程不会被阻塞

  3. **有限等待**：进程等待进入临界区的时间是有限的
     - 每个进程获得的号码是有限的
     - 进程进入临界区的顺序是按号码（和ID）严格排序的
     - 因此每个获得号码的进程最终都会进入临界区

- **局限性**：
  1. 寻找最大号码需要扫描所有进程的号码，开销较大
  2. 使用忙等待方式，浪费CPU资源
  3. 需要用户级代码自行保证互斥，容易出错
  4. 需要n个进程共享的变量较多(2n个)，不适合大规模进程

#### 四、硬件解决方案
##### TS (Test-and-Set)

```c
boolean TestAndSet(boolean *lock) {
    boolean old = *lock;
    *lock = true;
    return old;
}
```

##### CAS (Compare-and-Swap)

```c
int CompareAndSwap(int *value, int expected, int new_value) {
    int temp = *value;
    if (temp == expected)
        *value = new_value;
    return temp;
}
```

### 6.1.3 生产者-消费者问题

**生产者-消费者问题**是操作系统中一个经典的进程同步问题，也是许多实际系统的抽象模型。

生产者-消费者问题涉及两类进程：
- **生产者**：负责生产数据项（产品）并将其放入共享缓冲区
- **消费者**：负责从共享缓冲区取出数据项并消费（处理）它们

在这个问题中，生产者和消费者共享一个固定大小的缓冲区，并且需要遵循以下规则：
1. 生产者不能在缓冲区已满时放入数据
2. 消费者不能从空缓冲区取出数据
3. 在任何时刻，只能有一个进程可以访问缓冲区（互斥）

根据缓冲区的容量是否有限，还可以分为无界缓冲区、有界缓冲区两种情况。
## 6.2 同步工具

### 6.2.1 互斥锁

**互斥锁 (mutual lock)** 是一种用于多线程/多进程编程的同步机制，用于确保在任意时刻只有一个线程能访问共享资源。当一个进程进入临界区前应该得到 `acquire()` 锁，退出之后则释放 `release()` 锁，用锁保护临界区从而防止出现竞态条件。

对 `acquire()` 和 `release()` 的调用必须原子地执行，可以使用 CAS 操作实现互斥锁。

```c
acquire() {
  while (!available)
    ; // 忙等待
  available = false;
}

release() {
  available;
}
```

这种实现的主要缺点是需要**忙等待**，这显然造成了 CPU 时间的浪费。这种互斥锁也被称为**自旋锁 (spinlock)**，因为在等待锁可用的过程中一直在“自旋”。自旋锁并非没有优点，当进程必须获取锁时，持续忙等待可以避免上下文切换的开销。

互斥锁可视为计数为1的信号量。

### 6.2.2 信号量

#### 一、信号量
**信号量 (Semaphore)**是一个具有整数值的变量，只能通过两个标准原子操作访问：`wait` (`P`, 荷兰语proberen) 和 `signal` (`V`, 荷兰语verhogen)，由荷兰计算机科学家 Dijkstra 提出。

- **P操作 (wait)**：
  
  ```c
  wait(S) {
      while (S <= 0)
          ; // 等待
      S--;
  }
  ```
  
- **V操作 (signal)**：
  
  ```c
  signal(S) {
      S++;
  }
  ```

操作系统通常区分**计数信号量 (Counting Semaphore)**和**二进制信号量 (Binary Semaphore)**。

计数信号量值不受限，二进制信号量的值只能为0或1。二进制信号量类似于互斥锁。

二进制信号量（互斥锁）一般用于实现互斥访问临界区，计数信号量用于控制有限资源的访问。

#### 二、信号量的使用
1. **互斥**：使用二进制信号量确保临界区互斥访问
   ```c
   semaphore mutex = 1;
   
   // 进程代码
   wait(mutex);    // 进入临界区
   // 临界区代码
   signal(mutex);  // 离开临界区
   ```

2. **生产者-消费者问题**：
   ```c
   semaphore empty = n;   // 初始值为缓冲区大小n
   semaphore full = 0;    // 初始值为0
   semaphore mutex = 1;   // 互斥访问缓冲区
   
   // 生产者
   wait(empty);     // 等待空槽位
   wait(mutex);     // 进入临界区
   // 添加项到缓冲区
   signal(mutex);   // 离开临界区
   signal(full);    // 通知有新项可用
   
   // 消费者
   wait(full);      // 等待有数据项
   wait(mutex);     // 进入临界区
   // 从缓冲区取出项
   signal(mutex);   // 离开临界区
   signal(empty);   // 通知有空槽位
   ```

### 6.2.3 管程

#### 一、管程
**管程 (Monitor)** 是一种高级同步结构，将共享数据和操作封装在一个模块中。外部只能通过管程定义的过程访问管程内的数据，管程内部自动实现互斥，任何时刻只有一个进程可以在管程内活动。

管程的组成：

- 共享变量声明
- 操作过程（函数）
- 初始化代码
- 条件变量（用于进程同步）

条件变量操作

- **P (wait)**：当前进程等待条件满足，释放管程
- **V (signal)**：通知等待该条件的一个进程，表示条件可能已满足

#### 二、管程的实现

解决生产者-消费者问题为例：

```c
// 1. 定义管程结构
typedef struct {
    mutex lock;          // 互斥锁
    cond notFull;        // 缓冲区未满的条件变量
    cond notEmpty;       // 缓冲区非空的条件变量
    int buffer[MAX];     // 共享缓冲区
    int count = 0;       // 当前数据量
} Monitor;

// 2. 生产者操作
void produce(Monitor *mon, int item) {
    lock(mon->lock);                // 进入管程（加锁）
    while (mon->count == MAX) {     // 缓冲区满则等待
        wait(mon->notFull, mon->lock); // 释放锁并阻塞
    }
    mon->buffer[mon->count++] = item; // 生产数据
    signal(mon->notEmpty);          // 唤醒一个消费者
    unlock(mon->lock);              // 离开管程（解锁）
}

// 3. 消费者操作
int consume(Monitor *mon) {
    lock(mon->lock);                // 进入管程（加锁）
    while (mon->count == 0) {       // 缓冲区空则等待
        wait(mon->notEmpty, mon->lock); // 释放锁并阻塞
    }
    int item = mon->buffer[--mon->count]; // 消费数据
    signal(mon->notFull);           // 唤醒一个生产者
    unlock(mon->lock);              // 离开管程（解锁）
    return item;
}
```

### 6.2.3 经典同步问题

#### 一、读者-写者问题
- **问题描述**：多个进程共享数据，分为读者和写者两类
  - 读者只读取数据，不修改
  - 写者可以修改数据
  - 多个读者可以同时读取
  - 写者必须独占访问
  
- **第一读者-写者问题**：读者优先，只要有读者正在读，新读者可以直接读
  
  ```c
  semaphore mutex = 1;    // 保护readcount
  semaphore wrt = 1;      // 控制写者访问
  int readcount = 0;      // 当前正在读的进程数
  
  // 读者进程
  wait(mutex);           // 获取readcount互斥访问
  readcount++;
  if (readcount == 1)    // 第一个读者
      wait(wrt);         // 阻止写者访问
  signal(mutex);         // 释放readcount
  
  // 读取数据
  
  wait(mutex);           // 获取readcount互斥访问
  readcount--;
  if (readcount == 0)    // 最后一个读者
      signal(wrt);       // 允许写者访问
  signal(mutex);         // 释放readcount
  
  // 写者进程
  wait(wrt);             // 请求独占访问
  // 写入数据
  signal(wrt);           // 释放访问权
  ```
  
- **第二读者-写者问题**：写者优先，避免写者饥饿
  - 需要额外信号量和计数器跟踪等待的写者

#### 二、哲学家就餐问题
- **问题描述**：五个哲学家围坐一圆桌，每人两侧各有一根筷子
  
  - 哲学家交替思考和进餐
  - 进餐需要同时拿起两根筷子
  - 需要避免死锁（所有哲学家都拿起左侧筷子）
  
- **解决方案一**：最多允许四个哲学家同时拿筷子
  ```c
  semaphore mutex = 1;
  semaphore chopstick[5] = {1,1,1,1,1};
  
  // 哲学家i的代码
  while (true) {
      think();
      
      wait(mutex);       // 进入临界区
      wait(chopstick[i]);
      wait(chopstick[(i+1)%5]);
      signal(mutex);     // 离开临界区
      
      eat();
      
      signal(chopstick[i]);
      signal(chopstick[(i+1)%5]);
  }
  ```

- **解决方案二**：奇数哲学家先拿左筷子再拿右筷子，偶数哲学家相反

#### 三、睡眠理发师问题
- **问题描述**：理发店有一个理发师，一把理发椅和n把等待椅子
  
  - 没有顾客时理发师睡觉
  - 顾客到来唤醒理发师
  - 等待椅子满时新顾客离开
  
- **解决方案**：
  
  ```c
  semaphore customers = 0;  // 等待理发的顾客数
  semaphore barber = 0;     // 理发师是否可用
  semaphore mutex = 1;      // 互斥访问waiting
  int waiting = 0;          // 等待椅子上的顾客数
  
  // 理发师代码
  while (true) {
      wait(customers);      // 如果没有顾客，睡觉
      wait(mutex);          // 获取waiting互斥访问
      waiting--;
      signal(barber);       // 准备理发
      signal(mutex);        // 释放waiting
      cut_hair();           // 理发
  }
  
  // 顾客代码
  wait(mutex);              // 获取waiting互斥访问
  if (waiting < N) {        // 有等待椅子
      waiting++;
      signal(customers);    // 唤醒理发师
      signal(mutex);        // 释放waiting
      wait(barber);         // 等待理发师准备好
      get_haircut();        // 理发
  } else {
      signal(mutex);        // 释放waiting
      leave();              // 离开理发店
  }
  ```

