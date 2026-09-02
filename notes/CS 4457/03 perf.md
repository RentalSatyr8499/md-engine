* Define the following: 
    * "Bandwidth" or "data rate": {{the maximum rate at which we can send data per unit of time. This is most commonly measured by the speed of a link}}. One tool we can use to measure bandwith is ICMP (`ping`).
    * "Throughput": {{the achieved rate of sent data per unit of time}}. In comparison to bandwidth, throughput is often {{lower}}, because {{of losses and bookeeping overhead}}. One tool we can use to measure throughput is `iperf`.
    * "Latency": {{the time it takes for a message to go from the source to the destination}}.
        * "Transmission delay": {{the time it takes for the message to get off the source machine and on to the network link. Because wires can only take so much data at a time, a transmission delay occurs as the entire message waits to be fed on to the network}}.
        * "Propagation delay": {{the time it takes for a bit to go down the cable}}.
        * "Queuing delay": {{the time it takes to wait for other packets to be trasmitted from the switch before your packet can be trasmitted}}.
        * The main source of delay in networks is typically {{queuing}} delay.
        * Propose a way that, in theory, we could measure transmission delay. Answer: {{We could send two packets of known size and divide their difference in size by their difference in time. This assumes that any disparity in latency is entirely due to transmission delay and not propagation or queuing delay, which in theory should be constant.}}
    * "{{Round-trip-time}}" (RTT): the time it takes for a message to get from the source, to the destination, and back to the source. Because RTT is way easier to measure than one-way latency, we typically use RTT to set latency instead.
    * "Network jitter": {{the degree to which network latency varies from package to package}}.

## Exercises
* What is the latency for a 20000-bit message along a 10-kilometer wire with a transmission speed of 1 gigabit, and with a signal speed of 2e8 m/s?
* What is the latency for a 1000-bit message along a 500-meter wire with a transmission speed of 50 megabits and with a signal speed of 2.3e8 m/s? What if a switch is added, along with an additional 500-meter wire, where the packet needs to wait for 5 other packets first? 
