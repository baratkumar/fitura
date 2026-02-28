import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-montserrat)', 'sans-serif'],
      },
      colors: {
        'gold': {
          DEFAULT: '#D4AF37',
          light: '#F0C040',
          dark: '#B8962E',
          muted: '#8B7320',
        },
        'luxury': {
          black: '#0D0D0D',
          dark: '#111111',
          surface: '#1A1A1A',
          card: '#1E1E1E',
          elevated: '#242424',
          border: '#2A2A2A',
          text: '#F5F5F5',
          muted: '#9A9A9A',
          subtle: '#555555',
        },
        'fitura': {
          'dark': '#1a1b3d',
          'blue': {
            DEFAULT: '#2563eb',
            50: '#eff6ff',
            100: '#dbeafe',
            200: '#bfdbfe',
            300: '#93c5fd',
            400: '#60a5fa',
            500: '#3b82f6',
            600: '#2563eb',
            700: '#1d4ed8',
            800: '#1e40af',
            900: '#1e3a8a',
          },
          'purple': {
            DEFAULT: '#9333ea',
            50: '#faf5ff',
            100: '#f3e8ff',
            200: '#e9d5ff',
            300: '#d8b4fe',
            400: '#c084fc',
            500: '#a855f7',
            600: '#9333ea',
            700: '#7c3aed',
            800: '#6b21a8',
            900: '#581c87',
          },
          'magenta': {
            DEFAULT: '#ec4899',
            50: '#fdf2f8',
            100: '#fce7f3',
            200: '#fbcfe8',
            300: '#f9a8d4',
            400: '#f472b6',
            500: '#ec4899',
            600: '#db2777',
            700: '#be185d',
            800: '#9f1239',
            900: '#831843',
          },
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'gradient-gold': 'linear-gradient(135deg, #D4AF37 0%, #F0C040 50%, #B8962E 100%)',
        'gradient-fitura': 'linear-gradient(135deg, #2563eb 0%, #9333ea 50%, #ec4899 100%)',
      },
    },
  },
  plugins: [],
}
export default config
