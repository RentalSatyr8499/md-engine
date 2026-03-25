* Because set is determined by a memory's block index, each memory block has exactly {{one}} set that is can occupy. But cache is much smaller than memory, which means many memory blocks will map to the same set. Specifically, if two blocks differ by {{the size of the cache}}, they will map to the same set.
    * Imagine memory as being divided into segments the size of the cache blocks, where each segment is numbered 0...n. If K is the number of sets in the cache, set `0` receives blocks {{0}}, {{K}}, {{2K}}, {{3K}}, etc.
    * `array[0]` and `array[X]` collide when `cache_size` = {{`X * element_size`}}.
        * Equivalent formula: `X` = {{`cache_size / element_size`}}.
    * Accessing an array with a stride equal to {{the cache size}} forces thrashing.
        * "Stride": the fixed distance you move forward by in memory between consecutive accesses in a loop. So if you're accessing the `array[0]`, `array[10]`, `array[20]`,..., the stride is {{10}}.
        * "Conflict miss": when a miss occurs not because the cache doesn't have anything in that set yet, but because {{something else already occupies that set}}.
        * "Thrashing": when a program repeatedly overwrites the same cache set over and over again because its access pattern keeps mapping to the same cache location(s). Aka many {{conflict misses}} occur.
    * Hard question: can conflict misses can occur even when the array fits entirely in cache? Why or why not? {{Yes. The cache maps data based on memory addresses, not the array's size or index. If the array's starting position in RAM (the base address) is not perfectly aligned with the start of the cache, or if you access two different memory locations that both "modulo" to the same cache slot, they will repeatedly evict each other.}}
    * Name three data structures/operations that lead to thrashing when using direct-map caching: {{arrays}}, {{binary search tree}} and {{matrix multiplications}}. 
* We can mitigate the problem of thrashing that comes with direct-mapped caching by introducing {{associativity}}.
    * Associativity gives each set {{multiple slots ("ways")}}, which allows for multiple {{blocks of data with the same index}} to coexist in the cache.
    * Conceptual steps to caching associative memory:
        1. An address still splits into tag, index, and offset. The index selects which {{set}} the data goes in (this step is still the same as direct-map cache).
        2. The cache checks all the {{ways}} in the selected {{set}} for a matching {{tag}}. A hit occurs if {{any of the ways contain a matching tag}}; otherwise it's a miss.
    * With associativity, misses only appear if {{all the ways in a set are full and a new block must be inserted}}. This makes them less frequent than in direct-map caching.
