import { getLogger } from 'https://deno.land/std/log/mod.ts'
import { Logger } from 'https://deno.land/std/log/logger.ts'
import { join } from 'https://deno.land/std/path/mod.ts'

import {
  validate,
  firstMessages,
  Rule,
  validateArray
} from 'https://deno.land/x/validasaur@v0.7.2/src/mod.ts'
import * as Valid from 'https://deno.land/x/validasaur@v0.7.2/src/rules.ts'

import { runCommand } from './utils.ts'

type Filenames = 'ini' | 'crt' | 'csr' | 'key' | 'p12'

export interface OpenSSLConfig {
  filename: string
  destination: string
  domains?: string[]
  ips?: string[]

  // OpenSSL
  commonName: string
  countryName: string
  stateOrProvinceName: string
  localityName: string
  organizationName: string
  organizationalUnitName: string
  emailAddress: string

  // macOS Keychain
  // addToKeychain?: boolean
  // removeFromKeychain?: boolean
  // keychainName?: string
}

export class OpenSSL {
  private logger: Logger

  config: OpenSSLConfig

  /**
   * Generates a valid set of certificates to use in
   * web and mobile development.
   *
   * @param {Config} config the config
   */
  constructor(config: OpenSSLConfig) {
    this.logger = getLogger('openssl')
    this.config = config
  }

  async generate() {
    this.logger.info('Starting OpenSSL generator')

    try {
      await this.validateConfig()
    } catch (error) {
      Deno.exit()
    }

    const destinationNotEmpty = await this.checkDestination()
    if (destinationNotEmpty) {
      await this.clearDestination()
    }

    // Those must be run in this order!
    await this.createExtensionConf()
    await this.createPrivateKey()
    await this.createCertificateSigningRequest()
    await this.checkingCertificateSigningRequest()
    await this.generateCertificate()
    await this.generatePKCS12()
  }

  getFiles<T extends Filenames>(keyArray: T[]): Record<T, string> {
    const pathArray: Record<string, string> = {}

    for (const key of keyArray) {
      pathArray[key] = join(this.config.destination, this.config.filename + '.' + key)
    }

    return pathArray
  }

  async validateConfig() {
    this.logger.debug('Validating:', JSON.stringify(this.config, null, 2))

    const scheme: Record<keyof OpenSSLConfig, Rule | Rule[]> = {
      filename: [Valid.required, Valid.isString],
      destination: [Valid.required, Valid.isString],
      domains: validateArray(false, [Valid.isString], { minLength: 1 }),
      ips: validateArray(false, [Valid.isString], { minLength: 1 }),
      commonName: [Valid.required, Valid.isString],
      countryName: [Valid.required, Valid.isString],
      stateOrProvinceName: [Valid.required, Valid.isString],
      localityName: [Valid.required, Valid.isString],
      organizationName: [Valid.required, Valid.isString],
      organizationalUnitName: [Valid.required, Valid.isString],
      emailAddress: [Valid.required, Valid.isString]
    }

    const [passes, errors] = await validate(this.config, scheme)

    if (!passes) {
      for (const error of Object.values(firstMessages(errors))) {
        this.logger.error(error)
      }
      throw new SyntaxError('Config validation failed')
    }

    this.logger.info('Config validation passed')
  }

  async checkDestination() {
    this.logger.info('Checking destination path')

    try {
      for await (const iter of Deno.readDir(this.config.destination)) {
        return iter // at least one item means folder is not empty
      }
    } catch (error) {
      this.logger.warning('Destination path does not exist, creating...')

      if (error instanceof Deno.errors.NotFound) {
        await Deno.mkdir(this.config.destination, { recursive: true })
        this.logger.info('Created destination:', this.config.destination)
        return
      }

      throw error
    }
  }

  async clearDestination() {
    this.logger.warning('Clearing destination')

    for (const file of Object.values(this.getFiles(['crt', 'csr', 'ini', 'key', 'p12']))) {
      try {
        await Deno.lstat(file)
        await Deno.remove(file)
        this.logger.warning('Removed:', file)
      } catch (error) {
        if (error instanceof Deno.errors.NotFound) {
          return
        }
        throw error
      }
    }
  }

