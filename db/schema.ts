import { relations } from 'drizzle-orm'
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'

export const tmpFileAudio = sqliteTable('tmpFileAudio', {
  id: integer({ mode: 'number' }).primaryKey({ autoIncrement: true }),
  name: text().notNull(),
})

export const transcription = sqliteTable('transcription', {
  id: integer({ mode: 'number' }).primaryKey({ autoIncrement: true }),
  tmpFileAudioId: integer().references(() => tmpFileAudio.id, { onDelete: 'set null' }),
  tmpFileAudioName: text().notNull(),
  type: text({ enum: ['default', 'short', 'long', 'italian', 'english'] }).notNull(),
  text: text().notNull(),
  createdAt: integer({ mode: 'timestamp' }).default(new Date(Date.now())),
})

export const tmpFileAudioRelations = relations(tmpFileAudio, ({ many }) => ({
  transcriptions: many(transcription),
}))

export const transcriptionRelations = relations(transcription, ({ one }) => ({
  tmpFileAudio: one(tmpFileAudio, {
    fields: [transcription.tmpFileAudioId],
    references: [tmpFileAudio.id],
  }),
}))

export type TranscriptionSelect = typeof transcription.$inferSelect
export type TmpFileAudioSelect = typeof tmpFileAudio.$inferSelect
