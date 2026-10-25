* Data layer tools enforce business logic on the database level. This makes apps less complex because the DBMS enforces the rules no matter which app touches the data.
    * "{{Integrity constraints}}": express rules as part of the schema (ex. data types, primary key, foreign key, and `UNIQUE`).
    * "{{Trigger}}": an event-condition-action rule, ie an event occurs, a condition is tested, an action is performed.
    * "{{Check}}": data validation rules enforced on every update or insert.
* Designing with "{{referential}} integrity" means enforcing mechanisms that force foreign key values to make sense. This prevents invalid actions like to inserting with a non-existent foreign key or deleting a referenced attribute.
    * Examples of referential integrity: 
        * The referenced attribute must be `UNIQUE` or the `PRIMARY KEY`.
        * Any value of the foreign key must exist somewhere in the foreign table. 
        * Values of the referenced attributes must be non-NULL.
    * You can `ADD` and `DROP` foreign keys even after the table has been `CREATE`d. You can also name the foreign key rule using the `CONSTRAINT` keyword to make it easier to delete or debug later if needed: `ALTER TABLE buyer ADD CONSTRAINT FK_buyer_cust FOREIGN KEY (bid) REFERENCES cust(id)`
    * There are difference policies for maintain referential integrity:
        * {{Default}} policy: reject any violating action.
        * {{Cascade}} policy: change referenced attributes in a violating action such that referential integrity is maintained. Ex. `ALTER TABLE buyer ADD CONSTRAINT FK_buyer_cust FOREIGN KEY (bid) REFERENCES cust(id) ON DELETE CASCADE`
        * {{Set-null}} policy: set a foreign key value to `NULL`. Ex. `ALTER TABLE buyer ADD CONSTRAINT FK_buyer_cust FOREIGN KEY (bid) REFERENCES cust(id) ON DELETE SET NULL`
* Attribute-based `CHECK`: limits the value range of a single column, checked on {{insert and update}}. Ex. `CREATE TABLE buyer (bid INT NOT NULL, bname VARCHAR(20) NOT NULL, rating INT NOT NULL, age DOUBLE CHECK (age >= 18), PRIMARY KEY (bid))`. 
    * {{Tuple}}-based `CHECK`: limits the value range of multiple columns, checked every time a tuple is inserted or updated. Ex. `CHECK (age >= 18 AND rating > 3)`.
* A {{trigger}} fires when a specific event happens on a specific table. Use this syntax: `CREATE TRIGGER <trigger_name> [BEFORE|AFTER] <event> ON <table> [FOR EACH ROW | FOR EACH STATEMENT] BEGIN <trigger-body> END` where the event is `INSERT`, `UPDATE`, or `DELETE`. `FOR EACH ROW` runs the body once per affected row, while `FOR EACH STATEMENT` runs it once per statement.
    * Ex. a `gradebook` table with `hw1` through `hw4` and a `total` column, kept correct by a trigger: `CREATE TRIGGER gradebookTrigger BEFORE INSERT ON gradebook FOR EACH ROW BEGIN SET NEW.total = NEW.hw1 + NEW.hw2 + NEW.hw3 + NEW.hw4; END` Inserting rows with deliberately wrong totals still stores the correct totals, because {{the trigger recomputes them before insert}}.
    * To show existing triggers: {{`SHOW TRIGGERS`}}.
    * Ex. clamping totals on update: a `BEFORE UPDATE` trigger with `IF NEW.total > 100 THEN SET NEW.total = 100; ELSEIF NEW.total < 60 THEN SET NEW.total = 60; END IF;`
* An {{assertion}} is any general condition that the database must always satisfy. Domain constraints and referential-integrity constraints are specific forms of assertions. `CHECK` verifies the assertion on one table and one attribute, while `ASSERTION` verifies it on one or more tables and one or more attributes.
    * Some constraints cannot be expressed with only domain or referential-integrity constraints, for example "every department must have at least five courses offered every semester", which must be an assertion.
    * Syntax: `CREATE ASSERTION <assertion-name> CHECK <predicate>` and `DROP ASSERTION <assertion-name>`. On any modification, the DBMS checks whether it violates the assertion: if yes, the modification is not allowed; if no, it goes through.
    * Ex. every student's `tot_cred` must equal the sum of credits of courses they completed successfully: `CREATE ASSERTION credits_earned_constraint CHECK (NOT EXISTS (SELECT ID FROM student WHERE tot_cred <> (SELECT SUM(credits) FROM takes NATURAL JOIN course WHERE student.ID = takes.ID AND grade IS NOT NULL AND grade <> 'F')))`
* A {{stored procedure}} is a pre-defined, pre-compiled collection of SQL statements that lets business logic be stored and executed from SQL statements.
    * It can take input parameters and return values.
    * Syntax: `CREATE PROCEDURE <procedure_name> [(IN|OUT <parameter> <datatype>)] BEGIN <local-declarations> <procedure-body> END`
    * To run one: `CALL <procedure-name> (<argument-list>)`
    * To drop one: `DROP PROCEDURE [IF EXISTS] <procedure-name>`
    * Ex. raise every instructor salary from one value to another: `CREATE PROCEDURE raiseSalary (IN oldSalary DECIMAL(8,2), IN newSalary DECIMAL(8,2)) UPDATE instructor SET salary = newSalary WHERE salary = oldSalary;`. To use, `SET @p0='62000'; SET @p1='64000'; CALL raiseSalary(@p0, @p1);`
