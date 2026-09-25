package network

import (
	"bufio"
	"encoding/binary"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net"
	"os"
	"path/filepath"
	"strings"
	"sync"
	"time"
)

const (
	Hello Kind = iota + 6
	Heartbeat
	HeartbeatAck
	defaultMaxFrame = 4 << 20
)

type MessageHandler func(Message)

type TCPConfig struct {
	NodeID            string
	ListenAddr        string
	Peers             map[string]string
	QueueDir          string
	HeartbeatInterval time.Duration
	ReconnectInterval time.Duration
	MaxFrameBytes     uint32
	Handler           MessageHandler
}

type queuedMessage struct {
	Destination string  `json:"destination"`
	Message     Message `json:"message"`
}

type tcpPeer struct {
	mu   sync.Mutex
	conn net.Conn
}

type TCPTransport struct {
	config   TCPConfig
	listener net.Listener
	peers    map[string]*tcpPeer
	mu       sync.RWMutex
	queueMu  sync.Mutex
	stop     chan struct{}
	done     chan struct{}
	wg       sync.WaitGroup
	stats    Stats
}

func NewTCPTransport(config TCPConfig) (*TCPTransport, error) {
	if strings.TrimSpace(config.NodeID) == "" {
		return nil, errors.New("node ID is required")
	}
	if config.ListenAddr == "" {
		config.ListenAddr = ":7000"
	}
	if config.QueueDir == "" {
		config.QueueDir = "./queue"
	}
	if config.HeartbeatInterval <= 0 {
		config.HeartbeatInterval = 10 * time.Second
	}
	if config.ReconnectInterval <= 0 {
		config.ReconnectInterval = 2 * time.Second
	}
	if config.MaxFrameBytes == 0 {
		config.MaxFrameBytes = defaultMaxFrame
	}
	if err := os.MkdirAll(config.QueueDir, 0700); err != nil {
		return nil, err
	}
	peers := make(map[string]*tcpPeer, len(config.Peers))
	for id := range config.Peers {
		if id != config.NodeID {
			peers[id] = &tcpPeer{}
		}
	}
	return &TCPTransport{config: config, peers: peers, stop: make(chan struct{}), done: make(chan struct{})}, nil
}

func (t *TCPTransport) Start() error {
	listener, err := net.Listen("tcp", t.config.ListenAddr)
	if err != nil {
		return err
	}
	t.listener = listener
	t.wg.Add(1)
	go t.acceptLoop()
	for id := range t.config.Peers {
		if id == t.config.NodeID {
			continue
		}
		t.wg.Add(1)
		go t.dialLoop(id, t.config.Peers[id])
	}
	return nil
}

func (t *TCPTransport) Addr() net.Addr {
	if t.listener == nil {
		return nil
	}
	return t.listener.Addr()
}

func (t *TCPTransport) PeerIDs() []string {
	t.mu.RLock()
	defer t.mu.RUnlock()
	ids := make([]string, 0, len(t.peers))
	for id := range t.peers {
		ids = append(ids, id)
	}
	return ids
}

func (t *TCPTransport) Send(message Message, destination string) error {
	if message.From == "" {
		message.From = t.config.NodeID
	}
	if len(Encode(message)) > int(t.config.MaxFrameBytes) {
		return fmt.Errorf("message exceeds max frame size")
	}
	peer := t.getPeer(destination)
	if peer == nil {
		return fmt.Errorf("unknown destination %q", destination)
	}
	peer.mu.Lock()
	conn := peer.conn
	if conn != nil {
		err := writeFrame(conn, Encode(message), t.config.MaxFrameBytes)
		if err == nil {
			peer.mu.Unlock()
			t.recordSent(message)
			return nil
		}
		_ = conn.Close()
		peer.conn = nil
	}
	peer.mu.Unlock()
	if err := t.enqueue(destination, message); err != nil {
		return err
	}
	return nil
}

func (t *TCPTransport) Close() error {
	select {
	case <-t.stop:
		return nil
	default:
		close(t.stop)
	}
	if t.listener != nil {
		_ = t.listener.Close()
	}
	t.mu.RLock()
	peers := make([]*tcpPeer, 0, len(t.peers))
	for _, peer := range t.peers {
		peers = append(peers, peer)
	}
	t.mu.RUnlock()
	for _, peer := range peers {
		peer.mu.Lock()
		conn := peer.conn
		peer.conn = nil
		peer.mu.Unlock()
		if conn != nil {
			_ = conn.Close()
		}
	}
	finished := make(chan struct{})
	go func() { t.wg.Wait(); close(finished) }()
	select {
	case <-finished:
		close(t.done)
	case <-time.After(time.Second):
	}
	return nil
}

