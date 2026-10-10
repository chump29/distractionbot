import { join } from "node:path"

import { error, info } from "@postfmly/logger"
import { type Nullable } from "@postfmly/types"

import { default as pluralize } from "@jarrodek/pluralize"
import { type ChatInputCommandInteraction, MessageFlags } from "discord.js"
import { exhaustiveUniqueRandom } from "unique-random"

import { type IDistraction } from "../db/schema.ts"
import { env } from "../utils/env.ts"
import { bucket } from "./bucket.ts"

interface IDistractionBot {
  readonly COUNT: number
  init: () => Promise<IDistraction[]>
  show: (interaction: ChatInputCommandInteraction) => Promise<void>
}

class DistractionBot implements IDistractionBot {
  private DISTRACTIONS: IDistraction[] = []
  private random: Nullable<ReturnType<typeof exhaustiveUniqueRandom>> = null

  get COUNT(): number {
    return this.DISTRACTIONS.length
  }

  async init(): Promise<IDistraction[]> {
    this.DISTRACTIONS = (await Bun.file(join(env.DB_PATH, "distractions.txt")).text())
      .split("\n")
      .map((d: string): string => d.trim())
      .filter(Boolean)
      .map((d: string): IDistraction => ({ distraction: d }))

    if (this.COUNT === 0) {
      throw new Error("No distractions found")
    }

    this.random = exhaustiveUniqueRandom(0, this.COUNT - 1)

    if (env.DEBUG) {
      info(`ℹ️  Found ${pluralize("distraction", this.COUNT, true)}`)
    }

    return this.DISTRACTIONS
  }

  private getDistraction(): Nullable<IDistraction> {
    return this.random ? (this.DISTRACTIONS[this.random()] ?? null) : null
  }

  // * /craving | /distraction
  async show(interaction: ChatInputCommandInteraction): Promise<void> {
    await interaction.deferReply({ flags: MessageFlags.Ephemeral })

    if (!bucket.allow(interaction.user.username)) {
      await interaction.editReply({ content: "-# > ❌ Rate limit exceeded" })

      return
    }

    const distraction: Nullable<IDistraction> = this.getDistraction()
    if (!distraction) {
      await interaction.editReply({ content: "-# > ❌ Something went wrong" })

      error("❌ Could not get distraction")

      return
    }

    await interaction.editReply({ content: `-# > ${distraction.distraction}` })
  }
}

const Distraction: IDistractionBot = new DistractionBot()

export { Distraction }
