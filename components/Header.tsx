// Path: components/Header.tsx
"use client";

import { useState, memo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUser } from "@/hooks/useUser";
import { SignInButton } from "./SignInButton";
import { UserMenu } from "./UserMenu";
import { signOut } from "@/lib/supabase/auth";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { ThemeToggle } from "./ThemeToggleButton";

const QUIZ_ROUTES = ["/quiz/", "/play/", "/session/", "/edit/", "/create"];

export const Header = memo(() => {
  const pathname = usePathname();
  const { user, isUserLoading } = useUser();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const isQuizPage = QUIZ_ROUTES.some((route) => pathname.startsWith(route));

  const handleSignOut = async () => {
    try {
      await signOut();
      setIsDropdownOpen(false);
      toast.success("Signed out successfully.");
    } catch (error) {
      console.error("Sign-out failed:", error);
      toast.error("Failed to sign out. Please try again.");
    }
  };

  return (
    <div className="h-16 fixed top-0 left-0 right-0 z-[100] bg-background/95 backdrop-blur border-b supports-[backdrop-filter]:bg-background/60">
      <header className="flex justify-between items-center max-w-6xl px-4 py-4 mx-auto">
        <nav className="flex items-center space-x-8">
          <Link href="/" className="flex gap-2 hover:opacity-80 transition-opacity">
            <h1 className="text-xl font-bold">Gibbi AI</h1>
          </Link>
          {!isQuizPage && (
            <Link href="/quizzes" className="hover:opacity-80 transition-opacity">
              Explore
            </Link>
          )}
        </nav>
        <div className="flex items-center space-x-4">
          <ThemeToggle />
          {isUserLoading ? (
            <div><Loader2 className="animate-spin mx-auto"/></div>
          ) : user ? (
            <UserMenu
              user={user}
              isOpen={isDropdownOpen}
              onOpenChange={setIsDropdownOpen}
              onSignOut={handleSignOut}
            />
          ) : (
            <SignInButton />
          )}
        </div>
      </header>
    </div>
  );
});
Header.displayName = "Header";