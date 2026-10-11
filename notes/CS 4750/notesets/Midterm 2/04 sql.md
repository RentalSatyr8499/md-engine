* "SQL" is Structured Query Language. It is declarative, which means you describe what data you want and the database engine figures out how to retrieve it efficiently
* Identify the four command groups in SQL.

| group | full name | purpose | commands |
|---|---|---|---|
| DDL | Data Definition Language | defines structures like tables, views, and indexes, that is the schema | CREATE, ALTER, DROP, TRUNCATE |
| DML | Data Manipulation Language | works with the instance by retrieving, adding, modifying, and removing rows | SELECT, INSERT, UPDATE, DELETE |
| DCL | Data Control Language | handles permissions and security, that is who can do what on which part of the database | GRANT, REVOKE |
| TCL | Transaction Control Language | manages transactions, which are logical units of work | BEGIN TRANSACTION, COMMIT, ROLLBACK |

* "COMMIT" makes changes permanent. "ROLLBACK" undoes changes since the last commit. "BEGIN TRANSACTION" sets a transaction boundary
* Identify the following data types and when to use each one.

| family | types | how to choose |
|---|---|---|
| NUMBER | INT, DECIMAL(p,s), FLOAT and DOUBLE | Whole numbers with no decimals take INT. Exact decimals take DECIMAL(p,s). Approximate decimals take FLOAT or DOUBLE |
| TEXT | CHAR(n), VARCHAR(n), TEXT | Fixed length takes CHAR(n). Variable length takes VARCHAR(n). Long paragraphs take TEXT |
| DATE and TIME | DATE, TIME, DATETIME and TIMESTAMP | Date only takes DATE. Time only takes TIME. Date and time together take DATETIME or TIMESTAMP |
| other | BOOLEAN, BLOB | BOOLEAN is true or false. "BLOB" is Binary Large Object, a varying length binary string for files, images, video, and other large objects |

* To constrain a type to a certain size, write the size in parentheses after the type name. VARCHAR(40) holds up to 40 characters. CHAR(3) holds exactly 3 characters. DECIMAL(p,s) holds p digits in total with s of them after the decimal point
* Identify how each E-R construct becomes a SQL table.

| E-R construct | SQL mapping |
|---|---|
| Strong entity set | One table named after the entity set. Attributes become columns and the primary key stays the primary key |
| Composite attribute | Flatten it into one column per component. Do not keep the higher level attribute |
| Multivalued attribute | A separate table named entityname_attributename holding the entity key and the values. The primary key is all attributes |
| One to one relationship | Option 1. A table for each entity set plus a relationship table with UNIQUE on both keys. Option 2. Store one primary key inside the other entity table as a foreign key. Fewer tables and empty values are possible |
| Many to many relationship | A table for each entity set plus a relationship table holding both primary keys |
| One to many relationship | Option 1. A table for each entity set plus a relationship table. Option 2. Store the key of the one side inside the many side as a foreign key. Fewer tables and empty values are possible |
| Total participation | Option 1. A FOREIGN KEY constraint. Option 2. A NOT NULL constraint on the foreign key column |
| Multi-way relationship | One table per entity set plus one relationship table holding all the keys |
| Weak entity set | One table holding the strong entity primary key, the discriminator, and the weak entity attributes. The primary key is the strong key plus the discriminator |

* "REFERENCES" declares a foreign key inline. person_phone(id INT REFERENCES person(id), phone VARCHAR(10), PRIMARY KEY (id, phone)). "FOREIGN KEY" declares it as a table constraint. FOREIGN KEY (cname) REFERENCES company(cname)
* "ALTER TABLE" changes an existing table. ALTER TABLE company ADD ceo VARCHAR(40) adds a column. ALTER TABLE company DROP ceo removes it
* Contrast DROP, TRUNCATE, and DELETE.

