package ledger

import (
	"bytes"
	"crypto/ed25519"
	"encoding/binary"
	"fmt"
	"time"

	asserrocrypto "github.com/asserro/asserro/crypto"
)

type TransactionType uint8

const (
	Register TransactionType = iota + 1
	TransferOwnership
	UpdateAddress
	Suspend
	Restore
	Scrap
)

func (t TransactionType) String() string {
	names := []string{"INVALID", "REGISTER", "TRANSFER_OWNERSHIP", "UPDATE_ADDRESS", "SUSPEND", "RESTORE", "SCRAP"}
	if int(t) >= len(names) {
		return "UNKNOWN"
	}
	return names[int(t)]
}

type Transaction struct {
	ID                   [32]byte        `json:"id"`
	Type                 TransactionType `json:"type"`
	VehicleID            string          `json:"vehicle_id"`
	PreviousStateHash    [32]byte        `json:"previous_state_hash"`
	PayloadHash          [32]byte        `json:"payload_hash"`
	OriginatingValidator string          `json:"originating_validator"`
	Timestamp            int64           `json:"timestamp"`
	Nonce                uint64          `json:"nonce"`
	Signature            []byte          `json:"signature"`
}

func (t *Transaction) unsignedBytes() ([]byte, error) {
	if len(t.VehicleID) > 255 || len(t.OriginatingValidator) > 255 {
		return nil, fmt.Errorf("identifier too long")
	}
	var b bytes.Buffer
	b.WriteByte(byte(t.Type))
	b.WriteByte(byte(len(t.VehicleID)))
	b.WriteString(t.VehicleID)
	b.Write(t.PreviousStateHash[:])
	b.Write(t.PayloadHash[:])
	b.WriteByte(byte(len(t.OriginatingValidator)))
	b.WriteString(t.OriginatingValidator)
	if err := binary.Write(&b, binary.BigEndian, t.Timestamp); err != nil {
		return nil, err
	}
	if err := binary.Write(&b, binary.BigEndian, t.Nonce); err != nil {
		return nil, err
	}
	return b.Bytes(), nil
}

func (t *Transaction) Sign(priv ed25519.PrivateKey) error {
	b, err := t.unsignedBytes()
	if err != nil {
		return err
	}
	sig, err := asserrocrypto.Sign(priv, b)
	if err != nil {
		return err
	}
	t.Signature = sig
	t.ID = asserrocrypto.Hash(append(b, sig...))
	return nil
}

func (t *Transaction) Verify(pub ed25519.PublicKey) bool {
	b, err := t.unsignedBytes()
	if err != nil || !asserrocrypto.Verify(pub, b, t.Signature) {
		return false
	}
	id := asserrocrypto.Hash(append(b, t.Signature...))
	return id == t.ID
}

func NewTransaction(typ TransactionType, vehicleID, origin string, previous, payload [32]byte, nonce uint64) *Transaction {
	return &Transaction{Type: typ, VehicleID: vehicleID, OriginatingValidator: origin, PreviousStateHash: previous, PayloadHash: payload, Timestamp: time.Now().UnixNano(), Nonce: nonce}
}
