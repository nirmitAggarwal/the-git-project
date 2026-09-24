/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        github: {
          dark: '#0d1117',
          surface: '#161b22',
          border: '#30363d',
          card: '#1f242c',
          subtle: '#21262d',
          text: '#c9d1d9',
          muted: '#8b949e',
          accent: '#238636',
          accentHover: '#2ea043',
          blue: '#58a6ff',
          purple: '#bc8cff',
          orange: '#f0883e',
          red: '#f85149',
          yellow: '#d29922',
        }
      },
      fontFamily: {
        mono: ['"JetBrains Mono"', 'Menlo', 'Monaco', 'Consolas', '"Liberation Mono"', '"Courier New"', 'monospace'],
        sans: ['-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'Helvetica', 'Arial', 'sans-serif'],
      },
      boxShadow: {
        'glow-green': '0 0 15px rgba(35, 134, 54, 0.4)',
        'glow-blue': '0 0 15px rgba(88, 166, 255, 0.3)',
        'glow-purple': '0 0 15px rgba(188, 140, 255, 0.3)',
        'glow-yellow': '0 0 15px rgba(210, 153, 34, 0.45)',
      }
    },
  },
  plugins: [],
}
