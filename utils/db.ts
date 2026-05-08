import { mkdir } from "node:fs/promises"

import { Database, SQLiteError } from "bun:sqlite"
import { type BunFile } from "bun"

import { info } from "@postfmly/logger"

import { sql } from "drizzle-orm"
import { drizzle, type SQLiteBunDatabase } from "drizzle-orm/bun-sqlite"
import pluralize from "pluralize"

import { distractions, type IDistraction } from "../db/schema.ts"

let SQLITE: Database | null = null
let TEST_SQLITE: Database | null = null
let DB: SQLiteBunDatabase | null = null
const TEST_DB: SQLiteBunDatabase | null = null

Bun.env.DB_NAME = Bun.env.DB_NAME || "distractionbot.db"
Bun.env.DB_PATH = Bun.env.DB_PATH || "./db/"

const loadDistractions = async (): Promise<void> => {
  const distractionsFile: BunFile = Bun.file(`${import.meta.dirname}/distractions.txt`)

  const allDistractions: IDistraction[] = (await distractionsFile.text())
    .split("\n")
    .filter((distraction: string): boolean => distraction.length > 0)
    .map(
      (distraction: string): IDistraction =>
        ({
          distraction: distraction.trim()
        }) as IDistraction
    )

  if (!allDistractions?.length) {
    throw new Error("No distractions found")
  }

  if (!DB) {
    throw new Error("Database not open")
  }

  await DB.delete(distractions)

  const rows: IDistraction[] = await DB.insert(distractions).values(allDistractions).returning()

  if (Bun.env.DEBUG) {
    info(`Inserted ${pluralize("distraction", rows.length, true)}`)
  }
}

const openDatabase = async (): Promise<void> => {
  await mkdir(Bun.env.DB_PATH, {
    recursive: true
  })

  const DB_STR: string = `${Bun.env.DB_PATH}${Bun.env.DB_NAME}`

  SQLITE = new Database(DB_STR, {
    create: true,
    strict: true
  })

  if (Bun.env.NODE_ENV === "test") {
    TEST_SQLITE = SQLITE
  }

  DB =
    TEST_DB ??
    drizzle({
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
        info("Creating tables")
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

  if (Bun.env.DEBUG) {
    info("Database closed")
  }
}

export { closeDatabase, getDistractions, loadDistractions, openDatabase, TEST_DB, TEST_SQLITE }
