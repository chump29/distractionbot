import { glob, unlink } from "node:fs/promises"
import { join } from "node:path"

import { beforeAll, describe, expect, type jest, spyOn, test } from "bun:test"

import { DB } from "../../utils/db.ts"
import { env } from "../../utils/env.ts"

const infoSpy: jest.Mock = spyOn(console, "info")

beforeAll(async (): Promise<void> => {
  infoSpy.mockReset()

  for await (const file of glob(join(env.DB_PATH, `${env.DB_NAME}*`))) {
    await unlink(file)
  }
})

describe("db", (): void => {
  test("load", (): void => {
    expect(DB.load()).resolves.toBe(undefined)

    const TIMES: number = 8
    expect(infoSpy).toHaveBeenCalledTimes(TIMES)
  })
})
