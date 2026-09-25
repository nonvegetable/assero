FROM golang:1.22-alpine AS build
WORKDIR /src
COPY . .
RUN go build -o /out/asserod ./cmd/asserod

FROM alpine:3.20
RUN adduser -D -H asserro
USER asserro
WORKDIR /var/lib/asserro
COPY --from=build /out/asserod /usr/local/bin/asserod
ENTRYPOINT ["/usr/local/bin/asserod"]
