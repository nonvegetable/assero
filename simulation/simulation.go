package simulation

import (
	"crypto/ed25519"
	"fmt"
	"math/rand"
	"time"

	"github.com/asserro/asserro/consensus"
	asserrocrypto "github.com/asserro/asserro/crypto"
	"github.com/asserro/asserro/ledger"
)

type Mode uint8

const (
	RandomCommittee Mode = iota + 1
	AllValidators
	FixedCommittee
)

type Config struct {
	Nodes          int
	Transactions   int
	CommitteeSize  int
	RequiredVotes  int
	Latency        time.Duration
	PacketLoss     float64
	OfflineNodes   float64
	ByzantineNodes float64
	Seed           int64
	Mode           Mode
}

type Result struct {
	Mode                Mode
	Nodes               int
	Transactions        int
	Finalized           int
	Failed              int
	Messages            int
	Bytes               int64
	CommitteeSelections int
	AverageFinality     time.Duration
}

func (c Config) normalize() (Config, error) {
	if c.Nodes < 1 || c.Transactions < 1 {
		return c, fmt.Errorf("nodes and transactions must be positive")
	}
	if c.Mode == 0 {
		c.Mode = RandomCommittee
	}
	if c.CommitteeSize < 1 || c.CommitteeSize > c.Nodes {
		return c, fmt.Errorf("invalid committee size")
	}
	if c.RequiredVotes < 1 {
		c.RequiredVotes = (c.CommitteeSize * 2 / 3) + 1
	}
	if c.RequiredVotes > c.CommitteeSize {
		return c, fmt.Errorf("required votes exceed committee size")
	}
	if c.PacketLoss < 0 || c.PacketLoss > 1 || c.OfflineNodes < 0 || c.OfflineNodes > 1 || c.ByzantineNodes < 0 || c.ByzantineNodes > 1 {
		return c, fmt.Errorf("failure rates must be between 0 and 1")
	}
	return c, nil
}

func Run(config Config) (Result, error) {
	config, err := config.normalize()
	if err != nil {
		return Result{}, err
	}
	random := rand.New(rand.NewSource(config.Seed))
	validators := make([]consensus.Validator, config.Nodes)
	privateKeys := make([]ed25519.PrivateKey, config.Nodes)
	for i := range validators {
		publicKey, privateKey, keyErr := asserrocrypto.GenerateKey()
		if keyErr != nil {
			return Result{}, keyErr
		}
		validators[i] = consensus.Validator{ID: fmt.Sprintf("RTO-%04d", i), PublicKey: publicKey}
		privateKeys[i] = privateKey
	}
	offline := make([]bool, config.Nodes)
	byzantine := make([]bool, config.Nodes)
	for i := range validators {
		offline[i] = random.Float64() < config.OfflineNodes
		byzantine[i] = random.Float64() < config.ByzantineNodes
	}
	result := Result{Mode: config.Mode, Nodes: config.Nodes, Transactions: config.Transactions}
	previous := [32]byte{}
	for transactionIndex := 0; transactionIndex < config.Transactions; transactionIndex++ {
		payload := asserrocrypto.Hash(fmt.Appendf(nil, "payload-%d", transactionIndex))
		transaction := ledger.NewTransaction(ledger.Register, fmt.Sprintf("VH-%06d", transactionIndex), validators[0].ID, previous, payload, uint64(transactionIndex+1))
		if err := transaction.Sign(privateKeys[0]); err != nil {
			return Result{}, err
		}
		members := validators
		switch config.Mode {
		case RandomCommittee:
			members, err = consensus.SelectCommittee(previous, transaction.ID, 0, validators, config.CommitteeSize)
			if err != nil {
				return Result{}, err
			}
			result.CommitteeSelections++
		case FixedCommittee:
			members = validators[:config.CommitteeSize]
		case AllValidators:
			members = validators
		}
		votes := 0
		for _, member := range members {
			memberIndex := validatorIndex(validators, member.ID)
			result.Messages++
			result.Bytes += int64(64 + len(transaction.VehicleID))
			if offline[memberIndex] || random.Float64() < config.PacketLoss || byzantine[memberIndex] {
				continue
			}
			votes++
			result.Messages++
			result.Bytes += 96
		}
		if votes >= config.RequiredVotes {
			result.Finalized++
			previous = transaction.ID
			result.AverageFinality += config.Latency * 2
		} else {
			result.Failed++
		}
	}
	if result.Finalized > 0 {
		result.AverageFinality /= time.Duration(result.Finalized)
	}
	return result, nil
}

func validatorIndex(validators []consensus.Validator, id string) int {
	for index, validator := range validators {
		if validator.ID == id {
			return index
		}
	}
	return 0
}
