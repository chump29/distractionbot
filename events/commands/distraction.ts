import { parse } from "node:path"

import { type ChatInputCommandInteraction, type RESTPostAPIChatInputApplicationCommandsJSONBody } from "discord.js"

import { create as cravingCreate, invoke as cravingInvoke } from "./craving.ts"

// * NOTE: Alias for /craving

const create = (): RESTPostAPIChatInputApplicationCommandsJSONBody => {
  const craving: RESTPostAPIChatInputApplicationCommandsJSONBody = cravingCreate()
  craving.name = parse(import.meta.file).name
  craving.description = "Need a distraction"
  return craving
}

const invoke = async (interaction: ChatInputCommandInteraction): Promise<void> => {
  await cravingInvoke(interaction)
}

export { create, invoke }
