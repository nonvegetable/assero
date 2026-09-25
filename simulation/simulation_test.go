package simulation

import (
	"testing"
	"time"
)

func TestRandomSimulationIsReproducible(t *testing.T) {
	config := Config{Nodes: 100, Transactions: 20, CommitteeSize: 10, RequiredVotes: 7, Latency: 500 * time.Millisecond, Seed: 42, Mode: RandomCommittee}
	first, err := Run(config)
	if err != nil {
		t.Fatal(err)
	}
	second, err := Run(config)
	if err != nil {
		t.Fatal(err)
	}
	if first != second {
		t.Fatalf("same seed produced different result: %#v %#v", first, second)
	}
}

func TestCommitteeUsesFewerMessagesThanAllValidators(t *testing.T) {
	base := Config{Nodes: 1000, Transactions: 10, CommitteeSize: 15, RequiredVotes: 10, Seed: 7}
	randomResult, err := Run(Config{Nodes: base.Nodes, Transactions: base.Transactions, CommitteeSize: base.CommitteeSize, RequiredVotes: base.RequiredVotes, Seed: base.Seed, Mode: RandomCommittee})
	if err != nil {
		t.Fatal(err)
	}
	allResult, err := Run(Config{Nodes: base.Nodes, Transactions: base.Transactions, CommitteeSize: base.CommitteeSize, RequiredVotes: base.RequiredVotes, Seed: base.Seed, Mode: AllValidators})
	if err != nil {
		t.Fatal(err)
	}
	if randomResult.Messages >= allResult.Messages {
		t.Fatalf("committee messages=%d all-validator messages=%d", randomResult.Messages, allResult.Messages)
	}
}
