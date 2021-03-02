VERSION=$$(deno run --allow-read cli.ts --version)

.PHONY: help

# Print help
help:
	@cat $(MAKEFILE_LIST) | docker run --pull --rm -i xanders/make-help

# Show version
version:
	@echo Version: $(VERSION)

##
## Program
##

# Run a test execution
run:
	deno run --allow-all cli.ts --debug --config fixtures/valid.toml

# Run tests
test:
	deno test --allow-all

# Lint files
# NOTE: unstable needed
lint:
	deno lint --unstable

# Format files
format:
	deno fmt

# Install on host
install:
	deno install --force --allow-all --name webssl cli.ts

##
## Tools
##

# Generate changelogs
changelog:
	npx conventional-changelog-cli -t v -i CHANGELOG.md -s -r 0 -u false

# Create setup
setup:
	@command -v lefthook >/dev/null 2>&1 || { echo >&2 "I require 'lefthook' but it's not installed. Aborting."; exit 1; }
	lefthook install

# Create release
release: lint test
	@echo "Release preparation started..."
	@echo "Make sure you have updated the version in the readme."
	@echo "Did you increased the version in pkg.ts and egg.json? [y/N] " && read ans && [ $${ans:-N} = y ]
	@echo "Creating latest changelogs"
	npx conventional-changelog-cli -t v -i CHANGELOG.md -s -r 0
	git add CHANGELOG.md && git commit -m "chore: updated changelog"
	@echo "Tagging release to v$(VERSION)"
	git tag -am "chore: new release v$(VERSION)" v$(VERSION)
	git push --follow-tags origin main
	eggs publish --version $(VERSION) --check-installation --dry-run --entry cli.ts

