const fs = require('fs')
const path = require('path')
const ora = require('ora')
const execa = require('execa')
const chalk = require('chalk')
const keychain = require('./keychain')
const cosmiconfig = require('cosmiconfig')
const { IniSyncLoader } = require('./ini-parser')

const explorer = cosmiconfig('openssl', {
  searchPlaces: [
    'openssl.config.js',
    'openssl.ini',
    '.openssl',
    '.openssl.yaml',
    'webssl.config.js',
    'webssl.ini',
    '.webssl',
    '.webssl.yaml',
    'package.json',
  ],
  loaders: {
    '.ini': {
      sync: IniSyncLoader,
    },
  },
})

class OpenSSL {
  constructor(customCnf) {
    let config = {}
    let pathToConfig = process.cwd()
    if (customCnf.config && fs.existsSync(customCnf.config)) {
      pathToConfig = customCnf.config
    }
    if (customCnf.config !== false) {
      const explored = explorer.searchSync(pathToConfig)
      config = explored ? explored.config : {}
    }
    const defaults = {
      bits: 2048,
      filename: 'openssl',
      addToKeychain: false,
      removeOld: false,
    }
    // TODO: allow better deep merge
    this.cnf = { ...defaults, ...customCnf, ...config }

    this.args = []
    this.dest = path.resolve(process.cwd(), this.cnf.destination)
    this.cnfPath = path.resolve(this.dest, 'conf.ini')

    const filename = this.cnf.filename || this.cnf.openssl.commonName
    this.keyPath = path.resolve(this.dest, `${filename}.key`)
    this.certPath = path.resolve(this.dest, `${filename}.crt`)

    console.log('Options')
    console.log(this.cnf)
    console.log() // line-break

    this.spinner = ora()

    this.run()
  }

  async run() {
    await this.setArgs()
    await this.writeConfig()

    this.spinner.start('Generating OpenSSL certificate...')

    try {
      this.instance = await execa.shell('openssl req ' + this.args.join(' '))
    } catch (error) {
      this.spinner.fail()
      console.log(this.instance)
      console.log(error)
    } finally {
      this.spinner.succeed()
      console.log() // empty
      console.log(chalk.dim(this.instance.cmd))
    }

    if (this.cnf.addToKeychain) {
      this.addToKeychain()
    }
  }

  async addToKeychain() {
    this.spinner.indent = 2
    console.log() // line-break
    console.log('Adding certificate to macOS Keychain...')

    // 1. ask for sudo
    // this.spinner.start('Ask for sudo...')
    // const sudo = await keychain.askForSudo()
    // if (!sudo) return

    // 2. get user keychain
    this.spinner.start('Get user keychain...')
    const key = await keychain.getKeychain('user')
    if (key) {
      this.spinner.succeed()
    } else {
      this.spinner.fail()
      console.log('No keychain found for your user!')
      process.exit(0)
    }

    // 3. find cert with same name
    this.spinner.start('Find existing cert...')
    const alreadyInstalled = await keychain.find(
      this.cnf.openssl.commonName,
      key
    )
    if (alreadyInstalled) {
      this.spinner.fail()
      if (this.cnf.removeOld) {
        this.spinner.start('Remove existing cert...')
        const successful = await keychain.remove(
          this.cnf.openssl.commonName,
          key
        )
        if (!successful) {
          this.spinner.fail()
          process.exit(0)
        }
        this.spinner.succeed()
      } else {
        console.log(
          chalk.red(
            'Certificate is already installed. Please remove it manually!'
          )
        )
        process.exit(0)
      }
    } else {
      this.spinner.succeed()
    }

    // 4. add certificate to keychain
    this.spinner.start('Add cert to keychain...')
    const successful = await keychain.add(this.certPath, key)
    if (!successful) {
      this.spinner.fail()
      process.exit(0)
    } else {
      this.spinner.succeed()
    }

    console.log('Done!')
    this.spinner.indent = 0
  }

  addArg(arg, val = null) {
    this.spinner.start(`Creating arg: ${arg}`)
    if (val) this.args.push(`-${arg}`, val)
    else this.args.push(`-${arg}`)
    this.spinner.succeed()
    return true
  }

  async setArgs() {
    console.log('Setting arguments...')
    this.spinner.indent = 2
    await this.addArg('x509')
    await this.addArg('newkey', `rsa:${this.cnf.bits}`)
    await this.addArg('nodes')
    await this.addArg('subj', this.formatSubj())
    await this.addArg('config', `"${this.cnfPath}"`)
    await this.addArg('days', 365)
    await this.addArg('keyout', `"${this.keyPath}"`)
    await this.addArg('out', `"${this.certPath}"`)
    this.spinner.indent = 0
    console.log('Done!\n')
  }

  formatSubj() {
    const subjNames = [
      'countryName',
      'stateOrProvinceName',
      'localityName',
      'organizationName',
      'commonName',
    ]

    return (
      '"/' +
      Object.keys(this.cnf.openssl)
        .filter(k => subjNames.includes(k))
        .map(v => `${v}=${this.cnf.openssl[v]}`)
        .join('/') +
      '/"'
    )
  }

  async writeConfig() {
    this.spinner.start('Writing conf to file...')
    let i = 2
    const dnsNames = this.cnf.dns.map(val => {
      const tmpl = `
DNS.${i}   = ${val}
DNS.${i + 1}   = www.${val}
      `.trim()
      i = i + 2
      return tmpl
    })
    // prettier-ignore
    const cnf = `
# ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
#     This should only be used in development environments
#     due to security vulnerabilities!
# ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

[req]
default_bits          = ${this.cnf.bits}
distinguished_name    = req_distinguished_name
x509_extensions       = req_ext
req_extensions        = req_ext

[req_distinguished_name]
countryName           = ${this.cnf.openssl.countryName}
stateOrProvinceName   = ${this.cnf.openssl.stateOrProvinceName}
localityName          = ${this.cnf.openssl.localityName}
organizationName      = ${this.cnf.openssl.organizationName}
organizationalUnit    = ${this.cnf.openssl.organizationalUnit}
commonName            = ${this.cnf.openssl.commonName}

[req_ext]
subjectAltName = @alt_names

[alt_names]
IP.1    = 127.0.0.1
IP.2    = ::1
DNS.1   = localhost
${dnsNames.join("\n")}
  `.trim()

    try {
      fs.writeFileSync(this.cnfPath, cnf)
      this.spinner.succeed()
    } catch (error) {
      this.spinner.fail()
      throw new Error(error)
    }

    return true
  }
}

module.exports = OpenSSL
