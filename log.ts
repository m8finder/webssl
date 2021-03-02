import {
  handlers,
  LevelName,
  setup,
} from "https://deno.land/std@0.88.0/log/mod.ts";

export function setupLog(level: LevelName = "INFO", debug = false) {
  return setup({
    handlers: {
      console: new handlers.ConsoleHandler("DEBUG", {
        formatter: debug
          ? "  [{levelName}] ({loggerName}) {msg} {args}"
          : "  {msg} {args}",
      }),
    },
    loggers: {
      default: {
        level: "DEBUG",
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
      openssl: {
        level: level,
        handlers: ["console"],
      },
    },
  });
}
