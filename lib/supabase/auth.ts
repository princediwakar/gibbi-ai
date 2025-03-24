// lib/supabase/auth.ts
import { supabase } from "@/lib/supabase/client";
import Cookies from "js-cookie";

export async function signInWithGoogle(): Promise<void> {
  const redirectTo = `${process.env.NEXT_PUBLIC_BASE_URL}/auth/callback`;
  
  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo,
      queryParams: {
        next: window.localStorage.getItem("returnUrl") || "/", // Pass the return URL
      },
    },
  });

  if (error) {
    throw new Error(`Google sign-in failed: ${error.message}`);
  }
}

export async function signOut(): Promise<void> {
  const { error } = await supabase.auth.signOut();
  if (error) {
    throw new Error(`Sign-out failed: ${error.message}`);
  }
  Cookies.remove("sb-ppbiycqjoravxsyebmfs-auth-token"); // Replace with your project ref
}

export function storeReturnUrl(path: string): void {
  window.localStorage.setItem("returnUrl", path);
}