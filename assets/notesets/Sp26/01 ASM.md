* In AT&T syntax, the {{destination}} is last, constants start with {{$}}, and registers start with {{%}}.
    * Operand lengths: q = 8; l = 4; w = 2; b = 1
* What operation does  `leaq (%rax,%rax,4), %rax`  perform? {{multiplies `%rax` by 5}}

```
    movq $0x123456789abcdef, %rax
    xor %eax, %eax
```
![image](./assets/images/image.png)