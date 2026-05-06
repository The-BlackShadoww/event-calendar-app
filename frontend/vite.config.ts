import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
    plugins: [react(), tailwindcss()],

    server: {
        proxy: {
            // Any request starting with /api will be intercepted by this proxy rule
            "/api": {
                // Forward the request to your NestJS backend
                target: "http://localhost:3000",

                // Needed when the target is https. For local http dev this doesn't
                // matter much, but it's good practice to include it
                changeOrigin: true,

                // Strip the /api prefix before forwarding to NestJS.
                // Your NestJS routes are /events, not /api/events.
                // So /api/events → becomes → /events when it hits NestJS.
                rewrite: (path) => path.replace(/^\/api/, ""),
            },
        },
    },
});