* When a set is full in an associative cache, the cache must decide {{which way to evict}}. One way to do this is LRU ("{{least recently used}}"), which evicts the block that {{has not been accessed for the longest time}}.
    * True LRU requires tracking {{full ordering of ways}}, which gets more expensive with more {{ways ("higher associativity")}}.
    * To indicate which way is least recently used, each set gets an {{LRU bit}}.
    * Other replacement policies: 
        * LRU approximation: tracking the {{most recently used}} instead of {{what's not been recently used}} (and just avoid recently used)
        * FIFO: evicts the {{oldest}} block in the set.
        * Random: chooses a way at random; surprisingly effective and very cheap.
* Ways to categorize a cache:
    * "Direct-mapped": {{1}}-way set associative ({{one}} block per set).
    * "E-way set associative": each set has {{E}} blocks.
    * "Fully associative": {{one}} set total.
    * Higher associativity reduces {{conflict misses}} but increases {{lookup complexity and hardware cost}}.

![alt text](image10.png){size=medium}
* Exercise: suppose a cache had the above mapping. If the following addresses were accessed in order, which would be hits, which would be misses?
| address | result |
|----------|----------|
| `00000000` | {{`miss`}} |
| `00000001` | {{`hit!`}} |
| `01100011` | {{`miss`}} |
| `01100001` | {{`miss`}} |
| `01100010` | {{`hit!`}} |
| `00000000` | {{`hit!`}} |
| `01100100` | {{`miss`}} |
* Exercise: suppose a cache had the same mapping as the problem above. Additionally, assume that the cache uses an LRU replacement policy. If the following addresses were accessed in order, which would be hits, which would be misses?
| address | result |
|----------|----------|
| `01100001` | {{`miss`}} |
| `01100000` | {{`hit!`}} |
| `01100000` | {{`hit!`}} |
| `00000000` | {{`miss`}} |
| `11110000` | {{`miss`}} |
| `11100000` | {{`hit!`}} |

```c
int array[4];
int even_sum = 0, odd_sum = 0;
even_sum += array[0];
even_sum += array[2];
odd_sum += array[1];
odd_sum += array[3];
```
* Exercise: Consider the code above. Assume everything but `array` is kept in registers (and the compiler does not do
anything funny), that `array[0]` belongs to the beginning of cache block, and that blocks are 8 bytes. Fill out the following table:
| memory access (in chronological order) | hit or miss? | cache contents afterwards |
|----------|----------|----------|
| read from `array[0]` | {{`miss`}} | {{`{array[0], array[1]}`}} |
| {{read from `array[2]`}} | {{`miss`}} | {{`array[2], array[3]`}} |
| {{read from `array[1]`}} | {{`miss`}} | {{`{array[0], array[1]}`}} |
| {{read from `array[3]`}} | {{`miss`}} | {{`array[2], array[3]`}} |

```c
int array[8]; /* assume aligned */
...
int even_sum = 0, odd_sum = 0;
even_sum += array[0];
even_sum += array[2];
even_sum += array[4];
even_sum += array[6];
odd_sum += array[1];
odd_sum += array[3];
odd_sum += array[5];
odd_sum += array[7];
```
* Exercise: Consider the code above. Assume everything but `array` is kept in registers (and the compiler does not do
anything funny), that blocks are 8 bytes, and that the data cache has 2 sets. Fill out the following table:
| memory access (in chronological order) | hit or miss? | set 1 contents afterwards | set 2 contents afterwards |
|----------|----------|----------|----------|
| read from `array[0]` | {{`miss`}} | {{`{array[0], array[1]}`}} | {{empty}} |
| {{read from `array[2]`}} | {{`miss`}} | {{`{array[0], array[1]}`}} | {{`{array[2], array[3]}`}} |
| {{read from `array[4]`}} | {{`miss`}} | {{`{array[4], array[5]}`}} | {{`{array[2], array[3]}`}} |
| {{read from `array[6]`}} | {{`miss`}} | {{`{array[4], array[5]}`}} | {{`{array[6], array[7]}`}} |
| {{read from `array[1]`}} | {{`miss`}} | {{`{array[0], array[1]}`}} | {{`{array[6], array[7]}`}} |
| {{read from `array[3]`}} | {{`miss`}} | {{`{array[0], array[1]}`}} | {{`{array[2], array[3]}`}} |
| {{read from `array[5]`}} | {{`miss`}} | {{`{array[4], array[5]}`}} | {{`{array[2], array[3]}`}} |
| {{read from `array[7]`}} | {{`miss`}} | {{`{array[4], array[5]}`}} | {{`{array[6], array[7]}`}} |

* Questiob: can the same code lead to different cache behavior based on other circumstances? What are those circumstances? {{Yes; if memory layout changes, which the programmer doesn’t control, the number of conflict misses that occur can change. Compiler behavior can influence cache behavior too}}. 
* In a direct-mapped cache, if you walk the array with a stride equal to the cache size, you will keep landing on the same set. Similarly, in an associative cache, if you walk the array with a stride equal to the {{way size}}, you will keep landing in the same set.


```c
int array1[512]; int array2[512];
...
for (int i = 0; i < 512; i += 1){
    sum += array1[i] * array2[i];
}
```
* Exercise: Assume everything but `array1`, `array2` is kept in registers (and the compiler does not do anything funny). There are 1000 bytes in a KB.
    * A different amount of misses will occur based on external circumstances. What are they? {{how `array1` and `array2` are aligned relative to one another in memory}}
    * How many data cache misses will occur on a 2KB direct-mapped cache with 16B cache blocks in...
        * The best case scenario? When does this occur? Answer: {{Around 256 misses will occur if `array1[0]` and `array2[0]` are spaced *x* bytes apart in memory, where *x* is not a multiple of 2000}}.
        * The worst case scenario? When does this occur? Answer: {{Around 1024 misses will occur if `array1[0]` and `array2[0]` are spaced *x* bytes apart in memory, where *x* is a multiple of 2000}}.

```c
int array[1024]; /* assume aligned */
int even_sum = 0, odd_sum = 0;
even_sum += array[0];
even_sum += array[2];
even_sum += array[512];
even_sum += array[514];
odd_sum += array[1];
odd_sum += array[3];
odd_sum += array[511];
odd_sum += array[513];
```

* Exercise: Assume everything but array is kept in registers (and the compiler does not do anything funny). 
    * What formula can we use to determine what set `array[x]` loads into? Answer: {{`x / elementsPerBlock) % numSets`, so `(x / 4) % 64` in this situation. }}
    * How many data cache misses on a 2KB 2-way set associative cache with 16B blocks? (observation: `array[0]`, `array[256]`, `array[512]`, `array[768]` are in same set).

```c
for (int outer = 0; outer < 1000; outer += 1) {
    array[0] += 1;
    array[9] += 1;
    array[18] += 1;
    array[27] += 1;
    array[36] += 1;
    array[45] += 1;
    array[54] += 1;
    array[63] += 1;
    array[72] += 1;
}
```
* Exercise: Consider a direct-mapped data cache with 16-byte cache blocks, 16 sets, and a C array declared as : `int array[1024];` where the array starts on an address that is a multiple of 16384 on a system where ints take up 4 bytes and virtual memory is not in use. In the code snippet above, how many misses occur? 
    * Hint: {{There's one miss for every set to which only one array access maps, and 1000*n misses for every set to which multiple array accesses map (where n is the number of array accesses that conflict on the same set). Only 64 integers can fit in the cache. }}
    * Answer: {{2007}}
    * Explanation: {{(from site) "relevant mappings of array indices to sets: set 0: 0-3, set 2: 8-11 AND 72-75, set 4: 16-19; set 6: 25-28; set 9: 36-39; set 11: 44-47; set 13: 52--55 set 15: 60-63;. so 7 misses for sets 0 (array[0]), 4 (array[18]), 6 (array[27]), 9 (array[36]), 11 (array[45]), 13 (array[54]), 15 (array[63]) being loaded the first time, then those acceesses are all hits in future iterations"}}

```c
int array1[512]; int array2[512];
...
for (int i = 0; i < 512; i += 1){
    sum += array1[i] * array2[i];
}
```
* Exercise: Assume everything but `array1`, `array2` is kept in registers (and the compiler does not do anything funny). About how many data cache misses on a 2KB direct-mapped cache with 16B cache blocks? 
    * Hint: {{depends on relative placement of `array1`, `array2`}}. 
    * Answer: {{in the best case scenario, `array1` and `array2` land in different sets, and they never evict each other. Here, each array loads one block every four iterations, giving 512 misses total. But if both arrays map to the same set, they constantly replace each other’s blocks. Every iteration causes two misses, giving 1024 misses total. The worst case occurs when the location of `array1` and `array2` in memory differ by a multiple of the way size.}}