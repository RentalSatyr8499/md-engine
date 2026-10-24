* Business logic can live at the human level, the app level, or the database level, and the question is how much of it should move to the data layer.
    * Moving logic to the data layer makes apps less complex, because the DBMS enforces the rules no matter which app touches the data.
    * From simplest to most complex, the data layer tools are: {{data types, integrity constraints, `CHECK` constraints, assertions, triggers, stored procedures}}.
* A serious problem with apps that update the database is that the new info could be wrong, so always verify the info before updating or inserting.
* Integrity constraints express rules as part of the schema: data types, primary key, foreign key, and `UNIQUE`.
* A trigger is an event-condition-action rule: {{an event occurs, a condition is tested, an action is performed}}.
    * Triggers enforce business logic automatically when users insert, update, or delete rows or columns, and they validate input.

* Referential integrity is the assertion that foreign key values must make sense.
    * The referenced attribute(s) must be {{`UNIQUE` or the `PRIMARY KEY`}} of their relation.
    * Values of the foreign key must also appear in the referenced attributes of some tuple.
    * Values of the referenced attributes must be non-NULL.
    * Ex. {{`CREATE TABLE Product(pid INT, name CHAR(30), cid INT, PRIMARY KEY (pid), FOREIGN KEY (cid) REFERENCES company(cid))`}}
* To add a foreign key to an existing table: {{`ALTER TABLE buyer ADD FOREIGN KEY (bid) REFERENCES cust(id)`}}
* To name the constraint: {{`ALTER TABLE buyer ADD CONSTRAINT FK_buyer_cust FOREIGN KEY (bid) REFERENCES cust(id)`}}
* To drop a foreign key: {{`ALTER TABLE buyer DROP FOREIGN KEY FK_buyer_cust`}}
* Actions referential integrity prevents: trying to insert or update with a non-existent foreign key, and trying to delete a referenced attribute.
* Three policies to maintain referential integrity:
    * Default policy: {{reject}} the violating action.
    * Cascade policy: {{also change the referenced attributes}}.
    * Set-null policy: {{set a foreign key value to `NULL`}}.
    * Ex. cascade on delete: {{`ALTER TABLE buyer ADD CONSTRAINT FK_buyer_cust FOREIGN KEY (bid) REFERENCES cust(id) ON DELETE CASCADE`}}
    * Ex. set null on delete: {{`ALTER TABLE buyer ADD CONSTRAINT FK_buyer_cust FOREIGN KEY (bid) REFERENCES cust(id) ON DELETE SET NULL`}} (allowed only if `bid` is not the primary key of `buyer`)

* Attribute-based `CHECK`: limits the value range of a single column, checked on insert and update.
    * Ex. {{`CREATE TABLE buyer (bid INT NOT NULL, bname VARCHAR(20) NOT NULL, rating INT NOT NULL, age DOUBLE CHECK (age >= 18), PRIMARY KEY (bid))`}}
    * Attempting to insert a record with `age < 18` will be rejected by the DBMS.
    * To add one to an existing table: {{`ALTER TABLE buyer ADD CONSTRAINT checkAge CHECK (age >= 18)`}} (the name is optional; without one the DBMS picks a default like `buyer_chk_1`).
    * To name it inline: {{`CONSTRAINT checkAge CHECK (age >= 18)`}}
    * To drop it: {{`ALTER TABLE buyer DROP CONSTRAINT checkAge`}}
    * To see existing check constraints: {{`SELECT * FROM information_schema.CHECK_CONSTRAINTS`}}
* Tuple-based `CHECK`: limits the value range of multiple columns, checked every time a tuple is inserted or updated.
    * Ex. {{`CHECK (age >= 18 AND rating > 3)`}} (inserting with `age < 18` or `rating < 3` is rejected).

* A trigger fires when a specific event happens on a specific table.
    * Syntax: {{`CREATE TRIGGER <trigger_name> [BEFORE|AFTER] <event> ON <table> [FOR EACH ROW | FOR EACH STATEMENT] BEGIN <trigger-body> END`}} where the event is `INSERT`, `UPDATE`, or `DELETE`.
    * `FOR EACH ROW` runs the body once per affected row, while `FOR EACH STATEMENT` runs it once per statement.
* Ex. a `gradebook` table with `hw1` through `hw4` and a `total` column, kept correct by a trigger:
    * {{`CREATE TRIGGER gradebookTrigger BEFORE INSERT ON gradebook FOR EACH ROW BEGIN SET NEW.total = NEW.hw1 + NEW.hw2 + NEW.hw3 + NEW.hw4; END`}}
    * Because the body has semicolons, wrap it with `DELIMITER $$` before and `DELIMITER ;` after.
    * Inserting rows with deliberately wrong totals still stores the correct totals, because the trigger recomputes them before insert.
    * To modify a trigger: {{`CREATE OR REPLACE TRIGGER`}}.
    * To drop a trigger: {{`DROP TRIGGER IF EXISTS gradebookTrigger`}} (or `gradebook.gradebookTrigger` with the table).
    * To show existing triggers: {{`SHOW TRIGGERS`}}.
