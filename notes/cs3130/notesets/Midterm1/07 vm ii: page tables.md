* In general, page tricks work as the following: we deliberately {{make program trigger page/protection fault}}, but don’t assume {{page/protection fault is an error}}, and have have seperate data structures represent {{logically allocated memory}}. 
    * Example page table tricks include: {{allocating space on demand, loading code/data from files on disk on demand, copy-on-write, saving data temporarily to disk, reloading to memory on demand, “swapping”, detecting whether memory was read/written recently, stopping in a debugger when a variable is modified, sharing memory between programs on two different machines}}.
    * Some ways that the hardware assists page table tricks: {{stores the address causing the fault in a special register, automatically rerun faulting instruction when returning exception, not allowing any side effects from the faulting instruction such as incrementing `%rsp`}}

![exercise](image2.png){size=large}
* Given the above page table and memory, 5-bit virtual addresses, and 8-byte pages...
    * The value stored at virtual address `0x18` is {{`0x0`}}.
    * The value stored at virtual address `0x03` is {{`0x4A`}}.
    * The value stored at virtual address `0x0A` is {{`0xDC`}}.
    * The value stored at virtual address `0x13` is {{page fault}}.

* Page tables are typically stored in {{memory}}. CPUs keep track of where the table is located using a {{page table base register, which points to the beginning of the table in memory}}. 
    * A PTE (page table entry) contains the following three components: (1) {{PPN}}, 2 {{valid bit}}, (3) {{"other" (unused) bits}}
    * To find a PTE in memory, start with the {{page table base register}}, then from there jump forward by an offset equal to the {{VPN (virtual page number) * PTE size}}.
* Steps to translate a virtual address to the data it's pointing to
![alt text](image3.png){size=medium}
* (All the examples below will be using the example memory address state above, and translating the example virtual address `0x31`)
    1. Figure out how many bits the {{page offset}} is by {{taking the log of the page size}}. Ex. log_2 (8 bytes) = 3 bits
    2. Identify the VPN within the virtual address. You do this using the {{VPN}}, which is equal to {{virtual address size - page offset size}}. Ex. `virtAddr = 110001`, so `VPN = 110`
    3. Find the PTE (page table entry) by starting at {{the page table base register}}, and then jumping forward by an offset equal to {{the VPN * PTE size}}. Ex. `0xF6 i.e. 0b1111 01110`
    4. Identify the PPN within the PTE. You do this using the {{PPN size}}. Ex. `0b111`
    5. Check to make sure {{the page is valid (look at the valid bit)}}. Ex. The fourth bit is the valid bit in this example, and it's equal to `1`, so this page is valid
    6. Assemble the physical address. Begin with the {{PPN}}, then  concatenate the {{page offset}} (which is found in {{the remaining bits in the virtual address}}). Pad the physical address with zeroes as needed. Ex. `0b111 001` becomes `0b0011 1001`, which is `0x39` in hex.
    7. Translate the physical address to hex if needed, then look in memory to see what is stored there. Ex. The value stored at `0x39` is `0x0C`.
* Exercise: assuming the same memory state, translate the following virtual addresses: 
![alt text](image3.png)
*   * `0x12`: {{`0xBA`}}
    * `0x12`, except PTEs are 2 bytes and contain 12 unused bits: {{`0x3C`}}

## skipped pages 136-159 in vm.pdf
because they have to do with an assignment due after the midterm

* Because there are huge amounts of virtual pages that are invalid, page tables aren't usually stored in arrays in memory, but rather, in {{wide trees}}. 
    * Each deeper layer of the tree represents {{a narrower and narrower range of virtual addresses}}.
    * This solves the problem of storing unused pages because {{if a range of addresses is invalid, an earlier node will prevent every single one of those entries from being stored}}. This is called a multi-level page table.

![alt text](image4.png)

*   
    * We know which node to look at next when traversing a multi-level page table by looking at the {{VPN}}.
*  Exercise: If a system has  3-level page tables, 4096-byte pages, 256 entries per table, and has the following valid virtual address ranges:
    * `0x000000000` - `0x0007FFFFF`
    * `0x000880000`-`0x00088FFFF`
    * `0x100000000`- `0x0x100000FFF`
* How many page tables does the process need? 
    * Hint 1: {{Each VPN index is 8 bits = 2 hex digits, while the last 12 bits (3 hex digits) are the page offset.}} 
    * Hint 2: {{There's only ever one Level-1 table. The fact that the L1 index changes from `0x00` to `0x01` just signifies that there are two PTEs in the L1 table. The same thought process can be applied to L2 and L3; new tables are only created if the parent table has an additional index.}}
    * Answer: {{13}} 
* Exercise: If a system has  3-level page tables, 1024-byte pages, and 256 entries per table...
    * What is the minimum number of page tables needed? {{42}}
        * Hint 1: {{Begin by determining how many L3 tables are needed, which is constrained by how much accessible memory there is (the lowest level is the only level that contains actual pages, while all the preceding levels just contain other tables).}} 
        * Hint 2: {{Divide the size of accessible memory (in bytes) by the number of bytes per page to get the number of accessible pages. Then divide that by the page table size. This gives us a total of 40 L3 pages.}}
    * What is the maximum number of page tables needed? {{81}}
    * What circumstances force there to be more or less page tables? {{If the valid VPNs are clustered closer together in memory, there will be less page tables. So the minumum occurs when all valid virtual pages are contiguous in memory. When the opposite is true (valid virtual pages are spaced apart), more page tables are needed. So the max occurs when all valid pages exist 256 pages apart.}}
* Say we have 42-bit physical addresses, 4 permission bits in page table entries, and page tables should be <= 1 page in size. If we want 64-bit virtual addresses, how many levels would there be with...
    * 4096-byte pages? {{6 levels}}
        * Hint 1: {{Find how many PTEs can fit in a single page first. Do this by calculating the size of a single PTE then dividing by the size of the page. In this example, a PTE would be: 30-bit PPN + 4-bit perms + 1 valid bit = 35 bits. That means you need to store PTEs in 8-byte chunks (round up to the nearest power of two). That means there are $2^{9}$ entries per table.}}
        * Hint 2: {{The number of entries in a table is how many bits a table needs to be represented as a VPN index. In this example, 12 of the 64 bits in the virt. address are taken up by the page offset. The remaining 52 can be used for VPN indices.}}
    * 16384-byte pages? {{4 levels}}
* Exercise:
![alt text](image5.png)
* 
    * Translate virtual address `0x129`: {{`0x0A`}}.
        * Hint 1: First, determine how many {{levels}} there are: {{3}}-bit PPN + {{1}} valid bit + {{3}}-bit page offset = 7-bit {{PTE}}s. That means each PTE is {{1}} byte, giving us {{8}} page table entries per {{page or page table}}. So each VPN index will eat up {{3}} bits. Because the {{page offset}} already takes up 3 bits of the virtual address, we can conclude there are {{2}} levels.
        * Hint 2: PTE 1 is at {{`0x24` (so it's `0xF4`)}}, and PTE 2 is at {{`0x3D` (so it's `0xDC`).}}
* 
    * 



