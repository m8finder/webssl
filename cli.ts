import { getLogger } from 'https://deno.land/std/log/mod.ts'
import { parse } from 'https://deno.land/std/flags/mod.ts'

import { setupLog } from './log.ts'
import { OpenSSLConfig } from './openssl.ts'
import { run } from './mod.ts'

const LOGO = `
   _ _ _     _   _____ _____ __
  | | | |___| |_|   __|   __|  |
  | | | | -_| . |__   |__   |  |__
  |_____|___|___|_____|_____|_____|
`

const __HELP = `${LOGO}
  Create certificates for local web and mobile development with ease.

  USAGE:
    $ webssl [options] <destination>

  ARGUMENTS:
    <destination>     Destination folder for all files (required)

    Path can be absolute (starting with \`/\` or \`~/\`) or relative. Relative paths
    will be resolved with the folder you are executing this script from.

  OPTIONS:
    --help            prints this help message
    --debug           print some debuggin information
    --config          path to a custom config toml
    --filename        the generated files filename
`

interface CliArgs {
  _: string[]
  help: boolean
  debug: boolean
  config: string
  filename: string
}

const args = parse(Deno.args) as CliArgs

if (args.help) {
  console.log(__HELP)
  Deno.exit()
}
console.log(LOGO)

await setupLog(args.debug ? 'DEBUG' : 'INFO')

const logger = getLogger('cli')
logger.info('Starting...')

logger.debug('Args:', JSON.stringify(args, null, 2))

let config = undefined
if (args.config) {
  if (typeof args.config === 'string') {
    logger.info('Set config path to:', args.config)
    config = args.config
  } else {
    console.log('`--config` must be a file path')
    Deno.exit(1)
  }
}

const openSSLConfig: Partial<OpenSSLConfig> = {}

if (args.filename) {
  if (typeof args.filename === 'string') {
    openSSLConfig.filename = args.filename
  } else {
    console.log('`--filename` must be a string')
    Deno.exit(1)
  }
}

if (args._.length > 0) {
  openSSLConfig.destination = args._[0]
}

run(openSSLConfig, {
  config: config,
  debug: args.debug ? true : false
})