* Ex. clamping totals on update: a `BEFORE UPDATE` trigger with {{`IF NEW.total > 100 THEN SET NEW.total = 100; ELSEIF NEW.total < 60 THEN SET NEW.total = 60; END IF;`}}
* Ex. logging salary changes: a separate `salary_changes` table plus a trigger that fires only when the salary actually changes:
    * {{`CREATE TRIGGER before_update_salary BEFORE UPDATE ON employees FOR EACH ROW BEGIN IF NEW.salary <> OLD.salary THEN INSERT INTO salary_changes(emp_id, old_salary, new_salary) VALUES(OLD.emp_id, OLD.salary, NEW.salary); END IF; END`}}
    * Updating a row with the same salary adds no log.
* Trigger uses: log table modifications, enforce complex integrity, and validate or reformat data before inserting or updating with `BEFORE INSERT` or `BEFORE UPDATE` triggers.
* When to use triggers:
| database type | trigger effect |
|---|---|
| Read-heavy (data does not change much) | triggers improve performance |
| Write-heavy (data changes constantly) | triggers negatively impact performance |
* Wrap-up: always use data types and integrity checks, use `CHECK` constraints when possible, and remember triggers are powerful but complicated.

* An assertion is a condition that the database must always satisfy. Domain constraints and referential-integrity constraints are specific forms of assertions.
* `CHECK` verifies the assertion on one table and one attribute, while `ASSERTION` verifies it on one or more tables and one or more attributes.
* Some constraints cannot be expressed with only domain or referential-integrity constraints, for example "every department must have at least five courses offered every semester", which must be an assertion.
* Syntax: {{`CREATE ASSERTION <assertion-name> CHECK <predicate>`}} and {{`DROP ASSERTION <assertion-name>`}}.
* On any modification, the DBMS checks whether it violates the assertion: if yes, the modification is not allowed; if no, it goes through.
* Ex. every student's `tot_cred` must equal the sum of credits of courses they completed successfully:
    * {{`CREATE ASSERTION credits_earned_constraint CHECK (NOT EXISTS (SELECT ID FROM student WHERE tot_cred <> (SELECT SUM(credits) FROM takes NATURAL JOIN course WHERE student.ID = takes.ID AND grade IS NOT NULL AND grade <> 'F')))`}}
* Ex. the total length of all movies by a given studio must not exceed 10,000 minutes:
    * {{`CREATE ASSERTION sumLength CHECK (10000 >= ALL (SELECT SUM(length) FROM Movies GROUP BY studioName))`}}
    * Since this involves only the `Movies` relation, it can also be written as a tuple `CHECK` constraint.
* Although `ASSERTION` is in the SQL standard, most DBMS do not support it, so `CHECK` and triggers are the common workarounds.
* Comparison of constraints:
| type | where declared | when activated | guaranteed to hold? |
|---|---|---|---|
| Attribute-based `CHECK` | with the attribute | on insertion to or update of the attribute | No, if subqueries are used |
| Tuple-based `CHECK` | element of the relation schema | on insertion to or update of the relation or tuple | No, if subqueries are used |
| `ASSERTION` | element of the database schema | on any change to any mentioned relation | Yes |

* A stored procedure is a pre-defined, pre-compiled collection of SQL statements that lets business logic be stored and executed from SQL statements.
    * It can take input parameters and return values.
    * Syntax: {{`CREATE PROCEDURE <procedure_name> [(IN|OUT <parameter> <datatype>)] BEGIN <local-declarations> <procedure-body> END`}}
    * To run one: {{`CALL <procedure-name> (<argument-list>)`}}
    * To drop one: {{`DROP PROCEDURE [IF EXISTS] <procedure-name>`}}
* Ex. raise every instructor salary from one value to another:
    * {{`CREATE PROCEDURE raiseSalary (IN oldSalary DECIMAL(8,2), IN newSalary DECIMAL(8,2)) UPDATE instructor SET salary = newSalary WHERE salary = oldSalary;`}}
    * {{`SET @p0='62000'; SET @p1='64000'; CALL raiseSalary(@p0, @p1);`}}
* Ex. count boats with an `OUT` parameter:
    * {{`CREATE PROCEDURE countBoats (OUT param1 INT) SELECT COUNT(*) INTO param1 FROM Boats`}}
    * {{`CALL countBoats(@p0); SELECT @p0 AS boats_in_inventory;`}}
* Note: stored procedure syntax may vary by DBMS.
