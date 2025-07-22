import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
      fontFamily: {
        sans: ['var(--font-poppins)'],
        poppins: ['var(--font-poppins)'],
        'dancing-script': ['var(--font-dancing-script)'],
      },
    },
  },
  plugins: [],
} satisfies Config;
