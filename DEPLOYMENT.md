# ASSeRO Deployment

ASSeRO is experimental infrastructure software. It is not production-ready and is not approved or suitable for government deployment without a separate security, operations, and protocol review.

## Build and run one node

```bash
go build -o asserod ./cmd/asserod
./asserod --data ./data init --node-id RTO-A --listen :7000 --metrics :9090
./asserod --config ./data/asserod.toml run
```

The daemon listens for framed TCP peer messages and serves `/health`, `/status`, and `/metrics` on the metrics address. Stop it with `SIGINT` or `SIGTERM`. The local append-only ledger and outbound queue are fsynced before writes return.

## Three-node local testnet

From the repository root:

```bash
docker compose up --build
curl http://localhost:9090/health
curl http://localhost:9090/metrics
go run ./cmd/asserod --config ./configs/node-a.toml peers
```

Each node has an independent Docker volume and is limited to 0.5 CPU and 128 MB RAM. Scale this pattern by adding a config, service, port, and volume per validator. These compose values are a constrained experiment, not capacity recommendations.

## Hosting a node on another machine

1. Build the image from a reviewed commit or build `asserod` from source.
2. Create a unique identity with `asserod init --node-id YOUR-AUTHORIZED-ID`.
3. Write a TOML config with a reachable `listen_addr`, `data_dir`, metrics bind address, and static `[peers]` bootstrap addresses.
4. Exchange validator IDs, public keys, and authority approval through an authenticated out-of-band process.
5. Allow the TCP listen port between validators and restrict the metrics endpoint to operators or a monitoring network.
6. Run `asserod --config /path/to/node.toml run` under systemd, a container supervisor, or an equivalent restart policy.

The current prototype does not implement TLS, certificate chains, key rotation, NAT traversal, or dynamic membership. Do not expose the peer port to an untrusted network.

## Backup and recovery

Stop the node before copying its data directory. Back up `identity.json`, `ledger.log`, and the `queue/` directory together, protect the private key, and test restore into a separate data directory. Never merge data directories from different node identities.

## Resource guidance

The research target remains one CPU core, 512 MB RAM, and 1 GB storage, but no deployment guarantee is made. Measure CPU, memory, disk growth, queue growth, peer reconnect behavior, and finality under the actual workload and network conditions.