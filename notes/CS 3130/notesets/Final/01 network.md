* Machines use a layered architecture system to communicate with one another via networks. Fill out the table below. 
|layer|what is it responsible for?|examples|units (what do they send out)?|
|-----|---------------------------|--------|----|
|application|{{applying the data/interpreting data in a way that is relevant to the program's usages}}|{{HTTP, SSH, SMTP}}|N/A|
|transport|{{ensures data reaches the correct program; might support reliability or streaming}}|{{TCP, UDP}}|{{segments or datagrams}}|
|network|{{ensures data reaches the correct machine}}|{{IPv4, IPv6}}|{{packets}}|
|link|{{coordinates access to medium that is locally shared between machines}}|{{Ethernet, wifi}}|{{frames}}|
|physical|{{encodes bits onto the medium}}|{{copper wire, bluetooth}}|N/A|
* Sometimes, messages get lost on the network layer. One way to deal with this is using acknowledgements and timeouts.
    * A sends a mesage.
    * If B receives it, then B does the following: {{replies with an acknowledgement packet}}.
    * If {{A doesn’t receive the acknowledgement after the timeout has gone off}}, A retransmits the message.
* There are a number of different problems that arise when sending messages over the transport layer. Fill out the table below.
|problem|how it happens|solution|how the solution works|
|---------|---------------|----------|----------------------|
|message is lost|poor connection drops A's packet before it reaches B|{{retransmission}}|{{B sends an ACK for every message it receives; if A doesn't get an ACK within a timeout window, it resends}}|
|duplicate messages|B's ACK is so slow, that {{A's timeout fires and A resends already-recieved content}}|deduplication using {{sequence numbers}}|{{every message gets a sequence number; B discards any packet whose number it has already seen}}|
|packets arrive out of order|network routes different packets through different {{paths}}; a later packet arrives before an earlier one|{{sequence numbers}}|{{B uses sequence numbers to reorder incoming packets before reconstructing the message}}|
|message is corrupted|a {{bit}} flip somewhere in transit changes the content |{{checksum}}|{{sender appends a checksum computed from the message; receiver recomputes it and drops the packet if the values don't match}} |
| waiting for each ACK before sending the next packet wastes time | it's just slow | {{use a transmission window}} | {{sender transmits a window of N packets, then waits for ACKs for all N packets before moving on to the next window}}|
* The two transport-layer protocols we learn about in this class are {{TCP}} and {{UDP}}. Fill out the table below. (I'm really into tables these days.)
||TCP ("make it *look like* a clean stream of bytes")|UDP ("just expose the raw network")|
|is transmission reliable?|{{`Y`}}|{{`N`}}|
|what size of data can be sent via this protocol?|{{lots of data}}|{{short messages only}}|
|under this protocol, can it be guaranteed that `write(fd, "a", 1); write(fd, "b", 1) == write(fd, "ab", 2)`?|{{`Y`}}|{{`N`}}|
|under this protocol, is it possible for multiple sockets to talk to one program?|{{`N`}}|{{`Y`}}|
|under this protocol, what does it mean to "connect"?{{|the server has responded and the handshake was successful}}|{{simply that the default destination has been set}}|
* The two network-layer protocols we learn about in this class are {{IPv4}} and {{IPv6}}. 
    * For IPv4: Addresses are in {{32}} bits. There are {{four}} parts to the address, which are {{8}} bits each. Each part is expressed in {{decimal}} form and separated by {{dots (.)}}. 
    * For IPv6: Addresses are in {{128}} bits. There are {{eight}} parts to the address, which are {{16}} bits each. Each part is expressed in {{hex}} form and separated by {{colons (:)}}. 
        * In IPv6, a double colon (::) means {{shorthand for a string of zeroes}}.
    * Why do we have both protocols? When IPv4 addresses ran out, people came up with IPv6. But it requires updating every device and router, which is slow. {{NAT (Network Address Translation)}} works around this drawback by letting many private machines share {{one public IPv4 address}}.
        * A router rewrites many private addresses to a single public address, tracking the mapping in a table containing the columns: {{remote IP:remote port}}, {{public-facing port number}}, {{private ip}}, {{private port number}}. 
            * Certain IPv4 address blocks are reserved to be used as inside IPs only, such as `192.168.X.X`.
        * The "NAT illusion": From inside the network, it looks like {{you’re talking directly to the outside world}}; from outside, it looks like {{all internal machines are one device}}.
        * Reiss calls NAT a “hack” because it breaks the end‑to‑end model of the Internet, but it’s a practical necessity until IPv6 adoption is universal.
* Connections are identified by a four-tuple (in the TCP/IP network model). The tuple is: ({{local IP address}}, {{local port}}, {{remote IP address}}, {{remote port}})
    * The transport layer knows which program to deliver a packet to based on the {{remote port number}}.
* URI (Uniform Resource Identifiers) is a standard way of expressing where a resource is located. It follows the general form `scheme://authority/path?query#fragment`, where...
    * `scheme`: {{what protocol}}
    * `authority`: {{tells you the host, and sometimes the user and the port}}. It can take the form of {{`user@host:port`}}, {{`host:port`}}, {{`user@host`}}, or just {{`host`}}.
    * `path`: {{what resource}}
    * `query`: {{parameters associated with the resource query}}
    * `fragment`: {{location within resource}}
    * URLs are a special type of URI that identify how to find resources located on {{the network}}.
* "{{Routing}}" involves finding a path for packets from source to destination across internet. Here are the steps that the transport layer follows to get your packet from your machine to `www.cs.virginia.edu`.
    1. Your machine constructs a packet consisting of: (1) {{the source IP}}, (2) {{the destination IP}}, and (3) {{the payload}}. If it does not know yet the destination IP, it needs to {{send a DNS query to translate the URL to an IP}}.
        * Your DNS query first reaches {{your internet service provider (ISP)'s DNS server}}. 
        * From there, the ISP's DNS server asks {{a root DNS server (many exist throughout the world, maintained by official organizations)}} for the {{`.edu` DNS server's IP}}.
        * Next, the ISP DNS server asks {{the `.edu` DNS server}} for {{the `virginia.edu` DNS server's IP}}.
        * Finally, the ISP DNS server asks {{the `virginia.edu` DNS server}} for {{the `cs.virginia.edu` DNS server's IP}}.
        * It would be unbearably slow if every DNS query had to traverse the entire hierarchy, so the ISP DNS often optimizes by {{caching IPs}}.
    2. After constructing the packet, your machine sends it to a router. The router then decides which router should recieve the packet next.
        * Question: Does a router know the IP address that corresponds to every possible URL that the machine could send a packet to? If not, how does the router get the packet to its destination? {{No. Routers forward packets  to other routers that knows more specific routes until the packet reaches its destination}}.
        * Routers use a {{forwarding}} table to decide which network to forward a packet to, which map {{destination IP ranges}} to {{network interfaces}}. 
            * If the destination IP range falls into a range not listed on the forwarding table, then the following occurs: {{the packet gets forwarded to the default network. "I don’t know where this goes, but that router over there probably does."}}
    3. The next router does the following: {{it follows the same protocol as the first router to decide on yet another router to recieve the packet}}. This continues until {{your packet reaches the destination IP}}.
* {{HTTP}} is the primary application‑layer protocol. 
    * It establishes standard message formats.
        * `GET`: get resource
        * `POST`: sending forms
        * `HEAD`: get metadata about file (without getting its data)
    * An HTTP connection is established using the following procedure: 
        1. The client does the {{DNS}} lookup for the {{hostname}}.
        2. The client establishes a {{TCP}} connection to {{the server’s IP and a port}}.
        3. The client sends {{an HTTP GET request}}.
        4. Server replies with {{status code, such as "404 Not Found", and usually some data}}.


# Exercises
* Suppose a network is using acknowledgements and timeouts to handle lost messages. Say Machine A sends a message to Machine B, and Machine B is supposed to respond with an acknowledgement. How can this network handle the case where Machine B's acknowledgment gets lost? Answer: {{C}}
    * A. A should acknowledge B's acknowledgement
    * B. B should resend the aknowledgement on its own
    * C. A should resent the original message on its own
    * D. none of these
* Write out the full form of the IPv6 address, `2607:f8b0:400d:c00::6a`. Answer: {{`2607:f8b0:400d:0c00:0000:0000:0000:006a`}}
* The table below contains examples of valid URIs. Fill it out.
||protocol|host|user|port|resource path|parameter(s)|fragment|is it a URL?|
|---|---|---|---|---|---|---|---|---|
|`https://kytos02.cs.virginia.edu:443/cs3130-spring2023/quizzes/quiz.php?qid=02#q2`|{{`https`}}|{{`kytos02.cs.virginia.edu`}}|{{N/A}}|{{`443`}}|{{`cs3130-spring2023/quizzes/quiz.php`}}|{{`qid=02`}}|{{`q2`}}|{{`Y`}}|
|`sftp://cr4bd@portal.cs.virginia.edu/u/cr4bd/file.txt`|{{`sftp`}}|{{`portal.cs.virginia.edu`}}|{{`cr4bd`}}|{{N/A}}|{{`u/cr4bd/file.txt`}}|{{N/A}}|{{N/A}}|{{`Y`}}|
|`tel:+1-434-982-2200`|{{`tel`}}|{{`+1-434-982-2200`}}|{{N/A}}|{{N/A}}|{{N/A}}|{{N/A}}|{{N/A}}|{{`N`}}|
|`/~cr4bd/3130/S2023`|{{N/A}}|{{N/A}}|{{N/A}}|{{N/A}}|{{`/~cr4bd/3130/S2023N/A`}}|{{N/A}}|{{N/A}}|{{`N`}}|