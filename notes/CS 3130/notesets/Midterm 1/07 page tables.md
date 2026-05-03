* CPUs keep track of where the page table is located using a {{page table base register, which points to the beginning of the table in memory}}. To find a PTE in memory...
    1. Start with the {{page table base register}}. 
    2. Then calculate the offset by {{multiplying the VPN by the PTE size}}.
    3. Then jump from the PTBR forward by the offset.
![alt text](image3.png){size=medium}
* (All the examples below will be using the example memory address state above, and translating the example virtual address `0x31`)
    1. Figure out how many bits are in the page offset is by taking the log of the page size. Ex. {{$log_{2}$ (8 bytes) = 3 bits}}
    2. Identify the VPN within the virtual address by masking off the page offset bits. Ex. {{Masking 3 bits off `110001` gives us `VPN = 110`}}
    3. Find the PTE (page table entry) by starting at the page table base register, and then jumping forward by an offset equal to the VPN * PTE size. Ex. {{`0xF6 i.e. 0b1111 01110`}}
    4. Identify the PPN within the PTE. Ex. {{`0b111`}}
    5. Check to make sure {{the page is valid (look at the valid bit)}}. Ex. {{The fourth bit is the valid bit in this example, and it's equal to `1`, so this page is valid}}
    6. Assemble the physical address. Begin with the {{PPN}}, then  concatenate the {{page offset}}. Pad the physical address with zeroes as needed. Ex. {{`0b111 001` becomes `0b0011 1001`, which is `0x39` in hex.}}
    7. Translate the physical address to hex if needed, then look in memory to see what is stored there. Ex. {{The value stored at `0x39` is `0x0C`.}}
* What problem do multi-level page tables solve? {{Huge amounts of contiguous virtual pages remain unmapped, wasting space in memory.}}
    * How do they solve this problem? {{Page tables aren't usually stored in arrays in memory, but rather, in wide trees. If a range of addresses is invalid, an earlier node will prevent every single one of those entries from being stored.}}

# Exercises
![exercise](image2.png){size=medium}
* Consider the memory above. Suppose there are, 5-bit virtual addresses, and 8-byte pages.
    * The value stored at virtual address `0x18` is {{`0x0`}}.
    * The value stored at virtual address `0x03` is {{`0x4A`}}.
    * The value stored at virtual address `0x0A` is {{`0xDC`}}.
    * The value stored at virtual address `0x13` is {{page fault}}.
![alt text](image3.png){size=medium}
*   Consider the memory state above. Translate address  `0x12` (not `0x31`). {{`0xBA`}}
![alt text](image7.png){size=medium}
*   Consider the memory state above. Suppose instead there PTEs are 2 bytes and contain 12 unused bits (ignore what's in the picture). Translate address `0x12`.  {{`0x3C`}}
* Exercise: Suppose system has 3-level page tables, 4096-byte pages, 256 entries per table
    * Also suppose that it has the following valid virtual address ranges:
        * `0x000000000` - `0x0007FFFFF`
        * `0x000880000`-`0x00088FFFF`
        * `0x100000000`- `0x0x100000FFF`
    * How many page tables does the process need? 
        * Hint 1: {{Each VPN index is 8 bits = 2 hex digits, while the last 12 bits (3 hex digits) are the page offset.}} 
        * Hint 2: {{There's only ever one Level-1 table. The fact that the L1 index changes from `0x00` to `0x01` just signifies that there are two PTEs in the L1 table. The same thought process can be applied to L2 and L3; new tables are only created if the parent table has an additional index.}}
        * Answer: {{13}} 
* Exercise: Say we have 42-bit physical addresses, 4 permission bits in page table entries, and page tables should be <= 1 page in size. If we want 64-bit virtual addresses, how many levels would there be with...
    * $2^{10}$-byte pages? {{6 levels}}
        * Hint 1: {{Find how many PTEs can fit in a single page first. Do this by calculating the size of a single PTE then dividing by the size of the page. In this example, a PTE would be: 30-bit PPN + 4-bit perms + 1 valid bit = 35 bits. That means you need to store PTEs in 8-byte chunks (round up to the nearest power of two). That means there are $2^{9}$ entries per table.}}
        * Hint 2: {{The number of entries in a table is how many bits a table needs to be represented as a VPN index. In this example, 12 of the 64 bits in the virt. address are taken up by the page offset. The remaining 52 can be used for VPN indices.}}
    * $2^{14}$-byte pages? {{4 levels}}
![alt text](image5.png){size=medium}
* Exercise: Consider the memory above. Translate virtual address `0x129`.
    * Hint 1: {{First, determine how many levels there are: 3-bit PPN + 1 valid bit + 3-bit page offset = 7-bit PTEs. That means each PTE is 1 byte, giving us 8 page table entries per page or page table. So each VPN index will eat up 3 bits. Because the page offset already takes up 3 bits of the virtual address, we can conclude there are 2 levels}}.
    * Hint 2: {{PTE 1 is at `0x24` (so it's `0xF4`), and PTE 2 is at `0x3D` (so it's `0xDC`)}}.
    * Answer: {{`0x0A`}}.




