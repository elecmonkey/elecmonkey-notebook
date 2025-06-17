# 第三章 进程

## 3.1 进程

### 3.1.1 什么是进程
进程是正在执行的程序，是现代操作系统中工作的基本单位。早期计算机一次只能运行一个程序，独占所有资源；而现代系统支持多道程序设计，允许多个程序同时加载到内存并并发执行。这需要操作系统对程序进行更严格的控制和隔离，进程的概念因此应运而生。

- **进程 vs. 程序**：
  - **程序**：静态实体，通常是存储在磁盘上的可执行文件（如 `a.out` 或 `prog.exe`）。
  - **进程**：动态实体，包含正在执行的指令、程序计数器（PC）以及相关资源。一个程序加载到内存并开始执行时成为进程。
  - 例如，双击一个可执行文件或在命令行输入 `./a.out`，会创建一个进程。

- **进程的组成**：
  一个进程的内存布局通常分为以下部分（如图3.1所示）：
  - **文本段（Text Section）**：存储可执行代码，固定大小。
  - **数据段（Data Section）**：存储全局变量，分为初始化和未初始化数据，固定大小。
  - **堆（Heap）**：运行时动态分配的内存，可动态增长或缩小。
  - **栈（Stack）**：存储函数调用时的临时数据，如参数、返回地址和局部变量，随函数调用动态变化。
  - 堆和栈在内存中向对方方向增长，但操作系统必须确保它们不重叠。

  ```plaintext
  高地址
  +-----------------+
  |      栈       |  ↓ 增长
  +-----------------+
  |                 |
  |      堆       |  ↑ 增长
  +-----------------+
  |    数据段      |
  +-----------------+
  |    文本段      |
  +-----------------+
  低地址
  ```

### 3.1.2 进程状态
进程在执行过程中会经历不同的状态，这些状态描述了进程当前的活动：
- **新建（New）**：进程正在被创建。
- **运行（Running）**：进程的指令正在被CPU执行。每个处理器核心同一时刻只能运行一个进程。
- **等待（Waiting/Blocked）**：进程等待某事件发生（如I/O完成或信号接收）。
- **就绪（Ready）**：进程已准备好，等待分配CPU。
- **终止（Terminated）**：进程执行完成，资源将被回收。

状态之间的转换如图3.2所示：

```plaintext
新建 → 就绪 → 运行 → 终止
       ↑       ↓
      等待 ←──
```

### 3.1.3 进程控制块（PCB）
操作系统通过**进程控制块（PCB）**来管理每个进程，PCB是一个数据结构，存储了进程的所有信息，包括：
- **进程状态**：如就绪、运行等。
- **程序计数器**：指向下一条待执行指令的地址。
- **CPU寄存器**：包括累加器、栈指针等，保存进程的上下文。
- **调度信息**：如优先级、队列指针。
- **内存管理信息**：如基址、界限寄存器或页面表。
- **会计信息**：记录CPU使用时间、进程号等。
- **I/O状态**：分配的I/O设备、打开的文件列表等。

在Linux中，PCB由`task_struct`结构表示，包含状态、调度信息、父子进程指针等。例如：
```c
struct task_struct {
    long state;              // 进程状态
    struct sched_entity se;  // 调度信息
    struct task_struct *parent; // 父进程
    struct list_head children;  // 子进程列表
    struct files_struct *files; // 打开文件
    struct mm_struct *mm;       // 地址空间
};
```

### 3.1.4 线程
传统进程模型中，一个进程只有一个执行线程（单线程），一次只能执行一个任务。例如，字处理程序无法同时输入字符和检查拼写。现代操作系统引入**多线程**，允许一个进程拥有多个执行线程，从而并行执行多个任务。

- **多线程优势**：在多核系统上，线程可并行运行。例如，字处理程序可分配一个线程处理用户输入，另一个线程运行拼写检查。
- **PCB扩展**：支持线程的系统在PCB中增加每个线程的信息，如线程ID、寄存器状态等。

---

## 3.2 进程调度

进程调度是操作系统管理多道程序运行的核心，目标是最大化CPU利用率（多道程序设计）和用户交互性（分时系统）。

### 3.2.1 调度目标
- **多道程序设计**：确保总有一个进程在运行，最大化CPU利用率。
- **分时系统**：频繁切换CPU，使每个程序看起来都在同时运行，用户可实时交互。

