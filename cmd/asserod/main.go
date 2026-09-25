package main

import (
	"context"
	"crypto/ed25519"
	"encoding/hex"
	"encoding/json"
	"flag"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/signal"
	"path/filepath"
	"syscall"
	"time"

	"github.com/asserro/asserro/config"
	asserrocrypto "github.com/asserro/asserro/crypto"
	"github.com/asserro/asserro/ledger"
	"github.com/asserro/asserro/network"
	"github.com/asserro/asserro/registry"
	"github.com/asserro/asserro/simulation"
	"github.com/asserro/asserro/storage"
)

type identity struct {
	ValidatorID string `json:"validator_id"`
	PublicKey   []byte `json:"public_key"`
	PrivateKey  []byte `json:"private_key"`
}

func main() {
	data := flag.String("data", "./data", "data directory")
	configPath := flag.String("config", "", "TOML configuration path")
	flag.Parse()
	args := flag.Args()
	if len(args) == 0 {
		usage()
		return
	}
	command := args[0]
	if command == "peers" {
		cmdPeers(*data, *configPath, args[1:])
		return
	}
	if command == "simulate" {
		cmdSimulate(args[1:])
		return
	}
	if command == "init" {
		cmdInit(*data, args[1:])
		return
	}
	if command == "run" {
		cmdRun(*data, *configPath, args[1:])
		return
	}
	id, err := loadIdentity(*data, false, "")
	if err != nil {
		fatal(err)
	}
	db, err := storage.Open(*data)
	if err != nil {
		fatal(err)
	}
	defer db.Close()
	switch command {
	case "init":
		fmt.Println("initialized", id.ValidatorID)
	case "status":
		fmt.Printf("validator=%s transactions=%d vehicles=%d\n", id.ValidatorID, db.Count(), db.VehicleCount())
	case "state":
		cmdState(db, args[1:])
	case "register":
		cmdRegister(db, id, args[1:])
	default:
		usage()
	}
}
func usage() {
	fmt.Println("asserod --data DIR [--config FILE] init|run|peers|status|register|state|simulate")
}
func fatal(err error) { fmt.Fprintln(os.Stderr, "error:", err); os.Exit(1) }
func loadIdentity(dir string, create bool, requestedID string) (*identity, error) {
	p := filepath.Join(dir, "identity.json")
	b, err := os.ReadFile(p)
	if err == nil {
		var id identity
		err = json.Unmarshal(b, &id)
		if err == nil && requestedID != "" && requestedID != id.ValidatorID {
			return nil, fmt.Errorf("identity %q does not match config node_id %q", id.ValidatorID, requestedID)
		}
		return &id, err
	}
	if !create {
		return nil, fmt.Errorf("identity missing; run init")
	}
	if err := os.MkdirAll(dir, 0700); err != nil {
		return nil, err
	}
	pub, priv, err := asserrocrypto.GenerateKey()
	if err != nil {
		return nil, err
	}
	if requestedID == "" {
		requestedID = "RTO-LOCAL-01"
	}
	id := &identity{ValidatorID: requestedID, PublicKey: pub, PrivateKey: priv}
	out, _ := json.MarshalIndent(id, "", "  ")
	return id, os.WriteFile(p, out, 0600)
}

func cmdInit(dataDir string, args []string) {
	fs := flag.NewFlagSet("init", flag.ExitOnError)
	nodeID := fs.String("node-id", "RTO-LOCAL-01", "validator ID")
	listenAddr := fs.String("listen", ":7000", "TCP listen address")
	metricsAddr := fs.String("metrics", ":9090", "HTTP metrics address")
	configPath := fs.String("config", filepath.Join(dataDir, "asserod.toml"), "configuration path")
	fs.Parse(args)
	if _, err := loadIdentity(dataDir, true, *nodeID); err != nil {
		fatal(err)
	}
	c := config.Default(dataDir, *nodeID)
	c.ListenAddr, c.MetricsAddr = *listenAddr, *metricsAddr
	if err := config.Save(*configPath, c); err != nil {
		fatal(err)
	}
	fmt.Printf("initialized %s\nconfig=%s\n", *nodeID, *configPath)
}

