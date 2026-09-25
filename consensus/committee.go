package consensus

import (
	"bytes"
	"crypto/ed25519"
	"encoding/binary"
	"fmt"
	"sort"

	asserrocrypto "github.com/asserro/asserro/crypto"
	"github.com/asserro/asserro/ledger"
)

type Validator struct {
	ID        string
	PublicKey ed25519.PublicKey
}

func SelectCommittee(previous [32]byte, transaction [32]byte, epoch uint64, validators []Validator, size int) ([]Validator, error) {
	if size < 1 || size > len(validators) {
		return nil, fmt.Errorf("committee size must be between 1 and validator count")
	}
	seedInput := bytes.NewBufferString("ASSeRO/committee/v1")
	seedInput.Write(previous[:])
	seedInput.Write(transaction[:])
	_ = binary.Write(seedInput, binary.BigEndian, epoch)
	seed := asserrocrypto.Hash(seedInput.Bytes())
	type ranked struct {
		validator Validator
		rank      [32]byte
	}
	rankedValidators := make([]ranked, 0, len(validators))
	seen := make(map[string]bool, len(validators))
	for _, validator := range validators {
		if validator.ID == "" || seen[validator.ID] {
			continue
		}
		seen[validator.ID] = true
		rankInput := append(seed[:], []byte(validator.ID)...)
		rankedValidators = append(rankedValidators, ranked{validator: validator, rank: asserrocrypto.Hash(rankInput)})
	}
	if size > len(rankedValidators) {
		return nil, fmt.Errorf("not enough unique validators")
	}
	sort.Slice(rankedValidators, func(i, j int) bool {
		if rankedValidators[i].rank != rankedValidators[j].rank {
			return bytes.Compare(rankedValidators[i].rank[:], rankedValidators[j].rank[:]) < 0
		}
		return rankedValidators[i].validator.ID < rankedValidators[j].validator.ID
	})
	committee := make([]Validator, size)
	for i := range committee {
		committee[i] = rankedValidators[i].validator
	}
	return committee, nil
}

type VoteResult uint8

const (
	Accept VoteResult = iota + 1
	Reject
	Timeout
	Malformed
	Conflict
)

func (r VoteResult) String() string {
	return [...]string{"INVALID", "ACCEPT", "REJECT", "TIMEOUT", "MALFORMED", "CONFLICT"}[r]
}

type Vote struct {
	ProposalID  [32]byte
	ValidatorID string
	Result      VoteResult
	Signature   []byte
}

func (v *Vote) signingBytes() []byte {
	data := make([]byte, 0, 32+1+len(v.ValidatorID))
	data = append(data, v.ProposalID[:]...)
	data = append(data, byte(v.Result), byte(len(v.ValidatorID)))
	data = append(data, v.ValidatorID...)
	return data
}

func (v *Vote) Sign(privateKey ed25519.PrivateKey) error {
	signature, err := asserrocrypto.Sign(privateKey, v.signingBytes())
	if err != nil {
		return err
	}
	v.Signature = signature
	return nil
}

func (v *Vote) Verify(publicKey ed25519.PublicKey) bool {
	return asserrocrypto.Verify(publicKey, v.signingBytes(), v.Signature)
}

type Certificate struct {
	ProposalID [32]byte
	Votes      []Vote
}

func BuildCertificate(proposal *ledger.Transaction, committee []Validator, votes []Vote, required int) (*Certificate, error) {
	if proposal == nil || required < 1 || required > len(committee) {
		return nil, fmt.Errorf("invalid certificate configuration")
	}
	keys := make(map[string]Validator, len(committee))
	for _, member := range committee {
		keys[member.ID] = member
	}
	accepted := make(map[string]bool)
	for _, vote := range votes {
		member, isMember := keys[vote.ValidatorID]
		if isMember && vote.ProposalID == proposal.ID && vote.Result == Accept && !accepted[vote.ValidatorID] && vote.Verify(member.PublicKey) {
			accepted[vote.ValidatorID] = true
		}
	}
	if len(accepted) < required {
		return nil, fmt.Errorf("quorum not reached: got %d, need %d", len(accepted), required)
	}
	certificateVotes := make([]Vote, 0, len(accepted))
	for _, vote := range votes {
		if accepted[vote.ValidatorID] {
			certificateVotes = append(certificateVotes, vote)
		}
	}
	return &Certificate{ProposalID: proposal.ID, Votes: certificateVotes}, nil
}

type ConflictTracker struct {
	finalized map[string][32]byte
}

func NewConflictTracker() *ConflictTracker {
	return &ConflictTracker{finalized: make(map[string][32]byte)}
}

func (t *ConflictTracker) Finalize(vehicleID string, proposalID [32]byte) error {
	if existing, ok := t.finalized[vehicleID]; ok && existing != proposalID {
		return fmt.Errorf("conflicting proposal already finalized")
	}
	t.finalized[vehicleID] = proposalID
	return nil
}
