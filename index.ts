import { error, info } from "@postfmly/logger"

import { Client } from "./utils/client.ts"
import { Distraction } from "./utils/distraction.ts"
import { env } from "./utils/env.ts"

try {
  await Client.init()

  await Distraction.init()

  info(`🟢 ${env.ACTIVITY}....`)
} catch (e: unknown) {
  const msg = e instanceof Error ? e.message : String(e)

  error(`❌ ${msg}`)

  await Client.shutdown(msg)
}
