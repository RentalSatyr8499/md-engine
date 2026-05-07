* The {{Vienna Virus}} is a virus from the 1980s that targeted .COM executables.
    * Explain a little bit why .COM files are so easy to infect. {{They're super simple They lack headers, segments or sections, everything is readable, writeable, and executable, and addresses are fixed}}.
    * The virus worked by {{appending its code and tricky jumping there}}. In order to make the program still look/work in a legitimate way, it also {{restored any original program bytes it overwrote to execute the jump}}.
        * A program that outputs its own source code is called a "quine".
        * The Vienna Virus needs this functionality in order to {{self-replicate}}. It achieves this by choosing a {{(1) redirecting a register to point to itself, (2) loading its payload length as a constant, then (3) calling system write DOS interrupt using the `int 0x21` command (DOS interrupt. only works if `ah = 0x40`)}}.
    * The Vienna Virus ends up at a different offset from the executable with each infection because {{its code is always appended to the end, but each file varies in length}}. It accounts for this discrepenancy by {{modifying its own machine code before copying itself into its new host}}. In steps, this is achieved by:
        * Step 1: you first need the {{file length of the next host}}
        * Step 2: then identify the address where {{your `mov` instruction for copying the base pointer address lives}}
        * Step 3: calculate the new base pointer address using the new file length (and a template in .data) and write it to the {{`mov` instruction}} using {{`int 0x21`}}.
    * Additionally, the tricky jump needs to be patched, because `call`/`ret` that the virus infects this time will have offsets that differ from the last infection (because it's a different executable). This is achieved using almost the same exact procedure as the one above.
    * If a file is reinfected over and over via this method, it could get infinitely long. To prevent this, Vienna {{marks infected executables by setting the seconds value to 62 seconds in the file metadata}}. 
* There are lots of places to put virus code include: you could replace executable code, place it after executable code, place it in unused executable code (cavities), or in OS code, or in memory.
    * The 2000 ILOVEYOU virus chose to place its viral body {{by overwriting existing code}}. The downside to this approach is that {{it was not stealthy at all}}.
    * If you're appending viral code, you have two options: (1) {{add an entirely new LOAD directive to the program header (ie, add a new segment)}}, and (2) {{change the size of the last directive and make it executable (ie, hijack an existing segment)}}
    * If you're placing the code in unused executable code (cavities), name five possible candidate places: {{padding between branch targets, unused dynamic linking structures, unused space between segments, unused header space, unused debugging/symbol table info}}.
        * There's often padding between branch targets for alignment purposes. The Intel manual says that "all branch targets should be 16-byte aligned".
        * An example of space in unused dynamic linking structure: {{unused space at the end of the `.dynamic` section}}. Since these spaces tend to be small, the solution is to {{chain cavities together}}.
    * The Chernobyl (CIH) virus hid itself by {{splitting up its viral body and storing it among many cavities in the file, preserving the original file size}}. 
