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
        ekush: {
          orange: "#F27023",
          "orange-dark": "#e85d04",
          "orange-light": "#ffcfb2",
        },
      },
    },
  },
  plugins: [],
};

export default config;
