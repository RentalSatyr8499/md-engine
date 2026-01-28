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
    * `*status`: pointer to which {{status information}} is stored

# left off on 35