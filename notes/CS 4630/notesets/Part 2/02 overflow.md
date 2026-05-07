* Historically, the most common vulnerability class is {{buffer overflows}}. Hopefully you know how they work.

```c
int GradeAssignment(FILE *in) {
    int scores[10]; char buffer[16];
    for (int i = 0; i < 10; ++i) {
        gets(buffer);
        scores[i] =
        GradeAnswer(buffer, i);
    }
    Process(scores);
}
```

```
GradeAssignment:
    pushq %rbp
    pushq %rbx
    xorl %ebx, %ebx
    subq $72, %rsp
    leaq 8(%rsp), %rbp
for_loop:
    movq %rbp, %rdi
    call gets
    movl %ebx, %esi
    movq %rbp, %rdi
    call GradeAnswer
    leaq 24(%rsp), %rdi
    movl %eax, (%rdi,%rbx,4)
    incq %rbx
    cmpq $10, %rbx
    jne for_loop
    callProcess
```
Exercise: 
* How many bytes after `buffer[0]` is the first byte of `scores[0]`? Answer: {{16 bytes, because `scores` starts at `%rsp+24` (`leaq 24(%rsp), %rdi`), and `buffer` starts at `%rsp+8` (`leaq 8(%rsp), %rbp`)}}.
* If input into `buffer` is 50 copies of the character '1', which has an ASCII value of 49 in decimal, what is value of scores[0]? Answer: {{`0x31313131`, because `size[0]` holds one `sizeof(int)` = 4 bytes worth of data}}.