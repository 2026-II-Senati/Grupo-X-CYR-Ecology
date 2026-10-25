import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      // Esto engaña a html2pdf para que use la versión PRO
      html2canvas: "html2canvas-pro",
    },
  },
});
