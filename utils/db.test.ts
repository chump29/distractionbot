import { glob, unlink } from "node:fs/promises"

import { type Database } from "bun:sqlite"
import { afterAll, beforeAll, describe, expect, mock, test } from "bun:test"
import { type BunFile } from "bun"

import { info } from "@postfmly/logger"

import { drizzle } from "drizzle-orm/bun-sqlite"
import { EnhancedQueryLogger } from "drizzle-query-logger"

import { closeDatabase, getDistractions, openDatabase, TEST_SQLITE } from "./db.ts"

mock.module("./db.ts", (): unknown => {
  return {
    TEST_DB: drizzle({
      client: TEST_SQLITE as Database,
      jit: true,
      logger: Bun.env.DEBUG_SQL === "true" ? new EnhancedQueryLogger() : undefined
    })
  }
})

global.Bun.file = mock((): BunFile => {
  return {
    text: async (): Promise<string> => "TEST"
  } as unknown as BunFile
})

const deleteFiles = async (): Promise<void> => {
  for await (const file of glob(`${Bun.env.DB_PATH}/${Bun.env.DB_NAME}*`)) {
    info(`Deleting ${file}`)
    await unlink(file)
  }
}

beforeAll(async (): Promise<void> => {
  await deleteFiles().then(async (): Promise<void> => await openDatabase())
})

afterAll(async (): Promise<void> => {
  await deleteFiles().then(async (): Promise<void> => {
    await closeDatabase()
  })
})

describe("db", (): void => {
  test("getDistractions", async (): Promise<void> => {
    expect((await getDistractions())[0]!.distraction).toEqual("TEST")
  })
})
