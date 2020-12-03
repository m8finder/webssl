<h1 align="center">
  <img width="340" src="https://upload.wikimedia.org/wikipedia/commons/a/a1/OpenSSL_logo.png" />
  <br><br><p><b>WebSSL – OpenSSL for web and mobile development</b></p>
  <img src="https://github.com/m8finder/webssl/workflows/Test/badge.svg?branch=main" alt="CI Badge Test">
  <img src="https://github.com/m8finder/webssl/workflows/Lint/badge.svg?branch=main" alt="CI Badge Lint">
</h1>

Simply create [OpenSSL](https://de.wikipedia.org/wiki/OpenSSL) certificates for
your local web or mobile development that just work!

- [Installation](#installation)
  - [Extra security?](#extra-security)
- [Usage](#usage)
  - [Options](#options)
  - [Config](#config)
- [Tips](#tips)
- [Development](#development)
- [Ideas](#ideas)

## Installation

> Requires [Deno](https://deno.land/)

```shell
deno install --force --allow-read --allow-write --allow-run --name webssl https://raw.githubusercontent.com/m8finder/webssl/v3.4.0/mod.ts
```

| Flag            | Explanation                                       |
| --------------- | ------------------------------------------------- |
| `--allow-read`  | To read written certificate parts and your config |
| `--allow-write` | To write certificate parts                        |
| `--allow-run`   | To run the `openssl` command                      |

### Extra security?

Use [Nest](https://nest.land/) to securely install this package using
blockchain.

[![nest badge](https://nest.land/badge.svg)](https://nest.land/package/webssl)

```
deno install --force --allow-read --allow-write --allow-run --name webssl https://x.nest.land/webssl@3.4.0/cli.ts
```

## Usage

```shell
webssl [options] <destination>
webssl --filename dev_cert
```

> The default destination is `certs`. To override it just prepend a path
> (relative or absolute) to the command but make sure it is not following any
> option flag.

### Options

| Option       | Description                     | Default       |
| ------------ | ------------------------------- | ------------- |
| `--help`     | prints this help message        | /             |
| `--debug`    | print some debuggin information | /             |
| `--config`   | path to a custom config toml    | `webssl.toml` |
| `--filename` | the generated files filename    | dev           |

### Config

The configuration is written in toml.
[Read more about toml](https://github.com/toml-lang/toml)

Example `webssl.toml` file:

```toml
filename="dev"
destination="certs"

domains = [
  "example.dev",
  "api.example.dev"
]

ips = [
  "142.24.51.122"
]

commonName              = "com.github.webssl"
countryName             = "DE"
stateOrProvinceName     = "Germany"
localityName            = "Frankfurt am Main"
organizationName        = "WebSSL"
organizationalUnitName  = "Development"
emailAddress            = "mail@example.com"
```

## Tips

If you work on a Mac, I recommend you to create a new keychain called
`development` where you save all certificates that are unsafe or only for the
purpose of development.

## Development

Please run `make setup` before starting any development. Increase the version in
`pkg.ts` **and** `egg.json` if you are allowed to create a release.

Install globally with the following command:

```
make install
```

> For more commands read the [Makefile](./Makefile).

## Ideas

- [ ] write more tests
- [ ] add to deno `x` third-party modules list
- [ ] create single executable
  - [ ] curl shell script to add single executable to users bin
- [ ] make it available in:
  - [ ] npm
  - [ ] brew
- [ ] use json import when ready: https://github.com/denoland/deno/issues/7623

---

> This is not affiliated with OpenSSL. OpenSSL and the above logo is a
> registered trademark owned by OpenSSL Software Foundation.
