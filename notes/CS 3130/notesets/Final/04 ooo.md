* In "out-of-order" optimization, the CPU finds {{later instructions to do}} instead of stalling. To prevent hazards, this requires keeping track of {{multiple versions of each register}}. 
    * {{Architectural}} registers are renamed to {{physical}} registers before being feed into the OOO pipeline. 
        * "{{Architectural}}" register: registers that come from the language (think of architecture as being abstract, like how a design is abstract). Ex. `%rax`, `%rbx`
        * "{{Physical}}" register: registers that come from the hardware. Ex. `%p7`, `%p8`
        * There are many more {{physical}} registers then there are {{architectural}} registers.
    * Under the OOO system, more stages are added to the pipeline to handle register versioning. There are 7. In order, they are: {{**F**etch}}, {{**D**ecode}}, {{**R**ename}}, {{**I**ssue}}, {{**E**xecute}}, {{**W**rite}}, {{**C**ommit}}. Briefly describe the new stages introduced by the OOO pipeline:
        * Rename: Assigns {{architectural}} registers fresh {{physical}} registers and manages the {{rename table}}.
        * Issue: Selects instructions from the {{instruction queue}} that {{have operands that are ready}}.
        * Commit: Finalizes instructions in so that {{they follow program order}}, and does other cleanup.
* The Rename stage of the OOO pipeline keeps track of two data structures:
    1. A table that maps {{architectural}} registers to {{the most up-to-date physical}} registers. The most up-to-date version is the version that was {{committed}} the latest.
    2. A list of physical registers that are {{currently free (not assigned to any architectural registers)}}.
* The Issue stage of the OOO pipeline keeps track of two data structures:
    1. The "instruction queue" stores instructions and which physical register they will return their result to. All registers in the instruction queue are physical registers.
    2. The "scoreboard", which tracks if physical registers are...
        * "ready", meaning their value has been computed, or 
        * "pending", meaning they are waiting for a producing instruction.
* The Execution stage of the pipeline can either be itself pipelined or unpipelined. 
    * Pipelined execution: the execution stage is divided into multiple sub-stages, meaning the instruction stays in E for multiple stages.
    * If the execution requires multiple operations that need to be done in series, it will be {{pipelined}}. If it's simply one operation, it will be {{unpipelined}}.
* Some instructions implicitly read or write registers. For example, `popq %rax` implicitly reads and writes {{`%rsp`}}. In this situation, the CPU could translate the instruction into one with explicit operands. For example, `popq %rax` would be translated to {{`movq (%rsp), %rax; addq $8, %rsp`}}.
* Challenges that OOO can face: 
    * If everything depends on a single long-latency instruction, the OOO engine stalls
    * Overhead associated with tracking all the uncommitted instructions
    * If branches are mispredicted, the cost is steeper than if branches are mispredicted on a non-OOO pipeline

# Exercises
![alt text](image19.png){size=medium}
* Consider the normal (non-ooo) pipeline above. 
    * At cycle #4, the second `addq` instruction is in the {{decode}} stage. There are two forwarded versions of {{`%r8`}} it needs to choose between. 
    * When presented with such a decision, it will always choose the version that {{is in the earliest stage}}. So it chooses {{`movq`}}'s version of `%r8`.
![alt text](image20.png)
* Consider the ooo pipeline above. If this pipeline were to follow the rule, "forward the version in its earliest stage", where would a read-after-write hazard occur? {{Cycle 6. The correct latest value is the one from `movq`, but the one from the first `addq` ends up getting forwarded instead because that instruction was delayed}}
![alt text](image21.png){size=medium}
* Consider the ooo pipeline above. Suppose this pipeline were to follow the rule, "forward the version in its earliest stage". 
    * How many writer-after-write hazards are there in this scenario? {{three}}
    * Where would the earliest write-after-write hazard occur? {{Cycle 7. The correct latest value is the one from instruction #3, but the one from instruction #1 ends up getting forwarded instead because that instruction was delayed}}
![alt text](image22.png){size=medium}
* Consider the instructions and register renaming state above. Answer the questions below, updating the register rename state along the way (assume the instructions are renamed one after the other).
    * Consider `add %r10, %r8`.
        * What is it renamed to? {{`add %x19, %x13`}}
        * What physical register will it produce `%r8` to? {{`%x18`}}.
    * Consider `add %r11, %r8`.
        * What is it renamed to? {{`add %x07, %x18`}}
        * What physical register will it produce `%r8` to? {{`%x20`}}.
    * Consider `add %r12, %r8`.
        * What is it renamed to? {{`add %x05, %x20`}}
        * What physical register will it produce `%r8` to? {{`%x21`}}.
    * After these three instructions have been renamed,...
        * What register is at the top of the free reg list? {{`%x23`}}
        * What physical register does %r8 map to? {{`%x21`}}
```
movq %r8, (%rax)        ; instruction 1
movq 8(%r11), %r11      ; instruction 2
```
* Consider the instructions above. Suppose `%rax` stores value A and `%r11` stores value B, where `B + 0x8 = A`. Suppose these instructions are fed through an OOO pipeline with no memory hazard mitigations.
    * Explain what hazard is present here. {{This is a memory hazard, because instruction 2 might read from memory address `8(%r11)` (ie, `B + 0x8`) before instruuction 1 has a chance to write to it, resulting in operations that don't follow program order}}.
    * There are two ways to mitigate this kind of hazard: (1) forcing all load and store instructions to {{be run in order}}, or (2) implementing a system that compares {{all load and store addresses}}.
![alt text](image23.png)
* Consider the register rename state and assembly instructions above. Rename each of the instructions. [Answer](https://imgur.com/a/thGyl6W).
![alt text](image24.png)
* Consider the instruction issuer state above. Suppose there are two ALUs, both of which take 1 cycle to execute an instruction. At what cycle will each instruction be executed, and by who? [Answer](https://imgur.com/a/EMCY2I6).
[Answer](https://imgur.com/a/thGyl6W).
![alt text](image25.png){size=large}
* Consider the instruction issuer state and execution unit above. At what cycle will each instruction be executed, and by who? [Answer](https://imgur.com/a/UpxjSoH).
