* Compilers insert a secret value  between local buffers and the saved return address called the {{canary}}.
    * A good canary is {{secret}}, {{random}}, and contains {{whitespace characters/other characters that are hard to input}}.
    * The function prologue loads a per‑thread random value (the canary) and stores it on the stack. Then, the function epilogue {{reloads the stored value and XORs it with the original to make sure it's still the same}}. 
    * Where is the canary relative to thing it's protecting? Answer: {{directly below (at a lower address), ie, closer to the top of the stack than the thing it's protecting}}.
    * Protecting all functions increases {{overhead}} significantly. We can reduce overhead by only generating canaries for {{“risky” functions (those with character arrays or similar patterns)}}. Example: GCC provides multiple protection levels (`-fstack-protector`, `-fstack-protector-strong`, `-fstack-protector-all`).
    * T/F: implementing stack canaries requires (and only requires) recompiling a binary. {{`T`}}
* Once an attacker gains *any* ability to read memory at an arbitrary address, even if it's inconvenient or only reveals a tiny bit of memory at a time, they can reuse that primitive many times, gradually walking through memory and discovering values that are not directly reachable in one step. Any bug (like overflowing into a pointer) that gives the attacker control over where a read happens can be called a {{read gadget}}. One way to prevent read gadgets from hijacking the return address is to use a "{{shadow stack}}" instead of a normal stack, which stores only {{return addresses}}. Some options for implementing shadow stacks are:
    1. Make `%r15` the shadow stack pointer, and store the return address twice. To implement this: in a function's prologue, (1) load the return address from `(%rsp)`, (2) decrement {{`%r15`}}, (3) then {{store the return address to `(%r15)`}}. Then, in the epilogue, (1) compare {{the return addresses stored in `(%rsp)` and `(%r15)`}}; (2) if they match, {{increment `%r15` and then `ret`}}, crash otherwise.
    2. Make `%r15` the shadow stack pointer, but don't use `call` or `ret`, and store the return address once. To implement this: before stepping into a subroutine, compute the return address of the current routine using `leaq` and push it to the {{shadow stack `(%r15)`}}. When you need to return back to a function, {{don't use `ret`. `jmp` to the address on the shadow stack instead}}. 
    3. In ARM, register x18 is sometimes used as the shadow stack pointer. The shadow stack can be enabled via `-fsanitize=shadowcallstack`.
    4. Intel "CET (Control-flow Enforcement Technology)": This is an example of {{hardware}}-enforced shadow stacks, where `call` and `ret` automatically {{`push` and `pop` from both stacks}} without any extra work on the compiler's end. Shadow stack memory is {{hardware write}}-protected.
* Which is a stronger protection, shadow stacks or canaries? Answer: {{shadow stack}}.
* In real-world programming, we sometimes have mechanisms that cause `%rsp` to skip over multiple function frames at once. If the shadow stack pointer isn't somehow kept up-to-date when a skip like this occurs, the next time you try to return, the shadow stack will still be pointing to {{an old, "stale" address}}. One way around this is to store the shadow pointer at {{a very large, constant offset from `%rsp`}}. This solves the problem because {{when `%rsp` skips function frames, `%r15` skips by the same amount, allowing it to stay up-to-date with non-local returns}}.

# Exercises
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
* Poor index validation can allow writes that both avoid the stack canary and overwrite the return address. Consider the code above. To set the return address to `0x123456789`, what can an attacker input? Answer: {{`scores[10] = 0x0x2345678`, `scores[11] = 0x1`}}
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
*Stack canaries detect corruption only if the attacker cannot reproduce the canary. But attackers can sneakily inspect the stack to reveal it. Consider the code above. What can you input into the `scanf()` to get the `printf()` to print a string containing the canary? Answer: {{Any 8 characters, then the address of the canary. For example if the canary was at 0x12345, then aaaaaaaa12345 would print "first number: ", then the canary}}.
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
