* Every process has a {{user ID}}, which the kernel uses to decide what the process is allowed to do. 
    * You can retrieve the “effective user ID” in C with `{{geteuid}}()`.
    * Processes also have a group ID, retrieved in C with `{{getegid}}()`.
    * During login, a program checks the password, then changes the {{user IDs of the process}} to match the authenticated user.
* Every file has permissions associated with it called POSIX permissions. There are {{9}} bits: three sets of {{read/write/execute}} for {{user (`u`)}}, {{group (`g`)}}, and {{other (`o`)}}.
    * For example, `700` translates to {{user rwx, group ---, other ---}}.
    * For example, `451` translates to {{user r--, group r-x, other --x}}.
    * `chmod` can set exact permissions. For example, if you wanted to give only the user permissions to read, write, and execute `myFile`, run {{`chmod 700 file`}} or {{`chmod u+rwx myFile`}}.
* POSIX Access Control Lists ("ACL"s) allow more flexible rules than the basic user/group/other bits, because you can set perms for {{multiple different users and multiple different groups by name}}. We can modify ACLs using the  {{`setfacl -m`}} command. 
    * For example, if I wanted to give user `mst3k` read and write permissions to `myFile`, I would run {{`setfacl -m u:mst3k:rw myFile`}}.
    * For example, if I wanted to give group `lab_fall2019` read permissions to `myFile`, I would run {{`setfacl -m g:lab_fall2019:r myFile`}}.
    * For example, if I wanted to remove user `mst3k` from the permission list, I would run {{`setfacl -x u:mst3k`}}.
* User ID 0 is special kind of user called the {{superuser}}. This user automatically {{has almost all permission checks}}.
    * Superuser is still user mode (not kernel mode)! Kernel mode is a hardware privilege level used only by the OS.
    * `sudo` runs a program with superuser permissions. It is able to do this because it has the {{setuid}} permission.
        * SetUID lets the user run an executable with the permissions of the executable's owner. For example, executable `myExe` is owned by `mst3k` and has setuid permissions, then when `xaq7pj` runs `./myExe`, the program actually runs as {{`mst3k`, not as `xaq7pj`}}.
        * `sudo`'s owner is {{root aka user ID 0 aka the superuser}}. That means anyone who runs `sudo` runs it as {{root}}.
        * In general, setuid programs must be responsible for {{carefully checking which user invoked them}}.
* Define "privilege escalation": {{vulnerabilities that allow a user or program to gain more privileges than intended}}.

* Exerciseee: Which of the following is possible to achieve in theory using **user accounts**? (Even if OSes don't do it often, if it's still possible, select yes)
| action | possible? | explanation |
|--------|--------|--------|
| limit which system calls may be used | {{possible}} | {{kernel can check UID and deny specific syscalls}} |
| limit which peripheral devices can be accessed | {{yes}} | {{devices are files; file permissions restrict access}} |
| limit which parts of an accessible file can be accessed | {{no!}} | {{permissions apply to whole files, not byte ranges}} |
| limit which instructions can be run | {{not possible}} | {{CPU forbids privileged instructions for all user mode}} |
| limit which files on a storage device can be accessed | {{possible}} | {{file permissions control per‑user file access}} |
| limit how much memory can be malloced | {{possible!}} | {{per‑user resource limits (rlimits) can cap memory}} |
