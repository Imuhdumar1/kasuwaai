import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";
import { ratelimit } from "@/lib/ratelimit";

export async function middleware(request: NextRequest) {
  // Rate-limit write requests (server actions / form posts) per IP when Upstash
  // is configured. Reads (GET navigations) are not throttled, so browsing stays fast.
  if (ratelimit && request.method === "POST") {
    const ip = request.ip ?? request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "anonymous";
    try {
      const { success } = await ratelimit.limit(ip);
      if (!success) {
        return new NextResponse("Too many requests — please slow down and try again shortly.", { status: 429 });
      }
    } catch {
      // If the limiter is unreachable, fail open (don't block real users).
    }
  }

  try {
    return await updateSession(request);
  } catch {
    // Never let a middleware failure 500 the whole site — let the request
    // through and let page-level auth handle protection.
    return NextResponse.next({ request });
  }
}

export const config = {
  matcher: [
    // Run on everything except static assets and image files.
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
