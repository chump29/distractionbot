import { ActivityType, Client, GatewayIntentBits } from "discord.js"

import { info } from "@postfmly/logger"

import { closeDatabase } from "./db.ts"
import { SERVER } from "./logo.ts"

let CLIENT: Client | null = null

const EVENTS: string[] = [
  "SIGINT",
  "SIGTERM"
]

const shutdown = async (event: string): Promise<void> => {
  if (Bun.env.DEBUG) {
    info(`${event} detected`)
  }

  info("Shutting down...")

  await closeDatabase()
    .then(async (): Promise<void> => CLIENT?.destroy())
    .then(async (): Promise<void> => await SERVER?.stop(true))
    .then((): void => process.exit(0))
}

const client = async (): Promise<Client> => {
  CLIENT = new Client({
    intents: [
      GatewayIntentBits.Guilds
    ],
    presence: {
      activities: [
        {
          name: "Distracting...",
          type: ActivityType.Custom
        }
      ]
    }
  })

  EVENTS.forEach((event: string): void => {
    process.on(event, async (event: string): Promise<void> => {
      await shutdown(event)
    })
  })

  return CLIENT
}

const login = async (): Promise<Client> => {
  if (!CLIENT) {
    throw new Error("Invalid client")
  }

  if (!Bun.env.TOKEN) {
    throw new Error("Invalid TOKEN")
  }

  await CLIENT.login(Bun.env.TOKEN)

  if (CLIENT.user && Bun.env.DEBUG) {
    info(`Connected as ${CLIENT.user.displayName} (${CLIENT.user.tag})`)
  }

  return CLIENT
}

export { client, login, shutdown }