  private async createExtensionConf() {
    this.logger.info('Creating extension conf')

    let conf = `
[ req ]

default_bits       = 4096
distinguished_name = req_distinguished_name
req_extensions     = req_extensions_section
x509_extensions    = req_extensions_section
prompt = no

[ req_distinguished_name ]

countryName                 = ${this.config.countryName}
stateOrProvinceName         = ${this.config.stateOrProvinceName}
localityName                = ${this.config.localityName}
organizationName            = ${this.config.organizationName}
organizationalUnitName      = ${this.config.organizationalUnitName}
commonName                  = ${this.config.commonName}
emailAddress                = ${this.config.emailAddress}

[ req_extensions_section ]

basicConstraints    = critical,CA:TRUE,pathlen:1
subjectAltName      = @subject_alternative_name_section

[ subject_alternative_name_section ]

IP.1    = 127.0.0.1
IP.2    = ::1
DNS.1   = localhost
      `.trim()

    // Add dns domains
    if (this.config.domains) {
      const dnsMap = this.config.domains.map((d, i) => `DNS.${i + 2}   = ${d}`)
      conf += '\n' + dnsMap.join('\n')
    }

    // Add ip addresses
    if (this.config.ips) {
      const ipMap = this.config.ips.map((d, i) => `IP.${i + 3}    = ${d}`)
      conf += '\n' + ipMap.join('\n')
    }

    this.logger.debug('Extension conf:\n' + conf)

    const { ini } = this.getFiles(['ini'])
    return Deno.writeTextFile(ini, conf)
  }

  private async createPrivateKey() {
    this.logger.info('Creating private key')

    const { key } = this.getFiles(['key'])

    // openssl genrsa -out "$DEST/dev.key" 4096
    await runCommand('openssl', ['genrsa', '-out', key, '4096'])
  }

  private async createCertificateSigningRequest() {
    this.logger.info('Creating certificate signing request')

    const { key, csr, ini } = this.getFiles(['key', 'csr', 'ini'])

    // openssl req -new -sha256 \
    //     -key "$SSL_DIR/dev.key" \
    //     -out "$SSL_DIR/dev.csr" \
    //     -config "$SSL_DIR/conf.ini"
    await runCommand('openssl', [
      'req',
      '-new',
      '-sha256',
      '-key',
      key,
      '-out',
      csr,
      '-config',
      ini
    ])
  }

  private async checkingCertificateSigningRequest() {
    this.logger.info('Checking certificate signing request')

    const { csr } = this.getFiles(['csr'])

    // openssl req -text -noout -in "$SSL_DIR/dev.csr"
    await runCommand('openssl', ['req', '-text', '-noout', '-in', csr])
  }

  private async generateCertificate() {
    this.logger.info('Generate the certificate')

    const { key, csr, ini, crt } = this.getFiles(['key', 'csr', 'ini', 'crt'])

    // openssl x509 -req \
    //     -sha256 \
    //     -days 365 \
    //     -in "$SSL_DIR/dev.csr" \
    //     -signkey "$SSL_DIR/dev.key" \
    //     -out "$SSL_DIR/dev.crt" \
    //     -extensions req_extensions_section \
    //     -extfile "$SSL_DIR/conf.ini"
    await runCommand('openssl', [
      'x509',
      '-req',
      '-sha256',
      '-days',
      '365',
      '-in',
      csr,
      '-signkey',
      key,
      '-out',
      crt,
      '-extensions',
      'req_extensions_section',
      '-extfile',
      ini
    ])
  }

  private async generatePKCS12() {
    this.logger.info('Generate PKCS12')

    const { key, crt, p12 } = this.getFiles(['key', 'crt', 'p12'])

    // openssl pkcs12 -export \
    //   -inkey "$SSL_DIR/dev.key" \
    //   -in "$SSL_DIR/dev.crt" \
    //   -out "$SSL_DIR/dev.p12" \
    //   -passout pass:1234
    await runCommand('openssl', [
      'pkcs12',
      '-export',
      '-inkey',
      key,
      '-in',
      crt,
      '-out',
      p12,
      '-passout',
      'pass:1234'
    ])
  }
}
