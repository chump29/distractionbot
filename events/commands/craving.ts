import { parse } from "node:path"

import {
  type ChatInputCommandInteraction,
  InteractionContextType,
  MessageFlags,
  PermissionFlagsBits,
  type RESTPostAPIChatInputApplicationCommandsJSONBody,
  SlashCommandBuilder
} from "discord.js"

import { info } from "@postfmly/logger"

import { type IDistraction } from "../../db/schema.ts"
import { checkRate } from "../../utils/checkRate.ts"
import { COUNT, DISTRACTIONS } from "../../utils/loadDistractions.ts"

const create = (): RESTPostAPIChatInputApplicationCommandsJSONBody => {
  return new SlashCommandBuilder()
    .setName(parse(import.meta.file).name)
    .setDescription("Having a craving")
    .setDefaultMemberPermissions(PermissionFlagsBits.SendMessages)
    .setContexts(InteractionContextType.Guild)
    .toJSON()
}

const invoke = async (interaction: ChatInputCommandInteraction): Promise<void> => {
  if (await checkRate(interaction)) {
    return
  }

  const distraction: IDistraction | undefined = DISTRACTIONS[Math.floor(Math.random() * COUNT)]
  if (!distraction) {
    throw new Error("Invalid distraction")
  }

  await interaction.reply({
    content: `-# > **${distraction.distraction}**`,
    flags: MessageFlags.Ephemeral
  })

  if (Bun.env.DEBUG) {
    info(`Distraction: ${distraction.distraction}`)
  }
}

export { create, invoke }
