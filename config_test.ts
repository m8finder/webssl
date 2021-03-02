import {
  assert,
  assertThrowsAsync,
} from "https://deno.land/std@0.88.0/testing/asserts.ts";
import { resolve } from "https://deno.land/std@0.88.0/path/mod.ts";

import { getFileConfig } from "./config.ts";

const { test } = Deno;

test("getFileConfig: successfully get config file", async () => {
  const fixtureConfigPath = resolve("fixtures/valid.toml");

  const config = await getFileConfig(fixtureConfigPath);

  assert(typeof config === "object");
});

test("getFileConfig: no config file found", async () => {
  await assertThrowsAsync(
    () => {
      return getFileConfig("fail");
    },
    Error,
    "Could not find any config file",
  );
});
