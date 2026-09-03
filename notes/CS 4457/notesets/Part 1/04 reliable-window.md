* We can further optimize the stop-and-wait protocol by {{sending multiple messages at a time}}. 
    * First, we choose a "window size" (how many message to have in flight at once).
    * Then, we only ever send the nth message if and only if {{the (n - window size)th message has been acknowledged}}. 
    * To implement such a scheme, if machine B recieves messages out of order, it typically does not ACK a higher-sequence number packets until {{it has already recieved all of the lower-sequence-number packets}}.
* There are two ways machine B can deal with missing packets from machine A in this scheme. 
    * On the one hand, machine B could ignore incoming packets with higher sequence numbers that skip packets that haven't come in yet. This situation would eventually sort itself out because of timeout, but could ake a while.
    * On the other hand, you could implement "duplicate ACKs", which work like this: 
        1. Machine A sends packet 0, packet 1, and packet 2
        2. Machine B recieves packet 0
        3. Machine B sends ACK 0
        4. Packet 1 gets lost in the network
        5. Machine B recieves packet 2
        6. Machine B {{sends ACK 0, because packet 0 is the highest packet that we have recieved all the previous packets for}}.
        7. Machine A {{resends packet 1 because it knows that ACK 0 means Machine B didn't recieve packet 1 the first time A sent it}}.
    * "Selective acknowledgements" are similar to duplicate acknowledgements, except {{machine B also specifies which higher-sequence number packets it already has, so that machine A does not need to guess which packet needs to be resent}}.
* A "sliding window" solution is used to solve two distinct problems: (1) the problem of flow control (ie, {{keeping the sender from getting too far ahead from reciever}}) and (2) the problem of congestion control (ie, {{keeping the network from being overloaded}}).
![alt text](image5.png){size=medium}
![alt text](image6.png){size=medium}
* 
    * Sender logic: 
        * If you recieve an ACK X such that X is greater than {{the Last ACK Recieved (LAR)}} but less than {{the Last Frame Sent (LFS)}}, increment the LAR to X, and clear any timers that {{will resend frames less than X}}.
    * https://www.cs.virginia.edu/~cr4bd/4457/F2026/slides/reliable-window.pdf summarize slides 35 and 41 in prose
    * "Bandwidth-delay product": represents the ideal {{sliding window size}}, and is calculated by {{multiplying the RTT with the transmission speed}}.
        * If we were to choose a sliding window size *greater than* our bandwidth delay product, frames would start accumulating on queues that are full, weighing down the throughput.
        * slide 55??
* It is possible to have sequence numbers that wraparound. 

## Exercises
* Suppose on a sender, the LAR is 10, LFS is 15, and SWS is 5. Fill out the table below. 
|if we recieved an ACK for...|what could be a likely explanation?|how should the sender respond?|
|------------|------------------|-----------------------------|
|9|{{network reordered frames}}|{{ignore it}}|
|10|{{lost frame 11}}|{{resend 11}}|
|13|{{lost ACK for a frame that came after 10}}|{{ignore}}|
|16|{{something is really wrong or a wraparound occurred, since we haven't sent out 16 yet.}}|N/A|
* 
    * Suppose there is a timeout that will eventually resend frame 13. In which of the following scenarios should that timeout be cancelled? Answer: {{B, D}}
        * A. recieved ACK 12 
        * B. recieved ACK 13
        * C. recieved ACK 14 
        * D. sent frame 16
* Suppose on a sender, the LAR is 4, LFS is 8, and SWS is 4. *"If we compute a new frame of data with sequence number 9 to eventually send, we should..."* (Answer: {{B}})
    * *"A. send it now, advancing LFS"*
    * *"B. wait until we get an ACK for 5 or 6 or 7 or 8 to send it"*
    * *"C. wait until we get an ACK for 6 or 7 or 8 to send it"*
    * *"D. decline to accept the data because we will never be able to send it"*
    * *"E. something else"*
![alt text](image7.png)
* Consider the image above. If the minimum latency is 1 time unit, and things remain in the queue while sending, the maximum latency is {{1.9 time units}}.