func cmdRun(dataDir, configPath string, args []string) {
	fs := flag.NewFlagSet("run", flag.ExitOnError)
	if configPath == "" {
		configPath = filepath.Join(dataDir, "asserod.toml")
	}
	configFlag := fs.String("config", configPath, "configuration path")
	fs.Parse(args)
	c, err := config.Load(*configFlag)
	if err != nil {
		fatal(err)
	}
	id, err := loadIdentity(c.DataDir, false, c.NodeID)
	if err != nil {
		fatal(err)
	}
	db, err := storage.Open(c.DataDir)
	if err != nil {
		fatal(err)
	}
	defer db.Close()
	transport, err := network.NewTCPTransport(network.TCPConfig{NodeID: id.ValidatorID, ListenAddr: c.ListenAddr, Peers: c.Peers, QueueDir: c.QueueDir, HeartbeatInterval: c.HeartbeatInterval, ReconnectInterval: c.ReconnectInterval})
	if err != nil {
		fatal(err)
	}
	if err := transport.Start(); err != nil {
		fatal(err)
	}
	defer transport.Close()
	mux := http.NewServeMux()
	mux.HandleFunc("/health", func(w http.ResponseWriter, _ *http.Request) {
		w.WriteHeader(http.StatusOK)
		_, _ = w.Write([]byte("ok\n"))
	})
	mux.HandleFunc("/metrics", func(w http.ResponseWriter, _ *http.Request) {
		stats := transport.Stats()
		fmt.Fprintf(w, "asserro_transactions %d\nasserro_vehicles %d\nasserro_network_sent_messages %d\nasserro_network_sent_bytes %d\nasserro_network_queued_messages %d\n", db.Count(), db.VehicleCount(), stats.SentMessages, stats.SentBytes, stats.QueuedMessages)
	})
	mux.HandleFunc("/status", func(w http.ResponseWriter, _ *http.Request) {
		peers := transport.PeerIDs()
		fmt.Fprintf(w, "validator=%s transactions=%d vehicles=%d peers=%d\n", id.ValidatorID, db.Count(), db.VehicleCount(), len(peers))
	})
	server := &http.Server{Addr: c.MetricsAddr, Handler: mux}
	go func() {
		if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Printf("metrics server: %v", err)
		}
	}()
	ctx, stop := signal.NotifyContext(context.Background(), os.Interrupt, syscall.SIGTERM)
	defer stop()
	log.Printf("asserod node=%s tcp=%s metrics=%s peers=%d", id.ValidatorID, c.ListenAddr, c.MetricsAddr, len(c.Peers))
	<-ctx.Done()
	shutdownCtx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	_ = server.Shutdown(shutdownCtx)
}