### 3.2.2 调度队列
操作系统维护多个队列来管理进程：
- **作业队列（Job Queue）**：系统中所有进程。
- **就绪队列（Ready Queue）**：在内存中等待CPU的进程，通常用链表实现。
- **设备队列（Device Queue）**：等待I/O设备的进程。

**进程流转**：
1. 新建进程进入就绪队列。
2. 被调度后分配CPU，进入运行状态。
3. 运行中可能发生：
   - 发出I/O请求，进入I/O等待队列。
   - 创建子进程，等待其终止。
   - 被中断或时间片到期，回到就绪队列。
4. 终止时，进程从所有队列移除，资源被回收。

队列示意图如图3.5所示：

```plaintext
新建 → 就绪队列 → CPU → 终止
                ↖      ↓
                ↙ I/O等待队列
```

### 3.2.3 调度器
操作系统使用不同类型的调度器来选择运行的进程：
- **长期调度器（Long-term Scheduler）**：
  - 从作业队列选择进程加载到内存，进入就绪队列。
  - 执行频率低，控制多道程序的程度。
  - 选择I/O密集型（短CPU突发）和CPU密集型（长CPU突发）进程的平衡。
  - 分时系统中可能不存在（如UNIX、Windows）。
- **短期调度器（Short-term Scheduler）**：
  - 从就绪队列选择进程分配CPU。
  - 执行频繁（约每100ms一次），必须快速。
  - 调度开销约占CPU时间的9%（10ms调度周期）。
- **中期调度器（Medium-term Scheduler）**：
  - 将进程换出到磁盘，减少内存中的进程数，释放内存。
  - 换出的进程可稍后换回继续执行。

### 3.2.4 上下文切换
上下文切换是操作系统在进程间切换CPU时保存和恢复进程状态的过程：
- **步骤**：
  1. 保存当前进程的上下文（寄存器、程序计数器等）到其PCB。
  2. 加载新进程的上下文从其PCB到CPU。
- **开销**：上下文切换是纯开销，不执行有用工作，耗时约几微秒，取决于硬件支持（如寄存器数量、内存速度）。
- **硬件优化**：一些处理器提供多组寄存器，上下文切换只需更改寄存器组指针，效率更高。

上下文切换示意图如图3.6所示：

```plaintext
进程A → 保存上下文到PCB → 加载进程B的上下文 → 进程B
```

## 3.3 进程操作

### 3.3.1 进程创建
进程可以动态创建其他进程，形成父子关系，构成进程树。每个进程由唯一的**进程标识符（pid）**区分。

- **资源分配**：
  - 子进程可直接从操作系统获取资源，或使用父进程资源的子集。
  - 父进程可能在子进程间分区或共享资源（如内存、文件）。
- **执行方式**：
  - 父进程与子进程并发执行。
  - 父进程等待子进程终止。
- **地址空间**：
  - 子进程复制父进程的地址空间。
  - 子进程加载新程序，覆盖原有地址空间。

**UNIX示例**：
在UNIX/Linux中，进程创建使用 `fork()` 系统调用，复制父进程的地址空间。子进程返回0，父进程返回子进程的pid。常与 `exec()` 结合使用，加载新程序。

```c
#include <sys/types.h>
#include <stdio.h>
#include <unistd.h>

int main() {
    pid_t pid = fork(); // 创建子进程
    if (pid < 0) { // 错误处理
        fprintf(stderr, "Fork Failed\n");
        return 1;
    } else if (pid == 0) { // 子进程
        execlp("/bin/ls", "ls", NULL); // 执行ls命令
    } else { // 父进程
        wait(NULL); // 等待子进程结束
        printf("Child Complete\n");
    }
    return 0;
}
```

**Windows示例**：
Windows使用`CreateProcess()`创建进程，直接加载指定程序，不复制父进程地址空间。

```c
#include <windows.h>
#include <stdio.h>

int main() {
    STARTUPINFO si = { sizeof(si) };
    PROCESS_INFORMATION pi;
    if (!CreateProcess(NULL, "mspaint.exe", NULL, NULL, FALSE, 0, NULL, NULL, &si, &pi)) {
        fprintf(stderr, "Create Process Failed\n");
        return -1;
    }
    WaitForSingleObject(pi.hProcess, INFINITE); // 等待子进程
    printf("Child Complete\n");
    CloseHandle(pi.hProcess);
    CloseHandle(pi.hThread);
    return 0;
}
```

