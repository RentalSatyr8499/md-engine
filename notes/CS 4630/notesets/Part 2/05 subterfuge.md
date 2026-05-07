* "Pointer subterfuge" attack: a class of vulnerabilities that uses buffer overflows to corrupt a pointer. When the pointer is stored on the stack, this is especially useful for overwriting the return address because {{it skips the canary}}.
* Besides the stack, there are other situations where writeable buffers accidentally end up next to pointers, and can overwrite them. For example, {{structs or globals}}. Suppose a struct called `Command` is defined as `Command { type; values[MAX]; int *active_value; ... }`. If {{`values` (array)}} comes before {{`active_value` (pointer)}} on the stack, there's an overflow vulnerability.
* Yet kind of subterfuge attack that's even easier than targeting a return address is targeting the {{Global Offset Table (GOT)}}. 
    * Does the GOT's layout change with compiler options and stack frames? {{No; this makes it far more stable than the stack}}.
    * Does attacking the GOT via subterfuge overflow require dealing with the stack canary? {{No; the GOT isn't on the stack}}.
    * Since the GOT is usually {{writable}}, it is very suspectible to arbitary write attacks.
* Another kind of subterfuge attack that's available in C++ targets {{virtual methods (which are like C++'s version of a Java `abstract` method)}}.
    * Each virtual object stores a "{{vtable}}" pointer as its first field, which is just a table of {{function pointers}}.
    * Vtables themselves are hard to overwrite because {{they are usually in read-only memory}}. But the {{*vtable pointer* inside the object, the one that points to the vtable itself,}} is writable.
    * Two ways to attack a vtable:
        1. Build a fake table (usually in the {{buffer}}). Then, overwrite the {{object’s vtable pointer}} to point to the fake table.
        2. Point the object's vtable pointer to a different {{existing table or offset}}. This causes program to call unintended functions.
* "Return-to-somewhere" attack: when you overwrite a return address with {{the address of an existing legitimate function}}. 
    * A good destination is {{`system()`}} because it exists in libc for every dynamically linked program., and can be used to open a shell. The challenge with this approach, though, is that the attack needs to control the {{`rdi`}} register.
    * We can locate `system()` in `libc` (when ASLR is off) by: (1) finding {{the `libc` base address}} using the `ldd` command, then (2) finding the {{offset of `system` from `libc`}} using `objdump --dynamic-syms ... | grep system`.



# Exercises
```c
void f2b(void *arg, size_t len) {
    char buffer[100];
    long val = ...; /* assume on stack */
    long *ptr = ...; /* assume on stack */
    memcpy(buff, arg, len); 
    *ptr = val; 
}
```
* Exercise: 
    * Suppose that `ptr` points to the return address of `f2b`. If `buffer` were overflowed, how could an attacker construct the input so that when `f2b` returns, it points to malicious shellcode on the stack? Answer: {{Bytes 1-100 consist of the nop sled and shellcode payload. The next 8 bytes will overwrite `val` as the return-to-stack address (so `val` will be overwritten to contain an address somewhere in the middle of the nop sled). The next 8 bytes, which are `ptr`, remain unchanged.}}
        * Hint: lowest to highest addresses, the stack contains {{`buffer` (in increasing indices as addresses increase) (100 bytes), `val` (8 bytes), `ptr` (8 bytes, points to return address), stack canary, return address for `f2b`}}
        * Does this attack involve touching the canary? Answer: {{no}}
    * What's one simple way we could prevent this attack? Answer: {{change stack memory layout so that `buffer` can't overflow to other stuff. So push `buffer` on to the stack before `ptr` and `val` so that any overflow hits the stack canary immediately. In this layout, the stack, from lowest addresses to highest addresses, would look like: `val` (8 bytes), `ptr` (8 bytes), `buffer` (100 bytes), stack canary, return address for `f2b`}}
```c
void vulnerable() {
    int *array;
    char buffer[100];
    if (!Allocate(&array))
    abort();
    gets(buffer);
    array[0] = atoi(buffer);
    ...
}
```
* Exercise: Consider the code above. Suppose a return address is located at `0x12345`, and attacker-written shelldcode is located at `0x5678`. Also suppose that there is four bytes of between `buffer` and `array` on the stack. If `buffer` were overflowed, how could an attacker construct the input so that the program points to their code? Specify if values should be bytes, hex or decimal.
    * `0x12345` should be written at {{104 bytes into `buffer`}} in the format of {{bytes}}.
    * `0x5678` should be written at {{the beginning of `buffer`}} in the format of {{decimal (base 10)}}.
    * Hint: {{we can make `array[0]` point wherever we want, because array is on the stack and can be overflowed to. Then, we can make whatever we just made `array[0]` point to equal whatever we want, because of the line  `array[0] = atoi(buffer)`}}.
![alt text](image5.png){size=medium}
* Exercise: Consider the code and struct layout above. Suppose `gets(objs[0].buffer)` is run and eventually `ptr->foo()` will be run, where `ptr == &objs[1]`. Also suppose an attacker who wants to take control of the program placed shellcode halfway through `buffer`. How could they build an input to `buffer` to redirect the program to their code? Hint: {{Build a fake vtable at the beginning of the buffer, point to it, and have the fake vtable point to shellcode}}
    * Input start: {{address of `objs[0].buffer[50]` (pointer from "fake vtable" to the shellcode)}}
    * Input + 50 bytes: {{shellcode}}
    * Input + 100 bytes: {{address of `objs[0].buffer[0]` (pointer to fake vtable)}}
```c
struct A {
    char name[100];
    long irrelevant;
    ...
    struct B* other_thing;
    ...
};
struct B {
    char name[100];
    ...
}
...
gets(a_object->name);
gets(a_object->other_thing->name);
...
```
* Exercise: Suppose the `name` field can be overflowed. Describe in detail what vulnerability is present in this code. {{If the attacker overwrites `other_thing` with their own address using `gets`, the second `gets` will write whatever they input to that address. So the attacker can basically write whatever they want, wherever they want}}.

```c
struct Student {
    char email[128];
    struct Assignment *assignments[16];
    ...
};
struct Assignment {
    char submission_file[128];
    char regrade_request[1024];
    ...
};
void SetEmail(Student *s, char *new_email) { 
    strcpy(s−>email, new_email); 
}
void AddRegradeRequest(Student *s, int index, char *request) {
    strcpy(s−>assignments[index]−>regrade_request, request);
}
void vulnerable(char *STRING1, char *STRING2) {
    SetEmail(s, STRING1); 
    AddRegradeRequest(s, 0, STRING2);
}
```
* Exercise: To write `0xAABBCCDD` to address `0x1020304050`, what should `STRING1` and `STRING2` be? Hint 1: {{`STRING1` controls what address to which you write, while `STRING2` controls what you're actually writing to that address}}. Hint 2: {{Overflow the `email` buffer so that the `Assignment` field points to a *fake* `Assignment`. Where should our *fake* Assignment be? Well, since `AddRegradeRequest` writes to the `Assignment`'s `regrade_request` field, we know we want our *fake* `Assignment`'s `regrade_request` field to line up with the target address, `0x1020304050`. That tells us the fake `Assignment`'s base address needs to be `0x1020304050` minus 128}}.
    * STRING1: {{Bytes 0 to 127 can be whatever you want. Bytes 128 to 136 should be `0x1020303FD0` in little endian}}.
    * STRING2: {{`0xAABBCCDD`}}.