VERSION=$$(deno run --allow-read cli.ts --version)

version:
	@echo Version: $(VERSION)

run:
	deno run --allow-all cli.ts --debug --config fixtures/valid.toml

test:
	deno test --allow-all --unstable

lint:
	deno lint --unstable

install:
	deno install --force --allow-all --name webssl cli.ts

changelog:
	@command -v npx >/dev/null 2>&1 || { echo >&2 "I require 'npx' but it's not installed. Aborting."; exit 1; }
	npx conventional-changelog-cli -t v -i CHANGELOG.md -s -r 0 -u false

setup:
	@command -v lefthook >/dev/null 2>&1 || { echo >&2 "I require 'lefthook' but it's not installed. Aborting."; exit 1; }
	lefthook install

release:
	@echo "Release preparation started..."
	@echo "Did you increased the version in pkg.ts and egg.json? [y/N] " && read ans && [ $${ans:-N} = y ]
	@echo "Tagging release to $(VERSION)"
	git tag -am "New release on $(VERSION)" $(VERSION)
	@echo "Creating latest changelogs"
	npx conventional-changelog-cli -t v -i CHANGELOG.md -s -r 1 -u false
	@echo "Now run 'git push --follow-tags origin <your_branch_name>'"
