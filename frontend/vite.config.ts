import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig(({ command }) => ({
  plugins: [react(), tailwindcss()],

  // `server.proxy` only affects the Vite dev server (`vite` / `npm run dev`).
  // In production builds, browser requests must be pointed at the real backend URL.
  server:
    command === "serve"
      ? {
          proxy: {
            "/api": {
              target: "http://localhost:3000",
              changeOrigin: true,
              rewrite: (path) => path.replace(/^\/api/, ""),
            },
          },
        }
      : undefined,
}));
