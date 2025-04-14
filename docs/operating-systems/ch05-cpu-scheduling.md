# 第五章 CPU调度

## 5.1 基本概念

CPU调度的核心目标是通过在进程间切换CPU，最大化CPU利用率。在单核系统中，同一时刻只能有一个进程运行，其他进程需等待CPU空闲。多道程序设计允许多个进程驻留在内存中，当一个进程因I/O操作等待时，操作系统将CPU分配给另一个进程，从而避免资源浪费。

### 5.1.1 CPU与I/O突发周期

进程的执行由**CPU突发**（执行计算）和**I/O突发**（等待输入输出）交替构成。进程从一个CPU突发开始，完成后进入I/O突发，之后再次进入CPU突发，直至终止。CPU突发的持续时间差异很大，通常呈现指数分布：短突发较多，长突发较少。例如，I/O密集型程序（如文本编辑器）有许多短CPU突发，而CPU密集型程序（如科学计算）可能有较长的CPU突发。

这种特性对调度算法的设计至关重要。例如，短突发进程更适合快速响应，而长突发进程可能需要更长的运行时间。以下是一个简单的进程状态切换示例：

```c
// 伪代码：模拟进程的CPU和I/O突发
while (process_not_terminated) {
    execute_cpu_burst();  // 执行CPU计算
    wait_for_io();       // 等待I/O完成
}
```

### 5.1.2 CPU调度器

**CPU调度器**（或短程调度器）负责从就绪队列中选择一个进程并分配CPU。就绪队列存储所有准备运行的进程，其实现可以是FIFO队列、优先级队列、树或无序链表。调度器的选择基于调度算法（详见5.3节），决定哪个进程优先运行。

例如，在FIFO队列中，进程按到达顺序排列：

```c
// 伪代码：FIFO就绪队列
struct Process {
    int pid;
    int burst_time;
};

struct Queue {
    struct Process* processes[MAX_SIZE];
    int front, rear;
};

void enqueue(struct Queue* q, struct Process* p) {
    q->processes[q->rear++] = p;
}

struct Process* dequeue(struct Queue* q) {
    return q->processes[q->front++];
}
```

### 5.1.3 抢占与非抢占调度

CPU调度决策在以下四种情况下发生：
1. 进程从运行状态切换到等待状态（如I/O请求）。
2. 进程从运行状态切换到就绪状态（如中断）。
3. 进程从等待状态切换到就绪状态（如I/O完成）。
4. 进程终止。

- **非抢占调度**：仅在情况1和4发生时调度，进程一旦获得CPU，将运行至终止或主动等待。适用于早期系统（如Windows 3.x），但不适合交互式系统。
- **抢占调度**：在所有情况（1-4）下都可能调度，允许中断当前进程以运行更高优先级的进程。现代操作系统（如Windows、Linux、macOS）普遍采用抢占调度，但需解决共享数据访问问题（如竞争条件）。

抢占调度的实现需要计时器支持，例如：

```c
// 伪代码：抢占调度计时器
void schedule_with_timer() {
    set_timer(quantum); // 设置时间片
    while (timer_not_expired()) {
        run_current_process();
    }
    interrupt_and_switch(); // 时间片到期，切换进程
}
```

### 5.1.4 分派器

**分派器**负责将CPU控制权交给调度器选择的进程，涉及以下操作：
- 上下文切换（保存和恢复进程状态）。
- 切换到用户模式。
- 跳转到程序的正确位置继续执行。

分派器的效率直接影响系统性能，**分派延迟**（停止一个进程并启动另一个进程的时间）需尽量短。例如，Linux系统通过`vmstat`命令查看上下文切换次数：

```
procs -----------memory---------- ---swap-- -----io---- -system-- ------cpu-----
 r  b   swpd   free   buff  cache   si   so    bi    bo   in   cs us sy id wa st
 2  0      0  96864 143020 1009488    0    0     0    32  394  735  1  1 98  0  0
```

