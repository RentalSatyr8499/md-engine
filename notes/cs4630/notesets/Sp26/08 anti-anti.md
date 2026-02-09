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
* 