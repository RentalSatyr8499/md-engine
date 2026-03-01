* “Smashing the Stack for Fun and Profit” (Aleph1, 1996) is the foundational write‑up on stack‑based overflows.

```c
void vulnerable() {
    char buffer[100];
    scanf("%s", buffer);
    do_something_with(buffer);
}
```
* `scanf("%s")` performs no bounds checking, so any input longer than 100 bytes will end up {{spilling past `buffer` into adjacent stack memory}}. This enables the attacker to overwrite {{local variables, saved registers, and return addresses}}.

```
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
```
[high addresses]
return address for vulnerable
unused space (20 bytes)
buffer (100 bytes)
(return address for scanf)
[low addresses]
```
* Above is the assembly for `vulnerable()`. The compiler allocates {{120}} bytes, even though `buffer` is only {{100}} bytes, because {{the extra 20 bytes are alignment space, so they are nop padding}}.
    * Where does the saved return address for `scanf` sit relative to `buffer`? Answer: {{below it}}
    * Where does the saved return address for `vulnerable` sit relative to `buffer`? Answer: {{above it}}
    * What is the distance from `buffer[0]` to `scanf()`’s return address? Answer: {{`buffer[-8]`}}
    * What is the distance from `buffer[0]` to `vulnerable()`'s return address? Answer: {{`buffer[120]`}}
* If you were to input 1000 'a' characters (`0x61`) to `vulnerable()`, after `scanf` returns, the saved return address for `vulnerable` will have been overwritten with {{`0x6161616161616161`}}. When `ret` executes, the following occurs: {{it attempts to jump to that address, but since that address is invalid, the CPU raises a segmentation fault}}. 

* To execute a return‑to‑stack stack-smashing attack,  place your payload at this location: {{inside the buffer on the stack}}. Then, your overflow needs to overwrite the {{saved return address}} so that `ret` jumps to {{the payload that's in the buffer}}.
    * The payload in the buffer is also called {{shellcode}}, because historically, many payloads spawned a shell in remote exploits.
    * Shellcode must be {{position}}‑independent and self‑contained, meaning it cannot rely on {{linking, library calls by name, and returns}}. It must also {{exit}} cleanly after running.
Steps to constructing a return-to-stack attack
1. Write the {{shellcode}}. Instead of using libraries, use {{system calls}}. Instead of returning, use {{`exit_group` (`syscall` id `231`)}}.
2. Determine the {{address where the shellcode will reside in the buffer}}. Because of {{ASLR, which randomizes memory layout, and other environmental factors}}, the exact address of the payload will change from environment to environment. But the {{offset of the payload from the stack pointer will remain the same}}. So we use that to determine where to jump to instead.
    * We can disable ASLR with {{`setarch -R`}}.
    * We can find the stack location by {{writing a C program that initializes a variable then prints its address (ex.`printf("%p\n", &x);`)}}.
    * We can give our guessing some leeway by adding a {{nop sled}} to the beginning of the payload.
    * GDB cannot identify function boundaries, which can cause `disassemble` to fail or show garbage instructions. We can work around this by {{disassembling around `$rip` manually (`disassemble $rip-4, $rip+1`), and searching for recognizable patterns (prologues, epilogues)}},
3. Overwrite the return address value

* One historical example of a virus that used this technique is the {{Morris worm}}.

Exercisesss
![alt text](image2.png){size=large}
* 
    * If shellcode begins at the beginning of `first`, what is its address going to be? Answer: {{`0x7fffffffdcf0`}}

![alt text](image3.png){size=large}
* 
    * If shellcode begins at the beginning of `first`, what is its address going to be? Answer: {{`0x7fffffffdc90`}}. (Hint: {{We are shown `rsp` immediately after jumping into `scanf`, so we only need to account for the 8-byte return address that's just been pushed on to the stack}}).


* What limits which bytes we can pass into injected machine code? Functions like `scanf("%s")` accept only {{non‑whitespace characters (can't accept `'\t'`, `'\v'`, `'\r'`, `'\n'`, or `'\0'`)}}; and {{other format strings (e.g., `%[a-zA-Z0-9._ ]`)}} can add even more restrictions. Ways to get around this:
    * Use one‑byte immediates (`movb`, `xor`, `inc`) to avoid instructions that naturally contain with zeros. For example, use `movb $1, %al` (`b0 01`) instead of `mov $1, %eax` (`b8 01 00 00 00`).
    * Store strings *before* the code. Then, use a short forward jump (uses a 1-byte offset instead of a 4-byte offset) to skip over embedded strings.
    * Use negative RIP‑relative offsets to reference nearby data without introducing null bytes.
    * Zero registers using `xor`.
    * Construct values using arithmetic (zero a register with `xor` then increment until reaching the desired value).
* The overwritten return address must also obey input restrictions. If certain bytes cannot be injected, attackers may:
    * Partial pointer overwrite. Some bytes of the original return address may already be zero and can remain unchanged. Ex. if the original address is `2c de ff ff ff 7f 00 00`, and the attacker wants `41 41 41 ff ff ff 7f 00 00`, they can just overwrite the first three bytes, avoiding the need to feed in `0x00s` entirely.
        * With this technique, sometimes you need to place shellcode after the overwritten return address (sometimes you can only achieve a forward jump with a partial pointer overwrite, because jumping backwards would require changing high bytes).
    * find another writable region to place shellcode (ex. global or heap buffers)
    * target a different pointer on the stack.

