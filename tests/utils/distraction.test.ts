import { beforeAll, describe, expect, mock, spyOn, test } from "bun:test"

import { fakerEN_US as fake } from "@faker-js/faker"
import { type ChatInputCommandInteraction } from "discord.js"

import { Distraction } from "../../utils/distraction.ts"
import { env } from "../../utils/env.ts"

const infoSpy = spyOn(console, "info")
if (!env.TEST_FULL) {
  infoSpy.mockImplementation((): void => undefined)
}

beforeAll(async (): Promise<void> => {
  await Distraction.init()
})

describe("distraction", (): void => {
  // biome-ignore lint/nursery/useLowercaseTestTitle: getter name
  test("COUNT", (): void => {
    expect(Distraction.COUNT).toBeGreaterThan(0)
  })

  test("show", (): void => {
    const [mockDeferReply, mockEditReply] = [
      mock<ChatInputCommandInteraction["deferReply"]>(),
      mock<ChatInputCommandInteraction["editReply"]>()
    ]

    expect(
      Distraction.show(
        createMock<ChatInputCommandInteraction>({
          createdTimestamp: fake.date.past().getTime(),
          deferReply: mockDeferReply,
          editReply: mockEditReply
        })
      )
    ).resolves.toBe(undefined)

    expect(mockDeferReply).toHaveBeenCalledOnce()
    expect(mockEditReply).toHaveBeenCalledOnce()

    expect(infoSpy).toHaveBeenCalledTimes(2)
    expect(infoSpy).toHaveBeenNthCalledWith(
      2,
      expect.any(String),
      expect.stringContaining(Distraction.COUNT.toString())
    )
  })
})
