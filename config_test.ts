import {
  assertEquals,
  assert,
  assertThrows,
  assertThrowsAsync
} from 'https://deno.land/std/testing/asserts.ts'
import { resolve } from 'https://deno.land/std/path/mod.ts'

import { parseConfig, getFileConfig, Config } from './config.ts'
import { __dirname } from './utils.ts'

const { test } = Deno

test('parseConfig: successfully parse config string', () => {
  const expected = {
    filename: 'test',
    domains: ['test']
  }

  const testConfigString = `
filename="test"
domains = ["test"]
`

  const actual = parseConfig(testConfigString)

  assertEquals(actual, expected)
})

test('parseConfig: fail parse config string', () => {
  assertThrows(
    () => {
      parseConfig('f=f')
    },
    SyntaxError,
    'Parsing error on line'
  )
})

test('getFileConfig: successfully get config file', async () => {
  const fixtureConfigPath = resolve(__dirname, 'fixtures/valid.toml')

  const config = await getFileConfig(fixtureConfigPath)

  assert(typeof config === 'object')
})

test('getFileConfig: no config file found', async () => {
  const config = await getFileConfig('fail')

  assert(!config)
})

test('getFileConfig: broken config file found', () => {
  const fixtureConfigPath = resolve(__dirname, 'fixtures/broken.toml')

  assertThrowsAsync(
    async () => {
      await getFileConfig(fixtureConfigPath)
    },
    SyntaxError,
    'Parsing error on line'
  )
})
