* The POSIX function {{`getpid`}} retrieves the process ID.
* The POSIX function {{`waitpid`}} waits for the process to finish.
* The POSIX functions `exit` and `kill` are associated with process destruction.
* The POSIX function `fork` creates {{a new (duplicate) process of the current one}}. When `fork` is called, it's returned twice. 
    * Once in the {{parent}} process, where the return value is {{the child's pid}}, and again in the {{child}} process, where the return value is {{zero}}.
    * Everything is duplicated from the parent to the child (eg. {{memory}}, {{file descriptors}}, {{registers}}), EXCEPT for {{pid}}.
* The POSIX function `exec*` {{replaces current program with new program}}. Its API is `int execv(const char *path, const char **argv)`:
    * `*path`: {{new program to run}}
    * `*argv`: array of {{arguments (as strings) including program name}}, terminated by {{`NULL`}}
    * if `execv` is succesful, it {{does not return (to the original process that called it)}}.
    * `exec` creates new {{memory (stack, heap, etc.)}} for the running process, while data like {{file descriptors}} are copied from the old process.
* The POSIX function {{`waitpid`}} waits for the process to finish. Its API is `pid_t waitpid(pid_t pid, int *status, int options)`:
    * `pid`: {{child process for which the main process waits}}. If `pid == -1`, then {{`waitpid` waits for any child process}}.
    * `*status`: pointer to which {{status information}} is stored. We can interpret `*status` using macros from `sys/wait.h`.
* Useful POSIX commands
    * {{`ls -l`}}: displays detailed file info for the whole directory
    * {{`./foo &`}}: runs `foo` in the background so the shell prompt returns immediately.
    * {{`./foo >output.txt`}}: runs `foo` and redirects its standard output into `output.txt`, overwriting the file.
    * {{`./foo <input.txt`}}: runs `foo` and feeds `input.txt` into its standard input.
    * {{`./foo | ./baz`}}: runs `foo` and pipes its output into `baz` for further processing.
* Every process has an array (or similar) of open file descriptions. A file's "descriptor" is its {{index in the array}}. 
    * Special file descriptors include `0` for {{standard input}}, `1` for {{standard output}}, and `2` for {{standard error}}.
    * The following C function returns a file descriptor: {{`open()`}}.
    * When a process is {{`fork()`}}ed, its file descriptor list is copied from the parent to the child.
* To open files, we use the POSIX API `int open(const char *path, int flags);`. `*path` is the path to the file to be opened, `flags` can include the permissions or other special stuff to do. 
    * Name three permission flags for `open`: {{`O_RDWR`, `O_RDONLY`, or `O_WRONLY`}}.
    * The {{`O_APPEND`}} flag appends to end of file; the {{`O_TRUNC`}} flag truncates the file if it already exists
* To close files, we use the POSIX API `int close(int fd);`. It deallocates the file's {{array index, aka the file descriptor}}.
    * This does not affect {{other programs keeping track of file descriptors pointing to the same file}}. If {{another file descriptor still points to the file}}, then the file still stays open.
    * If and only if {{the last program pointing to the file calls `close()` on it}}, the file's resources are deallocated.
* In `dup2(fd1, fd2)`, `fd1` {{points towards the original file}}, and `fd2` {{should be rerouted to point towards the same file as `fd1`}}.
* Sharing and unsharing seek pointers: a seek pointer is the offset inside an open file that tells the OS which byte will be read or written next.
    * How can you get two file descriptors to have two independent unshared seek pointers? {{Call `open()` twice on the same filename. You get two independent file descriptors, each with its own seek pointer}}.  
    * How can you get two file descriptors to share one seek pointer? {{Duplicate a file descriptor using `dup2()`. The new descriptor shares the same underlying open file description, including the seek pointer.}}  
# Exercises
```c
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
* Consider the code above. Assuming `fork` and `execv` do not fail, the possible outputs are {{`0 \n 0 \n 1 \n 2`}}, {{`0 \n 1 \n 0 \n 2`}} and {{`1 \n 0 \n 0 \n 2`}}.

```c
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
* Consider the code above. Suppose the `pid` of the parent process is 99, and the `pid` of the child is 100. Give two possible outputs (assume no crashes): (1) {{`Child 100 \n In child \n Done! \n Done!`}}, (2) {{`In child \n Done! \n Child 100 \n Done!`}}

```c
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
* Consider the code above. The two possible outputs are: (1) {{`1 2 \n 3 4`}} and (2) {{`3 4 \n 1 2`}}

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
* Exercise: Consider the code above. What is written to output.txt? {{`ABCD`}}
* When we redirect i/o using `./foo <input.txt` and `./foo >output.txt`, the OS is using {{`dup2()` on file descriptors}} behind the scenes to implement the our request.