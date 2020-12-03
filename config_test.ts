import {
  assert,
  assertThrowsAsync,
} from "https://deno.land/std/testing/asserts.ts";
import { resolve } from "https://deno.land/std/path/mod.ts";

import { getFileConfig } from "./config.ts";
import { __dirname } from "./utils.ts";

const { test } = Deno;

test("getFileConfig: successfully get config file", async () => {
  const fixtureConfigPath = resolve(__dirname, "fixtures/valid.toml");

  const config = await getFileConfig(fixtureConfigPath);

  assert(typeof config === "object");
});

test("getFileConfig: no config file found", async () => {
  await assertThrowsAsync(
    () => {
      return getFileConfig("fail");
    },
    ReferenceError,
    "Could not find any config file",
  );
});
