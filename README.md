# NeuroTriage Survey

Adaptive customer discovery interviews for prehospital emergency care.

## Shareable link (single domain)

Once you point a domain at this app (Vercel), the **only** public survey URL you need is:

```
https://YOUR-DOMAIN.com/survey
```

Flow:

```
https://YOUR-DOMAIN.com/survey
        ↓
Anonymous session ID (created automatically, stored in the browser)
        ↓
Participant answers questions
        ↓
Each answer saved to Supabase
        ↓
Admin reviews at /admin/results
```

The session ID is **not** part of the URL — one clean link for everyone; each visitor gets their own anonymous session.

## Quick start (local)

```bash
npm install
npm run dev
```

Without Supabase keys, answers save to `.data/store.json` for local testing.

### Production path (Supabase)

1. Create a [Supabase](https://supabase.com) project  
2. In the SQL editor, run in order:
   - `supabase/migrations/001_schema.sql`
   - `supabase/migrations/002_anon_survey_policies.sql`
3. Copy `.env.example` → `.env.local` and set:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` (recommended for seeding)
   - `NEXT_PUBLIC_APP_URL=https://YOUR-DOMAIN.com`
4. Seed the interview template:

```bash
npm run seed:supabase
```

5. Deploy to Vercel, attach your domain, share `https://YOUR-DOMAIN.com/survey`

## Admin

- Templates: `/admin`
- Results / CSV: `/admin/results`
- Optional password gate: set `ADMIN_PASSWORD`

## Stack

Next.js 15 · TypeScript · Tailwind · shadcn/ui · Zod · React Hook Form · Supabase

## License

MIT
