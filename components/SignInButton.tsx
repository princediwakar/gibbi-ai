// components/SignInButton.tsx
"use client";

import { signInWithGoogle, storeReturnUrl } from "@/lib/supabase/auth";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export const SignInButton = () => {
  const handleSignIn = async () => {
    try {
      storeReturnUrl(window.location.pathname);
      await signInWithGoogle();
    } catch (error) {
      console.error("Sign-in failed:", error);
      toast.error("Failed to sign in with Google. Please try again.");
    }
  };

  return (
    <Button onClick={handleSignIn} variant="default">
      Sign In with Google
    </Button>
  );
};