**cs** (**context switches**): 每秒上下文切换次数。

**in** (**interrupts**): 每秒中断次数。

## 5.2 调度标准

选择调度算法时需考虑以下标准：
- **CPU利用率**：希望CPU尽可能忙碌，实际系统中利用率通常在40%（轻负载）到90%（重负载）之间。
- **吞吐量**：单位时间内完成进程的数量，短进程可能达到每秒几十个，长进程可能每秒一个。
- **周转时间**：从进程提交到完成的时间，包括等待、执行和I/O时间。
- **等待时间**：进程在就绪队列中等待的总时间，仅受调度算法影响。
- **响应时间**：从提交请求到首次响应的时间，交互式系统中尤为重要。

优化目标通常是：
- 最大化CPU利用率和吞吐量。
- 最小化周转时间、等待时间和响应时间。
- 对于交互式系统，降低响应时间的方差以提高可预测性。

例如，假设三个进程的突发时间分别为24ms、3ms、3ms，计算不同算法的等待时间可以直观比较性能（详见5.3节）。

## 5.3 调度算法

调度算法决定如何从就绪队列中选择进程分配CPU。以下介绍提纲要求的算法，假设单核环境。

### 5.3.1 先来先服务（FCFS）

**FCFS**是最简单的调度算法，按进程到达顺序分配CPU，使用FIFO队列，非抢占式。

**示例**：三个进程P1、P2、P3，突发时间分别为24ms、3ms、3ms，全部在时间0到达：

```
FCFS调度
0        10        20        30
|---------|---------|---------|
[P1       24ms      ]
                    [P2 3ms]
                       [P3 3ms]
```

等待时间：
- P1：0ms
- P2：24ms
- P3：27ms
- 平均等待时间：(0 + 24 + 27) / 3 = 17ms

**问题**：
- 如果P1突发时间很长，短进程需等待，导致**队列效应**，降低CPU和设备利用率。
- 不适合交互式系统，因无法保证快速响应。

**代码示例**：

```c
void schedule_fcfs(struct Process* processes, int n) {
    int current_time = 0;
    for (int i = 0; i < n; i++) {
        printf("Running process %d from %d to %d\n",
               processes[i].pid, current_time,
               current_time + processes[i].burst_time);
        current_time += processes[i].burst_time;
    }
}
```

### 5.3.2 最短作业优先（SJF）

**SJF**选择下一次CPU突发时间最短的进程分配CPU，可抢占或非抢占。SJF在理论上是最优的，能最小化平均等待时间。

**示例**：进程P1、P2、P3、P4，突发时间分别为6ms、8ms、7ms、3ms：

```
SJF调度（非抢占）
0        10        20        24
|--------|---------|---------|
[P4 3ms ]
   [P1    6ms  ]
         [P3     7ms  ]
                [P2      8ms ]
```

等待时间：
- P1：3ms
- P2：16ms
- P3：9ms
- P4：0ms
- 平均等待时间：(3 + 16 + 9 + 0) / 4 = 7ms

**抢占式SJF**（最短剩余时间优先）：
若新进程到达时，其突发时间少于当前进程的剩余时间，则抢占。例如：

| 进程 | 到达时间 | 突发时间 |
| ---- | -------- | -------- |
| P1   | 0        | 8        |
| P2   | 1        | 4        |
| P3   | 2        | 9        |
| P4   | 3        | 5        |

```
SJF调度（抢占）
0        10        20        26
|--------|---------|---------|
[P1 1ms]
   [P2  4ms]
       [P4   5ms ]
            [P1     7ms ]
                  [P3      9ms ]
```

平均等待时间：[(10-1) + (1-1) + (17-2) + (5-3)] / 4 = 6.5ms

**挑战**：无法准确预测下一次CPU突发时间。通常使用**指数平均**预测：

