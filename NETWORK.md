# Network Plan

The current daemon uses length-prefixed compact binary messages over persistent TCP. Each connection exchanges a validator-ID hello, supports proposal/vote/certificate/sync message kinds, emits heartbeats, and reconnects to configured static peers. Unreachable outbound messages are appended to a per-peer JSONL queue and retried after reconnect.

Protocol Buffers may be introduced only if measurements show that its implementation cost is justified. The current wire protocol carries proposal IDs, hashes, votes, certificates, and bounded transaction batches; it does not ship the full ledger for ordinary synchronization.

Peer authentication currently stops at configured validator IDs and hello matching. TLS, public-key authentication, authority certificates, and key rotation remain required before any hostile-network deployment.

Required measurements are bytes sent/received per transaction, message count, duplicate rate, batch size, synchronization bytes, and behavior under latency, loss, and reconnect.
