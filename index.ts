import { error, info } from "@postfmly/logger"

import { Client } from "./utils/client.ts"
import { DB } from "./utils/db.ts"
import { env } from "./utils/env.ts"

try {
  await DB.load()

  await Client.init()

  info(`🟢 ${env.ACTIVITY}....`)
} catch (e: unknown) {
  error(e)

  await Client.shutdown()
}
