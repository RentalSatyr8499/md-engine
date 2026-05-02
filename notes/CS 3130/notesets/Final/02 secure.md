* The network is fundamentally untrustworthy: if someone controls any link in the path, they can see or alter your packets. 
    * Types of attackers:
        * "E": {{"eavesdroppers" that can read all messages over the network.}}
        * "M": {{"machines-in-the-middle" that can read messages on, replace messages on, and add messages to the network}}
    * Name some examples of how attackers could establish a presence in the network: {{intercept radio signal, control local wifi router, compromise network equipment, send packets with ‘wrong’ source address ("spoofing"), fool DNS servers to 'steal' name, fool routers to send you other’s data}}
* Define the following properties of a secure system. 
    * Confidentiality: {{only the intended parties can read the information}}. 
    * Authenticity: {{the message genuinely comes from the claimed sender and hasn’t been manipulated}}.
    * Repudiation: {{whether a sender can later deny having sent a message}}. 
    * Forward secrecy: {{ensures that compromising a key today doesn’t reveal past conversations}}. 
    * Anonymity: {{hides who is talking to whom}}.
* Symmetric encryption: an encryption scheme where the same secret key is used for both encryption and decryption. Ensures confidentiality.
    * It typically follows the following procedure.
        1. A and B agree on {{a secret key}}. 
        2. A runs {{`E(key, message)` (encrypt)}} to produce a ciphertext. 
        3. A sends {{the ciphertext}} to B.
        4. B runs {{`D(key, ciphertext)` (decrypt)}} to reproduce the original message.
    * The first step, agreeing on a secret key, can be difficult. One way to go about this is by using the Diffie-Hellman key exchange, which requires algorithms for `GenerateKeyShare` and `KeyGen`.
        1. A {{generates a random number `randA`, then runs `GenerateKeyShare(randA)`}} to produce keyshareA.
        2. B {{generates a random number `randB`, then runs `GenerateKeyShare(randB)`}} to produce keyshareB.
        3. A and B send their keyshares to each other.
        4. A {{runs `KeyGen(keyshareB, randA)`}} to produce the final key. 
        5. B {{runs `KeyGen(keyshareA, randB)`}} to produce the final key. 
        * The math behind `GenerateKeyShare` and `KeyGen` ensures that A and B will reach the same key, and also that without {{at least one private value}}, an attacker cannot compute the shared secret.
    * The secret key ideally has the following properties: (1) {{only requires exchanging a small amount of information to derive}}, (2) {{completely random}}, and (3) {{the final derived key is long}}.
    * `E(key, message)` and `D(key, ciphertext)` can use any algorithm to encrypt or decrypt the message. But whatever algorithm it is, it **must** have the following property: {{without the key, learning anything about the message should be computationally infeasible}}.  The only feasible attack should be {{brute‑forcing all possible keys}}, and if the key is {{long and random}}, that’s impractical.
    * Does symmetric encryption guarantee confidentiality? {{`Y`}} Does it guarantee authenticity? {{`N`}}
* Asymmetric encryption: an encryption scheme where a public key encrypts and a separate private key decrypts. Ensures authenticity.
    * It typically follows the following procedure.
        1. B comes up with {{a public key and a private key}}. 
        2. B sends {{the public key}} to A.
        3. A runs `Public_encrypt(`{{`public key`}}`, `{{`message`}}`)` to produce the ciphertext.
        4. A sends {{the ciphertext}} to B.
        5. B runs `Private_decrypt(`{{`private key`}}`, `{{`ciphertext`}}`)` to reproduce the original message. 
    * The secret key ideally has the following property: {{knowing the public key, the algorithms, etc. etc. should not help an attacker derive the private key}}.
    * Just like with symmetric encryption, the encryption algorithms need to mathematically guarantee that the only way to guess private information is through brute force, which is computationally infeasiblle.
    * Does asymmetric encryption guarantee confidentiality? {{`Y`}} Does it guarantee authenticity? {{`N`}}
