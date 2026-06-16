export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        navy: {
          950: "#121f2c",
          900: "#1e2d3d",
          800: "#243447",
          700: "#2d3f52",
          600: "#3a5066",
        },
        ultratech: {
          amber: "#f59e0b",
          orange: "#ea580c",
          red: "#b91c1c",
        }
      },
      boxShadow: {
        soft: "0 10px 30px rgba(15, 23, 42, 0.08)",
        panel: "0 1px 2px rgba(15, 23, 42, 0.04), 0 12px 28px rgba(15, 23, 42, 0.07)",
      }
    }
  },
  plugins: []
}
