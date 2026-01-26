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