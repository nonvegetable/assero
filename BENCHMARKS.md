# Benchmarks

## Reproducible smoke result

Command: `go run ./cmd/asserod simulate --nodes 1000 --transactions 100 --committee-size 15 --required-votes 10 --seed 42`

Observed on the development machine: 100 finalized transactions, 3,000 messages, 253,500 modeled bytes, and 1 second average modeled finality.

All-validator comparison with `--mode all`: 100 finalized transactions, 200,000 messages, and 16,900,000 modeled bytes.

These are simulator outputs, not physical network measurements or production capacity claims. Repeat them after implementation changes and record machine limits when comparing results.

No benchmark results are claimed yet. The implementation first establishes a correct Phase 1 baseline. Future benchmark runs must record the command, commit, machine/container limits, seed, node count, committee size, latency, loss rate, CPU, memory, disk I/O, finality latency, messages, and bytes.

Required comparisons:

1. Every-validator verification.
2. Fixed committee verification.
3. Deterministic randomized committee verification.

Results belong in this file only after automated benchmark output has produced them.
