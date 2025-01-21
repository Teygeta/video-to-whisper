import { readdirSync } from 'node:fs'
import { eq } from 'drizzle-orm'
import { defineEventHandler } from 'h3'
import { tmpFileAudio } from '~/db/schema'

export default defineEventHandler(async () => {
  try {
    const files = await db.query.tmpFileAudio.findMany({
      with: {
        transcriptions: {
          orderBy: (transcription, { asc }) => [asc(transcription.createdAt)],
        },
      },
    })

    const transcriptions = await db.query.transcription.findMany()

    const tmpFileList = readdirSync('./tmp')

    const filesToDelete = files.filter(file => !tmpFileList.includes(`${file.name}.mp3`))

    for (const file of filesToDelete) {
      await db.delete(tmpFileAudio).where(eq(tmpFileAudio.id, file.id))
    }

    return {
      files,
      transcriptions,
    }
  }
  catch (error) {
    if (error) {
      throw createError({
        statusCode: 500,
      })
    }
  }
})
