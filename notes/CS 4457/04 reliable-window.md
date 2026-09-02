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

![alt text](image5.png)

## Exercises
* last ACK recv’d (LAR) 10
last frame sent (LFS) 15
send window size (SWS) 5
what probably happened if we receive an ACK for…
9? 10? 13? 16?
A. if network reorders frames
B. lost ACK for frame 10
C. lost ACK for frame 10
D. lost frame 11
E. resent frame from timeout