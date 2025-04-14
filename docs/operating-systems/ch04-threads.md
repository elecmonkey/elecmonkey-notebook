# 第四章 线程

## 4.1 线程

### 4.1.1 定义与组成
线程是CPU利用的基本单位，是进程内的一个执行流。每个线程包含以下组件：
- **线程ID**：唯一标识线程。
- **程序计数器（PC）**：记录当前执行的指令地址。
- **寄存器集**：保存线程的运行状态（如CPU寄存器）。
- **栈**：用于存储局部变量和函数调用信息。

线程与同一进程中的其他线程共享以下资源：
- **代码段**：程序的指令代码。
- **数据段**：全局变量和堆内存。
- **操作系统资源**：如打开的文件、信号等。

与进程不同，进程是资源分配的单位，而线程是调度的单位。线程的轻量级特性使其创建和切换开销远低于进程。例如，假设一个文本编辑器进程有多个线程：一个处理用户输入，一个保存文件，一个检查拼写，这些线程共享相同的内存空间和文件句柄，但各自维护独立的执行状态。

### 4.1.2 进程类型
- **传统（重量级）进程**：仅包含单一控制线程，执行单一任务。
- **轻量级进程**：包含多个控制线程，可同时执行多个任务。

例如，一个Web浏览器进程可能包含：
- 一个线程渲染页面。
- 一个线程处理网络请求。
- 一个线程运行JavaScript脚本。

这些线程并行工作，提高了浏览器的响应速度。

### 4.1.3 线程的动机
多线程编程广泛应用于现代软件，如Web浏览器、文本编辑器、数据库服务器等。多线程的主要目的是：
- **提高并发性**：在多核系统上，线程可并行运行，充分利用CPU资源。
- **增强用户体验**：如在界面线程之外运行耗时任务，避免程序卡顿。
- **简化程序设计**：将复杂任务分解为多个线程，便于管理。

### 4.1.4 多线程的优点
多线程编程带来以下四大好处：
1. **响应性**：  

   多线程允许程序在部分线程阻塞时继续运行。例如，在下载文件时，界面线程仍可响应用户操作。  

   **代码示例**（伪代码）：

   ```c
   void download_file() {
       // 耗时操作
       while (downloading) { /* 下载数据 */ }
   }
   void main_thread() {
       create_thread(download_file); // 新线程下载
       while (true) { /* 处理用户输入 */ }
   }
   ```

2. **资源共享**：  

   线程默认共享进程的内存和资源，无需像进程间通信那样使用共享内存或消息传递。 

   在一个多线程Web服务器中，所有线程共享相同的页面缓存，减少内存开销。

3. **经济性**：  
   - 线程创建比进程创建快约30倍。

   - 线程上下文切换比进程切换快约5倍。  

     **原因**：线程共享进程的地址空间，无需复制大量数据结构。

4. **多处理器利用率**：  

   在多核系统上，线程可并行运行于不同核心，提升性能。  

   例如，在四核CPU上，一个单线程程序只能利用一个核心，而四个线程可同时运行，理论上性能提升4倍（受限于Amdahl定律，实际提升可能较低）。

### 4.1.5 线程特定数据（TLS）
- **定义**：每个线程拥有自己的数据副本，类似静态变量但线程独享。  
- **用途**：如为每个事务线程分配唯一ID。  
- **Pthreads TLS示例**：
  ```c
  #include <pthread.h>
  pthread_key_t key;
  void *thread_func(void *arg) {
      pthread_setspecific(key, malloc(sizeof(int))); // 设置TLS
      // 使用TLS
  }
  int main() {
      pthread_key_create(&key, NULL);
      pthread_t tid;
      pthread_create(&tid, NULL, thread_func, NULL);
      pthread_join(tid, NULL);
      return 0;
  }
  ```

TLS与局部变量不同，生命周期跨函数调用，适合存储线程私有状态。

## 4.2 多线程模型

线程分为**用户线程**（由用户程序管理）和**内核线程**（由操作系统管理）。用户线程需要映射到内核线程以执行，映射模型包括以下三种：

### 4.2.1 用户线程与内核线程
- **用户线程**：
  - 由用户态线程库（如POSIX Pthreads）管理。
  - 不依赖内核，创建和调度开销小。
  - 示例：Solaris的Green Threads。
- **内核线程**：
  - 由操作系统直接管理。
  - 支持真正的并行执行。
  - 示例：Linux、Windows的线程。

用户线程适合轻量级任务，但若线程阻塞（如I/O操作），可能导致整个进程阻塞。内核线程支持并发，但创建和管理开销较大。

### 4.2.2 线程映射模型
#### 一、多对一模型 (Many-to-One) 

多个用户线程映射到一个内核线程。  

**优点**：  线程管理在用户空间，效率高，无需频繁系统调用。

**缺点**：  

- 一个线程的阻塞系统调用会导致整个进程阻塞。
- 无法利用多核并行。  

**示例**：  

Solaris早期Green Threads。  

**代码示例**（伪代码，展示用户线程库）：

```c
thread_library_create_thread(task); // 用户态创建线程
```

