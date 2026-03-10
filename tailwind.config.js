/** @type {import('tailwindcss').Config} */
module.exports = {
  theme: {
    extend: {
      colors: {
        /* ── Brand / Primary — Neon Cyan ────────────────── */
        brand: {
          DEFAULT: "#00e5ff",
          hover: "#00b8d4",
          light: "#67ffff",
          dark: "#008ba3",
          muted: "rgba(0, 229, 255, 0.08)",
        },

        /* ── Accent — Hot Pink / Magenta ────────────────── */
        accent: {
          DEFAULT: "#ff0080",
          hover: "#d6006c",
          light: "#ff4da6",
          muted: "rgba(255, 0, 128, 0.08)",
        },

        /* ── Secondary — Electric Violet ────────────────── */
        secondary: {
          DEFAULT: "#7c3aed",
          hover: "#6d28d9",
          light: "#a78bfa",
          muted: "rgba(124, 58, 237, 0.08)",
        },

        /* ── Surfaces ───────────────────────────────────── */
        surface: {
          DEFAULT: "#030712",
          raised: "#0a0f1a",
          overlay: "#111827",
          border: "#1e293b",
          "border-subtle": "#111827",
        },

        /* ── Content / text ─────────────────────────────── */
        content: {
          DEFAULT: "#e2e8f0",
          secondary: "#94a3b8",
          muted: "#475569",
          inverse: "#030712",
        },

        /* ── Danger ─────────────────────────────────────── */
        danger: {
          DEFAULT: "#ff3333",
          hover: "#e60000",
          light: "#ff6666",
          muted: "rgba(255, 51, 51, 0.10)",
        },

        /* ── Success ────────────────────────────────────── */
        success: {
          DEFAULT: "#00ff88",
          light: "#66ffbb",
          muted: "rgba(0, 255, 136, 0.10)",
        },
      },

      boxShadow: {
        glow: "0 0 20px rgba(0, 229, 255, 0.20)",
        "glow-brand": "0 0 40px rgba(0, 229, 255, 0.30)",
        "glow-accent": "0 0 30px rgba(255, 0, 128, 0.25)",
        "glow-secondary": "0 0 20px rgba(124, 58, 237, 0.25)",
        card: "0 4px 24px rgba(0, 0, 0, 0.5)",
        "card-hover": "0 8px 40px rgba(0, 229, 255, 0.12), 0 4px 24px rgba(0, 0, 0, 0.5)",
      },

      borderRadius: {
        xl: "0.875rem",
        "2xl": "1rem",
        "3xl": "1.5rem",
      },

      fontFamily: {
        sans: ["var(--font-geist-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-geist-mono)", "monospace"],
      },

      animation: {
        "pulse-glow": "pulse-glow 3s ease-in-out infinite",
        "gradient-shift": "gradient-shift 8s ease infinite",
      },

      keyframes: {
        "pulse-glow": {
          "0%, 100%": { opacity: "0.4" },
          "50%": { opacity: "1" },
        },
        "gradient-shift": {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
      },
    },
  },
};
