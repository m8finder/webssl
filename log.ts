import { handlers, setup } from "https://deno.land/std/log/mod.ts";
import { LevelName } from "https://deno.land/std/log/levels.ts";

export function setupLog(level: LevelName = "INFO") {
  return setup({
    handlers: {
      console: new handlers.ConsoleHandler("DEBUG", {
        formatter: "  [{levelName}] {msg} {args}",
      }),
      // file: new handlers.FileHandler('WARNING', {
      //   filename: './webssl.log',
      //   formatter: '{datetime} {levelName} {msg}',
      //   mode: 'w',
      // }),
    },
    loggers: {
      default: {
        level: "INFO",
        handlers: ["console"],
      },
      cli: {
        level: level,
        handlers: ["console"],
      },
      config: {
        level: level,
        handlers: ["console"],
      },
      mod: {
        level: level,
        handlers: ["console"],
      },
      openssl: {
        level: level,
        handlers: ["console"],
      },
    },
  });
}
