* We can concieve database architecture as existing on different "levels": 
    1. {{External}} level: the user‑specific view of the data; what each user or application sees
    2. {{Logical}} or conceptual level: the unified, abstract structure of all data in the database
    3. {{Internal}} level: the DBMS’s representation of data structures and access paths
    4. {{Physical}} level: the actual low‑level storage layout on disk
    * Relevant terms: 
        * {{External view}}: "a collection of external records"
        * {{External record}}: "a record as seen by a particular user"
        * External schema: describes an external view
        * {{Logical schema}}: "a complete description of the information content of the database"
        * {{Logical record interface}}: the abstract operations the DBMS provides for accessing logical records
        * {{Logical model}}: "a collection of logical records(comprehensive view of the user’s mini-world)"
        * "The DBMS uses the {{external}} schema to create a user interface, the {{logical}} schema to create the logical record interface, and the {{internal}} schema to decide how information is organized in storage".
* "{{Data independence}}" is the ideal that upper levels of the database architecture should be unaffected by changes to the lower levels.
    * Physical data independence: {{"changes to internal model or physical do not impact logical model"}}
    * Logical data independence: {{"changes to logical model do not impact external models"}}
* "A {{data model}} is a collection of concepts or notations for describing the data in a database". It has three components: {{structure}}, {{integrity}}, and {{manipulation}}.
    * To refer to the "{{structure}}" of a data model is to talk about the shape of the data: what kinds of records exist, what attributes they have, and how they relate.
    * The "{{integrity}}" of a data model refers to the rules that data must obey to be counted as valid. Things like "appointment times can’t overlap" or "stock can’t go negative". 
    * The "{{manipulation}}" of a data model dictates what operations you’re allowed to perform on the data.
    * Common kinds of data models: 
        * {{Relational}} model: data organized into tables with rows and columns.
        * {{Key/value}} model: data stored as simple key → value pairs.
        * {{Document}} model: data stored as semi‑structured JSON‑like documents.
        * {{Graph}} model: data represented as nodes connected by edges.
        * {{Column-family}} model: data stored by columns for fast analytical access.
        * {{Array/matrix}} model: data stored as multidimensional numeric arrays.
        * {{Hierarchical}} model: data arranged in a tree with parent–child relationships.
        * {{Network}} model: data arranged as a flexible graph of interconnected records.
* Zooming into the relational model: 
    * A "relation": {{a set (no duplicates) of unordered tuples}}.
    * A "table": {{a list (duplicates allowed) of ordered rows}}.
 
# left off on 15 for 4750meet03-data-model