func (t *TCPTransport) Stats() Stats { t.mu.RLock(); defer t.mu.RUnlock(); return t.stats }

func (t *TCPTransport) acceptLoop() {
	defer t.wg.Done()
	for {
		conn, err := t.listener.Accept()
		if err != nil {
			select {
			case <-t.stop:
				return
			default:
				continue
			}
		}
		t.wg.Add(1)
		go t.handleConn(conn)
	}
}

func (t *TCPTransport) dialLoop(id, address string) {
	defer t.wg.Done()
	ticker := time.NewTicker(t.config.ReconnectInterval)
	defer ticker.Stop()
	for {
		if t.connected(id) == nil {
			if conn, err := net.DialTimeout("tcp", address, t.config.ReconnectInterval); err == nil {
				t.handleConnFor(id, conn)
			}
		}
		select {
		case <-t.stop:
			return
		case <-ticker.C:
		}
	}
}

func (t *TCPTransport) handleConn(conn net.Conn) {
	_ = t.handleConnFor("", conn)
}

func (t *TCPTransport) handleConnFor(expectedID string, conn net.Conn) error {
	hello := Message{Kind: Hello, From: t.config.NodeID}
	if err := writeFrame(conn, Encode(hello), t.config.MaxFrameBytes); err != nil {
		_ = conn.Close()
		return err
	}
	reader := bufio.NewReader(conn)
	frame, err := readFrame(reader, t.config.MaxFrameBytes)
	if err != nil {
		_ = conn.Close()
		return err
	}
	peerID, ok := decodeMessage(frame)
	if !ok || peerID.Kind != Hello || peerID.From == t.config.NodeID || (expectedID != "" && expectedID != peerID.From) {
		_ = conn.Close()
		return errors.New("invalid peer hello")
	}
	peer := t.getPeer(peerID.From)
	if peer == nil {
		_ = conn.Close()
		return errors.New("peer is not configured")
	}
	peer.mu.Lock()
	if peer.conn != nil {
		_ = peer.conn.Close()
	}
	peer.conn = conn
	peer.mu.Unlock()
	t.flush(peerID.From)
	ticker := time.NewTicker(t.config.HeartbeatInterval)
	defer ticker.Stop()
	readDone := make(chan error, 1)
	go func() { readDone <- t.readLoop(peerID.From, reader) }()
	for {
		select {
		case <-t.stop:
			_ = conn.Close()
			return nil
		case err := <-readDone:
			t.clearConnection(peerID.From, conn)
			return err
		case <-ticker.C:
			if err := writeFrame(conn, Encode(Message{Kind: Heartbeat, From: t.config.NodeID}), t.config.MaxFrameBytes); err != nil {
				t.clearConnection(peerID.From, conn)
				return err
			}
		}
	}
}

func (t *TCPTransport) readLoop(peerID string, reader *bufio.Reader) error {
	for {
		frame, err := readFrame(reader, t.config.MaxFrameBytes)
		if err != nil {
			return err
		}
		message, ok := decodeMessage(frame)
		if !ok {
			return errors.New("malformed message")
		}
		switch message.Kind {
		case Heartbeat:
			_ = t.Send(Message{Kind: HeartbeatAck, From: t.config.NodeID}, peerID)
		case HeartbeatAck:
		default:
			if t.config.Handler != nil {
				t.config.Handler(message)
			}
		}
	}
}

func (t *TCPTransport) flush(destination string) {
	messages := t.readQueue(destination)
	for _, message := range messages {
		if err := t.Send(message, destination); err != nil {
			return
		}
		t.removeQueued(destination, message)
	}
}

func (t *TCPTransport) enqueue(destination string, message Message) error {
	t.queueMu.Lock()
	defer t.queueMu.Unlock()
	f, err := os.OpenFile(filepath.Join(t.config.QueueDir, safeQueueName(destination)), os.O_CREATE|os.O_WRONLY|os.O_APPEND, 0600)
	if err != nil {
		return err
	}
	defer f.Close()
	if err := json.NewEncoder(f).Encode(queuedMessage{Destination: destination, Message: message}); err != nil {
		return err
	}
	_ = f.Sync()
	t.mu.Lock()
	t.stats.QueuedMessages++
	t.mu.Unlock()
	return nil
}

