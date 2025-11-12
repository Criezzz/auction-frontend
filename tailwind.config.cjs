/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        retro: {
          paper: '#f5efe6',
          ink: '#2b2b2b',
          tea: '#7aa2a6',
          coral: '#e26d5c',
          mustard: '#e4b363',
          olive: '#607466',
          violet: '#826aaf'
        }
      },
      fontFamily: {
        display: ['ui-rounded','system-ui','Avenir','Segoe UI','Helvetica','Arial','sans-serif'],
        mono: ['ui-monospace','SFMono-Regular','Menlo','monospace']
      },
      boxShadow: {
        soft: '0 8px 0 0 rgba(0,0,0,0.12)',
        retro: '6px 6px 0 0 rgba(0,0,0,0.2)'
      },
      borderRadius: {
        '2xl': '1.25rem'
      },
      transitionTimingFunction: {
        snappy: 'cubic-bezier(.2,.8,.2,1)'
      }
    },
  },
  plugins: [],
}
