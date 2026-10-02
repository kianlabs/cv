import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
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
      keyframes: {
        'glitch-slice': {
          '0%': { clipPath: 'inset(0 0 88% 0)', transform: 'translate(-5px,0)' },
          '15%': { clipPath: 'inset(58% 0 22% 0)', transform: 'translate(6px,0)' },
          '30%': { clipPath: 'inset(28% 0 58% 0)', transform: 'translate(-7px,0)' },
          '45%': { clipPath: 'inset(72% 0 6% 0)', transform: 'translate(5px,0)' },
          '60%': { clipPath: 'inset(12% 0 68% 0)', transform: 'translate(-4px,0)' },
          '80%': { clipPath: 'inset(42% 0 38% 0)', transform: 'translate(3px,0)' },
          '100%': { clipPath: 'inset(0 0 0 0)', transform: 'translate(0,0)' },
        },
        'glitch-slice-2': {
          '0%': { clipPath: 'inset(70% 0 12% 0)', transform: 'translate(7px,0)' },
          '25%': { clipPath: 'inset(18% 0 66% 0)', transform: 'translate(-6px,0)' },
          '50%': { clipPath: 'inset(48% 0 34% 0)', transform: 'translate(5px,0)' },
          '75%': { clipPath: 'inset(6% 0 78% 0)', transform: 'translate(-5px,0)' },
          '100%': { clipPath: 'inset(0 0 0 0)', transform: 'translate(0,0)' },
        },
        'glitch-shift': {
          '0%, 100%': { transform: 'translate(0,0)' },
          '20%': { transform: 'translate(-2px,1px)' },
          '40%': { transform: 'translate(2px,-1px)' },
          '60%': { transform: 'translate(-1px,-2px)' },
          '80%': { transform: 'translate(1px,1px)' },
        },
        'glitch-scan': {
          '0%': { backgroundPosition: '0 0' },
          '100%': { backgroundPosition: '0 40px' },
        },
      },
      animation: {
        'glitch-slice': 'glitch-slice 0.6s steps(7) both',
        'glitch-slice-2': 'glitch-slice-2 0.6s steps(5) both',
        'glitch-shift': 'glitch-shift 0.6s steps(4) both',
        'glitch-scan': 'glitch-scan 0.35s linear infinite',
      },
    },
  },
  plugins: [],
};
export default config;
