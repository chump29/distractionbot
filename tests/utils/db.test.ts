import { beforeAll, describe, expect, type jest, spyOn, test } from "bun:test"

import { DB } from "../../utils/db.ts"

const infoSpy: jest.Mock = spyOn(console, "info")

beforeAll((): void => {
  infoSpy.mockReset()
})

describe("db", (): void => {
  test("load", (): void => {
    expect(DB.load()).resolves.toBe(undefined)

    const TIMES: number = 6
    expect(infoSpy).toHaveBeenCalledTimes(TIMES)
  })
})
