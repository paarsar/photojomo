GOOS        = linux
GOARCH      = amd64
CGO_ENABLED = 0
LDFLAGS     = -ldflags="-s -w"
DIST        = dist

# ── Targets ───────────────────────────────────────────────────────────────────

.PHONY: all clean $(DIST) build-contact deploy-contact

all: build-contact build-submission

# ── Build ─────────────────────────────────────────────────────────────────────

build-contact: $(DIST)
	GOOS=$(GOOS) GOARCH=$(GOARCH) CGO_ENABLED=$(CGO_ENABLED) \
		go build $(LDFLAGS) -o bootstrap ./cmd/contact/
	zip -j $(DIST)/contact.zip bootstrap
	rm bootstrap
	@echo "Built: $(DIST)/contact.zip"

build-submission: $(DIST)
	GOOS=$(GOOS) GOARCH=$(GOARCH) CGO_ENABLED=$(CGO_ENABLED) \
		go build $(LDFLAGS) -o bootstrap ./cmd/submission/
	zip -j $(DIST)/submission.zip bootstrap
	rm bootstrap
	@echo "Built: $(DIST)/submission.zip"

deploy-submission: build-submission
	aws s3 cp $(DIST)/submission.zip \
		s3://$(PROJECT)-$(ENV)-lambda-artifacts/submission-service/submission.zip \
		--region $(REGION)
	aws lambda update-function-code \
		--function-name $(PROJECT)-$(ENV)-submission-service \
		--s3-bucket $(PROJECT)-$(ENV)-lambda-artifacts \
		--s3-key submission-service/submission.zip \
		--region $(REGION)
	@echo "Deployed submission lambda to $(ENV)"

# Add future lambdas here following the same pattern:
# build-<name>: $(DIST)
#   GOOS=$(GOOS) GOARCH=$(GOARCH) CGO_ENABLED=$(CGO_ENABLED) \
#     go build $(LDFLAGS) -o bootstrap ./cmd/<name>/
#   zip -j $(DIST)/<name>.zip bootstrap
#   rm bootstrap

# ── Deploy ────────────────────────────────────────────────────────────────────

ENV     ?= dev
PROJECT ?= photojomo
REGION  ?= us-east-1

deploy-contact: build-contact
	aws s3 cp $(DIST)/contact.zip \
		s3://$(PROJECT)-$(ENV)-lambda-artifacts/contact-service/contact.zip \
		--region $(REGION)
	aws lambda update-function-code \
		--function-name $(PROJECT)-$(ENV)-contact-service \
		--s3-bucket $(PROJECT)-$(ENV)-lambda-artifacts \
		--s3-key contact-service/contact.zip \
		--region $(REGION)
	@echo "Deployed contact lambda to $(ENV)"

# ── Helpers ───────────────────────────────────────────────────────────────────

$(DIST):
	mkdir -p $(DIST)

clean:
	rm -rf $(DIST) bootstrap

tidy:
	go mod tidy
