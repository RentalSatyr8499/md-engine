* When the CPU asks for a value at an address, the {{cache}} can often answer immediately because it has a copy. If the value isn’t present, the request must go to {{RAM or another cache}}, which is far slower. Hiding that latency requires extremely high {{hit rates}} (99% or more) to the CPU mostly sees the speed of the fastest memory. To maximize this hit rate, caches make two classic assumptions (name without looking below): (1) {{temporal}} locality amd (2) {{spatial}} locality.
    * Define "temporal locality": {{recently accessed values are likely to be accessed again, so caches keep recently used data/instructions}}. 
    * Define "spatial locality": {{nearby values likely to be accessed soon, so caches fetch/store adjacent values together}}.
* We often have multiple caches because smaller, specialized caches are easier to make fast:
    * Each individual core has two L1 caches: one for {{data}}, and one for {{instructions}}. We split it this way because {{it avoids instruction fetches kicking out data, and also allows the hardware to be optimized for each access pattern}}.
    * Additionally, every core also gets an {{L2 cache}}, also called the {{"unified"}} cache. 
    * Also, if there are multiple cores, there is an additional cache shared between them called {{the shared L3 cache}}. 
* Cache structure: a cache is split into {{blocks}}, each of which stores a small chunk of memory. 
    * Each block has three pieces of metadata: 
        # may need to double check this
        1. {{Index}}: Selects which slot under the tag our block's data is located at. To identify it, {{begin after the least significant byte in the address}}. Ex. if the index is 2 bits, the index for address `00010` is {{`01`}}.
        2. {{Valid}}: tells if the cache block is actually holding a value or not
        3. {{Tag}}: contains the rest of the memory address (all the bits except {{the three least significant bits}}). Ex. if the index is 2 bits, the tag for address `00010` is {{`00`}}.
    * The offset tells us where within the {{block}} we'd like to fetch data from. So it is not included in the {{cache metadata}}, but the {{CPU}} still needs to know it.
Exercise
![alt text](image8.png){size=medium}
* What would be the tag, index, and offset values for each of these cache layouts if we wanted to fetch data from address `001111` (stores `0xFF`)?
| cache layout | tag | index | offset (in binary) |
|----------|----------|----------|----------|
| 2 byte blocks, 4 sets | {{`001`}}  | {{`11`}}   | {{`1`}} |
| 2 byte blocks, 8 sets | {{`00`}}  | {{`111`}}   | {{`1`}} |
| 4 byte blocks, 2 sets | {{`001`}}  | {{`1`}}   | {{`11`}} |

* Formulas: 
    * If $s$ is the number of bits in the index, the cache has {{$2^{s}$}} sets (aka rows).
    * If $b$ is the number of bits in the offset, the block size is {{$2^{b}$}}.
    * If $m$ is the number of bits in the memory address, then in terms of $m$, $s$, and $b$, the tag has {{$m − (s + b)$}} bits.
    * The "size" of the cache counts the amount of {{data}} in the cache; it doesn't include {{metadata}}. In terms of $s$ and $b$, the cache size is {{$2^{s} * 2^{b}$}}, aka the {{number of sets}} multiplied by {{the block size}}.
* Exercise: suppose a cache has 64-byte blocks and 128 sets. Addresses are 32 bits.
    * How many bits are in the offset? {{6}}
    * How many bits are in the index? {{7}}
    * How many bits are in the tag? {{19}}
    * Which of the following bytes are stored in the same block as byte `0x1037`? Hint: {{bytes are stored in the same block if they share all the same bits that come above the offset, which in this case, is anything above the lowest 6 bits}}
        * byte from 0x1011: {{Y}}
        * byte from 0x1021: {{Y}}
        * byte from 0x1035: {{Y}}
        * byte from 0x1041: {{N}}
* Cache access patterns: 
    * If the CPU requests data that happens to be in the cache, it's considered a "{{hit}}".
    * If the CPU requests data that does not happen to be in the cache, it's considered a "{{miss}}". When this occurs, the cache overwrites whatever data already exists at {{the block corresponding to the current index}} with the data the CPU requested. 
    # not sure if that is correct

![alt text](image9.png){size=small}
* Exercise: Suppose there are 4 byte blocks. Which accesses are hits? Answer: second access (00000001), fourth access (01100001), and fifth access (01100010).
