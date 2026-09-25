# ASSeRO Consensus Specification (Research Prototype)

## Transaction and state model

The canonical transaction is:

```text
transaction_id        32 bytes
transaction_type      REGISTER | TRANSFER_OWNERSHIP | UPDATE_ADDRESS |
                      SUSPEND | RESTORE | SCRAP
vehicle_id            bounded UTF-8 identifier
previous_state_hash   32 bytes, or zero for REGISTER
payload_hash          32 bytes
originating_validator validator ID
timestamp             Unix nanoseconds
nonce                 monotonically increasing origin nonce
signature             Ed25519 over canonical unsigned fields
```

Vehicle state contains only pseudonymous owner data: vehicle ID, VIN, registration number, owner identifier hash, RTO identifier, type, registration timestamp, status, previous state hash, and transaction hash. Large documents are represented by hashes and remain outside the ledger.

## Committee selection

For transaction `T`, let `P` be the previous finalized checkpoint hash and `E` the current epoch. Define:

```text
seed = SHA-256("ASSeRO/committee/v1" || P || T.transaction_hash || uint64_be(E))
```

Sort the authorized validator IDs by `SHA-256(seed || validator_id)` with validator ID as a final tie-breaker, and take the first `committee_size` distinct eligible validators. Every honest validator with the same membership snapshot, checkpoint, epoch, and transaction derives the same committee. Membership changes therefore require an explicit epoch/checkpoint boundary.

This is deterministic verifiable sampling, not a source of unpredictable randomness. A malicious party may grind transaction contents or exploit a compromised membership authority. Future work must evaluate beacon construction and committee grinding resistance.

## Votes, quorum, and finality

Each committee member returns exactly one explicit result: `ACCEPT`, `REJECT`, `TIMEOUT`, `MALFORMED`, or `CONFLICT`. Network failure is not silently converted into rejection. A proposal is final only when it has `required_votes` distinct valid committee signatures over the same proposal hash, and no valid conflicting certificate exists for the same vehicle/version key.

The prototype configuration must satisfy `1 <= required_votes <= committee_size`. A conservative Byzantine safety rule is `required_votes > (committee_size + f)/2` for an assumed maximum of `f` Byzantine committee members, and liveness additionally requires enough honest reachable members. This rule alone does not create BFT safety across arbitrary committees; the global safety claim depends on committee overlap and validator-membership assumptions.

The current Go implementation represents votes as Ed25519-signed `(proposal_id, validator_id, result)` messages. `BuildCertificate` counts only distinct committee members with valid `ACCEPT` signatures for the exact proposal ID. Duplicate, non-member, malformed, and conflicting votes do not contribute to quorum.

## State machine

```text
RECEIVED -> PROPOSED -> COMMITTEE_SELECTED -> VALIDATING -> VOTING
         -> QUORUM_REACHED -> FINALIZED

Any validation path may end in INVALID, REJECTED, CONFLICT, or TIMEOUT.
```

## Conflict rule

The state key is `vehicle_id`. A non-registration must name the current state hash. Two valid proposals for the same expected previous state are a conflict. The deterministic tie-break key is `(previous_state_hash, transaction_hash)` and the lexicographically smaller transaction hash wins only before either proposal is finalized. Once a certificate is observed, a later conflicting proposal is rejected. A production design would need an explicit lock/certificate protocol to prevent races; this prototype does not claim that a two-phase proposal race is solved until the distributed implementation and adversarial tests demonstrate it.

## Safety and liveness statement

**Safety is guaranteed only for the Phase 1 local state machine** under a non-corrupt local log and correct signature verification: an invalid, replayed, stale, or conflicting transition cannot be committed.

The distributed design hypothesis is conditional: no two conflicting certificates finalize if (a) committee membership snapshots are identical, (b) honest validators vote at most once per proposal round and never vote for conflicting proposals for the same state key, (c) certificate quorums intersect in an honest validator, and (d) checkpoint history is authenticated. Liveness requires a reachable quorum and eventual message delivery. These assumptions are targets for later tests, not measured results.
