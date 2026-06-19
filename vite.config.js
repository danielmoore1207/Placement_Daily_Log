import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:3000",
        changeOrigin: true
      }
    }
  },
  plugins: [
    react(),
    VitePWA({
      strategies: "injectManifest",
      srcDir: "src",
      filename: "sw.js",
      registerType: "autoUpdate",
      includeAssets: ["icon.svg"],
      manifest: {
        name: "Placement Daily Log",
        short_name: "PlacementLog",
        description: "Track placement work daily and pull any day instantly.",
        theme_color: "#09090b",
        background_color: "#09090b",
        display: "standalone",
        scope: "/",
        start_url: "/",
        icons: [
          {
            src: "/icon.svg",
            sizes: "any",
            type: "image/svg+xml"
          }
        ]
      }
    })
  ]
});
