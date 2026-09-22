/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#12161B',
        steel: '#66727F',
        mist: '#E9EDF0',
        line: '#D9E0E5',
        petrol: { DEFAULT: '#0E5C58', dark: '#0A4340', light: '#E2EFEE' },
        signal: { DEFAULT: '#E08A1E', light: '#FDF1DF' },
        alert: { DEFAULT: '#C4402C', light: '#FBE9E6' },
        go: { DEFAULT: '#2E8B57', light: '#E6F3EB' },
      },
      fontWeight: { '500': '500', '600': '600', '700': '700' },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['"Barlow Condensed"', 'Inter', 'sans-serif'],
      },
      borderRadius: { xl: '0.875rem', '2xl': '1.25rem' },
      boxShadow: { panel: '0 1px 2px rgba(18,22,27,.06), 0 8px 24px -16px rgba(18,22,27,.25)' },
    },
  },
  plugins: [],
};
