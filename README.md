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

## Install

- Globally: `npm install -g openssl-web-development`
- Locally: `npm install --save-dev openssl-web-development`

## How to use

> We recommend to create a new keychain `development` where you save all
> certificates that has something todo with projects you are currently
> developing.

### Command Line

```shell
  Simply create OpenSSL certificates for your local development

  Usage
    $ webssl [flags] <out_dir>

  Arguments
    <out_dir>   Where to save all files          (default: /Current/Folder)*

    Path can be absolute (starting with a slash) or relative. Relative path
    will be resolved with the folder you are executing this script from.

  Options
    --filename, -f        The name of the file which gets generated   (default: ssl)
    --addToKeychain, -a   Add your generated key file to Keychain     (default: false)
    --removeOld, -r       Remove your old key from Keychain           (default: false)
    --keychain, -k        Select a keychain                           (default: login)
    --config, -c          Path to config file or false to disable     (default: ./)
    --dns                 DNS entries split by a comma.               (default: null)

    --commonName, -CN            OpenSSL `commonName` subject entry*
    --countryName, -C            OpenSSL `countryName` subject entry*
    --stateOrProvinceName, -ST   OpenSSL `stateOrProvinceName` subject entry*
    --localityName, -L           OpenSSL `localityName` subject entry*
    --organizationName, -O       OpenSSL `organizationName` subject entry*
    --organizationalUnit, -OU    OpenSSL `organizationalUnit` subject entry
    --emailAddress               OpenSSL `emailAddress` subject entry

  Examples
    $ webssl \
        --addToKeychain \
        --keychain development \
        --dns some.net,test.de \
        --commonName Test \
        /Users/Hi/Downloads

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
webssl.generate()
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
filename=openssl
keychain=development
outDir=certs
sslDir=/etc/apache2/ssl

[dns]
openssl.lcl
open-ssl.lcl
openssl.net

[openssl]
commonName=openssl-website
countryName=DE
stateOrProvinceName=Hessen
localityName=Frankfurt am Main
organizationName=WebSSL
organizationalUnit=Development
```

[1]: https://de.wikipedia.org/wiki/OpenSSL
