* Spectre‑class attacks exploit persistent traces left behind by speculation-cache activity, such as: timing, power draw, electromagnetic emissions, etc. to infer data that the attacker is not supposed to know. These footprints are also referred to as "side channels".
* Timing-based side channel attack: counting the number of {{CPU cycles (or some other measurement of time)}} it takes to achieve a certain task to infer things about the {{cache}}, which allows the attacker to infer information they shouldn't know.
* "PRIME+PROBE" attack: you "prime" by {{filling cache lines with your own data}}, letting the victim run, and then "probe" by {{re‑accessing your data to see which lines were evicted}}. Eviction reveals which {{cache sets}} the victim touched. 
    * Even if the branch condition that guards the data access is false, PRIME+PROBE can still work because {{speculative execution might preemptively perform the memory access inside the branch}}. 
* "Meltdown" attack: a historical FLUSH+RELOAD attack that allowed the attacker to read non-readable kernel data.
    * Typically, kernel data, which contains sensitive stuff like cryptographic keys and file descriptors, is marked non-readable in the page table. If a program tries to read kernel data, the CPU would:
        1. Decode the read instruction
        2. Consult the page table 
        3. Discover that the page is non-readable
        4. Raise a segfault
    * But due to speculative execution, it's possible for data in the non-readable page to be read before the CPU realizes the page is non-readble (decodes the permission bits). Meltdown attacks take advantage of this:
        1. Allow the CPU to begin decoding the branch conditional (`if ?`)
        2. Allow the CPU to speculatively execute the attacker's read instruction, which :
            * Takes the kernel data
            * Multiply it by a value greater than or equal to the cache block size. Typically, the page size (often 4096) is chosen just to be safe.
            * Use that to index into the attacker's array
        3. The CPU will then segfault, because it realizes that you did not have permissions to read the kernel data. But it's already too late because the cache has been influenced by speculative execution, allowing you to infer the kernel data. 
        4. Then the attacker infers the kernel data.
            * Access each index of the attacker's array
            * Whichever index takes longer than the rest was evicted by the kernel data from the cache
            * Divide that index by the cache set size. The resulting value is your kernel data. 
    * We can mitigate against Meltdown attacks in the following ways: 
        * Hardware mitigation: perform permission checks before or during address translation rather than after
        * Software mitigation: remove kernel mappings from user page tables entirely, so even speculative execution cannot reach kernel addresses. These mitigations are expensive, though, because they require switching page tables on every syscall or interrupt.
* There are two levels to Spectre attacks. 
    * Spectre variant 1: leverage already existing kernel code, mistraining predictors, and speculative execution to leave footprints in the cache that leak secrets. 
```c
if (x < array1_size) // predictor is mistrained to think this is true
    y = array2[array1[x] * 4096]; // speculatively executed
```
* %%invis%%
    * %%invis%%
        * Any code that follows the above pattern (and is on a system with no mitigations against Spectre) is vulnerable to a Spectre attack.
        * Not all vulnerable code will look exactly like this, but they all follow the general pattern of conditional branching and using values from one table to index into another table.
        * How does the size of array entries (ex. 4-byte ints, 1-byte chars) affect the Spectre attack? Answer: {{You can only leak data in sizes as large as a single array entry}}.
    * Spectre variant 2: Inject your own code for the program to peculate into. This can be achieved by mistraining the predictor to take an indirect jump (eg. `jmp *%rax`) to an address you control.
* Mistraining the branch predictor: this is key in forcing or guaranteeing that the program will speculatively execute code that it's not supposed to, leaving an impression on the cache.
    * To make the program predict branch conditionals as true (ex. `if(myConditional)`), we just run the branch conditional many times with a value that would make `myConditional` true. Then, when we conduct the actual attack (with a value that makes `myConditional` false), the predictor will still initially predict true long enough for some of the branch body to be speculatively executed.
    * We can also mistrain branch target predictors, which are responsible for predicting where indirect jumps (ex. `jmp *%rax`) will land. To implement branch target prediction, the CPU will use a structure like a Branch Target Buffer (BTB).
        * Each BTB entry stores the “last seen target” for that jump. It indexes this BTB using some bits of the jump instructions’s address (ex. bottom 12 bits). But this means there will be conflicts in the BTB.
        * If user code and kernel code share BTB entries (because only low bits are used), user code can train the BTB entry for a given index to point to an attacker-chosen target. This could either be attacker-written code or already-existing kernel code that will conveniently happens to help the attack.
