import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#FAFAF8",
        foreground: "#171717",
        swiggy: {
          orange: "#FC8019",
          hover: "#E57315",
          light: "#FFF5EE",
          soft: "#FFEAD9",
          dark: "#C45D0B",
        },
        charcoal: {
          DEFAULT: "#171717",
          50: "#FAFAFA",
          100: "#F5F5F5",
          200: "#E5E5E5",
          300: "#D4D4D4",
          400: "#A3A3A3",
          500: "#737373",
          600: "#525252",
          700: "#404040",
          800: "#262626",
          900: "#171717",
        },
        veg: {
          DEFAULT: "#00A343",
          light: "#E8F8EE",
          dark: "#057A33",
        },
        nonveg: {
          DEFAULT: "#DC2626",
          light: "#FEF2F2",
          dark: "#991B1B",
        },
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "system-ui", "-apple-system", "sans-serif"],
      },
      boxShadow: {
        card: "0 4px 20px -2px rgba(0, 0, 0, 0.05), 0 1px 3px 0 rgba(0, 0, 0, 0.02)",
        "card-hover": "0 14px 30px -4px rgba(0, 0, 0, 0.1), 0 6px 12px -2px rgba(0, 0, 0, 0.04)",
        bento: "0 10px 30px -4px rgba(0, 0, 0, 0.06)",
        highlight: "0 0 0 1px rgba(252, 128, 25, 0.2), 0 10px 30px -4px rgba(252, 128, 25, 0.15)",
        glass: "0 8px 32px 0 rgba(31, 38, 135, 0.07)",
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.5rem",
        "4xl": "2rem",
      },
    },
  },
  plugins: [],
} satisfies Config;
