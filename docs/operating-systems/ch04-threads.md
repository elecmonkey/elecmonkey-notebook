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

Pthreads (POSIX Threads) 是 IEEE POSIX 1003.1c 标准定义的线程 API，为C/C++语言提供了创建和管理线程的一套标准接口。它是 UNIX-like 系统（如 Linux、macOS、Solaris）上最常用的线程库，支持用户态和内核态的线程实现，通常采用**一对一模型**。

Pthreads 提供了丰富的功能，包括线程创建、同步（互斥锁、条件变量）、线程属性管理、线程特定数据等。

#### 核心 Pthreads API

1.  **`pthread_create()`：创建线程**
    *   **功能**：用于创建一个新的线程并使其开始执行。
    *   **签名**：`int pthread_create(pthread_t *restrict thread, const pthread_attr_t *restrict attr, void *(*start_routine)(void *), void *restrict arg);`
    *   **参数**：
        *   `thread`：指向 `pthread_t` 类型的指针，用于存储新创建线程的 ID。
        *   `attr`：指向 `pthread_attr_t` 类型的指针，用于指定线程的属性（如栈大小、调度策略、分离状态等）。传入 `NULL` 表示使用默认属性。
        *   `start_routine`：函数指针，新线程将从该函数开始执行。这个函数必须接受一个 `void *` 类型的参数并返回 `void *`。
        *   `arg`：传递给 `start_routine` 函数的参数。如果不需要传递参数，可传入 `NULL`。
    *   **返回值**：成功返回0，失败返回错误码（非零）。
    *   **示例**：
        ```c
        #include <pthread.h>
        #include <stdio.h>
        #include <stdlib.h>

        void *my_thread_function(void *arg) {
            char *message = (char *)arg;
            printf("Hello from thread! Message: %s\n", message);
            pthread_exit(NULL); // 线程正常退出
        }

        int main() {
            pthread_t tid;
            char *msg = "Hello from main!";
            if (pthread_create(&tid, NULL, my_thread_function, (void *)msg) != 0) {
                fprintf(stderr, "Error creating thread\n");
                return 1;
            }
            printf("Main thread created child thread with ID: %lu\n", tid);
            pthread_join(tid, NULL); // 等待子线程结束
            return 0;
        }
        ```

2.  **`pthread_exit()`：线程终止**
    *   **功能**：用于显式地终止调用线程的执行。线程终止后，其资源（如栈）将被回收。
    *   **签名**：`void pthread_exit(void *retval);`
    *   **参数**：`retval` 是一个指向线程返回值的指针。这个值可以通过 `pthread_join()` 被其他线程获取。
    *   **注意**：当线程的 `start_routine` 函数返回时，也会隐式调用 `pthread_exit(NULL)`。避免从线程函数直接 `return`，尤其是在使用 `pthread_join` 等待返回值时。

3.  **`pthread_join()`：等待线程终止**
    *   **功能**：阻塞调用线程（通常是主线程），直到指定的线程终止。这允许父线程等待子线程完成其工作，并可以获取子线程的返回值。
    *   **签名**：`int pthread_join(pthread_t thread, void **retval);`
    *   **参数**：
        *   `thread`：要等待终止的线程的 ID。
        *   `retval`：一个指向 `void *` 的指针的地址，用于存储目标线程的返回值。如果不需要返回值，可以传入 `NULL`。
    *   **返回值**：成功返回0，失败返回错误码。
    *   **作用**：主要用于线程的同步和资源回收。一个可join的线程在其 `pthread_join` 后才会完全释放其系统资源。

4.  **`pthread_detach()`：分离线程**
    *   **功能**：将一个线程标记为"分离"状态。一旦线程被分离，当它终止时，其所有资源将立即由系统回收，无需其他线程 `join` 它。分离的线程不能再被 `join`。
    *   **签名**：`int pthread_detach(pthread_t thread);`
    *   **参数**：`thread` 是要分离的线程的 ID。
    *   **使用场景**：如果一个线程创建后不需要等待其完成或获取其返回值，就可以将其分离，以避免创建"僵尸线程"资源。默认情况下，线程是可join的。

5.  **`pthread_self()`：获取当前线程ID**
    *   **功能**：获取调用线程自身的线程 ID。
    *   **签名**：`pthread_t pthread_self(void);`
    *   **返回值**：返回当前线程的 ID。

#### 线程属性 (`pthread_attr_t`)

`pthread_attr_t` 结构体用于在创建线程时指定线程的各种属性，例如：

*   **分离状态 (detach state)**：设置为 `PTHREAD_CREATE_DETACHED` 使线程创建后立即分离，或 `PTHREAD_CREATE_JOINABLE` 使其可被 `join`（默认）。
*   **栈大小 (stack size)**：自定义线程栈的大小。
*   **调度策略和优先级 (scheduling policy and priority)**：影响线程如何被操作系统调度。

**常用函数**：