* Mitigations: we need to prevent speculation or capture it so that any potential harmful effects are neutered.
    * `ComputeMask()` mitigation technique: replace `array[x]` with `array[x & ComputeMask(x, size)]` where `ComputeMask()` does the following: returns `0` if `x` exceeds `size`, and returns `0xFFF...` otherwise. Importantly, `ComputeMask()` must be implemented without any branching (if statements).
    * Hardware-assisted mitigation (separate BTBs): separate branch target prediction for user mode and kernel mode so that you cannot speculatively execute one from the other. 
    * Retpoline: transform indirect jumps into a pattern that traps speculation into a harmless loop. // add more here
* 

# Exercises
```
char array[CACHE_SIZE];
AccessAllOf(array);
*other_address += 1;
TimeAccessingArray();
```
* Consider the pseudocode above. Suppose during these accesses I discover that `array[128]` is slower to access. What is probably true of `other_address`? (select all that apply)
    * A. same cache tag as `array[128]` {{`F`}}
    * B. same cache index as `array[128]` {{`T`}}
    * C. same cache offset as `array[128]` {{`F`}}
    * D. diff. cache tag as `array[128]` {{`T`}}
    * E. diff. cache index as `array[128]` {{`F`}}
    * F. diff. cache offsetas `array[128]` {{`F`}}
```c
char *array;
array = AllocateAlignedPhysicalMemory(CACHE_SIZE);
LoadIntoCache(array, CACHE_SIZE);
if (mystery) {
    *pointer += 1;
}
if (TimeAccessTo(&array[index]) > THRESHOLD) {
    /* pointer accessed */
}
```
* Consider the code above. Suppose `pointer` is `0x1000188` and the cache of interest is direct-mapped, $2^{15}$ bytes, and has 64-byte blocks.
    * What `array` index should we check? Answer: {{`array[384]`}}
    * Does this predict when `pointer` is accessed by the CPU? Why or why not? {{yes, because `pointer` will only appear in the cache if it's being used for something}}
    * Does this predict when `mystery` is true? Why or why not? {{no, because branch prediction could cause the CPU to access the pointer before it realizes that `mystery` is false}}
```c
char *other_array = ...;
char *array;
array = AllocateAlignedPhysicalMemory(CACHE_SIZE);
LoadIntoCache(array, CACHE_SIZE);
other_array[mystery] += 1;
for (int i = 0; i < CACHE_SIZE; i += BLOCK_SIZE) {
    if (TimeAccessTo(&array[i]) > THRESHOLD) {
        /* found something interesting */
    }
}
```
* Consider the code above. Suppose `other_array` is at `0x200400`, an interesting index is `i = 0x800`, and the cache of interest is direct-mapped, $2^{15}$ bytes, and has 64-byte blocks. What was mystery? {{`mystery = 0x400`}}
```c
char *array;
posix_memalign(&array, CACHE_SIZE, CACHE_SIZE);
LoadIntoCache(array, CACHE_SIZE);
if (mystery) {
    *pointer = 1;
}
if (TimeAccessTo(&array[index1]) > THRESHOLD ||
    TimeAccessTo(&array[index2]) > THRESHOLD) {
    /* pointer accessed */
}
```
* Consider the code above. Suppose `pointer` is `0x1000188`
cache is 2-way, $2^{15}$ byte, 64-byte blocks. What array indexes should we check? {{`array[0x180]` and `array[0x4180]`}}
```c
char array1[...];
...
int secret;
...
if (x < array1_size)
    y = array2[array1[x] * 4096]; // line I
```
* Consider the code above. Suppose `array1` is at `0x1000000` and `secret` is at `0x103F0003`. Also suppose that we can get `line I` to be speculatively executed by mistraining the predictor. 
    * What `x` do we choose to make `array1[x]` access first byte of `secret`? {{`x` = `0x3F0003`}}
    * If our cache has 64-byte blocks, 8192 sets, `array2[0]` is stored in cache set 0, and the above evicts something in cache set 128, what do we know about `array1[x]`? {{`array1[x] % 8192 = 128`, which simplifies to `array1[x] % 128 = 2`. This might be rewritten as `array1[x] = 2 + 128 * K`}}.

