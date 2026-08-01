/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        base: {
          DEFAULT: '#0A0B0D',
          soft: '#111318',
          surface: '#16181E',
          raised: '#1C1F26',
          line: '#242730',
        },
        ink: {
          DEFAULT: '#F1F2F4',
          dim: '#9096A1',
          faint: '#5B616D',
        },
        accent: {
          DEFAULT: '#4C7EA8',
          soft: 'rgba(76,126,168,0.14)',
          line: 'rgba(76,126,168,0.35)',
        },
        racing: {
          DEFAULT: '#A63B34',
          soft: 'rgba(166,59,52,0.14)',
        },
      },
      fontFamily: {
        display: ['"Manrope"', 'system-ui', 'sans-serif'],
        sans: ['"Inter"', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        xl2: '1.25rem',
      },
      boxShadow: {
        card: '0 1px 0 rgba(255,255,255,0.03) inset, 0 8px 24px rgba(0,0,0,0.35)',
      },
    },
  },
  plugins: [],
};
