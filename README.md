# Placement Daily Log

This repository now contains:

- A legacy Python CLI logger (`daily_log.py`) you can still run locally.
- A new React + Vite PWA for iPhone/desktop use with Supabase sync and fast day-by-day retrieval.

## PWA stack

- React + Vite + React Router
- Tailwind CSS
- `vite-plugin-pwa` (installable app + service worker)
- Supabase Auth + Postgres + Storage
- Vercel deployment

## Setup (PWA)

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create `.env` from `.env.example` and fill values:

   ```bash
   copy .env.example .env
   ```

3. Add env vars:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `SUPABASE_ANON_KEY`

4. Apply SQL migration in your Supabase project:
   - `supabase/migrations/20260616182000_create_daily_logs.sql`

5. Run the app:

   ```bash
   npm run dev
   ```

   This starts both Vite and local Vercel API routes for full app behavior in development.
   If prompted on first run, complete `vercel login` once so local `/api/*` routes can run.

## Usage (PWA)

- Sign up/sign in in the `Profile` tab.
- Create or update an entry in `New Log`.
- Pull any saved day instantly in the `Pull Log` tab.
- Review monthly grouped history in `History`.

## Deploy (Vercel + GitHub)

1. Push this folder to a GitHub repository.
2. Import the repository into Vercel.
3. Set the same four env vars in Vercel project settings.
4. Deploy.
5. Open from iPhone Safari and use Add to Home Screen.

### Detailed publish checklist

1. In Supabase:
   - Create project.
   - Run SQL in `supabase/migrations/20260616182000_create_daily_logs.sql`.
   - In Auth settings, enable email/password sign-in.
2. In local project:
   - `copy .env.example .env`
   - Fill all four env vars.
   - `npm install`
   - `npm run build` (must pass before publish)
3. In GitHub:
   - Create new repository (for example `placement-daily-log-pwa`).
   - Push this project to `main`.
4. In Vercel:
   - Import the GitHub repo.
   - Framework preset: `Vite`.
   - Add env vars for both Preview and Production:
     - `VITE_SUPABASE_URL`
     - `VITE_SUPABASE_ANON_KEY`
     - `SUPABASE_URL`
     - `SUPABASE_SERVICE_ROLE_KEY`
     - `SUPABASE_ANON_KEY`
   - Deploy.
5. Post-deploy smoke test:
   - Sign up and sign in.
   - Create today’s log.
   - Pull a known existing date in `Pull Log`.
  - Install on iPhone (Safari > Share > Add to Home Screen).

