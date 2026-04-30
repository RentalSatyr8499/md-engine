* Modern Linux/GCC can automatically replace unsafe functions like memcpy with checked versions such as `__memcpy_chk`.
    * You can choose differnt levels of the `FORTIFY_SOURCE` flag to make the bounds check more or less strict.
* "{{Fat pointers}}": a proposed solution to the C bounds-checking dilemma where pointers store ({{pointer}}, {{min}}, {{max}}) triples. Drawbacks: it requires {{three}} times as much space, and two comparisons for every pointer access.
* "Baggy bounds": Memory is divided into chunks of 16 bytes. A lookup table maps each 16‑byte chunk to the object that starts there, if it exists.
    *  If `str` and `&str[i]` belong to the same allocated object, then their "start of object" entries in the table should match.
    * But to optimize lookup table space, the lookup table does not explicitly store the address of the starting location, but rather, the size of each object. 
        * In order to make this optimization work, baggy bounds tables always follow these two rules: 
            1. All object sizes are {{powers of two}}. So in binary, they will always follow the form `10000...` (followed by zeroes only).
            2. All object starting addresses are {{a multiple of their size}}. So in binary, they will always follow the form `xxx0000...`, where the number of zeroes at the end is the same number of zeroes as {{the object size}}.
            3. The table stores {{the exponent of the size of the object that chunk belongs to}}.
        * Suppose `ptr` points somewhere within an object called `myObject`. 
            * The upper bits of `ptr`'s address will look the same as myObject's base address, while the lower bits represent `ptr`'s offset from `myObject`'s base address. For example, if `ptr` = `101110`, and the `myObject` = `101000`, the offset is {{`110`}}, and the size of myObject is {{$2^{3}$ = 8}}. So given `ptr`, we can get to the base address by masking off *x* number of lower bits, where *x* corresponds to {{the exponent of `myObject`'s size}}.
            * If table entries are 16 bytes, we can access the `TABLE` entry corresponding to `ptr` using {{`TABLE[ptr / 16]`}}.
            * To find the base address of that `myObject`, then, the calculation we need to perform is: {{`ptr & ~((1 << TABLE[ptr / 16]) − 1);`}}.
    * The space optimization described above is necessary because it is infeasible to store a lookup table with the full address of every single object. The tradeoff to this, however, is that {{object sizes need to be rounded up to the nearest power of two}}. This is why this strategy is called "baggy bounds".
    * Also, the lookup table itself can be sparse. Only parts of the address space that are actually used (heap, stack, globals) need table entries, while large unused chunks of the table can be unmapped. This saves memory and can catch wild pointers.
    * To bounds-check baggy bounds, all you need to do is check if if two pointers are in the same $2^{k}$‑byte-aligned region.
        * In other words, two points who have identical {{upper bits (above k, where k is the exponent of the object's size)}} belong to the same object.
        * If bounds-checking an array access, the two pointers you compare would be the array itself and the pointer that's accessing i.
        * Suppose we want to check if pointer `p2` points to the same object as pointer `p1`. point to the same object. In assembly, we can implement this bounds-check by...
            1. {{XORing}} `p1` and `p2` to clear equal bits
            2. Shifting right by `k` to discard the lower `k` bits. Here, `k` is {{taken from the lookup table entry for `p1` (ie, the size of `p1`'s object)}}
            3. If {{the result is zero}}, `p1` and `p2` are within the same object.
    * "Pointer tagging": Instead of a separate table, encode the size information in the pointer itself. GetStartOfObject and bounds checks can be done using just the tagged pointer. This eliminates the need for a table lookup.
        * Typically, we use high bits (or unused bits) of a 64‑bit pointer to store the size exponent.
* Big But: Due to the way real C code in the wild is written, many theoretically clean strategies become infeasible, incomplete, or too expensive. FORTIFY_SOURCE, fat pointers, baggy bounds, and other strategies that involve static analysis of entity sizes break because C programmers will...
    * Dynamically size arrays or structs
    * Cast from pointers to integers and back, truncating metadata
    * Cast from class to subclass
    * Deliberately declare out-of-bounds pointers but never dereference them for calculation's sake
    * Have objects inside objects

* "{{AddressSanitizer}}" (ASan): a compiler‑inserted memory access checker.
    * In order to catch out-of-bounds accesses on the stack and heap, ASan {{inserts “red zones” around stack and heap objects}}.
    * ASan detects use‑after‑free by {{poisoning freed memory}}.
    * ASan is very similar to baggy bounds, but still has a few key differences:
        * Baggy checks pointer arithmetic, while ASan checks {{memory accesses (reads/writes)}}.
        * Baggy can detect when you overflow into another valid object, while ASan {{cannot tell the difference between objects (so it only tells you when you overflow into memory that is unallocated entirely)}}.
        * Baggy tracks the validity of each 16‑byte block, while ASan tracks validity of {{every individual byte}}.
        * Baggy needs to pad objects to powers of two, while ASan {{does not}}.
    * For example: ASan inserts lines that look like `if (!lookup_table[&array[offset]] == VALID) FAIL();`.
        * Asan crashes only if the lookup table says that{{`array[offset]` isn’t part of any object}}.
        * If accesses cross into another valid object, ASan {{does not detect it}}.
        * If accesses cross into invalid memory, ASan {{detects it}}.
    * ASan does not insert actual red zones into real memory. Instead, it {{keeps and updates a copy of memory that has red zones inserted into it. This copy is called shadow memory}}.
* Valgrind Memcheck: Like ASan, except it works on {{unmodified binaries}} (does need the help of the {{compiler}}). Instead, it uses binary translation (JIT rewriting of machine code) to track {{heap allocations and shadow memory}}. A drawback of Valgrind Memcheck is that {{it drastically slows down performance}}.
    * It works by running the binary on a runs software-emulated CPU whose instructions are checked against a shadow memory. Every time the program counter jumps to a new place in code, Valgrind Memcheck:
        * Divides the machine code up until the next "basic block", ie {{the next block of straight-line code, aka the code until the next jump/call/etc}}. 
        * Converts or instrumentates the code so that {{it is checked against Valgrind Memcheck's shadow memory, which keeps track of valid and invalid bytes}}.
        * Patches the next jump/call/etc. so that if {{the next block is already converted}}, the PC jumps there. Otherwise, it jumps the original binary's unconverted code and works on converting that next. 
    * Valgrind Memcheck works a lot like "{{just in time}}" (JIT) compiler.

# Exercises
* Exercise: for each of the following code snippets, will they be bounds-checked by the compiler?
    * `sprintf(dest, format, ...);` {{`N`}}
    * `char dest2[1024]; memcpy(dest2, ...);` {{`Y`}}
    * `char *p = &dest2[4]; memcpy(p, ...);` {{`Y`}}
    * `strcat(dest, source);` {{`N`}}
    * `memcpy(f−>buffer1, dest2, size);` {{`N`}}
    * `memcpy(f.buffer1, dest2, size);` {{`N`}}
    * `strcpy(dest, source);` {{`N`}}
* Consider the code, `strncpy(dest, source1, sizeof dest);`. The manual says, "If there is no null byte among the first n bytes of src, the string placed in dest will not be null-terminated." What should the programmer do to ensure safe bounds behavior based on this information? Answer: {{guarantee null termination}}
* Consider the code, `strncat(dest, source2, sizeof dest);`. The manual says, "If src contains n or more bytes, strncat() writes n+1 bytes to dest (n from src plus the terminating null byte). Therefore, the size of dest must be at least strlen(dest)+n+1". What should the programmer do to ensure safe bounds behavior based on this information? Answer: {{constrain the size of the write to the amount of space left in the buffer, ie `strncat(dest, src, sizeof(dest) - strlen(dest) - 1);`}}
* Exercise: Suppose a program allocates a thousand 100-byte objects and one 10,000-byte object. Using baggy bounds, estimate:
    * The space required for padding. Answer: {{34384 bytes}}
    * The space required for table. Answer: {{9024 bytes}}
```c
char *strcat(char *d, char *s) {
    int i;
    for (i = 0; s[i] != '\0'; i += 1) {
        d[i] = s[i];
    }
    d[i] = '\0';
    return d;
}
```
estimate:
number of bounds checks needed
very rough number of instructions run w/o bounds check
im not doing this nonsense

```c
struct foo {
    char buffer[1024];
    int *pointer;
};
struct foo array_of_foos[1024];
...
char *p = &array_of_foos[4].buffer[4]
```
* Exercise: Consider the code above. When `*p` is bounds-checked using baggy bounds, the compiler checks whether or not it belongs to...{{the entire `struct foo` instance, not the array within the object}}.
* Exercise: because C programmers often game the lack of bounds-checking, many of the strategies discussed above actually can't be feasibly implemented on existing C code. Fill out the table below.
| code | what could be problematic about it? | would it work with `FORTIFY_SOURCE`? | would it work with fat pointers? | would it work with baggy bounds? |
|--------------|------------------|----------------------------|---------------------------|---------------------------|
| `struct S { unsigned linkcount; char string[1]; };` | {{the real size of `string` is determined by malloc}} | {{`N`}} | {{`N`}} | {{`N`}} |
| `arr = arr - 1;` | {{deliberately out‑of‑bounds pointer (used later in looping logic)}} | {{`N`}} | {{`N`}} | {{`N`}} |
| `PTR2UV(p)` / `INT2PTR(type, x)` | {{casts pointer to integer and vice versa}} | {{`N`}} | {{`N`}} | {{`N`}} |
| `struct Sub { struct Super s; int y; };` | {{nests structs}} | {{Partially. Compiler may only know size of outer struct, not field.}} | {{`N`}} | {{`N`}} |
```c
struct foo {
    char buffer[1024];
    int *pointer;
};
struct foo array_of_foos[1024];
...
char *p = &array_of_foos[4].buffer[4]
```
* Consider the code above. Fill out the table below.
| strategy | what it sees as the “object” | can it detect buffer‑internal overflow? |
| --- | --- | --- |
| AddressSanitizer | {{`struct foo`}} | {{No}} |
| Baggy Bounds | {{`struct foo`}} (padded) | {{No}} |
| Fat pointers | {{`buffer`}} (if metadata preserved) | {{Yes (in principle)}} |
* Exercise: fill out the table below.
| scenario | do fat pointers prevent it/will it cause it to crash? | do baggy bounds prevent it/will it cause it to crash? | does AddressSanitizer prevent it/will it cause it to crash? | does Valgrind Memcheck prevent it/will it cause it to crash? |
|----------|------------------|------------------|------------------------|-------------------------|
| execute externally compiled assembly code that writes past a heap buffer | {{`N/N`}} | {{`N/N`}} | {{`N/N`}} | {{`Y/Y`}} |
| attacker inserts 150 bytes into 100‑byte heap buffer | {{`Y/N`}} | {{`Y/Y`}} | {{`Y/Y`}} | {{`Y/Y`}} |
| attacker inserts 120 bytes into 100‑byte stack buffer | {{`Y/N`}} | {{`Y/N`}} | {{`Y/Y`}} | {{`N/N`}} |
| attacker uses array[attacker_index] to overwrite outside heap array (but into another valid object) | {{`Y/N`}} | {{`Y/N`}} | {{`N/N`}} | {{`N/N`}} |
