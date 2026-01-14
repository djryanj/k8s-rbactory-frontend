// tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class", // Enable class-based dark mode
  theme: {
    extend: {
      colors: {
        k8s: {
          blue: "#326CE5",
          lightblue: "#5B9BD5",
          darkblue: "#1E4D8B",
        },
      },
      backgroundColor: {
        "dark-primary": "#0f172a",
        "dark-secondary": "#1e293b",
        "dark-tertiary": "#334155",
      },
      textColor: {
        "dark-primary": "#f1f5f9",
        "dark-secondary": "#cbd5e1",
        "dark-tertiary": "#94a3b8",
      },
    },
  },
  plugins: [],
};
