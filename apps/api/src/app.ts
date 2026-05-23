import 'dotenv/config'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'

import summonerRoute from './routes/summoner.js'
import masteryRoute from './routes/mastery.js'
import matchesRoute from './routes/matches.js'
import liveRoute from './routes/live.js'
import insightsRoute from './routes/insights.js'
import refreshRoute from './routes/refresh.js'
import championStatsRoute from './routes/champion-stats.js'
import recentPlayersRoute from './routes/recent-players.js'

const app = new Hono()

app.use('*', logger())

app.use(
  '*',
  cors({
    origin: [
      'http://localhost:3000',
      'http://localhost:5173',
      'https://dilandak.keyshifter.com',
    ],
    allowMethods: ['GET', 'POST', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization'],
  })
)

app.get('/health', c =>
  c.json({
    status: 'ok',
    ts: new Date().toISOString(),
  })
)

app.route('/api/summoner', summonerRoute)
app.route('/api/mastery', masteryRoute)
app.route('/api/matches', matchesRoute)
app.route('/api/live', liveRoute)
app.route('/api/insights', insightsRoute)
app.route('/api/refresh', refreshRoute)
app.route('/api/champion-stats', championStatsRoute)
app.route('/api/recent-players', recentPlayersRoute)

export default app