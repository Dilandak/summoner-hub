import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Paleta LoL personalizada
        rift: {
          gold:    '#C89B3C',
          gold2:   '#F0E6D3',
          dark:    '#010A13',
          navy:    '#0A1428',
          blue:    '#0BC4E3',
          teal:    '#0397AB',
          purple:  '#785A28',
          silver:  '#A0A0A0',
          border:  '#1E2328',
          panel:   '#111827',
        },
      },
      fontFamily: {
        display: ['"Cinzel"', 'serif'],
        body:    ['"Rajdhani"', 'sans-serif'],
        mono:    ['"Share Tech Mono"', 'monospace'],
      },
      backgroundImage: {
        'rift-gradient': 'linear-gradient(135deg, #010A13 0%, #0A1428 50%, #0D2137 100%)',
        'gold-gradient': 'linear-gradient(90deg, #785A28, #C89B3C, #F0E6D3, #C89B3C, #785A28)',
      },
      animation: {
        'glow-pulse': 'glow 2s ease-in-out infinite alternate',
        'float':      'float 6s ease-in-out infinite',
        'shimmer':    'shimmer 3s linear infinite',
      },
      keyframes: {
        glow: {
          '0%':   { textShadow: '0 0 10px #C89B3C44' },
          '100%': { textShadow: '0 0 25px #C89B3Caa, 0 0 50px #C89B3C44' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-12px)' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
      },
    },
  },
  plugins: [],
}

export default config
