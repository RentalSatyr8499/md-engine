* In TCP, sliding window is implemented in a very particular way.  For each packet, you have:
    1. The direction the packet is going in. In TCP, both A and B can act as senders and recievers. 
    2. `seq`:  {{the index of the packet's first byte relative to the total message being sent}}. 
    3. `ack`: {{the index of the last byte we just recieved relative to the total message being recieved, *plus one (+1)*. This can also be thought of as *the index of the next byte we expect from the other side*}}. 
![alt text](image10.png)
* TCP refers to packets as "{{segments}}".
    * Ports:
    * Sequence number, ack number, ACK flag:
    * Window size: 
    * PSH flag:
    * RST, SYN, FIN flags: 
    * CWR, ECE flags: 
    * Options: data that is sometimes included in the TCP metadata. Includes three sections: the "kind" (identifying what the optional data is for semantically), length, and the actual option data. Common options include: 
        * Window size scale factor: 
        * Timestamps: 
        * Selective acknowledgements: 
* The initial TCP connection setup consists of {{three}} (how many?) packages. 
    1. The client sends the following: the SYN flag, and an initial randomly-generated sequence number 
    2. The server sends the following: the SYN + ACK flags, another initially randomly-generated sequence number, and the ack number (client's random number + 1)
    3. The client sends the following: the ACK flag, a sequence number (previous sequence number plus 1), an ack number (server's seq number plus 1)


## Exercises
![alt text](image8.png){size=medium}
* Consider the image above. The first question mark should be {{600}}, and the second question mark should be {{200}}.
* Suppose the receiver window size is 65535 bytes and the RTT is 100 ms. If we want to avoid sending data the receiver will reject as outside its window, what would be the maximum throughput in kbyte/sec? Answer: {{~640kbyte/sec}}