* SQL is a declarative language: it says {{what}} data to get. Relational algebra (RA) is a procedural language: it says {{how}} to get the data.
    * When a DBMS processes a query, the SQL is translated into an RA tree (the logical plan), and after some optimizations the RA tree is converted into machine instructions (the physical plan).
    * In an RA tree, tuples flow up from the data source at the bottom to the query output at the top, getting filtered and modified along the way.
    * Every operator takes one (unary) or two (binary) relations as inputs, and every operator outputs a relation.
* RA operator categories:
| kind | operators | what they do |
|---|---|---|
| Unary (one relation in, one out) | Selection `σ`, Projection `π`, Rename `ρ` | Remove parts of a relation, or change its schema |
| Binary (two relations in, one out) | Union `∪`, Intersection `∩`, Set difference `−`, Cartesian product `×`, Natural join `⋈`, Division `÷` | Combine the tuples of two relations |
| Additional | Assignment `←`, Aggregate functions `G` | Expressiveness and extended operations |
* Selection `σ`: unary, returns all tuples that satisfy a condition. Conditions use `=`, `<`, `≤`, `>`, `≥`, `<>` combined with `AND`, `OR`, `NOT`.
    * Syntax: {{`σ_C(R)`}} where `C` is a set of conditions on the attributes of `R`.
    * `WHERE` and `HAVING` use the same selection operator `σ`.
    * There is no wildcard in RA.
    * Ex. tuples with Minnie as TA in a Database Systems course: {{`σ_TA='Minnie' AND Course='Database Systems'(Student_lecture)`}}
    * Ex. CS 2910 classes in the Schedule relation: {{`σ_Dept='CS' AND Course=2910(Schedule)`}} (assume Course is stored as an integer)
* Projection `π`: unary, returns a new relation with only the specified attributes.
    * Syntax: {{`π_A1, A2, ..., Am(R)`}}
    * Identical tuples collapse into a single tuple: RA follows set semantics, so there are no duplicates.
    * Ex. all `S_id` and `Course`: {{`π_S_id, Course(Student_lecture)`}}
    * Ex. all TAs: {{`π_TA(Student_lecture)`}} gives Minnie, Humpty, Dumpty, Mickey, with Minnie appearing only once.
    * Ex. departments and courses taught by up3f: {{`π_Dept, Course(σ_computingID='up3f'(Schedule))`}} (no duplicates in the output)
* Renaming `ρ`: unary, changes the schema, not the instance.
    * Syntax: {{`ρ_R'(B1, B2, ..., Bn)(R)`}} renames the result of expression `R` to `R'` and its attributes to `B1` through `Bn`.
    * Ex. {{`ρ_friend_contact(ID, primary_email, alternative_email)(contact)`}}
* Union, intersection, and difference are binary operations with three requirements: the schemas of `R` and `S` must have the same degree (number of attributes), corresponding attributes must be based on the same domain or compatible data types, and attributes must be in the same order.
    * Union `R ∪ S`: each tuple of `R` and each tuple of `S` goes into the result ("or").
    * Intersection `R ∩ S`: a tuple is in the result if and only if it is in both `R` and `S` ("and").
    * Difference `R − S`: a tuple is in the result if and only if it is in `R` but not in `S`.
    * Ex. departments and courses taught by up3f or nb3f (or both): {{`π_Dept, Course(σ_computingID='up3f'(Schedule)) ∪ π_Dept, Course(σ_computingID='nb3f'(Schedule))`}}
    * Ex. departments offering courses taught by both up3f and nb3f: {{`π_Dept(σ_computingID='up3f'(Schedule)) ∩ π_Dept(σ_computingID='nb3f'(Schedule))`}}
    * Ex. makers that sell laptops but not PCs: {{`π_maker(σ_type='laptop'(Product)) − π_maker(σ_type='PC'(Product))`}}
* Cartesian product `×`: binary, combines two relations into all combinations.
    * `R × S ≠ S × R`, and the product is usually not meaningful when performed alone.
    * Ex. `Employee × Department` pairs every employee with every department.
    * Ex. students with more than one email (cross product, then select): {{`σ_ID1=ID2 AND email1≠email2(ρ_C1(ID1, email1)(contact) × ρ_C2(ID2, email2)(contact))`}}
