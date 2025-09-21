/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Catppuccin Macchiato Color Palette (matching Agent TRADR style)
        ctp: {
          // Core backgrounds
          base: '#24273a',
          mantle: '#1e2030',
          crust: '#181926',
          surface0: '#363a4f',
          surface1: '#494d64',
          surface2: '#5b6078',

          // Brand colors (official Catppuccin Macchiato)
          rosewater: '#f4dbd6',
          flamingo: '#f0c6c6',
          pink: '#f5bde6',
          mauve: '#c6a0f6',
          red: '#ed8796',
          maroon: '#ee99a0',
          peach: '#f5a97f',
          yellow: '#eed49f',
          green: '#a6da95',
          teal: '#8bd5ca',
          sky: '#91d7e3',
          sapphire: '#7dc4e4',
          blue: '#8aadf4',
          lavender: '#b7bdf8',

          // Text hierarchy
          text: '#cad3f5',
          subtext1: '#b8c0e0',
          subtext0: '#a5adcb',
          overlay2: '#939ab7',
          overlay1: '#8087a2',
          overlay0: '#6e738d',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'primary-gradient': 'linear-gradient(135deg, var(--tw-colors-ctp-mauve), var(--tw-colors-ctp-blue))',
        'surface-gradient': 'linear-gradient(135deg, var(--tw-colors-ctp-surface0), var(--tw-colors-ctp-surface1))',
      },
      boxShadow: {
        'glow': '0 0 20px rgba(203, 166, 247, 0.3)',
        'glow-blue': '0 0 20px rgba(137, 180, 250, 0.3)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'pulse-slow': 'pulse 3s infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}