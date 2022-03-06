.PHONY: build
build: build_server

.PHONY: build_server
build_server:
	npx tsc

.PHONY: dev
dev: build
	npm start -- -d -c above -u https://test.drednot.io/invite/IP9ejRouBRKmDrMXcjYiq9HO -p 1

.PHONY: run
run: build
	npm start
