export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          teal: "#0f766e",
          cyan: "#0891b2",
          sky: "#0ea5e9",
          blue: "#2563eb",
          indigo: "#4f46e5",
        },
        surface: {
          soft: "#eef2ff",
          mint: "#ecfdf5",
          card: "#ffffff",
          border: "#bfdbfe",
        },
      },
      borderRadius: {
        panel: "20px",
        card: "16px",
      },
      boxShadow: {
        panel: "0 24px 60px rgba(15, 23, 42, 0.18)",
      },
      backgroundImage: {
        "app-gradient":
          "linear-gradient(135deg, #e0f2fe 0%, #eef2ff 45%, #ecfdf5 100%)",
        "hero-gradient":
          "linear-gradient(120deg, #0f766e 0%, #0891b2 40%, #2563eb 70%, #4f46e5 100%)",
        "radial-brand":
          "radial-gradient(circle at 12% 18%, #d1fae5 0%, #dbeafe 34%, #e9d5ff 68%, #cffafe 100%)",
      },
    },
  },
  plugins: [],
};
