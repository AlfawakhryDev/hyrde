# Hyrde Arena — iOS app (SwiftUI)

A native iOS app that talks to the **same Supabase Postgres database** as the
web app. It reads the live Arena task feed, lets a Pilot **mount** a task, and
lets a client **post** a task — all real database round-trips.

> These are the Swift source files. Because an `.xcodeproj` can't be generated
> reliably outside Xcode, you create the project once (≈5 min) and drop these
> files in. Everything else is done.

## Prerequisites
- **macOS + Xcode 15+** (free from the Mac App Store)
- A Supabase project with the schema applied — see `../../supabase/README.md`
- For a real device / TestFlight / App Store: a paid **Apple Developer account
  ($99/yr)**. The **Simulator works with no account.**

## Setup (one time)
1. **Create the project:** Xcode → *File → New → Project → iOS → App*.
   - Product Name: `HyrdeArena`
   - Interface: **SwiftUI**, Language: **Swift**
2. **Add the Supabase SDK:** *File → Add Package Dependencies…* and paste
   `https://github.com/supabase/supabase-swift` → Add the **Supabase** product.
3. **Add the source files:** delete the auto-generated `ContentView.swift` and
   the default `…App.swift`, then drag every file from `Sources/` here into the
   project (check *"Copy items if needed"* and your app target).
4. **Add your keys:** copy `Sources/Secrets.example.swift` to a new file
   `Secrets.swift` in the same group and fill in your Supabase **Project URL**
   and **anon key**. (`Secrets.swift` is gitignored.)
5. **Run:** pick an iPhone Simulator and press ▶. You should see the seeded
   tasks load from Postgres. Pull to refresh, open a task, mount it, or post a
   new one — then check the `tasks` / `mounts` tables in Supabase to see the
   rows appear. That's the live database working behind the app.

## What's wired
| Screen | Reads/writes |
|---|---|
| **Arena** | `select` from `tasks` (live feed, pull-to-refresh) |
| **Task detail → Mount** | `insert` into `mounts` |
| **Post** | `insert` into `tasks` |

## Going live on the App Store (later)
1. Set your Team + a unique Bundle ID in *Signing & Capabilities* (needs the
   Apple Developer account).
2. *Product → Archive → Distribute App → TestFlight* for beta testers, then
   submit for App Store review (typically a few days).

## Files
- `HyrdeArenaApp.swift` — app entry + brand colors
- `RootView.swift` — tab bar
- `ArenaFeedView.swift` — live task feed
- `TaskDetailView.swift` — task + mount form
- `PostTaskView.swift` — post a task
- `TaskStore.swift` — async DB calls (the data layer)
- `Models.swift` — Codable rows
- `Supa.swift` — Supabase client
- `Secrets.example.swift` — template for your keys
