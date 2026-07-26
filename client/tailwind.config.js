/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        ink: {
          950: '#070B14',
          900: '#0B1120',
          800: '#111A2E',
          700: '#1A2540',
          600: '#26365A',
        },
        pulse: {
          400: '#5EEAD4',
          500: '#22D3EE',
          600: '#0EA5C7',
        },
        signal: {
          400: '#A78BFA',
          500: '#8B5CF6',
        },
        warn: {
          400: '#FBBF24',
        },
        danger: {
          400: '#FB7185',
        },
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'sans-serif'],
        body: ['"Inter"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      backgroundImage: {
        'pulse-gradient': 'radial-gradient(120% 120% at 20% -10%, rgba(34,211,238,0.18) 0%, rgba(139,92,246,0.10) 35%, rgba(7,11,20,0) 70%)',
        'card-sheen': 'linear-gradient(135deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.01) 100%)',
      },
      boxShadow: {
        glass: '0 8px 32px 0 rgba(0,0,0,0.35)',
        glow: '0 0 24px rgba(34,211,238,0.35)',
      },
      keyframes: {
        pulseline: {
          '0%': { strokeDashoffset: '1000' },
          '100%': { strokeDashoffset: '0' },
        },
        blink: {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: 0.3 },
        },
      },
      animation: {
        pulseline: 'pulseline 2.4s linear infinite',
        blink: 'blink 1.4s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