### 3.3.2 进程终止
进程终止时，操作系统回收其资源（如内存、文件句柄）。

- **正常终止**：
  - 进程执行完最后语句，调用`exit()`，返回状态值给父进程。
  - 父进程通过`wait()`获取子进程的退出状态。
- **异常终止**：
  - 父进程可通过系统调用（如Windows的`TerminateProcess()`）终止子进程，原因包括：
    - 子进程超出资源限制。
    - 子进程任务不再需要。
    - 父进程退出，触发级联终止（某些系统要求子进程随父进程终止）。
- **僵尸进程**：
  - 子进程终止但父进程尚未调用`wait()`，PCB仍保留，称为僵尸进程。
  - 传统UNIX中，孤儿进程（父进程已终止）由`init`（或Linux的`systemd`）接管，定期调用`wait()`清理。

**UNIX终止示例**：
```c
#include <sys/wait.h>
#include <stdlib.h>

pid_t pid = fork();
if (pid == 0) {
    // 子进程
    exit(1); // 退出并返回状态1
} else {
    int status;
    wait(&status); // 父进程等待并获取状态
    printf("Child exited with status %d\n", WEXITSTATUS(status));
}
```

## 3.4 POSIX Process API 总结

在UNIX-like系统（如Linux、macOS）中，操作系统通过一套标准的系统调用（System Calls）来提供进程管理的功能。这些API是POSIX（Portable Operating System Interface）标准的一部分，旨在提供跨不同UNIX-like系统的可移植性。以下是一些最核心的进程管理API：

### 3.4.1 `fork()`：创建子进程

- **功能**：`fork()`系统调用用于创建一个新的进程，称为子进程（child process）。子进程是父进程（parent process）的一个几乎完全相同的副本。
- **返回值**：
  - **父进程**：`fork()`返回新创建子进程的进程ID（PID）。
  - **子进程**：`fork()`返回0。
  - **错误**：如果创建失败（例如，系统资源不足），`fork()`返回-1。
- **特性**：
  - **复制地址空间**：子进程会获得父进程地址空间的一个副本。在现代系统中，通常采用**写时复制（Copy-on-Write, COW）**机制来优化性能，即父子进程最初共享相同的物理页面，只有当任一进程尝试写入这些页面时，才会为修改方创建私有副本。
  - **继承资源**：子进程会继承父进程的大部分资源，如打开的文件描述符、当前工作目录、信号处理设置等。
  - **独立执行**：尽管子进程是父进程的副本，但它们是独立的进程，拥有各自的PID，并在后续可以独立执行不同的代码。

**示例**：
```c
#include <stdio.h>
#include <unistd.h>
#include <sys/types.h>

int main() {
    pid_t pid;
    printf("Parent process (PID: %d) is about to fork.\n", getpid());
    pid = fork();

    if (pid < 0) {
        fprintf(stderr, "Fork failed!\n");
        return 1;
    } else if (pid == 0) {
        // 子进程的执行路径
        printf("This is the child process (PID: %d), my parent is %d.\n", getpid(), getppid());
    } else {
        // 父进程的执行路径
        printf("This is the parent process (PID: %d), my child is %d.\n", getpid(), pid);
    }
    return 0;
}
```

### 3.4.2 `exec()`系列：加载并执行新程序

- **功能**：`exec()`系列函数（如`execlp`, `execvp`, `execve`等）用于在当前进程的地址空间中加载并执行一个全新的程序。一旦`exec()`成功调用，原程序的代码和数据将被新程序的代码和数据覆盖，不再返回到调用`exec()`的程序。
- **用途**：`fork()`通常与`exec()`结合使用，形成经典的 fork-exec 模式，即父进程`fork`一个子进程，子进程随后`exec`一个新程序。这是创建新程序的标准方式，例如，shell执行命令时就是这样做的。
- **主要变体**：
  - `l` 后缀（如`execl`, `execlp`）：参数列表以逗号分隔，以`NULL`结尾。
  - `v` 后缀（如`execv`, `execvp`）：参数列表以字符串数组形式传递。
  - `p` 后缀（如`execlp`, `execvp`）：会在系统的`PATH`环境变量中查找可执行文件。
  - `e` 后缀（如`execle`, `execve`）：允许传入新的环境变量数组。
