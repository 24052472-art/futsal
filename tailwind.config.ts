import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        display: ["Outfit", "Inter", "sans-serif"],
      },
      colors: {
        primary: { DEFAULT: "#6366f1", dark: "#4f46e5", light: "#818cf8" },
        accent: { DEFAULT: "#10b981", dark: "#059669" },
      },
    },
  },
  plugins: [],
};

export default config;
