/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{vue,js,ts,jsx,tsx}', './public/index.html'],
  theme: {
    extend: {
      colors: {
        primary: 'var(--el-color-primary)',
        noSelect: '#D2D2D2',
        normal: '#666666',
      },
      width: {
        siderbarWidth: '210px',
        navbarWidth: 'calc(100vw - 210px)',
      },
      height: {
        navbarHeight: '75px',
      },
      margin: {
        mainLeft: '210px',
        mainTop: '75px',
      },
    },
  },
  plugins: [],
}
