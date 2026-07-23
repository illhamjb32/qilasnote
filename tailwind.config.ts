import type { Config } from "tailwindcss";

export default {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        "on-tertiary": "#ffffff",
        "secondary-container": "#ffd1dc",
        "outline": "#71787e",
        "on-primary": "#ffffff",
        "background": "#f9f9f9",
        "primary-container": "#a5d8ff",
        "primary-fixed-dim": "#9accf3",
        "surface-container": "#eeeeee",
        "surface-dim": "#dadada",
        "inverse-surface": "#2f3131",
        "surface-container-highest": "#e2e2e2",
        "primary-fixed": "#c9e6ff",
        "inverse-primary": "#9accf3",
        "surface-bright": "#f9f9f9",
        "secondary": "#78555e",
        "secondary-fixed": "#ffd9e2",
        "on-primary-fixed": "#001e2f",
        "on-primary-fixed-variant": "#0c4b6c",
        "primary": "#2e6385",
        "surface-variant": "#e2e2e2",
        "tertiary": "#665f36",
        "on-primary-container": "#285f80",
        "secondary-fixed-dim": "#e7bbc6",
        "on-surface": "#1a1c1c",
        "on-error": "#ffffff",
        "tertiary-fixed-dim": "#d2c796",
        "surface-container-lowest": "#ffffff",
        "on-tertiary-fixed": "#211c00",
        "surface-tint": "#2e6385",
        "tertiary-container": "#ddd2a0",
        "surface": "#f9f9f9",
        "on-surface-variant": "#41484d",
        "outline-variant": "#c1c7ce",
        "error": "#ba1a1a",
        "on-error-container": "#93000a",
        "error-container": "#ffdad6",
        "surface-container-low": "#f3f3f3",
        "surface-container-high": "#e8e8e8",
        "on-secondary": "#ffffff",
        "on-secondary-container": "#7a5761",
        "on-tertiary-container": "#625a32",
        "on-secondary-fixed": "#2d141c",
        "on-secondary-fixed-variant": "#5e3e47",
        "tertiary-fixed": "#efe3b0",
        "on-background": "#1a1c1c",
        "inverse-on-surface": "#f0f1f1"
      },
      fontFamily: {
        quicksand: ["Quicksand", "sans-serif"],
        "headline-lg-mobile": ["Quicksand"],
        "display-ml": ["Quicksand"],
        "label-sm": ["Quicksand"],
        "body-md": ["Quicksand"],
        "headline-lg": ["Quicksand"]
      },
      fontSize: {
        "headline-lg-mobile": ["20px", { lineHeight: "28px", fontWeight: "700" }],
        "display-ml": ["48px", { lineHeight: "56px", letterSpacing: "-1px", fontWeight: "700" }],
        "label-sm": ["13px", { lineHeight: "16px", letterSpacing: "0.5px", fontWeight: "600" }],
        "body-md": ["16px", { lineHeight: "24px", fontWeight: "500" }],
        "headline-lg": ["24px", { lineHeight: "32px", fontWeight: "700" }]
      },
      spacing: {
        "base": "8px",
        "container-padding": "24px",
        "element-gap": "16px",
        "section-margin": "32px"
      },
      borderRadius: {
        "sm": "0.5rem",
        "DEFAULT": "1rem",
        "md": "1.5rem",
        "lg": "2rem",
        "xl": "3rem",
        "full": "9999px"
      },
      boxShadow: {
        "soft": "0 4px 20px 0 rgba(0, 0, 0, 0.04)"
      },
      animation: {
        'pulse': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      transitionDuration: {
        '150': '150ms',
        '200': '200ms',
        '300': '300ms',
        '500': '500ms',
        '700': '700ms',
      }
    },
  },
  plugins: [],
} satisfies Config;
