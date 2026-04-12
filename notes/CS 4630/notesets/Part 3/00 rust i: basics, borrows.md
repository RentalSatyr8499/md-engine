* With programming languages, there is always a tension between safety and performance. Fill out the table below. 
| language | upside(s) | drawback |
|----------|--------|----------|
|C/C++| l{{ets you get close to the machine and write high-performance software}} | {{horrible for security}} |
|"safe languages" (Python)|{{much more secure}}| {{can't optimize performance/get close to the machine, due to garbage collection overhead, array checking overhead, etc.}}|
|Java|considered secure, and provides a class called `com.sun.Unsafe` that allows for {{low-level memory manipulation}}|{{Java `Unsafe` is hard to integrate with normal Java objects, easy to create dangling pointers with, etc.}}|
* Rust strikes the middle ground between C/C++ and safe languages. It enforces no dangling pointers, no out‑of‑bounds access, and no data races. But it also provides unsafe { ... } blocks, raw pointers, and low‑level libraries.

* Simple Rust syntax
    * Declare a function with the {{`fn`}} keyword
    * Print "Hello, {name}!" where `name` is a variable: {{`println!("Hello, {}!", name);`}}
    * If there's no `return` statement, the {{last expression}} is automatically returned
    * Write a function that multiplies its input by 2:{{ `fn timesTwo(number: i32) -> i32 { number * 2 }`}}
    * Declare a 32‑bit signed integer using type {{`i32`}}
    * Declare a 32‑bit unsigned integer using type {{`u32`}}
    * Rust objects
        * Implement methods for a struct using the {{`impl`}} keyword
        * Call `method()` on a struct named `instance`: {{`instance.method()`}}
        * A trait is a collection of method signatures that a type can implement. They're like Java interfaces. To implement a trait for a type, use {{`impl TraitName for Type { ... }`}}
        * Automatically generate the code for traits: {{`#[derive(Trait1, Trait2,...)]`}}
    * Mutable and immutable variables
        * Declare an immutable variable x as 1: {{`let x = 1;`}}
        * Declare a mutable variable y as 1: use{{ `let mut y = 1;`}}
        * To define a method within a struct that mutates the struct, pass in {{`&mut self`}} as a parameter.
        * To dereference a mutable reference, use {{`*reference`}}
    * Rust modules
        * Import items from a `std::io`: {{`use std::io;`}}
        * Use the `stdin()` method from the `std::io` module: {{`std::io::stdin()`}}
    * Vectors
        * Declare an immutable vector of unsigned integers 1, 2, and 3: {{`let vector: Vec<u32> = vec![1, 2, 3];`}}
        * Iterate over references to in a vector object named `myVector`: {{`for x in &myVector { ... }`}}
* Rust makes it so that an object can be owned by {{one (and only one!)}} owner(s) at a time.
    * Move ownership of `foo` into a function named `bar()`: {{automatically occurs when you pass by value (`bar(foo)`)}}
    * Clone a `foo` into `bar()` to avoid moving it: {{`bar(foo.clone());`}}
    * To return ownership from a function, include the value in {{a returned tuple}}.
* Under the Rust ownership model, an object can have multiple readers at a time, but only ever one writer at a time. Specifically, an object can either have {{any number of immutable borrows}} or {{exactly one mutable borrow}}, but never both at the same time.
    * Allow multiple immutable borrows: {{use `&T` references}}.
    * Allow exactly one mutable borrow: {{use a `&mut T` reference}}.
* By default, Rust automatically assumes that borrows lasts all the way until {{the end of the function}}. To end the scope of a borrow earlier (before the end of a function), use {{brackets `{}`}}. 


# Exercises
![alt text](image7.png){size=medium}
* Exercise: Consider the snippets above. If `foo` is called like `p = foo(p)`, which snippet does *not* follow the single-owner rule? Answer: {{C}}
```Rust
let mut x = 42; // (1)
let p = &mut x; // (2)
*p = 10; // (3)
println!("{}", x); // (4)
```
* Exercise: Consider the above code. 
    * Who owns x on line 1? {{`x`}}
    * Who owns x on line 2? {{`p`}}
    * Who owns x on line 3? {{`p`}}
    * Who owns x on line 4? {{`x`}}
```Rust
let x = vec![vec![1],vec![2]]; // 1
let y = &mut x[0]; // 2
let z = &mut y[0]; // 3
y.push(4); // 4
x.push(vec![4]); // 5
*z += 1; // 6
y.push(5); // 7
```
* Exercise: Consider the above code. 
    * What compile errors will it cause? Answer: {{Lines 5 and 7 cause errors because they attempt to modify values while those values are in live mutable borrows.}}
    * Without looking below, how can we fix the code so that it doesn't compile with errors, but still gives the same result? (answer in below code snippet)
```Rust
let mut x = vec![vec![1], vec![2]];
{
    let y = &mut x[0];
    let z = &mut y[0];
    *z += 1; 
} // z and y end here
x.push(vec![4]);
{
    let y = &mut x[0];
    y.push(4);
    y.push(5);
}
```
```Rust
let mut x = 42;   // (1)
let p = &mut x;   // (2)
*p = 10;          // (3)
println!("{}", x); // (4)
*p = 11;          // (5)
```
* Exercise: Consider the Rust code above. Rust refuses to compile it because {{`x` is being used while it's still borrowed by `p`}}. Which changes would avoid this problem?
    * use `*p` in the `println!`: {{`Y`}}
    * make `p` mutable, reassign `p = &mut x` after line (4): {{`N`}}
    * take a non-mutable reference to `x` instead of a mutable one: {{`Y`}}
```
let first_elem = &vector[0]; 
append1(&mut vector);
```
* Exercise: Is the code above allowed in Rust? If not, why, and why did Rust make that design choice? Answer: {{This is not allowed, because an immutable borrow is followed by a mutable borrow. By prohibiting this, Rust prevents danging pointer.}}
```
let first_elem = &mut vector[0];
```
* Exercise: Is the code above allowed in Rust? If not, why? Answer: {{This is not allowed. Even though these are different elements, Rust conservatively treats the whole vector as one object.}}
