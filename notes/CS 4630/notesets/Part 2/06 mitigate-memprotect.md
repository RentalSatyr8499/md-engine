* A "guard page" is {{an unmapped page placed deliberately above and below an allocation to prevent overflow attacks}}. It relies on the fact that {{hardware can enforce write permissions for pages}}.
    * Accessing an unmapped page triggers a page fault that the OS handles, which often involves killing the program. This means if you attempt to overflow a buffer next to a guard page, {{a segfault}} occurs.
    * Problems with guard pages:
        * Every guard page you allocate requires {{4KB memory each}}. So {{memory}} overhead is high. 
        * Adding and touching guard pages requires {{OS involvement}}, which also increases overhead.
        * Guard pages also can't be used to protect C structs or arrays, because {{C’s memory model requires that struct fields and array elements be contiguous in memory}}. It would require a lot of reworking of the C language to get it to work with guard pages.
    * To minimize overhead associated with allocating guard pages, real allocators often {{only give guard pages to large allocations of data}}.

* Exercise: 
    * Suppose heap allocations are...
        * 100,000 objects of 100 bytes
        * 1,000 objects of 1,000 bytes
        * 100 objects of approx. 10,000 bytes
    * Assuming 4KB pages, estimate space overhead of using guard pages:
        * ...for objects larger than 4096 bytes (1 page): {{228,800 wasted bytes}}
        * ...for objects larger than 200 bytes: {{3,049,000 wasted bytes}} 
        * ...for all objects: {{39,490,000 wasted bytes}} 

# come back and add exercise from slide 9 after piazza response

* Guard pages can be used as an alternate solution to stack canaries. There are two ways to do this: you could either map the guard page, or not map it. More detail in the table below:
| stack canary alternative strategy | how does it work? | pros | cons |
|----------|----------|----------|----------|
| unmapped guard page    | place a {{completely unmapped 4KB page}} directly above the {{buffer}}. The permissions of this page prohibit {{reading and writing}}. Any access into this guard page causes {{a page fault}}.  |  Strongest protection, because not even reading is allowed. | Higher overhead; it requires a full 4KB unmapped page. |
| mapped guard page    | place a {{mapped write-protected page}} above the {{buffer}}. Any read into this guard page will {{succeed}}, and writing will cause {{a segfault}}.  |  cheaper than a full guard page | slightly weaker |


