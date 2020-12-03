import { getLogger } from 'https://deno.land/std/log/mod.ts'

import { getFileConfig, Config } from './config.ts'
import { OpenSSL, OpenSSLConfig } from './openssl.ts'

/**
 * Run the program.
 *
 * @param {Config} optionalConfig
 * @param {string} configFilePath
 */
export async function run(openSSLConfig: Partial<OpenSSLConfig>, runnerConfig: Config) {
  const logger = getLogger('mod')

  let fileConfig
  try {
    fileConfig = await getFileConfig(runnerConfig.config)
  } catch (error) {
    throw error
  }

  const defaultConfig: Partial<OpenSSLConfig> = {
    filename: 'dev',
    destination: 'certs'
  }
  const config = { ...defaultConfig, ...fileConfig, ...openSSLConfig } as OpenSSLConfig

  const openssl = new OpenSSL(config)
  await openssl.generate()

  logger.info('Done!')
}
