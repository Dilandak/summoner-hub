import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/api/client";

export interface QueueStat {
  queueId: number;
  queueName: string;
  games: number;
  wins: number;
  losses: number;
  winRate: number;
}

export interface BestGame {
  matchId: string;
  queueId: number;
  queueName: string;
  gameCreation: number;
  win: boolean;
  kills: number;
  deaths: number;
  assists: number;
  kdaText: string;
  damage: number;
  cs: number;
  gold: number;
  vision: number;
  score: number;
}

export interface ChampionStat {
  championName: string;
  games: number;
  wins: number;
  losses: number;
  winRate: number;
  avgKills: number;
  avgDeaths: number;
  avgAssists: number;
  kdaText: string;
  avgCs: number;
  avgDamage: number;
  avgGold: number;
  avgVision: number;
  lastPlayedAt: number;
  queues: QueueStat[];
  bestGame: BestGame | null;
}

export function useChampionStats(puuid: string | undefined, count = 80) {
  return useQuery({
    queryKey: ["championStats", puuid, count],
    queryFn: async () => {
      const res = await apiClient.get<{ data: ChampionStat[] }>(
        `/api/champion-stats/${puuid}?count=${count}`,
      );

      return res.data.data;
    },
    staleTime: 10 * 60 * 1000,
    retry: 0,
    refetchOnWindowFocus: false,
  });
}
