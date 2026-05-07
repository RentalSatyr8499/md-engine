* Write commands to...
    * Get basic file information about `foo.exe` (like whether it's stripped): {{`file foo.exe`}}. This command works by looking for "magic numbers" in {{the 16-byte ELF header at the beginning of the executable}}. 
    * Search for strings in the `foo.exe`'s binary: {{`strings foo.exe`}}
    * Find strings that are at least 40 bytes long in `foo.exe`'s binary: {{`strings --bytes=40 foo.exe`}}.
    * Find the {{libraries}} used by the executable `mystery.exe`: `objdump --all-headers mystery.exe`
    * Find the {{calls to the libraries}} used by the executable `mystery.exe`: `objdump --dynamic-syms mystery.exe`
    * Find {{library call uses}} in the executable `mystery.exe`: `objdump –disassemble –dyanmic-reloc mystery.exe`
* Ghidra is better at reverse engineering than `objdump.` This is because it uses {{cross-referencing (`XREF`)}}. It decompiles by translating machine code into an intermediate representation called PCode, which is then converted to C.
* GDB and LLDB are useful command-line debuggers. Write commands to do each of the following **in gdb**. 
    * Stop the program when the global integer stored at `0x60104c` changes: {{`watch *0x60104c`}}
    * Stop the program when a system call to open a file is invoked: {{`catch syscall open`}}
    * Stop the program when any system call is invoked: {{`catch syscall`}}
    * Search for the string "foo" in memory range `0x400000`-`0x410000`: {{`find 0x400000, 0x410000, "foo"`}}
    * Save a snapshot of the program’s entire memory to a file called `foo-core`: {{`generate-core-file foo-core`}}
    * Dump memory range `0x600000`–`0x601000` to a file named `dump.bin`: {{`dump memory dump.bin 0x600000 0x601000`}}
    * Write a file named `dump.bin` to program memory starting at address `0x600000`: {{`restore dump.bin binary 0x600000`}}
    * Force program counter to skip ahead to address `0x401200`: {{`jump *0x401200`}}
    * Force current function to return the value `0` immediately: {{`return 0`}}
* Ghidra also has a debugger feature. Ghidra's debugger lazily disassembles memory during debugging, meaning {{a majority of code remains disassembled except for a small portion of the code that comes after the program counter}}.
    
# Exercises

```text
$ file mystery
mystery: ELF 64-bit LSB pie executable, x86-64,
version 1 (SYSV), dynamically linked,
interpreter /lib64/ld-linux-x86-64.so.2,
BuildID[sha1]=9819a3cfb39d01ad2a376c54318f104139422a8f,
for GNU/Linux 3.2.0, stripped
```
* Consider the output from `file mystery` below. 
    * Is it big-endian or little-endian? {{little endian; LSB = "least significant byte first"}}
    * Is this file compatible with ASLR? {{yes, because it's PIE}}
    * To load an executable, the OS calls an interpreter's code. Where is the interpreter for this program located? {{`/lib64/ld-linux-x86-64.so.2`}}

```c
struct DeviceTypeFuncs {
    void (*Send)(struct DeviceInfo*, char*);
    void (*Recv)(struct DeviceInfo*, char*, size_t);
};

void SendToDevice(struct DeviceInfo* info, char* data) {
    (info->funcs->Send)(data);
}

```
* Exercise: Consider the code above. Explain briefly why the assembly for this code would be tricky to reverse engineer. {{When compiled to assembly, no call to a particular symbol will appear in this code. You do an indirect function call through struct's pointer, so the address being called will likely be calculated in a register instead of being named a symbol}}.