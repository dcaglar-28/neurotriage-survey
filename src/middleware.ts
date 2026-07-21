import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Optional simple admin gate when ADMIN_PASSWORD is set (local/demo mode)
  if (pathname.startsWith("/admin") && process.env.ADMIN_PASSWORD) {
    const auth = request.cookies.get("eia-admin")?.value;
    if (auth !== process.env.ADMIN_PASSWORD && !pathname.startsWith("/admin/login")) {
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = "/admin/login";
      loginUrl.searchParams.set("next", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return updateSession(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
