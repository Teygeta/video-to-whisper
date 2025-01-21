import { spawn } from 'node:child_process'
import { readdirSync } from 'node:fs'
import { tmpFileAudio } from '~/db/schema'

function spwn(cmd: string, args: ReadonlyArray<string>) {
  return new Promise((resolve, reject) => {
    const cp = spawn(cmd, args)
    const error: string[] = []
    const stdout: string[] = []
    cp.stdout.on('data', (data) => {
      stdout.push(data.toString())
    })

    cp.on('error', (e) => {
      error.push(e.toString())
    })

    cp.on('close', () => {
      if (error.length)
        reject(error.join(''))
      else resolve(stdout.join(''))
    })
  })
}

export default defineEventHandler(async (event) => {
  const { url } = await readBody(event)

  if (!url) {
    return { error: 'URL is required' }
  }

  try {
    const videoMeta = await spwn('yt-dlp', ['-e', '--get-title', url]) as string
    const videoTitle = videoMeta.replace(/[^a-z0-9]/gi, ' ').trim()

    const tmpFileList = readdirSync('./tmp')
    if (tmpFileList.includes(`${videoTitle}.mp3`)) {
      throw new Error('File already exists')
    }

    if (!videoTitle) {
      throw new Error('Failed to get video title')
    }

    // eslint-disable-next-line no-console
    console.log('Downloading audio file...')

    await spwn('yt-dlp', ['-x', '--audio-format', 'mp3', '--audio-quality', '8', '-o', `${videoTitle}.%(ext)s`, '-P', './tmp', url])

    // eslint-disable-next-line no-console
    console.log('Audio file downloaded successfully')

    await db.insert(tmpFileAudio).values({ name: videoTitle })

    return true
  }
  catch (error) {
    console.error(error)
    if (error) {
      throw createError({
        statusCode: 500,
        message: 'Failed to download the audio file',
      })
    }
  }
})
