* Many attacks happen because user-controlled data reaches sensitive or dangerous operations. Taint-tracking is a mitigation strategy that involves tracking the {{flow of user data through the program}}.
    * To begin, values are tainted if they originate from {{untrusted sources}}.
    * If another value is {{computed from tainted data}}, it becomes tainted as well.
* Taint tracking has been implemented on multiple levels. At the language level, it exists in programming languages like {{Perl}} and {{Ruby}} as an optional feature. At the system level, custom {{x86 virtual}} machines or can track taint at the machine‑code level. Custom {{Android}} systems can do whole‑system taint tracking.
* In Perl, you can enable taint mode with {{`perl -T`}}. Perl refuses to let tainted data reach {{system calls}}.
    * User input is then automatically {{tainted}}. Concatenating it with something else results in {{that thing being tainted too}}.
    * Passing tainted data into a system call, like `system("mkdir $userInput")`, will result in {{an error being triggered ("Insecure dependency in system while running with -T switch...")}}.
    * To untaint data, you can use a {{regex}} to {{specify safe characters}}. For examples, if you wanted to keep only alphanumeric characters in the variable `name`, you can use {{`($name) = $name =~ /^([a-zA-Z0-9]+)$/;`}}. Untainting data allows it to reach {{system calls}}.

* We can use taint tracking for malware analysis in multiple ways.
    * Files: Mark {{an entire input file}} as tainted, then observe {{how that data is used throughout execution, especially whether/how it reaches program output}}. We can construct a "path" of how that file's data was used by {{tainting every access to it}}.
    * Network packets: Mark {{incoming packet bytes}} as tainted. Identify which functions {{process the packet}}.  
    * Individual bytes: Tagging each byte differently allows us to determine which specific bytes influence {{control flow (e.g., jumps)}}. It could also help us identify which bytes of input a {{malicious command}} came from.
* To implement assembly-level taint tracking, we maintain a lookup table for every {{register and byte of memory}} describing {{where its value originated}}.  
  * Example: in `add %r9, (%r8)`, the taint of the memory at address in `%r8` inherits the taint of `%r9`. 
  * Example: `xor %eax, %eax` has what effect on the taint? (Answer: {{`%eax`'s taint is removed}}). 
    * The {{Windows}} keyboard actually worked like this. Raw keycodes are tainted, but they are {{passed through a switch statement that maps them to untainted constant characters}}, untainting them.  
  * Similar taint tables exist for other data structures like {{virtual disks and network I/O}}.

* Whole‑system taint tracking is less feasible because {{it has very high overhead}}. To achieve it, you have to hook system calls, instrument kernel code, and a whole bunch of other things. To circumvent these engineering issues, many researchers build {{custom VMs}} instead, and configure them to {{automatically taint-track}}. 
  * Examples: (1) {{Panda.RE in combination with VM record & replay}}; (2) {{Panorama}}.
  * In a custom VM, both OS and applications run under taint tracking, giving us an easy to way to track {{data moving between processes}}.  

* If a malware author wanted to defeat this taint checking, what ideas seem promising for confusing the analysis?
  1. timing arithmetic operations to see if the machine is unusually slow. Answer: {{Potentially, because taint checking often occurs in a VM, where operations are slower. The malware can use longer arithmeic operations as a warning not to run, because it might be in a VM. Virus detectors can counter this by configuring the internal clock of emulators to fib about the time it takes to do operations, though.}}
  2. computing the hash of the malware’s machine code and comparing it to a known value {{Not promising. It's possible to taint track an executable without modifying that executable's code, through things like hooking system calls.}}
  3. changing `x = y` to `switch (x) { case 1: y = 1; break; case 2: ...}` {{This is a very promising option. The taint engine sees that the control flow depends on tainted `y`, but the values that are ultimately assigned are untainted constants. This breaks the taint chain.}}
  4. changing `x = y` to `x = z + y; x = x − z;` {{This is a promising option used by real malware authors to throw off malware analysis. In this strategy, `z` is a value that is always tainted (maybe through a legitimate input), so the taint engine always marks it as tainted. The malware author uses this to taint every single value, even irrelevant ones. This makes it impossible to know if `x` has been tainted by something important or something trivial}}.

## 🛡️ Tigress: Anti–Taint Analysis Transformation
* To disrupt taint-tracking, Tigress exploits the fact that many taint systems track explicit flows* but ignore implicit flows.
  * Example: Instead of assigning one variable another variable's numeric value (ex. `x = y` where `y` is tainted), Tigress {{counts up to that value instead (ex. `while (x < y) x++`). `x` ends up equal to `y`, but taint engines see only loop control, not "tainted dataflow"}}.
  * Example: instead of assigning one variable to another variable, Tigress can also copy the variable {{bit-by-bit via conditionals}}.
    ```c
    x = 0;
    for (i = 0; i < 32; i++)
        if (y & (1 << i)) x |= (1 << i);
    ```
* {{TaintDroid}} is an information‑flow tracking system for Android, designed to be efficient enough for smartphones. It's used to track how sensitive data (ex. location, phone number, etc.) flows through apps, and flag when the app misbehaves. Designed to be efficient enough for smartphones.