*   `pthread_attr_init(pthread_attr_t *attr)`：初始化线程属性对象，设置为默认值。
*   `pthread_attr_destroy(pthread_attr_t *attr)`：销毁线程属性对象，释放资源。
*   `pthread_attr_setdetachstate(pthread_attr_t *attr, int detachstate)`：设置线程的分离状态。

#### 线程同步机制（简述）

Pthreads 提供了多种同步原语，用于协调多线程对共享资源的访问，防止数据竞争和不一致。

1.  **互斥锁 (Mutexes)**
    *   **API**：`pthread_mutex_init()`、`pthread_mutex_lock()`、`pthread_mutex_unlock()`、`pthread_mutex_destroy()`。
    *   **功能**：用于保护临界区，确保在任何给定时刻只有一个线程可以访问共享数据。
    *   **示例**：
        ```c
        // 伪代码
        pthread_mutex_t mutex;
        // pthread_mutex_init(&mutex, NULL);
        // ...
        pthread_mutex_lock(&mutex);
        // 访问共享资源 (临界区)
        pthread_mutex_unlock(&mutex);
        // ...
        // pthread_mutex_destroy(&mutex);
        ```

2.  **条件变量 (Condition Variables)**
    *   **API**：`pthread_cond_init()`、`pthread_cond_wait()`、`pthread_cond_signal()`、`pthread_cond_broadcast()`、`pthread_cond_destroy()`。
    *   **功能**：允许线程等待某个条件为真。通常与互斥锁配合使用，以避免忙等待和死锁。
    *   `pthread_cond_wait()`：原子性地释放互斥锁并等待条件变量被通知。
    *   `pthread_cond_signal()`：唤醒一个等待在条件变量上的线程。
    *   `pthread_cond_broadcast()`：唤醒所有等待在条件变量上的线程。

Pthreads 是多线程编程的强大工具，但正确使用它需要深入理解并发编程的挑战，包括竞态条件、死锁、活锁等问题，这些通常在专门的同步章节（如第六章）中详细讨论。

**代码示例**（计算1到N的和，使用`pthread_join`和`pthread_exit`，与之前示例类似，但强调API用法）：

```c
#include <pthread.h>
#include <stdio.h>
#include <stdlib.h> // for atoi

// 共享变量，需要同步保护
long long sum = 0;
// pthread_mutex_t sum_mutex; // 假设有互斥锁来保护sum

void *runner(void *param) {
    int upper = atoi((char *)param);
    for (int i = 1; i <= upper; i++) {
        // pthread_mutex_lock(&sum_mutex); // 锁定互斥锁
        sum += i;
        // pthread_mutex_unlock(&sum_mutex); // 解锁互斥锁
    }
    printf("Thread finished, sum calculated up to %d.\n", upper);
    pthread_exit(NULL); // 线程正常退出，返回NULL
}

int main(int argc, char *argv[]) {
    if (argc < 2) {
        fprintf(stderr, "Usage: %s <upper_limit>\n", argv[0]);
        return 1;
    }

    pthread_t tid; // 线程ID
    pthread_attr_t attr; // 线程属性

    // 初始化线程属性为默认值
    pthread_attr_init(&attr);

    // （可选）设置线程为可join状态，这是默认行为
    // pthread_attr_setdetachstate(&attr, PTHREAD_CREATE_JOINABLE);

    // 创建线程，传递参数argv[1]
    printf("Main thread is creating a new thread.\n");
    if (pthread_create(&tid, &attr, runner, argv[1]) != 0) {
        fprintf(stderr, "Error creating thread!\n");
        return 1;
    }

    // 主线程等待新线程完成
    printf("Main thread waiting for child thread (ID: %lu) to finish.\n", tid);
    if (pthread_join(tid, NULL) != 0) { // 等待线程终止，不获取返回值
        fprintf(stderr, "Error joining thread!\n");
        return 1;
    }
    printf("Child thread (ID: %lu) has terminated.\n", tid);

    // 销毁线程属性对象
    pthread_attr_destroy(&attr);

    // 如果sum是线程安全的，这里可以直接打印最终结果
    printf("Final Sum = %lld\n", sum);

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

Linux 操作系统在实现线程时采取了一种独特且灵活的方式。在 Linux 内核中，并没有严格区分传统的"进程"和"线程"概念，而是将它们统一抽象为"任务"（Task）。所有执行流（无论是进程还是线程）都是通过一个名为 `clone()` 的系统调用来创建的。

#### Linux 的"任务"抽象

-   **统一视图**：Linux 内核将所有可调度的实体（进程和线程）都称为"任务"。每个任务都有一个唯一的任务 ID（PID，尽管线程的 PID 通常被称为 LWPID，轻量级进程 ID）。
-   **共享与独立**：`clone()` 系统调用的强大之处在于，它允许调用者通过一系列标志位来精确控制新创建的任务与父任务之间共享哪些资源，以及哪些资源是独立的。

#### `clone()` 系统调用

-   **功能**：`clone()` 是 Linux 中创建新任务（进程或线程）的基础系统调用。它允许创建的新任务与调用任务共享（或复制）其地址空间、文件描述符、信号处理表等资源。
-   **签名**：`int clone(int (*fn)(void *), void *child_stack, int flags, void *arg, ... /* pid_t *ptid, void *newtls, pid_t *ctid */ );`
    *   `fn`：新任务要执行的函数。
    *   `child_stack`：新任务的栈空间。因为父子任务可能共享地址空间，所以需要为子任务单独指定一个栈。
    *   `flags`：最关键的参数，一组位掩码，用于控制资源共享和行为。
    *   `arg`：传递给 `fn` 函数的参数。
    *   后续参数（如 `ptid`, `newtls`, `ctid`）用于更高级的 PID 管理和线程局部存储。

#### `clone()` 的共享选项（关键标志）

通过不同的 `flags` 组合，`clone()` 可以实现不同的行为：

-   **创建新进程（类似 `fork()`）**：当 `flags` 为0（或不指定任何共享标志）时，`clone()` 的行为类似于传统的 `fork()`。它会创建一个新的任务，并复制父任务的地址空间、文件描述符等，使得父子进程拥有独立的资源副本。

-   **创建线程（类似 `pthread_create()`）**：当 `flags` 包含 `CLONE_VM | CLONE_FS | CLONE_FILES | CLONE_SIGHAND` 等标志时，`clone()` 创建的任务会与父任务共享大量资源，这正是传统意义上"线程"的行为。
    *   **`CLONE_VM`**：共享内存空间。这是区分进程和线程最关键的标志之一。如果设置，子任务与父任务共享同一个虚拟地址空间（包括文本段、数据段、堆和映射区）。
    *   **`CLONE_FS`**：共享文件系统信息（如根目录、当前工作目录）。
    *   **`CLONE_FILES`**：共享打开的文件描述符表。
    *   **`CLONE_SIGHAND`**：共享信号处理程序表。如果设置，父子任务对信号的处理方式是相同的。
    *   **`CLONE_THREAD`**：这个标志更为特殊，它不仅共享资源，还会使新任务与调用者位于同一个线程组（Thread Group）中。一个线程组内的所有线程共享同一个 PID（通常是组长的 PID），但每个线程有自己的 LWPID。

#### 代码示例

以下是一个使用 `clone()` 创建线程的简单示例，模拟了 Pthreads 的行为：

```c
#define _GNU_SOURCE // 启用CLONE_VM等GNU扩展标志
#include <sched.h>    // for clone()
#include <stdio.h>
#include <stdlib.h>
#include <unistd.h>   // for getpid()

