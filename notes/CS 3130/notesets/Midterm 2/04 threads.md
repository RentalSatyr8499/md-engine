* "{{Concurrency}}" involves structuring a program as multiple logically independent tasks. "{{Parallelism}}" involves using hardware to run tasks faster. Threads support both. 
    * Useful C methods for threads:
        * {{Create a thread}}: `pthread_create(&thread_id, attributes, function, argument);`
        * {{Wait for a thread to finish (like `waitpid` but for threads)}}: `pthread_join(the_thread, NULL);`
        * {{Exit thread (like `exit()` but for threads)}}: `pthread_exit(NULL);`. Note that this keeps the process alive even if `main()` returns.
    * Threads share almost everything, like {{files, pid, code, data}}. But each thread has its own {{stack, registers, and PC}}.

```c
int values[1024];
struct ThreadInfo {
    int start, end, result;
};
void *sum_thread(void *argument) {
    struct ThreadInfo *my_info = (struct ThreadInfo *) argument;
    int sum = 0;
    for (int i = my_info->start; i < my_info->end; ++i) { 
        sum += values[i]; 
    }
    my_info->result = sum;
    return NULL;
}
int sum_all() {
    pthread_t thread[2]; 
    struct ThreadInfo info[2];
    for (int i = 0; i < 2; ++i) {
        info[i].start = i*512; 
        info[i].end = (i+1)*512;
        pthread_create(&threads[i], NULL, sum_thread, &info[i]);
    }
    for (int i = 0; i < 2; ++i) { 
        pthread_join(threads[i], NULL); 
    }
    return info[0].result + info[1].result;
}
```
* The code above exemplifies a common pattern used to take advantage of threads. 
    * Instead of iterating through the whole loop in the main thread, the calculation is split into {{two}} threads. 
    * The function that handles per-thread calculation is called {{`sum_thread`}}. It knows which thread it's doing the calculation for because of {{the `ThreadInfo` struct that's been passed in}}.
    * Each worker thread is able to pass back its finished result to the main thread through {{`ThreadInfo->result`}}, an approach that only works because {{threads share memory}}.
    * This example stores the values (to be summed) at {{global data}}, and the info structs on {{the stack of the main thread}}. An alternative approach, that in some situations is even better, could be storing this information on {{the heap}} instead.
* When you create a thread normally, the OS allocates {{resources for it (including its stack)}}. Those resources are not freed until {{someone calls `pthread_join`}}.
    * So if you create threads and never join them, a {{memory leak}} occurs. 
    * To avoid this, you can call `pthread_detach(thread_id)` on the thread to tell the OS to {{automatically clean up its resources when it finishes}}. You could also alternatively {{use the `PTHREAD_CREATE_DETACHED` attribute on thread creation}}.
```c
void spawn_show_progress_thread() {
    pthread_t show_progress_thread;
    pthread_attr_t attrs;
    pthread_attr_init(&attrs);
    pthread_attr_setdetachstate(&attrs, PTHREAD_CREATE_DETACHED);
    pthread_attr_setstacksize(&attrs, 32 * 1024 /* bytes */);
    pthread_create(&show_progress_thread, attrs, show_progress, NULL);
    pthread_attr_destroy(&attrs);
}
```
* We can set thread attributes on creation by...
    1. Initializing {{the `pthread_attr_t` object}}
    2. Calling {{`pthread_attr_init()`}} on it
    3. Calling various `pthread_attr_set...()` methods on the {{`pthread_attr_t` object}}
    4. Then, when we create the thread, pass the `pthread_attr_t` object into {{`pthread_create` }}
    5. Finally, to clean up, call {{`pthread_attr_destroy`}} on the `pthread_attr_t` variable.
    * This entire pattern allows us to customize stuff about our thread, like {{whether it's detachable and its stack size}}.
```c
/* omitted: headers */
void *create_string(void *ignored_argument) {
    char string[1024];
    ComputeString(string);
    return string;
}
int main() {
    pthread_t the_thread;
    pthread_create(&the_thread, NULL, create_string, NULL);
    char *string_ptr;
    pthread_join(the_thread, (void**) &string_ptr);
    printf("string is %s\n", string_ptr);
}
```
* Exercise: will this work, why or why not? Answer: {{No, because `string` is stored on the worker thread's stack, which will disappear once it returns.}}

```c
void *bar(void *x) {
    return NULL;
}
void *foo(void *x) {
    pthread_t p1, p2;
    pthread_create(&p1, NULL, bar, NULL);
    pthread_create(&p2, NULL, bar, NULL);
    pthread_join(p1, NULL);
    return NULL;
}

int main() {
    pthread_t p1, p2;
    pthread_create(&p1, NULL, foo, NULL);
    pthread_join(p1, NULL);
    pthread_create(&p2, NULL, foo, NULL);
    pthread_join(p2, NULL);
}
```
* Consider the above code that uses the POSIX ("pthreads") API. When `main()` is run, what is the maximum number of threads, including the initial thread that runs `main()`, that can be running at the same time? Answer: {{5}}

```c
void *add_to_list(void *argument) {
    int *p;
    p = (int*) argument;
    ...
}

int main() {
    ...
    void *new_ptr1; void *new_ptr2;
    if (0 != pthread_create(&p1, NULL, add_to_list, &x)) handle_error();
    ...
}
```
* Exercise: Consider the code above. The line `new_item->value = *p` assigns a value read from __ to new_item->value. Answer: {{A}}
    * A. the stack of the thread that runs main
    * B. the stack of one of the threads created by pthread_create calls in main
    * C. the heap
    * D. the region used to store global variables
    * E. either the stack of the thread that runs main or the stack of one of the created threads, depending which time it is run
