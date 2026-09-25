package network

import (
	"testing"

	"github.com/asserro/asserro/ledger"
)

func TestOfflineMessagesDeliverAfterReconnect(t *testing.T) {
	transport := NewTransport([]string{"a", "b"})
	transport.SetOnline("b", false)
	if err := transport.Send(Message{Kind: Proposal, From: "a", Body: []byte("transaction")}, "b"); err != nil {
		t.Fatal(err)
	}
	if got := len(transport.Drain("b")); got != 0 {
		t.Fatalf("offline node received %d messages", got)
	}
	transport.SetOnline("b", true)
	if got := len(transport.Drain("b")); got != 1 {
		t.Fatalf("reconnect delivered %d messages", got)
	}
	if transport.Stats().QueuedMessages != 1 {
		t.Fatal("queue metric not recorded")
	}
}

func TestSyncOnlySendsMissingTransactions(t *testing.T) {
	source, destination := NewReplica(), NewReplica()
	for index := byte(0); index < 3; index++ {
		txID := [32]byte{index + 1}
		tx := ledger.Transaction{ID: txID, VehicleID: "VH"}
		source.Add(tx)
		if index == 0 {
			destination.Add(tx)
		}
	}
	count, _ := Sync(source, destination, 2)
	if count != 2 || len(destination.Transactions) != 3 {
		t.Fatalf("synced count=%d destination=%d", count, len(destination.Transactions))
	}
}
