* Fill out the table below.
| group | purpose | commands |
|---|---|---|
| {{DDL (Data Definition Language)}} | defines structures like tables, views, and indexes, that is the schema | CREATE, {{ALTER, DROP, TRUNCATE}} |
| {{DML (Data Manipulation Language)}} | works with the instance by retrieving, adding, modifying, and removing rows | SELECT, {{INSERT, UPDATE, DELETE}} |
| {{DCL (Data Control Language)}} | handles permissions and security | GRANT, REVOKE |
| {{TCL (Transaction Control Language)}} | manages transactions (logical units of work) | BEGIN TRANSACTION, COMMIT, ROLLBACK |
* TCL commands: 
    * {{`COMMIT`}}: makes changes permanent. 
    * {{`ROLLBACK`}}: undoes changes since the last commit. 
    * {{`BEGIN TRANSACTION`}}: sets a transaction boundary
* Identify the following data types and when to use each one.
| family | types | how to choose |
|---|---|---|
| `NUMBER` | `INT`, `DECIMAL(p,s)`, `FLOAT` and `DOUBLE` | Whole numbers with no decimals take {{`INT`}}. Exact decimals take {{`DECIMAL(p,s)`}}. Approximate decimals take {{`FLOAT`}} or {{`DOUBLE`}} |
| `TEXT` | `CHAR(n)`, `VARCHAR(n)`, `TEXT` | Fixed length takes {{`CHAR(n)`}}. Variable length takes {{`VARCHAR(n)`}}. Long paragraphs take {{`TEXT`}}|
| `DATE` and `TIME` | `DATE`, `TIME`, `DATETIME` and `TIMESTAMP` | N/A |
| other | `BOOLEAN`, `BLOB` | `BOOLEAN` is true or false. `BLOB` is Binary Large Object, which is {{a varying length binary string for files, images, video, and other large objects}} |
* To constrain a type to a certain size, write the size in parentheses after the type name. Ex. `VARCHAR(40)` holds up to {{40}} characters. `DECIMAL(p,s)` holds {{`p`}} digits in total with {{`s`}} of them after the decimal point.
* More commands: 
   * `REFERENCES`: declares a foreign key inline. Ex. if a table `person_phone` has a foreign key in the table `person` named `id`, the `CREATE` statement would look like... {{`person_phone(id INT REFERENCES person(id),... `}}
    * `FOREIGN KEY`: declares a foreign key as a table constraint, at the end of the `CREATE TABLE` instead of inline. Ex. if a table `makes` has a foreign key `cname` pointing at `company(cname)`, the constraint would look like... {{`FOREIGN KEY (cname) REFERENCES company(cname)`}}
    * `ALTER TABLE`: changes an existing table, for example by adding or dropping a column. Ex. to add a `ceo` column holding up to 40 characters to the `company` table, you would write... {{`ALTER TABLE company ADD ceo VARCHAR(40)`}}
    * `INSERT INTO`: adds new rows to a table. Ex. to add the student 9999 at "85 Engineer's Way" taking Database Systems with Humpty as TA to `Student_lecture`, you would write... {{`INSERT INTO Student_lecture VALUES ("9999", "85 Engineer's Way", "Database Systems", "Humpty")`}}
    * `UPDATE`: modifies existing rows. Without a `WHERE` clause every row changes, so always include one. Ex. to change the TA to Humpty for the student with `S_id` 5678, you would write... {{`UPDATE Student_lecture SET Teaching_assistant = "Humpty" WHERE S_id = "5678"`}}
    * `DELETE FROM`: removes rows from a table. Without a `WHERE` clause the whole table is emptied. Ex. to remove every row where Humpty is the TA, you would write... {{`DELETE FROM Student_lecture WHERE Teaching_assistant = "Humpty"`}}
    * `SELECT`: retrieves data from a table. `*` returns every column, and naming columns instead is called projection. Ex. to get just the `S_id` and `Course` columns from `Student_lecture`, you would write... {{`SELECT S_id, Course FROM Student_lecture`}}
    * `DISTINCT`: removes duplicate values from the output. Ex. to list each teaching assistant only once, you would write... {{`SELECT DISTINCT Teaching_assistant FROM Student_lecture`}}
    * `LIKE`: matches text patterns, where `%` is the wildcard. Ex. to keep only course names starting with Data, the condition would look like... {{`WHERE Course LIKE 'Data%'`}}
    * `ORDER BY`: sorts the output. Ascending is the default and `DESC` sorts descending. Ex. to list `S_id` and `Course` for every row except Dumpty's, sorted by `S_id` from largest to smallest, you would write... {{`SELECT S_id, Course FROM Student_lecture WHERE Teaching_assistant <> "Dumpty" ORDER BY S_id DESC`}}
    * `AS`: renames a column in the output. It also works on computed columns, like `two_week_hours/2`. Ex. to show `S_id` as `ID`, you would write... {{`SELECT S_id AS ID FROM Student_lecture`}}
