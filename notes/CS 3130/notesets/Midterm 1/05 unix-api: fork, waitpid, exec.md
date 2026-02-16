* Important POSIX process C functions
    * {{`getpid`}}: gets process ID. Ex: `pid_t my_pid = getpid(); printf(%d, (int) my_pid);`
    * {{`fork`}}: creates a new (duplicate) process of the current one
    * {{`exec*`}}: replaces current program with new program
    * {{`waitpid`}}: wait for process to finish
    * {{`exit`, `kill`}}: process destruction
    * There's also `posix_spawn` which is rarely used, but can be used to spawn new programs.
* When `fork` is called, it's returned twice. Once in the {{parent}} process, where the return value is {{the child's pid}} and again in the {{child}} process, where the return value is {{zero}}.
    * Everything (eg. {{memory}}, {{file descriptors}}, {{registers}}) is duplicated from the parent to the child, EXCEPT {{pid}}.

```
int main() {
    pid_t pid = fork();
    if (pid == 0) {
    printf("In child\n");
} else {
    printf("Child %d\n", pid);
}
    printf("Done!\n");
}
```
Suppose the pid of the parent process is 99 and child is 100. Give two
possible outputs (assume no crashes): (1) {{`Child 100 \n In child \n Done! \n Done!`}}, (2) {{`In child \n Done! \n Child 100 \n Done!`}}

```
int x = 0;
int main() {
    pid_t pid = fork();
    int y = 0;
    if (pid == 0) {
        x += 1;
        y += 2;
    } else {
        x += 3;
        y += 4;
    }
    printf("%d %d\n", x, y);
}
```
The two possible outputs are: (1) {{`1 2 \n 3 4`}} and (2) {{`3 4 \n 1 2`}}

* "exec*": `int execv(const char *path, const char **argv)`
    * `*path`: {{new program to run}}
    * `*argv`: array of {{arguments (as strings) including program name}}, terminated by {{`NULL`}}
    * if `execv` is succesful, it {{does not return (to the original process that called it)}}.
    * while `exec` creates new {{memory (stack, heap, data from .exe)}} for the running process, other data like {{file descriptors}} are copied from the old process.
* "wait": `pid_t waitpid(pid_t pid, int *status, int options)`
    * `pid`: {{child process for which the main process waits}}. If `pid == -1`, then {{wait for any child process}}.
    * `*status`: pointer to which {{status information}} is stored. We can interpret this information using macros from `sys/wait.h`:
        * `WIFEXITED(status)`: true if {{process exited or returned}}, false otherwise
        * `WIFSIGNALED(status)`: true if {{process killed by signal}}, false otherwise
        * `WTERMSIG(status)`: returns the {{signal by which the process was killed}}.

```
int main() {
    pid_t pids[2]; const char *args[] = {"echo", "ARG", NULL};
    const char *extra[] = {"L1", "L2"};
    for (int i = 0; i < 2; ++i) {
        pids[i] = fork();
        if (pids[i] == 0) {
            args[1] = extra[i];
            execv("/bin/echo", args);
        }
    }
    for (int i = 0; i < 2; ++i) {
        waitpid(pids[i], NULL, 0);
    }
}
```
Assuming fork and execv do not fail, the possible outputs are {{`L1 \n L2`}} and {{`L2 \n L1`}}.


```
int main() {
    pid_t pids[2]; const char *args[] = {"echo", "0", NULL};
    for (int i = 0; i < 2; ++i) {
        pids[i] = fork();
        if (pids[i] == 0) { execv("/bin/echo", args); }
    }
    printf("1\n"); fflush(stdout);
    for (int i = 0; i < 2; ++i) {
        waitpid(pids[i], NULL, 0);
    }
    printf("2\n"); fflush(stdout);
}
```
Assuming fork and execv do not fail, the possible outputs are {{`0 \n 0 \n 1 \n 2`}}, {{`0 \n 1 \n 0 \n 2`}} and {{`1 \n 0 \n 0 \n 2`}}.

* Useful POSIX commands
    * {{`ls -l`}}: displays detailed file info for the whole directory
    * {{`./foo &`}}: runs `foo` in the background so the shell prompt returns immediately.
    * {{`./foo >output.txt`}}: runs `foo` and redirects its standard output into `output.txt`, overwriting the file.
    * {{`./foo <input.txt`}}: runs `foo` and feeds `input.txt` into its standard input.
    * {{`./foo | ./baz`}}: runs `foo` and pipes its output into `baz` for further processing.
* Every process has an array (or similar) of open file descriptions. The file descriptor of a specific file, then, is the {{index in the array}}. 
    * Special file descriptors include `0` for {{standard input}}, `1` for {{standard output}}, and `2` for {{standard error}}.
    * To get a file descriptor in C, use {{`open()`}}.
    * When a process is {{`fork()`}}ed, its file descriptor list is copied from the parent to the child.
* Open files: `int open(const char *path, int flags);`
    * `*path` is {{the path to the file to be opened}}.
    * `flags` can include the permissions or other special stuff to do. 
        * Permission flags (3): {{`O_RDWR`, `O_RDONLY`, or `O_WRONLY`}}.
        * {{`O_APPEND`}} appends to end of file; {{`O_TRUNC`}} truncates the file if it already exists
        * {{`O_CREAT`}} creates a new file if one doesn't exist
* Close files: `int close(int fd);`. It deallocating the file's {{array index}}.
    * This does not affect {{other programs keeping track of file descriptors pointing to the same file}}. 
    * If {{this was the last program that needed the file open}}, then the file's resources are deallocated as well.
* When we redirect I/O using `./foo <input.txt` and `./foo >output.txt`, the OS is using {{file descriptors}} behind the scenes to implement the our request.
```
int fd = open("output.txt", O_WRONLY | O_CREAT | O_TRUNC);
dup2(fd, STDOUT_FILENO);
close(fd); 
```
* The steps are as follows: 
    * {{`open()` the file to/from which I/O will be piped}}
    * Call `dup2()`. The first parameter is the file descriptor that {{points towards the original file}}, and the second parameter is the file descriptor that {{should be rerouted to point towards the same file}}.
    * Finally, call {{`exec`}} to run whatever program you're trying to modify the I/O of. This only works because {{`exec` inherits the open file table of its parent process}}.
* Sharing and unsharing seek pointers:
    * How can you get two file descriptors to have two independent unshared seek pointers? {{Call `open()` twice on the same filename. You get two independent file descriptors, each with its own seek pointer}}.  
    * How can you get two file descriptors to share one seek pointer? {{Duplicate a file descriptor using `dup2()`. The new descriptor shares the same underlying open file description, including the seek pointer.}}  

* Exercise: In the code below, what is written to output.txt? {{`ABCD`}}
```
int fd = open("output.txt", O_WRONLY|O_CREAT|O_TRUNC, 0666);
write(fd, "A", 1);
dup2(STDOUT_FILENO, 100);
dup2(fd, STDOUT_FILENO);
write(STDOUT_FILENO, "B", 1);
write(fd, "C", 1);
close(fd);
write(STDOUT_FILENO, "D", 1);
write(100, "E", 1);
```