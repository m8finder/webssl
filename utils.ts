import { getLogger } from "https://deno.land/std@0.88.0/log/mod.ts";

export async function runCommand(command: string, flags: string[] = []) {
  const process = Deno.run({
    cmd: [command, ...flags],
  });

  const { code } = await process.status();

  if (code !== 0) {
    const logger = getLogger();
    logger.error("Process exited with status " + code);
    Deno.exit(code);
  }
}
