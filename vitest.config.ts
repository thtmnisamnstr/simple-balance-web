import { defineConfig } from "vitest/config";
import { loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";

/*
 * `.env` and `.env.local`, into `process.env` rather than `import.meta.env`.
 *
 * Next.js loads both for `next build` and `next dev` already; Vite's default
 * behavior is the opposite of that on both counts — it exposes only
 * `VITE_`-prefixed names, and only on `import.meta.env`, never on
 * `process.env`. `src/content/ads.ts` reads `process.env.ADSENSE_CLIENT_ID`
 * directly, the same way `src/server/config.ts` does in the application
 * repository, so without this a build run locally with a real `.env.local`
 * would render the ad unit while the test suite run straight after it, in the
 * same `npm run verify`, saw no configuration at all and failed asking for it.
 * The empty mode string is Vite's own spelling for "the two files that are
 * not specific to a mode", which is what `next build` also does not
 * distinguish between.
 */
Object.assign(process.env, loadEnv("", process.cwd(), ""));

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./tests/support/setup.ts"],
    include: ["tests/**/*.test.{ts,tsx}"],
  },
});
