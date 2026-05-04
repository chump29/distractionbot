import { info } from "@postfmly/logger"

import pluralize from "pluralize"

import { type IDistraction } from "../db/schema.ts"
import { getDistractions } from "./db.ts"

let DISTRACTIONS: IDistraction[] = []
let COUNT: number = 0

const refreshDistractions = async (): Promise<void> => {
  DISTRACTIONS = await getDistractions()
  COUNT = DISTRACTIONS.length
}

const loadSettings = async (): Promise<void> => {
  await refreshDistractions()

  if (Bun.env.DEBUG) {
    info(`Loaded ${pluralize("distraction", COUNT, true)}`)
  }
}

export { COUNT, DISTRACTIONS, loadSettings, refreshDistractions }
