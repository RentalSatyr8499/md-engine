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
|![alt text](image6.png){size=medium}| {{one-to-one relationship}} | {{a relationship that connects one entity set to one other entity set only}} |
|![alt text](image7.png){size=medium}| {{one-to-many relationship}} | {{a relationship that connects one entity set to multiple other entity sets}}|
|![alt text](image8.png){size=medium}| {{many-to-many relationship}} | {{a relationship that connects multiple entity sets to multiple other entity sets}}|
|![alt text](image9.png){size=medium}|{{total participation}}|{{all products must have a company (all entities on the double line side must participate in the relationship)}}|
|![alt text](image10.png){size=medium} (what does the dotted line refer to?)|{{attribute on a relationship}}|N/A|
|![alt text](image11.png){size=medium}| {{ternary relationship}} | R is a subset of {{A X B X C}} | 
|![alt text](image14.png){size=medium}| {{weak entity}} | {{entities that are identified by their relationship with other entities rather than by their own attributes}} |
|![alt text](image16.png){size=small}|{{subclass}}|{{special-case entity sets, aka a group of entities with special properties not associated with all members in their entity set}}. The triangle points to {{the subclass/specialization}}.|

* (T/F) The E-R model stipulates that all relationships must be binary. {{`F`, multi-way relationships are allowed too}} 
* (T/F) In general, multi-way relationships are good database design choices. {{`F`, multi-way relationships are very bad practice and design because they are difficult to reason through}}
* (T/F) Every multi-way relationsip can be converted to a series of binary relationships. {{`T`, this should always be done when possible}}.
* While strong entities can be identified by virtue of their own attributes, weak entities are identified by a combination of (1) {{their discriminator}} and (2) {{the relationship they have with a strong entity set}}.
    * The {{discriminator}} differentiates one weak entity from another weak entity connecting to the same strong entity. 
    * The weak entity is "existence dependent" on the strong entity with which it has an identifying relationship, meaning {{the weak entity cannot exist without the strong entity}}. 
    * (T/F) weak entities by definition must have total participation in the identifying relationships they have with strong entities. {{`T`}}
* Converting diagrams to written schema tips: 
    * Given an E-R diagram, you can identify the number of tables needed to implement it by {{adding the number of *strong* entity sets (rectangles with single outlines) to the number of relations (diamonds)}}. 
    * When converting composite attributes to schema, you must {{flatten them so that there are no nested values in any of the columns}}.
    * When converting multivalued attributes to schema, you must {{make a new table that holds entity primary keys and all instances of the multivalued attribute}}.
    * To show cardinality in schema statements, {{underline attributes that need to be unique for each record (need to be on the "one" side of the relation)}}. For example, if A participates in a many-to-one relation with B, the schema statement would be R({{A, <u>B<u>}}).

## Exercises
![alt text](image12.png){size=medium}
* Consider the image above. 
    * Interpret the `buys` relationship: {{Each (person, product) pair connects to at most one company. Each (person, company) pair connets to at most one product. Each (company, product) pair connects to many persons.}}
    * One of the records violates the cardinalities stipulated by the diagram. Which is it? {{row four (the last row)}}
![alt text](image15.png){size=medium}
* Consider the image above. Interpret the `have` relationship: {{Every homework must belong to a single class. A course can have many homework. Different courses may have the same homework number. Homework cannot exist without a course; to identify a homework, we need `c_number` and `hw_number`}}.
* Draw an E-R diagram for the following scenario: "*Each movie has a title and year; title and year together uniquely identify the movie. Length and genre are maintained for each movie. Among the special kinds of movies, we might store in our database are cartoons and murder mysteries. A cartoon has, in addition to the attributes and relationships of Movies, an additional relationship called Voices that gives us a set of stars who speak, but do not appear in the movie. Movies that are not cartoons do not have such stars. Murder-mysteries have an additional attribute weapon.*" Answer: https://imgur.com/juRex8v
![alt text](image17.png){size=small}
* Consider the E-R model above. Convert it to schema: {{student(<u>s_ID<u>, name, street, city, state, zip code), phone(<u>s_ID<u>, <u>phone_number<u>)}}