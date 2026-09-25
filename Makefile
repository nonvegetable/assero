GOCACHE ?= /tmp/asserro-go-cache

test:
	GOCACHE=$(GOCACHE) go test ./...

build:
	GOCACHE=$(GOCACHE) go build ./cmd/...

fmt:
	gofmt -w $$(find . -name '*.go' -not -path './.git/*')
