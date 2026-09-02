* An {{ACK message}} is sent from a reciever to a sender to indicate the reciever has successfully recieved their message. If the sender does not recieve the ACK before {{the timeout goes off}}, the sender will send the message again.
* "{{Sequence numbers}}": Unique numbers given to each packet so that the reciever can sort out any duplicates. It is also very important for ACKs to include the sequence number they are acknowledging for: for example, if slow ACKs come back after their timeouts has already come off, the sender might think the ACKs are for later messages and stop sending packets before the full message has been sent.
![alt text](image4.png)
* 
    * It's important to reuse sequence numbers; if we don't, they can get arbitrarily big.
    * 1-bit sequence number: {{for odd packets, the sequence number on the original packet and the ACK packet are both `0`, and for even packets, it's `1`}}. This requires that the sender waits for {{the ACK of the previous packet}} before sending the next packet, also referred to as a "{{stop-and-wait}}" protocol.
    * For a stop-and-wait scheme to work, we operate on the assumption that {{there is no reordering of packages}}.


## Exercises
* If we wanted to send a message with two parts: "The meeting", and "is at 12pm", what could be received for each of these scenarios? Assume no sequence numbers.
    * message (instead of acknowledgment) is lost: {{You would still just get "The meeting is at 12pm".}}
    * first message from machine A is delayed a long time by network: {{The first part might be repeated in different parts, like "The meeting is at 12 pm The meeting" or "The meeting The meeting is at 12pm"}}.
    * acknowledgment of second message lost instead of first: {{The second part might be repeated, like "The meeting is at 12pm is at 12pm"}}.
* In a 1-bit sequence number system, machine B recieves `[0] hi`, then machine B sends `ACK [0]`, and then machine B recieves `[0] hi`. What should machine B send now and why? Answer: {{B needs to send `ACK [0]` again because there's a possibility that A sent a duplicate message because A did not recieve the first ACK. If A continues to wait for ACK, the whole message is frozen because this is a stop-and-wait system}}.
* In a 1-bit sequence number system, machine A is trying to send the message `XYZ`, and does the following: sends `[0] X`, sends `[0] X`, recieves `ACK [0]`, sends `[1] Y`, recieves `ACK [0]`. What should A do next? Answer: {{Send `[1] Y` again}}.
