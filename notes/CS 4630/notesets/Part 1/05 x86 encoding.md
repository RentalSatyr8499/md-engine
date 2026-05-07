This image won't make sense until you read through the notes, but it will be useful to reference throughout the notes. 
![alt text](image10.png){size=medium}

Let's go through the steps to encode x86 assembly (ex. `add %bl, %cl`) into machine-readable hex (ex. `02 CB`).
1. Determine the opcode using the {{Intel manual}}.
    * In the Intel manual, you'll find three different kinds of operands:
        * `r8`, `r16`, `r32`, `r64`: "{{register}}" operand
        * `r/m8`, `r/m16`, `r/m32`, `r/m64`: "{{register or memory}}" operand
        * `imm8`, `imm32`: "{{immediate}}" operand
    * If a `/r`, `/0`, `/1`, etc. comes at the end of the opcode, that means {{the encoding requires one additional byte of info, called the `ModRM` byte}}.
        * If it's `/r`, {{the register operand goes into the `reg` field}}.
        * If it's `/3`, {{a `0x03` goes into the `reg` field}}. Same goes for any `/` followed by a digit.
2. If needed, determine the `ModRM` byte by using the {{`ModRM` table}}.
    * The first two bits are {{`mod` (the addressing "mod"e)}}.
        * If there's a displacement, and it fits in {{8 bits}}, use `mod = 01`.
        * If there's a displacement, and it does not fit in {{8 bits}}, use `mod = 10`.
    * The next three bits are {{the register operand, `reg`}}.
    * The last three are {{the register-memory operand, also called `r/m`}}. 
    * In the ModRM table, `[--][--]` means: {{`ModRM.r/m` does not contain a real register; look at SIB or displacement for the actual addressing}}.
3. If needed, determine the SIB byte using the {{SIB table}}.
    * The SIB byte only appears in the following bit mode(s): {{32-bit and 64-bit}}.
    * Inspect the ModRM table. If the following is true, then you need the SIB byte: {{`r/m` == `100` and `mod` != `11`}}. (If you're forced to emit an SIB byte but your instruction doesn't need any scaling/index/base calculations, just use the default SIB byte, `0x25`).
    * Recall that effective addresses are calculated using the formula `a(b, c, d)` where `a` is the {{displacement}}, `b` is the {{base}}, `c` is the {{index}}, and `d` is the {{scale}}.
        * The first two bits of the SIB byte are the {{scale}}. `00` = {{1}}, `01` = {{2}}, `10` = {{4}}, `11` = {{8}}.
        * The next three bits of the SIB byte are the {{index}}. 
        * The last three are the {{base}}.
4. If needed, write the displacement byte. 
    * Inspect the ModRM table. If the following is true, you need the displacement byte: {{`ModRM.mod == 01` or `ModRM.mod == 10` or `(ModRM.mod == 00 && ModRM.r/m == 101)`}}.    
    * If the following is true, the displacement byte is 8 bits: {{`ModRM.mod == 01`}}
    * If the following is true, the displacement byte is 32 bits: {{`ModRM.mod == 10` or (`ModRM.mod == 00` and `SIB.base == 101`)}}
5. If needed, write the immediate byte. Don't forget to convert it to {{little endian}}.
6. If needed, determine the REX prefix byte. It goes at the beginning, before the opcode. 
    * You need a REX prefix if and only if ANY of the following are true:
        * You use registers `SPL`, `BPL`, `SIL`, or `DIL`
        * You use registers {{`r8`-`r15`}}. `r10`, for example, requires a `ModRM.reg` field of {{$`1010`_{b}$}}.
        * You're doing an operation on a value that is too large to be expressed in 32 bits
        * Any of the ModRM or SIB fields need to hold values that exceed their maximum capacity. For example, if `ModRM.reg` ≥ {{8}}.
    * The REX prefix byte always follows this form: `0100 w r x b`. So the only thing that changes are the last 4 bits.
        * `w` bit: `1` if {{operands are in 64 bits}}, `0` if {{operands are in 32 bits}}. (If an instructions ends in `q`, its operands are in {{64}} bits).
        * `r` bit: extra high bit of {{`ModRM.reg`}}
        * `x` bit: extra high bit of {{`SIB.index`}}
        * `b` bit: extra high bit of {{`ModRM.r/m` or `SIB.base`}}
