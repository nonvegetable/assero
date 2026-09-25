package network

import (
	"encoding/binary"

	"github.com/asserro/asserro/ledger"
)

type Replica struct {
	Transactions map[[32]byte]ledger.Transaction
}

func NewReplica() *Replica { return &Replica{Transactions: make(map[[32]byte]ledger.Transaction)} }

func (r *Replica) Add(tx ledger.Transaction) { r.Transactions[tx.ID] = tx }

func Sync(source, destination *Replica, batchSize int) (int, int) {
	if batchSize < 1 {
		batchSize = 1
	}
	missing := make([]ledger.Transaction, 0)
	for id, tx := range source.Transactions {
		if _, ok := destination.Transactions[id]; !ok {
			missing = append(missing, tx)
		}
	}
	bytes := 0
	for start := 0; start < len(missing); start += batchSize {
		end := start + batchSize
		if end > len(missing) {
			end = len(missing)
		}
		bytes += 4
		for _, tx := range missing[start:end] {
			encoded := tx.Signature
			bytes += 32 + 1 + 2 + len(tx.VehicleID) + len(encoded)
		}
		for _, tx := range missing[start:end] {
			destination.Add(tx)
		}
	}
	return len(missing), bytes
}

func EncodeCount(count int) []byte {
	result := make([]byte, 4)
	binary.BigEndian.PutUint32(result, uint32(count))
	return result
}
