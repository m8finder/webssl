const fs = require('fs')
const path = require('path')
const ora = require('ora')
const execa = require('execa')
const chalk = require('chalk')
const keychain = require('./keychain')
const cosmiconfig = require('cosmiconfig')
const explorer = cosmiconfig('openssl')

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
      addToKeychain: false,
    }
    this.cnf = { ...defaults, ...customCnf, ...config }

    this.args = []
    this.dest = path.resolve(process.cwd(), this.cnf.destination)
    this.cnfPath = path.resolve(this.dest, 'conf.ini')

    const filename = this.cnf.filename || this.cnf.commonName
    this.keyPath = path.resolve(this.dest, `${filename}.key`)
    this.certPath = path.resolve(this.dest, `${filename}.crt`)

    this.spinner = ora()

    // this.run()
    this.addToKeychain()
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
    this.spinner.start('Adding certificate to macOS Keychain...')
    // 1. ask for sudo
    // const sudo = await keychain.askForSudo()
    // if (!sudo) return

    // 2. get user keychain
    const key = await keychain.getKeychain('user')

    // 3. find cert with same name
    const alreadyInstalled = await keychain.find(this.cnf.commonName, key)
    if (alreadyInstalled) {
      console.log(
        chalk.red(
          'Certificate is already installed. Please remove it manually!'
        )
      )
      this.spinner.fail()
      return
      // TODO: remove current certificate with same name
    }

    // 4. add certificate to keychain
    const successful = await keychain.add(this.certPath, key)
    console.log(successful)

    this.spinner.succeed()
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
    await this.addArg('config', this.cnfPath)
    await this.addArg('days', 365)
    await this.addArg('keyout', this.keyPath)
    await this.addArg('out', this.certPath)
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
      Object.keys(this.cnf)
        .filter(k => subjNames.includes(k))
        .map(v => `${v}=${this.cnf[v]}`)
        .join('/') +
      '/"'
    )
  }

  async writeConfig() {
    this.spinner.start('Writing conf to file...')
    let i = 2
    const dns_names = this.cnf.dns.map(val => {
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
countryName           = ${this.cnf.countryName}
stateOrProvinceName   = ${this.cnf.stateOrProvinceName}
localityName          = ${this.cnf.localityName}
organizationName      = ${this.cnf.organizationName}
organizationalUnit    = ${this.cnf.organizationalUnit}
commonName            = ${this.cnf.commonName}

[req_ext]
subjectAltName = @alt_names

[alt_names]
IP.1    = 127.0.0.1
IP.2    = ::1
DNS.1   = localhost
${dns_names.join("\n")}
  `.trim()

    fs.writeFileSync(this.cnfPath, cnf)
    this.spinner.succeed()
    return true
  }
}

module.exports = OpenSSL
