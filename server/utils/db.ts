import { createClient } from '@libsql/client'
import { drizzle } from 'drizzle-orm/libsql/node'
import * as schema from '~/db/schema'

const client = createClient({
  url: 'file:./db.sqlite3',
})

export const db = drizzle(client, {
  schema,
})
