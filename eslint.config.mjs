import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    // React Compiler rules (new in eslint-plugin-react-hooks 6). The codebase
    // predates them: ~33 existing violations, concentrated in PaymentFlow and
    // TaskDetailClient. Rewriting a payment UI with no UI tests to satisfy a
    // linter is how production breaks, so these are warnings for now and CI
    // caps the warning count (--max-warnings in package.json) — the number can
    // only go down. Fix them a file at a time, then flip these back to "error".
    rules: {
      "react-hooks/set-state-in-effect": "warn",
      "react-hooks/static-components": "warn",
      "react-hooks/refs": "warn",
      "react-hooks/purity": "warn",
      "react-hooks/preserve-manual-memoization": "warn",
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
