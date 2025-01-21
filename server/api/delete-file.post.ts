import { unlinkSync } from 'node:fs'
import { eq } from 'drizzle-orm'
import { defineEventHandler } from 'h3'
import { tmpFileAudio } from '~/db/schema'

export default defineEventHandler(async (event) => {
  const { file } = await readBody(event)
  try {
    unlinkSync(`./tmp/${file.name}.mp3`)
    await db.delete(tmpFileAudio).where(eq(tmpFileAudio.id, file.id))
  }
  catch (error) {
    if (error) {
      throw createError({
        statusCode: 500,
      })
    }
  }
})
