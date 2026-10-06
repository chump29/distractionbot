import { join } from "node:path"

import { Database } from "bun:sqlite"

import { info } from "@postfmly/logger"
import { type Nullable } from "@postfmly/types"

import { default as pluralize } from "@jarrodek/pluralize"
import { sql } from "drizzle-orm"
import { drizzle } from "drizzle-orm/bun-sqlite"
import { migrate } from "drizzle-orm/bun-sqlite/migrator"

import { distractions, type IDistraction } from "../db/schema.ts"
import { env } from "./env.ts"

type DBType = ReturnType<typeof drizzle>

interface IDistractionBotDatabase {
  _db: Nullable<DBType>
  COUNT: number
  close: () => void
  getDistraction: () => Promise<IDistraction>
  init: () => Promise<void>
  open: () => void
}

class DistractionBotDatabase implements IDistractionBotDatabase {
  private client: Nullable<Database> = null
  _db: Nullable<DBType> = null

  COUNT: number = 0

  open(): void {
    if (this._db && env.DEBUG) {
      info("⚠️  Database already open")

      return
    }

    const dbPathName: string = join(env.DB_PATH, env.DB_NAME)

    this.client = new Database(dbPathName, {
      create: true,
      strict: true
    })

    this.client.run(`
      PRAGMA busy_timeout = 3000;
      PRAGMA foreign_keys = 0;
      PRAGMA journal_mode = WAL;
      PRAGMA synchronous = NORMAL;
      PRAGMA wal_checkpoint(TRUNCATE);
    `)

    this._db = drizzle({
      client: this.client,
      jit: true
    })

    migrate(this._db, {
      migrationsFolder: env.DB_PATH
    })

    if (env.DEBUG) {
      info(`▶️  Using database: ${dbPathName}`)
    }
  }

  close(): void {
    if (!this._db && env.DEBUG) {
      info("⚠️  Database already closed")
    }

    this.client?.close()
    this.client = null

    this._db = null

    if (env.DEBUG) {
      info("⏹️  Database closed")
    }
  }

  private dbCheck(): DBType {
    if (!this._db) {
      throw new Error("Database not open")
    }

    return this._db
  }

  private async load(): Promise<void> {
    const allDistractions: IDistraction[] = (await Bun.file(join(env.DB_PATH, "distractions.txt")).text())
      .split("\n")
      .map((d: string): string => d.trim())
      .filter(Boolean)
      .map((d: string): IDistraction => ({ distraction: d }))
    if (allDistractions.length === 0) {
      throw new Error("No distractions found")
    }

    if ((await this.dbCheck().$count(distractions)) !== allDistractions.length) {
      await this.dbCheck().delete(distractions)

      await this.dbCheck().insert(distractions).values(allDistractions)

      if (env.DEBUG) {
        info(`✅ Inserted ${pluralize("distraction", allDistractions.length, true)}`)
      }
    }
  }

  async init(): Promise<void> {
    await this.load()

    this.COUNT = await this.dbCheck().$count(distractions)

    if (env.DEBUG) {
      info(`ℹ️  Found ${pluralize("distraction", this.COUNT, true)}`)
    }
  }

  // * /craving | /distraction
  async getDistraction(): Promise<IDistraction> {
    const [distraction]: IDistraction[] = await this.dbCheck()
      .select({ distraction: distractions.distraction })
      .from(distractions)
      .orderBy(sql`RANDOM()`)
      .limit(1)

    if (!distraction) {
      throw new Error("Could not get distraction")
    }

    return distraction
  }
}

const DB: IDistractionBotDatabase = new DistractionBotDatabase()

export { DB }
