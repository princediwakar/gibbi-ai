// lib/supabase/server.ts
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createClient() {
  const cookieStore = await cookies();
  const cookieMap = new Map<string, string>();

  // Pre-fetch all cookies
  const allCookies = await cookieStore.getAll();
  allCookies.forEach((cookie) => cookieMap.set(cookie.name, cookie.value));

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieMap.get(name); // Synchronous lookup
        },
        set(name: string, value: string, options: CookieOptions) {
          cookieStore.set({ name, value, ...options });
          cookieMap.set(name, value); // Keep Map in sync
        },
        remove(name: string, options: CookieOptions) {
          cookieStore.set({ name, value: "", ...options });
          cookieMap.delete(name);
        },
      },
    }
  );
}