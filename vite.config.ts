import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [
    react()
  ],

  server: {
    proxy: {
      "/api/qz": {
        target: "https://etiquetarivulis.pages.dev",
        changeOrigin: true,
        secure: true
      }
    }
  }
});