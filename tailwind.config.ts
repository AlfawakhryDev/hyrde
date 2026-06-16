import type { Config } from "tailwindcss";

// Tailwind v4 — all theme tokens live in globals.css @theme {}
// This file is kept minimal to avoid conflicts with the CSS-first config.
const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
};
export default config;
