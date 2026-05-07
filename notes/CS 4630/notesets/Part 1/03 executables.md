* Executables are stored differently based on if they're being used or just being stored in memory. The virtual memory layout is oriented towards and optimized for execution, while the on‑disk layout is simply optimized for storage.
    * When a program sits on disk, it’s just a static file: a sequence of bytes divided by {{section}} boundaries, like `.text` and `.data`. 
    * When the OS loads the program into virtual memory, it ignores most the section boundaries instead follows {{segment}} boundaries. 
    * The loader may also add regions that don’t exist on disk at all, like {{the stack, heap, and zero‑filled `.bss`}}. 
![alt text](image8.png){size=small}
* %%invis%%
    * The distinction between sections and segments: sections correlate to {{logical groupings of code/data}}, while segments correlate to {{what bytes to map into memory (and with what permissions)}}.
        * {{Sections}} are used by the linker. {{Segments}} are used by the loader.
        * A {{segment}} can contain many {{sections}}.
* Linux uses ELF (Executable and Linking Format).
    * The "{{header}}" describes architecture, file type, etc.
    * The "{{header table}}" describes segments to load into memory
    * The "{{section header table}}" describes sections used by the linker.
    * Examples of ELF sections:
        * {{`.text`}}: program code
        * {{`.bss`}}: initially zero data (block started by symbol)
        * {{`.data`}}: other writeable data
        * {{`.rodata`}}: read-only data
        * `.init` and `.fini`: global constructors/destructors
        * `.got` and `.plt`: related to {{dynamic linking}}
    * ELF segments are always associated with the following metadata: 
        * The {{rwx}} permissions
        * `filesz`: {{the size of the data in the segment}}
        * `memsz`: {{the size of the memory allocated for the segment}}
    * If {{`memsz` > `filesz`}}, the extra bytes are zero-filled. These bytes could serve as a cavities for viruses to put themselves inside.
    * If you want to see the section headers of an executable named `foo.exe`, run {{`objdump -x foo.exe`}}.  
* Historically, normal executables were built to be loaded at one fixed virtual address. By contrast, a "{{Position-Independent Executable}} (PIE)" is built like a shared/dynamic library: it has no fixed load address and must be relocated by the {{dynamic linker}}. Fill out the table below.
|non-PIE executables|PIE executables|
|------------------|-----------------|
|marked `EXEC_P`|marked {{`DYNAMIC`}}|
|Specify a fixed, non‑zero base address (ex. `0x400000`)|Specify a base address of {{`0`}}|
|Loaded at that fixed address by the kernel loader|The {{dynamic linker}} chooses where to load them at runtime|

* When code is initially compiled, the compiler uses symbols to represent references (to variables, external libraries, etc). "{{Linking}}" is when those names are converted to actual addresses.
    * "Symbol table": maps {{names}} to {{sections and offsets}}
    * "Relocation table": maps {{code locations}} to {{symbol name}}
    * Static linking: all symbols are resolved at {{build }}time.
    * Dynamic linking: some symbols left unresolved; the {{dynamic linker}} fills them in at {{run}}time. 
        * "Dynamic linker routine" for each external symbol: (1) Read the {{relocation table}}, (2) find the corresponding symbol in the library’s {{symbol table}}, (3) writes the resolved address into the {{GOT}}. 
        * There are two ways to schedule dynamic linking: (1) {{lazy binding}} and (2) {{non-lazy binding}}. Fill out the table below.

|strategy|when do external symbols get resolved?|when the program begins executing, what does the GOT table look like?|pros|cons|
|-----------|-----------|-----------|-----------|-----------
|Non-lazy binding|{{*all* external symbols resolved before the program begins executing}}|{{the GOT table is fully filled out (resolved) when the program begins executing}}|{{GOT can be read-only after build time}}, which is more secure|{{slower program loading}}|
|lazy binding|{{external symbols are resolved not on startup, but the first time they are called by the program while it's running}}|{{it's filled with "trampolines": each GOT entry contains a pointer to the code that will fill that entry out with the resolved address (dynamic linker routine)}}|{{faster program loading}}|{{GOT must be writeable for a longer period of time, which allows for vulnerabilities}}|

# Exercises
```text
.data
string: .asciz "Hello, World!"
.text
.globl main
main:
    movq $string, %rdi
    call puts
    ret
```
* Exercise: Consider the code above. Suppose that it is dynamically linked.
    * What would be in the symbol table, and which entries would be undefined? {{`main` (defined), `string` (defined), `puts` (undefined)}}
    * What would be in the relocation table? {{`string`, `puts`}}
```
Disassembly of section .text:
...
00000000004016c3 <main>:
4016c3: mov $0x4016b5,%rdi
4016ca: call 40c0b0 <_IO_puts>
4016cf: ret
...
```
* Exercise: Based on the disassembly above, what can we say about the way the executable was compiled? Answer: {{It was compiled statically with no PIE}}