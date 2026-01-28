* The idea behind {{kernel}} mode is that the OS tells the hardware to only allow OS-written code to access the hard drive. 
    * This allows us to enforce restrictions on individual programs, preventing them from doing things like {{reading other user's files, modifying OS's memory, or hanging the entire system}}.
    * We keep track of whether we're in kernel mode (aka {{privileged}} or {{supervisor}} mode) using an {{extra one-bit register}}. Non-kernel mode is called {{user mode}}.
# skipped 10-58
* Each program has its own distinct register values and stack state. We keep track of these varying states using {{threads}}.
    * In reality, many threads share one {{processor}}.
* "Exception": when {{the hardware calls an OS-specified routine}}. One example is {{system calls}}.
* "Context switch": when {{the OS switches to another thread by saving old registers and loading new ones}},
* "Process": {{the thread and address space associated with an action we're trying to carry out}}. Processes are under the illusion of having their own {{dedicated machine}}, with the {{thread(s)}} giving the illusion of the CPU and the {{address space}} giving the illusion of memory.

|Action| Requires exception? | Requires context switch? |
|----------|----------|----------|
|  program calls a function in the standard library    | {{N}} | {{N}}   |
| program writes a file to disk    | {{Y}}  | {{N}} |
| program A goes to sleep, letting program B run    | {{Y}}   | {{Y}}  |
|  program exits    | {{Y}}   | {{Y}}   |
|  program returns from one function to another function    |{{N}}|{{N}}|
|  program pops a value from the stack    |{{N}}|{{N}}|

