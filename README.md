# Workrate Employee Lifecycle — Phase 1 (web)

Next.js + shadcn/ui-style components + Tailwind, wired to Supabase (Postgres + Auth + Storage), deployed on Vercel. This is the Phase 1 prototype described in the *People & Culture App — Architecture Roadmap* doc: https://claude.ai/code/artifact/ce8c6de3-f53f-4224-9c88-750d5992b3df

It runs on **demo data** out of the box (no Supabase project required) so you can see it working immediately, then switches to real data the moment Supabase env vars are set.

## What's here

- `app/(app)/employees` — employee list
- `app/(app)/employees/[id]` — the lifecycle timeline (phase → stage view), matching the Employee Lifecycle product screenshot
- `lib/api/lifecycle.ts` — the **only** place that talks to Supabase; every page calls through here, so swapping to the Laravel API in Phase 2 only touches this file
- `lib/data/demo.ts` — the fallback data used when Supabase env vars aren't set
- `supabase/migrations/` — versioned SQL for the v1 schema (multi-site org structure, employees, the lifecycle phase/stage engine, RLS policies). Tested end-to-end against a local Postgres instance before being committed here.
- Colors/spacing/radius in `tailwind.config.ts` and `app/globals.css` are generated from the **Workrate Design System** artifact — https://claude.ai/artifact/3nFZ8Kjw7szKhrA3AwZUvd — keep them in sync with that artifact rather than hand-editing hex values here.

## Run it locally right now (no accounts needed)

```bash
npm install
npm run dev
```

Open http://localhost:3000 — you'll see the demo employee ("Marcus Reyes") and the full lifecycle timeline, no Supabase project required.

## Steps only you can do (accounts & connecting services)

These need your own logins, so they're not something that can be automated from here:

1. **Create a GitHub repo.** Push this folder to a new repo (e.g. `workrate-pc-web`):
   ```bash
   git init
   git add .
   git commit -m "Initial Employee Lifecycle Phase 1 scaffold"
   git remote add origin <your-new-repo-url>
   git push -u origin main
   ```
2. **Create a Supabase project** at supabase.com — note the project's URL and anon key (Project Settings → API).
3. **Run the migrations against it.** Easiest via the Supabase CLI:
   ```bash
   npx supabase login
   npx supabase link --project-ref <your-project-ref>
   npx supabase db push
   ```
   (This applies every file in `supabase/migrations/` in order, including the RLS policies and the seed data.)
4. **Set local env vars.** Copy `.env.example` to `.env.local` and fill in the URL/anon key from step 2. Restart `npm run dev` — the app will now read the seeded "Marcus Reyes" record from Supabase instead of the local fallback.
5. **Connect Vercel.** Import the GitHub repo at vercel.com/new, add the same two env vars in the Vercel project settings, and deploy. Every PR then gets its own preview URL automatically.
6. **Enable Row Level Security checks.** The migrations already enable RLS with sensible starter policies (self/manager/HR visibility) — once you have real auth users, set `employees.app_role = 'hr_admin'` for HR accounts so they can see everyone.

## What's deliberately not here yet

Per the roadmap doc's confirmed scope: no Attract/recruitment, no Scheduling, Asset Management, Contract Management, or Payroll modules — those are separate modules on Workrate's own roadmap. Auth (Supabase Auth today, dual Entra ID + SAML in-house IDP in Phase 2) isn't wired up yet — every page currently reads without a logged-in user, which is fine for this prototype stage but not for anything with real employee data in it.
