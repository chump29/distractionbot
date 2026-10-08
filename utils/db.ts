import { join } from "node:path"

import { Database } from "bun:sqlite"

import { info } from "@postfmly/logger"
import { type Nullable } from "@postfmly/types"

import { default as pluralize } from "@jarrodek/pluralize"
import { drizzle } from "drizzle-orm/bun-sqlite"
import { migrate } from "drizzle-orm/bun-sqlite/migrator"

import { distractions, type IDistraction } from "../db/schema.ts"
import { Distraction } from "./distraction.ts"
import { env } from "./env.ts"

type DBType = ReturnType<typeof drizzle>

interface IDistractionBotDatabase {
  load: () => Promise<void>
}

class DistractionBotDatabase implements IDistractionBotDatabase {
  private client: Nullable<Database> = null
  private _db: Nullable<DBType> = null

  private open(): void {
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

  private close(): void {
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

  async load(): Promise<void> {
    this.open()

    const allDistractions: IDistraction[] = await Distraction.init()

    if ((await this.dbCheck().$count(distractions)) !== allDistractions.length) {
      await this.dbCheck().delete(distractions)

      await this.dbCheck().insert(distractions).values(allDistractions)

      if (env.DEBUG) {
        info(`✅ Inserted ${pluralize("distraction", allDistractions.length, true)}`)
      }

      this.close()
    }
  }
}

const DB: IDistractionBotDatabase = new DistractionBotDatabase()

export { DB }
