* When routers recieve a packet from a host destined for another host that is not responsive or does not exist in the network, the routers respond with a "destination host unreachable" packet.
* "Fragment": when a packet exceeds the maximum frame size, either the sender or a router will split it into appropriately-sized packets called fragments that will be reassembled at the reciever.
    * If fragmenting is disabled for the IP protocol being used, packets that exceed the maximum size are simply rejected.
* "Maximum transmission unit" (MTU): 
* "Time-to-live" (TTL): 
    * `traceroute`: 
* Difference between a distributed approach to routing and a centralized approach to routing: 
* Spanning tree: 
* Typically to assign costs to link edges we calculate `some constant/link bandwidth`. But you can choose costs other than bandwidth, like latency, reliability, etc.
* Bellman-Ford: 
* link-state routing: 
    * OSPF: 

other bullets likely need to be added in between existing bullets

## Exercises
* Suppose that the Ethernet header and trailer together are 26 bytes, the IPv4 header is 20 bytes with no options, and the TCP header is 20 bytes plus 16 bytes of options. Suppose the local network supports Ethernet payloads of up to 65,535 bytes, while the remote network supports Ethernet payloads of up to 1,500 bytes, and fragmentation occurs when packets travel between the two networks. 
    * Determine the TCP segment size that results in the lowest overhead: {{The IP and TCP headers together occupy 56 bytes (20 + 36). Therefore, the maximum TCP data size that fits without fragmentation is `1500 - 20 - 36 = 1444 bytes`. Including the 20-byte IP header, 36-byte TCP header, and 26-byte Ethernet header/trailer, the total overhead is 82 bytes. The overhead percentage is `82 / (1444 + 82) ≈ 5.37%`}}.
    * Calculate the overhead for 64,000-byte TCP segments: {{The remote network supports Ethernet payloads of at most 1,500 bytes. Since each IP fragment needs a 20-byte IP header, it can carry at most `1500 - 20 = 1480 bytes` of the original IP packet’s contents. A 64,000-byte TCP segment, including its 36-byte TCP header, produces an IP packet of 64,036 bytes. Dividing 64,036 by 1,480 gives approximately 43.27, so we need 44 fragments. Each fragment adds 46 bytes of IP and Ethernet overhead (20 + 26). That's `44*46 = 2024` total bytes of IP and Ethernet overhead across 44 fragments. We then add the 36-byte TCP header, which appears only once, giving 2,060 bytes of total overhead. `2,060/64,000` gives an overhead-to-data ratio of approximately 3.22%.}}
    * Determine the TCP segment size that results in the highest overhead: {{1 byte}}
* slide 33