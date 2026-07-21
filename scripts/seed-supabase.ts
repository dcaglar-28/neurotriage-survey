/**
 * Seed / update the NeuroTriage interview template in Supabase.
 *
 * Usage:
 *   1. Create a Supabase project
 *   2. Run supabase/migrations/001_schema.sql in the SQL editor
 *   3. Copy .env.example → .env.local and fill Supabase keys
 *   4. npx tsx scripts/seed-supabase.ts
 */
import { config } from "dotenv";
config({ path: ".env.local" });
config();

import { PREHOSPITAL_TEMPLATE } from "../src/data/seed-prehospital";
import { seedSupabaseTemplate } from "../src/lib/db/supabase-store";
import { isSupabaseConfigured } from "../src/lib/supabase/admin";

async function main() {
  if (!isSupabaseConfigured()) {
    console.error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local"
    );
    process.exit(1);
  }

  console.log("Seeding NeuroTriage template →", PREHOSPITAL_TEMPLATE.slug);
  await seedSupabaseTemplate(PREHOSPITAL_TEMPLATE);
  console.log("Done. Canonical survey link: /survey");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
