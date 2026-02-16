* The idea behind {{kernel}} mode is that the OS tells the hardware to only allow OS-written code to access the hard drive. 
    * This allows us to enforce restrictions on individual programs, preventing them from doing things like {{reading other user's files, modifying OS's memory, or hanging the entire system}}.
    * We keep track of whether we're in kernel mode (aka {{privileged}} or {{supervisor}} mode) using an {{extra one-bit register}}. Non-kernel mode is called {{user mode}}.
* The {{system call interface}} protects privileged actions through a collaboration between the kernel and the hardware. The `syscall` instruction causes the CPU to switch to {{kernel mode}} and jump to an OS‑designated entry point.  The kernel then checks what the program wants and ensures {{the request is safe}} before performing it.  
    * The `syscall` calling convention is as follows: 
        * `%rax` contains the {{system call number (which action is being requested)}}  
        * the arguments of the system call go in  {{`%rdi`, `%rsi`, `%rdx`, `%r10`, `%r8`, `%r9`}} 
        * after the syscall, {{`%rax`}} holds the return value
    * Examples of `syscall` actions::  
        * {{`mmap`, `brk`}}: allocate memory
        * {{`fork`}}: create new process
        * {{`execve`}}: run a program in the current process
        * {{`open`, `read`, `write`}}: access and modify files
        * {{`_exit`}} → terminate a process
        * {{`socket`, `accept`, `getpeername`}}: socket‑related operations  
    * If the kernel recognizes that a `syscall` will be slow (ex. waiting for a keypress), the kernel will {{do something else for a while and later return to the program}}.  
    * If the syscall ends the program (ex, `exit`), the kernel will {{simply run something else afterward and not return to the original process}}.  
    * The system call interface + kernel mode boundary + address spaces ensure that users can't read other users’ data, modify OS memory, or hang the entire system by {{giving each program its own address space and preventing access to memory not mapped for it}}.  
* There are three types of exceptions (name them without peeking below!): (1) {{system calls}}, (2) {{faults}}, (3) {{interrupts}} 

| type of exception | explain what it is | synchronous or asynchronous? |
|----------|----------|----------|
| System calls    | {{intentional requests from the software}}   | {{synch}}   |
| Faults    | {{unusual program/software behavior, ex. segfault}}   | {{sync}}   |
| Interrupts    | {{external events, ex. IO devices}}   | {{async}}   |


* More exception stuff:
    * The difference between synchronous and asynchronous exceptions is that synchronous exceptions are {{triggered by the current}} program, while asynchronous exceptions are {{triggered by external events}}.
    * The OS uses {{exceptions (like timer interrupts)}} to regain control and perform a {{context switch}}. This involves: (1) saving the old program’s {{registers, program counter, and address mapping}}, and (2) load another program’s saved {{context}}. This is what allows multiple programs to run "at once", also called {{"time-multiplexing"}}.
        * Each program has its own distinct register values and stack state. We keep track of these varying states using {{threads}}.
        * "Process": {{the thread and address space associated with an action we're trying to carry out}}. Processes are under the illusion of having their own {{dedicated machine}}, with the {{thread(s)}} giving the illusion of the CPU and the {{address space}} giving the illusion of memory.

|Action| Requires exception? | Requires context switch? |
|----------|----------|----------|
|  program calls a function in the standard library    | {{N}} | {{N}}   |
| program writes a file to disk    | {{Y}}  | {{N}} |
| program A goes to sleep, letting program B run    | {{Y}}   | {{Y}}  |
|  program exits    | {{Y}}   | {{Y}}   |
|  program returns from one function to another function    |{{N}}|{{N}}|
|  program pops a value from the stack    |{{N}}|{{N}}|

* Exercise: enumerate handling of an interrupt in terms of the following steps, in the order that they happen. Include only steps that actually occur. Answer: {{5, 6, 2, 4, 3}}
    1. the processor resumes execution by running the interrupted instruction Again
    2. the processor jumps to the exception Handler
    3. the processor resumes execution with the Next instruction after where it was interrupted
    4. the state of the user process is Restored
    5. the state of the user process is Saved
    6. the processor consults the exception Table
* Exercise: Kernel mode can be entered by...
| method | can it trigger kernel mode? | reason |
|--------|--------|--------|
| interrupt | {{Y}} | h{{ardware interrupts always switch to kernel mode}} |
| trap |  {{N}} | {{software exceptions (e.g., syscalls) enter kernel mode}} |
| non-privileged non-exceptional instruction | {{N}} | {{normal user instructions never cause kernel entry}} |
| fault | {{Y}} | {{faults (page fault, divide-by-zero) trap into the kernel}} |



