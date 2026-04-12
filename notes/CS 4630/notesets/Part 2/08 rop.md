* Systems often {{mark memory as non-executable (W^X: write XOR execute)}}, so you can’t just put code on the stack and run it. An attack that works arounds these is ROP (return-oriented programming), which {{reuses existing code in the binary or its libraries}}. 
    * You find short instruction sequences that end in ret (called {{gadgets}}), and you arrange the stack so that each `ret` jumps to {{the next gadget}}. 
    * When finding gadgets that naturally occur in the binary, they can sometimes be hidden as{{ “misaligned” within other instructions}}. It's important to know that you don’t need a clean instruction boundary, you just need the right byte pattern to have a working gadget. ROP tools exploit this by scanning for gadgets {{at every byte offset, not just instruction boundaries}}.
* In order for a ROP attack to work, you need to have {{an information leak}} so you know where existing code is (you could alteratively also just disable {{ASLR}}).
![alt text](image5.png){size=small}
* Consider the stack layout above. The ROP chain would execute like this: firstly, it gets kicked off when {{`vulnerable` returns}}. This causes the PC to jump to {{the first gadget}}, which pops {{the address of `puts`}} into `rax`. When the first gadget returns, the rsp now points to {{the second gadget}}, so the PC jumps there. This gadget moves {{the string to print (which is on the stack, so `rsp`)}} into `rdi`, then calls {{`puts`}}.

* Exercise: Consider the information below. 
| address | instructions|
|---------|-------------|
|`0x100000` |(example function)|
|`0x100100`| `pop %rdi; ret`|
|`0x100200` |`xor %edi, %edi; ret`|
|`0x100300` |`xor %eax, %eax; ret`|
* Construct a ROP chain such that `example(0)` is run. What bytes should be put into the buffer overflow to execute this ROP chain attack?
    * Possible solution 1: {{`0x100100`, `0x0`, `0x100000`. So overflow with bytes `00 01 10 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 10 00 00 00 00 00`.}}
    * Possible solution 2: {{`0x100200`, `0x100000`. So overflow with bytes `00 02 10 00 00 00 00 00 00 00 10 00 00 00 00 00`.}}

* In practice, you don’t manually scan objdump for gadgets. You use {{tools like ROPgadget, Ropper, etc}}. They automate the following process used to find gadgets:
    1. Scan {{executable and library code segments}} (ex. `.text` sections of binaries and shared libraries)
    2. Search for opcode patterns. Gadgets often end in {{`c3` (`ret`)}}. They also end in: 
        * `ff e0`: `jmp *%rax`
        * `ff 20`: `jmp *(%rax)`
        * `ff d0`: `call *%rax`
    3. For each match, {{disassemble backwards}}.
        *  Start at {{a few bytes before the ending instruction}} and decode forward.
        * If {{the bytes decode into valid instructions}}, you keep the gadget.
        * If {{you hit invalid instructions, control-flow instructions that would break the chain, or other problematic instructions}}, you discard the gadget.
* ROPgadget usage: in terminal, run {{`ROPgadget −−binary /path/to/myBinary.exe`}}
    * If you want to customize the start location for the binary that ROPgadget uses, use the {{`--offset X`}} flag (sets start location to X address). 
    * If you want to ignore gadgets whose addresses contain forbidden bytes (ex. newline, null byte), you can use the {{`--badbytes XYZ`}} flag (ignores XYZ bytes).
    * If you want ROPgadget to write a python script that generates the ROP chain for a `execve("/bin/sh")` shell, use the {{`--ropchain`}} flag. ROPgadget's algorithm can either fail or succeed at this, depending on if {{it can find the necessary gadgets in the targeted binary}}.
* ROP is not tied to stack smashing. ROP whenever you can overwrite a function pointer, control a vtable entry, etc. For example: If Gadget 1 is `push %rdi; jmp *(%rdx)`, and Gadget 2 is `pop %rsp; ret`,...
    * What should we overwrite the function pointer to? {{point it to Gadget 1}}
    * Which arguments should we set, and to what? {{Argument 1 (rdi) should be our desired stack pointer value (probably the beginning of the ROP chain), and Argument 2 (rdx) should point to Gadget 2}}
