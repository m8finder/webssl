import { dirname, fromFileUrl } from 'https://deno.land/std/path/mod.ts'
import { getLogger } from 'https://deno.land/std/log/mod.ts'

export const __dirname = dirname(fromFileUrl(import.meta.url))

export async function runCommand(command: string, flags: string[] = []) {
  const process = Deno.run({
    cmd: [command, ...flags]
  })

  const { code } = await process.status()

  if (code !== 0) {
    const logger = getLogger()
    logger.error('Process exited with status ' + code)
    Deno.exit(code)
  }
}
