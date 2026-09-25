package registry

import (
	"fmt"
	"time"

	"github.com/asserro/asserro/ledger"
)

type Status string

const (
	Active    Status = "ACTIVE"
	Suspended Status = "SUSPENDED"
	Scrapped  Status = "SCRAPPED"
)

type Vehicle struct {
	VehicleID             string   `json:"vehicle_id"`
	VIN                   string   `json:"vin"`
	RegistrationNumber    string   `json:"registration_number"`
	OwnerIdentifierHash   string   `json:"owner_identifier_hash"`
	RTOIdentifier         string   `json:"rto_identifier"`
	VehicleType           string   `json:"vehicle_type"`
	RegistrationTimestamp int64    `json:"registration_timestamp"`
	Status                Status   `json:"status"`
	PreviousStateHash     [32]byte `json:"previous_state_hash"`
	TransactionHash       [32]byte `json:"transaction_hash"`
}

func ValidateNew(v Vehicle) error {
	if v.VehicleID == "" || v.VIN == "" || v.RegistrationNumber == "" || v.OwnerIdentifierHash == "" || v.RTOIdentifier == "" {
		return fmt.Errorf("vehicle fields are required")
	}
	return nil
}

func Apply(old *Vehicle, tx *ledger.Transaction) (Vehicle, error) {
	if tx.Type == ledger.Register {
		if old != nil {
			return Vehicle{}, fmt.Errorf("vehicle already exists")
		}
		v := Vehicle{VehicleID: tx.VehicleID, VIN: tx.VehicleID, RTOIdentifier: tx.OriginatingValidator, Status: Active, RegistrationTimestamp: time.Unix(0, tx.Timestamp).UnixNano(), TransactionHash: tx.ID}
		return v, nil
	}
	if old == nil {
		return Vehicle{}, fmt.Errorf("vehicle does not exist")
	}
	if old.TransactionHash != tx.PreviousStateHash {
		return Vehicle{}, fmt.Errorf("stale previous state")
	}
	v := *old
	v.PreviousStateHash = old.TransactionHash
	v.TransactionHash = tx.ID
	switch tx.Type {
	case ledger.TransferOwnership, ledger.UpdateAddress:
	case ledger.Suspend:
		if old.Status != Active {
			return Vehicle{}, fmt.Errorf("only active vehicle can be suspended")
		}
		v.Status = Suspended
	case ledger.Restore:
		if old.Status != Suspended {
			return Vehicle{}, fmt.Errorf("only suspended vehicle can be restored")
		}
		v.Status = Active
	case ledger.Scrap:
		if old.Status == Scrapped {
			return Vehicle{}, fmt.Errorf("vehicle already scrapped")
		}
		v.Status = Scrapped
	default:
		return Vehicle{}, fmt.Errorf("unsupported transaction type")
	}
	return v, nil
}
