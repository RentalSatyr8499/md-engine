* {{Linux control groups (cgroups)}}: limit how much of a resource a process can use, such as CPU time, memory usage, or I/O bandwidth. This is essential for mitigating {{denial‑of‑service}} and ensuring fair resource sharing among containers. 
* Virtual machines are on the OS level, while containers are lower-overhead and on the kernel level.
    * Virtual machines: Docker, LXC, LXD, and containerd use namespaces to create containers that appear to have their own OS environment, though they still share the host kernel. Tools like bubblewrap and firejail use namespace tricks plus bind mounts to give applications a restricted filesystem view.
    * Containers: The typical ingredients of Linux containers are seccomp, namespaces, SELinux, and cgroups. It looks like a virtual machine but with far lower overhead because the kernel is shared. 
        * SELinux’s sandbox: uses Security Enhanced Linux’s mandatory access controls instead of Linux namespaces.

* Sandboxing is only as strong as its interface. Bugs in the sandbox boundary, such as memory corruption, injection vulnerabilities, or unintended functionality exposed through the allowed operations, can allow attackers to escape. 
    * runc bug in Docker: runc is short for "run new command" in a container, and it's pretty high-privilege. This exploit takes advantage of the fact that containers could modify executable binaries *as they were being run* via the `/proc/self/exe` alias (which points to the currently running executable). Because runc is high-privilege, this allowed for privilege escalation.
        * A partial fix was disabling access to `/proc/PID/exe` using `prctl(PR_SET_DUMPABLE, 0)`. But this had two problems: 
            1. This mode needs to be set every time you execute a new program, and 
            2. Attackers could just trick the tool into executing `/proc/self/exe` itself instead via symlinks or dynamic linker manipulation. 
        * The full fix was to create a single‑use, in‑memory copy of the runc each time a command is run. Because the copy lives only in memory, modifying the on‑disk version no longer affects the running instance. Alternatively, you could make executables non-writeable via SELinux (and just avoid running containers as root).
    * Chrome sandbox escapes: If the browser kernel has bugs in this interface the renderer can escape its sandbox. Examples: missing access checks or use‑after‑free vulnerabilities
    * Chrome’s Windows sandbox escape (access tokens): Windows assigns each process an access token describing its permissions; Chrome creates a restricted version for the renderer. However, a Windows bug allowed starting new processes with a more privileged token than intended, which attackers to duplicate to their own processes.
* Qubes: a security‑focused OS that uses full virtual machines rather than syscall filtering. Each application or domain runs in its own VM, and the UI clearly labels which VM each window belongs to. 
    * Prose: strong isolation. VMs are much harder to escape than syscall filters.
    * Cons: difficulty sharing data between VMs and much higher overhead.
* Sandboxing at the language level: OS‑based sandboxing is strong because it filters syscalls at the hardware boundary, but it is slow for communication and OS‑specific. Alternatives include language virtual machines, like Java VM. Another big example is WebAssembly, a virtual machine designed to be a compilation target for C/C++ and to run efficiently in browsers. 
    * WebAssembly modules have a single linear memory, indexed from 0 to some maximum. Load/store instructions operate on this memory. This model matches what C/C++ expects but is designed so that sandboxed code cannot interfere with memory outside the module. 
    * Because the VM controls the memory space, it does not need to check array bounds for safety — the module cannot escape its linear memory. 
    * WebAssembly validates code a lot more rigorously than other languages do before compilation, allowing us to skip a lot of runtime checks and optimize performance. 
        * why was this design choice made/why is prof telling us about it? seems kinda irrelevant to security
* RLBox: a modern framework designed to make privilege separation easier for application developers. Instead of manually wiring up processes, IPC, and seccomp filters, RLBox provides a reusable abstraction for isolating dangerous libraries.
* Security design principles: In general, when designing the UI to ask users for permission, conserve user attention and reserve it for permissions with severe consequences. Too many warnings cause habituation. 
* Clickjacking attack: drawing overlay window over some dialog and convincing an unknowing user to press something. For example, a permissions dialog and the "OK" button.

# Exercise
* Exercise: using tools discussed in this section, how could we sandbox a C program without using OS sandboxing features? {{(1) Compile to WebAssembly and then (2) run them inside a language VM.}}