* Define the following: 
    * armored viruses: viruses designed to make analysis harder
    * metamorphic:
    * polymorphic:
    * oligomorphic
    * obfuscating: making your code more convulated to make analysis more difficult
* Tigress is a tool that {{obsfucates code}}. Some strategies it uses are: 
    * EncodeLiterals: {{load string literals character-by-character so they don't appear in the binary, e.g. instead of `Hello World` do `buffer[0] = 'H'; buffer[1] = 'e'; buffer[2] = 'l'; ...;`}}
    * Merge: {{merging multiple functions into one big switch statement to make readability harder}}
    * Split: {{splitting a function into multiple to make semantics more difficult to understand}}
    * Flatten: {{collapses all the logic (loops, conditionals) into a giant switch statement}}.

* Of the following, kind of analysis does obfuscation slow down the most (answer: {{C}})? The least (answer: {{A}})?
    * A. determining what remote servers some malware contacts
    * B. determining a password the malware requires to access extra functionality
    * C. accessing extra functionality in the malware protected by a password
    * D. determining whether the malware will behave differently based on the time

* A common obstacle malware writers run into is trading one kind of "signature" (giveaway) for another. For example, if they store hashes of strings instead of strings themselves, virus scanners can simply {{search for the hashes instead}}. If they encrypt the hashes using XOR, then virus scanned can {{scan for the decryption logic which is really distinct}}.

* Thinking of some anti-decrypter strategies for Cascade, which of the following strategies most practical (answer: {{C}})? Least practical (answer: {{D}})?
    * A. matching patterns of decrypted malware code in memory while executables are running
    * B. marking executables with too much random-looking data in them
    * C. matching the decrypter in a normal signature scan
    * D. trying every possible ‘key’ for decryption on every executable and matching decrypted malware code against it

* The downside of using simple, static decrypters is that {{the decrypter itself becomes a signature}}. Malware authors get around this by {{generating so many different decrypter variants that no single signature matches reliably}}. This type of malware is called {{oligomorphic}}. On each infection, the {{payload}} remains encrypted, but the decrypter generator produces a fresh decryptor. This is achieved by... 
    * inserting random {{NOPs}}
    * swapping {{synonym instructions}}, 
    * adding random instructions that manipulate {{unused registers}}
* {{Polymorphic}} viruses are more advanced that oligomorphic viruses in that {{there are way more decryptor variants}}. 
    * For example, the famous 1260 polymorphic virus...
        * Randomized {{register}} usage
        * Random insertion of {{NOPs}} and other do‑nothing instructions like {{arithmetic on unused registers}}.
        * Reordering of {{setup instructions}}.
        * Multiple possible {{decryptor loop bodies}}.
        * Randomized “key” values used in XOR decryption.
    * Polymorphic malware uses a {{mutation engine}} to generate new decryptors.

  ```c
  CopyDecrypter(original_code, new_code) {
      for (each instruction in original_code) {
          new_code += RandomNumberOfNops();
          new_code += PossiblyChooseVariant(instruction);
      }
  }
  ```

* A packer is a program that stores an executable in {{compressed or encoded}} form, then {{decodes and runs it}} at runtime. Malware uses this mechanism to hide code, but the underlying technique is often used for legitimate purposes, for example {{UPX, a compression program}}.
    * The simplest way to defeat a self-decrypting binary is to {{let it decrypt itself}}. 
    * Antivirus engines achieve this by emulatating execution until the instruction pointer enters a {{modified memory region}}. Then they {{dump memory}} to extract the decrypted code. Example tool: {{unipacker}}.
    * Using this strategy, you don't have to worry about understanding the {{encryption}} algorithm, extracting the {{key}}, etc.
* Unicorn is a {{CPU emulator}}.
```
code = Path('test.bin').read_bytes()
uc = Uc(UC_ARCH_X86, UC_MODE_64)

uc.mem_map(0x10000, 1024 * 1024)
uc.mem_write(0x10000, code)
uc.hook_add(UC_HOOK_CODE, hook_code_func)
uc.emu_start(0x10000, 0x10000 + len(code))
```
# left off on 47


