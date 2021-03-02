import { Config, getFileConfig } from "./config.ts";
import { OpenSSL, OpenSSLConfig } from "./openssl.ts";

const defaultConfig: Partial<OpenSSLConfig> = {
  filename: "dev",
  destination: "certs",
};

/**
 * Run the program.
 *
 * @param {Config} optionalConfig
 * @param {string} configFilePath
 */
export async function run(
  openSSLConfig: Partial<OpenSSLConfig>,
  runnerConfig: Config,
) {
  const fileConfig = await getFileConfig(runnerConfig.config);

  const config = {
    ...defaultConfig,
    ...fileConfig,
    ...openSSLConfig,
  };

  const openssl = new OpenSSL(config);

  return openssl.generate();
}
