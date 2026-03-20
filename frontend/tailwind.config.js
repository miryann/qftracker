/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          pink: '#FFB6D9',
          blue: '#A8D8FF',
          orange: '#FFD4A8',
        },
        neutral: {
          'off-white': '#FAFBFF',
          'light-gray': '#F5F7FA',
          'soft-gray': '#E8EEF5',
          'medium-gray': '#7F8C92',
          charcoal: '#2C3E50',
        },
        status: {
          active: '#C8E6C9',
          error: '#FFCDD2',
          warning: '#FFF9C4',
          inactive: '#E8EEF5',
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        sm: '4px',
        base: '8px',
        md: '12px',
        lg: '16px',
      },
      boxShadow: {
        card: '0 2px 8px rgba(0,0,0,0.08)',
        'card-hover': '0 4px 12px rgba(0,0,0,0.12)',
        btn: '0 2px 4px rgba(0,0,0,0.10)',
      },
    },
  },
  plugins: [],
}
