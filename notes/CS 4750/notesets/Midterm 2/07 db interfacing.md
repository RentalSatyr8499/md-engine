* A database web app has four parts: the frontend, the web server, the driver, and the database server.
    * Frontend: `.html`, `.css`, `.js`, the interface where a user interacts with the system, submitting a form plus data.
    * Backend: `.php` on the web server, the program that interacts with the database.
    * Driver: `PDO`, the layer between the backend and the database.
    * Database server: the relational database itself.
    * The response recreates the interface or returns a result to the user, possibly via Ajax or an async program.
    * HTML may be combined into the PHP file.
* `PDO` (PHP Data Objects) is a database abstraction layer providing flexibility for many database engines, and CS 4750 recommends it over `MySQLi`.
    * `MySQLi` is a replacement for the MySQL functions, with object-oriented and procedural versions.
    * The same idea applies to other languages, for example Java with `JDBC`.
* To connect with `PDO`, you need four things: {{host name or IP address (and port if not the default), database name, username, password}}.
    * Set the Data Source Name: {{`driver:host=the-host-name;dbname=your-database-name`}}
    * Create the connection: {{`new PDO(dsn, username, password)`}}
    * Ex. XAMPP guestbook: {{`mysql:host=localhost:3306;dbname=guestbook`}} (MySQL in XAMPP uses port 3306 by default).
    * Ex. CS server: {{`mysql:host=mysql01.cs.virginia.edu;dbname=your-computingID`}} (default port, so no port is needed).
    * Ex. GCP App Engine to Cloud SQL: {{`mysql:unix_socket=/cloudsql/your-project-ID:us-east4:your-sql-instance-ID;dbname=your-database-name`}}.
    * Ex. non-GCP host to Cloud SQL: {{`mysql:host=your-cloud-instance-public-IP-address;dbname=your-database-name`}} (after authorizing your IP under Authorized networks).
* The maintenance request app (POTD 4) is the full loop: create a table, insert data, display existing requests, update requests, delete requests, and optionally drop the table.
    * After each step, verify in the database that the change actually happened, and verify that what the screen shows matches the database.
    * Deploy with XAMPP locally, on the CS server, or on GCP. Do not enter a credit card for GCP.
    * Before submitting code, remove your credentials from the connection file (for example `connect-db.php`).
* Tip: the focus is the database part, not the web programming part.
