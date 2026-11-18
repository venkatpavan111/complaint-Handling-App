/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0f7ff',
          100: '#e0effe',
          500: '#2563eb',
          600: '#1d4ed8',
          700: '#1e40af',
          900: '#1e3a8a',
        },
        urgency: {
          high: '#dc2626',
          medium: '#d97706',
          low: '#16a34a'
        }
      },
      animation: {
        'strobe': 'strobe 1s infinite alternate',
        'pulse-fast': 'pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        strobe: {
          '0%': { opacity: '1', transform: 'scale(1)' },
          '100%': { opacity: '0.4', transform: 'scale(1.05)' }
        }
      }
    },
  },
  plugins: [],
}