|  | DROP | TRUNCATE | DELETE |
|---|---|---|---|
| language | DDL | DDL | DML |
| syntax | DROP TABLE table_name | TRUNCATE TABLE table_name | DELETE FROM table_name WHERE condition |
| what it removes | the table definition and all its data | all rows, keeps the schema | specific rows |
| WHERE clause | cannot use | cannot use | can use |
| speed | destroys everything at once | faster than DELETE | slower, logs each deletion |
| AUTO_INCREMENT | gone with the table | resets it | does not reset it |
| indexes, constraints, triggers | deletes them | keeps them | keeps them |
| rollback | cannot reverse, implicit COMMIT | cannot reverse, implicit COMMIT | rollback is possible inside a transaction |

* "INSERT INTO" adds new rows. INSERT INTO Student_lecture VALUES ("9999", "85 Engineer's Way", "Database Systems", "Humpty") adds one full row
* "UPDATE" modifies existing rows. UPDATE Student_lecture SET Teaching_assistant = "Humpty" WHERE S_id = "5678" changes the TA for one student. Without a WHERE clause every row changes, so always include one
* "DELETE FROM" removes rows. DELETE FROM Student_lecture WHERE Teaching_assistant = "Humpty" removes every row with that TA. Without a WHERE clause the whole table is emptied
* "SELECT" retrieves data. SELECT * FROM Student_lecture returns every column and row. Naming columns instead of * is called "projection". SELECT S_id, Course FROM Student_lecture returns just those two columns
* "WHERE" filters rows and conditions combine with AND, OR, and NOT. SELECT S_id, Course FROM Student_lecture WHERE Teaching_assistant = "Minnie" OR Teaching_assistant = "Mickey"
* "DISTINCT" removes duplicate values from the output. SELECT DISTINCT Teaching_assistant FROM Student_lecture lists each TA once. Without DISTINCT, duplicates may appear in the output of an operator
* "LIKE" matches text patterns where % is the wildcard. WHERE Course LIKE 'Data%' matches every course name starting with Data
* "ORDER BY" sorts the output. Ascending is the default and DESC sorts descending. SELECT S_id, Course FROM Student_lecture WHERE Teaching_assistant <> "Dumpty" ORDER BY S_id DESC
* "AS" renames a column in the output. SELECT S_id AS ID, Course AS "Course Name" FROM Student_lecture. Arithmetic works in the select list too. SELECT Name, two_week_hours/2 AS Hours_per_week FROM hiring
* Tip on writing queries. Translate and clean up in two passes. First rewrite the English request so it names the exact columns and the table. Then write the SQL. "How many days elapsed between the order date and the ship date for each order" becomes "select the order number, order date, ship date, and ship date minus order date as DaysElapsed from the Orders table" which becomes SELECT OrderNumber, OrderDate, ShipDate, (ShipDate - OrderDate) AS DaysElapsed FROM Orders
![alt text](image.png){size=medium}
* Steps to execute a query. Clauses are written in one order but execute in another.
    1. FROM generates the data set by opening an iterator over the table
    2. WHERE filters the data set row by row
    3. GROUP BY aggregates the filtered rows. Note that GROUP BY does not sort the result set
    4. HAVING filters the groups
    5. SELECT transforms the remaining data into the output columns
    6. ORDER BY sorts the output
* (T/F) Clauses execute in the order they are written. F. SELECT is written first but executes fifth, after FROM, WHERE, GROUP BY, and HAVING
* "UNION", "INTERSECT", and "EXCEPT" combine the results of two queries. UNION keeps rows appearing in either result. INTERSECT keeps rows appearing in both. EXCEPT keeps rows in the first result but not the second

| requirement | meaning |
|---|---|
| same number of columns | both sub-results must select the same number of columns |
| same column order | the columns must appear in the same order in both |
| compatible types | each pair of columns must have similar or compatible data types |

