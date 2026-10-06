import { default as assert } from "node:assert/strict"
import { glob, unlink } from "node:fs/promises"
import { join } from "node:path"

import { afterAll, beforeAll, describe, expect, type jest, spyOn, test } from "bun:test"

import { type IDistraction } from "../../db/schema.ts"
import { DB } from "../../utils/db.ts"
import { env } from "../../utils/env.ts"

const infoSpy: jest.Mock = spyOn(console, "info")

const deleteFiles = async (): Promise<void> => {
  for await (const file of glob(join(env.DB_PATH, `${env.DB_NAME}*`))) {
    await unlink(file)
  }
}

beforeAll(async (): Promise<void> => {
  infoSpy.mockReset()

  await deleteFiles()

  DB.open()

  assert(DB._db)

  await DB.init()
})

afterAll(async (): Promise<void> => {
  await deleteFiles()

  DB.close()
})

describe("db", (): void => {
  test("COUNT", async (): Promise<void> => {
    const allDistractions: IDistraction[] = (await Bun.file(join(env.DB_PATH, "distractions.txt")).text())
      .split("\n")
      .map((d: string): string => d.trim())
      .filter(Boolean)
      .map((d: string): IDistraction => ({ distraction: d }))

    expect(DB.COUNT).toBe(allDistractions.length)
  })

  test("getDistraction", async (): Promise<void> => {
    const d: IDistraction = await DB.getDistraction()

    expect(d.distraction.length).toBeGreaterThan(0)
  })
})
