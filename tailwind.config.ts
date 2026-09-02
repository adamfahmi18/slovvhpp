import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/**/*.{ts,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "1rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        heading: ["var(--font-geist-sans, ui-sans-serif)", "system-ui", "sans-serif"],
        sans: ["var(--font-inter, ui-sans-serif)", "system-ui", "sans-serif"],
      },
      colors: {
        background: "#FAFAF9",
        surface: "#FFFFFF",
        border: "#E7E5E4",
        input: "#E7E5E4",
        ring: "#0C0A09",
        foreground: "#0C0A09",
        muted: {
          DEFAULT: "#F5F5F4",
          foreground: "#57534E",
        },
        accent: {
          DEFAULT: "#78716C",
          foreground: "#FFFFFF",
        },
        primary: {
          DEFAULT: "#0C0A09",
          foreground: "#FAFAF9",
        },
        secondary: {
          DEFAULT: "#57534E",
          foreground: "#FFFFFF",
        },
        success: {
          DEFAULT: "#16A34A",
          foreground: "#FFFFFF",
          soft: "#F0FDF4",
        },
        warning: {
          DEFAULT: "#D97706",
          foreground: "#FFFFFF",
          soft: "#FFFBEB",
        },
        destructive: {
          DEFAULT: "#DC2626",
          foreground: "#FFFFFF",
          soft: "#FEF2F2",
        },
        card: {
          DEFAULT: "#FFFFFF",
          foreground: "#0C0A09",
        },
        popover: {
          DEFAULT: "#FFFFFF",
          foreground: "#0C0A09",
        },
      },
      borderRadius: {
        lg: "10px",
        md: "8px",
        sm: "6px",
        xl: "14px",
      },
      boxShadow: {
        subtle: "0 1px 2px 0 rgb(12 10 9 / 0.04)",
        card: "0 1px 3px 0 rgb(12 10 9 / 0.06), 0 1px 2px -1px rgb(12 10 9 / 0.06)",
        popover: "0 4px 16px -4px rgb(12 10 9 / 0.12), 0 2px 6px -2px rgb(12 10 9 / 0.08)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        shimmer: "shimmer 1.8s linear infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
