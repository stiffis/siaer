/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        space: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
          950: '#020617',
        },
        orbit: {
          green: '#10b981',
          blue: '#3b82f6',
          red: '#ef4444',
          yellow: '#f59e0b',
          purple: '#8b5cf6',
        }
      },
      animation: {
        'spin-slow': 'spin 3s linear infinite',
        'pulse-glow': 'pulse 2s infinite',
        'satellite-orbit': 'spin 10s linear infinite',
      },
      boxShadow: {
        'glow-blue': '0 0 20px rgba(59, 130, 246, 0.5)',
        'glow-green': '0 0 20px rgba(16, 185, 129, 0.5)',
        'glow-red': '0 0 20px rgba(239, 68, 68, 0.5)',
      }
    },
  },
  plugins: [],
};
