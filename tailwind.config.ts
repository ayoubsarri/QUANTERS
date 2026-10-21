import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: "#F4F7FB",
        skysoft: "#EBF3FC",
        skypill: "#E0F0FF",
        skyborder: "#E2EDF8",
        vox: {
          yellow: "#FFE500",
          ink: "#111111",
          paper: "#F8F7F4",
          cyan: "#00D2FF",
        },
        quanta: {
          deep: "#094C9C",
          mid: "#1A7EC2",
          cyan: "#30C5F7",
          ice: "#87D9F8",
          royal: "#1D63EB",
          cobalt: "#061E47",
          cosmic: "#041226",
          green: "#80C342",
          coral: "#ED1C24",
          amber: "#FBB03B",
        },
      },
      fontFamily: {
        display: ["var(--font-outfit)", "var(--font-display)", "var(--font-jakarta)", "sans-serif"],
        syne: ["var(--font-syne)", "var(--font-outfit)", "sans-serif"],
        sans: ["var(--font-jakarta)", "var(--font-outfit)", "system-ui", "sans-serif"],
        serif: ["var(--font-serif)", "Georgia", "serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
        script: ["var(--font-caveat)", "cursive"],
      },
      boxShadow: {
        card: "0 6px 20px -4px rgba(9, 25, 47, 0.06), 0 2px 6px -1px rgba(9, 25, 47, 0.04)",
        hero: "0 16px 38px -8px rgba(6, 30, 71, 0.42)",
        nav: "0 16px 42px -6px rgba(6, 30, 71, 0.18), 0 4px 14px rgba(6, 30, 71, 0.08)",
        glow: "0 0 28px rgba(41, 210, 255, 0.48)",
        vox: "4px 4px 0px #09192F",
      },
    },
  },
  plugins: [],
};

export default config;
