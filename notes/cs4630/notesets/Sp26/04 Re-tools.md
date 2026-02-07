* To get basic file information about a target executable, run {{`file`}}.

```
$ file mystery
mystery: ELF 64-bit LSB pie executable, x86-64,
version 1 (SYSV), dynamically linked,
interpreter /lib64/ld-linux-x86-64.so.2,
BuildID[sha1]=9819a3cfb39d01ad2a376c54318f104139422a8f,
for GNU/Linux 3.2.0, stripped
```
* We can interpret the output as the following...
    * `LSB`: {{little endian}}
    * `pie`: {{position-independent executable}}
    * `interpreter...`: {{program that loads this exe}}
    * `file` works by looking for {{"magic numbers"}} in {{the 16-byte ELF header at the beginning of the executable}}. 
* To search for strings in the bytes of an executable, we can use `strings`.
    * If the target is `mystery`, for example, use {{`strings mystery`}}.
    * If you only want to find strings that are at least 40 bytes long, use {{`strings --bytes=40 mystery`}}.
* Come up with commands to do the following: 
    * Find the libraries used by the executable `mystery`. {{`objdump --all-headers mystery`}}
    * Find the calls to the libraries used by the executable `mystery`. {{`objdump --dynamic-syms mystery`}}
    * Find library call uses in the executable `mystery`. {{`objdump –disassemble –dyanmic-reloc mystery`}}
* A big problem when using `disassembly` to reverse-engineer executables is that it {{mis-disassembles data as instructions, producing garbage output (especially when symbols are stripped)}}. For this reason, we often use tools like {{Ghidra}} instead of `disassembly`. For example,...

```
struct DeviceTypeFuncs {
    void (*Send)(struct DeviceInfo*, char*);
    void (*Recv)(struct DeviceInfo*, char*, size_t);
};

void SendToDevice(struct DeviceInfo* info, char* data) {
    (info->funcs->Send)(data);
}

```
This would be tricky to reverse engineer because when compiled to assembly, no call to a particular symbol will appear in this code. This is because {{you have to load a pointer from a struct, then load another pointer from a nested struct, then do an indirect call through that pointer. So the address being called will likely be calculated in a register (`mov rax, [rdi + offset] \n call *rax`) instead of being named a symbol (`call Send`)}}.

* Ghidra's method of reverse engineering is superior to that of `disassembly` because it uses a technique called {{cross-referencing (`XREF`)}}.
    * Other times when reverse engineering is hard include: {{function pointers}}, {{jump tables}}, {{call targets are computed}}, {{data and instructions are mixed}}, {{symbols are stripped}}
# left off on 31