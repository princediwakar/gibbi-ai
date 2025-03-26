// lib/supabase/auth.ts
import Cookies from "js-cookie";
import { supabase } from "@/lib/supabase/client";

async function logToServer(message: string) {
  try {
    await fetch("/api/log", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message }),
    });
  } catch (e) {
    console.log(e)
  }
}

export async function signInWithGoogle() { 
  const redirectTo = `${process.env.NEXT_PUBLIC_BASE_URL}/auth/callback`;
  logToServer(`Initiating Google sign-in, redirectTo: ${redirectTo}`);

  await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: redirectTo,
    },
  })

}

export async function signOut(): Promise<void> {
  try {
    console.log("Starting sign-out process");
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Supabase signOut error:", error);
      throw error;
    }
    console.log("Supabase session signed out");

    // Clear all sb- cookies
    const allCookies = Cookies.get();
    for (const name of Object.keys(allCookies)) {
      if (name.startsWith("sb-")) {
        Cookies.remove(name, { path: "/" });
        console.log("Removed cookie:", name);
      }
    }

    // Clear storage
    window.localStorage.clear();
    window.sessionStorage.clear();
    console.log("Storage cleared");
  } catch (error) {
    console.error("Sign-out failed:", error);
    throw error;
  }
}

export function storeReturnUrl(path: string): void {
  window.localStorage.setItem("returnUrl", path);
}