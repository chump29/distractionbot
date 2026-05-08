import { type Client } from "discord.js"

import { error, info } from "@postfmly/logger"
import { startLogoServer } from "@postfmly/logoserver"

import { loadCommands } from "./events/loadCommands.ts"
import { client, login, shutdown } from "./utils/client.ts"
import { openDatabase } from "./utils/db.ts"
import { loadSettings } from "./utils/loadDistractions.ts"

Bun.env.DEBUG = Bun.env.IS_DEBUG === "true" ? true : false

await openDatabase()
  .then(async (): Promise<void> => await loadCommands(await client()))
  .then(async (): Promise<Client> => await login())
  .then(async (): Promise<void> => await loadSettings())
  .then(async (): Promise<void> => await startLogoServer())
  .then((): void => info("Running..."))
  .catch(async (e: unknown): Promise<void> => {
    error(e)
    await shutdown("ERROR")
  })
