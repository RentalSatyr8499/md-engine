```c
Foo *the_foo;
the_foo = new Foo;
...
delete the_foo;
...
something_else = new Bar(...);
the_foo->something();
```
* Use-after-free bug: once memory is freed, the allocator is free to reuse that exact region for something else - in this case, it will likely put {{the new `Bar` object, (eg `something_else`)}} there. So when the program later calls `the_foo->something()`, it is not calling {{a method on a `Foo`}} anymore, even though it still thinks it is.
* Sometimes, {{heaps keep track of free blocks in a FIFO linked list}}, making it easy to predict where things will be allocated next. But more commonly, allocators place things on the heap in ways that are hard to predict precisely. In order to work around this, attackers take advantage of the fact that allocators like reusing {{'perfectly sized'}} space. They then fire the pattern many times, hoping that at least one attempt will align on the heap correctly:
    1. Trigger many {{"bogus" frees}}
    2. Allocate many objects of the exact {{size}} needed to occupy the freed slot.
    3. Trigger use-after-free
* UAF exploits are powerful. Depending on the circumstances, they could allow you to do various things.
    * Information leak: if a pointer in A overlaps with data in B, we can leak A's pointer value by {{printing B's value}}.
    * Arbitrary read and write: if a pointer in A overlaps with data in B, we can (1) modify {{the value in B}} and then (2) trigger program to read from or write to {{A's pointer}}.
    * Code execution: if a VTable pointer in A overlaps with data in B, we can modify {{the value in B}} and then call {{a function pointed to in A's VTable}}.
* In addition to the UaF bug itself, successful exploitation usually requires two supporting weaknesses: (1) a way to {{corrupt memory}} (to inject attacker‑controlled state) and (1) an {{information leak}} (to know where to redirect control flow). This is why JavaScript engines are especially exposed: {{type}} confusion among typed arrays, strings, and objects can {{leak pointers}}.

# Exercises
```c
struct Cart {
  int date;
  int num_items;
  ...
};

struct String {
  char *buffer;
  size_t size;
};
```
* Exercise: Consider the code above. If `Cart date = 591751049 (0x23456789)` and `num_items = 4`, what is `buffer`'s address? {{`0x4234567894`}}

```c
struct String {
    size_t alloc_size;
    size_t used_size;
    char *data;
    bool is_utf8;
};
struct FileInfo {
    const char *name;
    time_t creation_time;
    time_t modification_time;
    FILE *file_data;
}
```
* Exercise: Consider the code above. If we have a `String` + `FileInfo` in same place from use-after-free, what sequence of `String` and `FileInfo` operations would modify memory at `0x12345678`? {{Modify `FileInfo.name` to equal `0x12345678`, then use a `String` write (eg, write to "data") to write to `*data`}}

```c
struct String {
  char *buffer;
  size_t size;
};
class PNGImage : public Image {
  ...
public:
  Pixel getPixel(int x, int y, int z);
  virtual Pixel getPixel(int x, int y, int z);
};
```
* Exercise: Consider the code above. 
    * Suppose a UAF occurs where a `PNGImage` object is stored where a `String` once was. Suppose `buffer` is revealed to start with `XFGz\0\1\0\1\0\0` (`0x58`, `0x46`, `0x47`, `0x7a`, `0x0`, ...). Suppose we also discover the following information **via `objdump`**:
        * `PNGImage::getPixel` located at `0x14658`
        * `PNGImage` vtable located at `0x13658`
        * `strlen` GOT pointer located at `0x12444`
    * What is the address of the `strlen` GOT pointer? 
        * Hint: {{Decoding from little endian, buffer's value tells us `getPixel()` is located at `0x7a474658` in virtual memory. To find the executable's base address in memory, we can subtract `getPixel()`'s location as revealed in objdump. Then we can just add the offset of `strlen` GOT pointer to the executable's base address.}}
        * Answer: {{`0x7a474658` - `0x14658` + `0x12444` = `0x7a472444`}}