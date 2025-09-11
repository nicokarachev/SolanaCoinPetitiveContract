import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/utils/supabase/middleware";

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // ✅ SKIP for all API routes
  if (pathname.startsWith("/api")) {
    return NextResponse.next();
  }

  return await updateSession(request);
}

export const config = {
  matcher: [
    // Skip static/image/media files via RegEx
    "/((?!_next/static|_next/image|favicon.ico|animations|.*\\.(?:svg|png|jpg|jpeg|gif|webp|json)$).*)",
  ],
};
