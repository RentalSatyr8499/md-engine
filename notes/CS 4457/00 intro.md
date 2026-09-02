* Computers/servers on the edge of a network are called {{hosts}} or {{end systems}}.
* There are different ways to implement a network:
    * {{Direct connections}}, where each host talks directly to every other node.
    * "{{Shared medium}}", where hosts all transmit to and recieve from one medium (ex. {{radio or wire}}). {{Ethernet}} is an example of shared medium, where the medium is wire.
        * A {{hub}} makes it so that distinct wires become electrically connected to one another.  
    * {{Switches}}, where hosts talk to intermediate machines, who in turn direct messages to other hosts. 
* A {{node}} refers to any machine on a network (including both hosts and switches). A {{link}} connects nodes.
* "{{Internetwork}}"s are networks of networks, or a system of connected network. Networks are connected to one another via {{routers/gateways}}.
* Data moves from node to node along "{{flows}}". Flows are divided into {{packets/frames/segments}}.
* "Multiplexing": when two or more flows share one or more link. 
![alt text](image1.png)
* 
    * Links that support multiple flows can divide themselves by time or frequency. When packets arrive to the link, they {{wait in buffer queues}} until it is their time/turn to go through the link.
    * "{{Congestion}}" happens when the switch drops packets due to the buffer being full.
    * End hosts can do multiplexing/demultiplexing too.
* "Store and forward": the principle that switches only {{send out packets}} after {{storing it in their buffer first}}. The alternative to this is "cut-through" forwarding, which is less common, but involves sending out packets as they're being recieved.
* "{{Channel abstraction}}": an interface exposed to applications in order to talk to networks. Ex: streams, datagrams, remote procedure calls, remote memory access
* The Internet Engineering Task Force (IETF) standardizes internet protocols. Their documents are called RFCs.
* The OSI model, from highest-level layer to lowest: 
|name|function|
|{{application}}, also called "layer 7"|what requests/etc.|
|{{presentation}}|format of data|
|{{session}}|coordinate multiple streams|
|{{transport}}|streams of data|
|{{network}}|message to correct network|
|{{data link}}|message to correct machine; message into bits/symbols|
|{{physical}}|transmit bits/symbols on medium|
* 
    * The internet typically combines the {{application, presentation, and session}} layers into one.
    * To say that the OSI model has a "narrow waist" means {{there are a lot of protocols that could be implemented above and below the network layer, but on the network layer itself, there's only IP (???)}}.
* In a sentence or two, explain the "end-to-end" argument. Answer: {{The idea that the network layers should be implemented more on the end hosts than they are on the middle systems, because it makes debugging simpler and more reliable. For example, file transfer is implemented by comparing hashes of the final files.}}
* 


## Exercises
![alt text](image2.png)
* Fill out the following table.
|node|multiplexes?|demultiplexes?|
|----|------------|--------------|
|A|{{`Y`}}|{{`Y`}}|
|S1|{{`N`}}|{{`N`}}|
|S2|{{`Y`}}|{{`Y`}}|
|S3|{{`N`}}|{{`N`}}|
|B|{{`Y`}}|{{`Y`}}|
|C|{{`Y`}}|{{`Y`}}|
![alt text](image3.png)
* If each of the users A-D are recieving (potentially different) video and audio from the server in this network, there are {{8}} flow(s), {{9}} node(s), {{1}} router(s), and {{3}} switch(es).
* "Which idea is most/least consistent with end-to-end principle?" Most consistent: {{B}}, least consistent: {{A}}
    * "A. having switches send a signal to the sending end-host when it drops their packets"
    * "B. an end-host sending a message to two different switches so it’s more likely to reach its destination"
    * "C. an end-host telling a switch when it’s received a packet, so the switch can avoid resending it"
    * "D. an end-host indicating whether its packets should be dropped if they cannot be forwarded quickly"

- is it a good rule of thumb to say multiplexing/demult doesn't happen on nodes that have 2 or less links?
- missed slides 41-46