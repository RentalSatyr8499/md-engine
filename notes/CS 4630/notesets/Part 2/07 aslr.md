* ASLR ("address space layout randomization"): varies the location of things in memory. This way, attackers can't {{hard-code addresses into attacks}}.
    * ASLR only protects memory as long as {{info leaks}} do not occur.
    * How the OS randomizes the stack location in ASLR: 
        1. Choose random number between 0 and an upper bound: 
            * On 64-bit, the upper bound is {{16 GB}} (0x3F FFFF).
            * On 32-bit, the upper bound is {{8 GB}} (0x7FF).
            * If randomization is disabled, just {{choose 0 as the random number}}.
        2. Use that random number to generate an offset with the following formula: {{0x7FFF FFFF FFFF + random number × 0x1000}}. 
        3. To randomize the location of further segments, the OS repeats the above process with increasingly small ranges to choose a random value from. The default random value remains 0. 
    * ASLR is a probabilistic defense, meaning attackers can overcome it through brute‑force if entropy is low and if they can guess without consequence. In comparison to 32-bit, the entropy of a 64-bit system is {{higher}}.
* Certain segments cannot be moved around independently from one another, but must remain at fixed offsets from one another in order for the executable to work. 
    * For example, in an `.exe` file, the code and {{globals and constants}} move as one block, because the code segment expects stuff in the other two segments to live at a constant offset from it. 
    * In other words, if you know {{any pointer in the executable}}, you know the whole executable's location. Same with any pointer in a stack or in a shared library.
* I didn't get to finish this one. I got like halfway through these slides.

# Exercises
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
* Exercise: Consider the code above. Which initial value for `p` (“left over” from prior use of register, etc.) would be most useful for a later buffer overflow attack? Answer: {{D}}
    * A. `p` is an invalid pointer and accessing it will crash the program
    * B. `p` points to global variable
    * C. `p` points to space on the stack that is currently unallocated, but last contained an input buffer
    * D. `p` points to space on the stack that currently holds a return address
    * E. `p` points to space on the stack that is currently unallocated, but last contained a pointer to the last used byte of an array on the stack