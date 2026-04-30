* No practical tool is able to achieve both *soundness* and *completeness* at scale.
    * An analysis is {{complete}} if it finds all true positives. Examples we've seen son far are: {{greybox fuzzing, symbolic exec without approximations}}
    * An analysis is {{sound}} if it never reports false positives. Examples that we've so far are: {{symbolic exec without approximations}}
* "Points-to analysis": assigns each allocation an ID and tracks which IDs each pointer may refer to. At merge points, the analysis takes the union of possible targets. 
    * When it comes to handling conditionals and branching, there are two ways to handle it with points-analysis. Fill out the table below.
        1. Track each path separately. The upside is that this is precise, but the downside is that it leads to exponential path explosion.
        2. Merge sets of possible values. The upside is that this is scalable, but the downside is that it is imprecise.
    * Analysis implementations fall on a spectrum from high false-positive to high false-negative. 
        * An analysis that assumes a pointer may refer to anything of the right type is high false-positive.
        * An analysis that assumes a pointer refers to nothing unless proven otherwise is high false-negative.
 

# Exercises
```c
void example(int a) {
    int *p;
    int *q;
    q = malloc(...);
    p = malloc(...);
    // (A)
    if (a > 0) {
        // (A1)
        p = q;
    }
    // (B)
    free(p);
    // (C)
    ...
}
```
* Exercise: Consider the code above. What should state of pointer q be at C? Answer: {{D}}
    * A. allocated 
    * B. freed
    * C. allocated if and only if reached via path with A1
    * D. freed if and only if reached via path with A1
```c
void someFunction() {
    int *quux = malloc(sizeof(int));
    ...
    // A
    do {
        // B
        ...
        if (anotherFunction()) {
            free(quux);
            // C
        }
        ...
        // D
    } while (complexFunction());
    ...
    // E
    *quux++;
    ...
}
```
* Exercise: Consider the code above. 
    * What path(s), if any, could the code follow to trigger a use-after-free? Answer: {{A, B, C, D, E}}
    * What path(s), if any, could the code follow to trigger a double free? Answer: {{A, B, C, D, C, D...}}
* Exercise: For each of following code snippets, what classic programmer error could a compiler identify using a "common bug" pattern?
    * `struct foo \*p = malloc(sizeof(struct foo*));` {{it should be `sizeof(struct foo*)`, not `sizeof(struct foo)`}}
    * `long *p = malloc(16 * sizeof(int));` {{it should be `sizeof(long)`, not `sizeof(int)`}}
    * strncat(foo, bar, sizeof(foo)); {{we need the size of the string `foo` points to, not the size of the `foo` pointer itself. so `sizeof(foo)` is wrong}}
    * And for the code snippet below: {{We assigned stack memory to the global pointer and also returned a pointer to stack memory, which will be overwritten as soon as `foo` returns}}
```c
int *global;
int *foo() {
    int x;
    int *p = &x;
    ...
    global = p; 
    return p;
}
```