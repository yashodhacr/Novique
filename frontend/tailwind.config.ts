import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Dark-mode-first palette
        ink: "#0a0a0f",
        panel: "#13131a",
        edge: "#23232e",
        muted: "#8b8b9a",
        accent: "#6366f1",
        positive: "#22c55e",
        negative: "#ef4444",
      },
    },
  },
  plugins: [],
};

export default config;
