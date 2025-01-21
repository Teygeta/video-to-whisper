import { eq } from 'drizzle-orm'
import { defineEventHandler } from 'h3'
import { transcription as transcriptionDb } from '~/db/schema'

export default defineEventHandler(async (event) => {
  const { fileId } = getRouterParams(event) as any

  try {
    const transcription = await db.select().from(transcriptionDb).where(eq(transcriptionDb.tmpFileAudioId, fileId)).orderBy(transcriptionDb.createdAt).limit(1)
    return transcription[0].text
  }
  catch (error) {
    if (error) {
      throw createError({
        statusCode: 500,
      })
    }
  }
})
