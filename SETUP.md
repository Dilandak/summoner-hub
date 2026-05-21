# 🎮 Summoner Hub — Setup Guide para Dilandak

## 1. Clonar y dependencias

```bash
git clone https://github.com/TU_USUARIO/summoner-hub.git
cd summoner-hub
npm install
```

## 2. API Key de Riot

1. Ve a https://developer.riotgames.com
2. Inicia sesión con tu cuenta de League
3. Genera una **Development Key** (válida 24h) o solicita una **Production Key**
4. Crea el archivo de entorno:

```bash
cp apps/api/.env.example apps/api/.env
```

Edita `apps/api/.env`:
```env
RIOT_API_KEY=RGAPI-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
RIOT_REGION=la1           # LAS = la1, LAN = la2, NA = na1
RIOT_REGION_V5=americas   # Para match-v5 (siempre americas para LAS/LAN/NA)
PORT=3001
```

## 3. Dev local

```bash
npm run dev
# Frontend: http://localhost:3000
# Backend:  http://localhost:3001
```

## 4. Deploy en Vercel

```bash
npm i -g vercel
vercel login
vercel --prod
```

### Variables de entorno en Vercel Dashboard:
- `RIOT_API_KEY` → tu API key
- `RIOT_REGION` → `la1`
- `RIOT_REGION_V5` → `americas`

## 5. Subdominio en Vercel

En **Vercel → Settings → Domains** agrega:
```
summoner.dilandak.keyshifter.com
```
(o `stats.dilandak.keyshifter.com` — más corto y pro)

Luego en tu DNS (Cloudflare recomendado) agrega un CNAME:
```
summoner.dilandak → cname.vercel-dns.com
```

## 6. Actualizar campeones en ChampionGrid

En `apps/web/src/components/champions/ChampionGrid.tsx` agrega tus campeones principales al mapa `CHAMP_NAMES`:
```ts
const CHAMP_NAMES: Record<number, string> = {
  119: 'Draven',   // tu main aquí
  // busca el ID en: https://ddragon.leagueoflegends.com/cdn/14.23.1/data/es_ES/champion.json
}
```

## Estructura del proyecto

```
summoner-hub/
├── apps/
│   ├── web/                    ← React + Vite (frontend)
│   │   ├── src/
│   │   │   ├── api/client.ts   ← Axios + Data Dragon URLs
│   │   │   ├── hooks/          ← useSummoner, useMatches, useMastery, useLiveGame
│   │   │   ├── components/
│   │   │   │   ├── profile/    ← ProfileHero con GSAP
│   │   │   │   ├── matches/    ← MatchCard, MatchList
│   │   │   │   ├── champions/  ← ChampionCard, ChampionGrid
│   │   │   │   ├── stats/      ← Gráficas Recharts
│   │   │   │   ├── layout/     ← Navbar
│   │   │   │   └── ui/         ← StatCard, RankBadge, WinLossBar, LoadingRift
│   │   │   ├── pages/          ← Dashboard, Matches, Champions, Stats
│   │   │   └── utils/lol.ts    ← Helpers KDA, winrate, tiempo, etc.
│   │   └── tailwind.config.ts  ← Paleta rift-* personalizada
│   └── api/                    ← Hono proxy (evita CORS con Riot API)
│       └── src/
│           ├── routes/         ← summoner, mastery, matches, live
│           └── lib/            ← riot client + cache en memoria
├── packages/types/             ← TypeScript types compartidos
├── turbo.json                  ← Turborepo config
└── vercel.json                 ← Deploy config
```

## Próximos features

- [ ] LP Progress Chart (gráfica de LP por día)
- [ ] Comparación de stats semana vs semana  
- [ ] Heatmap de roles jugados
- [ ] Confeti al detectar racha de victorias
- [ ] Dark/light mode toggle
- [ ] Exportar stats como imagen (compartir en redes)
- [ ] Notificación cuando termina una partida en vivo
