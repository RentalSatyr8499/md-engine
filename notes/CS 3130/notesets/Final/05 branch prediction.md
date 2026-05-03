* Good branch prediction matters because {{modern out‑of‑order CPUs fetch and speculatively execute instructions before knowing whether a branch is taken}}. A misprediction wastes {{cycles (time)}}.
* "Static" prediction: follows a simple rule where {{backwards}} jumps are taken and {{forward}} jumps are not. 
    * Backward branches usually mean {{loops}}, which is why the predict is taken.
    * Forward branches usually mean {{conditionals}}, which is why the predict is not taken.
* "{{1-bit}}" predictor: for each branch, this strategy remembers whether it was taken last time, and predicts the same for the next time.
    * Predictions (or last results) are typically stored in {{a table indexed by hashed address bits}}. So given the memory address of a `jmp` instruction, to store the prediction/last result of that instruction, we might: 
        1. Take {{bits 4-7}} of the memory address
        2. {{Hash those bits}}
        3. Use the result as the {{index}} in the table where we store the memory address and its prediction
* "2-bit saturating counter": similar to 1-bit predictors, but require {{two consecutive mispredictions}} to flip direction instead.
    * The table would store 2-bit values to indicate a history going back as far as {{two}} predicts/results.
        * {{`00`}}: two most recent iterations have not been taken 
        * {{`01`}}: the most recent iteration was taken, and the one before not taken
        * {{`10`}}: the most recent iteration was not taken, and the one was
        * {{`11`}}: two most recent iterations have been taken?
    * In the above model, states {{`00`}} and {{`01`}} predict not taken, while states {{`10`}} and {{`11`}} predict taken.
    * This avoids the greatest weakness of the 1‑bit predictor: {{loops}}. A 1‑bit predictor flips direction after {{a single unexpected outcome}}, which means it always mispredicts {{the first and last iteration of a loop}}. A 2‑bit counter, on the other hand, instead requires {{two consecutive mispredictions}} to change its mind.
    * In general: a 2-bit counter {{ignores one exception}}, while a 3-bit counter {{ignores more}}.
* "{{Return Address Stack}}" (RAS): a tiny hardware stack that is updated to track the {{call stack (return addresses only)}}. 
    * Addresses are added to the RAS when there is a {{`call`}} instruction. 
    * Addresses are popped from RAS when there is a {{`ret`}} instruction.
* "{{Branch target buffer}}" (BTB): a table that caches the last result from the jump. It is like a 1-bit predictor, but stores more metadata.
    * The columns of a BTB include: tag (upper bits of PC), index, offset (where the branch is in the instruction bundle), type (jump, call, ret, etc.), predicted target address, valid bit.
    * This same strategy can be applied to predicting where indirect jumps will land us (like `call %rax`).
    
# Exercises
```
.global foo
foo:
    xor %eax, %eax 
foo_loop_top:
    test $0x1, %edi
    je foo_loop_bottom 
    add %edi, %eax
foo_loop_bottom:
    dec %edi 
    jg foo_loop_top 
    ret
```
* Consider the code above. Suppose `%edi` initially equals 3. 
    * How many mispredicts are there for the `je` instruction? Answer: {{1}}
    * How many mispredicts are there for the `jg` instruction? Answer: {{1}}
```
movq $4, %rax
...
decq %rax
jnz 0x400423
```
* Consider the code above. Suppose a 1-bit predictor is used for branch prediction. On what iterations of the code do mispredictions occur (for what values of `%rax`)? Answer: {{the first iteration (`%rax = 4`) and last iteration (`%rax = 0`)}}
* Exercise: does it matter if collisions occur in the table for a 1-bit predictor? Why or why not? Answer: {{ Collisions in a 1‑bit predictor table generally don’t cause correctness problems, and they only sometimes hurt accuracy. Because each table entry stores just a single bit ("the last outcome seen for any branch mapped here") two different branches that hash to the same index will simply overwrite each other’s history. If both branches usually behave the same way (both mostly taken or both mostly not taken), the collision is harmless or even beneficial, since each branch reinforces the correct prediction for the other. Only when the two branches have opposite typical behavior does a collision degrade accuracy, because each branch keeps flipping the shared bit in a different direction.}}
```
int i = 0;
while (true) {
    if (i % 3 == 0)
        goto next;
    ...
next:
    i += 1;
    if (i == 50)
        break;
}
```
* Consider the code above. 
    * Suppose a 1-bit predictor is used. What is the conditional jump misprediction rate for...
        * `i % 3 == 0`? {{mispredicted 34/50 times (68%)}}
        * `i == 50`? {{mispredicted 2/50 times (4%)}}
        * Overall? {{36/100 = 36%}}
    * Suppose a 2-bit counter is used. What is the conditional jump misprediction rate for...
        * `i % 3 == 0`? {{mispredicted 17/50 times (34%)}}
        * `i == 50`? {{mispredicted 1/50 times (2%)}}
        * Overall? {{18/100 = 18%}}
![alt text](image26.png){size=small}
* Exercise: consider the instructions in memory above. For the instruction at `0x40042A`, fill out the 2-bit counter table for the first four iterations below:
| iteration | table value before jump | prediction | outcome | table value after jump |
| --- | --- | --- | --- | --- |
| 1 | `01` | N | T | `10` |
| 2 | {{`10`}} | {{T}} | {{T}} | {{`11`}} |
| 3 | {{`11`}} | {{T}} | {{T}} | {{`11`}} |
| 4 | {{`11`}} | {{T}} | {{N}} | {{`10`}} |