#### 二、一对一模型 (One-to-One)

每个用户线程映射到一个内核线程。  

**优点**：  

- 支持真正的并行，适合多核系统。
- 一个线程阻塞不影响其他线程。  

**缺点**：  

- 创建内核线程开销较大，可能影响性能。

**示例**：  

Windows、Linux、macOS、Solaris 9及以上版本，几乎所有的现代操作系统。

**代码示例**（Pthreads）：

```c
#include <pthread.h>
void *task(void *arg) { /* 线程任务 */ }
int main() {
    pthread_t tid;
    pthread_create(&tid, NULL, task, NULL); // 创建内核线程
    pthread_join(tid, NULL);
    return 0;
}
```

#### 三、多对多模型 (Many-to-Many)

多个用户线程映射到多个（但可能少于用户线程数）内核线程。  

**优点**：  

- 结合了多对一和一对一的优点。
- 支持并行执行，且灵活分配内核线程。

**变种**：**两级模型（Two-Level Model）**：允许特定用户线程绑定到特定内核线程，适合实时系统。  

**示例**：  

Solaris 2、IRIX。  

假设一个程序有100个用户线程，运行在4核CPU上，多对多模型可能分配4个内核线程，由线程库动态调度用户线程。

**对比总结**：
| 模型   | 并发性 | 多核支持 | 阻塞影响 | 开销 | 示例系统        |
| ------ | ------ | -------- | -------- | ---- | --------------- |
| 多对一 | 低     | 无       | 阻塞进程 | 小   | Green Threads   |
| 一对一 | 高     | 有       | 不影响   | 大   | Linux, Windows  |
| 多对多 | 中等   | 有       | 部分影响 | 中等 | Solaris 2, IRIX |

### 4.2.3 调度激活
**目的**：优化多对多模型中内核线程的分配。  

**轻量级进程（LWP）**：

- 介于用户线程和内核线程之间，充当虚拟处理器。
- 每个LWP绑定一个内核线程。  

**机制**：

- 内核分配LWP给应用程序。
- 应用程序调度用户线程到LWP上。
- **上行调用（Upcall）**：
  - 当线程阻塞时，内核通知线程库，分配新LWP。
  - 线程库保存阻塞线程状态，调度其他线程。  

**效率问题**：

- 内核线程阻塞会导致LWP和用户线程阻塞。
- 调度激活通过动态调整LWP数量解决问题。

调度激活增强了线程库与内核的协作，适合I/O密集型应用。例如，一个数据库服务器可能需要多个LWP处理并发查询。

## 4.3 线程库

线程库为程序员提供创建和管理线程的API。线程库的实现分为两种：
- **用户态库**：代码和数据结构在用户空间，调用为本地函数，效率高。
- **内核态库**：代码和数据结构在内核空间，调用需系统调用，开销较大。

### 4.3.1 POSIX Pthreads

POSIX标准扩展，支持用户态或内核态实现。  广泛用于UNIX系统（如Linux、macOS）。  

**代码示例**（计算1到N的和）：

```c
#include <pthread.h>
#include <stdio.h>
#include <stdlib.h>
int sum = 0; // 共享变量
void *runner(void *param) {
    int upper = atoi(param);
    for (int i = 1; i <= upper; i++) sum += i;
    pthread_exit(0);
}
int main(int argc, char *argv[]) {
    pthread_t tid;
    pthread_attr_t attr;
    pthread_attr_init(&attr);
    pthread_create(&tid, &attr, runner, argv[1]);
    pthread_join(tid, NULL);
    printf("Sum = %d\n", sum);
    return 0;
}
```

### 4.3.2 Windows 线程库  

内核态库，专为Windows设计。  

**代码示例**（类似Pthreads的求和程序）：

```c
#include <windows.h>
#include <stdio.h>
DWORD Sum = 0;
DWORD WINAPI Summation(LPVOID Param) {
    DWORD Upper = *(DWORD*)Param;
    for (DWORD i = 1; i <= Upper; i++) Sum += i;
    return 0;
}
int main(int argc, char *argv[]) {
    DWORD ThreadId;
    HANDLE ThreadHandle;
    int Param = atoi(argv[1]);
    ThreadHandle = CreateThread(NULL, 0, Summation, &Param, 0, &ThreadId);
    WaitForSingleObject(ThreadHandle, INFINITE);
    CloseHandle(ThreadHandle);
    printf("Sum = %d\n", Sum);
    return 0;
}
```

### 4.3.3 Java线程库  

Java通过`Thread`类或`Runnable`接口创建线程，通常基于主机操作系统的线程库（如Windows用Win32，Linux用Pthreads）。  

**代码示例**（Java求和）：

```java
import java.util.concurrent.*;
class Summation implements Callable<Integer> {
    private int upper;
    public Summation(int upper) { this.upper = upper; }
    public Integer call() {
        int sum = 0;
        for (int i = 1; i <= upper; i++) sum += i;
        return sum;
    }
}
public class Main {
    public static void main(String[] args) {
        int upper = Integer.parseInt(args[0]);
        ExecutorService pool = Executors.newSingleThreadExecutor();
        Future<Integer> result = pool.submit(new Summation(upper));
        try {
            System.out.println("Sum = " + result.get());
        } catch (Exception e) {}
        pool.shutdown();
    }
}
```

