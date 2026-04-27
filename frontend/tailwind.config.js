/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        "strawberry-red": "#FF4D6D",
        "strawberry-pink": "#FFB3C1",
        "strawberry-cream": "#FFF9F2",
        "soft-pink": "#FFECF1",
        "deep-berry": "#590D22",
        "berry-border": "#FFC4D6",
      },
      fontFamily: {
        sans: ["Quicksand", "sans-serif"],
        rounded: ["Quicksand", "sans-serif"],
        script: ["Pacifico", "cursive"],
      },
      borderRadius: {
        "4xl": "2rem",
        "5xl": "3rem",
      },
      boxShadow: {
        "berry": "0 10px 30px -10px rgba(255, 77, 109, 0.2)",
        "berry-hover": "0 20px 40px -15px rgba(255, 77, 109, 0.3)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
