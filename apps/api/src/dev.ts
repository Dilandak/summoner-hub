import 'dotenv/config'
import { serve } from '@hono/node-server'
import app from './app.js'

const PORT = Number(process.env.PORT || 3001)

console.log(`🎮 Summoner Hub API corriendo en http://localhost:${PORT}`)

serve({
  fetch: app.fetch,
  port: PORT,
})