### 4.3.4 线程池
**定义**：在进程启动时预创建多个线程，放入池中等待任务。  

**工作原理**：

- 服务器接收请求后，从池中分配线程处理。
- 线程完成任务后返回池中。  

**优点**：

- 避免频繁创建/销毁线程的开销。
- 限制线程数量，防止资源耗尽。  

**Java线程池示例**：

```java
import java.util.concurrent.*;
public class ThreadPoolExample {
    public static void main(String[] args) {
        ExecutorService pool = Executors.newFixedThreadPool(4);
        for (int i = 0; i < 10; i++) {
            pool.execute(() -> System.out.println("Task executed"));
        }
        pool.shutdown();
    }
}
```

线程池适合处理大量短任务，如Web服务器处理客户端请求。动态调整池大小可优化性能。

## 4.4 线程管理

### 4.4.1 线程取消
**定义**：在线程完成前终止其执行。  

**方式**：

1. **异步取消**：立即终止目标线程，可能导致资源泄漏或数据不一致。  
2. **延迟取消**：目标线程定期检查取消请求，允许有序退出。  

**Pthreads取消示例**：

```c
#include <pthread.h>
void *worker(void *arg) {
    while (1) {
        // 工作
        pthread_testcancel(); // 检查取消请求
    }
}
int main() {
    pthread_t tid;
    pthread_create(&tid, NULL, worker, NULL);
    sleep(1);
    pthread_cancel(tid); // 请求取消
    pthread_join(tid, NULL);
    return 0;
}
```

延迟取消更安全，线程可在取消点（如`pthread_testcancel()`）检查状态并清理资源。异步取消虽快，但可能破坏数据完整性，不推荐使用。

### 4.4.2 信号处理
**信号**：用于通知进程特定事件的机制。  

**类型**：

- **同步信号**：由进程自身触发（如非法内存访问）。
- **异步信号**：由外部事件触发（如Ctrl+C）。  

**多线程信号处理选项**：

- 仅发送给触发信号的线程。
- 发送给进程内所有线程。
- 发送给特定线程。
- 指定一个线程处理所有信号。  

**Pthreads信号示例**：

```c
#include <pthread.h>
#include <signal.h>
void handler(int sig) { /* 处理信号 */ }
void *thread_func(void *arg) {
    signal(SIGUSR1, handler); // 设置信号处理
    while (1) { /* 工作 */ }
}
```

**Windows APC**：  

Windows通过异步过程调用（APC）模拟信号，信号直接发送到特定线程。

信号处理在多线程程序中复杂，需明确信号的接收者。例如，同步信号应发送给触发线程，而终止信号可能需要广播。

### 4.4.3 fork() 与 exec() 系统调用
**fork() 在多线程程序中的行为**：

- UNIX系统中，`fork()`可能：
  - 复制所有线程。
  - 仅复制调用`fork()`的线程。

**选择依据**：

- 如果`fork()`后立即调用`exec()`，仅复制调用线程（因为`exec()`会替换整个进程）。
- 否则，复制所有线程以保持进程状态。

**代码示例**（UNIX fork）：

```c
pid_t pid = fork();
if (pid == 0) { // 子进程
    execvp("new_program", NULL); // 替换进程
} else { // 父进程
    wait(NULL);
}
```

多线程程序调用`fork()`需谨慎，因为复制所有线程可能导致资源竞争或状态不一致。通常推荐在`fork()`后立即调用`exec()`。

## 4.5 线程的实现

### 4.5.1 Windows线程
**模型**：一对一映射，内核级线程。  

**线程组件**：

- 线程ID、寄存器集、用户/内核栈、线程局部存储。  

**数据结构**：

- **ETHREAD**：包含进程指针、线程入口地址、KTHREAD指针。
- **KTHREAD**：包含调度/同步信息、内核栈、TEB指针。
- **TEB**：用户态数据结构，包含线程ID、用户栈等。  

**结构图**：

```
ETHREAD (内核) --> KTHREAD (内核) --> TEB (用户)
```

### 4.5.2 Linux线程
**术语**：Linux将线程和进程统称为“任务”（Task）。  

**创建**：通过`clone()`系统调用。  

**共享选项**（`clone()`标志）：

- **CLONE_FS**：共享文件系统信息。
- **CLONE_VM**：共享内存空间。
- **CLONE_SIGHAND**：共享信号处理。
- **CLONE_FILES**：共享打开文件。  

**代码示例**：

```c
#include <sched.h>
void *task(void *arg) { /* 线程任务 */ }
int main() {
    char stack[4096];
    clone(task, stack + 4096, CLONE_VM | CLONE_FILES, NULL);
    return 0;
}
```

Linux的`clone()`灵活性高，通过标志控制资源共享程度。无标志时等价于`fork()`，全标志时等价于线程创建。
