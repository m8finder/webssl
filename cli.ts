import { getLogger } from "https://deno.land/std@0.88.0/log/mod.ts";
import { parse } from "https://deno.land/std@0.88.0/flags/mod.ts";

import { setupLog } from "./log.ts";
import { OpenSSLConfig } from "./openssl.ts";
import { run } from "./mod.ts";
import { getPkg } from "./pkg.ts";

const LOGO = `
   _ _ _     _   _____ _____ __
  | | | |___| |_|   __|   __|  |
  | | | | -_| . |__   |__   |  |__
  |_____|___|___|_____|_____|_____|
`;

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
    --version         print the program version
`;

interface CliArgs {
  _: string[];
  help: boolean;
  debug: boolean;
  config: string;
  filename: string;
  version: boolean;
}

const args = parse(Deno.args) as CliArgs;
const pkg = getPkg();
const debug = typeof args.debug === "boolean" ? args.debug : false;

if (args.help) {
  console.log(__HELP);
  Deno.exit();
}

if (args.version) {
  console.log(pkg.version);
  Deno.exit();
}

console.log(LOGO);

await setupLog(debug ? "DEBUG" : "INFO", debug);

const logger = getLogger("cli");
logger.info("Starting...");

logger.debug("Args:\n", JSON.stringify(args, null, 2));

const openSSLConfig: Partial<OpenSSLConfig> = {};

if (args.filename) {
  openSSLConfig.filename = args.filename;
}

if (args._.length > 0) {
  openSSLConfig.destination = args._[0];
}

try {
  await run(openSSLConfig, {
    config: args.config,
    debug: debug,
  });
  logger.info("Done!");
} catch (error) {
  if (debug) {
    logger.error(error);
  } else {
    logger.error(error.message);
    console.log(__HELP);
  }
}
