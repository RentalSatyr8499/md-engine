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
    * To refer to the "{{structure}}" of a data model is to talk about the shape of the data (what kinds of records exist, what attributes they have, and how they relate).
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
        * An n-ary relation is a table that {{has n columns}}.
        * By definition, tuple values are atomic, meaning {{there are no lists or nested structures}}. 
        * (T/F) The special value NULL is allowed in every place in the tuple (is a member of every domain). {{T}}
    * A "table": {{a list (duplicates allowed) of ordered rows}}. 
    * While a relational database theoretically obeys the definition of a "{{relation}}", they are often implemented using "{{tables}}", meaning additional work needs to be done to ensure that data is organized in a way that is still valid under the relational model paradigm.
    * "{{Keys}}" are used to uniquely identify tuples.
        * {{Super}} key: Any set of attributes that uniquely identifies tuples.
        * {{Candidate}} key: A minimal super key. None of the attributes can be removed without making it no longer a super key.
        * {{Primary}} key: The chosen candidate key used by the DBMS. This is typically the candidate key with the most important semantic meaning. 
        * {{Foreign}} key: any *"attribute that uniquely identifies a row in another table"*.
        * Primary keys must disallow {{NULL}} values. 

## Exercises
![alt text](image1.png){size=small}
* Answer the following based on the above image:
    * Write the schema statement for the relation in the image above: {{`Movies(title, year, length, genre)`}}
    * What's the selected tuple? {{`("Star wars", 1977, 124, "sciFi")`}}
    * What's the selected instance? {{`{("Star wars", 1977, 124, "sciFi"),("Wayne's world", 1992, 95, "comedy")}`}}
    * Suppose we stipulate the assumption that all movies can be uniquely identified by their name and their year (no two movies with the same name will be made in the same year). Write the key of the relation. {{`PRIMARY KEY (title, year)`}}
![alt text](image2.png){size=small}
* For the image above, list all of the...
    * Super keys: {{`{computingID}, {SSN}, {computingID, SSN}, {computingID, name}, {SSN, name}, {computingID, SSN, name}`}}
    * Candidate keys: {{`{computingID}, {SSN}`}}
    * The likely best primary key: {{`{computingID}`}}