* Writing to da cache: we learned about four different cache strategies pertaining to writing in class. Fill out the table below.
| strategy | what does this strategy do? | strategy pros | strategy cons | what is this strategy an alternative to? |
|----------|----------|----------|----------|----------|
| 1. write-allocate | {{load the whole block into the cache, then write to it}} | {{allows us to take advantage of locality}} | {{misses cost a lot, because we fetching a full block every time}} | {{write-no-allocate}} |
| 2. write-no-allocate | {{directly write to memory without loading the block to cache}} | {{write misses are cheaper}} | {{lose any locality benefits}} | {{write-allocate}} |
| 3. write-through | {{every write immediately updates memory}} | {{memory always up‑to‑date}} | {{slows things down when writes are frequent}} | {{write-back}} |
| 4. write-back | {{only update memory when the block is evicted}}. This approach requires {{tracking a dirty bit.}} | {{allows us to take advantage of temporal write locality; reduces overall "memory traffic"}} | {{requires dirty‑bit tracking; evictions are more expensive}} | {{write-through}} |

* Write‑through caches have a rule: every write to the cache must also immediately write to memory. Directly implemented, this approach negatively impacts performance, because the CPU stalls on every write. For this reason, write-through caches often use a {{write buffer}} instead. 
    * When the CPU writes to the cache, the cache puts the write into a small FIFO buffer, allowing the CPU to {{continue immediately instead of waiting on the write to memory}}. Then, the buffer slowly drains writes to memory in the background.
    * But because of this, if the CPU later reads from memory, we must {{check the buffer first to make sure the requested address isn't still sitting in the buffer}}. Otherwise, the CPU might read stale data.
* AMAT ("average memory access time"): a value representing the {{effective speed of memory}}. It can be calculating using the following formula: {{`AMAT = hit time + miss rate * miss penalty`}}.
    * Example: if you have a 90% cache hit rate, hit time of 2 cycles, and a 30 cycle miss penalty, your AMAT is {{5 cycles}}. 
![alt text](image11.png){size=large}
* Exercise: Consider the cache layout above. Fill out the following table. (Assume actions are performed alone, not one after the other)
| action: | if this action requires reads from memory, where does it read from? | if this action requires writing to memory, where does it write to? | what is the dirty bit after this action? | what is the LRU bit after this action? |
|----------|----------|----------|----------|----------|
| writing 1 byte to `0x33` | {{no next-level read or write}} | {{no next-level read or write}} | {{`1`}} | {{`0`}} |
| reading 1 byte from `0x52` | {{yes, read from `mem[0x52-0x53]`}} | {{yes, "write back" to `mem[0x32-0x33]`}} | {{`0`}} | {{`0`}} |
| reading 1 byte from `0x50` | {{yes, read from block `mem[0x50-0x51]`}} | {{no next-level write (block not dirty)}} | {{`0`}} | {{`1`}} |

![alt text](image12.png){size=large}
* Exercise: Consider the cache layout above. Fill out the following table. (Assume actions are performed alone, not one after the other)
| action: | if this action requires reads from memory, where does it read from? | if this action requires writing to memory, where does it write to? | what is the LRU bit after this action? |
|----------|----------|----------|----------|
| writing 1 byte to `0x33` | {{no next-level read}} | {{yes, write to `mem[0x33]`}} | {{`0`}} | 
| reading 1 byte from `0x52` | {{yes, read from `mem[0x52-0x53]`}} | {{no next-level write}} | {{`0`}} | 
| reading 1 byte from `0x50` | {{yes, read from block `mem[0x50-0x51]`}} | {{no next-level write}} | {{`1`}} | 

* When it comes to the cache, naively traversing a multi-level page table is expensive because {{each memory access would require multiple additional memory accesses to fetch the PTEs}}. So instead, we often use {{a TLB ("Translation Lookaside Buffer")}}.
    * TLB ("Translation Lookaside Buffer"): Small cache of page table entries that translate {{VPNs}} into {{PPNs}}.
        * Organized just like a normal TIO cache, except the index and tag are derived from {{the VPN}}.
        * The offset bits are always {{`0000...`}} because {{there's only one PTE per entry}}.
    * PTEs have strong temporal locality (reused often), because {{at any given time there are only a few pages active in a program}}. Therefore, with TLBs, it's best to have a {{high}} level of associativity -- {{eviction}} needs to be rare. It's really important to prevent {{conflict misses}} with TLBs, which are costly.
* Exercise: suppose we have a 4-entry, 2-way TLB, LRU replacement policy cache that is initially empty. If pages are 4096 bytes...
    * How many index bits are there? {{1}}
    * What's the TLB index of virtual address `0x12345`? {{`0`}}

* Suppose TLB is 4-entry, 2-way, has an LRU replacement policy, and is initially empty. If we have 4096-byte pages, fill out the following table.
|action|virtual address|physical address|hit or miss?|set 0 after the action:|set 1 after the action:|
|----------|----------|----------|----------|----------|----------|
|read |0x440030 |0x554030| {{`miss`}} | {{`0x440`}}| {{still empty}}|
|write |0x440034 |0x554034| {{`hit!`}}|{{`0x440`}}| {{still empty}}|
|read |0x7FFFE008 |0x556008| {{`miss`}} | {{`0x440`, `0x7FFFE`}}| {{still empty}}|
|read |0x7FFFE000 |0x556000| {{`hit!`}} | {{`0x440`, `0x7FFFE`}}| {{still empty}}|
|read |0x7FFFDFF8 |0x5F8FF8| {{`miss`}} | {{`0x440`, `0x7FFFE`}}| {{`0x7FFFD`}}|
|read |0x664080 |0x5F9080|{{`miss`}} | {{`0x664`, `0x7FFFE`}}| {{`0x7FFFD`}}|
|read |0x440038 |0x554038|{{`miss`}} | {{`0x664`, `0x440`}}| {{`0x7FFFD`}}|
|write |0x7FFFDFF0 |0x5F8FF0|{{`hit!`}} | {{`0x664`, `0x440`}}| {{`0x7FFFD`}}|

* Exercise: Consider a 2-way set associative cache with, 16-byte cache blocks, 32 sets, a write-no-allocate policy, a write-back policy, and an LRU replacement policy. Suppose the cache is initially empty and the following accesses are performed in this order:
    1. read 4 bytes from an address with tag 0x40, index 0x2, offset 0x0
    2. write 4 bytes to an address with tag 0x40, index 0x2, offset 0x0
    3. read 4 bytes to an address with tag 0x41, index 0x2, offset 0x0
    4. read 4 bytes to an address with tag 0x42, index 0x2, offset 0x0
    5. read 4 bytes to an address with tag 0x43, index 0x2, offset 0x0
    6. write 2 bytes to an address with tag 0x30, index 0x1, offset 0x0
    * As a result of the above accesses, we would expect {{18}} bytes to be written to memory from the cache.
*   Assume the same cache layout, the cache is initially empty, and the but accesses are performed in the following order instead:
    1. read 4 bytes from an address with tag 0x40, index 0x2, offset 0x4
    2. read 4 bytes from an address with tag 0x40, index 0x2, offset 0x8
    3. write 4 bytes to an address with tag 0x40, index 0x2, offset 0xc
    4. read 4 bytes from an address with tag 0x41, index 0x2, offset 0x0
    5. read 4 bytes from an address with tag 0x42, index 0x2, offset 0x0
    6. write 4 bytes from an address with tag 0x41, index 0x2, offset 0x4
    7. read 4 bytes from an address with tag 0x43, index 0x2, offset 0x8
    8. write 4 bytes to an address with tag 0x44, index 0x2, offset 0xc
    * After these accesses run, which blocks associated which cache tags in set index 0x2 will have their dirty bits set? Write the tag values separated by commas. If no dirty bits will be set, write "none". {{`0x41`. that's it!}}

* Exercise: Suppose a system has 1024 byte pages, 26-bit virtual addresses, 24-bit physical addresses, two-level page tables with 256 entries in page tables at each level, a 4-way data TLB with 32 entries; and a 8KB (8192 byte) two-way set associative data cache with 256-byte blocks which uses only physical addresses. (This cache has 8 block offset bits and 4 set index bits.)
    * Each tag stored in the TLB takes up {{13}} bits.
    * Assuming both accesses would be data cache hits and TLB hits, reading the byte from virtual address `0x12345` would {{always}} use the same TLB **set** as reading the byte from virtual address `0xF2345`. (always/sometimes/never)
    * Assuming both accesses would be data cache hits and TLB hits, reading the byte from virtual address `0x12345` would {{never}} use the same TLB **entry** as reading the byte from virtual address `0xF2345`. (always/sometimes/never)
    * Assuming both accesses would be data cache hits and TLB hits, reading the byte from virtual address `0x12345` would {{sometimes}} use the same **data cache set**  as reading the byte from virtual address `0xF2345`. (always/sometimes/never)



