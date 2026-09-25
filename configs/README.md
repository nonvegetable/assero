# Node configurations

The TOML files in this directory are a three-node local Docker Compose example. Each node must have a unique validator ID, listen address, metrics address, data volume, and static peer list.

Run the example from the repository root with:

```bash
docker compose up --build
```

For a different host, replace Docker service names with reachable DNS names or IP addresses and restrict peer/metrics ports with the host firewall.
# Configurations

Reserved for reproducible validator membership, committee, quorum, and simulator configurations.
