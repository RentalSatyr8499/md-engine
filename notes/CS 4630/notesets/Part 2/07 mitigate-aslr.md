* ASLR ("address space layout randomization"): varies the location of things in memory. This way, attackers can't {{hard-code addresses into attacks}}.
    * ASLR only protects memory as long as {{info leaks}} do not occur.
    * Older executables had fixed LOAD addresses baked into the ELF, meaning addresses can’t be randomized. On the other hand, executables compiled on modern systems are PIE by default, making them compatible with ASLR.
    * How the OS randomizes the stack location in ASLR: 
        1. Choose random number between 0 and the upper bound, which changes based on the system. 
            * On 64-bit, the system is free to choose anywhere in a 16 GB range. So the value is between 0 and 0x3F FFFF.
            * On 32-bit, the system is free to choose anywhere in an 8 GB range, so between 0 and 0x7FF. 
            * If randomization is disabled, just choose 0 as the random number.
        2. Use that random number to generate an offset with the following formula: 0x7FFF FFFF FFFF + random number × 0x1000. 
    * To randomize the location of further segments, the OS repeats the above process with increasingly small ranges to choose a random value from. The default random value remains 0. 
    * ASLR is a probabilistic defense. Attackers can overcome it through brute‑force if entropy is low. This is because in certain scenarios, an attacker can guess over and over without consequence: a wrong guess might not crash the whole application; servers restart automatically; local programs can be run repeatedly. In comparison to 32-bit, the entropy of a 64-bit system is higher.

# go back to slide 11

```c
struct point {
    int x, y, z;
};

struct point *p;
...
if (command == "get") {
    printf("%d,%d,%d\n", p−>x, p−>y, p−>z);
} ...
...
```
* Exercise: which initial value for `p` (“left over” from prior use of register, etc.) would be most useful for a later buffer overflow attack? Answer: {{D}}
    * A. `p` is an invalid pointer and accessing it will crash the program
    * B. `p` points to global variable
    * C. `p` points to space on the stack that is currently unallocated, but last contained an input buffer
    * D. `p` points to space on the stack that currently holds a return address
    * E. `p` points to space on the stack that is currently unallocated, but last contained a pointer to the last used byte of an array on the stack

* Certain segments cannot be moved around independently from one another, but must remain at fixed offsets from one another in order for the executable to work. 
    * For example, in an .exe file, the globals, code, and constants must move as one block, because the code segment expects stuff in the other two segments to live at a constant offset from it. This is the only way instructions involving relative offsets, like bnd jmpq *0x2f75(%rip), can function.
    * The upside is that Linux does not have to deal with the overhead of resolving every single inter-segment reference every time an executable is loaded. The downside is that if you know any pointer in the executable, you know the whole executable's location. Same with any pointer in a stack or in a shared library.
```c
    class Foo {
        virtual const char *bar() { ... }
    };
    ...
    Foo *f = new Foo;
    printf("%s\n", f);
```
* Exercise part 1: What address is most likely leaked by the above?
    * A. the location of the Foo object allocated on the heap
    * B. the location of the first entry in Foo’s VTable
    * C. the location of the first instruction of Foo::Foo() (Foo’s compiler-generated constructor)
    * D. the location of the stack pointer
* Exercise part 2: suppose the above code leaked the value 0x822003. 