* Natural join `⋈`: binary, merges two relations on their common attributes.
    * Three steps: cross product, check equality of all common attributes (attributes with the same names), eliminate duplicate common attributes.
    * `R ⋈ S = π_A(σ_C(R × S))` where `A` is the combined attributes and `C` is the equality condition on the common attributes.
    * Ex. makers of laptops with a hard disk of at least 100GB: {{`π_maker(Product ⋈ σ_hd≥100(Laptop))`}}
* Division `÷`: binary, used for "for all" queries. Find "A" for all "B", where "A" and "B" are sets of attributes.
    * `AB ÷ B = A`, and in general `R ÷ S = π_A−B(R) − π_A−B((π_A−B(R) × S) − R)` where `A` and `B` are the attribute sets of `R` and `S`.
    * Four steps: project the `A−B` attributes and take the product with the divisor `S`; extract the tuples from that product that were not in `R`; project only the `A−B` attributes; extract only the tuples that are in the original `R`.
    * Shortcut: keep the `A` values that pair with every `B` value.
    * Ex. names of sailors who reserved all the boats: {{`π_sname, bid(Sailors ⋈ Reserves) ÷ π_bid(Boats)`}} (the divisor is the set of all boats; don't care about the remaining columns)
* Assignment `←`: `v ← E`, where `v` is a temporary variable representing a relation and `E` is an expression, similar to an assignment statement in programming.
    * Ex. makers of laptops with a hard disk of at least 100GB, in steps: {{`R1 ← σ_hd≥100(Laptop)`}}, {{`R2 ← Product ⋈ R1`}}, {{`π_maker(R2)`}}
* Aggregate functions `G`: not relational operators, used like `GROUP BY` to summarize a column.
    * Five standard operators: {{`sum`, `avg`, `count`, `min`, `max`}}.
    * Syntax: {{`G1, G2, ..., Gm G F1, F2, ..., Fn(R)`}} where `G` are the attributes to group on and `F` are the aggregation functions.
    * Ex. number of boats of each color: {{`color G count(bid)(Boats)`}}, renamed with `→ number_boats`.
    * Ex. average and max loan amount of each customer: {{`customer_name G avg(amount), max(amount)(Loan ⋈ Borrower)`}}
* Translating between SQL and RA:
| SQL | RA |
|---|---|
| `SELECT` list | `π` (projection) |
| `WHERE` / `HAVING` | `σ` (selection) |
| `FROM` (multiple tables) | `⋈` or `×` |
| `DISTINCT` | set semantics (no duplicates in RA) |
| `GROUP BY` with aggregates | `G` |
* Worked translations (sailors and boats: `Boats(bid, bname, color)`, `Sailors(sid, sname, rating, age)`, `Reserves(sid, bid, day)`):
    * Names of sailors who reserved boat 103: RA {{`π_sname(σ_bid=103(Sailors ⋈ Reserves))`}}, SQL `SELECT sname FROM Sailors NATURAL JOIN Reserves WHERE bid = 103`.
    * Color of the boats reserved by Lubber: {{`π_color(σ_sname='Lubber'(Sailors ⋈ Reserves ⋈ Boats))`}}
    * Names of sailors who reserved a red boat: {{`π_sname(σ_color='red'(Sailors ⋈ Reserves ⋈ Boats))`}}
    * Names of sailors who reserved a red and a green boat: {{intersection}} of the two red and green selections. SQL needs a subquery with `IN` or an `INTERSECT`.
    * Names of sailors who reserved a red or a green boat: {{union}} of the two selections. SQL uses `UNION`.
    * Names of sailors who reserved all the boats: {{division}}, `π_sname, bid(Sailors ⋈ Reserves) ÷ π_bid(Boats)`. SQL uses `NOT EXISTS` twice (for each sailor, there is no boat this sailor has not reserved).
    * Names of sailors who have not reserved a boat: {{difference}}, `π_sid, sname(Sailors) − π_sid, sname(Sailors ⋈ Reserves)`. SQL uses a `LEFT JOIN` with `WHERE bid IS NULL`.
    * Sids of sailors who reserved a boat whose name begins with "M": {{cannot be written in RA}} (there is no wildcard in RA). SQL uses `WHERE bname LIKE 'M%'`.
* Wrap-up: relational operators are selection, projection, renaming, Cartesian product, natural join, set operations, and division; additional operators are assignment and aggregate functions. Next: translating between SQL and RA, the RA tree, and query cost estimation.
