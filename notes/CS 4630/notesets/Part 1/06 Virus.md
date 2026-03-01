* The {{Vienna Virus}} is a virus from the 1980s that targeted .COM executables.
    * .COMs are easy to infect because {{they're super simple}}. They lack {{headers, segments or sections}}, everything is {{`rwx`}}, {{addresses}} are fixed.
    * The virus worked by {{appending its code}} and {{tricky jumping there}}. In order to make the program still look/work in a legitimate way, it also {{restored any original program bytes it overwrote to execute the jump}}.
    * Where does the Vienna virus read code from?  {{Its own code is appended to the end of the file}}. 
        * A program that outputs its own source code is called a {{quine}}
        * The Vienna Virus needs this functionality in order to {{self-replicate}}. It achieves this by choosing a register as the base pointer for its {{data}}, loading {{the length of its body}}, then calls {{DOS interrupt `int 0x21` with `ah = 0x40` (system write)}}.
    * The Vienna Virus ends up at a different offset from the executable with each infection because {{its code is always appended to the end, but each file varies in length}}. It accounts for this discrepenancy by {{modifying its own machine code before copying itself into its new host}}. In steps, this is achieved by:
        * Step 1: you first need the {{file length of the next host}}
        * Step 2: then identify the address where {{your `mov` instruction for copying the base pointer address lives}}
        * Step 3: calculate the {{new base pointer address}} using the {{new file length (and a template in .data)}} and write it to the {{`mov` instruction}} using {{`int 0x21`}}.
    * Additionally, the tricky jump needs to be patched, because `call`/`ret` that the virus infects this time will have offsets that differ from the last infection (because it's a different executable). This is achieved using almost the same exact procedure as the one above.
    * If a file is reinfected over and over via this method, it could get infinitely long. To prevent this, Vienna {{marks infected executables in the file metadata}}. This is faster than checking if the file already has virus code.
        * Each .COM file stores a timestamp for the last time it was modified, but in this era, executables were rarely modified after being initially created. 
        * The Vienna virus modified this timestamp by {{setting the seconds value to 62 seconds}}. This value was rarely overwritten.
* Places to put virus code include (name 6): {{replacing executable code, after executable code, in unused executable code, in OS code, in memory}}
    * The 2000 ILOVEYOU virus chose to place its viral body {{by overwriting existing code}}. The downside to this approach is that {{it was not stealthy at all}}.
    * If you're appending viral code, you have two options: (1) {{add an entirely new LOAD directive to the program header ie add a new segment}}, and (2) {{simply change the size of the last directive and make it executable ie hijack an existing segment}}
    * If you're placing the code in unused executable code, the one candidate includes the padding between {{branch targets}}, which is included {{for performance purposes ("All branch targets should be 16-byte aligned")}}. Other candidates include (name 4):  {{unused dynamic linking structures, unused space between segments, unused header space, unused debugging/symbol table info}}.
        * An example of space in unused dynamic linking structure: {{unused space at the end of the `.dynamic` section}}. Since these spaces tend to be small, the solution is to {{chain cavities together}}.
    * The {{Chernobyl (CIH)}} virus hid itself by splitting up its viral body and storing it among many cavities in the file, preserving the original file size. 
        * It was able to do this because linkers often do "{{segment rounding}}", which is {{aligning sections to certain byte multiples, like 4096, by rounding up the size}}. This leaves a lot of empty space at the end of many sections. 
