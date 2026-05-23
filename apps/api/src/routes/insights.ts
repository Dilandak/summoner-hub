import axios from "axios";
import { Hono } from "hono";
import { riotGet, riotUrl } from "../lib/riot.js";
import { cacheGet, cacheSet } from "../lib/cache.js";
import type { MatchSummary } from "@summoner-hub/types";
import { getMatchesByIds } from '../lib/match-service.js'

const app = new Hono();

type SidePreference = "Azul" | "Rojo" | "Equilibrado";

type ChampionRecentStats = {
  championName: string;
  games: number;
  wins: number;
  losses: number;
  winRate: number;
  avgKills: number;
  avgDeaths: number;
  avgAssists: number;
  kdaText: string;
  lastPlayedAt: number;
  splashUrl: string;
  loadingUrl: string;
  squareUrl: string;
};

type ProfileInsights = {
  puuid: string;
  regionLabel: string;
  analyzedMatches: number;
  recentMain: ChampionRecentStats | null;
  sidePreference: {
    favorite: SidePreference;
    blueGames: number;
    redGames: number;
    blueRate: number;
    redRate: number;
  };
  lastUpdatedAt: string;
};

type ChampionAccumulator = {
  championName: string;
  games: number;
  wins: number;
  kills: number;
  deaths: number;
  assists: number;
  lastPlayedAt: number;
};

let ddragonVersionCache: {
  version: string;
  expiresAt: number;
} | null = null;

async function getLatestDDragonVersion(): Promise<string> {
  if (ddragonVersionCache && Date.now() < ddragonVersionCache.expiresAt) {
    return ddragonVersionCache.version;
  }

  const res = await axios.get<string[]>(
    "https://ddragon.leagueoflegends.com/api/versions.json",
    { timeout: 10_000 },
  );

  const version = res.data[0];

  ddragonVersionCache = {
    version,
    expiresAt: Date.now() + 24 * 60 * 60 * 1000,
  };

  return version;
}

