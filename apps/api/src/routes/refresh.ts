import { Hono } from "hono";
import { cacheDelete, cacheDeleteByPrefix, cacheStats } from "../lib/cache.js";

const app = new Hono();

app.post("/profile", async (c) => {
  const body = await c.req.json<{
    puuid?: string;
    gameName?: string;
    tagLine?: string;
  }>();

  const { puuid, gameName, tagLine } = body;

  if (!puuid || !gameName || !tagLine) {
    return c.json(
      {
        error: "Faltan puuid, gameName o tagLine",
      },
      400,
    );
  }

  const normalizedGameName = gameName.toLowerCase();
  const normalizedTagLine = tagLine.toLowerCase();

  let deleted = 0;

  deleted += cacheDelete(`summoner:${normalizedGameName}:${normalizedTagLine}`)
    ? 1
    : 0;

  deleted += cacheDeleteByPrefix(`insights:${puuid}:`);
  deleted += cacheDeleteByPrefix(`mastery:${puuid}:`);
  deleted += cacheDeleteByPrefix(`matches:${puuid}:`);
  deleted += cacheDeleteByPrefix(`live:${puuid}:`);
  deleted += cacheDeleteByPrefix(`champion-stats:${puuid}:`);
  deleted += cacheDeleteByPrefix(`recent-players:${puuid}:`)

  return c.json({
    ok: true,
    message: "Cache del perfil limpiado correctamente",
    deleted,
    cache: cacheStats(),
  });
});

export default app;
