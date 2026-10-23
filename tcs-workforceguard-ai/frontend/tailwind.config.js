/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eff8ff",
          100: "#dbeafe",
          200: "#bfdbfe",
          300: "#93c5fd",
          400: "#60a5fa",
          500: "#0070ad", // TCS signature primary blue
          600: "#005a8c",
          700: "#00476f",
          800: "#003554",
          900: "#05192d",
          950: "#020d18",
        },
        navy: {
          800: "#0d1829",
          850: "#0a1322",
          900: "#060b14",
          950: "#03060b",
        },
      },
    },
  },
  plugins: [],
};
