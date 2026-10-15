import { defineConfig } from "vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  // Production is served from the custom domain root (https://incentify.in/).
  // Do not prefix assets or routes with the GitHub repository name.
  base: "/",
  resolve: {
    tsconfigPaths: true,
  },
  server: {
    port: 3000,
  },
  plugins: [
    tailwindcss(),
    tanstackStart({
      prerender: {
        enabled: true,
        autoSubfolderIndex: true,
        autoStaticPathsDiscovery: true,
        crawlLinks: true,
        concurrency: 8,
        retryCount: 2,
        retryDelay: 500,
        failOnError: true,
      },
    }),
    viteReact(),
  ],
});