$$
\tau_{n+1} = \alpha t_n + (1-\alpha) \tau_n
$$
其中，$t_n$是第n次突发的实际时间，$\tau_n$是历史预测值，$\alpha$控制新旧数据的权重（通常取0.5）。

**代码示例**：

```c
struct Process {
    int pid;
    int burst_time;
    int predicted_burst;
};

void predict_next_burst(struct Process* p, int actual_burst, float alpha) {
    p->predicted_burst = alpha * actual_burst + (1 - alpha) * p->predicted_burst;
}

void schedule_sjf(struct Process* processes, int n) {
    // 按预测突发时间排序
    sort_by_predicted_burst(processes, n);
    int current_time = 0;
    for (int i = 0; i < n; i++) {
        printf("Running process %d from %d to %d\n",
               processes[i].pid, current_time,
               current_time + processes[i].burst_time);
        current_time += processes[i].burst_time;
        predict_next_burst(&processes[i], processes[i].burst_time, 0.5);
    }
}
```

### 5.3.3 优先级调度

**优先级调度**为每个进程分配一个优先级（通常低数值表示高优先级），CPU分配给最高优先级的进程。优先级可基于时间限制、内存需求或外部因素（如任务重要性）。

**示例**：进程P1到P5，突发时间和优先级如下：

| 进程 | 突发时间 | 优先级 |
| ---- | -------- | ------ |
| P1   | 10       | 3      |
| P2   | 1        | 1      |
| P3   | 2        | 4      |
| P4   | 1        | 5      |
| P5   | 5        | 2      |

```
优先级调度
0        10        19
|--------|---------|
[P2 1ms]
   [P5   5ms ]
        [P1      10ms ]
                 [P3 2ms]
                   [P4 1ms]
```

平均等待时间：[(6-0) + (0-0) + (16-0) + (18-0) + (1-0)] / 5 = 8.2ms

**问题**：低优先级进程可能**饥饿**。**解决方法**：
- **老化**：随时间增加低优先级进程的优先级。例如，每秒优先级+1。
- 结合轮转调度（RR）处理同优先级进程。

**代码示例**：

```c
struct Process {
    int pid;
    int burst_time;
    int priority;
};

void schedule_priority(struct Process* processes, int n) {
    sort_by_priority(processes, n); // 按优先级排序（低数值高优先级）
    int current_time = 0;
    for (int i = 0; i < n; i++) {
        printf("Running process %d from %d to %d\n",
               processes[i].pid, current_time,
               current_time + processes[i].burst_time);
        current_time += processes[i].burst_time;
    }
}
```

### 5.3.4 轮转调度（RR）

**RR**专为分时系统设计，基于FCFS但加入抢占。每个进程分配一个**时间片**（通常10-100ms），超时后进程被抢占并移到队列尾部。

**示例**：进程P1、P2、P3，突发时间分别为24ms、3ms、3ms，时间片4ms：

```
RR调度（时间片=4ms）
0        10        20        30
|--------|---------|---------|
[P1 4ms]
    [P2 3ms]
       [P3 3ms]
          [P1 4ms]
              [P1 4ms]
                  [P1 4ms]
                      [P1 4ms]
                          [P1 4ms]
```

等待时间：
- P1：(10-4) = 6ms
- P2：4ms
- P3：7ms
- 平均等待时间：(6 + 4 + 7) / 3 = 5.66ms

**性能依赖时间片大小**：
- 时间片过大：退化为FCFS。
- 时间片过小：上下文切换开销增加。通常要求80%的CPU突发短于时间片。

**代码示例**：

```c
void schedule_rr(struct Process* processes, int n, int quantum) {
    struct Queue q = init_queue();
    for (int i = 0; i < n; i++) enqueue(&q, &processes[i]);
    int current_time = 0;
    while (!is_empty(&q)) {
        struct Process* p = dequeue(&q);
        int run_time = p->burst_time > quantum ? quantum : p->burst_time;
        printf("Running process %d from %d to %d\n",
               p->pid, current_time, current_time + run_time);
        current_time += run_time;
        p->burst_time -= run_time;
        if (p->burst_time > 0) enqueue(&q, p);
    }
}
```

