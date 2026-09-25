package storage

import (
	"bufio"
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
	"sync"

	"github.com/asserro/asserro/ledger"
	"github.com/asserro/asserro/registry"
)

type record struct {
	Transaction *ledger.Transaction `json:"transaction"`
	Vehicle     *registry.Vehicle   `json:"vehicle"`
}
type Database struct {
	mu           sync.Mutex
	file         *os.File
	Transactions map[[32]byte]bool
	Vehicles     map[string]registry.Vehicle
}

func Open(dir string) (*Database, error) {
	if err := os.MkdirAll(dir, 0700); err != nil {
		return nil, err
	}
	f, err := os.OpenFile(filepath.Join(dir, "ledger.log"), os.O_CREATE|os.O_RDWR|os.O_APPEND, 0600)
	if err != nil {
		return nil, err
	}
	db := &Database{file: f, Transactions: map[[32]byte]bool{}, Vehicles: map[string]registry.Vehicle{}}
	if err := db.replay(); err != nil {
		f.Close()
		return nil, err
	}
	return db, nil
}
func (db *Database) replay() error {
	if _, err := db.file.Seek(0, 0); err != nil {
		return err
	}
	s := bufio.NewScanner(db.file)
	for s.Scan() {
		var r record
		if err := json.Unmarshal(s.Bytes(), &r); err != nil {
			return fmt.Errorf("corrupt ledger: %w", err)
		}
		if r.Transaction == nil || r.Vehicle == nil {
			return fmt.Errorf("invalid ledger record")
		}
		if err := validateRecord(db, r.Transaction, r.Vehicle); err != nil {
			return fmt.Errorf("invalid ledger record: %w", err)
		}
		db.Transactions[r.Transaction.ID] = true
		db.Vehicles[r.Vehicle.VehicleID] = *r.Vehicle
	}
	return s.Err()
}
func (db *Database) Close() error { return db.file.Close() }
func (db *Database) Commit(tx *ledger.Transaction, v *registry.Vehicle) error {
	db.mu.Lock()
	defer db.mu.Unlock()
	if err := validateRecord(db, tx, v); err != nil {
		return err
	}
	r, err := json.Marshal(record{tx, v})
	if err != nil {
		return err
	}
	if _, err = db.file.Write(append(r, '\n')); err != nil {
		return err
	}
	if err = db.file.Sync(); err != nil {
		return err
	}
	db.Transactions[tx.ID] = true
	db.Vehicles[v.VehicleID] = *v
	return nil
}

func validateRecord(db *Database, tx *ledger.Transaction, v *registry.Vehicle) error {
	if tx == nil || v == nil {
		return fmt.Errorf("transaction and vehicle are required")
	}
	if db.Transactions[tx.ID] {
		return fmt.Errorf("duplicate transaction")
	}
	if tx.VehicleID == "" || tx.VehicleID != v.VehicleID {
		return fmt.Errorf("transaction and vehicle IDs do not match")
	}
	if tx.ID != v.TransactionHash {
		return fmt.Errorf("vehicle transaction hash does not match transaction")
	}
	current, exists := db.Vehicles[v.VehicleID]
	if tx.Type == ledger.Register {
		if exists {
			return fmt.Errorf("vehicle already exists")
		}
		if tx.PreviousStateHash != ([32]byte{}) || v.PreviousStateHash != ([32]byte{}) {
			return fmt.Errorf("registration must not reference previous state")
		}
		return nil
	}
	if !exists {
		return fmt.Errorf("vehicle does not exist")
	}
	if tx.PreviousStateHash != current.TransactionHash || v.PreviousStateHash != current.TransactionHash {
		return fmt.Errorf("stale previous state")
	}
	return nil
}
func (db *Database) Vehicle(id string) (registry.Vehicle, bool) {
	db.mu.Lock()
	defer db.mu.Unlock()
	v, ok := db.Vehicles[id]
	return v, ok
}
func (db *Database) VehicleCount() int {
	db.mu.Lock()
	defer db.mu.Unlock()
	return len(db.Vehicles)
}
func (db *Database) Count() int { db.mu.Lock(); defer db.mu.Unlock(); return len(db.Transactions) }
