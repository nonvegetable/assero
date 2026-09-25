package config

import "testing"

func TestSaveLoadTOMLConfig(t *testing.T) {
	path := t.TempDir() + "/asserod.toml"
	want := Default("./node-a", "RTO-A")
	want.Peers["RTO-B"] = "127.0.0.1:7001"
	if err := Save(path, want); err != nil {
		t.Fatal(err)
	}
	got, err := Load(path)
	if err != nil {
		t.Fatal(err)
	}
	if got.NodeID != want.NodeID || got.Peers["RTO-B"] != want.Peers["RTO-B"] || got.HeartbeatInterval != want.HeartbeatInterval {
		t.Fatalf("config mismatch: %#v", got)
	}
}
