import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import { editionCatalog } from "./edition-catalog-plugin.js"

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), editionCatalog()],
  server: {
    host: "127.0.0.1",
    port: 5173,
    strictPort: true,
  },
  preview: {
    host: "127.0.0.1",
    port: 4173,
  },
})
