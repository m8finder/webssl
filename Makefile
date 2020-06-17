.PHONY: run test bundle

run:
	deno run --allow-read --allow-write --allow-run cli.ts --debug --config fixtures/valid.toml

test:
	deno test --allow-read --allow-write --allow-run \
		config_test.ts
