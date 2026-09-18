import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

// Unit tests for pure logic, co-located with the code under src/. Anything that talks to the network or the
// database is out of scope here; that belongs to suites run against staging.
export default defineConfig({
  resolve: {
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },
  test: {
    include: ["src/**/*.test.ts"],
    environment: "node",
    // src/lib/vetting/interviewer.ts constructs the Anthropic client at import. No unit
    // test calls the API; this only lets the module load where no key exists.
    env: { ANTHROPIC_API_KEY: "unit-tests-never-call-the-api" },
  },
});
