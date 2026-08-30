import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

// Mirror the tsconfig `@/*` → `./*` alias so tests resolve `@/…` imports the
// same way Next does. Without this, importing a module that uses `@/…` fails
// only under vitest, not under the app build.
export default defineConfig({
  resolve: {
    alias: { "@": fileURLToPath(new URL(".", import.meta.url)) },
  },
});
