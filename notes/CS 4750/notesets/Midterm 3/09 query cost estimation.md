* The point of RA: SQL says what data to get, RA says how to get it, and the RA with algorithms (the physical plan) fully describes the execution.
    * Query processing: SQL → RA (logical plan) → a set of equivalent logical plans → a set of equivalent physical plans → the least cost plan → execution. CS 4750 considers cardinality estimation.
* Plan enumeration: some queries can be expressed in different ways, and RA specifies the order of operations, which can largely determine how efficient the query plan will be.
    * RA equivalences let us simplify queries, make queries faster, and explore equivalent RA plans.
* RA equivalences:
    * Successive projects can reduce to the final project: {{`π_A(π_A,B(R1)) = π_A(R1)`}}.
    * Project distributes over union: {{`π_A(R1 ∪ R2) = π_A(R1) ∪ π_A(R2)`}}. This may not work with intersection or set difference.
    * Select and project sometimes commute, if the condition involves only the attributes in the project list: {{`σ_c(π_A(R1)) = π_A(σ_c(R1))`}}.
    * Conjunctive selects can cascade into individual selects: {{`σ_c AND d(R1) = σ_c(σ_d(R1))`}}. Combine individual selects with OR: {{`σ_c OR d(R1) = σ_c(R1) ∪ σ_d(R1)`}}.
    * Select distributes over union and intersection: {{`σ_c(R1 ∪ R2) = σ_c(R1) ∪ σ_c(R2)`}} and {{`σ_c(R1 ∩ R2) = σ_c(R1) ∩ σ_c(R2)`}}.
    * Select and difference: {{`σ_c(R1 − R2) = σ_c(R1) − R2`}} (the condition only references attributes in `R1`).
    * Select and product or join sometimes commute: {{`σ_c(R1 × R2) = σ_c(R1) × R2`}} and {{`σ_c(R1 ⋈ R2) = σ_c(R1) ⋈ R2`}} (the condition only references attributes in `R1`).
    * Select with a condition on each side: {{`σ_c AND d(R1 × R2) = σ_c(R1) × σ_d(R2)`}} and the same for join, where `c` references attributes in `R1` and `d` references attributes in `R2`.
    * Project and product or join: {{`π_A,B(R1 × R2) = π_A(R1) × π_B(R2)`}} and the same for join, where `A` contains attributes in `R1` and `B` contains attributes in `R2`.
    * Product distributes over union, intersection, and difference: {{`S × (R1 ∪ R2) = (S × R1) ∪ (S × R2)`}}, and the same for `∩` and `−`.
    * All joins and Cartesian products are commutative (`R × S = S × R` mostly, `R ⋈ S = S ⋈ R`) and associative. Select is commutative (`σ_c(σ_d(R)) = σ_d(σ_c(R))`). Union and intersection are commutative and associative.
    * How to remember: use the definitions.
    * Guiding rule: perform the select operation as early as possible.
* Which equivalent RA leads to the most efficient algorithm depends on the information available to the query optimizer: size of each relation, what algorithm to use for each operation, how operations pass data to each other, statistics (number of blocks, tuples, distinct values for an attribute), indexes, and layout of data on disk.
    * Assumptions for this class: disk-based storage (HDD), row-based storage (tuples stored contiguously), sequential disk reads, a block read at once, no data preloaded, and only HDD I/O cost is considered.
    * Note: cost estimation is an active research topic. The equations here form a foundation of concepts but usually cannot compare to a commercialized solution.
* Cardinality estimation: estimate the number of tuples in the output of each RA operator.
    * Running example: `Student(studId, lastName, fistName, major, credits)`, `Class(classNumber, facId, schedule, room)`, `Faculty(facId, name, department, rank)`, `Enroll(studId, classNumber, grade)`.
    * `T(Student) = 10,000` tuples, `V(lastName) = 9,500` distinct values, `V(major) = 10` distinct values, `Range(credits) = [1, 126)`. `T(Enroll) = 50,000` tuples, `V(studId) = 10,000` distinct values, `V(classNumber) = 200` distinct values.
    * `T(R)` is the number of tuples in `R`, `V(attr)` is the number of distinct values of an attribute.
* Estimation examples:
    * Plain projection: `SELECT studId, lastName FROM Student` outputs {{10,000}} tuples (projection does not change the count).
    * `SELECT DISTINCT lastName FROM Student` outputs {{9,500}} tuples (one per distinct value).
    * Aggregate grouped by major: `SELECT major, AVG(credits) FROM Student GROUP BY major` outputs {{10}} tuples (one per distinct major).
    * `WHERE studId = 1111` (assume 1111 exists): {{1}} tuple.
    * `WHERE lastname = 'Happy'` (assume distinct values are uniformly distributed, 'Happy' exists, and without the assumption the estimate is impossible): selectivity factor `1 / V(attr)`, so `T(R) × 1 / V(attr)` = {{`10000 × 1/9500 ≈ 1.05`}} tuples.
    * `WHERE credits < 30` (assume uniformly distributed and continuous): selectivity factor = (selection range) / (total range), so `T(R) × (val − min) / (max − min)` = {{`10000 × (30 − 1) / (126 − 1) ≈ 2320`}} tuples.
    * `WHERE credits < 30 AND lastname = 'Happy'`: hard to say. If the conditions are disjoint, {{0}} tuples. If independent, multiply the estimates, {{`≈ 0.244`}} tuples. If they fully overlap, take the minimum of the estimates, {{`≈ 1.053`}} tuples. Assume independent unless you know for sure there is full overlap, so the answer is 0.244 tuples.
    * `WHERE credits < 30 OR lastname = 'Happy'`: if the conditions are disjoint, add the estimates, {{`≈ 2321`}} tuples. If they fully overlap, take the maximum of the estimates, {{`≈ 2320`}} tuples. Assume disjoint unless you know for sure there is full overlap, so the answer is 2321 tuples.
    * Cartesian product `SELECT * FROM Student, Enroll`: no selectivity factor (no `WHERE` clause), so `T(Student) × T(Enroll)` = {{`10000 × 50000`}} tuples.
    * Natural join `SELECT * FROM Student NATURAL JOIN Enroll`: at most `T(Student) × T(Enroll)`, but we can do better. Start with the Cartesian product, then apply `σ_Student.studId = Enroll.studId`. The selectivity factor is `1 / max{V(Student, studId), V(Enroll, studId)}` (assume full overlap, so only the studIds of the smaller relation matter), giving `T(Student) × T(Enroll) / max{V(Student, studId), V(Enroll, studId)}` = {{`10000 × 50000 / max{10000, 10000} = 50000`}} tuples.
* Wrap-up: cardinality estimation matters because real RDBMSs use sophisticated cost models, and making inappropriate assumptions to estimate cardinality may lead to inaccurate estimates, the optimizer selecting a slow plan, and slow query execution. Be careful with your assumptions and your document. Next: indexing.
