/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        navy: {
          950: '#0a0e1a',
          900: '#111827',
          800: '#1a1f35',
          700: '#1e293b',
          600: '#2a3050',
        },
        anthropic: '#D4A574',
        openai: '#10B981',
        google: '#4285F4',
        xai: '#EF4444',
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'monospace'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