* In addition to REX, x86‑64 instructions might have several other optional prefixes that tweak behavior in specific ways. For example, the `LOCK` prefix makes the instruction atomic. These prefixes always appear before the {{REX prefix and opcode}}.
* Some stuff is illegal in x86-64.
    * You cannot use a displacement larger than {{32}} bits in any memory‑addressing mode.
    * You can only use {{32}}-bit immediates (with the exception of `movabs`, which allows a 64-bit immediate).
    * You cannot perform 32‑bit `push` or `pop` operations in {{64‑bit mode}}.
    * You cannot use the following registers as your `SIB.index`: {{`%rsp`, `%r12`}}. This is because `100` is already reserved to mean "{{no index}}".
* Two ways of encoding addresses in x86-64 assembly:
|method|example|what does it involve?|is it position-independent?|
|------|-------|---------------------|---------------------------|
|absolute addressing|`movq label, %al` → `8a 04 25`|{{Addresses are hard-coded directly in the instruction}}|{{`N`}}|
|RIP-relative addressing|`mov label(%rip), %al` → `8a 05`|{{Encodes the difference between RIP and the target}}|{{`Y`}}|



# Exercises
![alt text](image11.png){size=small}
* Exercise: Consider the Intel manual snippet above. Using the ModRM table for reference, encode `btsl $7, 4(%rax)`. Answer: {{`0b ba 68 04 07`}}
* Exercise: Some instructions encode the register into the opcode, which allows for a minimized one-byte encoding. For example, `pushq %rax` is encoded as `50`: `01010` (5-bit opcode) `000` (3-bit `r/m` field). If that is the case, what would `pushq %r13` be encoded as? Hint: {{you need to add the REX prefix bit for this one}}. Answer: {{`41 55`}} 
* Exercise: Consider the instruction, `add %eax, %ecx` (Intel: `ADD ecx, eax`). This instruction requires a ModRM byte. If its x86 encoding is `01 c1`, what is the encoding for...
    * `add %eax, %r10d` (Intel: `ADD r10d, eax`)? {{`41 01 c2`}}
    * `add %rax, %rcx` (Intel: `ADD rcx, rax`)? {{`48 01 c1`}}
![alt text](image12.png){size=small}
* Exercise: Consider the intel manual snippet above. 
    * Encode `addl 0x12345678(%rax,%rbx,2), %ecx`. Hint: {{the `ModRM.reg` field is `ecx`, and the `ModRM.r/m` field is `[--][--]`. Don't forget the orders swap in AT&T.}} Answer: {{`03 8c 58 78 56 34 12`}} 
    * Encode `addq 0x12345678(%r10,%r11,2), %rax`. Answer: {{`4b 03 84 5a 78 56 34 12`}}
* Exercise: The Intel manual says that `MOV r64, r/m64` has opcode: `8B /r`. The FS override prefix is `64`. Encode `movq %fs:0x10,%r13`. Answer: {{`64 4c 8b 2c 25 10 00 00 00`}} 
* Exercise: Suppose you’re injecting ‘evil’ code at unpredictable/changing addresses. Which situations are easier to encode using absolute addressing, and which are easier using RIP‑relative addressing?
    * Jump from evil code to a function at fixed location in executable: {{`absolute`}} 
    * Jump inside a loop within the evil code: {{`relative`}}
    * Jump to a string in the evil code: {{`relative`}}
    * Jump to a string in the executable: {{`absolute`}}
