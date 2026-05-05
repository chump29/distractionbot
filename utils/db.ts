import { mkdir } from "node:fs/promises"

import { Database, SQLiteError } from "bun:sqlite"

import { info } from "@postfmly/logger"

import { sql } from "drizzle-orm"
import { drizzle, type SQLiteBunDatabase } from "drizzle-orm/bun-sqlite"
import pluralize from "pluralize"

import { distractions, type IDistraction } from "../db/schema.ts"

let SQLITE: Database | null = null
let DB: SQLiteBunDatabase | null = null

const loadDistractions = async (): Promise<void> => {
  const distractionsFile: Bun.BunFile = Bun.file(`${import.meta.dirname}/distractions.txt`)

  if (!distractionsFile) {
    throw new Error("Invalid distractionsFile")
  }

  const allDistractions: IDistraction[] = (await distractionsFile.text())
    .split("\n")
    .filter((distraction: string): boolean => distraction.length > 0)
    .map(
      (distraction: string): IDistraction =>
        ({
          distraction: distraction.trim()
        }) as IDistraction
    )

  if (!DB) {
    throw new Error("Database not open")
  }

  await DB.delete(distractions)

  const rows: IDistraction[] = await DB.insert(distractions).values(allDistractions).returning()

  if (!rows.length) {
    throw new Error("Invalid rows")
  }

  if (Bun.env.DEBUG) {
    info(`Inserted ${pluralize("distraction", rows.length, true)}`)
  }
}

const openDatabase = async (): Promise<void> => {
  if (!Bun.env.DB_PATH) {
    throw new Error("Invalid DB_PATH")
  }

  if (!Bun.env.DB_NAME) {
    throw new Error("Invalid DB_NAME")
  }

  await mkdir(Bun.env.DB_PATH, {
    recursive: true
  })

  const DB_STR: string = `${Bun.env.DB_PATH}${Bun.env.DB_NAME}`

  SQLITE = new Database(DB_STR, {
    create: true,
    strict: true
  })

  DB = drizzle({
    client: SQLITE,
    jit: true
  })

  DB.run(
    sql.raw(`
      PRAGMA journal_mode = WAL;
      PRAGMA wal_checkpoint(TRUNCATE);`)
  )

  try {
    await DB.select().from(distractions)
  } catch (e: unknown) {
    if (e instanceof SQLiteError && e.message === "no such table: distractions") {
      if (Bun.env.DEBUG) {
        info("Creating tables...")
      }

      DB.run(
        sql.raw(`
        CREATE TABLE distractions(
          id INTEGER PRIMARY KEY,
          distraction TEXT NOT NULL);`)
      )

      await loadDistractions()
    } else {
      throw e
    }
  }

  if (Bun.env.DEBUG) {
    info(`Using database: ${DB_STR}`)
  }
}

const getDistractions = async (): Promise<IDistraction[]> => {
  if (!DB) {
    throw new Error("Database not open")
  }

  return await DB.select().from(distractions)
}

const closeDatabase = async (): Promise<void> => {
  SQLITE?.close()
}

export { closeDatabase, getDistractions, loadDistractions, openDatabase }
