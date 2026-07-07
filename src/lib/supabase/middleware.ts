import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// Signed-in users are bounced away from these to the dashboard.
const REDIRECT_WHEN_AUTHED = ["/login", "/signup", "/forgot-password"];
// Reachable without a session (reset-password relies on a temporary recovery session).
const PUBLIC_PREFIXES = ["/reset-password", "/auth", "/privacy", "/terms"];

/** Refreshes the Supabase session cookie and enforces route protection. */
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;
  const redirectWhenAuthed = REDIRECT_WHEN_AUTHED.some((r) => path.startsWith(r));
  const isPublic =
    redirectWhenAuthed || path === "/" || PUBLIC_PREFIXES.some((r) => path.startsWith(r));

  if (!user && !isPublic) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }
  if (user && redirectWhenAuthed) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  return response;
}
