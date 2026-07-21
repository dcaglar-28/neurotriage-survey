import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/middleware";

/** Refresh Supabase auth cookies on each request when configured. */
export async function updateSession(request: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    return NextResponse.next({ request });
  }

  const { supabase, supabaseResponse } = createClient(request);
  // Keep sessions fresh for authenticated admin users
  await supabase.auth.getUser();
  return supabaseResponse;
}
