import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        qisas: {
          // Dark mode (warm/moody)
          dark: {
            bg: "#0f0f0f",
            surface: "#1a1a1a",
            card: "#222222",
            border: "#333333",
            accent: "#d4a574",      // warm gold
            accentDim: "#b8956a",
            text: "#f5f0eb",        // warm cream
            textMuted: "#a09080",
            verse: "#e8c89e",       // golden for Quran text
          },
          // Light mode (serene)
          light: {
            bg: "#faf9f6",
            surface: "#ffffff",
            card: "#f5f3ee",
            border: "#e5e0d8",
            accent: "#4a7c59",      // soft green
            accentDim: "#3d6a4b",
            text: "#2d2d2d",
            textMuted: "#6b6b6b",
            verse: "#3d6a4b",       // green for Quran text
          },
        },
      },
      fontFamily: {
        heading: ["Georgia", "Cambria", "serif"],
        body: ["Inter", "system-ui", "sans-serif"],
        arabic: ["Amiri", "Scheherazade New", "serif"],
      },
      animation: {
        "fade-in": "fadeIn 0.6s ease-out",
        "slide-up": "slideUp 0.5s ease-out",
        "pulse-soft": "pulseSoft 3s ease-in-out infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        pulseSoft: {
          "0%, 100%": { opacity: "0.4" },
          "50%": { opacity: "0.7" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
