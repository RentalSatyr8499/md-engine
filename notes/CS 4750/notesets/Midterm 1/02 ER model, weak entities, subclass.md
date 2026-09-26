* "{{E-R diagram"}}: a sketch that conceptualizes how entities/objects are connected by relations in your schema. Relevant vocab:
    * {{Entity}}: a real-world object you want to represent
    * {{Entity set}}: a collection of real-world objects you want to represent.
    * {{Instance}}: a representation of an entity in the database.
    * {{Attribute}}: a property of an entity. 
        * "{{single-valued}}" attribute: only allows one value or instance of that attribute. 
        * "{{multi-valued}}" attribute: allows for more than one instance of that attribute (a set).
        * "{{derived}}" attribute: can be calculated from other attribute(s).
        * "{{composite}}" attribute: an attribute made up of multiople components that together form one logical value. For example, an `address` would have a `street`, a `city`, etc.
    * Relationships: connections between entity sets
        * "{{Binary}}" relationships: between two entity sets only. *"If A and B are sets, a relationship R is a subset of {{A X B}}"*.
        * "{{Multi-way}}" relationships: connections involving more than two entity sets 
        * "{{Total participation}}": "*all entities in an entity set must participate in the relationship*"

| visual representation | name | definition | 
|----|-----|----|
|![alt text](image3.png){size=small}| {{entity set}} | {{a real-world object you want to represent}} |
|![alt text](image4.png){size=small}| {{attribute}} | {{a property of an entity}} | 
| ![alt text](image5.png){size=small}| {{relationship}} | {{a connection between two entity sets}} |
|![alt text](image6.png){size=small}| {{one-to-one relationship}} | {{a relationship that connects one entity set to one other entity set only}} |
|![alt text](image7.png){size=small}| {{one-to-many relationship}} | {{a relationship that connects one entity set to multiple other entity sets}}|
|![alt text](image8.png){size=small}| {{many-to-many relationship}} | {{a relationship that connects multiple entity sets to multiple other entity sets}}|
|![alt text](image9.png){size=small}|{{total participation}}|{{all products must have a company (all entities on the double line side must participate in the relationship)}}|
|![alt text](image10.png){size=small} (what does the dotted line refer to?)|{{attribute on a relationship}}|N/A|
|![alt text](image11.png){size=small}| {{ternary relationship}} | R is a subset of {{A X B X C}} | 
|![alt text](image14.png){size=small}| {{weak entity}} | {{entities that are identified by their relationship with other entities rather than by their own attributes}} |
|![alt text](image16.png){size=small}|{{subclass}}|{{special-case entity sets, aka a group of entities with special properties not associated with all members in their entity set}}. The triangle points to {{the subclass/specialization}}.|

* (T/F) The E-R model stipulates that all relationships must be binary. {{`F`, multi-way relationships are allowed too}} 
* (T/F) In general, multi-way relationships are good database design choices. {{`F`, multi-way relationships are very bad practice and design because they are difficult to reason through}}
* (T/F) Every multi-way relationsip can be converted to a series of binary relationships. {{`T`, this should always be done when possible}}.
* While strong entities can be identified by virtue of their own attributes, weak entities are identified by a combination of (1) {{their discriminator}} and (2) {{the relationship they have with a strong entity set}}.
    * The {{discriminator}} differentiates one weak entity from another weak entity connecting to the same strong entity. 
    * The weak entity is "existence dependent" on the strong entity with which it has an identifying relationship, meaning {{the weak entity cannot exist without the strong entity}}. 
    * For this reason, weak entities by definition must {{have total participation in the identifying relationships they have with strong entities}}.
* Given an E-R diagram with only strong entity sets, you can identify the number of tables needed to implement it by {{adding the number of entity sets (rectangles) to the number of relational sets (diamonds)}}. 
    * When composite attributes to schema, you must {{flatten them so that there are no nested values in any of the columns}}.
    * When converting multivalued attributes to schema, you must {{make a new table that holds entity primary keys and all instances of the multivalued attribute}}.
    * Given an E-R diagram with weak entity sets, you can identify the number of tables needed to implement it by {{}}.
## left off on 20

## Exercises
![alt text](image12.png)
* In the image above, {{row four (the last row)}} is not allowed.
![alt text](image14.png)
* Consider the image above. 
    * Interpret the `buys` relationship: {{Each (person, product) pair connects to at most one company. Each (person, company) pair connets to at most one product. Each (company, product) pair connects to many persons.}}
    * What rows are not allowed? {{second row, fourth row}}
![alt text](image15.png)
* Consider the image above. Interpret the `have` relationship: {{Homework cannot exist without a course. Every homework must belong to a single class. A course can have many homework. Different courses may have the same homework number. To identify a homework, we need `c_number` and `hw_number`}}.
* Draw an E-R diagram for the following scenario: "*Each movie has a title and year; title and year together uniquely identify the movie. Length and genre are maintained for each movie. Among the special kinds of movies, we might store in our database are cartoons and murder mysteries. A cartoon has, in addition to the attributes and relationships of Movies, an additional relationship called Voices that gives us a set of stars who speak, but do not appear in the movie. Movies that are not cartoons do not have such stars. Murder-mysteries have an additional attribute weapon.*" Answer: https://imgur.com/juRex8v
![alt text](image17.png)
* Consider the E-R model above. Convert it to schema (* represents primary key): {{`student(s_ID*, name, street, city, state, zip code)`, `phone(s_ID*, phone_number*)`}}