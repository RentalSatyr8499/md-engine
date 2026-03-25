* We wanna implement a program that lets us move files: 
```c
struct Dir {
    mutex_t lock; HashMap entries;
};
void MoveFile(Dir *from_dir, Dir *to_dir, string filename) {
    mutex_lock(&from_dir−>lock);
    mutex_lock(&to_dir−>lock);

    Map_put(to_dir−>entries, filename,
    Map_get(from_dir−>entries, filename));
    Map_erase(from_dir−>entries, filename);

    mutex_unlock(&to_dir−>lock);
    mutex_unlock(&from_dir−>lock);
}
```
* Suppose Thread 1 ran `MoveFile(A, B, "foo")` and Thread 2 ran `MoveFile(B, A, "bar")`. In a lucky timeline (without a deadlock), one thread {{acquires both locks}} first, finishes, then the other proceeds. In an unlucky timeline, {{one thread acquires one lock, the other acquires another, and the two are stuck forever waiting for each other}}.
* It's possible to have deadlocks that span more than two threads. For example, with three directories (A, B, C) and three threads, a deadlock could arise if:
    * Thread 1 holds A → wants B
    * Thread 2 holds B → wants C
    * Thread 3 holds {{C}} → wants {{A}}
* Deadlock isn't just about locks; it could be about any resource that can be held and waited on. For example, if two threads each want 2 MB of memory, the system has exactly 2 MB total, and each thread {{allocates 1 MB}} successfully. Then both threads are stuck waiting for {{the memory held by the other thread}}.

```c
RemoveNode(LinkedListNode *node) {
    pthread_mutex_lock(&node−>lock);
    pthread_mutex_lock(&node−>prev−>lock);
    pthread_mutex_lock(&node−>next−>lock);

    node−>next−>prev = node−>prev; node−>prev−>next = node−>next;
    
    pthread_mutex_unlock(&node−>next−>lock); 
    pthread_mutex_unlock(&node−>prev−>lock); 
    pthread_mutex_unlock(&node−>lock); 
}
```
* Exercise: Given the list A, B, C, D, E, which of these (all run in parallel) can deadlock?
    * RemoveNode(B) and RemoveNode(C) {{`Y`}}
    * RemoveNode(B) and RemoveNode(D) {{`N`}}
    * RemoveNode(B) and RemoveNode(C) and RemoveNode(D) {{`Y`}}

* The four conditions required for a deadlock are: 
    1. Mutual exclusion: only one thread can {{use a resource at a time}}.
    2. Hold and wait: a thread {{holds one resource}} while waiting for another.
    3. No preemption: resources can’t be {{forcibly taken away}}.
    4. Circular wait: A cycle exists (T1 waits for T2, T2 waits for T3, …, Tn waits for {{T1}}).
* Fill out this table.
| deadlock condition | mitigating strategy(s) |
|----------|----------|
| Mutual exclusion | (1) {{infinite resources}}; (2) no {{shared resources}} |
| Hold and wait | (1) instead of waiting for a resource, a thread {{immediately aborts and retries}}; (2) {{request all resources at once}} |
| No preemption | allow for {{resources to be forcibly taken from a thread}} |
| Circular wait | {{acquire resources in a consistent order. This is the BEST strategy!!}} |

* The issue with immediately aborting and retrying instead of waiting for resources to free up is that {{you may have to retry many times in order to achieve the task}}. A situation where you keep aborting and retrying without end is called {{livelock}}.
    * One possible mitigation strategy for livelock is making schedule random (ie random waiting after abort). 
    * Another strategy is to make threads run one-at-a-time.
* In order to allow for preemption (for threads to forcibly take resources from one another), you also need make sure you have a way to {{undo partial operations}}.

```
Lock chopsticks[NUM_CHOPSTICKS];

int GetChopstick() {
    for (int i = 0; i < NUM_CHOPSTICKS; i++) {
        if (trylock(chopsticks[i])) return i;
    }
    return -1; 
}

void PutDown(x) { Unlock(chopsticks[x]); }

void Eat() {
    left = right = -1;

    while (left == -1)
        left = GetChopstick();

    while (right == -1)
        right = GetChopstick();

    // use chopsticks and eat

    PutDown(left)
    PutDown(right)
}
```
* Exercise: Consider the code above; suppose we modify the dining philosophers to put all chopsticks in the center of the table where each of the philosophers takes the first of those chopsticks that is available. For each of the following scenarios, is deadlock possible?
    * 5 philosophers, 5 chopsticks {{`Y`}}
    * 4 philosophers, 5 chopsticks {{`N`}}
    * 5 philosophers, 6 chopsticks {{`N`}}
    * 5 philosophers, 4 chopsticks {{`Y`}}


