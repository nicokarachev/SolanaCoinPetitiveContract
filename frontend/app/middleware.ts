import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";
import { NextRequest, NextResponse } from "next/server";

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  const memberCookie = req.cookies.get("member");
  const isLandingPage = req.nextUrl.pathname.startsWith("/landing");
  const isResetPage = req.nextUrl.pathname.startsWith("/reset-password");

  // If no session OR no member cookie AND not already on landing page
  if ((!session && !memberCookie) && !isLandingPage && !isResetPage) {
    // Set a JS-readable cookie to trigger client redirect
    res.cookies.set("redirectToLanding", "true", {
      path: "/",
      maxAge: 60,
      httpOnly: false, // must be false so JS can read it
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });
  }

  return res;
}

export const config = {
  matcher: ["/((?!_next|favicon.ico|api|landing|fonts|images).*)"],
};
