# EIA Survey

Open-source Typeform alternative for **adaptive customer discovery interviews**.

Built with Next.js 15, TypeScript, Tailwind CSS, shadcn/ui, React Hook Form patterns, Zod, and Supabase-ready schema. Ships with a full **Prehospital Emergency Care Workflow Discovery** interview template.

## Features

### Participant experience
- One question per screen (Typeform-style)
- Progress bar, Next / Back, keyboard shortcuts
- Autosave after every answer + resume incomplete sessions
- Smooth transitions, dark/light mode, thank-you page
- Mobile responsive

### Question types
Short text · Long text · Multiple choice · Multiple select · Dropdown · Yes/No · Rating (1–5 / 1–10)

### Adaptive logic
Branching rules (`hide` / `show` / `goto` / `end`) and repeat-follow-ups for multi-select answers are stored in the database (or local store) — not hardcoded in UI.

### Admin
- Create / edit / duplicate templates
- Drag-and-drop question reorder
- Visual branching rule editor
- Preview, publish / unpublish

### Results
- Completion rate & average time
- Individual responses + answers grouped by question
- Filter by template / role
- CSV export

## Quick start

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

- **Interview:** `/interview/prehospital-emergency-care`
- **Admin:** `/admin`
- **Results:** `/admin/results`

By default the app uses a local JSON store in `.data/` (gitignored) seeded with the prehospital template. No Supabase project is required to try the app.

### Optional admin password

```bash
cp .env.example .env.local
# set ADMIN_PASSWORD=your-secret
```

## Supabase setup (production)

1. Create a Supabase project.
2. Run `supabase/migrations/001_schema.sql` in the SQL editor.
3. Set env vars from `.env.example`:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` (server-side writes for anonymous sessions)
4. Seed the prehospital template via Admin → Duplicate from the local store, or insert using the structure in `src/data/seed-prehospital.ts`.

Anonymous respondents are supported by default (session token, no login).

## Deploy on Vercel

1. Push this repo to GitHub.
2. Import the project in Vercel.
3. Add environment variables.
4. Deploy.

For the local JSON store on Vercel, prefer Supabase — the filesystem is ephemeral on serverless.

## Architecture

```
src/
  app/                  # App Router pages + API routes
  components/
    interview/          # Typeform-like player + question renderers
    admin/              # Template editor, results dashboard
    ui/                 # shadcn-style primitives
  data/                 # Seeded interview templates
  lib/
    interview/engine.ts # Branching + repeat expansion
    db/store.ts         # Local persistence (swap for Supabase)
    supabase/           # Browser/server/middleware clients
supabase/migrations/    # Postgres schema
```

Templates, questions, options, and branch rules are editable without code changes.

## Extending with a new template

1. Open **Admin → New template** (or duplicate an existing one).
2. Add sections and questions; set types and options.
3. For multi-select follow-ups, set **Repeat for options of**.
4. Add branching rules on the **Branching** tab.
5. Preview → Publish.

## License

MIT
