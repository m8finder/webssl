import {
  isAbsolute,
  join,
  resolve,
} from "https://deno.land/std@0.88.0/path/mod.ts";
import { getLogger } from "https://deno.land/std@0.88.0/log/mod.ts";
import { parse } from "https://deno.land/std@0.88.0/encoding/toml.ts";

import { OpenSSLConfig } from "./openssl.ts";

export interface Config {
  config?: string;
  debug?: boolean;
}

/**
 * Get configuration file JSON config object.
 */
export async function getFileConfig(
  filePath?: string,
): Promise<OpenSSLConfig> {
  const logger = getLogger("config");

  let possiblePath = filePath || join(Deno.cwd(), "webssl.toml");
  if (!isAbsolute(possiblePath)) {
    possiblePath = resolve(possiblePath);
  }

  logger.info("Using config path:", possiblePath);

  try {
    const contents = await Deno.readTextFile(possiblePath);
    return parse(contents) as unknown as OpenSSLConfig;
  } catch (error) {
    if (error instanceof Deno.errors.NotFound) {
      throw new Error(
        "Could not find any config file for " + possiblePath,
      );
    }
    throw new Error(error);
  }
}
