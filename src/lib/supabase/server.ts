import { cache } from "react";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Business } from "@/lib/types";

/** Supabase client for Server Components, Server Actions and Route Handlers. */
export function createClient() {
  const cookieStore = cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Called from a Server Component where cookies are read-only.
            // Session refresh is handled by the middleware, so this is safe to ignore.
          }
        },
      },
    },
  );
}

/**
 * The current user id from the cookie session (no network call).
 * The middleware already validated the session with getUser() this request,
 * so reading it from the cookie here is both safe and fast.
 * Wrapped in React cache() so it runs once per request render.
 */
export const getUserId = cache(async (): Promise<string | null> => {
  const supabase = createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session?.user?.id ?? null;
});

/**
 * The business profile belonging to the current user (or null).
 * cache() dedupes this across the layout + page in a single navigation,
 * so we hit Supabase once per request instead of two or three times.
 */
export const getBusiness = cache(async (): Promise<Business | null> => {
  const userId = await getUserId();
  if (!userId) return null;
  const supabase = createClient();
  const { data } = await supabase.from("businesses").select("*").eq("user_id", userId).single();
  return (data as Business) ?? null;
});
