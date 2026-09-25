# ASSeRO Architecture

## Scope

ASSeRO is a permissioned registry protocol for authorized institutional validators. An originating RTO performs the real-world inspection and document checks. A future deterministic committee checks cryptographic validity and global ledger consistency; committee members do not attest to the physical inspection.

## Layering

```text
cmd/                    CLI and process entry points
consensus/              committee selection, votes, quorum, finality
network/                compact messages, transport, sync
ledger/                 transactions, blocks, state commitments
registry/               vehicle domain rules
storage/                durable append-only persistence
crypto/                 hashes, signatures, canonical encodings
simulation/             virtual network and fault injection
```

Consensus must depend on interfaces and deterministic ledger/domain functions, not on a particular transport or database. This allows the same state machine to run in deterministic tests and in a networked process.

## Phase 1 implementation

The current node is a single authoritative local state machine:

1. Load an append-only JSON-lines log and rebuild state.
2. Validate transaction structure, signature, authorization, nonce, and vehicle transition.
3. Apply the transition in memory.
4. Append the transaction and resulting state record, flush, and `fsync` the file.

The log is intentionally simple and inspectable. It is a correctness baseline, not the final low-bandwidth storage format.

## Distributed prototype path

The originating validator submits a signed proposal. All validators can derive the same committee from the previous checkpoint hash, transaction hash, and epoch. Only committee members vote. The `consensus` package implements deterministic selection, signed votes, quorum certificates, and finalized-vehicle conflict tracking. The `network` package provides a virtual offline queue and incremental transaction sync. The `simulation` package exercises randomized, fixed, and all-validator communication baselines with seeded failure injection. Persistent TCP transport, authenticated membership certificates, and Merkle proofs remain follow-on work.

## Design vocabulary

- **Fact:** Ed25519 signatures authenticate a byte string; durable append plus fsync survives process restart subject to filesystem guarantees.
- **Design decision:** Phase 1 uses JSON-lines persistence to prioritize inspectability and deterministic recovery.
- **Assumption:** The validator membership registry and authority certificates are distributed out of band and correctly maintained.
- **Hypothesis:** Random committees reduce per-transaction CPU and communication as the validator population grows while preserving acceptable finality under an appropriate sampling model.
- **Measured result:** Only numbers produced by tests/benchmarks in this repository qualify; no performance number is invented here.
