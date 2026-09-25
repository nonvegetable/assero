# Threat Model

## In scope

Validators may crash, be unreachable, delay or reorder messages, duplicate messages, submit invalid transactions, or behave maliciously. An attacker may replay signed transactions, forge unsigned data, attempt unauthorized membership use, and submit concurrent changes for the same vehicle.

## Out of scope for Phase 1

Compromise of a validator's private key, compromise of the operating system, physical RTO fraud, denial of service against the host, and correctness of the out-of-band authority registry. These must be addressed operationally in a deployment, not hidden behind consensus terminology.

## Controls implemented now

- Ed25519 signatures cover canonical transaction bytes.
- Validator identity is bound to a local public key and ID in the identity file.
- Transaction IDs are hashes of canonical signed transactions.
- Nonces and transaction IDs prevent replay in the local log.
- Previous-state hashes prevent stale transitions.
- Domain rules reject illegal status transitions and duplicate VIN/registration values.
- Append-only recovery replays records and rejects tampered or truncated records.
- Committee selection is deterministic for a shared validator snapshot, checkpoint, epoch, and transaction.
- Quorum certificates require distinct committee membership and valid signatures over one proposal ID.
- Offline messages remain queued in the virtual transport and incremental sync transfers only missing transaction data.
- The seeded simulator measures packet loss, unreachable nodes, and Byzantine non-voters without claiming those failures are automatically solved.

## Known limitations

The prototype has no remote authority certificate chain, persistent network authentication handshake, anti-equivocation evidence, or partition resolution. The quorum package is a research primitive and does not by itself establish Byzantine fault tolerance across arbitrary committees. It must not be described as production-ready.
