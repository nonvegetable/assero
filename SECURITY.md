# ASSeRO Security Notes

ASSeRO is an experimental protocol. This document records the security boundary of the current implementation; it is not a production security assessment.

## Phase 1 guarantees

- Ed25519 signs the canonical transaction fields.
- The transaction ID hashes the signed transaction, so changing signed or identifying fields invalidates the ID.
- The CLI only creates transactions whose originating validator matches the local identity.
- A durable commit requires the transaction ID, vehicle ID, and resulting state hash to agree.
- Non-registration transitions must reference the currently committed state hash.
- Duplicate transaction IDs and duplicate registrations are rejected both before append and during replay.
- `fsync` is called before an append is made visible in the in-memory indexes.

## Assumptions

- The local identity file and private key are protected by the host operating system.
- Validator membership and authority certificates are maintained by an authenticated out-of-band process; certificates are not implemented in Phase 1.
- The filesystem honors the durability contract of `fsync`.
- The originating RTO is responsible for physical inspection and document verification. The ledger only authenticates the signed claim.

## Not guaranteed

Phase 1 has no network authentication handshake, quorum certificate, Byzantine fault tolerance, equivocation evidence, partition resolution, key rotation, or encrypted transport. A compromised private key can authorize fraudulent transactions. The distributed safety claims in `CONSENSUS.md` remain conditional design hypotheses until the networked phases and adversarial tests are implemented.