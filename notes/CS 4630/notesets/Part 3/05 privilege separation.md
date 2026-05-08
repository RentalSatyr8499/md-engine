* OpenSSH implemented privilege separation by splitting the SSH server into two processes: one for {{handling network input}} and the other for {{handling authentication}}. 
    * Each {{connection}} gets its own process. 
    * The {{network input}} component runs with minimal privileges. This is achieved by {{giving it a separate user and using `chroot`}}. The {{authentication component}}, on the other hand, has more privileges.
    * The network input component requests the authentication component out many required tasks, such as: {{cryptographic calculations}} (sandbox can't hold keys), verifying {{user credentials}}, and spawning {{a new process as the logged-in user upon authentication}}. 
* "{{Berkeley Packet Filters}}" (BPF): a low‑level language that allows you to filter system calls by {{inspecting the syscall number and (some) arguments}}.
    * {{`libseccomp`}} is a wrapper for writing BPF filters that uses C code to generate a BPF program (with LDs, JMPs, etc). Filter objects are called `scmp_filter_ctx`.
        * Initialize a filter called `myFilter` that kills any process making an unapproved syscall: {{`scmp_filter_ctx filter = seccomp_init(SCMP_ACT_KILL_PROCESS);`}}
        * Let `myFilter` allow `read` syscalls: {{`CHECK(seccomp_rule_add(filter, SCMP_ACT_ALLOW, SCMP_SYS(read)));`}}
        * Let `myFilter` allow `write` syscalls: {{`CHECK(seccomp_rule_add(filter, SCMP_ACT_ALLOW, SCMP_SYS(write)));`}}
    * BPF programs are then compiled into assembly by {{the Linux kernel}}. Before compiling, the kernel verifies the BPF program has no out-of-bounds accesses or potential to cause the system hang.
    * BPF has limitations and challenges:
        1. Pointer arguments (so, all strings) are hard to check with BPF because {{BPF cannot read memory, and therefore cannot dereference user‑space pointers}}. But one workaround is {{to attach and use a monitor process, which *can* read memory, via `ptrace`}}. 
        2. It’s easy to miss dangerous behavior because Linux provides many different syscalls and pathname tricks that reach the same resource. For example, any of the following could be used to open a file: {{`open`, `chdir`, `symlink`, `openat`, `open_by_handle_at`}}.
        3. It's also a pain to correctly filter server programs. 
            * "{{Server}}" programs: A privileged system service that other programs talk to via IPC. Example: a GUI or audio manager. 
            * Because {{these servers are large and complex}}, they often contain vulnerabilities. This makes it necessary to also sanitize the {{Inter‑Process Communication (IPC) protocol}}.
* To sandbox the browser, Chrome treats the {{rendering engine (HTML parser, JS engine, layout engine)}} as an untrusted black box. 
    * Communication happens through {{Inter‑Process Communication (IPC)}}.
        * The renderer sends {{requests}} to the browser kernel (ex.  "open this URL", "save this file").
        * The browser kernel sends {{user input}} to the sandboxed renderer.
    * Commands should be as narrow and necessary possible so that the sandboxed renderer cannot {{request arbitrary privileged operations}}.
    * The "process‑per‑site" philosophy: This is the idea that  {{each site should be run in its own OS process}}. Chrome and Firefox adapt this. But implementing this is complicated because pages {{embed content from many other sites, and those embedded sites may embed yet more}}.
* Each process has its own notion of the root directory (`/`), which can be changed using `chroot()`. This can isolate a program from the rest of the filesystem, restricting it to a limited directory tree.
    * To avoid needing to copy all necessary shared libraries from the system root files to the new container root, we can use {{bind mounts}}.
    * However, there are ways to escape a `chroot` sandbox. Two ways are: 
        *  Access file descriptors or directory handles that are {{left over from before `chroot` was called}}
        * Be a {{root}} user, because you can still access disks and escape. 
    * There are other tradeoffs associated with a chroot solution: {{it requires duplicating system files, makes communication between roots difficult, requires admin privileges to configure, can confuse privileged programs like `sudo`}}
* "{{Namespace}}": a kernel feature that gives a process its own private view of some global resource.
* "{{User namespace}}": gives a process its own mapping of user IDs. To achieve this, the {{kernel}} remaps user IDs so that inside the namespace the process can appear to be {{root}}, but outside it maps to {{an innocent (unprivileged) user ID}}.
    * This allows us to run programs that expect root privileges without actually granting them real root access. 
    * `C` API
        * Start a new process and put it in a new namespace: {{`clone(start_function, ..., CLONE_NEWUSER | other−flags)`}}
        * Turn the current process into its own namespace (unshare it from the "root namespace"): {{`unshare(CLONE_NEWUSER);`}}
    * The {{`/proc/PID/UID_MAP`}} file maps UIDs inside to outside the namespace. 
* "Mount namespace": gives a process its own {{mount table (information on which filesystems exist, where they are mounted, their perms, etc)}}. 
    * Processes inside a mount namespace cannot access {{directories outside the mount namespace}}. 
    * {{Bind mounts}} let you alias directories from the host into the namespace, which allows you to not duplicate system files into your new root.
    * bash API
        * Start a `/bin/sh` process with its own mount namespace: {{`unshare −−mount /bin/sh`}}
        * Modify the mount table using bind mounts to bind `/bin` to `/tmp/workdir/bin`: {{`mount −o bind,ro /bin /tmp/workdir/bin`}}
    * Suppose you want to sandbox a process. After creating the mount namespace, don't forget to {{use `chroot` to change the process's root to the new file system}}.
* In {{ambient}} authority, a program has coarse-grained user-like permissions. On the other hand, in capability systems, a program only has access to resources or names explicitly handed to it, such as {{open files}}. Fill out the table on privilege separation strategies below. 