# OpenSSL Web Development

Simply create OpenSSL certificates on your Mac for development use locally on
your computer.

## How to use

Options can be stored in all available
[cosmiconfig](https://www.npmjs.com/package/cosmiconfig) formats. An example
config can you find in the [test directory](./test/.opensslrc.yaml).

### Command Line

```shell
  Usage
    $ owd <destination> <...dns> [flags]

  Arguments
    <destination>  Where to save everything  (default: ./)

  Options
    --filename, -f        The name of the file which gets generated   (default: ssl)
    --addToKeychain, -k   Add your generated key file to Keychain     (default: false)
    --config              Path to config file or false to disable     (default: .)
    --dns                 DNS entries split by comma(!).              (default: null)

    --commonName, -CN             OpenSSL `commonName` subject entry*
    --countryName, -C             OpenSSL `countryName` subject entry*
    --stateOrProvinceName, -ST    OpenSSL `stateOrProvinceName` subject entry*
    --localityName, -L            OpenSSL `localityName` subject entry*
    --organizationName, -O        OpenSSL `localityName` subject entry*
    --organizationalUnit, -OU     OpenSSL `localityName` subject entry
    --emailAddress                OpenSSL `emailAddress` subject entry

  Examples
    $ owd /Users/Hi/Downloads \
        --dns some.net,test.de \
        --commonName Test

  * this is required
```

> ⚠️ If you enable to add your certificate to macOS Keychain it will be
> automatically set to `allow all`.

> **Tip:** use a readable name for `commonName`, so it will be easier to find in
> you macOS Keychain. The URL to your website will be handled via the `cdn`
> option, e.g. `mycompany.web` and `mycompany.api`.

### Programmatically

See [cli.js](./cli.js)
