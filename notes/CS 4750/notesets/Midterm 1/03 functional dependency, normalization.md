* Define the following terms.
    * "{{Data}} anomaly": when the structure of a table causes incorrect, inconsistent, or unintended behavior when inserting, updating, or deleting data.
    * "{{Redundancy}} anomaly": when the same fact must be stored repeatedly, causing unnecessary duplication
    * "{{Update}} anomaly": when updating a single real‑world fact requires updating multiple tuples
    * "{{Deletion}} anomaly": when deleting one piece of information unintentionally deletes other important information.
    * "{{Functional}} dependency": a relationship where one attribute (or set of attributes) uniquely determines another attribute.
* Functional dependencies allow us to reason formally about the relationships inside a relation and infer new dependencies from ones we already know according to the following rules:
    * Reflexivity: if b is a subset of a, {{a → b}}
    * Augmentation: if a → b, then {{ac}} → bc
    * Transitivity: if a → b and b → c, then {{a → c}}
    * Union: if a → b and a → c, then {{a}} → bc
    * Decomposition: if a → bc, then {{a → b}} and {{a → c}} (separately)
    * Pseudo-transitivity: if a → b and cb → d, then {{ac → d}}
* "{{Decomposition}}": the process of breaking up one relation into two or more relations. 
    * "{{Lossless join}}": when no columns or rows are created or destroyed in the process of the decomposition. 
    * (T/F) All decompositions must have the property of lossless join. {{`T`}}
    * Suppose we decompose a relation R into two relations $R_{1}$ and $R_{2}$. We can check for the property of lossless join using the following steps: 
        1. Verify that there exist at least one {{shared column between the relations}}: $R_{1}$ ∩ $R_{2}$ ≠ {}. 
        2. Verify that there exists a {{superkey}} for at least one of the decomposed relations in $R_{1}$ ∩ $R_{2}$. Ie, either $R_{1}$ and $R_{2}$ share columns that make up a superkey for $R_{2}$, or they share columns that make up a superkey for {{$R_{1}$}}.
    * Other properties a decomposition might have: 
        * "{{Dependency preserving}}": every dependency remains in the same relation (tables don't need to be joined to check dependencies). 
        * "{{No redundancy}}": for "nontrivial" FD (so A → A doesn't count), whatever's on the left-hand side of the arrow is a superkey.
* "{{Normalization}}": the process of reorganizing a database so that redundant data is eliminated and all data dependencies make sense.
    * "First Normal Form" (1NF): the data is structured such that each value is {{atomic (aka flat, no nested values)}}, all values in one column are in the same {{domain}}, and data can be stored in any order.
    * "Second Normal Form" (2NF): the data is structured such that: (1) it satisfies {{1NF}}, and (2) there does not exist any {{partial dependencies}}.
        * "Partial dependency": {{when one column of a table can be derived from other columns of the table}}
    * "Third Normal Form" (3NF): the data is structured such that it satisfies {{lossless join}} and {{dependency preservation}}. In other words, 3NF is the same as 2NF with the additional constraint of {{forbidding transitive dependencies}}.
        * Steps to test for proper 3NF!
            1. Find all {{candidate}} keys of R.
            2. Identify all {{prime}} attributes (attributes that belong to at least one candidate key).
            3. For every non-trivial FD `X → Y`, check that at least one of the following conditions holds: 
                * `X` is {{a superkey of R}}
                * Every attribute in `Y` is {{a prime attribute}}
            * If any FD violates both of these conditions, R is NOT in 3NF.
        * Steps to transform a table to 3NF!
            1. Identify the {{primary}} key of R. 
            2. Write out all the FDs.
            3. Eliminate any reflexive dependencies. Ex. B → BDE becomes {{B → DE}}.
            4. Eliminate all extraneous attributes. Repeat steps 3-4 until the FDs do not change anymore.
                * Tip on eliminating extraneous attributes: imagine all the attributes as nodes in a graph, and the FDs as edges between those nodes. If there's more than one path from node A to node B, there's an FD that contains an extraneous attribute. But be careful when choosing which attribute to eliminate to narrow it down to one path though; don't get rid of any meaningful dependencies. For example: if we have [{A → BC, B → C}](https://i.imgur.com/MvL4NnV.png), there are [two paths](https://i.imgur.com/yjgblGc.png) from A to C. Since A → BC has two edges in the graph, we can safely get rid of one without eliminating A → BC's presence from the graph entirely. So to remove the extraneous attribute, {A → BC, B → C} becomes {A → B, B → C} (not {A → BC}, which would eliminate the B → C edge/dependency from the graph entirely).
            5. The remaining FDs are now what's called the {{"Canonical cover" (Fc)}}. 
            6. Transform Fc and the primary key into relational tables.
    * "BCNF": the data is structured such that it satisfies {{lossless-join}} and {{redundancy free}}.
        * Steps to test for proper BCNF!
            1. Find {{F+}}.
            2. For every non-trivial FD `X → Y`, check that `X` is {{a superkey of `R`}}.
            * If any FD violates this condition, R is NOT in BCNF.
            * Tip on checking if something is in BCNF: again visualize all the attributes as nodes in a graph, and the FDs as edges between those nodes. For each node, try to get to every other node. If so, it's BCNF. 
        * Steps to compute F+ (closure of F)!
            1. Write out all the FDs. 
            2. Apply all the reflexivity rules. 
            3. Apply all the transitivity rules. For example, `{X → XY, Z → XZ}` becomes {{`{X → XY, Z → XYZ}`}}.
            4. Repeat steps 2-3 until the list of FDs no longer changes.
            * If you are asked for the "attribute closure" of an attribute X in F, simply write out {{all the attributes implied by X in F+}}.
        * Steps to transform a table to BCNF!
            1. Compute {{F+}}.
            2. Write out all the attributes in R. This is the root node of your tree.
            3. Choose any attribute `X` such that: 
                * `X` is non-{{trivial}}
                * `X` is not a {{superkey}} of the parent node (if there is a parent node)
                * `X` has not been broken on before in the tree
            4. Break on `X`. This means adding two children nodes, then divvying out all the attributes in the parent node among the children nodes, only allowing {{`X`}} to be shared between the children. 
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
* "*Given R(A,B,C), F = {A → B, B → C}, compute the attribute closures for all attribute and combination of attributes.*" Answer: {{A+ = ABC, B+ = BC, C+ = C, AB+ = ABC, AC+ = ABC, BC+ = BC, ABC+ = ABC}}
* "*Given R(A,B,C,D,E) and F = { A → C, B → B, C → BD, D → E}, compute F+.*" Answer: {{F+ = {A → ABCDE, C → BCDE, D → DE } }}
    * List out the candidate key(s). {{A}}
* "*Consider a relation Stocks(B, O, I, S, Q, D). Let the set of FDs for Stocks be FDs = { S → D, I → B, IS → Q, B → O }. List all candidate keys for the Stocks relation.*" Answer: {{IS}}
