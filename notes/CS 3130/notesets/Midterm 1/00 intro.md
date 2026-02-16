* Each {{process}} has its own virtual address space, while all processes share the same {{real (physical) memory}}.
    * The OS sets up a mapping so that every instruction and data access goes through translation before touching {{physical memory}}.
    * What does it mean to say that a process has "the illusion of dedicated memory"? {{Because each process has its own mapping, it appears to have private, contiguous memory. But the underlying physical memory is actually shared with other processes &z the OS}}.
    * Some regions are kernel‑mode only. Acessing them in {{user}} mode triggers an exception.
* What maintains the illusion that multiple programs run simultaneously on a single processor? {{ A single processor core can only execute one instruction at a time, but the OS rapidly switches between programs}}.
    *  Define "time slicing". Answer: {{when programs are interrupted and resumed repeatedly to optimize performance}}
        * A core is {{a hardware execution engine inside the CPU}}.
        * A thread is {{a sequence of instructions within a program that the core can run}}.
* {{Permissions}} determine which files, directories, and system operations a user or program is allowed to access.
* Layered network model (this was in the intro slides and there were past exam questions on it...):

| layer | function | examples |
|----------|----------|----------|
| application    | {{defines app‑level data meaning}}   | {{HTTP, SSH, SMTP}}   |
| transport    | {{ensures data reaches the correct program and may provide reliability or streams}}   | {{TCP, UDP }}  |
| network    | {{ensures data reaches the correct machine across networks}}   | {{IPv4, IPv6}}  |
| link    | {{coordinates access to the shared medium (wire or radio)}}   | {{Ethernet, Wi‑Fi}}  |
| physical    | {{encodes bits onto the wire or radio}}   | {{copper wire, bluetooth}}  |

*  
    * DNS is a naming system that maps {{human-readable names}} (ex. www.virginia.edu) to {{machine-usable IP addresses}} (ex. 128.143.22.36).
    * {{DHCP}} gives your machine an IP address (and other config).
* {{Caching}} is an optimization where the CPU keeps data in faster/closer storage so it doesn’t have to wait for slow main memory.
* Sometimes, adding more independent instructions (ex. two `add` instructions per loop instead of one) actually does not increase runtime.
* Memory grows {{down}}wards in memory.
* Will the following result in errors? If it doesn't, explain what it does.
    * `ptr = (int)single;` {{yes, because you're assigning a non-pointer value to a pointer}}
    * `*(ptr + 2)` {{no, it's equivalent to `ptr[2]`}}
    * `ptr > 0x28` {{yes, you can't compare pointers to integers}}
    * `ptr = &single;` {{no error. It.stores the address of a variable}}.
    * `ptr + 2` {{no error. It moves forward by two int elements (not two bytes)}}.
