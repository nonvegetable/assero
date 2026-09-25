package network

import (
	"net"
	"path/filepath"
	"testing"
	"time"
)

func TestTCPTransportDeliversFramedMessages(t *testing.T) {
	port := reservePort(t)
	received := make(chan Message, 1)
	server, err := NewTCPTransport(TCPConfig{NodeID: "server", ListenAddr: port, Peers: map[string]string{"client": ""}, QueueDir: filepath.Join(t.TempDir(), "server"), Handler: func(message Message) { received <- message }})
	if err != nil {
		t.Fatal(err)
	}
	client, err := NewTCPTransport(TCPConfig{NodeID: "client", ListenAddr: reservePort(t), Peers: map[string]string{"server": port}, QueueDir: filepath.Join(t.TempDir(), "client"), ReconnectInterval: 10 * time.Millisecond})
	if err != nil {
		t.Fatal(err)
	}
	if err := server.Start(); err != nil {
		t.Fatal(err)
	}
	defer server.Close()
	if err := client.Start(); err != nil {
		t.Fatal(err)
	}
	defer client.Close()
	deadline := time.After(2 * time.Second)
	for {
		if err := client.Send(Message{Kind: Proposal, Body: []byte("hello")}, "server"); err == nil {
			break
		}
		select {
		case <-deadline:
			t.Fatal("client did not connect")
		default:
			time.Sleep(10 * time.Millisecond)
		}
	}
	select {
	case message := <-received:
		if message.From != "client" || string(message.Body) != "hello" {
			t.Fatalf("unexpected message: %+v", message)
		}
	case <-deadline:
		t.Fatal("message not delivered")
	}
}

func reservePort(t *testing.T) string {
	t.Helper()
	listener, err := net.Listen("tcp", "127.0.0.1:0")
	if err != nil {
		t.Fatal(err)
	}
	address := listener.Addr().String()
	_ = listener.Close()
	return address
}
