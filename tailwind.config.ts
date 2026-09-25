import type { Config } from "tailwindcss";

// Colors, radii and font sizes below are pulled directly from the
// Workrate Design System artifact (tokens.json). Keep this file in sync
// with that artifact rather than editing values ad hoc here.
const config: Config = {
  darkMode: ["class"],
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        navy: "hsl(var(--navy))",
        brand: {
          DEFAULT: "hsl(var(--brand))",
          hover: "hsl(var(--brand-hover))",
        },
        border: "hsl(var(--border))",
        ink: {
          DEFAULT: "hsl(var(--ink))",
          muted: "hsl(var(--ink-muted))",
        },
        surface: {
          page: "hsl(var(--surface-page))",
          card: "hsl(var(--surface-card))",
          sunken: "hsl(var(--surface-sunken))",
        },
        success: {
          DEFAULT: "hsl(var(--success))",
          surface: "hsl(var(--success-surface))",
        },
        warning: {
          DEFAULT: "hsl(var(--warning))",
          surface: "hsl(var(--warning-surface))",
        },
        danger: {
          DEFAULT: "hsl(var(--danger))",
          surface: "hsl(var(--danger-surface))",
        },
        info: {
          DEFAULT: "hsl(var(--info))",
          surface: "hsl(var(--info-surface))",
        },
        "neutral-phase": "hsl(var(--neutral-phase))",
      },
      borderRadius: {
        sm: "var(--radius-sm)",
        md: "var(--radius-md)",
        lg: "var(--radius-lg)",
      },
      spacing: {
        "space-2": "var(--space-2)",
        "space-4": "var(--space-4)",
        "space-6": "var(--space-6)",
        "space-8": "var(--space-8)",
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "-apple-system", "Segoe UI", "sans-serif"],
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