- **返回值**：如果`exec()`成功，它永远不会返回。只有在失败时（例如，找不到文件或权限问题），它才会返回-1。

**示例**（结合`fork()`）：
```c
#include <stdio.h>
#include <unistd.h>
#include <sys/types.h>
#include <sys/wait.h>

int main() {
    pid_t pid;
    pid = fork();

    if (pid < 0) {
        fprintf(stderr, "Fork failed!\n");
        return 1;
    } else if (pid == 0) {
        // 子进程：执行ls命令
        printf("Child process (PID: %d) is executing ls.\n", getpid());
        execlp("/bin/ls", "ls", "-l", NULL); // 执行 /bin/ls -l
        perror("exec failed"); // 如果execlp失败，会执行到这里
        return 1; // 告知父进程子进程执行失败
    } else {
        // 父进程：等待子进程结束
        int status;
        printf("Parent process (PID: %d) is waiting for child %d.\n", getpid(), pid);
        wait(NULL); // 等待任意子进程终止
        printf("Child process has terminated.\n");
    }
    return 0;
}
```

### 3.4.3 `wait()` 和 `waitpid()`：等待子进程终止

- **功能**：父进程可以使用`wait()`或`waitpid()`系统调用来等待其子进程终止。这些调用允许父进程获取子进程的退出状态，并回收子进程的资源（避免僵尸进程）。
- **`wait()`**：
  - **等待条件**：会阻塞父进程，直到其任意一个子进程终止。
  - **返回值**：返回终止子进程的PID；如果没有任何子进程，返回-1。
  - **参数**：通常接收一个指向`int`的指针，用于存储子进程的退出状态。
- **`waitpid()`**：
  - **更灵活**：允许父进程等待特定的子进程终止，或者以非阻塞方式检查子进程状态。
  - **参数**：
    - `pid`：指定要等待的子进程PID。特殊值如-1（等待任意子进程），0（等待与父进程在同一进程组的所有子进程）。
    - `status`：与`wait()`相同，用于存储退出状态。
    - `options`：控制`waitpid`行为的标志，如`WNOHANG`（非阻塞，如果子进程未终止则立即返回0）。
  - **返回值**：返回终止子进程的PID；如果指定`WNOHANG`且子进程未终止，返回0；错误返回-1。

**示例**：
```c
#include <stdio.h>
#include <unistd.h>
#include <sys/types.h>
#include <sys/wait.h>
#include <stdlib.h>

int main() {
    pid_t pid;
    pid = fork();

    if (pid < 0) {
        fprintf(stderr, "Fork failed!\n");
        return 1;
    } else if (pid == 0) {
        // 子进程
        printf("Child process (PID: %d) is running...\n", getpid());
        sleep(2); // 模拟子进程工作2秒
        printf("Child process (PID: %d) exiting.\n", getpid());
        exit(10); // 子进程以状态10退出
    } else {
        // 父进程
        int status;
        printf("Parent process (PID: %d) is waiting for child %d...\n", getpid(), pid);
        pid_t terminated_pid = waitpid(pid, &status, 0); // 等待特定子进程

        if (terminated_pid == -1) {
            perror("waitpid failed");
            return 1;
        } else {
            printf("Child %d terminated.\n", terminated_pid);
            if (WIFEXITED(status)) { // 检查子进程是否正常退出
                printf("Child exited with status: %d\n", WEXITSTATUS(status));
            } else if (WIFSIGNALED(status)) { // 检查子进程是否被信号终止
                printf("Child terminated by signal: %d\n", WTERMSIG(status));
            }
        }
    }
    return 0;
}
```

### 3.4.4 `exit()`：进程正常终止

- **功能**：`exit()`函数用于进程的正常终止。它会执行一系列清理工作，包括关闭所有打开的文件流、调用注册的`atexit()`函数等，然后将进程的退出状态返回给父进程（如果父进程正在等待）。
- **参数**：`status`参数是一个整数，代表进程的退出状态。通常，0表示成功，非零值表示不同的错误或异常情况。
- **与`return`的区别**：在`main()`函数中，`return`语句的效果与`exit()`类似，但`exit()`是系统调用，可以从程序中的任何位置调用以立即终止进程，而`return`只会从当前函数返回。