func cmdPeers(dataDir, configPath string, args []string) {
	fs := flag.NewFlagSet("peers", flag.ExitOnError)
	if configPath == "" {
		configPath = filepath.Join(dataDir, "asserod.toml")
	}
	configFlag := fs.String("config", configPath, "configuration path")
	fs.Parse(args)
	c, err := config.Load(*configFlag)
	if err != nil {
		fatal(err)
	}
	for id, address := range c.Peers {
		fmt.Printf("%s %s\n", id, address)
	}
}
func cmdState(db *storage.Database, args []string) {
	fs := flag.NewFlagSet("state", flag.ExitOnError)
	id := fs.String("vehicle-id", "", "vehicle ID")
	fs.Parse(args)
	v, ok := db.Vehicle(*id)
	if !ok {
		fatal(fmt.Errorf("vehicle not found"))
	}
	out, _ := json.MarshalIndent(v, "", "  ")
	fmt.Println(string(out))
}
func cmdRegister(db *storage.Database, id *identity, args []string) {
	fs := flag.NewFlagSet("register", flag.ExitOnError)
	vehicleID := fs.String("vehicle-id", "", "vehicle ID")
	vin := fs.String("vin", "", "VIN")
	reg := fs.String("registration", "", "registration number")
	owner := fs.String("owner-hash", "", "pseudonymous owner hash")
	rto := fs.String("rto", id.ValidatorID, "originating validator")
	typ := fs.String("type", "", "vehicle type")
	fs.Parse(args)
	if *vehicleID == "" || *vin == "" {
		fatal(fmt.Errorf("vehicle-id and vin are required"))
	}
	if *rto != id.ValidatorID {
		fatal(fmt.Errorf("originating validator must match local identity"))
	}
	if _, ok := db.Vehicle(*vehicleID); ok {
		fatal(fmt.Errorf("vehicle already exists"))
	}
	payload := asserrocrypto.Hash([]byte(*vin + "|" + *reg + "|" + *owner + "|" + *typ))
	tx := ledger.NewTransaction(ledger.Register, *vehicleID, *rto, [32]byte{}, payload, uint64(db.Count()+1))
	if err := tx.Sign(ed25519.PrivateKey(id.PrivateKey)); err != nil {
		fatal(err)
	}
	v := registry.Vehicle{VehicleID: *vehicleID, VIN: *vin, RegistrationNumber: *reg, OwnerIdentifierHash: *owner, RTOIdentifier: *rto, VehicleType: *typ}
	if err := registry.ValidateNew(v); err != nil {
		fatal(err)
	}
	v, err := registry.Apply(nil, tx)
	if err != nil {
		fatal(err)
	}
	v.VIN = *vin
	v.RegistrationNumber = *reg
	v.OwnerIdentifierHash = *owner
	v.VehicleType = *typ
	if !tx.Verify(ed25519.PublicKey(id.PublicKey)) {
		fatal(fmt.Errorf("self verification failed"))
	}
	if err := db.Commit(tx, &v); err != nil {
		fatal(err)
	}
	fmt.Println(hex.EncodeToString(tx.ID[:]))
}

func cmdSimulate(args []string) {
	fs := flag.NewFlagSet("simulate", flag.ExitOnError)
	nodes := fs.Int("nodes", 100, "virtual validator count")
	transactions := fs.Int("transactions", 100, "transaction count")
	committeeSize := fs.Int("committee-size", 15, "committee size")
	requiredVotes := fs.Int("required-votes", 0, "required votes; zero uses two-thirds plus one")
	latency := fs.Duration("latency", 500*time.Millisecond, "simulated round-trip latency")
	packetLoss := fs.Float64("packet-loss", 0, "packet loss probability")
	offlineNodes := fs.Float64("offline-nodes", 0, "offline node probability")
	byzantineNodes := fs.Float64("byzantine-nodes", 0, "Byzantine node probability")
	seed := fs.Int64("seed", 42, "deterministic random seed")
	mode := fs.String("mode", "random", "random, fixed, or all")
	fs.Parse(args)
	simulationMode := simulation.RandomCommittee
	switch *mode {
	case "fixed":
		simulationMode = simulation.FixedCommittee
	case "all":
		simulationMode = simulation.AllValidators
	case "random":
	default:
		fatal(fmt.Errorf("unknown simulation mode %q", *mode))
	}
	result, err := simulation.Run(simulation.Config{Nodes: *nodes, Transactions: *transactions, CommitteeSize: *committeeSize, RequiredVotes: *requiredVotes, Latency: *latency, PacketLoss: *packetLoss, OfflineNodes: *offlineNodes, ByzantineNodes: *byzantineNodes, Seed: *seed, Mode: simulationMode})
	if err != nil {
		fatal(err)
	}
	fmt.Printf("mode=%s nodes=%d transactions=%d finalized=%d failed=%d messages=%d bytes=%d avg_finality=%s\n", *mode, result.Nodes, result.Transactions, result.Finalized, result.Failed, result.Messages, result.Bytes, result.AverageFinality)
}
