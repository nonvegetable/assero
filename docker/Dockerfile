FROM golang:1.22-alpine AS build
WORKDIR /src
COPY . .
RUN CGO_ENABLED=0 go build -trimpath -ldflags='-s -w' -o /out/asserod ./cmd/asserod

FROM alpine:3.20
RUN adduser -D -H asserro
USER asserro
WORKDIR /var/lib/asserro
COPY --from=build /out/asserod /usr/local/bin/asserod
HEALTHCHECK --interval=10s --timeout=3s --retries=3 CMD wget -q -O - http://127.0.0.1:9090/health || exit 1
ENTRYPOINT ["/usr/local/bin/asserod"]