* (T/F) Clauses execute in the order they are written. {{False! Regardless of the order they are written, clauses are executed like so: `FROM`, `WHERE`, `GROUP BY`, `HAVING`, `SELECT`, `ORDER BY`.}}
* `UNION`, `INTERSECT`, and `EXCEPT` combine the results of two queries: {{`UNION`}} keeps rows appearing in either result. {{`INTERSECT`}} keeps rows appearing in both. {{`EXCEPT`}} keeps rows in the first result but not the second
* "{{Aggregation functions}}" calculate one value across a whole set of rows or across groups of rows. SQL has `SUM`, `AVG`, `MIN`, `MAX`, and `COUNT`. 
    * {{The `NULL` value}} is ignored in any aggregation. 
    * `GROUP BY` collects rows into groups so each group produces one output row. Ex. `SELECT branch_name, SUM(amount) FROM loan GROUP BY branch_name` returns one total per branch. Several DBMSs require every non-aggregated column in the SELECT list to appear in the GROUP BY clause. Keep the GROUP BY list small and precise - extra columns slow the query and make it hard to read
* A "Cartesian product" pairs every row of one table with every row of the other. Most joins are a Cartesian product with the non-matching rows filtered out. `JOIN` combines related tables on key values:
| join | is the joined column repeated? | which rows survive? |
|---|---|---|
| NATURAL JOIN | {{no, the common column appears once}} | only rows with a match in both tables |
| (INNER) JOIN with ON | {{yes, both copies appear}} | only rows with a match in both tables |
| LEFT (OUTER) JOIN | depends on the NATURAL or ON form | every row of the left table, missing matches padded with {{NULL}} |
| RIGHT (OUTER) JOIN | depends on the NATURAL or ON form | every row of the right table, missing matches padded with {{NULL}} |
* An "outer join" augments a join with its dangling tuples. A dangling tuple is a row with no match in the other table. Outer joins keep it and pad the missing side with NULL values
* When it comes to nested subqueries, a "{{correlated}}" query is one whose inner query references the outer query, so it has to be re-evaluated for each outer row, while an "{{uncorrelated}} query" is one whose inner query is independent, so it runs just once.
    * Ex. the names of the employees earning the highest salary for their job is {{correlated}}, because the inner query filters on the outer row: `SELECT E1.ename FROM HW_emp E1 WHERE E1.sal = (SELECT MAX(E2.sal) FROM HW_emp E2 WHERE E1.job = E2.job)`
    * Ex. the names of the instructors earning the highest salary overall is {{uncorrelated}}: `SELECT name FROM instructor WHERE salary = (SELECT MAX(salary) FROM instructor)`
* {{`ANY` (exists)}}: checks if the comparison holds for at least one row the subquery returns. Ex. the names of the customers with some purchase over $1000: `SELECT DISTINCT T1.name FROM Customer T1 WHERE 1000 < ANY (SELECT price FROM Purchase T2 WHERE T1.custId = T2.custId)`
* {{`ALL` (for all)}}: checks if the comparison holds for every row the subquery returns. Ex. the names of the customers whose purchases are all over $1000: `SELECT DISTINCT T1.name FROM Customer T1 NATURAL JOIN Purchase WHERE 1000 < ALL (SELECT T2.price FROM Purchase T2 WHERE T1.custId = T2.custId)`
* {{`EXISTS` / `NOT EXISTS`}}: tests whether the subquery returns any rows at all. Ex. the branch names with customers having both loans and accounts: `SELECT T1.branch_name FROM account T1 WHERE EXISTS (SELECT * FROM depositor D NATURAL JOIN borrower B WHERE D.account_number = T1.account_number)`
* {{`IN` / `NOT IN`}}: tests membership in what the subquery returns, which also {{decorrelates}} the query. Ex. the same branches query without correlation: `SELECT T1.branch_name FROM account T1 WHERE T1.account_number IN (SELECT D.account_number FROM depositor D NATURAL JOIN borrower B)`
    * `IN` with a literal list is just shorthand for `OR`. `WHERE course_id IN ('CS-101', 'CS-315', 'BIO-101')` means the same as chaining the three `=` tests with `OR`.
* "For all" questions are usually rewritten as "there does not exist": to find the customers whose purchases are only over $1000, first find the customers with some purchase at or under $1000, then exclude them.
    * With `NOT IN`: {{`SELECT T1.name FROM Customer T1 NATURAL JOIN Purchase P WHERE T1.custId NOT IN (SELECT T2.custId FROM Purchase T2 WHERE T2.price <= 1000)`}}
    * With `NOT EXISTS`: {{`SELECT T1.name FROM Customer T1 NATURAL JOIN purchase WHERE NOT EXISTS (SELECT * FROM purchase T2 WHERE T1.custId = T2.custId AND T2.price <= 1000)`}}
