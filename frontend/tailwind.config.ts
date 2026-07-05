import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "#070711",
        panel: "#0F101A",
        panelSecondary: "#161A2A",
        edge: "rgba(255,255,255,0.06)",
        muted: "#94A3B8",
        accent: "#8B5CF6",
        cyanAccent: "#22D3EE",
        positive: "#34D399",
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
