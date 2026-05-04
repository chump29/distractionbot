import { parse } from "node:path"

import {
  type ChatInputCommandInteraction,
  type InteractionResponse,
  MessageFlags,
  PermissionFlagsBits,
  type RESTPostAPIChatInputApplicationCommandsJSONBody,
  SlashCommandBuilder
} from "discord.js"

import pluralize from "pluralize"

import { loadDistractions } from "../../utils/db.ts"
import { COUNT, refreshDistractions } from "../../utils/loadDistractions.ts"

const create = (): RESTPostAPIChatInputApplicationCommandsJSONBody => {
  return new SlashCommandBuilder()
    .setName(parse(import.meta.file).name)
    .setDescription("Reload distractions")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .toJSON()
}

const invoke = async (interaction: ChatInputCommandInteraction): Promise<void> => {
  await loadDistractions()
    .then(async (): Promise<void> => await refreshDistractions())
    .then(
      async (): Promise<InteractionResponse> =>
        await interaction.reply({
          content: `-# > 🔄 Loaded ${pluralize("distraction", COUNT, true)}`,
          flags: MessageFlags.Ephemeral
        })
    )
}

export { create, invoke }