function getRegionLabel() {
  const region = (process.env.RIOT_REGION || "la1").toLowerCase();

  const labels: Record<string, string> = {
    la1: "LAN",
    la2: "LAS",
    na1: "NA",
    euw1: "EUW",
    eun1: "EUNE",
    kr: "KR",
    br1: "BR",
    jp1: "JP",
    oc1: "OCE",
    tr1: "TR",
    ru: "RU",
  };

  return labels[region] ?? region.toUpperCase();
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchMatchesInBatches(ids: string[]) {
  const matches: MatchSummary[] = [];
  const batchSize = 5;

  for (let i = 0; i < ids.length; i += batchSize) {
    const batch = ids.slice(i, i + batchSize);

    const settled = await Promise.allSettled(
      batch.map((id) => riotGet<MatchSummary>(riotUrl.match(id))),
    );

    for (const result of settled) {
      if (result.status === "fulfilled") {
        matches.push(result.value);
      } else {
        console.warn("Match skipped because Riot request failed");
      }
    }

    if (i + batchSize < ids.length) {
      await sleep(500);
    }
  }

  return matches;
}

function getWinRate(wins: number, games: number) {
  if (games <= 0) return 0;
  return Number(((wins / games) * 100).toFixed(1));
}

function getAvg(value: number, games: number) {
  if (games <= 0) return 0;
  return Number((value / games).toFixed(1));
}

function getSidePreference(
  blueGames: number,
  redGames: number,
): SidePreference {
  if (blueGames === redGames) return "Equilibrado";
  return redGames > blueGames ? "Rojo" : "Azul";
}

app.get("/:puuid", async (c) => {
  const puuid = c.req.param("puuid");
  const countParam = Number(c.req.query("count") || 50);
  const count = Math.min(Math.max(countParam, 10), 100);

  const cacheKey = `insights:${puuid}:${count}`;

  const cached = cacheGet<ProfileInsights>(cacheKey);
  if (cached) return c.json({ data: cached, cached: true });

  try {
    const ddragonVersion = await getLatestDDragonVersion();

    const matchIds = await riotGet<string[]>(riotUrl.matchIds(puuid, count));

    const matches = await getMatchesByIds(matchIds)

    const championMap = new Map<string, ChampionAccumulator>();

    let analyzedMatches = 0;
    let blueGames = 0;
    let redGames = 0;

    for (const match of matches) {
      const me = match.info.participants.find((p) => p.puuid === puuid);
      if (!me) continue;

      analyzedMatches += 1;

      if (me.teamId === 100) blueGames += 1;
      if (me.teamId === 200) redGames += 1;

      const championName = me.championName;
      const info = match.info as MatchSummary["info"] & {
        gameEndTimestamp?: number;
        gameStartTimestamp?: number;
      };

      const gameTime =
        info.gameEndTimestamp ??
        info.gameStartTimestamp ??
        info.gameCreation ??
        Date.now();

      const current = championMap.get(championName) ?? {
        championName,
        games: 0,
        wins: 0,
        kills: 0,
        deaths: 0,
        assists: 0,
        lastPlayedAt: 0,
      };

      current.games += 1;
      current.wins += me.win ? 1 : 0;
      current.kills += me.kills;
      current.deaths += me.deaths;
      current.assists += me.assists;
      current.lastPlayedAt = Math.max(current.lastPlayedAt, gameTime);

      championMap.set(championName, current);
    }

    const topChampion = [...championMap.values()].sort((a, b) => {
      if (b.games !== a.games) return b.games - a.games;
      return b.lastPlayedAt - a.lastPlayedAt;
    })[0];

    const recentMain: ChampionRecentStats | null = topChampion
      ? {
          championName: topChampion.championName,
          games: topChampion.games,
          wins: topChampion.wins,
          losses: topChampion.games - topChampion.wins,
          winRate: getWinRate(topChampion.wins, topChampion.games),
          avgKills: getAvg(topChampion.kills, topChampion.games),
          avgDeaths: getAvg(topChampion.deaths, topChampion.games),
          avgAssists: getAvg(topChampion.assists, topChampion.games),
          kdaText: `${getAvg(topChampion.kills, topChampion.games)} / ${getAvg(topChampion.deaths, topChampion.games)} / ${getAvg(topChampion.assists, topChampion.games)}`,
          lastPlayedAt: topChampion.lastPlayedAt,
          splashUrl: `https://ddragon.leagueoflegends.com/cdn/img/champion/splash/${topChampion.championName}_0.jpg`,
          loadingUrl: `https://ddragon.leagueoflegends.com/cdn/img/champion/loading/${topChampion.championName}_0.jpg`,
          squareUrl: `https://ddragon.leagueoflegends.com/cdn/${ddragonVersion}/img/champion/${topChampion.championName}.png`,
        }
      : null;

    const sidePreference = {
      favorite: getSidePreference(blueGames, redGames),
      blueGames,
      redGames,
      blueRate: analyzedMatches
        ? Number(((blueGames / analyzedMatches) * 100).toFixed(1))
        : 0,
      redRate: analyzedMatches
        ? Number(((redGames / analyzedMatches) * 100).toFixed(1))
        : 0,
    };

    const result: ProfileInsights = {
      puuid,
      regionLabel: getRegionLabel(),
      analyzedMatches,
      recentMain,
      sidePreference,
      lastUpdatedAt: new Date().toISOString(),
    };

    cacheSet(cacheKey, result, 3 * 60 * 1000);

    return c.json({ data: result, cached: false });
  } catch (err: unknown) {
    const status =
      (err as { response?: { status?: number } })?.response?.status || 500;

    console.error("Error fetching profile insights:", {
      status,
      puuid,
    });

    return c.json(
      {
        error: "Error fetching profile insights",
        status,
      },
      status as 400,
    );
  }
});

export default app;
