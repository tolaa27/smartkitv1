import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/engines/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        khmer: ["'Kantumruy Pro'", "'Battambang'", "sans-serif"],
        kantumruy: ["'Kantumruy Pro'", "sans-serif"],
        battambang: ["'Battambang'", "cursive", "sans-serif"],
        display: ["'Fredoka'", "'Kantumruy Pro'", "cursive", "sans-serif"],
      },
      colors: {
        "sun-yellow": {
          DEFAULT: "#FBBF24",
          hover: "#F59E0B",
          dark: "#D97706",
        },
        "sky-blue": {
          DEFAULT: "#38BDF8",
          hover: "#0EA5E9",
          dark: "#0284C7",
        },
        "grass-green": {
          DEFAULT: "#4ADE80",
          hover: "#22C55E",
          dark: "#16A34A",
        },
        "coral-red": {
          DEFAULT: "#F87171",
          hover: "#EF4444",
          dark: "#DC2626",
        },
        "lavender-purple": "#C084FC",
        chalkboard: "#1E293B",
        "cream-bg": "#FFFDF7",
      },
    },
  },
  plugins: [],
};

export default config;
