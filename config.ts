import { join, isAbsolute, resolve } from 'https://deno.land/std/path/mod.ts'
import { getLogger } from 'https://deno.land/std/log/mod.ts'

import * as toml from 'https://cdn.pika.dev/toml@^3.0.0'

export interface Config {
  config?: string
  debug?: boolean
}

/**
 * Parse/decode a ini formatted string to JSON format.
 *
 * @param configContents a string to decode
 */
export function parseConfig(configContents: string): object | undefined {
  const logger = getLogger('config')

  try {
    return toml.parse(configContents)
  } catch (error) {
    const errorMesage =
      'Parsing error on line ' + error.line + ', column ' + error.column + ': ' + error.message
    logger.critical(errorMesage)
    throw new SyntaxError(errorMesage)
  }
}

/**
 * Get configuration file JSON config object.
 */
export async function getFileConfig(filePath?: string): Promise<object | undefined> {
  const logger = getLogger('config')

  let possiblePath = filePath || join(Deno.cwd(), 'webssl.toml')
  if (!isAbsolute(possiblePath)) {
    possiblePath = resolve(possiblePath)
  }

  logger.info('Using config path:', possiblePath)

  try {
    const decoder = new TextDecoder('utf-8')
    const configContents = await Deno.readFile(possiblePath)
    return parseConfig(decoder.decode(configContents))
  } catch (error) {
    if (error instanceof Deno.errors.NotFound) {
      logger.warning('Could not find any config file')
      return
    }
    throw error
  }
}
