* Define the following
    * Viruses: “{{malware that inserts itself into another program}}”
    * Macro viruses: “{{viruses written in a scripting language (ex. VBS) that spread to office documents, not executables}}”.
    * Worms: “{{independent program that copies itself to other machines or USB keys, etc.}}”
    * trojan (horse)s: “{{useful-looking program that is malware}}”
    * Potentially unwanted programs (PUP): “{{Sometimes considered malware, sometimes not. Most commonly programs bundled with other programs. Sometimes disclosed but in (deceptive?) fine print}}”
    * dual-use software: “{{intentionally ‘evil’ software masquerading as legit}}”.
    * What is one way ad injection might work? {{modifying browser to add/change ads}}
    * cryptolockers: {{encrypt files for “ransom”. the decryption key stored only on attacker-controlled server.}}
    * RAT ("Remote Access {{Trojan}}"): {{gives remote attackers interactive control over a compromised machine}}.
    * SolarWinds incident: {{when a supplier of network-monitoring software used by many big customers, including US Gov’t was attacked by third-party to spy on customers}}.
    * Stuxnet virus: {{a virus developed by US and Israel that targeted Iranian nuclear enrichment facilities}}.
* software vulnerability: {{unintended program behavior that can used by an adversary}}. Types of software vulnerabilities are {{memory safety, type confusion, integer overflow, forgetting input validation, undefined C behavior, synchronization bug, etc}}.
    * "Exploit": {{something that uses a vulnerability to do something}}.
    * "Proof-of-concept": {{a demonstration that a exploit could leverage a vulnerability}}.
* Some ways malware might spread with human help are: {{installed by other malware, installed manually after illegitimate access, included in deceptively marketed software, injected into an update for non-malicious software, etc}}.
    * xz-utils backdoor incident: {{when a malicious character became the maintainer of an  open-source compression library (used by OpenSSH), and malicious code was injected into the widely-used utility}}.
* Some ways malware might spread without human help are: {{vulnerable network-accessible services, macros in Word/Excel/etc. files, email attachments, websites + browser vulnerabilities}}.
* Malware defense strategies might include...
    * Antivirus software, like {{Windows Defender, avast, McAfee}}.
    * App store filtering
    * "Sandboxing" policies. For example, {{don't let the weather app access microphone}}.
    * Email spam filters
    * Web browser blacklists
* One way that malware authors try to make their malware harder to detect is through {{obfuscation}}. This might include...
    * Making code {{harder to read}} or {{different each time}}.
    * Blending in {{malware with normal files}}.
