/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#222831',
        teal: '#1DA0A8',
        deepteal: '#0C4F54',
        sand: '#E3D7C0',
        cream: '#F6F0E4',
      },
    },
  },
  plugins: [],
};
