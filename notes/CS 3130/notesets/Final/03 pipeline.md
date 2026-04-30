* Define:
    * "Latency" of system: 
    * "Throughput" of a system: 
    * Pipelining: 
    * Does pipelining improve latency?
    * Does pipielining improve throughput? 
    * Dependency of instruction X on instruction Y: instruction X needs a value produced by instruction Y.
    * Pipline hazard is when that dependency conflicts with the pipeline’s timing, meaning the pipeline would read the wrong value unless extra work is done.
    * Are all dependencies are hazards? No. Some dependencies are naturally satisfied by the pipeline timing; others require forwarding; others require stalling; others require speculation or flushing.
    * Are all hazards dependencies? Yes. 
![alt text](image13.png){size=small}
* This simple CPU can be divided into five stages for pipelining. What are they (in chronological order)?
    1. F: {{Fetch instruction (I$, + instr len)}}
    2. D: {{Decode the instruction (and determine if it is dependent on any other instructions) (read)}}
    3. E: {{(Execute) compute value or effective address (math)}}
    4. M: {{(Memory) if needed, access data cache and read the actual value (D$)}}
    5. W: {{Write loaded value into destination (write)}}
* Pipeline registers store {{the data needed by the next stage}}. So for a 5‑stage pipeline, you need {{4}} pipeline registers.
    * Will splitting an operation always optimize it? Answer: {{No.}}
    * Explain why. Answer: {{There is register overhead associated with transferring data from one stage to the other. At some point there is diminishing return on splitting the operation}}.
* Pipeline hazards arise when dependencies aren't naturally resolved by pipeline timing. We learned about two kinds of hazards:
    * "Data hazard": when an instruction depends on a previous instruction (ex. `addq %r8, addq %r9, %r8`), the first instruction must make it to the writeback stage before the second instruction does the decode stage. Otherwise, the second instruction will perform its calculation on the stale (incorrect) value. There are two (good) solutions to data hazards:
        1. Hardware-inserted nops, also called "stalls", wait until the dependent instruciton is finished executing before feeding the next one into the pipeline.
        2. Forwarding involves forwarding the result of a calculation directly to the next execution, avoiding the need to wait for register writeback. 
    * "Control hazard": when it comes to `jmp` instructions, the processor needs to know if the jump will be taken or not in order to know what instructions to feed into the pipeline next. But that requires waiting for the `jmp` itself to finish walking through the pipeline first. There are two solutions to this: 
        1. Stalling until the jmp is calculated
        2. Guessing which branch will be taken. If the guess is wrong, we squash whatever instructions preemptively made it from that branch into the pipeline.
```
movq 0(%rax), %rbx
subq %rbx, %rcx
```
* An important thing to remember about forwarding is that forwarding alone doesn't always solve the problem. Consider again the five-stage pipeline, Fetch/Decode/Execute/Memory/Writeback, and the code above.
    * Forwarding alone won't work if the value for a later instruction is needed before {{it has been fully computed in an earlier instruction}}. In the example above, by the time `movq` begins {{loading data into `%rbx`}}, {{`subq`}} already needs that value.
    * We can solve this by combining forwarding with stalling: force the {{decode}} stage of {{`subq`}} to last one extra cycle so that `movq` has time to {{compute and forward the correct value to `subq`}}.
* If you change the number of stages, the number of hazards changes. Specifically, with {{more}} stages come more hazards.
* Stalling an instruction due to a hazard will also stall all subsequent instructions, because {{a pipeline stage can only handle one instruction at a time}}.


# Exercises
![alt text](image14.png){size=small}
* Exercise: Consider the pipeline above. Suppose the cycle time is 500 ps.
    * What is the latency of one instruction? Answer: {{2500 ps}}
    * What is the overall throughput, with units? Answer: {{1 instruction per 500 ps}}
![alt text](image15.png){size=small}
* Exercise: Consider the pipeline above. Note that it has double the number of pipeline stages (10 instead of 5). Suppose the cycle time is 250 ps. What is the throughput? Answer: {{1 instruction per 250 ps}}
![alt text](image.png){size=medium}
* Exercise: Consider the situation above. 
    * There's a {{data}} hazard because the second instruction reads the {{stale `%r8` value}} before the {{first instruction}} has a chance to {{write back its result (`1700`) to `%r8`}}.
    * In addition to nops, there is an additional opportunity to mitigate this data hazard: {{forwarding}}. On a hardware level, implementing this would involve forwarding the {{result of the math stage}} to the {{pipeline register between the read stage and the math stage}}.
![alt text](image.png){size=small}
* Exercise: Consider the above code and its pipeline schema (Fetch, Decode, Execute, Memory, Writeback). Also consider the possible blank answers below. Then fill in the blanks beneath that. 
    * Possible blank answers: 
        * "not forwarded from"
        * "forwarded from the Execute stage of"
        * "forwarded from the Memory stage of"
        * "forwarded from the Writeback stage of"
    * In subq, %r8 is {{not forwarded from}} addq.
    * In xorq, %r9 {{forwarded from the Memory stage of}} addq.
    * In andq, %r9 {{not forwarded from}} from addq.
    * In andq, %r9 {{forwarded from the Execute stage of}} from xorq.
```
addq %rax, %rbx     ; 1
subq %rax, %rcx     ; 2
movq $100, %rcx     ; 3
addq %rcx, %r10     ; 4
addq %rbx, %r10     ; 5
```
* Exercise: Consider the code above. 
    * Identify all the dependencies (name the two instructions and register involved in the dependency). Answer: {{instruction 5 depends on instruction 1's load to `%rbx`, instruction 4 depends on instruction 3's load to `%rcx`, instruction 5 depends on instruction 4's load to `%r10`}}
    * Which of those dependencies are hazards? Answer: {{the latter two: instruction 4 depends on instruction 3's load to `%rcx`, instruction 5 depends on instruction 4's load to `%r10`}} 
```
addq	%rcx, %r9	    ; 1
addq	%r9, %rbx	    ; 2
addq	%rax, %r9	    ; 3
movq	%r9, 8(%rbx)	; 4
movq	%rcx, %r9	    ; 5
```
* Consider the code above. Suppose we have a six-stage pipeline (instead of five): Fetch/Decode/Execute 1/Execute 2/Memory/Writeback. The result is only available near the end of the execute stage. 
    * Before answering the questions below, it will help you the most to draw out the cycle F/D/E1/E2/M/W diagram. [anwer](https://imgur.com/a/MFgH1ow)
    * Three stalls occur. What are they (in chronological order), and why? 
        1. 2 stalls because it needs %r9's value from 1
        2. 3 stalls because 2 stalled (two instructions cannot be in the decode stage at the same time)
        3. 4 stalls because it needs %r9's value from 2
    * With stalling, four forwards still occur. In chronological order: 
        1. {{`%r9`}}'s value is forwarded from {{1}}'s {{second execution}} stage to {{2}}'s {{decode}} stage
        2. {{`%r9`}}'s value is forwarded from {{1}}'s {{memory}} stage to {{3}}'s {{decode}} stage
        3. {{`%rbx`}}'s value is forwarded from {{2}}'s {{second execution}} stage to {{4}}'s {{decode}} stage
        4. {{`%r9`}}'s value is forwarded from {{3}}'s {{second execution}} stage to {{4}}'s {{first execution}} stage

