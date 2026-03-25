* When there are multiple threads, non-determinism might be introduced, which is when {{you can't reliably predict the output of the program}}. This is also sometimes referred to as {{a race condition bug}}.
    * "The lost write" classic race condition: say two threads are performing operations on the same `account` object, and they both run `account->balance += amount;`. Say thread A and thread B both store `account`'s value in a register at time t1, and then thread A performs the addition and writes the result to `account` at time t2. The "lost write" bug occurs when {{thread B adds and writes *its* value at time t3, but performs the calculation with the stale t1 value instead of the up-to-date t2 value}}. 
    * Exercise: For each of the following scenarios, what are possible values of `x`?
| Thread A runs...| Thread B runs...| possible resulting values of (assume operations run to completion or not at all) `x`|
|----------|----------|----------|
| `x = 1;`|`y = 2;`| {{`1`}} |
| `x = y+1;`|`y = 2; y *= 2;`| {{`1`, `5`, `3`}} |
| `x = 1;`|`x = 2;`| {{`1`, `2`}}|
* "Atomic operations": {{operations that run to completion or not at all}}. They are often used in order to enforce the principle of {{safe synchronization (using threads safely)}}.
    * If operations are non-atomic, running `x = 1;` on Thread A and `x = 2;` on Thread B can result in the following possible values for `x`: {{`1`, `2`, `3`}}
    * You need to know which x86 instructions are atomic and which are not. 
        * **Atomic**: On most machines, {{loading}} and {{storing}} *aligned* words are atomic. "Aligned" simply means {{stored at an address that is a multiple of the word size}}. Which of the following fall into this category, and are thus atomic? Assume words are 64 bits.
            * `add`ing a constant value to a word integer: {{`N`}}
            * `lea`ing a word integer, where that integer is stored at `0xCCC0`: {{`Y`}}
            * `mov`ing a word integer to memory, where that integer is stored at `0xCCC1`: {{`N`}}
        * **Non-atomic**: (for the purposes of this class) *Any* other instruction, except for the two cases listed above, are assumed not to be atomic. For example, `addl $1, the_value`, might be broken down into (1) load the_value, (2) add 1, and (3) store the_value. If you're unlucky, these multiple steps could {{interleave with what other cores do}}, breaking thread safety. 
* Unless you explicitly use thread APIs, C assumes that {{there are no other threads}}. Example: for this reason, `do {} while (!ready);` will likely cause {{an infinite loop}}, *even* if there are {{other threads modifying `ready`}}.  

* When multiple threads access shared data, you need {{mutual exclusion}}, meaning only one thread can perform certain actions at a time. 
    * The code that must be protected is called a {{critical section}}.
    * The mechanism we use to enforce that protection is a {{lock}}.
* The lock primitive has two essential operations: (1) {{`acquire()` (wait until the lock is free, then take it)}}, and (2)  {{`release()` (give it up and wake any waiting threads)}}.
    * In order for this system to work, it must be the case that {{every single thread follows protocol}}. For example, if someone forgets to {{acquire the lock}}, the system could break and a {{race condition}} could be introduced.
    * Waiting for a lock should ideally not burn CPU cycles. This means that good lock implementation should {{put the thread to sleep so the OS can schedule something else}}.
    * POSIX mutexes implement the lock primitive.

```c
#include <pthread.h>
pthread_mutex_t my_lock;

pthread_mutex_lock(&my_lock); // lock da thread
pthread_mutex_unlock(&my_lock); // unlock da thread
```
* Locks are useful but don't solve all of our synchronization problems yet. For example, they don't let you wait for arbitrary events.
* When multiple threads must periodically wait for each other before continuing, we use {{barriers}}. 
    * If a thread reaches a barrier, it must {{stop and wait until all other participating threads reach their own barriers}}.
    * POSIX implements barriers (see below).

```c
pthread_barrier_t barrier;
pthread_barrier_init(
    &barrier,
    NULL /* attributes */,
    numberOfThreads
);

pthread_barrier_wait(&barrier);
```

```c
pthread_mutex_t lock1 = PTHREAD_MUTEX_INITIALIZER;
pthread_mutex_t lock2 = PTHREAD_MUTEX_INITIALIZER;
string one = "init one", two = "init two";

void ThreadA() {
    pthread_mutex_lock(&lock1);
    one = "A1";    
    pthread_mutex_unlock(&lock1);

    pthread_mutex_lock(&lock2);
    two = "A2";    
    pthread_mutex_unlock(&lock2);
}

void ThreadB() {
    pthread_mutex_lock(&lock1);
    one = "B1";   
    pthread_mutex_lock(&lock2);
    two = "B2";    
    pthread_mutex_unlock(&lock2); // line I
    pthread_mutex_unlock(&lock1); // line II
}
```
* Exercise: the code above introduces race conditions. List its possible outputs. {{`A1, A2, B1, B2`, `A1, B1, B2, A2`, `A1, B1, A2, B2`, `B1, B2, A1, A2`}}
    * If line I and line II are swapped, what changes about the outputs, if they change at all? {{`A1, B1, A2, B2` is no longer a valid output}}


```c
pthread_barrier_t barrier; int x = 0, y = 0;
void thread_one() {
    y = 10;
    pthread_barrier_wait(&barrier);
    y = x + y;
    pthread_barrier_wait(&barrier);
    pthread_barrier_wait(&barrier);
    printf("%d %d\n"
    , x, y);
}
void thread_two() {
    x = 20;
    pthread_barrier_wait(&barrier);
    pthread_barrier_wait(&barrier);
    x = x + y;
    pthread_barrier_wait(&barrier);
}
```
* Exercise: if both threads in the above code are run at once, what is printed? {{`50 30`}}


```c
struct item {
    int value;
    struct item *next;
    pthread_mutex_t lock;
};

struct item *head;
pthread_mutex_t head_lock;

void AddItemAtTail(struct item *item) {
    item->next = NULL;
    pthread_mutex_lock(&head_lock);
    if (head == NULL) {
        head = item;
        pthread_mutex_unlock(&head_lock);
    } else {
        pthread_mutex_lock(&head->lock);
        struct item *prev = head;
        pthread_mutex_unlock(&head_lock);
        while (prev->next != NULL) {  // (1)
            struct item *old_prev = prev;
            pthread_mutex_lock(&prev->next->lock);
            prev = prev->next;
            pthread_mutex_unlock(&old_prev->lock);
        }
        prev->next = item;
        pthread_mutex_unlock(&prev->lock);
    }
}

struct item *GetAndRemoveAtHead() {
    struct item *result = NULL;
    pthread_mutex_lock(&head_lock);
    if (head != NULL) {
        struct item *result = head;
        pthread_mutex_lock(&result->lock);   // (2)
        head = result->next;
        pthread_mutex_unlock(&result->lock); // (2)
    }
    pthread_mutex_unlock(&head_lock);
    return result;
}
```
* Exercise: Consider the above code. If the mutex lock and unlock labeled (2) were removed, then there'd be a potential for a race condition. For each of the following race conditions, tell me if they are possible. 
    * when the list has ten items and there are two simultaneous calls to `GetAndRemoveAtHead()`, only one item is removed {{`N`}}
    * when the list is empty and there is a simultaneous call to `GetAndRemoveAtHead()` and `AddItemAtTail()`, the added item is not added to the list or returned by `GetAndRemoveAtHead` {{`N`}}
    * when the list has exactly one item and there is a simultaneous call to `AddItemAtTail()` and `GetAndRemoveAtHead()`, the added item is not added to the list or returned by `GetAndRemoveAtHead()` {{`Y`}}
    * when the list has ten items and there is a simultaneous call to `AddItemAtTail()` and `GetAndRemoveAtHead()`, no items are removed from the list {{`N`}}