// ─────────────────────────────────────────────────────────────────────────
// SETUP: copy this file to `Secrets.swift` (same folder) and fill in the two
// values from Supabase → Project Settings → API.
//
//   • Project URL   → supabaseURL
//   • anon / public key → supabaseAnonKey   (this key is SAFE to ship in a
//     client app — it's protected by Row Level Security. Never put the
//     `service_role` key in the app.)
//
// `Secrets.swift` is gitignored so your project values are not committed.
// ─────────────────────────────────────────────────────────────────────────
enum Secrets {
    static let supabaseURL = "https://YOUR-PROJECT-REF.supabase.co"
    static let supabaseAnonKey = "YOUR-ANON-PUBLIC-KEY"
}