**示例**：
```c
#include <stdio.h>
#include <stdlib.h>

void cleanup_function() {
    printf("Cleanup function called before exit.\n");
}

int main() {
    atexit(cleanup_function); // 注册一个在exit时调用的函数
    printf("Program is about to exit.\n");
    // 模拟一些工作...
    if (/* some error condition */ 0) {
        exit(1); // 发生错误，以状态1退出
    } else {
        exit(0); // 正常完成，以状态0退出
    }
    printf("This line will not be executed.\n"); // exit后不会执行
    return 0; // 如果没有exit，会执行到这里，效果类似exit(0)
}
```

## 3.5 进程间通信（IPC）

进程分为**独立进程**（不共享数据）和**协作进程**（共享数据，相互影响）。协作进程需要通过IPC机制交换数据。

### 3.5.1 协作原因
- **信息共享**：多个程序访问同一数据（如剪贴板）。
- **计算加速**：将任务分解为子任务并行执行（需多核支持）。
- **模块化**：将系统功能划分为独立的进程或线程。
- **便利性**：提高开发和维护效率。

### 3.5.2 IPC模型
有两种主要的IPC模型：**共享内存**和**消息传递**。

#### 3.5.2.1 共享内存
- **原理**：协作进程共享一块内存区域，通过读写共享内存交换数据。
- **特点**：
  - 速度快：访问速度接近普通内存，仅需系统调用建立共享区域。
  - 进程需自行管理数据一致性，避免同时写入同一位置。
- **实现**：
  - 创建共享内存区域（通常由一个进程创建）。
  - 其他进程附加到该区域。
  - 操作系统允许进程访问共享内存，绕过常规内存隔离。

**生产者-消费者问题**：
一个经典的协作进程场景，生产者生成数据，消费者使用数据。使用共享内存实现时，需维护一个缓冲区：

```c
#define BUFFER_SIZE 10
typedef struct { ... } item;
item buffer[BUFFER_SIZE];
int in = 0;  // 指向下一个空位
int out = 0; // 指向下一个满位

// 生产者
item next_produced;
while (true) {
    while (((in + 1) % BUFFER_SIZE) == out); // 等待缓冲区非满
    buffer[in] = next_produced;
    in = (in + 1) % BUFFER_SIZE;
}

// 消费者
item next_consumed;
while (true) {
    while (in == out); // 等待缓冲区非空
    next_consumed = buffer[out];
    out = (out + 1) % BUFFER_SIZE;
}
```

- **问题**：上述代码允许最多`BUFFER_SIZE-1`个元素，需同步机制（将在第6章讨论）确保正确性。

#### 3.5.2.2 消息传递
- **原理**：进程通过发送和接收消息进行通信，消息由操作系统传递。
- **特点**：
  - 速度较慢：需内核干预。
  - 易于实现，尤其适合分布式系统。
  - 无需进程管理共享内存冲突。
- **操作**：
  - `send(message)`：发送消息。
  - `receive(message)`：接收消息。
- **消息大小**：
  - 固定大小：系统实现简单，编程复杂。
  - 可变大小：系统复杂，编程方便。

**消息传递实现方式**：
- **命名**：
  - **直接通信**：明确指定发送/接收进程（如`send(P, msg)`、`receive(Q, msg)`）。
    - 对称寻址：双方需互相命名。
    - 非对称寻址：接收方无需指定发送方。
    - 缺点：进程ID硬编码，修改不灵活。
  - **间接通信**：通过邮箱（mailbox）或端口通信（如`send(A, msg)`、`receive(A, msg)`）。
    - 邮箱可被多个进程共享。
    - 问题：多个接收者时谁接收消息？可限制为两进程、单一接收者或随机选择。
- **同步**：
  - **阻塞（同步）**：发送/接收进程等待消息传递完成（称为“会合”）。
  - **非阻塞（异步）**：发送/接收后立即继续。
  - 常见组合：阻塞发送+阻塞接收，或非阻塞发送+阻塞接收。
- **缓冲**：
  - **零容量**：发送者等待接收者（会合）。
  - **有限容量**：缓冲区满时发送者等待。
  - **无限容量**：发送者从不等待。

