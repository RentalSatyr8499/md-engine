* To execute a return‑to‑stack stack-smashing attack,  place your payload at this location: {{inside a buffer on the stack}}. Then, your overflow needs to overwrite the {{saved return address}} so that `ret` jumps to {{the payload that's in the buffer}}.
    * The payload in the buffer is also called {{shellcode}}, because historically, many payloads spawned a shell in remote exploits.
    * Shellcode must be {{position}}‑independent and self‑contained, meaning it cannot rely on {{linking, library calls by name, and returns}}. It must also {{exit}} cleanly after running.

Steps to constructing a return-to-stack attack: 
1. Write the {{shellcode}}. Instead of using libraries, use {{system calls}}. Instead of returning, use {{`exit_group` (`syscall` id `231`)}}.
2. Determine the {{address where the shellcode will reside in the buffer}}. The exact address of the payload will change from environment to environment due to {{ASLR}}. But the {{offset of the payload from the stack pointer}} will remain the same, so we use that to determine where to jump to instead.
    * We can disable ASLR with {{`setarch -R`}}.
    * We can find the {{stack location}} by writing a C program that initializes a variable then prints its address (ex.`printf("%p\n", &x);`).
    * We can give our guessing some leeway by adding a {{nop sled}} to the beginning of the payload.
3. Overwrite the {{return address value}}

* Functions like `scanf("%s")` don't accept {{whitespace characters (`'\t'`, `'\v'`, `'\r'`, `'\n'`, or `'\0'`)}}, making it sometimes challenging to pass machine code in through user input. Malware authors get around this by:
    * Avoiding instructions that naturally contain zeroes. This could involve opting for {{one}}‑byte immediates whenever possible: instead of `mov $1, %eax` (`b8 01 00 00 00`), you would instead write {{`movb $1, %al` (`b0 01`)}}
    * Use {{negative}} RIP‑relative offsets to reference nearby data without introducing null bytes. This would cause us to store strings {{*before* the code}}. 
    * Zero registers using {{`xor`}}.
    * Construct forbidden values using {{arithmetic (zero a register with `xor` then increment until reaching the desired value)}}.
* If certain bytes cannot be injected, attackers may do a partial pointer overwrite, where {{bytes of the original address that are already be zero remain unchanged}}. Ex. if the original address is `2c de ff ff ff 7f 00 00`, and the attacker wants `41 41 41 ff ff ff 7f 00 00`, they can just overwrite {{the first three bytes}}, avoiding the need to feed in `0x00s` entirely.

# Exercises
```c
void vulnerable() {
    char buffer[100];
    scanf("%s", buffer);
    do_something_with(buffer);
}
```
```text
subq $120, %rsp        ; allocate 120 bytes
movq %rsp, %rsi        ; scanf arg1 = buffer = rsp
movl $.LC0, %edi       ; scanf arg2 = "%s"
xorl %eax, %eax        ; required for variadic functions
call isoc99_scanf
movq %rsp, %rdi        ; do_something_with(buffer)
call do_something_with
addq $120, %rsp
ret
```
* Above is the C and assembly for `vulnerable()`. The compiler allocates {{120}} bytes, even though `buffer` is only {{100}} bytes, because {{the extra 20 bytes are alignment space, so they are nop padding}}. Hint for the following questions: the stack layout is {{[high addresses], return address for vulnerable, unused space (20 bytes), buffer (100 bytes), return address for scanf, [low addresses]}}
    * Where does the saved return address for `scanf` sit relative to `buffer`? Answer: {{at a lower address, closer to the top of the stack}}
    * Where does the saved return address for `vulnerable` sit relative to `buffer`? Answer: {{at a higher address, farther from the top of the stack}}
    * What is the distance from `buffer[0]` to `scanf()`’s return address? Answer: {{`buffer[-8]`}}
    * What is the distance from `buffer[0]` to `vulnerable()`'s return address? Answer: {{`buffer[120]`}}
    * If you were to input 1000 'a' characters (`0x61`) to `vulnerable()`, after `scanf` returns, the saved return address for `vulnerable` will have been overwritten with {{`0x6161616161616161`}}. When `ret` executes, the following occurs: {{it attempts to jump to that address, but since that address is invalid, the CPU raises a segmentation fault}}. 

![alt text](image2.png){size=medium}
* Consider the code above. If shellcode begins at the beginning of `first`, what is its address going to be? Answer: {{`0x7fffffffdcf0`}}

![alt text](image3.png){size=medium}
* Consider the code above. If shellcode begins at the beginning of `first`, what is its address going to be? Answer: {{`0x7fffffffdc90`}}. (Hint: {{We are shown `rsp` immediately after jumping into `scanf`, so we only need to account for the 8-byte return address that's just been pushed on to the stack}}).


