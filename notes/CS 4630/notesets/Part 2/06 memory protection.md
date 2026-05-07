* A "guard page" is {{an unmapped page placed deliberately above and below an allocation to prevent overflow attacks}}. It relies on the fact that hardware can {{enforce write permissions for pages}}. 
    * One drawback of guard pages is that they require very high {{memory overhead}}.
    * Another is that guard pages also can't be used to protect C structs or arrays, because {{C’s memory model requires that struct fields and array elements be contiguous in memory}}. 
    * To minimize overhead associated with allocating guard pages, real allocators often {{only give guard pages to large allocations of data}}.
* Guard pages can be used as an alternate solution to stack canaries. There are two ways to do this: you could either use a mapped page that is already in use, but non-writeable, or use an unmapped page. More detail in the table below:
| stack canary alternative strategy | how does it work? | pros | cons |
|----------|----------|----------|----------|
| unmapped guard page    | place a {{completely unmapped 4KB page}} directly above the {{buffer}}. The permissions of this page prohibit {{reading and writing}}. Any access into this guard page causes {{a page fault}}.  |  Strongest protection, because not even reading is allowed. | Higher overhead; it requires a full 4KB unmapped page. |
| mapped guard page    | place a {{mapped write-protected page}} above the {{buffer}}. Any read into this guard page will {{succeed}}, and writing will cause {{a segfault}}.  |  cheaper than a full guard page | slightly weaker |
* We use RELRO ("RELocation Read-Only") because we want certain things to only be readable at certain times. 
    * Some data, like {{machine code}}, can stay permanently unwriteable. But other sensitive data, like {{return addresses, local function pointers, vtables, the GOT}}, can't always be unwriteable because they change during execution. For example, because {{the addresses of functions}} aren’t known until the program is loaded, the GOT and vtables are filled in by the {{dynamic linker}} at {{run}} time.
    * Recall "lazy binding": instead of resolving every function’s address at startup, the program fills the GOT with {{"trampolines" (essentially "I’ll look it up later" stubs)}}. The first time you call a function, the {{dynamic linker}} finds the {{real address}}, writes it into the GOT, and future calls go straight there. This speeds up {{startup}}.
    * "Partial RELRO": makes most dynamic linker metadata, unwriteable after program startup, with the exception of {{the GOT entries for external library functions}}. It does, however, protect {{C++ vtables}}.
    * "Full RELRO": makes all dynamic linker metadata unwriteable after startup, including GOT entries. However, this also requires disabling {{lazy binding}}, because {{lazy binding will want to write to the GOT later after startup}}.
 * W^X ("Write XOR Execute"): the rule that {{memory should be either writable or executable, but never both}}. If attackers can't {{write to executable memory}}, they can’t inject new machine code.
    * Problematically, some real systems (that were created a long time ago) do execute code from writable memory. So W^X isn't always feasible.
    * Also, attackers can get around W^X by not injecting anything at all, but repurposing machine code already included in the program for malicious ends. This is called {{arc injection}}.


# Exercises
* Exercise: 
    * Suppose heap allocations are...
        * 100,000 objects of 100 bytes
        * 1,000 objects of 1,000 bytes
        * 100 objects of approx. 10,000 bytes
    * Assuming 4KB pages, estimate space overhead of using guard pages:
        * ...for objects larger than 4096 bytes (1 page): {{228,800 wasted bytes}}
        * ...for objects larger than 200 bytes: {{3,049,000 wasted bytes}} 
        * ...for all objects: {{39,490,000 wasted bytes}} 
* Exercise: Suppose there are 100,000 objects of 100 bytes, 1000 objects of 1000 bytes, and 100 objects of 10,000 bytes. Estimate space overhead of using guard pages...
    * for objects larger than 4096 bytes: {{228,800 bytes}}
    * for objects larger than 200 bytes: {{3,324,800 bytes}}
    * for all objects: {{402,924,800 bytes}}