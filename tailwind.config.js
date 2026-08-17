/** @type {import('tailwindcss').Config} */
import PrimeUI from 'tailwindcss-primeui';

module.exports = {
  future: {
    disableLightningcss: true
  },
  content: [
    "./src/**/*.{html,ts,scss}",
  ],
  theme: {
    extend: {
      fontSize: {
        pbutton: 'var(--p-button-sm-font-size)',
      },
    },
  },
  plugins: [PrimeUI],
}