PROJECT      = capture-caribbean-sweepstakes
DIST         = dist/capture-caribbean-sweepstakes-wb/browser
CF_ACCOUNT   = e6a409663bf73140c8bd4caaadd9ebc2

# ── Targets ───────────────────────────────────────────────────────────────────

.PHONY: build deploy-dev clean

# ── Build ─────────────────────────────────────────────────────────────────────

build:
	npx ng build
	@echo "Built: $(DIST)"

# ── Deploy ────────────────────────────────────────────────────────────────────

deploy-dev: build
	CLOUDFLARE_ACCOUNT_ID=$(CF_ACCOUNT) wrangler pages deploy $(DIST) \
		--project-name $(PROJECT)-dev \
		--branch=dev-sweepstakes \
		--commit-dirty=true
	@echo "Deployed to Cloudflare Pages: $(PROJECT)-dev"

# ── Helpers ───────────────────────────────────────────────────────────────────

clean:
	rm -rf dist
