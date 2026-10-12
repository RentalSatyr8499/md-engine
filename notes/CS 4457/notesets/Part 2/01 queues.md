* Define: 
    * "Scheduling policy": how a queue decides which packet to send out first. By default, this is FIFO.
    * "Drop policy": how a queue decides when to drop a packet. 
* "Drop tail": Dropping the newest packet. This is the default. Problems: 
    * If one flow greedily hogs the whole queue, everybody's packets get dropped, not just the greedy evil flow's packets. 
    * It takes longer for hosts to detect congestion if we drop the tail from the queue (late packets) rather than the head from the queue (early packets).
* "Round robin": scheduling policy where you {{alternate sending one packet from each flow}}. ![alt text](image-2.png)
    * This fixes the greedy-flow problem, because {{each flow gets its own turn}} instead of all flows sharing one FIFO.
    * But it still has two problems: ![alt text](image-1.png)
        * {{Variable packet sizes}}: alternating whole packets gives more bandwidth to the flow with bigger packets. You need to send more packets from flows with smaller packets.
        * {{Packets arriving late}}: a flow whose packets were not there when its turn came gets no credit for the missed turn.
* "Alternate bit ordering": scheduling policy built on a theoretical model where you {{split each packet into individual bits and alternate one bit from each flow}}. ![alt text](image-3.png)
    * The idea: figure out what the finish times would look like if bit-by-bit sending were possible, then {{send whole packets in the order of those finish times}}.
    * One downside: This is less efficient for early packets than full-packet alternation, because {{the emulated schedule finishes early packets later than sending them whole would}}. ![alt text](image-4.png)
    * "Virtual time": In order to implement this, you track by round number rather than by step number. A round is {{one bit from each pending flow}}, so the number of steps per round {{varies with the number of active flows}}. ![alt text](image-6.png)
        * The round number is a weird clock that {{slows down when more flows are pending}}. It is less precise than step counts, but {{easier to compute}}.
        * But that means we can compute a virtual finish time for the overall packet on each packet's arrival. This means we can simply send packets in their entirety in order of {{lowest virtual finish time}} (calculated by emulating bit-by-bit round robin).
        * The virtual time algorithm: ![alt text](image-7.png)
            * Track {{the virtual start time of the last sent packet}} and {{the virtual finish time of the last packet of each flow}}.
            * On receiving a packet: virtual start time = {{the max of the virtual finish time of the last packet in the same flow and the virtual start time of the last sent packet (plus adjustment for how much was sent)}}. Virtual finish time = {{virtual start time + packet size}}.
            * When sending, send the packet with the {{lowest virtual finish time}}.
        * For calculating finish times when queueing needs to be weighted: {{divide the packet size by the flow's weight}}. Virtual finish time = virtual start time + size/weight, so sending N bits from a flow with weight w takes {{N/w rounds}}. ![alt text](image-9.png)
* "Priority queue": scheduling policy where you {{assign priorities to flows}} and always serve the highest-priority flow first. ![alt text](image-10.png)
    * When the queue is full, {{drop a packet from the lowest-priority flow}}. On ties, {{use another drop strategy}}.
* "Random Early Detection" (RED): active queue management policy that {{drops packets with a probability based on the average queue length}} instead of waiting for the queue to fill up. ![alt text](image-11.png)
    * Below {{MinThresh}}, drop nothing. Between MinThresh and MaxThresh, the drop probability ramps up to {{MaxP}}. Above {{MaxThresh}}, drop everything.
    * It is "early" because {{hosts get the congestion signal before the queue overflows}}, and "random" because {{every flow faces the dice, so a greedy flow cannot hog the queue}}.

## Exercises
![alt text](image27.png)
* Consider the image above. If we use a FIFO scheduling policy and drop-tail drop policy: 
    * How many packets/ms will the top flow get out? The bottom flow? {{3.5 pkts/ms; 1.5 pkts/ms}}
    * Under min-max fairness, how many packets/ms out does the top flow deserve? The bottom flow? {{2.5 pkts/ms each}}
