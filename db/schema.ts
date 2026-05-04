import { type InferSelectModel } from "drizzle-orm"
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core"

const distractions = sqliteTable("distractions", {
  distraction: text().notNull(),
  id: integer().primaryKey()
})

type IDistraction = InferSelectModel<typeof distractions>

export { distractions, type IDistraction }
