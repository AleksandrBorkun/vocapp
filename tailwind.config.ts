import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#00030D',
          dark: '#00030D',
          medium: '#0C1526',
          light: '#58748C',
          gray: '#4F6273',
          pale: '#B8CAD9',
        },
      },
    },
  },
  plugins: [],
};
export default config;
