# Network package

The package provides a compact message size model, an in-memory virtual transport for deterministic tests, incremental replica synchronization, and a persistent TCP transport. TCP peers exchange length-prefixed binary frames, perform validator-ID hello matching, reconnect on failure, send heartbeats, and persist outbound messages in per-peer JSONL queues.

Peer identity matching is configuration-based only. TLS, public-key handshake authentication, authority certificates, and key rotation remain follow-on security work.
