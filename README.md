# Placement Daily Log

This repository now contains:

- A legacy Python CLI logger (`daily_log.py`) you can still run locally.
- A new React + Vite PWA for iPhone/desktop use with Supabase sync and server-generated PDFs.

## PWA stack

- React + Vite + React Router
- Tailwind CSS
- `vite-plugin-pwa` (installable app + service worker)
- Supabase Auth + Postgres + Storage
- Vercel deployment + serverless PDF endpoint

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

4. Apply SQL migration in your Supabase project:
   - `supabase/migrations/20260616182000_create_daily_logs.sql`

5. Create a Supabase storage bucket:
   - Bucket name: `daily-log-pdfs`
   - Access: private

6. Run the app:

   ```bash
   npm run dev
   ```

## Usage (PWA)

- Sign up/sign in in the `Profile` tab.
- Create or update an entry in `New Log`.
- Generate PDF for a saved entry (server endpoint).
- Review monthly grouped history in `History`.

PDF naming/path is enforced as:

- `monthly_logs/YYYY-MM/Daily_Log_(YYYY-MM-DD).pdf`

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
   - Create private storage bucket `daily-log-pdfs`.
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
     - `SUPABASE_ANON_KEY` (required by secure PDF endpoint auth verification)
   - Deploy.
5. Post-deploy smoke test:
   - Sign up and sign in.
   - Create today’s log.
   - Generate PDF.
   - Open PDF from history.
   - Confirm storage path is `monthly_logs/YYYY-MM/Daily_Log_(YYYY-MM-DD).pdf`.
   - Install on iPhone (Safari > Share > Add to Home Screen).

## Legacy Python fallback

If you still want local-only logging, you can continue using:

- `python daily_log.py`
- `new_daily_log.bat`
