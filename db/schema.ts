import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core"

const distractions = sqliteTable("distractions", {
  distraction: text().notNull(),
  id: integer().primaryKey()
})

type IDistraction = Omit<typeof distractions.$inferSelect, "id">

export { distractions, type IDistraction }
