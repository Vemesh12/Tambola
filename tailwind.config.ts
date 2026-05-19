import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        ink: "#161513",
        paper: "#fffaf0",
        saffron: "#f59e0b",
        gulal: "#d946ef",
        mint: "#10b981"
      },
      boxShadow: {
        soft: "0 18px 60px rgba(22, 21, 19, 0.12)"
      }
    }
  },
  plugins: []
};

export default config;
