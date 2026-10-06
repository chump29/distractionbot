import { type ChatInputCommandInteraction, MessageFlags } from "discord.js"

import { type IDistraction } from "../db/schema.ts"
import { bucket } from "./bucket.ts"
import { DB } from "./db.ts"

const distract = async (interaction: ChatInputCommandInteraction): Promise<void> => {
  await interaction.deferReply({ flags: MessageFlags.Ephemeral })

  if (!bucket.allow(interaction.user.username)) {
    await interaction.editReply({ content: "-# > ❌ Rate limit exceeded" })

    return
  }

  const distraction: IDistraction = await DB.getDistraction()
  if (!distraction) {
    await interaction.editReply({ content: "-# > ❌ Could not get distraction" })

    return
  }

  await interaction.editReply({ content: `-# > ${distraction.distraction}` })
}

export { distract }
