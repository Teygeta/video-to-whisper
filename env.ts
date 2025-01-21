import { createEnv } from '@t3-oss/env-nuxt'
import { z } from 'zod'

export const env = createEnv({
  server: {
    OPENAI_API_KEY: z.string(),
  },
})
