* FERPA (Family Educational Rights and Privacy Act) limits what an institution can disclose without consent.
    * Disclosable without consent: {{name, email, photographs, phone number}}.
    * Revealing sensitive information violates FERPA, so be careful with what information can be queried and made available to users.
* Sensitive information comes in three kinds:
    * Personal identifiers: {{name, student ID, social security number, license number, passwords}}.
    * Context specifics: {{grade, GPA, learning performance}}.
    * Protected data (for legal and/or ethical reasons): {{academic records (FERPA), protected health information and medical records (HIPAA), customer records (GLBC)}}.
* DB security involves protecting the database from unauthorized access, modification, or destruction, and it must be part of the organization's overall information system security plan.
* Privacy is the right of individuals to have some control over information about themselves, and it is protected by laws that vary significantly by country.
* The three goals of information security:
| goal | requires |
|---|---|
| Confidentiality | only authorized users have access to information |
| Integrity | only authorized users are allowed to modify data |
| Availability | information is accessible to authorized users when needed |
* A vulnerability is a weakness in a system (for example inappropriate access control or loopholes in a firewall) that allows a threat to occur.
* Security threats can occur accidentally or deliberately:
| accidental | deliberate |
|---|---|
| User errors (requesting an object or operation they should not be authorized for) | A user intentionally gains unauthorized access or performs unauthorized operations for personal gain |
| Communication system errors (message to the wrong user, connecting a user to another user's session) | A disgruntled employee familiar with the system |
| OS or database server errors (overwriting or destroying files, fetching the wrong data, failing to erase data that should be erased) | Industrial spies, wiretapping, electronic eavesdropping, reading unsupervised screens or printouts, impersonating authorized users, programs that bypass the DBMS, and deriving hidden data by clever querying (SQL injection) |
* A security plan: define physical security and information system access control, secure the building, install and configure the DBMS securely, create and secure user accounts with appropriate access control, enforce standards for apps that access the database, encrypt sensitive data, secure network connections, establish audit mechanisms, and guard against threats with controls and updates.
* Four parts of information system access control:
    * Authorization: {{defines who has access to the system and what operations they can perform on what specific data}}.
    * Identification: {{the way users are identified (for example ID, biometrics)}}.
    * Authentication: {{verifies the identity of a user, checking it against the user profile, kept secure and possibly in encrypted form}}.
    * Accountability: {{capturing and maintaining log files for traceability when security incidents occur}}.
* Six levels that impact DB security (breaches can happen at any of them, and security covers the entire database application, not only the database):
| level | protects |
|---|---|
| Database level | database users and authorization |
| Application level | information management and processing |
| Operating system level | data storage and protection |
| Network level | data transmission |
| Physical level | computer equipment |
| Human level | social engineering |
* Database level privileges:
    * By default, the DB creator (or admin) is a superuser with global privileges on the DB system.
    * Privileges include: {{select, insert, update, delete, file privileges (import from a file), create, alter, index, drop, view, altering/creating/executing routines such as stored procedures, assertion, check, trigger, and grant}}.
    * Grant means giving permission to another user, possibly your similar permissions or permissions on certain tables, columns, or rows.
    * General users have no global privileges, only select, insert, and update privileges, but have global privileges on their own DB, including the grant option.
* Views are a security mechanism: a view is a relation defined by a query, used to hide structures and data the user should not see.
    * Value-dependent view: restricts data with a specific `WHERE` clause in the view definition. Ex. {{`CREATE VIEW CSMajor AS (SELECT sid, lname, fname, credits FROM student WHERE major = 'CS')`}}
    * Value-independent view: restricts data with specific columns of the base tables. Ex. {{`CREATE VIEW MajorView AS (SELECT sid, lname, fname, major FROM student)`}}
    * Views also increase logical data independence (general presentations of the schema) and physical data independence (partitioning).
* More security mechanisms:
    * Access control management: limits access per DB object (table, view, attributes), per user, per operation.
    * Security log: keeps a record of all attempted security violations.
    * Audit trail: records all access to the DB, including requestor, operation performed, workstation used, time, data items, and value involved.
    * Triggers: set up an audit trail on a table, recording all changes, the time they were made, and the identity of the user who made them.
    * Ex. audit log for purchases: {{`CREATE TRIGGER purchase_auditTrail BEFORE UPDATE ON purchase FOR EACH ROW INSERT INTO purchase_audit VALUES (CURRENT_DATE, CURRENT_USER, old.purchase_date, old.pid, old.custid, old.price, new.price)`}}
    * Encryption: should be used whenever data is communicated to other sites. MySQL has built-in hashing methods, but encryption adds overhead, so only encrypt the passwords. Hashing at the application level is more efficient.
* Three access control policies:
| policy | how it works |
|---|---|
| Role-Based Access Control (RBAC) | Group-level permission: what can users of this role do. Permissions per role, users are only granted a role, normally static, very few roles, centrally administered, easy to manage, commonly used by large organizations |
| Mandatory Access Control (MAC) | Classification or privacy level, permissions per classification, most often used in military systems with emphasis on confidentiality and centralized control. Users cannot override the policy or grant access to another user, and policies are guaranteed to be enforced for all users. Not used much in database systems nowadays |
| Discretionary Access Control (DAC) | Personal permission: who has access, what they can do. Permissions per resource, change often, least restrictive. The business owner decides who can do what, the data owner manages their own content and can pass permission to others, and permissions given to an individual are inherited into other programs they use, potentially leading to malware executed without the user knowing |
* Choosing a policy:
    * Highly confidential or sensitive information: {{use MAC or RBAC}}.
    * Letting certain people enter: {{DAC is simplest and most popular}}.
    * High security needed: {{DAC is not a good option, since it is the least restrictive and can inherit and transfer}}.
* SQL Data Control Language (DCL) grants and revokes authorization privileges.
    * A privilege is an action (such as creating, executing, reading, updating, deleting) that a user is permitted to perform on a database object.
    * {{`GRANT { ALL PRIVILEGES | privilege-list } ON { object-name } TO { PUBLIC | user-list | role-list } [WITH GRANT OPTION]`}}
    * {{`REVOKE { ALL PRIVILEGES | privilege-list } ON object-list FROM { PUBLIC | user-list | role-list } [CASCADE | RESTRICT]`}}
    * Ex. grant all to a subaccount: {{`GRANT ALL ON abc1x.* TO 'abc1x_a'@'%'`}} (`*` is all tables, `%` is the host, note the single quotes).
    * Ex. specific permissions: {{`GRANT SELECT, INSERT, UPDATE, DELETE ON abc1x.* TO 'abc1x_a'@'%'`}}
    * Ex. on one table: {{`GRANT SELECT, INSERT, UPDATE ON abc1x.customer TO 'abc1x_a'@'%'`}}
    * To review privileges: {{`SHOW GRANTS FOR 'abc1x_a'@'%'`}} or {{`SHOW GRANTS FOR CURRENT_USER`}}.
    * Note: per CS department policy, students cannot create users or roles on the CS server. The helpdesk created four subaccounts per computing ID (for example `abc1x_a`, `abc1x_b`, `abc1x_c`, `abc1x_d`) with the same password as the main account's initial password.
* Roles:
    * {{`CREATE ROLE AdvisorRole`}}
    * {{`GRANT SELECT ON Student_table TO AdvisorRole`}}
    * {{`GRANT AdvisorRole TO 'abc1x_a'@'%'`}}
    * Roles can be granted to roles for inheritance: {{`GRANT FacultyRole TO AdvisorRole`}}
    * Ex. revoke: {{`REVOKE INSERT ON Student_table FROM 'abc1x_a'@'%'`}}
    * To revoke only the grant option: {{`REVOKE GRANT OPTION FOR INSERT ON Student_table FROM 'abc1x_a'@'%'`}}
    * By default, if the user passed on the revoked privileges, the revocation cascades; with `RESTRICT`, a revocation that would cascade is not performed.
* Ex. authorization graph: the DBA grants `SELECT, INSERT, UPDATE ON Student TO U1, U2, U3 WITH GRANT OPTION`.
    * U1 passes it to U21 and U22 without the grant option.
    * U2 passes it to U22 with the grant option.
    * U3 passes it to U23 and U24 without the grant option.
    * U22 passes it to U31 without the grant option.
    * Improperly granting privileges may lead to a security vulnerability.
* Application level defenses:
    * Guard against SQL injection with prepared statements, which happen in two phases: prepare (send a template to the server, which analyzes the syntax and initializes the internal structure), then bind value and execute (user inputs are treated as strings, never run as scripts, substituted into the template, then executed).
    * Implement thorough input validation, use strong typing to prevent type errors, catch and handle all errors properly, and use a secured channel such as SSH or VPN.
    * Encrypt data when possible. At the application level in PHP: {{`htmlspecialchars(incoming_password)`}} stops script tags from executing by rendering them as plaintext, {{`password_hash(incoming_password, algorithm_to_hash)`}} creates a password hash, and {{`password_verify(incoming_password, existing_hashed_password)`}} returns true if they match and false otherwise.
* Operating system level: set up firewalls and virus protection, do not install adware or spyware, do not use wizards when installing software (clicking through the SQLServer wizard automatically creates a user with no password, a free superuser), hide and lock the machine, run a minimal set of programs, close all ports, and lock the interfaces.
* Network level: hide the server (do not make it world visible), separate the database server from the web server, limit connections to the database server to trusted sources only (for example the trusted web server, by IP or MAC), let only the application connect to the database, do not use a default port, separate the server for authentication, and set up firewalls.
* Physical level: always lock everything that can impact the database (door, box, backups), implement building security measures (badges, barriers, locked door, sign-in), and have a good backup plan with offsite and online copies, daily, weekly, monthly, and yearly.
* Human level: only give enough permissions to the right users, never give out your password, education and training about scams, viruses, and handling your computer, log off when not in use, never bring software from home to put on at work, and explain and enforce policies for not following the rules.
* Other things to consider: a uniform approach to security across systems and databases, the identification or authorization process required to create an account, who creates user accounts and how, standard password conventions and expiration, how users are tracked for accountability, and levels of penalties for security breaches.
    * Digital signatures use double encryption to create secure two-way communications that cannot be repudiated.
    * SSL (Secure Sockets Layer) with certification authorities (for example Verisign) verifies that a site is genuine.
    * SET (Secure Electronic Transaction) provides additional security for credit card information.
* Wrap-up: properly handling grant privileges can help prevent SQL injection attacks (for example, a drop-all-tables command will fail without the privilege). If someone breaks in using a superuser, the attacker has the ability to do anything with global permissions, so do not give global permissions to any users. For your own databases, grant permissions to subuser accounts, set privileges so only certain commands can be performed on certain tables, and only grant a user enough privileges to do their job.