### 5.3.5 多级队列调度

**多级队列**将就绪队列划分为多个子队列，每个队列针对不同类型的进程（如前台交互进程和后台批处理进程），并分配不同调度算法。例如：
- 前台队列：RR调度，响应时间优先。
- 后台队列：FCFS调度，吞吐量优先。

**调度方式**：
- **固定优先级**：高优先级队列优先运行，可能导致低优先级队列饥饿。
- **时间分片**：各队列按比例分配CPU时间（如前台80%，后台20%）。

**示例**：四个优先级队列：
1. 实时进程
2. 系统进程
3. 交互进程
4. 批处理进程

高优先级队列优先运行，低优先级队列需等待。

**代码示例**：

```c
struct Queue {
    struct Process* processes[MAX_SIZE];
    int priority;
};

void schedule_multilevel(struct Queue* queues, int num_queues) {
    int current_time = 0;
    for (int i = 0; i < num_queues; i++) { // 按优先级顺序
        while (!is_empty(&queues[i])) {
            struct Process* p = dequeue(&queues[i]);
            printf("Running process %d from %d to %d\n",
                   p->pid, current_time, current_time + p->burst_time);
            current_time += p->burst_time;
        }
    }
}
```

### 5.3.6 多级反馈队列调度

**多级反馈队列**允许进程在队列间移动，根据其行为动态调整优先级：
- CPU密集型进程（长突发）：移到低优先级队列。
- I/O密集型进程（短突发）：保持高优先级队列。
- 老化机制：长时间等待的进程提升优先级，避免饥饿。

**示例**：三队列系统，时间片分别为8ms、16ms，第三队列为FCFS：
- 新进程进入队列0（8ms时间片）。
- 未完成则移到队列1（16ms时间片）。
- 仍未完成则移到队列2（FCFS）。

**代码示例**：

```c
struct MLFQ {
    struct Queue queues[3];
    int quanta[3]; // 8, 16, 0（FCFS）
};

void schedule_mlfq(struct MLFQ* mlfq, struct Process* processes, int n) {
    mlfq->quanta[0] = 8; mlfq->quanta[1] = 16; mlfq->quanta[2] = 0;
    for (int i = 0; i < n; i++) enqueue(&mlfq->queues[0], &processes[i]);
    int current_time = 0;
    for (int i = 0; i < 3; i++) {
        while (!is_empty(&mlfq->queues[i])) {
            struct Process* p = dequeue(&mlfq->queues[i]);
            int run_time = (i < 2) ? mlfq->quanta[i] : p->burst_time;
            printf("Running process %d from %d to %d\n",
                   p->pid, current_time, current_time + run_time);
            current_time += run_time;
            p->burst_time -= run_time;
            if (p->burst_time > 0) enqueue(&mlfq->queues[i + 1 < 3 ? i + 1 : 2], p);
        }
    }
}
```

## 5.4 多处理器调度

多处理器系统（包括多核和多线程CPU）使调度更复杂。以下为关键点：

- **同构与异构CPU**：同构系统中所有CPU相同，进程可运行在任意CPU上。
- **调度方式**：
  - **非对称多处理（AMP）**：一个主CPU负责调度，简化设计。
  - **对称多处理（SMP）**：每个CPU自我调度，使用共享或私有就绪队列，常见于现代系统。
- **处理器亲和性**：进程倾向于在同一CPU上运行，利用缓存优势。
  - **软亲和性**：尽量保持，允许迁移。
  - **硬亲和性**：强制绑定到特定CPU。
- **负载均衡**：
  - **推迁移**：繁忙CPU将任务推送到空闲CPU。
  - **拉迁移**：空闲CPU从繁忙CPU拉取任务。
