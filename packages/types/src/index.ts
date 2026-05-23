// ==========================================
// Riot API Types — Summoner Hub
// ==========================================

export interface Summoner {
  id: string;
  accountId: string;
  puuid: string;
  name: string;
  profileIconId: number;
  revisionDate: number;
  summonerLevel: number;
}

export interface RankedEntry {
  leagueId: string;
  queueType: "RANKED_SOLO_5x5" | "RANKED_FLEX_SR";
  tier: Tier;
  rank: Division;
  summonerId: string;
  summonerName: string;
  leaguePoints: number;
  wins: number;
  losses: number;
  veteran: boolean;
  inactive: boolean;
  freshBlood: boolean;
  hotStreak: boolean;
}

export type Tier =
  | "IRON"
  | "BRONZE"
  | "SILVER"
  | "GOLD"
  | "PLATINUM"
  | "EMERALD"
  | "DIAMOND"
  | "MASTER"
  | "GRANDMASTER"
  | "CHALLENGER";

export type Division = "I" | "II" | "III" | "IV";

export interface ChampionMastery {
  puuid: string;
  championId: number;
  championLevel: number;
  championPoints: number;
  lastPlayTime: number;
  championPointsSinceLastLevel: number;
  championPointsUntilNextLevel: number;
  tokensEarned: number;
  summonerId: string;
}

export interface MatchSummary {
  metadata: {
    matchId: string;
    participants: string[];
  };
  info: MatchInfo;
}

export interface MatchInfo {
  gameCreation: number
  gameDuration: number
  gameStartTimestamp?: number
  gameEndTimestamp?: number
  queueId: number
  participants: Participant[]
}

export interface Participant {
  puuid: string;
  summonerName: string;
  championId: number;
  championName: string;
  teamId: number;
  win: boolean;
  kills: number;
  deaths: number;
  assists: number;
  totalDamageDealt: number;
  totalDamageDealtToChampions: number;
  totalMinionsKilled: number;
  neutralMinionsKilled: number;
  visionScore: number;
  goldEarned: number;
  item0: number;
  item1: number;
  item2: number;
  item3: number;
  item4: number;
  item5: number;
  item6: number;
  lane: string;
  role: string;
  spell1Id: number;
  spell2Id: number;
  profileIcon: number;
  pentaKills: number;
  quadraKills: number;
  tripleKills: number;
  doubleKills: number;
}

export interface LiveGame {
  gameId: number;
  gameType: string;
  gameStartTime: number;
  mapId: number;
  gameLength: number;
  platformId: string;
  gameMode: string;
  gameQueueConfigId: number;
  participants: LiveParticipant[];
}

export interface LiveParticipant {
  teamId: number;
  spell1Id: number;
  spell2Id: number;
  championId: number;
  profileIconId: number;
  summonerName: string;
  bot: boolean;
  summonerId: string;
  gameCustomizationObjects: unknown[];
  perks: unknown;
}

// Data Dragon
export interface DDragonChampion {
  id: string;
  key: string;
  name: string;
  title: string;
  image: {
    full: string;
    sprite: string;
  };
}

export interface DDragonItem {
  name: string;
  description: string;
  image: { full: string };
  gold: { total: number };
}

// API responses del backend propio
export interface ApiResponse<T> {
  data: T;
  error?: string;
  cached?: boolean;
}
