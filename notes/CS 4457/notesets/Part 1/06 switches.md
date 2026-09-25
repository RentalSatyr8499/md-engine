* The difference between a switch and a hub is that a hub {{internally electrically connects hosts as if they share wires}}, while a switch {{internally stores packets and decides which output to send it to}}. 
    * Between a switch and a hub, a switch is more {{internally complicated}}.
    * Between a switch and a hub, a switch is more {{efficient}}.
    * Hubs were designed for a "multi-access network", which is [what?]. [how does this relate to modern switch design]
![alt text](image11.png){size=small}
* Parts of an ethernet packet: 
    * {{Start marker}}: A special bit pattern after the preamble that indicates the beginning of a new frame. (Ethernet does not have an explicit "end‑of‑frame" marker; instead, transmitters stop sending bits and leave a mandatory idle period and receivers interpret this silence as the end of the frame).
    * {{Type field}}: Indicates which next‑layer protocol the payload belongs to (e.g., IPv4, IPv6, ARP).
* MAC Addresses (also called EUI-48): unique address hard-coded into every single piece of networking hardware in the world. The uniqueness of MAC addresses is mandated by IEEE (Institution of Electrical and Electronic Engineers), which assigns each manufacturer with a range of approved MAC addresses for them. MAC addresses are used on pretty much every layer of the networking model before IP. There are special MAC addresses to: 
    * {{`00:00:00...`}}: "i don't know" MAC address
    * {{`FF:FF:FF...`}}: everyone on the network
    * `33:33:00:00:00:02`: all the routers on the network
* In addition to the TCP "open connection" paradigm, there are also other ways to approach sending messages over a network. 
    * "{{Datagram}}" model: You can always send a message to anyone on the network just by putting the destination MAC (or network address) in the frame; no reservations, no setup, no connection, no handshake. Each message is independent, and the network makes a best‑effort attempt to deliver it.
    * "{{Virtual circuit}}" model: Two machines first establish a circuit using special setup messages; switches/routers reserve resources for that circuit, providing “guaranteed” bandwidth. All transmitted data must belong to an already‑established circuit. 
* "Software-defined networking" (SDN): {{When rules for how the network behaves are defined in normal software rather than fixed hardware}}.
    * "{{Data}} plane": Implements the decisions made by the control plane; and applies simple rules to packet forwarding.
        * {{P4}}: A programming language for data planes, intended to compile to fast switches.
    * "{{Control}} plane": Slower path where complicated decisions are made. Most of the time, the "data plane" is able to figure out what to do with the packet by simply forwarding the packet to the correct port number. Sometimes, though, the packet needs to be handed to the control plane, which is software loaded on to the switch that can make decisions that are too complex for the raw hardware.
    * The benefit of separating control plane and data plane in SDN is that {{it allows vendor‑neutral control planes and easier deployment of new network behaviors without requiring new switch hardware.}}
![alt text](image13.png){size=medium}
* The switch architecture that the P4 language exposes is structure as the following:
    * "Match/action" pipeline: A sequence of table lookups based on parsed header fields; each lookup specifies the next {{action}} (ex. forward, drop, modify, clone).
        * {{Ingress}} pipeline: Decide where to forward the frame (if anywhere).
        * {{Egress}} pipeline: Applies per‑port rules such as header rewriting. Runs once for each {{copy of the frame being sent out}}.
    * Parsing and deparsing must be done individually for both the ingress and egress pipeline because {{the two pipelines run at different times and at different rates, with packets sitting asynchronously in hardware queues between them}}.
        * {{Parsing}}: Decodes frame bytes into header fields, placing those fields into volatile pipeline-local registers.
        * {{Deparsing}}: Reads the modified header fields from those volatile registers back into the byte format necessary for buffer storage and transmission.
* Many internal decisions made by P4 switches are done using {{table lookups}}. Tables have a key-value structure where the key usually comes from {{the packet header}}, and the value is usually {{the action to run}}.
    * P4 table keys come in different types: 
        * "Exact" match: {{The key must match the table entry’s key exactly, bit-for-bit}}.
        * "{{Longest prefix match (LPM)}}": Table entries contain prefixes; multiple entries may match, but the one with {{the longest prefix}} is chosen.
        * "{{Ternary match}}": Table entries contain a key and a mask; bits marked “don’t care” in the mask can match either 0 or 1.
    * "Content-addressable memory/ternary content-addressable memory": {{Specialized hardware that can perform exact, LPM, or ternary lookups extremely quickly; powerful but expensive.}}
* "Multicast group": A list of {{output ports that a packet should be replicated to}}. Defined on the {{control}} plane.        
* "MAC learning": P4 tables can get really long and fine-grained, so most of the time, they are automatically constructed by the switch as it gets more information. If a table is still not complete by the time a packet that needs it arrives, the switch simply {{broadcasts the packet (to everywhere except its source)}}.
    * For example, if MAC address A comes from port 2, the next time a packet is bound for MAC address A, we send it to {{port 2}}.
    * Why might a broadcasting policy break in a network where there exists more than one path from A to B? Answer: {{It can cause infinite broadcasting loops between switches, which overloads the network. For this reason, any implementation of the simple MAC learning algorithm as described above must stipulate that the network only has one path between any two nodes X and Y}}.

## Exercise
* "*Suppose we want to implement the following policy: by default, packets sent to servers A, B, C, and D are dropped specific machines are given permission to contact server A the same is true for servers B and C and D some specific machines are give access to contact all servers what tables would be useful to have? what keys? what match strategy?*" Answer: {{One solution is to have two tables: one exact-match table where the key is the `src_address`, and another exact-match table where the key is (`src_address`, `dest_address`). If the source address is found to be on the initial whitelist, it is checked against the second table to see if its destination address is approved as well}}.
