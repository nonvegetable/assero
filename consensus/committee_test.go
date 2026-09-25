package consensus

import (
	"crypto/ed25519"
	"testing"

	asserrocrypto "github.com/asserro/asserro/crypto"
	"github.com/asserro/asserro/ledger"
)

func TestCommitteeSelectionIsDeterministic(t *testing.T) {
	validators := make([]Validator, 10)
	for i := range validators {
		pub, _, err := asserrocrypto.GenerateKey()
		if err != nil {
			t.Fatal(err)
		}
		validators[i] = Validator{ID: "RTO-" + string(rune('A'+i)), PublicKey: pub}
	}
	first, err := SelectCommittee([32]byte{1}, [32]byte{2}, 3, validators, 5)
	if err != nil {
		t.Fatal(err)
	}
	second, err := SelectCommittee([32]byte{1}, [32]byte{2}, 3, validators, 5)
	if err != nil {
		t.Fatal(err)
	}
	for i := range first {
		if first[i].ID != second[i].ID {
			t.Fatal("committee selection changed")
		}
	}
}

func TestCertificateRequiresDistinctSignedCommitteeVotes(t *testing.T) {
	pub, priv, err := ed25519.GenerateKey(nil)
	if err != nil {
		t.Fatal(err)
	}
	member := Validator{ID: "RTO-1", PublicKey: pub}
	tx := &ledger.Transaction{ID: [32]byte{9}, VehicleID: "VH-1"}
	vote := Vote{ProposalID: tx.ID, ValidatorID: member.ID, Result: Accept}
	if err := vote.Sign(priv); err != nil {
		t.Fatal(err)
	}
	if _, err := BuildCertificate(tx, []Validator{member}, []Vote{vote, vote}, 1); err != nil {
		t.Fatal(err)
	}
	bad := vote
	bad.ProposalID = [32]byte{8}
	if _, err := BuildCertificate(tx, []Validator{member}, []Vote{bad}, 1); err == nil {
		t.Fatal("invalid vote reached quorum")
	}
}
