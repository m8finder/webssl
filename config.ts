import { isAbsolute, join, resolve } from "https://deno.land/std/path/mod.ts";
import { getLogger } from "https://deno.land/std/log/mod.ts";
import { parse } from "https://deno.land/std/encoding/toml.ts";

const logger = getLogger("config");

export interface Config {
  config?: string;
  debug?: boolean;
}

/**
 * Get configuration file JSON config object.
 */
export async function getFileConfig(
  filePath?: string,
): Promise<Record<string, unknown>> {
  let possiblePath = filePath || join(Deno.cwd(), "webssl.toml");
  if (!isAbsolute(possiblePath)) {
    possiblePath = resolve(possiblePath);
  }

  logger.info("Using config path:", possiblePath);

  try {
    const contents = await Deno.readTextFile(possiblePath);
    return parse(contents);
  } catch (error) {
    if (error instanceof Deno.errors.NotFound) {
      logger.warning("Could not find any config file for " + possiblePath);
      throw new ReferenceError(
        "Could not find any config file for " + possiblePath,
      );
    }
    throw new Error(error);
  }
}
