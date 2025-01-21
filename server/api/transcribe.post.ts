import { createReadStream, statSync } from 'node:fs'
import { defineEventHandler } from 'h3'
import OpenAI from 'openai'
import { transcription as transcriptionDb } from '~/db/schema'
import { env } from '~/env'

const openai = new OpenAI({
  apiKey: env.OPENAI_API_KEY as string,
})

type TranscriptionType = 'default' | 'short' | 'long' | 'italian' | 'english'

export default defineEventHandler(async (event) => {
  const { file, transcriptionType } = await readBody(event)

  if (!file) {
    throw createError({ status: 500 })
  }

  const fileSize = statSync(`./tmp/${file.name}.mp3`).size
  if (fileSize > 25000000) {
    throw createError({ status: 413, message: 'File too large' })
  }

  let textResult = ''

  try {
    const { text } = await openai.audio.transcriptions.create({
      file: createReadStream(`./tmp/${file.name}.mp3`),
      model: 'whisper-1',
      response_format: 'verbose_json',
    })

    const validTranscriptionTypes: TranscriptionType[] = ['default', 'short', 'long', 'italian', 'english']

    if (!validTranscriptionTypes.includes(transcriptionType)) {
      throw createError({ status: 400, message: 'Invalid transcription type' })
    }

    textResult = transcriptionType === 'default'
      ? text
      : await createCompletion(text, transcriptionType)

    await db.insert(transcriptionDb).values({
      tmpFileAudioId: file.id,
      tmpFileAudioName: file.name,
      type: transcriptionType,
      text: textResult,
    })

    return text
  }
  catch (error) {
    if (error) {
      console.error(error)
    }
  }
})

async function createCompletion(text: string, type: TranscriptionType) {
  let systemContent = 'You are a helpful assistant. You summarize the contents'
  let userContent = 'I will provide you with a text to summarize. Be as concise as possible while ensuring no important details are omitted. Return only the summarized text so I can copy and paste the content, with no additional comments or input.'

  if (type === 'short') {
    userContent = 'I will provide you with a text to summarize. Be as short as possible while ensuring no important details are omitted. Return only the summarized text so I can copy and paste the content, with no additional comments or input.'
  }
  else if (type === 'long') {
    userContent = 'I will provide you with a text to summarize. Create a detailed summary that captures all key points and nuances without omitting significant information. Return only the summarized text so I can copy and paste the content, with no additional comments or input.'
  }
  else if (type === 'italian') {
    systemContent = 'You are a helpful assistant. You translate the contents'
    userContent = 'I will provide you with a text to translate. Translate the text into Italian. Return only the translated text so I can copy and paste the content, with no additional comments or input. If the text is already in Italian, please return the same text.'
  }
  else if (type === 'english') {
    systemContent = 'You are a helpful assistant. You translate the contents'
    userContent = 'I will provide you with a text to translate. Translate the text into English. Return only the translated text so I can copy and paste the content, with no additional comments or input. If the text is already in Italian, please return the same text.'
  }

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: systemContent },
      { role: 'user', content: userContent },
      {
        role: 'user',
        content: text,
      },
    ],
  })

  return completion.choices[0].message.content as string
}
