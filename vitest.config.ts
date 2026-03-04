import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    // Default to node; RTL test files opt into jsdom via @vitest-environment jsdom pragma
    environment: "node",
    globals: true,
    setupFiles: ["./vitest.setup.ts"],
    environmentOptions: {
      jsdom: {},
    },
    exclude: ["**/node_modules/**", "**/e2e/**"],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
