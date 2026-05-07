* Locks allow us to implement mutual exclusion. But they are not versatile enough to allow threads to "wait for something to become true". For that, we can use {{condition variables}}.
    *  A "monitor" is a structured bundle containing: (1) a {{lock}}, (2) {{condition variable}}s, and (3) shared data + ways to manipulate that shared data. It also keeps track of queues for each condition variable.
    * `wait(cv, lock)`: this causes the calling thread to (1) {{release the lock}} and (2) {{enter the queue for `cv`}}. Once popped from the queue, the calling thread automatically {{recieves the lock back}}.
    * `signal(cv)`: wakes {{one waiting thread in `cv`'s queue}}.
    * `broadcast(cv)`: wakes {{all waiting threads in `cv`'s queue}}.
* One way to implement a situation where one entity produces data that another entity consumes is for the producer to push to a buffer that the consumer pops from. But producers and consumers might run at different speeds (a consumer might find the buffer empty and a producer might find the buffer full). Condition variables let each side wait for the situation it needs. 
    * "Unbounded queue:" {{producers}} never need to wait; only {{consumers}} do. There's only one condition variable: `data_ready`.
        * Producer logic: (1) {{acquire lock}}, (2) {{enqueue}} data, (3) {{signal the queue's `data_ready`}}, (4) unlock
        * Consumer logic: (1) {{acquire lock}}, (2) while {{the buffer is empty}}, {{wait on signal the queue's `data_ready`}}, (3) {{dequeue}} data, (4) unlock
    * "Bounded queue": producers need to wait for the queue to {{have space}}, and consumers need to wait for the queue to {{have data}}. There's two condition variables: `data_ready` and `space_ready`.
        * Producer logic: (1) {{acquire lock}}, (2) while buffer is {{full}}, {{wait on `space_ready`}}, (3) {{enqueue}} data, (4) unlock
        * Consumer logic: (1) {{acquire lock}}, (2) while buffer is {{empty}}, {{wait on `data_ready`}}, (3) {{dequeue}} data, (4) unlock
    * A while loop is used in both unbounded and bounded queues to constantly check on conditional variables. This is essential because {{the buffer's state might change after waking (spurious wakeups)}}.
    * Both unbounded and bounded buffers also use `signal` instead of `broadcast`. This is because {{only one waiting thread can really make progress on `data_ready` or `space_ready`. And it's expensive to wake everyone up for no reason}}.
* Monitors rules of thumb!
    * Never touch shared data without {{holding the lock}}, and keep the lock held for {{the entire operation}}.
    * Create a separate {{conditional variable}} for every kind of scenario waited for.
    * Always wrap the `cond_wait` call in a {{loop}}.
    * {{`broadcast` or `signal`}} the condition variable every time you change the buffer/data.
    * While technically correct, it impacts performance if you...
        * `broadcast` when {{just `signal`}} would work
        * {{`broadcast` or `signal`}} when nothing changed
        * Use one condvar for multiple conditions 
```c
/* POSIX implementation of monitors */
// declaration
pthread_mutex_t mutex;
pthread_cond_t cv;

// initialization
pthread_mutex_init(&mutex, NULL);
pthread_cond_init(&cv, NULL);
pthread_mutex_t mutex = PTHREAD_MUTEX_INITIALIZER;
pthread_cond_t cv = PTHREAD_COND_INITIALIZER;

// cleanup
pthread_cond_destroy(&cv);
pthread_mutex_destroy(&mutex);
```

* A more advanced kind of lock is a read-write lock, which gives two modes. Fill out the table below.
|lock mode|when can you pick it up?|can multiple readers hold the lock?|can multiple writers hold the lock?|
|----|----|----|----|
|read lock|You can pick up a read lock if and only if {{no writer is active}}|{{`Y`}}|{{`N`}}|
|write lock|You can pick up a write lock if and only if {{no readers and no writers are active}}|{{`N`}}|{{`N`}}|

```c
/* pthread implements RWLocks. */
pthread_rwlock_rdlock(&rwlock);   // acquire read lock
pthread_rwlock_wrlock(&rwlock);   // acquire write lock
pthread_rwlock_unlock(&rwlock);   // release either
```
* A "{{transaction}}" is a set of operations that occurs atomically, ie, the operations happen all at once. Conceptually, this could mean two things: 
    * A "durable" transaction is one where {{if the system crashes, the transaction is either fully applied or not applied at all}}.
    * A "consistent" transaction is one where {{no other thread sees intermediate states}}. Two ways to implement this are: (1) run transactions in {{serial}} order, and (2) lock everything the transaction touches in a {{consistent global}} order.


# Exercises

```c
pthread_mutex_t lock;
bool finished; 
pthread_cond_t isFinished; // this is the condition variable

void WaitForFinished() { // called in thread A
    pthread_mutex_lock(&lock); // line 1
    while (!finished) { // line 2
        pthread_cond_wait(&isFinished, &lock); // line 3
    } // line 4
    printf("hi");  // line 5
    pthread_mutex_unlock(&lock); // line 6
}

void Finish() { // called in thread B
    pthread_mutex_lock(&lock); // line 7
    finished = true; // line 8
    pthread_cond_broadcast(&isFinished); // line 9
    pthread_mutex_unlock(&lock); // line 10
}
```
* Exercise: Consider the code above. Suppose thread A acquires `lock` first.
    * At what point in the code must thread A reach before thread B will run line 8? {{line 3}}
    * When thread A is executing line 5, who has `lock`? When did they acquire it? {{thread A has the lock because it was given back to thread A once `pthread_cond_wait()` returned, ie after line 10 is done executing}}.
    * Which executes first, line 6 or line 10? {{line 10}}

```c
pthread_mutex_t lock;
bool finished[2];
pthread_cond_t both_finished_cv;

void WaitForBothFinished() {
    pthread_mutex_lock(&lock);
    while (/*     blank 1     */) {
        pthread_cond_wait(&both_finished_cv, &lock);
    }
    pthread_mutex_unlock(&lock);
}

void Finish(int index) {
    pthread_mutex_lock(&lock);
    finished[index] = true;
    /*     blank 2     */
    pthread_mutex_unlock(&lock);
}
```
* Exercise: Consider the unfinished code above. 
    * What should go in blank 1? Answer: {{C}} 
        * A. `finished[0] && finished[1]`
        * B. `finished[0] || finished[1]`
        * C. `!finished[0] || !finished[1]`
        * D. `finished[0] != finished[1]`
    * What should go in blank 2? Answer: {{D is the best answer, but B will result in correct behavior as well}}
        * A. `pthread_cond_signal(&both_finished_cv)`
        * B. `pthread_cond_broadcast(&both_finished_cv)`
        * C. `if (finished[1-index]) pthread_cond_signal(&both_finished_cv);`
        * D. `if (finished[1-index]) pthread_cond_broadcast(&both_finished_cv);`
```c
struct BarrierInfo {
    pthread_mutex_t lock;
    int total_threads;    // initially total # of threads
    int number_reached;   // initially 0
    /*     blank 1     */
};

void BarrierWait(BarrierInfo *b) {
    pthread_mutex_lock(&b->lock);
    ++b->number_reached;
    if (b->number_reached == b->total_threads) {
        /*     blank 2     */
    } else {
        /*     blank 3     */
        /*     blank 4     */
    }
    pthread_mutex_unlock(&b->lock);
}
```
* Exercise: Finish the unfinished code above. 
    * Blank 1: {{`pthread_cond_t cv;`}}
    * Blank 2: {{`pthread_cond_broadcast(&b->cv);`}}
    * Blank 3: {{`while(b->number_reached != b->total_threads)`}}
    * Blank 4: {{`pthread_cond_wait(&b->cv, &b->lock);`}}

```c
pthread_rwlock_t lock;

void ThreadA() {
    pthread_rwlock_rdlock(&lock);
    puts("a");
    ...
    puts("A");
    pthread_rwlock_unlock(&lock);
}

void ThreadB() {
    pthread_rwlock_rdlock(&lock);
    puts("b");
    ...
    puts("B");
    pthread_rwlock_unlock(&lock);
}

void ThreadC() {
    pthread_rwlock_wrlock(&lock);
    puts("c");
    puts("C");
    pthread_rwlock_unlock(&lock);
}

void ThreadD() {
    pthread_rwlock_wrlock(&lock);
    puts("d");
    puts("D");
    pthread_rwlock_unlock(&lock);
}
```
* Exercise: Consider the code aboe. Which of these outputs are possible? Answer: {{A, C}}
    * A. aAbBcCdD 
    * B. abABcdDC 
    * C. cCabBAdD
    * D. cdCDaAbB 
    * E. aACdDbB