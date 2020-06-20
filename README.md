<h1 align="center">
  <img width="340" src="https://upload.wikimedia.org/wikipedia/commons/a/a1/OpenSSL_logo.png" />
  <br><br><p><b>WebSSL – OpenSSL for web and mobile development</b></p>
</h1>

Simply create [OpenSSL](https://de.wikipedia.org/wiki/OpenSSL) certificates for your local
web or mobile development that just work!

## Installation

> Requires [Deno](https://deno.land/)

```shell
deno install --allow-read --allow-write --allow-run --name webssl https://raw.githubusercontent.com/m8finder/webssl/master/cli.ts
```

| Flag            | Explanation                       |
| --------------- | --------------------------------- |
| `--allow-read`  | To read written certificate parts |
| `--allow-write` | To write certificate parts        |
| `--allow-run`   | To run the `openssl` command      |

### Extra security?

Use [Nest](https://nest.land/) to securely install this package using blockchain.

[![nest badge](https://nest.land/badge.svg)](https://nest.land/package/webssl)

```
deno install --allow-read --allow-write --allow-run --name webssl https://x.nest.land/webssl@3.0.1/cli.ts
```

## Usage

```shell
webssl [options] <destination>
webssl --filename dev_cert
```

> The default destination is `certs`. To override it just prepend a
> path (relative or absolute) to the command but make sure it is not following any option flag.

### Options

| Option       | Description                     | Default       |
| ------------ | ------------------------------- | ------------- |
| `--help`     | prints this help message        | /             |
| `--debug`    | print some debuggin information | /             |
| `--config`   | path to a custom config toml    | `webssl.toml` |
| `--filename` | the generated files filename    | dev           |

### Config

The configuration is written in toml. [Read more about toml](https://github.com/toml-lang/toml)

Example `webssl.toml` file:

```toml
filename="dev"
destination="certs"

domains = [
  "example.dev",
  "api.example.dev"
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

If you work on a Mac, I recommend you to create a new keychain called `development` where you save all certificates that are unsafe.

## Todo

- [ ] write more tests
- [ ] add to deno `x` third-party modules list
- [ ] create single executable
  - [ ] curl shell script to add single executable to users bin
- [ ] make it available in:
  - [ ] npm
  - [ ] brew

---

#### This is not affiliated with OpenSSL. OpenSSL and the above logo is a registered trademark owned by OpenSSL Software Foundation.
