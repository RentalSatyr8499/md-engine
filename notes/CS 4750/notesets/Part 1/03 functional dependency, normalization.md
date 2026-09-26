* Define the following terms.
    * "{{Data}} anomaly": when the structure of a table causes incorrect, inconsistent, or unintended behavior when inserting, updating, or deleting data.
    * "{{Redundancy}} anomaly": when the same fact must be stored repeatedly, causing unnecessary duplication
    * "{{Update}} anomaly": when updating a single real‑world fact requires updating multiple tuples
    * "{{Deletion}} anomaly": when deleting one piece of information unintentionally deletes other important information.
    * "{{Functional}} dependency": a relationship where one attribute (or set of attributes) uniquely determines another attribute.
        * FDs are rules that hold for every {{instance of a relation}}. In this way, it constrains the meaning of the data in the table.
        * This makes them useful for {{deciding how to decompose tables to avoid anomalies}}. 
* Functional dependencies allow us to reason formally about the relationships inside a relation and infer new dependencies from ones we already know according to the following rules:
    * Reflexivity: if b is a subset of a, {{a → b}}
    * Augmentation: if a → b, then ac → {{bc}}
    * Transitivity: if a → b and b → c, then {{a → c}}
    * Union: if a → b and a → c, then {{a}} → bc
    * Decomposition: if a → bc, then {{a → b}} and {{a → c}} (separately)
    * Pseudo-transitivity: if a → b and cb → d, then {{ac → d}}
* "{{Decomposition}}": the process of breaking up one relation into two or more relations. 
    * A proper decomposition must have the following property: {{lossless join (no columns or rows are created or destroyed in the process of the decomposition)}}. 
    * Suppose we decompose a relation R into two relations $R_{1}$ and $R_{2}$. We can check for the property of lossless join using the following steps: 
        1. Verify that there exists columns shared between the decomposed relations: $R_{1}$ ∩ $R_{2}$ ≠ {}. 
        2. Verify that there exists a superkey for at least one of the decomposed relations in $R_{1}$ ∩ $R_{2}$, ie either $R_{1}$ and $R_{2}$ share columns that make up a superkey for $R_{2}$, or they share columns that make up a superkey for $R_{1}$.
    * Other properties a decomposition might have: 
        * "{{Dependency preserving}}": every dependency remains in the same relation (tables don't need to be joined to check dependencies). To verify a database satisifes this property, follow these steps: 
            1. Find Fc. 
            2. For each FD in Fc, verify that there exists at least one relation (table) that contains all the attributes on both the left-hand and right-hand side.
        * "{{No redundancy}}": for any meaningful FD (ie nontrivial, so A → A doesn't count), whatever's on the left-hand side of the arrow is a superkey.
* "{{Normalization}}": the process of reorganizing a database so that redundant data is eliminated and all data dependencies make sense.
    * "First Normal Form" (1NF): the data is structured such that each value is {{atomic (aka flat, no nested values)}}, all values in one column are in the same {{domain}}, and data can be stored in any order.
    * "Second Normal Form" (2NF): the data is structured such that: (1) it satisfies {{1NF}}, and (2) there does not exist any {{partial dependencies (none of the columns can be derived from any of the other columns; all columns provide completely new and non-redundant information)}}. To convert to 2NF, we often need to {{decompose the table}}.
    * "Third Normal Form" (3NF): the data is structured such that it satisfies {{lossless join}} and {{dependency preservation}}. In other words, 3NF is the same as 2NF with the additional constraint of {{forbidding transitive dependencies}}.
        * To check if something is 3NF: 
            1. Find all candidate keys of R.
            2. Identify all prime attributes (attributes that belong to at least one candidate key).
            3. For every non-trivial FD `X → Y`, check that at least one of the following conditions holds: 
                * `X` is a superkey of R
                * Every attribute in `Y` is a prime attribute
            * If any FD violates both of these conditions, R is NOT in 3NF.
        * To transform a table to 3NF:
            1. Identify the primary key of R. 
            2. Write out all the rules in FD.
            3. Eliminate any reflexive dependencies. Ex. B → BDE becomes {{B → DE}}.
            4. Eliminate all extraneous attributes. Repeat steps 3-4 until the FDs do not change anymore.
            5. The remaining FDs are now what's called the "Canonical cover" (Fc). 
            6. Transform Fc and the primary key into relational tables.
    * "BCNF": the data is structured such that it satisfies {{lossless-join}} and {{redundancy free}}.
        * To check if something is BCNF: 
            1. Find F+.
            2. For every non-trivial FD `X → Y`, check that `X` is a superkey of `R`.
            * If any FD violates this conditions, R is NOT in BCNF.
        * "Redundancy free": {{given a relation R, for every nontrivial X → Y, X is a super key}}.
        * To convert a database to BCNF: 
            1. Compute F+.
            2. Write out all the attributes in R. This is the root node of your tree.
            3. Choose an attribute `X` such that: 
                * `X` is non-trivial
                * `X` is not a superkey of the parent node (if there is a parent node)
            4. Add two children nodes to the current node such that `X` is the only shared attribute between the two nodes.
            5. Repeat steps 3-4 until no more children can be made.
            
## Exercises
![alt text](image18.png){size=small}
* Consider the table above. Assume that it includes the entire dataset. For each of the relations below, are they functional dependencies?
    * A → B: {{`N`}}
    * B → C: {{`N`}}
    * AB → C: {{`Y`}}
    * A → C: {{`Y`}}
    * C → B: {{`N`}}
* (T/F) If we know A → B, we know AC → B. {{`T`}} 
* (T/F) If we know A → B, we know A → BC. {{`F`}} 
* "*Given R(A,B,C), F = {A → B, B → C }, compute the attribute closures for all attribute and combination of attributes.*" Answer: {{A+ = ABC, B+ = BC, C+ = C, AB+ = ABC, AC+ = ABC, BC+ = BC, ABC+ = ABC}}
* "*Given R(A,B,C,D,E) and F = { A → C, B → B, C → BD, D → E }, compute F+.*" Answer: {{F+ = { A → C, C → BD, D → E, C → B, C → D, C → E, A → B, A → D, A → E, A → BD }}}
    * Which attribute and attribute combinations work as super keys? Answer: {{A+, AB+, AC+, ABC+}}
    * Which attribute and attribute combinations work as candidate keys? Answer: {{A+}}
* "*Given R(A,B,C,D,E), F = { A → C, B → B, C → BD, D → E }, compute F+.*" Answer: {{A+ = {}}}
* "*Consider a relation Stocks(B, O, I, S, Q, D). Let the set of FDs for Stocks be FDs = { S → D, I → B, IS → Q, B → O }. List all candidate keys for the Stocks relation.*" Answer: {{IS}}