// 线程要执行的函数
int thread_function(void *arg) {
    printf("Hello from the cloned thread!\n");
    printf("Child PID (LWPID): %d, Parent PID: %d\n", getpid(), getppid());
    sleep(1); // 模拟工作
    return 0;
}

int main() {
    const int STACK_SIZE = 4096; // 线程栈大小
    char *child_stack = (char *)malloc(STACK_SIZE); // 为子线程分配栈空间

    if (child_stack == NULL) {
        perror("Failed to allocate stack");
        return 1;
    }

    // 使用CLONE_VM等标志创建线程（共享内存空间、文件、信号处理）
    // CLONE_SIGHAND: 共享信号处理表
    // CLONE_VM: 共享地址空间
    // CLONE_FILES: 共享文件描述符
    // CLONE_FS: 共享文件系统信息
    // CLONE_THREAD: 使其成为同一线程组的成员
    // SIGCHLD: 子进程/线程终止时发送SIGCHLD信号给父进程
    int flags = CLONE_VM | CLONE_FS | CLONE_FILES | CLONE_SIGHAND | CLONE_THREAD | SIGCHLD;

    printf("Main process (PID: %d) is about to clone a thread.\n", getpid());

    pid_t tid = clone(thread_function, child_stack + STACK_SIZE, flags, NULL);
    if (tid == -1) {
        perror("clone failed");
        free(child_stack);
        return 1;
    }

    printf("Main process: Cloned thread with PID (LWPID): %d\n", tid);

    // 等待子线程/任务终止（需要包含<sys/wait.h>）
    // 注意：对于CLONE_THREAD创建的线程，其退出状态通常不会通过wait()返回给线程组内其他成员，
    // 而是通过线程组领导者处理。这里为了演示，可以简单sleep等待。
    sleep(2);

    free(child_stack); // 释放分配的栈空间
    printf("Main process exiting.\n");
    return 0;
}
```

#### Linux 线程的灵活性总结

Linux 的 `clone()` 系统调用提供了极大的灵活性，通过精确控制共享哪些资源，可以在"完全独立的进程"和"高度共享的线程"之间创建出各种中间形态的执行流。这种统一的"任务"模型简化了内核设计，但要求开发者在使用时对 `clone()` 的标志有清晰的理解。