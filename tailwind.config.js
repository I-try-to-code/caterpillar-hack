/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        cat: {
          bg: '#F4F6F9',
          panel: '#FFFFFF',
          surface: '#F8FAFC',
          hover: '#E2E8F0',
          border: '#CBD5E1',
          yellow: '#FFCD11',
          yellowDark: '#E0B200',
          yellowHover: '#FFE066',
          green: '#059669',
          greenDark: '#047857',
          amber: '#D97706',
          amberDark: '#B45309',
          red: '#DC2626',
          redDark: '#B91C1C',
          muted: '#64748B',
          text: '#0F172A',
        },
      },
      fontFamily: {
        sans: [
          'Inter',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'sans-serif',
        ],
        mono: [
          'JetBrains Mono',
          'Fira Code',
          'Cascadia Code',
          'Consolas',
          'monospace',
        ],
      },
      boxShadow: {
        'cat-glow': '0 0 15px rgba(255, 205, 17, 0.25)',
        'cat-danger': '0 0 15px rgba(239, 68, 68, 0.35)',
        'cat-safe': '0 0 15px rgba(16, 185, 129, 0.35)',
      },
      animation: {
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'beacon': 'beacon 2s cubic-bezier(0, 0, 0.2, 1) infinite',
      },
      keyframes: {
        beacon: {
          '0%': { transform: 'scale(0.95)', opacity: '0.8' },
          '50%': { transform: 'scale(1.08)', opacity: '1' },
          '100%': { transform: 'scale(0.95)', opacity: '0.8' },
        },
      },
    },
  },
  plugins: [],
};
