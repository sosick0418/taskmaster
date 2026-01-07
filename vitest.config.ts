import { defineConfig } from "vitest/config"
import react from "@vitejs/plugin-react"
import path from "path"

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "happy-dom",
    globals: true,
    setupFiles: ["./vitest.setup.tsx"],
    include: ["**/*.test.{ts,tsx}"],
    exclude: ["node_modules", ".next"],
    coverage: {
      reporter: ["text", "json", "html"],
      exclude: ["node_modules", ".next", "**/*.d.ts", "**/*.config.*"],
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./"),
      // Fix for next-auth v5 + vitest module resolution
      "next/server": path.resolve(__dirname, "./node_modules/next/dist/server/web/exports/index.js"),
      "next/server.js": path.resolve(__dirname, "./node_modules/next/dist/server/web/exports/index.js"),
    },
  },
})
