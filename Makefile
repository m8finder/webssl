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
	lefthook install

# Create release
release: lint test
	@echo "Release preparation started..."

	@echo "Did you increased the version in pkg.ts? [y/N] " && read ans && [ $${ans:-N} = y ]

	@echo "Tagging release to v$(VERSION)"
	git tag -am "chore: new release v$(VERSION)" v$(VERSION)

	@echo "Creating latest changelog"
	npx conventional-changelog-cli -t v -i CHANGELOG.md -s -r 0
	git add CHANGELOG.md && git commit -m "chore: updated changelog"

	@echo "Publishing to egg"
	eggs publish --version $(VERSION) --yes

	git push --follow-tags origin main

