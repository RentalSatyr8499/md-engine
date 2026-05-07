* "Static signatures": {{looking at bytes and code without running the malware}}.
    * For example, antiviruses sometimes use {{signatures of known malware}} to quickly scan executables for malware presence.
* "Behavioral signatures": {{detecting malware by watching what it does at runtime}}.
* Write regex for the following:
    * Match exactly the string `foo`: {{`foo`}}
    * Metacharacters like `+` have special meaning unless escaped. Match exactly the string `C++`: {{`C\+\+`}}
    * Match any one character that is a lowercase letter from `b` through `f`, or the letter `i`:  {{`[b-fi]`}}
    * Match any one character that is *not* `b` through `f`, nor `i`: {{`[^b-fi]`}}
    * (Weird rule) match any single character except newline: {{`.`}}
    * Match any single character including newline: {{`(.|\n)`}}
    * Match zero or more `a` characters: {{`a*`}}
    * Match between three and five `a` characters: {{`a{3,5}`}}
    * Match between three and five repetitions of `abc`: {{`(abc){3,5}`}}
    * Match either `ab` or `cd`: {{`ab|cd`}}
    * Match exactly two occurrences of either `ab` or `cd` in sequence (`abab`, `abcd`, `cdab`, `cdcd`): {{`(ab|cd){2}`}}
    * Match the byte with hex value `AB`: `{{\xAB}}`
    * Match the byte with hex value `00`: `{{\x00}}`
    * Match any word ending in `ing` (letters only before `ing`): {{`[a-zA-Z]*ing`}}
* flex is a program generator tool that {{takes regular expressions and generates a C function called `yylex()`}}. flex files (`.l` files) have three sections separated by `%%`.
    * The first section contains{{ variable declarations for later C code or regexpressions (`int num_bytes = 0` or `LOWERS   [a-z]`)}}.
    * The second section contains {{rules of the format `REGEX    { C code to run when that regex matches}`}}. In this section, {{`yytext`}} can be used to refer to the text of the matched thing.
    * The third section contains {{your C code to run at the end, such as printing the result}}.

```
%{
int num_bytes = 0, num_lines = 0;
int num_foos = 0;
%}

%%

foo        { num_bytes += 3; num_foos += 1; }
.          { num_bytes += 1; }
\n         { num_lines += 1; num_bytes += 1; }

%%

int main(void) {
    yylex();
    printf("%d bytes, %d lines, %d foos\n",
           num_bytes, num_lines, num_foos);
}

```
* %%invis%%
   * flex does not interpret regexes at runtime, but rather, it parses the regexes, builds a {{state machine}}, and then generates C code that implements that state machine as a giant switch statement. Example for the pattern "foo": `start → f → fo → foo`. If the next character doesn’t match, the machine {{transitions to a fallback state (often “start” or “other”)}}.
    * The benefit of this implementation is that it reads one character at a time, never rewinds the file, and never rescans characters. It's very fast.
* Two obstacles virus scanners face, and how they solve them: 
    * Too many state machines for different viruses require unreasonable storage. Fix: {{extract short, distinctive fixed substrings (“anchors”) from each malware signature, hash them, and scan for those in a preliminary scan}}.
    * Even if matching is fast, reading the entire file is expensive. Fix: {{check only the entry point, the end of the file, and/or known offsets relative to the entry point}}.
* One way to detect new malware is by looking analyzing executable formats/structure to see if it's been tampered with. This includes but isn't limited to:
    * Being suspicious if the entry point is in {{the last segment}}. This could be evaded by virus writers by...
        * Leaving the entry point alone, and {{jumping from the entry point to the viral code}} instead. But this could be detected yet again by {{running the code in VM and seeing if it immediately switches segment}}.
        * Or just adding viral code to {{first segment}} instead.
    * Checking to see if the header has been tampered with (ex. {{sizes used by linker but not loader disagree}}, {{section names don't match usage}})
* Many virus scanners look for suspicious API calls (`CreateRemoteThread` or `WriteProcessMemory`). So malware authors try to avoid {{leaving these names visible in the binary}}. Three possible strategies include:
    * Add new entries to dynamic linking tables (IAT).
    * Reimplement {{the library call manually (instead of calling `CreateFileA`, manually invoke the underlying system call)}}.
    * Instead of storing "LoadLibraryA" as a string, store {{a hash of it}} instead, then {{scan the list of functions for that name at runtime}}. This is the most common and practical technique. 
* The basic idea behind behavior-based detection is running the suspicious file on {{a VM}}, and seeing if it does stuff that legitimate programs wouldn't do, like {{modifying system files, modifying existing executables, open network connections to lots of random places}}. One way we can detect this stuff is by {{hooking system calls}}, specifically with any of the following strategies: 
    * Using features that come with the OS designed for this exact thing, like Linux BPF.
    * Change {{library loading (e.g. replace ‘open’, ‘fopen’, etc. in libraries)}}. But the drawback is that {{not everything uses library functions}}.
    * Replace {{OS exception (system call)}} handlers by editing {{the OS data structure that tells hardware where program requests go to point to your own code}}. Drawback: {{very OS version dependent}}.

# Exercises
* Fill out the pros and cons of various heurestic detection strategies for the Vienna Virus:
| targeted signature | pros | cons |
|----------------|------|------|
| vienna's actual payload (except relocation logic) | {{strong true positive}} | {{easy to break (just introduce small variants)}} |
| `jmp` to end | {{extremely fast/compact}} | {{high false positives (legit programs jump at start) and negatives (virus can move/remove jump)}} |
| self-replication code (ex. directory scan) | {{more stable across variants}} |  {{larger signature}} |
| finish code (`push` then `ret`) | {{compact, fast, stable across variants}} | {{easy for virus writers to change once known}}|
* Suppose we have a pattern for a Vienna-like virus. Which of the following is going to be easiest/hardest to change the pattern for? Answer: {{C is easiest, D is hardest}}.
    * A. inserting random number of nops every 8 non-nop instructions of virus code
    * B. replacing code at random offset in executable instead of appending
    * C. registers used for temporaries in virus code chosen at random each time the virus copies itself
    * D. instead of appending all the virus code, virus code now split between cavities with a "loader" appended (the "loader" reforms code from the cavities and jumps to them)