- **对称多线程（SMT）**：如超线程技术，每个物理核心提供多个逻辑处理器，提升并行性。

**示例**：Windows系统中，线程分配到“理想处理器”，避免缓存失效：

```c
// 伪代码：分配理想处理器
int assign_ideal_processor(struct Process* p, int num_cores) {
    static int seed = 0;
    int ideal_cpu = seed % num_cores;
    seed += 2; // 跳跃分配（如0,2,4...）
    return ideal_cpu;
}
```

## 5.5 线程调度

线程调度分为用户级和内核级：
- **用户级线程**：由线程库管理，映射到轻量级进程（LWP）。
- **内核级线程**：由操作系统直接调度。

**竞争范围**：
- **进程竞争范围（PCS）**：用户线程在同一进程内竞争LWP，基于优先级调度。
- **系统竞争范围（SCS）**：内核线程在系统范围内竞争CPU，常见于一对一模型（如Windows、Linux）。

**示例**：POSIX线程调度：

```c
#include <pthread.h>
void set_thread_priority(pthread_t thread, int priority) {
    struct sched_param param;
    param.sched_priority = priority;
    pthread_setschedparam(thread, SCHED_RR, &param);
}
```

## 5.6 操作系统示例

### 5.6.1 Solaris

Solaris采用基于优先级的线程调度，包含六类：
- 分时（TS）：动态调整优先级，CPU密集型进程优先级降低。
- 交互（IA）：为窗口应用提高优先级。
- 实时（RT）：最高优先级，保证响应时间。
- 系统（SYS）：用于内核线程。
- 固定优先级（FP）和公平共享（FSS）：分别用于固定优先级和资源分配。

**示例**：分时类调度表（部分）：

| 优先级 | 时间片 | 时间片耗尽后优先级 | 从睡眠返回优先级 |
| ------ | ------ | ------------------ | ---------------- |
| 0      | 200ms  | 0                  | 50               |
| 15     | 160ms  | 5                  | 51               |
| 40     | 40ms   | 30                 | 55               |

### 5.6.2 Windows XP

Windows XP使用抢占式、基于优先级的调度，优先级范围1-31：
- 实时类：16-31。
- 可变类：1-15，优先级可动态调整。
- 前台进程时间片增至三倍，提升交互体验。

**示例**：优先级计算：

| 优先级类     | 相对优先级 | 数值优先级 |
| ------------ | ---------- | ---------- |
| ABOVE_NORMAL | HIGHEST    | 12         |
| NORMAL       | NORMAL     | 8          |

### 5.6.3 Linux

Linux视进程和线程为任务，使用O(1)调度器（早期）或完全公平调度器（CFS）：
- 实时优先级：0-99。
- 普通任务（nice值）：100-140。
- CFS根据虚拟运行时间（vruntime）分配CPU，nice值低的进程获得更多CPU时间。

**示例**：nice值调整：

```bash
nice -n -5 ./myprogram # 提高优先级
nice -n 5 ./myprogram  # 降低优先级
```

## 5.7 算法评估

评估调度算法的方法包括：
- **确定性建模**：针对特定工作负载计算性能。例如，SJF通常优于FCFS，但需精确输入。
- **排队模型**：基于到达率和服务率计算平均等待时间等指标，如Little公式：$ n = \lambda \times W $。
- **模拟**：通过软件模拟系统运行，统计性能数据。支持随机生成或真实跟踪数据。
- **实现**：将算法集成到操作系统中测试，最准确但成本高。

**示例**：比较FCFS、SJF和RR（时间片10ms）：

| 进程 | 突发时间 |
| ---- | -------- |
| P1   | 10       |
| P2   | 29       |
| P3   | 3        |
| P4   | 7        |
| P5   | 12       |

- FCFS平均等待时间：28ms
- SJF平均等待时间：13ms
- RR平均等待时间：23ms

**结论**：SJF性能最佳，但实际中难以实现完美预测。
