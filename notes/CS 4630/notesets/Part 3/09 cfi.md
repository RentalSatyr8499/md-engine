* "Control‑Flow Integrity" (CFI) is a mitigation strategy against return-oriented programming. While stack canaries make it hard to overwrite the return address, CFI verifies that the return target is {{actually the person who originally invoked the function}}.
    * Stack canaries can be defeated using {{an information leak (if the canary can be replicated, you can overwrite whatever it protects)}}. CFI cannot be defeated using such methods.
* "CFI Label instruction": a label encoding a {{random ID associated with the callee}}. Once a function finishes, it checks the bytes after the alleged "return address". If and only if {{they contain the expected label}}, the program jumps to that address. 
    * What does property does a stack canary need to work, that a CFI label doesn't? Why? {{The canary needs to be secret but the label doesn't, because the attacker would have to forge a label in a different place to bypass the protection, but we have W^X memory}}.
    * What attack do CFI labels prevent that stack canaries do not? {{It does not prevent attackers from overwriting the return address after it is checked but before it is returned to. Ie, return addresses are still writeable}}.
    * CFI labels not only legitimize return addresses, but VTable pointers, which are a frequent attack vector. This works by {{adding CFI labels to the beginning of each virtual method, which the program checks for (cmpq) before jumping into the virtual method}}.
        * Because the caller of a virtual function does not know which specific override will run (only that it must be one of the valid implementations of that method), all overrides of a function will share the same label. For example: given the `structs struct A { virtual void bar(); };` and `struct B : A { void bar() override; };`, we can say that `A::bar` and `B::bar` both {{have the same CFI label}}.
        * We can also say that the CFI labels used to return from `A::bar` and `B::bar` are {{also the same}}.
    * When it comes to variable function pointers, CFI labels run into problems. Suppose that during program execution, a function pointer `int (*p)(int a, int b)` can point to either `int add(int a, int b)`, `int subtract(int a, int b)`, or `int multiply(int a, int b)`. To implement CFI labels for the indirect call `(*p)(a, b)`, the compiler/runtime must choose between two strategies:
        1. Check to see if the CFI label of the outgoing function equals {{that of `add`, `subtract`, or `multiply`}}. The drawback here is {{performance (O(n))}}.
        2. Give `add`, `subtract`, and `multiply` all {{the same CFI label}}. The drawback here is {{precision (larger function classes makes things less and less secure)}}.
* Clang has an option that allows you to compile with CFI, but it only checks calls via VTables and function pointers.
    * If a program with external dependencies (needs libraries) is compiled with CFI, the {{libraries}} should be compiled with CFI too.
    * Specifically, the implementation works as follows: 
        1. All functions with the same type signature get assigned tiny stub, which are all placed in a contiguous block.
        2. When a function is called via `fptr`, round `fptr` to a multiple of 8. 
            * If this pushes `fptr` out of the bounds of the type block, crash.
            * Compare `fptr` to a bitmask recording which stubs are valid and which are not. 
        * This same process is extended to VTables as well.
* Nothing past slide 28 was covered in lecture.

# Exercises
* Suppose a system has CFI labels but not stack canaries. Function A and Function B both call Function C. An attacker wants to redirect control flow so that when C is called by A, it returns to B. 
    * What do we know about the return label in A and B (the ones that come after the calls to C)? {{They are the same in A and B}}.
    * Describe in plain english, at what point in time would the attacker need to overwrite the return address? {{In the middle of C, after it has checked the CFI label from A (`cmpq`) but before C has returned}}