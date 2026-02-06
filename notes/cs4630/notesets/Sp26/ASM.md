* In AT&T syntax, the {{destination}} is last, constants start with {{$}}, and registers start with {{%}}.
    * Operand lengths: q = 8; l = 4; w = 2; b = 1
    * Memory access syntax, like  a(b, c, d) , gives us the address at: {{a + b + c*d}}.
    * LEA (load effective address) uses the syntax of memory access, but instead just {{stores the literal computed address value in the destination}}.
        * What operation does  `leaq (%rax,%rax,4), %rax`  perform? {{multiplies %rax by 5}}
        * What operation does  `leal (%rbx,%rcx), %eax`  perform? {{adds rbx + rcx into eax}}
* The 32-bit register of rax is eax, for rbx it’s ebx, and for r12 it’s r12d.
    * Setting 32-bit registers sets the whole 64-bit register: the least significant bits are the target value, and the extra bits are all zeroes.
    * Setting 16-bit registers doesn't change the rest of the 64-bit register.
    * Setting 8-bit registers doesn't change the rest of the 64-bit register.

```
    movq $0x123456789abcdef, %rax
    xor %eax, %eax
```
What is rax?  {{`0`, not `0x1234567800000000`}}

```
movl $-1, %ebx
```
What is rbx?{{ 0xFFFFFFFF, not -1 (0xFFFFF...FFF)}}

* If you want to use floating point values, use registers %xmm0 through %xmm15.
Linux assemblers don’t encode myLabel(%rip) as the absolute address of myLabel, but rather as the offset of myLabel from rip. So you might see something like -0x2000(%rip).
* The movsb command takes no parameters and performs three operations:
    * mov one byte from %rsi to %rdi
    * Increments %rsi 
    * Increments %rdi
* How does adding the rep prefix to an instruction affect the instruction? The instruction is repeated until %rdx is 0, and %rdx is decremented each time the instruction is executed.

```
mystery:
    rep movsb
    ret
```
What does this function do? {{copies %rdx bytes from (%rsi) to (%rdi)}}

* In addition to `movsb`, other string instructions include...
    * `lodsb` and `stosb` (sb stands for "string byte"): {{loads/stores individual string bytes. Use an accumulator}}. The word and double-word versions of these commands are {{`movsw`}} and {{`movesd`}}.
    * There's also string comparison instructions, like {{`cmpsb`}}, {{`cmpsw`}}, or {{`cmpsd`}}.
* "endbr64": {{no-op instruction that marks destination of branches}}.
* Nowadays, computers usually use virtual memory. In the past it was segmentation, but that is now obsolete.
    * Virtual memory: individual programs are under the illusion that {{they have dedicated memory}}, when in reality, {{the OS splits up their code and data and stores it in real memory in the most optimal way}}. 
        * This means the OS must translate between {{the virtual memory addresses that individual programs use}}, and {{actual real memory addresses}}. 
        * If the individual program tries to map to a virtual address that doesn't seem to have a corresponding real address, we get a {{segmentation fault}}.
        * If the individual program requests something involving OS data, then {{the OS switches to kernel mode to carry out the request}}.
    * Segmentation: when the OS kept track of a table containing the {{base address, limits, and permissions}} of each segment. Examples of segments might include {{CS (code), SS (stack), DS (data)}}. The {{offset of each instruction from it's segment's base}} was then added to the segment base address to obtain the real address.
        * FS and GS were "{{extra segments}}".
        * Nowadays, segmentation is a "neutered feature". This is achieved by {{forcing all base addresses to be 0 (using hardware) and ignoring segment limits}}, with the exception of {{FS and GS}}.
        * This is because FS and GS are still used for storing {{thread-local}} data. So an instruction like `movq $42, %fs:100(%rsi)` can be explained as the following: {{take the base address of the FS segment, add `%rsi+100`, and store `42` there}}. In other words, in this instruction, {{`%fs:`}} overrides {{the default segment}}.
        * "Thread-local storage" (TLS): when a program uses multiple {{cores}}, variables sometimes have {{different values in each thread}}, which are stored in registers {{`%fs`}} and {{`%gs`}}.
* Brring. brring. It's calling convention time. The first {{six}} arguments of a function are stored in registers. In order, they are: {{`%rdi`}}, {{`%rsi`}}, {{`%rdx`}}, {{`%rcx`}}, {{`%r8`}},{{`%r9`}}
    * Additional arguments are {{pushed on the stack}}, as well as the {{return address}}.
    * The return value of the function is stored in {{`%rax`}}.
    * If the arguments are floating-point, they instead begin with {{`%xmm0`}}, {{`%xmm1`}}, etc.

