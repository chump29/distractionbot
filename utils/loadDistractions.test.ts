import { describe, expect, jest, mock, test } from "bun:test"

import { type IDistraction } from "../db/schema.ts"
import { COUNT, DISTRACTIONS, loadSettings } from "./loadDistractions.ts"

describe("loadDistractions", (): void => {
  const distractions: IDistraction[] = [
    {
      distraction: "TEST"
    } as IDistraction
  ] as IDistraction[]

  mock.module("./db.ts", (): unknown => {
    return {
      getDistractions: jest.fn().mockResolvedValue(distractions)
    }
  })

  test("loadSettings", async (): Promise<void> => {
    await loadSettings()
    expect(DISTRACTIONS[0]!.distraction).toBe("TEST")
    expect(COUNT).toBe(1)
  })
})
