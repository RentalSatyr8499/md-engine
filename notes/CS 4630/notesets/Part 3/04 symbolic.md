* Symbolic execution differs from ordinary execution on an emulator or virtual machine. Instead of feeding the program concrete input values, we treat inputs as symbolic variables, just like algebraic unknowns. 
    * As the program executes, we "walk" a particular path through its control flow and observe the {{logical constraints}} that need to be satisfied for execution to follow that path. 
    * By the end, we have a symbolic expression for the program’s outputs in terms of its inputs, along with a set of {{path constraints}}. 
    * A c{{onstraint solver}} can then determine whether any real inputs satisfy those constraints. 
    * If no solution exists, {{the path is impossible}}; if a solution exists, we can make it into a test case.
    * In Python, `angr` does this for you automatically.
* angr works directly on machine code. Tools like KLEE, by contrast, operate on {{an intermediate representation (IR)}}, which simplifies expressions and can detect errors like out‑of‑bounds accesses even when they aren’t immediately exploitable. 
* "{{Concolic}}" execution: a mix of concrete and symbolic execution. This involves {{running the program with concrete inputs while simultaneously tracking symbolic constraints}}.
* Solving arbitrary equations is classified as an {{NP-hard}} problem.
* How angr and KLEE fare against the problem of symbolic memory:
    * The default angr strategy for memory is to write to the highest memory address unless the code is annotated otherwise. This gives us the upside of performance but the drawback of losing precision in the final answer.
    # i don't get this part
    * KLEE can track memory objects and pointer provenance because the intermediate representation preserves this structure, whereas angr cannot because raw assembly loses that information. KLEE can therefore detect out‑of‑bounds accesses by checking whether a pointer leaves its allocated object.
* There are two ways to handle file I/O in angr.
    1.  Intercept system calls (requests to OS). Cons: slow
    2. Replace libc functions with 'symbolic' versions. Cons: doesn't work on statically linked programs, won’t detect issues resulting from libc details (ex. leftover uninitalized values) 
# left off on 53
# do we need to be able to write angr syntax?

# Exercises
```c
int foo(int a, int b) {
    a += b * 2;
    b *= 4;
    return a + b;
}
```
* Exercise: Consider the code above. Come up with a symbolic expression for `foo`'s return value in terms of α and β. Answer: {{α + 6β}}
```c
void foo(int a, int b) {
    if (a != 0) {
        b −= 2;
        a += b;
    }
    if (b < 5) {
        b += 4;
    }
    if (a + b == 5)
        INTERESTING();
}
```
* Exercise: Consider the code above.
    * Suppose we created a symbolic execution tree for it. How many leaves would there be on the tree, what logical branch does each leaf represent? {{Four leaves: `a != 0 && b < 5`, `a != 0 && b > 5`, `a == 0 && b < 5`, `a == 0 && b > 5`}}
    * Draw the symbolic execution tree. [Answer](https://imgur.com/crDfgJ5)
    * What input would allow us to execute `INTERESTING()`? Answer: {{`a = 5`,`b = 0`}}
```c
unsigned a, b;
void foo(unsigned c) {
    int *p;
    if (a > 100) {
        p = &a;
    } else {
        p = &b;
    }
    *p += c;
    assert(a + b == c);
}
```
* Exercise: Consider the code above. 
    * Draw the symbolic execution tree for it. [Answer](https://imgur.com/a/XPz2FQO) 
    * For what values of α and β is the assertion true? Answer: {{(α, β) = (0, 0)}}
    * What do we know about the final value δ? {{δ < 100}}
```c
void example(unsigned x, unsigned y) {
    if (x > y) return;
    x = x + y;
    assert(x + y + 1 > y);
}
```

* Exercise: Consider the code above. To see if the assertion is met, the equation should we solve? Let initial values of x, y, be X, Y. {{`X <= Y` and `X + 1 > Y`}}