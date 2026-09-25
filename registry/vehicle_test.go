package registry

import (
	"github.com/asserro/asserro/ledger"
	"testing"
)

func TestApplyRejectsStaleAndAllowsSuspendRestore(t *testing.T) {
	tx := &ledger.Transaction{ID: [32]byte{1}, Type: ledger.Register, VehicleID: "VH-1", OriginatingValidator: "RTO-1", Timestamp: 1}
	v, err := Apply(nil, tx)
	if err != nil {
		t.Fatal(err)
	}
	stale := &ledger.Transaction{Type: ledger.Suspend, VehicleID: "VH-1"}
	if _, err := Apply(&v, stale); err == nil {
		t.Fatal("stale transition accepted")
	}
	suspend := &ledger.Transaction{Type: ledger.Suspend, VehicleID: "VH-1", PreviousStateHash: v.TransactionHash, Timestamp: 2}
	v, err = Apply(&v, suspend)
	if err != nil || v.Status != Suspended {
		t.Fatalf("suspend failed: %v", err)
	}
	restore := &ledger.Transaction{Type: ledger.Restore, VehicleID: "VH-1", PreviousStateHash: v.TransactionHash, Timestamp: 3}
	v, err = Apply(&v, restore)
	if err != nil || v.Status != Active {
		t.Fatalf("restore failed: %v", err)
	}
}
