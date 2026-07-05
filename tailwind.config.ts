import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "1.25rem",
      screens: { "2xl": "1360px" },
    },
    extend: {
      colors: {
        // Brand palette (static)
        ink: "#0a0a0a",
        paper: "#f5f2eb",
        cream: "#ede9de",
        lime: { DEFAULT: "#c8f23a", dark: "#a8d020", bright: "#dffb50" },
        muted: "#6b6560",
        // Theme-aware semantic tokens (light/dark via CSS vars)
        bg: "var(--bg)",
        surface: "var(--surface)",
        "surface-2": "var(--surface-2)",
        line: "var(--line)",
        content: "var(--content)",
        "content-muted": "var(--content-muted)",
        // Status colors (debt / stock / etc.)
        success: "#16a34a",
        warning: "#d97706",
        danger: "#dc2626",
        info: "#2563eb",
      },
      fontFamily: {
        display: ["Syne", "sans-serif"],
        sans: ['"DM Sans"', "system-ui", "sans-serif"],
      },
      borderRadius: {
        xl: "0.9rem",
        "2xl": "1.1rem",
      },
      boxShadow: {
        soft: "0 1px 2px rgba(10,10,10,0.04), 0 4px 16px rgba(10,10,10,0.05)",
        card: "0 1px 3px rgba(10,10,10,0.06)",
      },
      keyframes: {
        "fade-up": {
          from: { opacity: "0", transform: "translateY(8px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.4s cubic-bezier(0.16,1,0.3,1) both",
      },
    },
  },
  plugins: [],
};
export default config;