**生产者-消费者消息传递示例**（伪代码）：
```c
// 生产者
while (true) {
    produce_item(&item);
    send(consumer, item);
}

// 消费者
while (true) {
    receive(producer, &item);
    consume_item(item);
}
```

## 3.6 IPC系统示例

### 3.6.1 POSIX共享内存
POSIX提供标准API用于共享内存通信：
- **创建**：`shmget()`分配共享内存段。
- **附加**：`shmat()`将共享内存附加到进程地址空间。
- **操作**：直接读写共享内存。
- **分离/删除**：`shmdt()`分离，`shmctl()`删除。

**示例代码**：
```c
#include <sys/shm.h>
#include <stdio.h>

int main() {
    int shmid = shmget(IPC_PRIVATE, 1024, IPC_CREAT | 0666);
    char *shm = shmat(shmid, NULL, 0);
    sprintf(shm, "Hello, shared memory!");
    printf("Written: %s\n", shm);
    shmdt(shm);
    shmctl(shmid, IPC_RMID, NULL);
    return 0;
}
```

### 3.6.2 Mach消息传递
Mach操作系统（用于macOS和iOS）以消息传递为核心，使用端口（port）作为通信端点：
- 进程创建时获得内核端口和通知端口。
- 操作：`msg_send()`、`msg_receive()`、`msg_rpc()`。
- 同步：非阻塞（邮箱未满）或阻塞（可选超时）。

### 3.6.3 Windows本地过程调用（LPC）

Windows XP使用LPC进行同一机器上的进程通信：

- **机制**：通过连接端口和通信端口传递消息。

- **过程**：

  1. 客户端打开服务器的连接端口。

  2. 服务器创建两个通信端口，返回一个给客户端。

  3. 通过端口交换消息。

- **优化**：

  - 小消息（<256字节）：通过端口队列复制。

  - 大消息：通过共享内存避免复制。

## 3.7 客户端-服务器通信

客户端-服务器系统是常见的协作进程模型，常用通信方式包括套接字（Sockets）和远程过程调用（RPC）。

### 3.7.1 套接字
套接字是网络通信的端点，由IP地址和端口号标识：
- **模型**：服务器监听端口，客户端连接到服务器。
- **端口**：<1024的端口为“知名端口”，用于标准服务。
- **特点**：低级别，传输字节流，需应用层定义数据结构。

**Java日期服务器示例**：
```java
import java.net.*;
import java.io.*;

public class DateServer {
    public static void main(String[] args) {
        try {
            ServerSocket sock = new ServerSocket(6013);
            while (true) {
                Socket client = sock.accept();
                PrintWriter pout = new PrintWriter(client.getOutputStream(), true);
                pout.println(new java.util.Date().toString());
                client.close();
            }
        } catch (IOException e) {
            System.err.println(e);
        }
    }
}
```

**客户端**：
```java
import java.net.*;
import java.io.*;

public class DateClient {
    public static void main(String[] args) {
        try {
            Socket sock = new Socket("127.0.0.1", 6013);
            BufferedReader bin = new BufferedReader(new InputStreamReader(sock.getInputStream()));
            String line;
            while ((line = bin.readLine()) != null)
                System.out.println(line);
            sock.close();
        } catch (IOException e) {
            System.err.println(e);
        }
    }
}
```

### 3.7.2 远程过程调用（RPC）
RPC抽象了网络通信，允许客户端像调用本地函数一样调用远程服务：
- **原理**：
  - 客户端调用存根（stub），存根将参数打包（序列化）并发送到服务器。
  - 服务器存根解包参数，调用实际函数，返回结果。
- **参数序列化**：
  - 处理客户端和服务器的数据表示差异（如大端/小端）。
  - 使用外部数据表示（XDR）标准化数据格式。
- **语义**：
  - **最多一次（At Most Once）**：通过时间戳避免重复执行。
  - **精确一次（Exactly Once）**：结合ACK机制，确保请求被执行且仅执行一次。
- **绑定**：
  - 固定端口：简单但不灵活。
  - 动态绑定：通过匹配守护进程（matchmaker）查询端口。

**Android RPC**：
Android使用binder框架提供本地RPC，服务通过`bindService()`绑定，客户端调用远程方法：
```java
interface RemoteService {
    boolean remoteMethod(int x, double y);
}
```

