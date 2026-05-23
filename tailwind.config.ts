import type { Config } from "tailwindcss";

function withOpacity(variableName: string): any {
  return ({ opacityValue }: { opacityValue: any }) => {
    if (opacityValue !== undefined && opacityValue !== null) {
      const opacityStr = String(opacityValue).trim();
      
      // If the opacity value is a CSS variable reference (like var(--tw-bg-opacity))
      if (opacityStr.startsWith("var(") || opacityStr.startsWith("--")) {
        return `color-mix(in srgb, var(${variableName}) calc(${opacityStr} * 100%), transparent)`;
      }
      
      // If it contains percentage
      if (opacityStr.includes("%")) {
        return `color-mix(in srgb, var(${variableName}) ${opacityStr}, transparent)`;
      }
      
      // If it is a raw float/decimal string (like 0.8)
      const parsed = parseFloat(opacityStr);
      if (!isNaN(parsed)) {
        return `color-mix(in srgb, var(${variableName}) ${parsed * 100}%, transparent)`;
      }
      
      // General fallback using calc
      return `color-mix(in srgb, var(${variableName}) calc(${opacityStr} * 100%), transparent)`;
    }
    return `var(${variableName})`;
  };
}

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
        background: {
          DEFAULT: withOpacity("--zinc-950"),
          surface: withOpacity("--zinc-900"),
          elevated: withOpacity("--zinc-850"),
        },
        border: {
          DEFAULT: withOpacity("--zinc-800"),
          subtle: withOpacity("--zinc-700"),
        },
        text: {
          primary: withOpacity("--zinc-100"),
          secondary: withOpacity("--zinc-400"),
          muted: withOpacity("--zinc-550"),
        },
        zinc: {
          50: withOpacity("--zinc-50"),
          100: withOpacity("--zinc-100"),
          200: withOpacity("--zinc-200"),
          300: withOpacity("--zinc-300"),
          400: withOpacity("--zinc-400"),
          450: withOpacity("--zinc-450"),
          500: withOpacity("--zinc-500"),
          550: withOpacity("--zinc-550"),
          600: withOpacity("--zinc-600"),
          650: withOpacity("--zinc-650"),
          700: withOpacity("--zinc-700"),
          800: withOpacity("--zinc-800"),
          850: withOpacity("--zinc-850"),
          900: withOpacity("--zinc-900"),
          950: withOpacity("--zinc-950"),
        },
        accent: {
          cyan: {
            DEFAULT: withOpacity("--accent-color"),
            light: withOpacity("--accent-light"),
            dark: withOpacity("--accent-dark"),
          },
          amber: {
            DEFAULT: "#f59e0b",
            light: "#fef3c7",
          },
          purple: {
            DEFAULT: "#6366f1",
          },
          green: {
            DEFAULT: "#10b981",
          },
          red: {
            DEFAULT: "#ef4444",
          },
        },
      },
      fontFamily: {
        display: ["var(--font-syne)", "sans-serif"],
        sans: ["var(--font-instrument-sans)", "sans-serif"],
        mono: ["var(--font-dm-mono)", "monospace"],
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
    },
  },
  plugins: [],
};
export default config;
