import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "#050816",
        secondaryBg: "#0B1220",
        panel: "#111827",
        edge: "rgba(255,255,255,0.05)",
        muted: "#94A3B8",
        accent: "#6D5DF6",
        tealAccent: "#14B8A6",
        goldAccent: "#F4B740",
        positive: "#10B981",
        warning: "#F59E0B",
        negative: "#F43F5E",
        textPrimary: "#F8FAFC",
        textSecondary: "#94A3B8",
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
