package storage

import (
	"testing"

	"github.com/asserro/asserro/ledger"
	"github.com/asserro/asserro/registry"
)

func TestDurableReplay(t *testing.T) {
	dir := t.TempDir()
	db, err := Open(dir)
	if err != nil {
		t.Fatal(err)
	}
	tx := &ledger.Transaction{ID: [32]byte{1}, Type: ledger.Register, VehicleID: "VH-1"}
	v := &registry.Vehicle{VehicleID: "VH-1", TransactionHash: tx.ID}
	if err := db.Commit(tx, v); err != nil {
		t.Fatal(err)
	}
	if err := db.Commit(tx, v); err == nil {
		t.Fatal("duplicate transaction committed")
	}
	db.Close()
	db, err = Open(dir)
	if err != nil {
		t.Fatal(err)
	}
	defer db.Close()
	if db.Count() != 1 {
		t.Fatalf("count=%d", db.Count())
	}
	if _, ok := db.Vehicle("VH-1"); !ok {
		t.Fatal("vehicle not replayed")
	}
}
