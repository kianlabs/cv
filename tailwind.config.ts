import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "#0b0c0e",
        "ink-card": "#141518",
        "ink-border": "#22242a",
        "ink-hover": "#1a1c20",
      },
      fontFamily: {
        sans: ['var(--font-geist-sans)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-jetbrains-mono)', 'ui-monospace', 'monospace'],
      },
    },
  },
  plugins: [],
};
export default config;
