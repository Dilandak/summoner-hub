import axios from 'axios'

export const apiClient = axios.create({
  baseURL: import.meta.env.DEV ? 'http://localhost:3001' : '',
  timeout: 15_000,
})

const DDRAGON_VERSION = '14.23.1'
export const ddragon = {
  version: DDRAGON_VERSION,
  profileIcon: (iconId: number) =>
    `https://ddragon.leagueoflegends.com/cdn/${DDRAGON_VERSION}/img/profileicon/${iconId}.png`,
  championSplash: (champName: string, skinNum = 0) =>
    `https://ddragon.leagueoflegends.com/cdn/img/champion/splash/${champName}_${skinNum}.jpg`,
  championSquare: (champName: string) =>
    `https://ddragon.leagueoflegends.com/cdn/${DDRAGON_VERSION}/img/champion/${champName}.png`,
  championLoading: (champName: string, skinNum = 0) =>
    `https://ddragon.leagueoflegends.com/cdn/img/champion/loading/${champName}_${skinNum}.jpg`,
  item: (itemId: number) =>
    `https://ddragon.leagueoflegends.com/cdn/${DDRAGON_VERSION}/img/item/${itemId}.png`,
  spell: (spellName: string) =>
    `https://ddragon.leagueoflegends.com/cdn/${DDRAGON_VERSION}/img/spell/${spellName}.png`,
}
