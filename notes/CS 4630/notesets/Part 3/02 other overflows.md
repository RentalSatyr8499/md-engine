```c
struct foo {
    char buffer[100];
    void (*func_ptr)(void);
};
```
* Easy heap overflow: in heap memory, {{`buffer`}} comes first and {{`func_ptr`}} comes immediately after. So if you do `strcpy(foo->buffer, attacker_controlled);`, and the attacker supplies >{{100}} bytes, the overflow walks right into the function pointer.
* Metadata corruption heap overflow: `free()` is implemented in a way that uses metadata to write to memory. If this metadata is corrupted, then, an attacker could conduct an {{arbitrary memory write}}.
```c
struct AllocInfo {
    bool free;
    int size;
    AllocInfo *prev; // assume this is 16 bytes into AllocInfo
    AllocInfo *next;
};
int free(void *object) {
    ...
    block_after = object + object_size;
    if (block_after−>free) {
        new_block−>size += block_after−>size;
        block_after−>prev−>next = block_after−>next; // line I
        block_after−>next−>prev = block_after−>prev;
    }
...
}
```
* 
    * For example, `free()`'s implementation might look something like above (obviously this is simplified). This is easily exploitable. Say an attacker targets line I. To overwrite `free()`'s GOT entry with shellcode, the attacker would overflow the buffer of {{`object`}} such that...
        * `block_after->prev` is overwritten with {{the location of `free()`'s GOT entry, minus 16 bytes}}
        * `block_after->next` is overwritten with {{shellcode}}  
* Double-free attack: Recall the way that `free()` is implemented. 
    * The allocator keeps track of a {{doubly linked list}} of free blocks. Every time a new block is allocated, the block at the {{head}} of the linked list is removed. This requires redirecting the following pointers: (1) {{`head = head->next`}}, (2) {{`head->next->prev = NULL` }}  
    * Now consider the code, `free(p); free(p);`. When `free()` is called on the same heap chunk twice, it is added to the {{linked list of free blocks}} twice: `first_free → p → p → ...`. Now if `malloc()` is called twice, it {{returns the same block}} both times. Because the same memory is being used for two different things, we can now exploit in the same style as a {{use-after-free}} attack
* Sometimes bounds checking is implemented as a means of preventing overflow. But if there's a bug in the bounds-checking code, then that presents a vulnerability too. Specifically, if `len` (where `len` is the size of the buffer) is attacker-controlled, we can perform an {{integer overflow or underflow}} attack.
* If "undefined behavior" occurs in C, compiler behavior can differ from implementation to implementation. You cannot reliably predict what will happen due to undefined behavior in C.
    * If signed integer overflow occurs, the following will occur: {{the C compiler can do anything it wants because the behavior is undefined}}.
    * If unsigned integer overflow occurs, {{the following will occur: the value will wrap around (upper bits get truncated off)}}.
    * If you want the compiler to flag undefined behavior, you can compile with the {{`-fsanitize=undefined`}} flag. If you want the compiler to refuse to compiled with undefined behavior, use the {{`-ftrapv`}} flag.
    * In Rust, if overflow occurs in "debug mode", a {{panic}} will occur. If overflow occurs in "release mode", {{the value wraps around}}. 

# Exercises
```c
void operator delete(void *p) {
    ...
    block_after−>prev−>next = block_after−>next;
    ...
}
...
class MyBuffer : public GenericMyBuffer {
    public:
        virtual void store(const char *p) override {
            strcpy(buffer, p);
        }
    private:
        char buffer[64];
};

GenericMyBuffer *a = new MyBuffer;
a−>store(attacker_controlled);
delete a;
```
* Exercise: Consider the code above. 
    * To attack this buffer overflow by overwriting the heap data structures does it matter if space after `a` is already free or not? Answer: {{Yes, because `block_after−>prev−>next = block_after−>next;` is unlinking code that only runs when the allocator is trying to coalesce the newly freed block with a free block that comes right after it}}.
    * Suppose that...
        * Free blocks look like [`size` + `free` (8 bytes)][`next` pointer (8 bytes)][`prev` pointer (8 bytes)][...]
        * Allocated blocks look like [`size` + `free` (8 bytes)][vtable pointer (8 bytes)][`buffer` (64 bytes)][padding (16 bytes)][next `size` + `free`...]
        * `a` is allocated at address `0x10000`.
    * If an attacker wants to overwrite the value at address `0x20000` with the value `0x30000`, where should attacker put `0x20000` and `0x30000` in `attacker_controlled`? Answer: {{Write `0x30000` 88 bytes into the buffer, and `0x1FFF8` 96 bytes into the buffer}}
```c
free(thing);
free(thing); // line 2
char *p = malloc(...); // line 3
strcpy(p, attacker_controlled); // line 4
malloc(...); // line 5
char *q = malloc(...); // line 6
strcpy(q, attacker_controlled2); // line 7
```
* Exercise: Consider the double-free exploit above. 
    * After line {{2}}, the free list illegitimately contains the same block twice. 
    * Suppose we constructed `attacker_controlled` such that the heap chunk's `next` pointer points to a GOT entry. After line 5 executes, what does the linked list look like? {{The head of the list points to the GOT entry, because `malloc()` ran the line `head = head->next`}}.
    * Suppose `attacker_controlled` is constructed as previously described. Where does `attacker_controlled2` write to now? {{The GOT entry}}
```c
item *load_items(int len) {
    int total_size = len * sizeof(item);
    if (total_size >= LIMIT) {
    return NULL;
}
item *items = malloc(total_size);
    for (int i = 0; i < len; ++i) {
        int failed = read_item(&items[i]);
        if (failed) {
            free(items);
            return NULL;
        }
    }
    return items;
}
```
* Exercise: Consider the code above. Suppose an attacker could control the value of `len`.
    * Which variable could potentially be overflowed? {{`total_size`}}
    * What is the smallest value an attacker could pass to `len` that would still allow them to overflow the malloc'ed space? {{`0x1000 0000`}}
```c
void vulnerable() {
    int items[100];
    int count; 
    bool success = try_read_input(&count); // line I
    if (!success) { ... }
    if (count * sizeof(int) >= sizeof(items)) {
        printf("cannot handle that many\n"); return;
    }
    for (int i = 0; i < count; i += 1) {
        if (!try_read_input(&items[i])) { // line II
            printf("premature end of input\n"); return;
        }
    }
    process_items(items);
}
```
* Exercise: Consider the code above. Lines I and II read in the attacker's input. Suppose `sizeof(int)` returns `4`.
    * What first input number could we provide to begin an overflow exploit? {{Any number greater than or equal to `0x400 0000` is correct}} 
    * What can we input next to replace the next return address with `0x12345678`? {{Fill `items[0]` through `items[99]` with junk. Then overwrite the return address using: `0x78`, `0x56`, `0x34`, `0x12` encoded as ascii characters.}}
# more exercises in lecture video

