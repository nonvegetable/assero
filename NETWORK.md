# Network Plan

The baseline will use length-delimited binary messages over persistent TCP. Protocol Buffers may be introduced only if measurements show that its implementation cost is justified. The wire protocol will carry proposal IDs, hashes, votes, certificates, and bounded transaction batches; it will not ship the full ledger for ordinary synchronization.

Required measurements are bytes sent/received per transaction, message count, duplicate rate, batch size, synchronization bytes, and behavior under latency, loss, and reconnect.
