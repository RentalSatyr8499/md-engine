* Define:
    * "Latency" of system: {{the number of cycles it takes for an instruction to get from the beginning of the pipeline to the end of the pipeline}}.
    * "Throughput" of a system: {{how many instructions the pipeline completes per cycle (or per second)}}.
    * Pipelining: {{dividing a system into stages and running multiple stages for different tasks at the same time}}
    * Does pipelining improve latency? {{`N`}}
    * Does pipielining improve throughput? {{`Y`}}
    * Dependency of instruction X on instruction Y: {{instruction X needs a value produced by instruction Y}}.
    * Pipeline hazard: {{when a dependency conflicts with the pipeline’s timing, meaning the pipeline would read the wrong value unless extra work is done}}.
    * Are all dependencies are hazards? {{No. Some dependencies are naturally satisfied by the pipeline timing; others require forwarding; others require stalling; others require speculation or flushing}}.
    * Are all hazards dependencies? {{Yes}}. 
![alt text](image13.png){size=medium}
* Consider the simple CPU above. It can be divided into five stages for pipelining. What are they (in chronological order)?
    1. F: {{Fetch instruction (I$, + instr len)}}
    2. D: {{Decode the instruction (and determine if it is dependent on any other instructions) (read)}}
    3. E: {{Execute. Compute value or effective address (math)}}
    4. M: {{Memory. If needed, access data cache and read the actual value (D$)}}
    5. W: {{Write loaded value into destination (write)}}
* Pipeline registers store {{the data needed by the next stage}}. So for a 5‑stage pipeline, you need {{4}} pipeline registers.
* Will splitting an operation always optimize it? Why or why not? Answer: {{No. There is register overhead associated with transferring data from one stage to the other. At some point there is diminishing return on splitting the operation}}.
* Pipeline hazards arise when dependencies aren't naturally resolved by pipeline timing. We learned about two kinds of hazards:
    * "{{Data}} hazard": when an instruction depends on a previous instruction (ex. `addq %r8, addq %r9, %r8`), the first instruction must make it to the {{writeback}} stage before the second instruction does the {{decode}} stage. Otherwise, {{the second instruction will perform its calculation on the stale (incorrect) value}}. There are two (good) solutions to data hazards:
        1. "Stalls": {{hardware-inserted nops which allow us to wait until the dependent instruction is finished executing before feeding the next one into the pipeline}}.
        2. "Forwarding": {{forwarding the result of a calculation directly to the next execution, avoiding the need to wait for register writeback}}. 
    * "Control hazard": the processor needs to know if a `jmp` will be taken or not in order to know what to feed into the pipeline next. But that often requires waiting for {{the `jmp` itself to finish walking through the pipeline first}}. There are two solutions to this: 
        1. Stalling until {{the `jmp` is calculated}}
        2. Guessing which branch will be taken. If the guess is wrong, we {{squash whatever instructions preemptively made it from that branch into the pipeline}}.
```
movq 0(%rax), %rbx
subq %rbx, %rcx
```
* An important thing to remember about forwarding is that forwarding alone doesn't always solve the problem. Consider again the five-stage pipeline, Fetch/Decode/Execute/Memory/Writeback, and the code above.
    * Forwarding alone won't work if the value for a later instruction is needed before {{it has been fully computed in an earlier instruction}}. In the example above, by the time `movq` begins {{loading data into `%rbx`}}, {{`subq`}} already needs that value.
    * We can solve this by combining forwarding with stalling: force the {{decode}} stage of {{`subq`}} to last one extra cycle so that `movq` has time to {{compute and forward the correct value to `subq`}}.
* Does dividing the pipeline into more stages lead to more or less hazards? Answer: {{more}}


# Exercises
![alt text](image14.png){size=medium}
* Exercise: Consider the pipeline above. Suppose the cycle time is 500 ps.
    * What is the latency of one instruction? Answer: {{2500 ps}}
    * What is the overall throughput, in instructions per 500 ps? Answer: {{1 instruction per 500 ps}}
* Exercise: Consider 10-stage pipeline with a 250-ps cycle time. What is the throughput? Answer: {{1 instruction per 250 ps}}
![alt text](image17.png){size=medium}
* Exercise: Consider the above code and its pipeline schema. Fill in each of the below blanks with one of the following: "not forwarded from", "forwarded from the Execute stage of", "forwarded from the Memory stage of",  "forwarded from the Writeback stage of".
    * In `subq`, `%r8` is "{{not forwarded from}}" `addq`.
    * In `xorq`, `%r9` "{{forwarded from the Memory stage of}}" `addq`.
    * In `andq`, `%r9` "{{not forwarded from}}" from `addq`.
    * In `andq`, `%r9` "{{forwarded from the Execute stage of}}" from `xorq`.
```text
addq %rax, %rbx     ; 1
subq %rax, %rcx     ; 2
movq $100, %rcx     ; 3
addq %rcx, %r10     ; 4
addq %rbx, %r10     ; 5
```
* Exercise: Consider the code above. Suppose it's fed through a five-stage pipeline.
    * Identify all the dependencies (name which instruction depends on which, and what register). Answer: {{5 depends on 1's `%rbx`, 4 depends on 3's `%rcx`, 5 depends 4's load to `%r10`}}
    * Which of those dependencies are hazards? Answer: {{4 depends on 3's `%rcx`, 5 depends 4's load to `%r10`}} 
```text
addq	%rcx, %r9       ; 1
addq	%r9, %rbx       ; 2
addq	%rax, %r9       ; 3
movq	%r9, 8(%rbx)    ; 4
movq	%rcx, %r9       ; 5
```
* Consider the code above. Suppose we have a six-stage pipeline (instead of five): Fetch, Decode, Execute 1, Execute 2, Memory, Writeback. The result is only available near the end of the execute stage. 
    * Before answering the questions below, it will help you the most to draw out the cycle F/D/E1/E2/M/W diagram. [answer](https://imgur.com/a/MFgH1ow)
    * Three stalls occur. What are they (in chronological order), and why? 
        1. {{2}} stalls because {{it needs `%r9`'s value from 1}}
        2. {{3}} stalls because {{2 stalled (two instructions cannot be in the decode stage at the same time)}}
        3. {{4}} stalls because {{it needs `%r9`'s value from 3 and `rbx`'s value from 2}}
    * With stalling, four forwards still occur. In chronological order: 
        1. {{`%r9`}}'s value is forwarded from {{1}}'s {{second execution}} stage to {{2}}'s {{decode}} stage
        2. {{`%r9`}}'s value is forwarded from {{1}}'s {{memory}} stage to {{3}}'s {{decode}} stage
        3. {{`%rbx`}}'s value is forwarded from {{2}}'s {{second execution}} stage to {{4}}'s {{decode}} stage
        4. {{`%r9`}}'s value is forwarded from {{3}}'s {{second execution}} stage to {{4}}'s {{first execution}} stage

