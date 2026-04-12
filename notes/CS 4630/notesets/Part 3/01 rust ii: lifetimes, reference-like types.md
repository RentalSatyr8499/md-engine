* The Rust compiler doesn't allow for {{dangling pointers or race conditions}} by checking for stuff like returning local variable, storing a reference somewhere that outlives the referent, mutating something while an immutable reference, or having two mutable references at once.
* Rust prevent references from outliving the data they refer to by keeping tracking of {{lifetimes}}. 
    * Lifetime annotation example: Consider the method header `fn get_first_matching<'a, 'b>(prefix: &'a str, values: &'b Vec<String>) -> &'b String`. This tells Rust:
        * `prefix` lives for {{`'a`}}
        * {{`values` and the returned string}} live for `'b`
        * The returned reference is tied to {{`values`}}
* Rust has a `Drop` trait that lets you define what happens when {{a value goes out of scope}}.
* {{`Box<T>`}} is Rust’s simplest heap‑owning type.
    * {{`Box::new(value)`}} allocates on the heap.
    * When the `Box` is dropped, {{the heap memory is freed}}.
    * Moving a `Box` transfers {{ownership of the heap allocation}}.
* Rust allows you to bypass the borrow checker using `unsafe{}`. The only way to dereference a raw pointer is {{inside an `unsafe{}` block}}, but if you do so, you no longer have Rust's safety protections (you can create bugs like {{dangling pointers}} this way).
* Rust normally enforces borrowing rules at compile time. But sometimes you need patterns the compiler can’t reason about, like graphs, trees with parent pointers, GUI widgets etc. So Rust provides an "escape hatch", meaning you can build your own "reference-like" types that enforce the rules at {{run}}time instead of {{compile}} time. Two simple examples of such reference-like types are `Rc<T>` and `RefCell<T>`.
    * `Rc<T>` gives you *shared ownership* of immutable data. Under this model, data is simply dropped when the last owner is freed.
        * {{Cloning an `Rc<T>`}} increments a reference count.
        * {{Dropping an `Rc<T>`}} decrements it.
        * When the count hits zero, {{the inner value is dropped}}. Rust preventing you from using a reference after {{the last `Rc` is dropped}}.
        * `Weak<T>` is a non‑owning reference to an `Rc<T>`. It does not increment the {{strong count}} and it does not {{keep the value alive}}.
    * `RefCell<T>` is the analogue of `&T` and `&mut T` that enforces borrowing rules at runtime instead of compile time.
        * Use the {{`borrow()`}} method for an immutable borrow
        * Use the {{`borrow_mut()`}} for a mutable borrow
        * Violations cause a {{panic}}, not a compile error.
* `Rc<T>` is useful, but it's not thread‑safe, meaning {{it doesn't always generate correct behavior under concurrency}}. Its thread-safe alternative is {{`Arc<T>`}}.
    *  In Rust, if a type has the `Send` marker trait, it can {{be moved to and from another thread}}.
    * If a type has the `Sync` marker trait, it can {{be shared between threads}}.
    * Arc<T> has both the `Send` and `Sync` marker traits.
* "Zero-overhead philosophy": Rust’s default rules (`&T` and `&mut T`) have zero runtime overhead. But features like {{`Rc<T>`, `RefCell<T>`, `Mutex<T>`, and `Arc<T>`}} are not zero‑overhead. As a design choice, Rust lets you choose them only when needed.

# Exercises
```Rust
struct vec { int *data; int size; };
void append1(struct vec *v) {
    v.data = realloc(v.data, sizeof(int) * (v.size + 1));
    v.data[v.size] = 1;
    v.size += 1;
}
void foo() {
    struct vec vector;
    vector.data = malloc(sizeof(int) * 3);
    vector.data[0] = 1; vector.data[1] = 2; vector.data[2] = 3;
    vector.size = 3;
    int *first_elem = &vector.data[0];
    printf("*first_elem is %d\n", *first_elem);
    append1(&vector);
    printf("*first_elem is %d\n", *first_elem);
}
```
* Exercise: Consider the code above. What is the bug? {{`first_elem` becomes a dangling pointer after realloc potentially moves the vector’s data. Using it afterward is undefined behavior.}}
```Rust
#[derive(Clone)] struct Example {}
impl Drop for Example {
    fn drop(&mut self) {
    printl  n!("in drop")
    }
}
fn main() {
    let q: Example;
    {
        let t = Example {};
        println!("A");
        q = t.clone();
    }
    println!("B");
}
```
* Exercise: Consider the above code. What will it print? Answer: {{A(newline)in drop(newline)B(newline)in drop}}
```Rust 
use std::rc::Rc;

fn main() {
let s_ref: &String;
let s1: Rc<String>;
{
    let s2: Rc<String> = Rc::new(String::from("example"));
    s1 = Rc::clone(&s2);
    s_ref = &*s1;
    println!("{s1} {s_ref} {s2}"); // line I
    println!("count={}", Rc::strong_count(&s1)); // line II
}
println!("count={}", Rc::strong_count(&s1)); // line 3
println!("{s1} {s_ref}"); // line 4
}
```
* Exercise: Consider the above code. Fill out the table below.
| line | what will it print? |
|------|---------------------|
| line 1| {{example example example}} |
| line 2| {{count=2}} |
| line 3| {{count=1}} |
| line 4| {{example example}} |

```Rust
fn myadd(x: &RefCell<i32>, y: &RefCell<i32>, z: &RefCell<i32>) {
    let mut x_value = x.borrow_mut();
    let y_value = y.borrow();
    let z_value = z.borrow();
    *x_value += *y_value;
    *x_value += *z_value;
    println!("{}, {}, {}", x_value, y_value, z_value);
}
fn main() {
    let x: RefCell<i32> = RefCell::new(1);
    let y: RefCell<i32> = RefCell::new(2);
    let z: RefCell<i32> = RefCell::new(3);
    myadd(&x, &y, &z); // line I
    myadd(&x, &y, &y); // line II
    myadd(&x, &x, &x); // line III
}
```
* Exercise: Consider the above code. Fill out the table below.
| line | what will it print? |
|------|---------------------|
| line I| {{"6, 2, 3"}} |
| line II| {{"10, 2, 2"}} |
| line III| {{runtime error}} |
* Exercise: 
    * Consider the following list of Rust smart pointers. 
        * `Rc`, `Arc`: reference counting
        * `RefCell`: borrowing rules, but enforced at runtime
        * `Weak`: works with Rc, but doesn't contribute to count
        * `Mutex`: ensures one-at-a-time execution with multi-core processes
    * Say I have flight reservation system with Flight objects that have references to Ticket objects and vice-versa, and Customer objects that have references to Ticket objects and vice-versa. Which smart pointers should I use? {{`Rc` and `Weak`}}