func (t *TCPTransport) readQueue(destination string) []Message {
	t.queueMu.Lock()
	defer t.queueMu.Unlock()
	f, err := os.Open(filepath.Join(t.config.QueueDir, safeQueueName(destination)))
	if err != nil {
		return nil
	}
	defer f.Close()
	var messages []Message
	decoder := json.NewDecoder(f)
	for {
		var item queuedMessage
		if err := decoder.Decode(&item); err != nil {
			break
		}
		messages = append(messages, item.Message)
	}
	return messages
}

func (t *TCPTransport) removeQueued(destination string, sent Message) {
	t.queueMu.Lock()
	defer t.queueMu.Unlock()
	path := filepath.Join(t.config.QueueDir, safeQueueName(destination))
	f, err := os.Open(path)
	if err != nil {
		return
	}
	var remaining []queuedMessage
	decoder := json.NewDecoder(f)
	for {
		var item queuedMessage
		if decoder.Decode(&item) != nil {
			break
		}
		if len(remaining) > 0 || item.Message.Kind != sent.Kind || item.Message.From != sent.From || string(item.Message.Body) != string(sent.Body) {
			remaining = append(remaining, item)
		}
	}
	_ = f.Close()
	tmp := path + ".tmp"
	out, err := os.Create(tmp)
	if err != nil {
		return
	}
	for _, item := range remaining {
		_ = json.NewEncoder(out).Encode(item)
	}
	_ = out.Close()
	_ = os.Rename(tmp, path)
}

func (t *TCPTransport) getPeer(id string) *tcpPeer {
	t.mu.RLock()
	defer t.mu.RUnlock()
	return t.peers[id]
}
func (t *TCPTransport) connected(id string) net.Conn {
	peer := t.getPeer(id)
	if peer == nil {
		return nil
	}
	peer.mu.Lock()
	defer peer.mu.Unlock()
	return peer.conn
}
func (t *TCPTransport) clearConnection(id string, conn net.Conn) {
	peer := t.getPeer(id)
	if peer == nil {
		return
	}
	peer.mu.Lock()
	if peer.conn == conn {
		peer.conn = nil
	}
	peer.mu.Unlock()
	_ = conn.Close()
}
func (t *TCPTransport) recordSent(message Message) {
	t.mu.Lock()
	t.stats.SentMessages++
	t.stats.SentBytes += int64(message.Size())
	t.mu.Unlock()
}
func safeQueueName(id string) string {
	return strings.NewReplacer("/", "_", "\\", "_", ":", "_").Replace(id) + ".jsonl"
}

func writeFrame(w io.Writer, payload []byte, max uint32) error {
	if uint32(len(payload)) > max {
		return errors.New("frame too large")
	}
	header := make([]byte, 4)
	binary.BigEndian.PutUint32(header, uint32(len(payload)))
	if _, err := w.Write(header); err != nil {
		return err
	}
	_, err := w.Write(payload)
	return err
}
func readFrame(r io.Reader, max uint32) ([]byte, error) {
	header := make([]byte, 4)
	if _, err := io.ReadFull(r, header); err != nil {
		return nil, err
	}
	size := binary.BigEndian.Uint32(header)
	if size == 0 || size > max {
		return nil, errors.New("invalid frame size")
	}
	payload := make([]byte, size)
	_, err := io.ReadFull(r, payload)
	return payload, err
}
func decodeMessage(payload []byte) (Message, bool) {
	if len(payload) < 7 {
		return Message{}, false
	}
	fromLen := int(binary.BigEndian.Uint16(payload[1:3]))
	if len(payload) < 3+fromLen+4 {
		return Message{}, false
	}
	offset := 3 + fromLen
	bodyLen := int(binary.BigEndian.Uint32(payload[offset : offset+4]))
	if len(payload) != offset+4+bodyLen {
		return Message{}, false
	}
	return Message{Kind: Kind(payload[0]), From: string(payload[3:offset]), Body: append([]byte(nil), payload[offset+4:]...)}, true
}
