import { glob, unlink } from "node:fs/promises"
import { join } from "node:path"

import { beforeAll, describe, expect, type jest, spyOn, test } from "bun:test"

import { DB } from "../../utils/db.ts"
import { env } from "../../utils/env.ts"

const infoSpy: jest.Mock = spyOn(console, "info")

const path: string = join(env.DB_PATH, env.DB_NAME)

beforeAll(async (): Promise<void> => {
  infoSpy.mockReset()

  for await (const file of glob(`${path}*`)) {
    await unlink(file)
  }
})

describe("db", (): void => {
  test("load", (): void => {
    expect(DB.load()).resolves.toBe(undefined)

    const TIMES: number = 8

    expect(infoSpy).toHaveBeenCalledTimes(TIMES)

    expect(infoSpy).toHaveBeenNthCalledWith(2, expect.any(String), expect.stringContaining(path))
  })
})
