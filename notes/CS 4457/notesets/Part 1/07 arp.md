![alt text](image12.png){size=medium}
* IPv6 header format: 
    * "{{Extension header}}": allow IPv6 to carry optional metadata (work similarly to TCP options).
    * "Next header": If no extension header is present, this field identifies {{the next‑layer protocol (ex. TCP, UDP)}}. If extension headers are present, it {{chains to the next header in the sequence}}.
    * {{"Hop limit"/"time-to-live"}}: The IPv6 version of TTL; limits how many times the packet can be forwarded to prevent routing loops.
    * "diffserv"/"ECN"/"flow" labels: Optional hints to routers/switches about packet importance (diffserv/flow label) and congestion control (ECN).
* Different kinds of special IP addresses: 
    * {{Loopback}}: addresses that refer to the host itself
    * {{Link-local}}: addresses valid only on the directly attached network; never needs to pass through a router.
        * IPv6 "interface scoping": since link-local addresses are specific to each local network (ex. fe80::17 on network A ≠ fe80::17 on network B), IPv6 clarifies the ambiguity by appending `%[network]`: fe80::17{{%A}} and fe80::17{{%B}}.
    * Private use: reserved for non-public networks; used inside LANs and VPNs.
    * {{Multicast groups}}: represent a group of receivers
    * {{Broadcast}}: target all hosts on the local network
    * Future use: reserved blocks not currently assigned for general use
* In the same way switches map MAC addresses to ports, routers map {{IP addresses}} to {{gateways and interfaces}}.
    * {{Gateways}}: who to send the packet to next
    * {{Interface}}: on what network to send the packet to
