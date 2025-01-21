import { eq } from 'drizzle-orm'
import { defineEventHandler } from 'h3'
import { transcription as dbTranscription } from '~/db/schema'

export default defineEventHandler(async (event) => {
  const { transcription } = await readBody(event)
  try {
    await db.delete(dbTranscription).where(eq(dbTranscription.id, transcription.id))
  }
  catch (error) {
    if (error) {
      throw createError({
        statusCode: 500,
      })
    }
  }
})
