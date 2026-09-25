package network

import (
	"encoding/binary"
	"fmt"
	"sync"
)

type Kind uint8

const (
	Proposal Kind = iota + 1
	Vote
	Certificate
	SyncRequest
	SyncBatch
)

type Message struct {
	Kind Kind
	From string
	Body []byte
}

func (m Message) Size() int { return 1 + 2 + len(m.From) + 4 + len(m.Body) }

func Encode(m Message) []byte {
	data := make([]byte, 1+2+len(m.From)+4+len(m.Body))
	data[0] = byte(m.Kind)
	binary.BigEndian.PutUint16(data[1:3], uint16(len(m.From)))
	copy(data[3:], m.From)
	offset := 3 + len(m.From)
	binary.BigEndian.PutUint32(data[offset:offset+4], uint32(len(m.Body)))
	copy(data[offset+4:], m.Body)
	return data
}

type Stats struct {
	SentMessages   int
	SentBytes      int64
	QueuedMessages int
}

type Transport struct {
	mu       sync.Mutex
	online   map[string]bool
	queues   map[string][]Message
	stats    Stats
	received map[string][]Message
}

func NewTransport(nodes []string) *Transport {
	online := make(map[string]bool, len(nodes))
	queues := make(map[string][]Message, len(nodes))
	received := make(map[string][]Message, len(nodes))
	for _, node := range nodes {
		online[node] = true
	}
	return &Transport{online: online, queues: queues, received: received}
}

func (t *Transport) SetOnline(node string, online bool) {
	t.mu.Lock()
	defer t.mu.Unlock()
	t.online[node] = online
	if online {
		t.received[node] = append(t.received[node], t.queues[node]...)
		t.queues[node] = nil
	}
}

func (t *Transport) Send(message Message, destination string) error {
	t.mu.Lock()
	defer t.mu.Unlock()
	if _, ok := t.online[destination]; !ok {
		return fmt.Errorf("unknown destination")
	}
	t.stats.SentMessages++
	t.stats.SentBytes += int64(message.Size())
	if !t.online[destination] {
		t.queues[destination] = append(t.queues[destination], message)
		t.stats.QueuedMessages++
		return nil
	}
	t.received[destination] = append(t.received[destination], message)
	return nil
}

func (t *Transport) Drain(node string) []Message {
	t.mu.Lock()
	defer t.mu.Unlock()
	messages := append([]Message(nil), t.received[node]...)
	t.received[node] = nil
	return messages
}

func (t *Transport) Stats() Stats { t.mu.Lock(); defer t.mu.Unlock(); return t.stats }
