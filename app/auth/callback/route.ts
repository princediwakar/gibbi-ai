// app/auth/callback/route.ts
import { createClient } from "@/lib/supabase/server";
import { NextResponse, type NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") || "/";

  const supabase = await createClient();

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      console.error("Error exchanging code for session:", error.message);
      return NextResponse.redirect(
        new URL("/error?message=Authentication failed", request.url)
      );
    }
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  const redirectUrl = new URL(next, baseUrl);
  redirectUrl.searchParams.set("refresh", "true");

  return NextResponse.redirect(redirectUrl);
}