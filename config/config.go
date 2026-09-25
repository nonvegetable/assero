package config

import (
	"bufio"
	"fmt"
	"os"
	"path/filepath"
	"strconv"
	"strings"
	"time"
)

type Config struct {
	NodeID            string
	ListenAddr        string
	DataDir           string
	QueueDir          string
	MetricsAddr       string
	CommitteeSize     int
	RequiredVotes     int
	HeartbeatInterval time.Duration
	ReconnectInterval time.Duration
	Peers             map[string]string
}

func Default(dataDir, nodeID string) Config {
	return Config{NodeID: nodeID, ListenAddr: ":7000", DataDir: dataDir, QueueDir: filepath.Join(dataDir, "queue"), MetricsAddr: ":9090", CommitteeSize: 5, RequiredVotes: 4, HeartbeatInterval: 10 * time.Second, ReconnectInterval: 2 * time.Second, Peers: map[string]string{}}
}

func Load(path string) (Config, error) {
	file, err := os.Open(path)
	if err != nil {
		return Config{}, err
	}
	defer file.Close()
	c := Default("./data", "")
	section := ""
	scanner := bufio.NewScanner(file)
	for scanner.Scan() {
		line := strings.TrimSpace(strings.SplitN(scanner.Text(), "#", 2)[0])
		if line == "" {
			continue
		}
		if strings.HasPrefix(line, "[") && strings.HasSuffix(line, "]") {
			section = strings.Trim(line, "[]")
			continue
		}
		parts := strings.SplitN(line, "=", 2)
		if len(parts) != 2 {
			return Config{}, fmt.Errorf("invalid config line %q", line)
		}
		key, value := strings.TrimSpace(parts[0]), strings.Trim(strings.TrimSpace(parts[1]), "\"")
		if section == "peers" {
			c.Peers[key] = value
			continue
		}
		switch key {
		case "node_id":
			c.NodeID = value
		case "listen_addr":
			c.ListenAddr = value
		case "data_dir":
			c.DataDir = value
		case "queue_dir":
			c.QueueDir = value
		case "metrics_addr":
			c.MetricsAddr = value
		case "committee_size":
			c.CommitteeSize, err = strconv.Atoi(value)
		case "required_votes":
			c.RequiredVotes, err = strconv.Atoi(value)
		case "heartbeat_interval":
			c.HeartbeatInterval, err = time.ParseDuration(value)
		case "reconnect_interval":
			c.ReconnectInterval, err = time.ParseDuration(value)
		default:
			return Config{}, fmt.Errorf("unknown config key %q", key)
		}
		if err != nil {
			return Config{}, fmt.Errorf("invalid %s: %w", key, err)
		}
	}
	if err := scanner.Err(); err != nil {
		return Config{}, err
	}
	if c.NodeID == "" {
		return Config{}, fmt.Errorf("node_id is required")
	}
	return c, nil
}

func Save(path string, c Config) error {
	if err := os.MkdirAll(filepath.Dir(path), 0700); err != nil {
		return err
	}
	file, err := os.OpenFile(path, os.O_CREATE|os.O_TRUNC|os.O_WRONLY, 0600)
	if err != nil {
		return err
	}
	defer file.Close()
	_, err = fmt.Fprintf(file, "node_id = %q\nlisten_addr = %q\ndata_dir = %q\nqueue_dir = %q\nmetrics_addr = %q\ncommittee_size = %d\nrequired_votes = %d\nheartbeat_interval = %q\nreconnect_interval = %q\n\n[peers]\n", c.NodeID, c.ListenAddr, c.DataDir, c.QueueDir, c.MetricsAddr, c.CommitteeSize, c.RequiredVotes, c.HeartbeatInterval, c.ReconnectInterval)
	if err != nil {
		return err
	}
	for id, address := range c.Peers {
		if _, err := fmt.Fprintf(file, "%s = %q\n", id, address); err != nil {
			return err
		}
	}
	return file.Sync()
}