||symmetric encryption|asymmetric encryption|
|---|---|---|
|use case|{{when two parties need to exchange a large amount of data and are able to agree on a secret key beforehand}}|{{when you need to send data to someone whose public key you only know}}|
|comparative speed|{{faster}}|{{slower}}|
|in which direction is confentiality guaranteed?|{{confidentiality in both directions}}|{{confidentiality one direction (from A to B)}}|
|true or false: if you can encrypt, then you can decrypt.|{{`T`}}|{{`F`}}|
* {{MACs ("message authentication codes")}} are like checksums, except you need a key to verify that it's the correct message. 
    * To use a MAC, you need an encryption algorithm, which we'll call `MAC`. Two parties might follow a procedure like:
        1. A and B agree on {{a secret MAC key}}. 
        2. A runs {{`MAC(MAC key, message)`}} to produce the checksum. 
        3. A sends {{the original message, along with the checksum,}} to B.
        4. B runs {{`MAC(MAC key, message)`}} reproduce the checksum. 
        5. If {{the checksums don't match}}, B knows the message has been tampered with.
    * Do MACs guarantee confidentiality? {{`N`}} Do they guarantee authenticity? {{`Y`}}
    * "Authenticated encryption": {{encryption and MAC packaged together}}.
* {{Digital signatures}} are the asymmetric analogue to MACs: they ensure authenticity without requiring a {{shared key}}.
    * To use a digital signature, you need encryption algorithms for signing (`S`) and verifying (`V`). Two parties might follow a procedure like:
        1. A comes up with {{a public key and a private key}}. 
        2. A sends {{the public key}} to B.
        3. A runs {{`S(private key, message)`}} to produce the signature.
        4. A sends {{the original message and the signature}} to B.
        5. B runs {{`V(public key, signature, message)`}}. If {{the result equals `1`}}, B knows the message is authentic. 
    * The secret key ideally has the following property: {{knowing the public key, the algorithms, the valid signature etc. etc. should not help an attacker derive the private key}}.
    * Do digital signatures guarantee confidentiality? {{`N`}} Do they guarantee authenticity? {{`Y`}}
* Signatures authenticate the content of a message, not its freshness or context. An attacker can simply copy an old signed message to trick parties, also called a "{{replay}} attack". To prevent such attacks, we use {{nonces}}, which are {{unique numbers attached to each message}}.
* In real-life scenarios, how does A know B's public key is actually B's? Answer: {{B's public key is verified by a certificate authority}}.
    * Certificates are generally used in a procedure that looks like this.
        1. Website A generates a public key. 
        2. A asks a certificate authority to sign a statement saying "the public key for A is [the public key]".
        3. When Browser B visits Website A, B verifies A's identify by checking the certificate. 
        * *This procedure only works if B already trusts the certificate authority.
    * There's only a small set of widely trusted root certificate authorities, and their public keys are often hardcoded into software or hardware. They are governed by an organization called {{the CA/Browser Forum}}, which includes entities like Apple, Google, Microsoft, Mozilla, etc.
        * Certificates can also form chains. The certificate for Canvas might be signed by “InCommon RSA Server CA,” which is itself signed by “USERTrust RSA Certification Authority,” which is a root CA trusted by your browser. In other words, flows upward through CA chains until it reaches a root key that the client already knows. These root authorities are also called {{trust anchors}}. This ecosystem of certificate authorities is called the "{{public key infrastructure}}" (PKI).
        * CAs also maintain public lists of revoked certificates. Browsers sometimes check these lists to ensure {{a certificate hasn’t been invalidated}}.
    * Suppose you request a CA to sign a public key for your website. Before agreeing to do this, the certificate authority must confirm that {{you actually control the website}}. This is generally achieved using a procedure like the one below. 
        1. The CA generates {{a random value}}.
        2. The CA tells you to prove control with the value. This could involve: {{placing the value on the website, placing it in DNS, returning it via a server response in a specific way}}, etc. 
* A hash function maps {{a message}} to {{a fixed‑size output}}. It must have two core properties:
    1. Given a hash output X, it should be hard to find any message that hashes to X.
    2. Given a message and its hash, it should be hard to find a different message with the same hash.
    * Name some uses for hashes: {{signing large messages (sign the hash instead, which condenses the size), building MACs, password hashing}}, etc.
    * Oftentimes, passwords are not stored in plaintext, but rather their hash is stored. But if the hashing algorithm used to store passwords is too {{small or fast}}, attackers with access to the password hash could easily {{brute force it}}. The solution is to {{use slow, resource‑intensive password hashing algorithms}} instead. 
*  Truly random numbers are also important to security, because you don't want an attacker to be able to guess your random number. So, a secure "random number generator" (RNG) must ensure:
    1. Attackers cannot guess the output better than {{chance}}
    2. Knowing past RNG outputs do not help predict {{future RNG outputs}}
    3. Compromising a machine running an RNG does not reveal {{past random numbers}}.
    * An example is Linux’s `/dev/urandom`. It works by extracting numbers from pseudo-random events, like the time between your keystrokes when you logged on, and generating numbers from those. This is also called {{collecting or extracting entropy}}.
* {{TLS}} is the protocol that combines all these cryptographic tools to create a secure channel for the web. It is the “s” in HTTPS. Suppose client A wants to connect to server B. Fill out the TLS handshake protocol below.
    * (You can assume the following definitions):
        * `GenerateKeyshare(random number)`: generates a Diffie-Hellman-style keyshare.
        * `GenerateKey(private number, keyshare)`: generates a key assuming `GenerateKeyshare()` was used.
        * `Sign(private key, message)`: uses the inputs to generate a signature.
        * `Verify(public key, signature, message):` returns 1 if the message was signed with the private key.
        * `MAC(key, message)`: generates a checksum.
    1. `A` generates a random number, `p`. `A` runs {{`GenerateKeyShare(p)`}} to produce `keyshareA`. `A` sends {{a client hello message and `keyshareA`}} to `B`.
    2. `B` generates a random number, `q`. `B` runs {{`GenerateKeyShare(q)`}} to produce `keyshareB`. `B` sends {{a server hello message}} and `keyshareB` to `A`.
    3. `B` verifies its identity to `A`. It sends: 
        1. {{"my public key is XXXX"}}, 
        2. a signature generated by a {{CA}}: {{`Sign(CA private key, "my public key is XXXX")`}}
        3. a signature generated by `B`: {{`Sign(B's private key, keyshareB)`}}.
    4. `A` verifies this info. 
        * `A` computes {{`Verify(CA public key, "my public key is XXXX", signature generated by a CA)`}}. It should equal {{1}}.
        * `A` computes {{`Verify(B's public key, keyshareB, signature generated by a B)`}}. It should also equal {{1}}.
    5. `A` uses {{`p` and `keyshareB`}} to derive the master key. `B` uses {{`q` and `keyshareA`}} to derive the master key.
    6. `A` and `B` both tie the new key to the rest of the handshake. 
        1. They compute and send to each other: {{`MAC(master key, Hash(all messages sent to far))`}}. 
        2. They verify the other side computed the same value.
* Does modern TLS (1.3) guarantee confidentiality? {{`Y`}}
* Does modern TLS guarantee authenticity? {{`Y`}}
* Does modern TLS guarantee forward secrecy? {{`Y`}}
* What is the main advantage TLS-encrypted communications have over asymmetrically-encrypted communications? {{speed}}

# Exercises
```text
A → B: What’s the password?
B → A: It’s 'Abc$xyMe'.
A → B: That’s right! Here’s my confidential information.
```
* Consider the scenario above. It's a bad way to use shared secrets. Why? Answer: {{E learns both the password and the confidential information; M could pretend to be either A or B}}.
```text
A → B: 2023-11-03: pay $100
A → B: E(k1, 2023-11-03 Sue)
A → B: MAC(k2, 2023-11-03: pay $100)
```
* Exercise: Suppose A and B have two shared keys: k1 and k2. Assume attackers do not have the keys. 
    * Can E learn who is being paid? {{`N`}}
    * Can E learn how much is being paid? {{`Y`}}
    * Can M change who is being paid? {{`Y`}}
    * Can M change how much is being paid? {{`N`}}
```text
(A computes S(A's private key, "Did you order lunch?") to get [s1.a]).
A → B: Did you order lunch? [s1.a]

(B computes V(A's public key, [s1.a], "Did you order lunch?") and finds that it equals 1).
(B computes S(B's private key, "Yes.") to get [s1.b])
B → A: Yes. [s1.b]

A → B: Vegetarian? [s2.a]
B → A: No, not this time. [s2.b]

...
A → B: There's a guy at the door, says he's here to repair the AC. Should I let him in? [sN.a]
```
* Exercise: consider the exchange above. How can attacker hijack the reponse to A’s last inquiry? Answer: {{an M can copy and paste B's message, `"Yes." [s2.b]`}}. 

```text
A → B: #1 Did you order lunch? [s1.a]
B → A: #1 Yes. [s1.b]

A → B: #2 Vegetarian? [s2.a]
B → A: #2 No, not this time. [s2.b]

...

M → B: #54 Did you order lunch?[s54.m]
B → M: #54 Yes. [s54.b]

...
A → B: #54 There's a guy at the door, says he's here to repair the AC. Should I let him in? [s54.a]
```
* Exercise: consider the exchange above. M maliciously requested a response from B to elicit a response that could used in an exploit. What does M have to do next to hijack the B's response to A’s last inquiry? Answer: {{M can copy and paste B's message, `"Yes." [s54.b]`}}. 
