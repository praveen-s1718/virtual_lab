/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // Primary brand colors
        "primary":                    "#2ff5ff",
        "on-primary":                 "#003739",
        "primary-container":          "#00d8e0",
        "on-primary-container":       "#00595d",
        "primary-fixed":              "#63f7ff",
        "primary-fixed-dim":          "#00dce5",
        "on-primary-fixed":           "#002021",
        "on-primary-fixed-variant":   "#004f53",
        "inverse-primary":            "#00696e",
        // Secondary
        "secondary":                  "#fff3d2",
        "on-secondary":               "#3a3000",
        "secondary-container":        "#fdd400",
        "on-secondary-container":     "#6f5c00",
        "secondary-fixed":            "#ffe170",
        "secondary-fixed-dim":        "#e9c400",
        "on-secondary-fixed":         "#221b00",
        "on-secondary-fixed-variant": "#544600",
        // Tertiary
        "tertiary":                   "#ffd5cb",
        "on-tertiary":                "#621100",
        "tertiary-container":         "#ffaf9b",
        "on-tertiary-container":      "#9a2100",
        "tertiary-fixed":             "#ffdad2",
        "tertiary-fixed-dim":         "#ffb4a2",
        "on-tertiary-fixed":          "#3c0700",
        "on-tertiary-fixed-variant":  "#8a1d00",
        // Surface
        "surface":                    "#131313",
        "surface-dim":                "#131313",
        "surface-bright":             "#3a3939",
        "surface-variant":            "#353534",
        "surface-tint":               "#00dce5",
        "surface-container-lowest":   "#0e0e0e",
        "surface-container-low":      "#1c1b1b",
        "surface-container":          "#201f1f",
        "surface-container-high":     "#2a2a2a",
        "surface-container-highest":  "#353534",
        "inverse-surface":            "#e5e2e1",
        "inverse-on-surface":         "#313030",
        // On-Surface
        "on-surface":                 "#e5e2e1",
        "on-surface-variant":         "#bbc9cf",
        "on-background":              "#e5e2e1",
        // Background
        "background":                 "#131313",
        // Outline
        "outline":                    "#859398",
        "outline-variant":            "#3c494e",
        // Error
        "error":                      "#ffb4ab",
        "on-error":                   "#690005",
        "error-container":            "#93000a",
        "on-error-container":         "#ffdad6",
      },
      borderRadius: {
        DEFAULT: "0.125rem",
        sm:      "0.125rem",
        lg:      "0.25rem",
        xl:      "0.5rem",
        "2xl":   "0.75rem",
        full:    "9999px",
      },
      fontFamily: {
        headline: ["Space Grotesk", "sans-serif"],
        body:     ["Inter", "sans-serif"],
        label:    ["Space Grotesk", "sans-serif"],
      },
      animation: {
        "spin-slow":    "spin 3s linear infinite",
        "spin-reverse": "spin 2s linear infinite reverse",
        "pulse-soft":   "pulse 2s ease-in-out infinite",
      },
      boxShadow: {
        "glow-primary":
          "0 0 15px rgba(47, 245, 255, 0.2), 0 0 40px rgba(47, 245, 255, 0.08)",
        "glow-tertiary":
          "0 0 15px rgba(255, 213, 203, 0.2)",
        "panel":
          "0 8px 32px rgba(0,0,0,0.6)",
      },
    },
  },
  plugins: [],
}