* You might be able to prevent ROP by protecting `ret`s (ex. with a {{shadow stack}}), but malware authors could then pivot to {{JOP (Jump-Oriented Programming)}}.
    * JOP uses gadgets ending in {{`jmp *someRegister` or `call *someRegister`}} instead of `ret`.
    *  In JOP, we build a {{"dispatcher gadget"}} that controls the flow from one gadget to the next (since we don't have our automatically decrementing stack pointer doing the work for us anymore). The dispatcher gadget might look something like: 
```    
add $8, %rcx
jmp *(%rcx)
```
* 
    * Here, `%rcx` starts out pointing to {{gadget 1}}. At {{`%rcx+8`}}, we have a pointer to gadget 2, and at {{`%rcx+16`}}, we have a pointer to gadget 3...etc. 
    * JOP avoids using ret. So instead of ending in ret, each gadget must end with a jump back to the dispatcher gadget. 
        * Example: If `%rdx` stores the address at which the dispatcher gadget lives, a JOP gadget could end in `jmp *%rdx`.
        * Example: If `%rdi` points to a place in memory at which the dispatcher gadget's address is stored, a JOP gadget could end in `jmp *(%rdi)`.
* Exercise: Consider the information below. 
| address | instructions|
|---------|-------------|
|`0x100000` |(system function)|
|`0x100100`| `mov %rdi, (%rax); ret`|
|`0x100200` |`pop %rax; ret`|
|`0x100300` |`pop %rdi; ret`|
|`0x200000` | (some global variable)|
* Construct a ROP chain such that `system("/bin/sh")` is run. 
    * Hint: {{We want `%rdi` to point to the string "/bin/sh\0", but we don’t have a direct "store string here" (ie store string on the stack) gadget. But we *do* have the ability to: set %rax to any address (eg `0x200000`), set %rdi to any value (eg the integer representation of "/bin/sh\0"), and store %rdi into memory at address %rax (eg `0x100100`)}}.
    * Possible solution: {{`0x100200`, `0x200000`, `0x100300`, "/bin/sh\0", `0x100100`, `0x100300`, `0x200000`, `0x100000`}}
* One attempted defense against ROP attacks was G-Free (Onarlioglu et al., 2010), which removes a lot of unintended gadgets and adds canary-like checks to ret and jmp so they only work with a secret token. But problematically, G-Free is still vulnerable to {{info leaks}} and requires a lot of {{space and runtime overhead}}.
* "Blind ROP" is when you try to find gadgets without knowing what the binary looks like.   

# Exercises
```c
void getInitials(char *init) {
    char first[50]; char second[50];
    scanf("%s%s", first, second);
    init[0] = first[0];
    init[1] = second[0];
}
```

```
getInitials: 
    push %rbx
    xor %eax,%eax
    mov %rdi,%rbx
    // lea "%s%s" -> %rdi
    lea 0xe6e(%rip),%rdi
    sub $0xa0,%rsp
    // &second[0] -> %rdx
    lea 0x50(%rsp),%rdx
    // &first[0] -> %rsi
    mov %rsp,%rsi
    call __isoc99_scanf@plt
    mov (%rsp),%al
    mov %al,(%rbx)
    mov 0x50(%rsp),%al
    mov %al,0x1(%rbx)
    add $0xa0,%rsp
    pop %rbx
    ret
```
* Exercise: Consider the C and assembly code above. Suppose we have 64-byte ROP chain without whitespace in it. What are two possible ways to write the input to correctly align the ROP chain?
    * Possible solution 1: {{168 As, ROP chain, then press enter/carriage return}}
    * Possible solution 2: {{press enter/carriage, 88 As, ROP chain}}
```c
class Bar {
    char buffer[100];
    Foo *foo;
    int x, y;
    ...
};
void Bar::vulnerable() {
    gets(buffer);
    foo−>some_method(x, y);
}
```
* Exercise: Consider the code above. Suppose that `buffer` can be overflowed.
    * Before any stack-smashing occurs, what does the stack look like (in the order of increasing addresses)? {{[buffer][pointer to foo struct][x][y]}}
    * How can we overflow `buffer` to overwrite foo's vtable get `some_method` to run our own gadget? 
        1. At the beginning of `buffer`, place a fake {{`Foo` object}}, whose first field is {{a fake vtable pointer pointing somewhere later in `buffer`}}.
        2. Later in `buffer`, construct a fake {{vtable}} and place the gadget at {{index K, where `some_method` would normally be looked up}}.
        3. Overwrite `*foo` so that it points to {{our fake object at the start of `buffer`}}.
    * Suppose we have a gadget `push %rdx; jmp *(%rsi)`. We want to push `0xA` on the stack and jump to address `0xB`. How can we overflow `buffer` to achieve this? {{Follow the previously explained steps to run our own gadget. Then continue the buffer overflow to overwrite values `x` with `0xB` and `y` with `0xA`.}}   
    * The calling convention for vtables always require that a `this` pointer be passed. So the call to `some_method` actually executes something like `(*foo->vtable[K])(foo, x, y)`. If we wanted to control the `this` pointer, then, what register would we need to change? {{`rdi`}}

```c
struct Example {
    char input[1000];
    void (*process_function)(Example *, long, char *);
};
void vulnerable(struct Example *e) {
    long index; char name[1000];
    gets(e−>input); // line I
    sscanf(e−>input, "%ld,%s", &index, &name[0]); 
    (e−>process_function)(e, index, name);
}
```
* Exercise: Consider the code above. Suppose we overwrite `process_function`’s address with the address of the gadget `mov %rsi, %rsp; ret` via the buffer overflow exploit in line I. Which of the following could we put in the beginning of `input` to gain program control? Answer: {{D}}
    * A. the shellcode to run (assuming exec+writeable memory)
    * B. an ROP chain to run
    * C. the address of shellcode (or existing function) in decimal
    * D. the address of the ROP chain to run written out in decimal
    * E. the address of a RET instruction written out in decimal