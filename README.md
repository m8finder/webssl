# OpenSSL Web Development

[![npm](https://img.shields.io/npm/v/openssl-web-development.svg?style=for-the-badge)](https://www.npmjs.com/package/openssl-web-development)

Simply create [OpenSSL][1] certificates for your local development that just
work!

- [Install](#install)
- [How to use](#how-to-use)
  - [Command Line](#command-line)
  - [Programmatically](#programmatically)
- [Options](#options)
  - [Example](#example)
- [Future](#future)

## Install

- Globally: `npm install -g openssl-web-development`
- Locally: `npm install --save-dev openssl-web-development`

## How to use

> We recommend to create a new keychain `development` where you save all
> certificates that has something todo with projects you are currently
> developing in.

### Command Line

```shell
Simply create OpenSSL certificates for development use locally on your computer

Usage
  $ webssl <destination> [flags]

Arguments
  <destination>  Absolute (starting with a slash) or relative path to a folder  (default: process.cwd())

Options
  --filename, -f        The name of the file which gets generated   (default: ssl)
  --addToKeychain, -k   Add your generated key file to Keychain     (default: false)
  --removeOld, -r       Remove your old key from Keychain           (default: false)
  --keychain, -k        Select a keychain                           (default: login)
  --config              Path to config file or false to disable     (default: .)
  --dns                 DNS entries split by a comma.               (default: null)

  --commonName, -CN             OpenSSL `commonName` subject entry*
  --countryName, -C             OpenSSL `countryName` subject entry*
  --stateOrProvinceName, -ST    OpenSSL `stateOrProvinceName` subject entry*
  --localityName, -L            OpenSSL `localityName` subject entry*
  --organizationName, -O        OpenSSL `organizationName` subject entry*
  --organizationalUnit, -OU     OpenSSL `organizationalUnit` subject entry
  --emailAddress                OpenSSL `emailAddress` subject entry

Examples
  $ webssl /Users/Hi/Downloads \
      --dns some.net,test.de \
      --commonName Test

* this is required unless you do not have it in a config file
```

> ⚠️ If you enable to add your certificate to macOS Keychain it will be
> automatically set to `allow all`.

> **Tip:** use a readable name for `commonName` (e.g. _my-project_), so it will
> be easier to find in you macOS Keychain. The URL to your website will be
> handled via the `cdn` option.

### Programmatically

See [cli.js](./cli.js)

```js
const WebSSL = require('openssl-web-development')
const options = {}

const webssl = new WebSSL(options)
webssl.create()
```

## Options

You can also save any parameters to an configuration file. We use cosmiconfig to
parse them but our search places differ a bit. Here is a list what we search
for:

- openssl.config.js
- openssl.ini
- .openssl
- .openssl.yaml
- webssl.config.js
- webssl.ini
- .webssl
- .webssl.yaml
- package.json

> If you going to use a configuration file, all CLI options will be ignored!

### Example

Here is an example `openssl.ini`:

```ini
filename=test
destination=./_out
keychain=development

# this section will be converted to an array
[dns]
test.lcl
test.com

[openssl]
commonName=test.web
countryName=DE
stateOrProvinceName=Hessen
localityName=Frankfurt am Main
organizationName=Test
organizationalUnit=Development
```

## Future

- Add to [GitHub Package Registry](https://github.com/features/package-registry)

[1]: https://de.wikipedia.org/wiki/OpenSSL