* (T/F) INTERSECT and EXCEPT work in every version of MySQL. F. They are not supported in MySQL 5.6 and 5.7. They work in MySQL 8.0 and in MariaDB
* "Aggregation functions" calculate one value across a whole set of rows or across groups of rows. SQL has five of them.

| function | what it produces |
|---|---|
| SUM | the sum of a numerical column |
| AVG | the average of a numerical column |
| MIN | the smallest value in a column |
| MAX | the largest value in a column |
| COUNT | the number of values in a column, not necessarily distinct |

* Contrast the three forms of COUNT.

| form | what it counts |
|---|---|
| COUNT(*) | every row, including rows where the column is NULL |
| COUNT(column) | only rows where the column is not NULL |
| COUNT(DISTINCT column) | unique non-NULL values of the column |

* On the loan table, SELECT SUM(amount) FROM loan returns 8700. SELECT AVG(amount) FROM loan returns 1242.857. SELECT COUNT(*) FROM loan returns 7. SELECT COUNT(DISTINCT branch_name) FROM loan returns 5
* Identify how NULL interacts with aggregation.
    * The NULL value is ignored in any aggregation. It does not contribute to a sum, an average, or a count, and it cannot become a minimum or a maximum
    * NULL is treated as an ordinary value when forming groups, so a group with NULL attributes can exist
    * Aggregating an empty set of values returns NULL, except COUNT which returns 0
* Contrast WHERE and HAVING.

|  | WHERE | HAVING |
|---|---|---|
| filters | individual rows | groups |
| runs | before GROUP BY | after GROUP BY |
| unaggregated columns allowed | any column | only columns in the GROUP BY list |

* "GROUP BY" collects rows into groups so each group produces one output row. SELECT branch_name, SUM(amount) FROM loan GROUP BY branch_name returns one total per branch
* Tip on GROUP BY. Several DBMSs require every non-aggregated column in the SELECT list to appear in the GROUP BY clause. Keep the GROUP BY list small and precise. Extra columns slow the query and make it hard to read
* "JOIN" combines related tables on key values. Every table needs a unique identifier, the primary key. A related table holds a copy of it, the foreign key, which describes the relationship between the tables
* Identify the join types.

| join | the repeated column | which rows survive |
|---|---|---|
| NATURAL JOIN | no, the common column appears once | only rows with a match in both tables |
| (INNER) JOIN with ON | yes, both copies appear | only rows with a match in both tables |
| LEFT (OUTER) JOIN | depends on the NATURAL or ON form | every row of the left table, missing matches padded with NULL |
| RIGHT (OUTER) JOIN | depends on the NATURAL or ON form | every row of the right table, missing matches padded with NULL |

* (T/F) FULL JOIN is used often. F. The slides call it uncommon, so we skip it
* A "Cartesian product" pairs every row of one table with every row of the other. SELECT * FROM one, two and SELECT * FROM one JOIN two with no ON clause both produce it. Most joins are a Cartesian product with the non-matching rows filtered out
* Joins run as a nested loop. For each row1 in the left table and for each row2 in the right table, output the pair when the join attributes match. With a natural join, skip the pair and move on when there is no match
* An "outer join" augments a join with its dangling tuples. A dangling tuple is a row with no match in the other table. Outer joins keep it and pad the missing side with NULL values
* "Self join" joins a table with itself. It is useful when you need two copies of the same table, for example when a foreign key references the table's own primary key. Always use aliases to tell the copies apart

