* "{{Fuzzing}}" is a technique for testing the security of a program that involves generating a lot of random inputs and then looking for memory errors. The pros of this technique are: {{helps us identify "unrealistic" or unexpected inputs an attacker could use to exploit the program}}. 
* There are different kinds of fuzzing. Fill out the table below. 
|name|what does this technique involve?|pros|cons|
|----|---------------------------------|----|----|
|blackbox fuzzing|{{randomly mutate existing (known valid) inputs and observe whether the program crashes or not}}|{{works without needing to modify the software; doesn't require understanding internal mechanics}}|{{poor completeness; random mutations rarely reach interesting paths}}|
|coverage-guided fuzzing|{{only keeps test cases if it hits new logical branches in the code}}|{{improves completeness of test cases}}|{{still fundamentally random; cannot solve branch conditions}}|
* In general, fuzzing comes with challenges. Fill out the table below.
|challenge|describe it|ways around this challenge|
|---------|------------|--------------------------|
|"isolation"|{{need reproducible test cases, need to distinguish between a true hang and a machine that’s just "randomly slow"}}|n/a|
|"speed"|{{fuzzing requires millions of tests}}|{{parallelize. This is possible with black-box testing}}|
|"completeness"|{{even with millions of tests, you might still not be lucky enough to hit "interesting inputs"}}|{{smart fuzzing, which biases random inputs toward exploring new behavior}}|
* An example of a fuzzer that uses coverage-based fuzzing, also called {{white}}box fuzzing, is {{American Fuzzy Lop (AFL)}}.

# Exercises
```c
void foo(unsigned a, unsigned b, unsigned c) {
    if (a != 0) {
        b −= c; // W
    }
    if (b < 5) {
        if (a > c) {
            a += b; // X
        }
        b += 4; // Y
    } else {
        a += 1; // Z
    }
    assert(a + b != 7);
}
```
* Exercise: Consider the code above. Suppose we have an initial test case: {a = 0x17, b = 0x08, c = 0x00} that covers WZ. Fill out the table below.
|test case|covered branches|do we keep the test case?|
|---------|----------------|---------------|
|a = `0x37`, b = `0x08`, c = `0x00` | {{WZ}} | {{`N`}}|
|a = `0x15`, b = `0x08`, c = `0x02` | {{WZ}} | {{`N`}}|
|a = `0x17`, b = `0x00`, c = `0x01` | {{WXY}} | {{`Y`}}|
|a = `0x37`, b = `0x09`, c = `0x00` | {{WZ}} | {{`N`}}|
|a = `0x17`, b = `0x00`, c = `0x81` | {{WY}} | {{`Y`}}|
```c
void example1(int a, int b) {
    if (a < 4 && b < 4 && a == b) {
        assert(a + b != 6);
    }
}
void example2(int a, int b) {
    assert(a != 10325);
}
void example3(int a, int b) {
    assert(a != 10325 && b != 10543);
}
```
* Exercise: Consider the code above.
    * Which function is most suited towards fuzzing over random testing? {{`example1()`}}
    * Which function is least suited towards fuzzing over random testing? {{`example2()`}}