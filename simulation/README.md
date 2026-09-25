# Simulation package

The simulator uses seeded virtual validators, so large experiments do not require one process or machine per validator. It reports finalized and failed transactions, consensus messages, bytes, and average finality latency.

Examples from the repository root:

```bash
go run ./cmd/asserod simulate --nodes 1000 --transactions 100 --committee-size 15 --required-votes 10 --seed 42
go run ./cmd/asserod simulate --nodes 1000 --transactions 100 --committee-size 15 --mode all --seed 42
go run ./cmd/asserod simulate --nodes 100 --transactions 100 --offline-nodes 0.1 --packet-loss 0.05 --byzantine-nodes 0.05 --seed 42
```

Modes are `random`, `fixed`, and `all`. This is a reproducible communication model, not a real-time network emulator: latency affects reported finality, while packet loss and node availability affect quorum success.
