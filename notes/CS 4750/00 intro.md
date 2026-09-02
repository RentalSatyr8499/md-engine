* Identify the following: 
    * "{{Operational}}" database: A database that stores dynamic data that can change constantly ("reflect up-to-the-minute info")
    * "{{Analytical}}" databases: A database that stores or tracks historical, static data for the purpose of metrics
    * "{{Database Management System (DBMS)}}": "Software to create, manage, maintain, persist databases over long periods of time".
        * "{{Database engine}}": Allows data to be accessed,locked, and modified
        * "{{Database schema}}": Defines the database’s logical 
* Explain each of the following properties a good DBMS should have. 
    * Queryable and optimizes queries: {{It should be possible to retrieve data that you want. When someone asks for data, that data should be retrieved in a way that minimizes computational and spatial overhead}}.
    * Durable: {{The data should persist reliably and not be randomly lost}}.
    * Have schema: {{Information should be stored in a structured, sensible way}}.
    * No redundancy: {{Unecessary copies of data should be minimized to optimize space}}.
    * Handle concurrent transactions: {{Allow multiple users to simultaneously read/write data in a way that still preserves correctness}}.
* Define these: 
    * Data models: "{{how to describe real-world data}}"
    * Schema: {{description of tables}}
    * Instance: {{snapshot of data stored in DB at a given time}}
    * {{Data Definition Language (DDL)}}: commands that define or modify the database schema
    * {{Data Manipulation language (DML)}}: commands that query or change the actual data
    * Physical data independence: {{ability to change storage details without affecting the logical schema}}
    * Logical data independence: : {{ability to change the logical schema without affecting applications}}
    * Transactions: a sequence of database operations treated as a single logical unit of work.
        * To say that *a transaction should be atomic* means to say that {{the whole transaction happens entirely or not at all}}
        * To say that *a transaction should be consistent* means to say that {{the transaction preserves all database rules and constraints}}
        * To say that *a transaction should be isolated* means to say that {{the transaction runs as if no other transactions are executing at the same time}}
        * To say that *a transaction should be durable* means to say that {{once committed, the results persist even after crashes}}