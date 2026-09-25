package ledger

import (
	asserrocrypto "github.com/asserro/asserro/crypto"
	"testing"
)

func TestTransactionSignVerifyAndTamper(t *testing.T) {
	pub, priv, err := asserrocrypto.GenerateKey()
	if err != nil {
		t.Fatal(err)
	}
	tx := NewTransaction(Register, "VH-1", "RTO-1", [32]byte{}, asserrocrypto.Hash([]byte("payload")), 1)
	if err := tx.Sign(priv); err != nil {
		t.Fatal(err)
	}
	if !tx.Verify(pub) {
		t.Fatal("signature should verify")
	}
	tx.VehicleID = "VH-2"
	if tx.Verify(pub) {
		t.Fatal("tampered transaction verified")
	}
}
