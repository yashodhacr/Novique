import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "#07111F",
        secondaryBg: "#101B2D",
        panel: "#17253A",
        edge: "rgba(255,255,255,0.05)",
        muted: "#9AA8BD",
        accent: "#6C63FF",
        tealAccent: "#16C79A",
        goldAccent: "#F6C453",
        positive: "#22C55E",
        warning: "#F59E0B",
        negative: "#EF476F",
        textPrimary: "#F7F9FC",
        textSecondary: "#9AA8BD",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "sans-serif"],
        display: ["var(--font-plus-jakarta)", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
