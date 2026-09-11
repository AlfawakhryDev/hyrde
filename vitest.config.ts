import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

// Unit tests for pure logic in lib/. Anything that talks to the network or the
// database is out of scope here; that belongs to suites run against staging.
export default defineConfig({
  resolve: {
    alias: { "@": fileURLToPath(new URL(".", import.meta.url)) },
  },
  test: {
    include: ["lib/**/*.test.ts"],
    environment: "node",
    // lib/interviewer.ts constructs the Anthropic client at import. No unit
    // test calls the API; this only lets the module load where no key exists.
    env: { ANTHROPIC_API_KEY: "unit-tests-never-call-the-api" },
  },
});