* "Neighbor" table or "ARP" table: a lookup table hosts use to map {{IP addresses to MAC addresses}}. The steps to add an entry to the ARP table are as follows: 
    1. Suppose A (`10.0.1.2`) wants to send a packet to B (`10.0.2.2`). A first needs to consult the {{routing table}}. 
    2. Now suppose that B lives in a different subnet than A. This means that in the routing table, A will find that only `10.0.1.0/24` is directly reachable, and that anything else must go to the "{{default gateway/router}}" (which we'll say is `10.0.1.1` for purposes of this exercise).
    3. After figuring that out, A needs to consult the {{neighbor table/ARP table}} to find {{the MAC address that corresponds with `10.0.1.1`}}.
    4. Suppose that A's ARP table is completely empty, so it does not find the information. A must now broadcast an {{ARP}} request asking "{{who has IP `10.0.1.1`}}?"
    5. When `10.0.1.1` (the router) recieves A's request, it responds with {{an ARP reply containing its own MAC address}}. 
    6. When A recieves the ARP reply, it stores the learned information in its {{neighbor/ARP}} table. Then, A constructs an ethernet packet bound for {{the router's MAC address and B's IP}}.
    7. When `10.0.1.1` (the router) recieves A's ethernet packet, it inspects the IP packet. Now the router must consult its own {{routing table}}.
    8. Suppose the router’s routing table shows that `10.0.1.0/24` is reachable via the "left" interface and `10.0.2.0/24` reachable via the "right". However, the router's neighbor/ARP table is empty. The router's next step is to {{broadcast an ARP request on the `10.0.2.0/24` subnet asking "who has IP `10.0.2.2`?"}} 
    9. When B (`10.0.2.2`) receives the router’s ARP request, it replies with {{an ARP response containing its MAC address}}. The router stores this newly learned mapping in {{its neighbor/ARP table}}. 
    10. The router constructs a new ethernet frame using its right-interface MAC address as the source and {{B's MAC address}} as the destination. The router forwards the original IP packet (unchanged) inside this new frame onto the {{`10.0.2.0/24` (right)}} network. 
* If old devices are deleted from the network and new devices added such that a particular IP address happens to swap out its MAC address, we can ensure the entire network updates its ARP tables by {{broadcasting an unsolicited ARP request from ourselves}}.
![alt text](image14.png){size=medium}
* ARP messages: 
    * "hardware" address (type and length): identifies what type of {{link}}-layer address ARP is carrying (ex. Ethernet) and the length of the hardware address 
    * "protocol" address (type and length): identifies what type of {{network}}-layer address ARP is mapping to the hardware address (ex. IPv4 = 0x0800) and the length of the protocol address. Although ARP could theoretically support other protocol lengths, IPv6 does not use ARP at all and instead uses its own Neighbor Discovery protocol.
* "ARP poisoning": a MITM attack that uses forged ARP messages to convince other machines to store incorrect {{IP → MAC}} mappings in their ARP tables. 
* "{{Broadcast domain}}": the set of nodes you can reach via a broadcast. It's possible to have multiple broadcast domains, one for each layer. 
* To introduce a new machine on a network, you need at minimum the...(list 3) {{IP address, subnet mask and the default gateway}}. But most of the time, networks require more configurations in addition to this. In order to obtain this, machines often ask {{everyone on the network}} for the appropriate configuration, typically with a protocol called {{DHCP}}.
    * DHCP message types: 
        * {{DISCOVER}}: look for config server
        * {{REQUEST}}: get configuration from the config server
        * {{OFFER}}: advertise yourself as a configuration server
        * {{ACK}}: send a configuration
    * Problematically, machines sending DHCP requests often do not know the source and destination IPs to send the request to yet, because they still haven't set up their network configuration. To fill in this information, then, they use {{predetermined placeholder values ex. the source IP is `0.0.0.0`, destination port `255.255.255.255`, etc}}.
    * When a DHCP server sends an ACK, it includes a "lease time" specifying {{how long the assigned configuration is valid}}. Before this lease expires, the client must renew it by {{sending a new REQUEST message including its own IP, which basically asks "hey, can I keep this IP address?"}}. If the server agrees, it responds with another ACK containing a refreshed lease time; otherwise, it can assign a different address instead. If the client fails to renew before the lease expires, it must stop using the address and restart the full DHCP process.
    * "DHCP relay": intermediate machines placed on the network the forward any DHCP packets they find to actual configuration servers. This reduces the density of DHCP configuration servers necessary to make sure every machine can reach one on a broadcast.
* "SLAAC (StateLess Address Auto Configuration)": IPv6 has a design quirk that allows it to be easier to autoconfig, ie, allows a machine to locally derive its own IP address without needing to consult a central authority. 
    * One method is to establish the convention that a machine's IP address is {{the network prefix plus the machine's MAC address}}. Problematically, this method raises privacy issues because you know people's network IPs or MAC address just based on their network IP.
    * The other method, which is the modern method, is to generate a {{random value}} for the bottom bits of an address. Then, check the local network to ensure that {{there are no dupicates}}.
    * "{{Temporary address}}": an additional IPv6 address that a node generates using randomized lower bits, separate from its stable SLAAC address. This is used to improve privacy.
    * "ICMPv6": protocol used by IPv6 for any "meta" network-layer operations (ex. {{neighbor discovery, duplicate address detection, router solicitation, and router advertisement}}). ICMPv6 replaces {{ARP}} entirely.
        * "Router {{solicitation}} message": broadcasted request for routers to respond with network config information
        * "Router {{advertisement}} message": a router's response to a solitication message that includes the network prefix, DNS info, and other info.

## Exercises
* Write the bits of the IPv4 address `128.143.67.127`: {{`10000000 10001111 01000011 00111111`}}
* The IPv4 range `128.143.67.64—128.143.67.127` can be rewritten in CIDR notation as {{`128.143.67.64/27`}}, and in netmask notation as {{`128.143.67.64` and `255.255.255.224`}}
* The CIDR notation range `5.7.3.3/14` can be rewritten as the IPv4 range {{`5.4.0.0—5.7.255.255`}}.
* The expanded version of the IPv6 address, `2607:f8b0:400d:c00::6a`, is {{`2607:f8b0:400d:0c00:0000:0000:0000:006a`}}
![alt text](image15.png)
* Conisder the network above. If no one’s neighbor tables are setup yet, how many frames get sent when `192.0.2.5` sends one IP packet to `195.51.100.4`? Answer: {{(1) 192.0.2.5 asks 192.0.2.1 for their MAC address; (2) 192.0.2.1 responds to 192.0.2.5 with their MAC address; (3) 192.0.2.1 asks 195.51.100.4 for the MAC address; (4) 195.51.100.4 responds to 192.0.2.1 with their MAC address; (5) 192.0.2.5 sends the actual package to 192.0.2.1; (6) 192.0.2.1 modifies the frame headers and sends it to 195.51.100.4}}