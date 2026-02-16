* Fill in the blank!
| file extension | what is it used for? | language |
|----------|----------|----------|
| `.c`    | {{C source code}}   | {{C}}   |
| `.h`    | {{C header file}}   |  {{C}}   |
| `.s`    | {{assembly file}}   |  {{assembly}}   |
| `.asm`    | {{assembly file}}   |  {{assembly}}   |
| `.o`    | {{object file}}   |  {{binary}}   |
| `.exe`    | {{executable file}}   |  {{binary}}   |
| none   | {{executable file}}   |  {{binary}}   |
| `.a`   | {{statically linked library (collection of .o files)}}   |  binary  |
| `.lib`   | {{statically linked library (collection of .o files)}}   |  binary  |
| `.so`   | {{dynamically linked library}}   |  binary   |
| `.dll`   | {{dynamically linked library}}   | binary   |
| `.dylib`   | {{dynamically linked library}}   |  binary   |

* Define "static library": {{functions "embedded into an executable when it is linked"}}. The steps to using a static library are: 
    1. Create it using {{`ar rcs`}}. For example, if the name of your library is `foo`, and it includes `file1.o` and `file2.o`, the command would be: `ar rcs {{libfoo.a}} {{file1.o file2.o}}`.
    2. When {{compiling your executable}}, put it in the command. For example, if the name of your library is `foo`, and it's located at `-L/path/to/lib`, the compilation command for your program would look like: `clang -o myProgram {{-L/path/to/lib}} {{-lfoo}}`. 
        * You don't need the path if {{the standard library is in the standard location}}.
* Define dynamic libraries: {{"loaded from the library file while an executable is running"}}. The steps to using a dynamic library are: 
    1. Compile `.o` files with {{`-fPIC`}}. For example, if your library includes `file1.o` and `file2.o`, you'd need to compiled both of those with {{`-fPIC`}}.
    2. Create the library using a normal C compiler and the {{`-shared`}} flag. For example, if the name of your library is `foo`, and it includes `file1.o` and `file2.o`, the command would be: `clang {{-shared}} -o {{libfoo.so}} {{file1.o file2.o}}`.
    3. To use your dynamic library, tell the compiler where to find it at compilation time. For example, if the name of your library is `foo`, and it's located at `-L/path/to/lib`, the compilation command for your program would look like: `clang -o exec main.o {{-L/path/to/lib}} {{-lfoo}}`.
    4. When *running* the executable, you must also tell it where to find the `.so` file. There are two ways to set the runtime path:
        * Specify an rpath at link time. For example, `clang -o exec main.o {{-Wl,-rpath,L/path/to/lib}}`
        * Set the `LD_LIBRARY_PATH` environment variable before running the program.

Exercise:
```
a.c:
void foo() { puts("A"); }

b.c:
void foo() { puts("B"); }

main.c:
int main() {foo();}

in terminal:
$ clang -c main.c -o main.o
$ clang -c a.c -o a.o
$ ar rcs libfoo.a a.o
$ clang main.o -L. -lfoo -o program
$ ./program
A
$ rm libfoo.a
$ clang -c b.c -o b.o
$ ar rcs libfoo.a b.o
$ ./program
```
This last line will output {{`A`}}, because {{static linking embeds the code into the executable, and you never rebuilt the executable after replacing the library}}.

* When you run `make` with no other parameters, the {{first}} rule in the `Makefile` is always executed.
    * `make` runs the command if and only if {{any prerequisite has been modified more recently than the target}}. Before doing this, it first ensures {{all prereqs are up to date}}.
    * If you have a target that isn't actually a file, like `all` or `clean`, it's best practice to {{declare it as a `.PHONY` target}}.
    * We can use macros to "allow easy swapping out of different compilers, compilation flags, etc" (ex. `CC = gcc` or `LDFLAGS = -Wall -pedantic -fsanitize=address`).  The syntax to use a macro is {{`$(MACRO_NAME)`}}.
    * We can automatic variables and pattern rules to make writing build rules easier, too:

| rule | usage |
|----------|----------|
| `$@`    | {{target}}   |
| `$<`    | {{first dependency}}   |
| `$^`    | {{all dependencies}}   |
| `%foo`    | {{anything ending in `foo`}}   |

