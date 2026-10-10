import { beforeAll, describe, expect, jest, spyOn, test } from "bun:test"

import { fakerEN_US as fake } from "@faker-js/faker"
import { type ChatInputCommandInteraction, type User } from "discord.js"

import { Distraction } from "../../utils/distraction.ts"

const infoSpy: jest.Mock = spyOn(console, "info")

beforeAll(async (): Promise<void> => {
  infoSpy.mockReset()

  await Distraction.init()
})

describe("distraction", (): void => {
  test("COUNT", (): void => {
    expect(Distraction.COUNT).toBeGreaterThan(0)
  })

  test("show", (): void => {
    const interaction: ChatInputCommandInteraction = {
      deferReply: jest.fn().mockResolvedValue(undefined),
      editReply: jest.fn().mockResolvedValue(undefined),
      user: {
        name: fake.internet.username()
      } as unknown as User
    } as unknown as ChatInputCommandInteraction

    expect(Distraction.show(interaction)).resolves.toBe(undefined)

    const mockEditReply = interaction.editReply as ReturnType<typeof jest.fn>
    const firstCallArgs = mockEditReply.mock.calls
    const payload = firstCallArgs[0]?.[0]
    if (!payload) {
      throw new Error("Payload not found")
    }

    expect(mockEditReply).toHaveBeenCalled()
    expect(payload.content.length).toBeGreaterThan(0)

    expect(infoSpy).toHaveBeenCalledTimes(2)
    expect(infoSpy).toHaveBeenNthCalledWith(
      2,
      expect.any(String),
      expect.stringContaining(Distraction.COUNT.toString())
    )
  })
})
