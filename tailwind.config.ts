import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        ice: {
          50: "#F0FBFF",
          100: "#E0F5FE",
          200: "#BAE6FD",
          300: "#93D8FB",
          400: "#7DD3FC",
          500: "#5EC8F2",
          600: "#38AEDE",
          700: "#2389B8",
          800: "#1B6C8F",
          900: "#154F69",
        },
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(94, 200, 242, 0.15), 0 0 24px rgba(94, 200, 242, 0.18)",
        "glow-lg": "0 0 0 1px rgba(94, 200, 242, 0.2), 0 8px 40px rgba(94, 200, 242, 0.25)",
      },
    },
  },
  plugins: [],
};
export default config;