## Exercises
* "Find the names of all TAs assigned to both Database Systems and Software Analysis." One alias fails. SELECT H.Name FROM Hiring AS H, TA_Assignment AS T WHERE H.TA_id = T.TA_id AND T.Course = "Database Systems" AND T.Course = "Software Analysis" returns the empty set, because a single row cannot have two courses at once. Two aliases work. SELECT H.Name FROM Hiring AS H, TA_Assignment AS T1, TA_Assignment AS T2 WHERE H.TA_id = T1.TA_id AND H.TA_id = T2.TA_id AND T1.Course = "Database Systems" AND T2.Course = "Software Analysis" returns Minnie and Humpty
* "For each sailor, find the number of boats they reserved." A plain NATURAL JOIN misses sailors who reserved nothing, so the zero counts never appear. A NATURAL LEFT OUTER JOIN keeps every sailor and COUNT(bid) returns 0 for the unmatched ones, because COUNT ignores NULLs. A correlated subquery in the SELECT list does the same. SELECT sname, (SELECT COUNT(bid) FROM Reserves WHERE Sailors.sid = Reserves.sid) FROM Sailors. Counting an empty result gives 0
* A "subquery" is a query inside another query. Subqueries can nest inside subqueries. The core idea is to split the problem into smaller sub-problems, solve each one separately, then compose the answers. Smaller problems are simpler to solve and easier to debug
* Identify the four things a subquery can return and where each one goes.

| returns | goes in | example use |
|---|---|---|
| a single value | a SELECT clause | compute an associated value per row, like the average salary of each person's job |
| a single value | a WHERE clause | compare against another value, like keeping employees whose salary equals the max for their job |
| a relation | a WHERE clause | compare or test a set of rows |
| a relation | a FROM clause | use the subquery result as input to the outer query |

* Contrast correlated and uncorrelated subqueries.

|  | correlated | uncorrelated |
|---|---|---|
| meaning | references the outer query | independent of the outer query |
| execution | recomputed for each tuple of the outer query | runs once on its own |
| can it run alone | no | yes |

* A correlated subquery in the SELECT list. SELECT E1.empno, E1.ename, (SELECT AVG(E2.sal) FROM practice_emp AS E2 WHERE E1.job = E2.job) FROM practice_emp AS E1 shows each person with the average salary of their own job
* A correlated subquery in WHERE. SELECT E1.ename FROM practice_emp AS E1 WHERE E1.sal = (SELECT MAX(E2.sal) FROM practice_emp AS E2 WHERE E1.job = E2.job) finds the name of every employee earning the highest salary for their job
* An uncorrelated subquery in FROM. SELECT E1.empno, E1.ename, E2.avg FROM practice_emp AS E1, (SELECT job, AVG(sal) AS avg FROM practice_emp GROUP BY job) AS E2 WHERE E1.job = E2.job computes each job average once, then joins it back to the employees
* "WITH" names a temporary relation so the query reads top to bottom. WITH temp AS (SELECT job, MAX(sal) AS maxSal FROM practice_emp GROUP BY job) SELECT E1.ename FROM practice_emp AS E1, temp AS T WHERE E1.sal = T.maxSal AND E1.job = T.job. WITH is not supported in MySQL 5.6 and 5.7. It works in MySQL 8.0 and in MariaDB
* "Find the IDs and names of all customers who purchased products sold by company 7777 only." Split it in two. First find all customers who purchased anything, with the companies they bought from. Then find all customers who purchased from companies other than 7777. EXCEPT keeps the difference. (SELECT T3.custId, T3.name FROM (SELECT T1.custId, T2.cid FROM Purchase T1 NATURAL JOIN Product T2 GROUP BY T1.custId, T2.cid) T NATURAL JOIN Customer T3) EXCEPT (SELECT T3.custId, T3.name FROM (SELECT T1.custId FROM Purchase T1 NATURAL JOIN Product T2 WHERE T2.cid <> 7777 GROUP BY T1.custId) T NATURAL JOIN Customer T3)
* Tip on EXCEPT and INTERSECT in MySQL. When the DBMS does not support them, rewrite with joins. EXCEPT becomes a LEFT OUTER JOIN with WHERE result2.custId IS NULL, which keeps rows of the first result with no match in the second. INTERSECT becomes an inner JOIN on the key with SELECT DISTINCT
* Tip on nested queries. Avoid deeply nested queries when aiming for speed, and be careful about nested query semantics. A correlated subquery runs once per outer row
