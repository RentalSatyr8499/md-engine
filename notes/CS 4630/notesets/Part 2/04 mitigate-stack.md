* Compilers insert a secret value  between local buffers and the saved return address called the {{canary}}.
    * The function prologue (beginning) loads a per‑thread random value (the canary) and stores it on the stack. 
    * A good canary is {{secret}}, {{random}}, and contains {{whitespace characters/other characters that are hard to input}}.
    * The epilogue (end) reloads the stored value and XORs it with the original to make sure it's still the same. 
* An overflow must pass through the canary before reaching the return address.
    * Where is the canary relative to local arrays and other vulnerable objects? Answer: {{directly above (higher address)}}
    * Where is the canary relative to the return address it's protecting? Answer: {{directly below (lower address)}}
* Why are canaries are so hard to overwrite correctly? Answer: {{it contains bytes that are difficult input, like whitespace characters, like null byte, newline, and `0xFF`}}.
* Protecting all functions increases {{overhead}} significantly. We can reduce overhead by only generating canaries for {{“risky” functions (those with character arrays or similar patterns)}}. Example: GCC provides multiple protection levels (`-fstack-protector`, `-fstack-protector-strong`, `-fstack-protector-all`).
* Pros of stack canaries: no changes to the calling convention; requires only recompilation, (not system‑wide changes)
* Cons of stack canaries: cannot protect existing binaries without recompilation; does not stop overflows targeting things besides return addresses (ex. function pointers); vulnerable to information leaks that reveal the canary.

* Non-contiguous overwrite: poor {{index validation}} can allow writes that both avoid the stack canary and overwrite the return address.
```c
void vulnerable() {
    int scores[8]; bool done = false;
    while (!done) {
        prinf("Edit which score? (0 to 7) ");
        int i;
        scanf("%d\n", &i);
        printf("Set to what value? ");
        scanf("%d", &scores[i]);
    }
}
```
* Exercise: to set the return address to `0x123456789`, what can an attacker input? Answer: {{`scores[10] = 0x0x2345678`, `scores[11] = 0x1`}}

* Revealing the canary: Stack canaries detect corruption only if the attacker cannot reproduce the canary. But attackers can sneakily inspect the stack to reveal it. Ways to coerce the stack into leaking info include...
    * uninitialized stack reads to reveal leftover values from previous functions.
    * printing a buffer that was only partially written (exposing whatever bytes were already on the stack).
    * structs containing pointers can leak arbitrary memory if the pointer is attacker‑controlled.
    * exploiting repeated reads, leaking memory byte‑by‑byte by adjusting pointers or offsets.

```c
void vulnerable() {
    int value;
    if (...){
        ...
    } else if (command == "get") {
        printf("%d\n", value);
    }
    ...
}
void leak() {
    int secrets[] = {
        12345678, 23456789, 34567890,
        45678901, 56789012, 67890123,
    };
    do_something_with(secrets);
}
int main() {leak(); vulnerable();}
```
* Exercise: If you input "get" into the above program, what value will it print? Answer: {{`67890123`}}

```c
struct foo {
    char buffer[8];
    long *numbers;
};
void process(struct foo* thing) {
    ...
    scanf("%s", thing−>buffer);
    ...
    printf("first number: %ld\n", thing−>numbers[0]);
}
```
* Exercise: what can you input into the `scanf()` to get the `printf()` to print a string containing the canary? Answer: {{Any 8 characters, then the address of the canary. For example if the canary was at 0x12345, then aaaaaaaa12345 would print "first number: ", then the canary}}.
* Once an attacker gains *any* ability to read memory at an arbitrary address, even if it's inconvenient or only reveals a tiny bit of memory at a time, they can {{reuse that primitive many times}}, gradually walking through memory and discovering values that are not directly reachable in one step. Any bug (like overflowing into a pointer) that gives the attacker control over where a read happens can be called a {{read gadget}}.

```c
struct point {
    int x, y, z;
};
struct point p;
if (command == "get") {
    /* 'p' could be uninitialized */
    printf("%d,%d,%d\n", p.x, p.y, p.z);
} ...
...
```
* Exercise: Suppose `p` (“left over” from prior use of register, etc.) is stored at the same address of an ‘leftover’ copy of the 8-byte stack canary. Assume `int`s are 4 bytes. If `999999,44444,333333` is output, what is the stack canary? Answer: {{`0x0000ad9c000f423f`}}. (Hint: {{`p.y` overlays the higher 4 bytes of the canary, while `p.x` overlays the lower 4 bytes. `p.z` is not useful to us in this problem.}})

* One solution to reading gadgets is to use a {{shadow stack}} instead of a normal stack.
    * A "shadow stack" stores only {{return addresses}}. It is implemented by modifying the {{compiler and ABI}} to *typically* do the following:
        * On `call`: push return address to {{both the normal stack and the shadow stack}}.
        * On `ret`: compare {{return addresses from both the normal stack and shadow stack}}; if {{they don't match}}, then abort.
        * Alternatively, you could simply store the return address once in the {{shadow stack}}.
    * Which is a stronger protection, shadow stacks or canaries? Answer: {{shadow stack}}.
* Ways to implement a shadow stack: 
    1. Make `%r15` the shadow stack pointer, and store the return address twice. To implement this: in a function's prologue, (1) load the {{return address}} from {{`(%rsp)`}}, (2) decrement {{`%r15`}}, (3) then store the {{return address}} to {{`(%r15)`}}. Then, in the epilogue, (1) compare {{the return addresses stored in `(%rsp)` and `(%r15)`}}; (2) if they match, {{increment `%r15` and then `ret`}}, otherwise, {{crash}}.
    2. Make `%r15` the shadow stack pointer, but don't use `call` or `ret`, and store the return address once. To implement this: before stepping into a subroutine, compute the return address of the current routine using {{`leaq`}} and push it to the {{shadow stack `(%r15)`}}. When you need to return back to a function, don't use `ret`; instead {{`jmp` to the address on the shadow stack}}. 
    3. In ARM, register x18 is sometimes used as the shadow stack pointer. The shadow stack can be enabled via `-fsanitize=shadowcallstack`.
    4. Intel "CET (Control-flow Enforcement Technology)": This is an example of {{hardware}}-enforced shadow stacks, where `call` and `ret` automatically {{`push` and `pop` from both stacks}} without any extra work on the compiler's end. Shadow stack memory is {{hardware write}}-protected.
* Problem with storing two stacks in two separate locations: in real-world programming, we sometimes have mechanisms that cause `%rsp` to skip over multiple function frames at once, like setjmp and longjmp in C or try-catch exceptions in C++. If the shadow stack pointer isn't somehow kept up-to-date when a skip like this occurs, the next time you try to return, the shadow stack will still be pointing to {{an old, "stale" address}}. Two possible solutions to this include:
    * The "direct" shadow stack: the shadow stack is not stored somewhere else in memory but rather at {{a very large, constant offset from `%rsp`}}. This solves the problem because {{when `%rsp` skips function frames, `%r15` skips by the same amount, allowing it to stay up-to-date with non-local returns}}.
    * Intel CET specifically has worked around this problem by supporting additional instructions: {{`RDSSP`}}, which {{reads shadow stack pointer}}, and {{`INCSSP`}}, which {{increments shadow stack pointer}}.

