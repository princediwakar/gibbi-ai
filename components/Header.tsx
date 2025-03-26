// components/Header.tsx
"use client";

import { useState, memo } from "react";
import Link from "next/link";
import { useUser } from "@/hooks/useUser";
import { SignInButton } from "./SignInButton";
import { UserMenu } from "./UserMenu";
import { signOut } from "@/lib/supabase/auth";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { ThemeToggle } from "./ThemeToggleButton"; // Import the ThemeToggle component

export const Header = memo(() => {
  const { user, isLoading } = useUser();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

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

  // Show a loading state while the user data is being fetched
  if (isLoading) {
    return (
      <div className="border-b">
      <header className="flex justify-between items-center max-w-5xl p-4 mx-auto">
        <nav className="flex items-center space-x-8">
          <Link href="/" className="hover:opacity-80 transition-opacity">
            <h1 className="text-xl font-bold">QuizMaster AI</h1>
          </Link>
          <Link href="/quizzes" className="hover:opacity-80 transition-opacity">
            Explore
          </Link>
        </nav>
        <div className="flex items-center space-x-4">
          {/* Show a loading indicator */}
          <Loader2 className="size-6 animate-spin" />
        </div>
      </header>
      </div>
    );
  }

  return (
    <div className="border-b">
      <header className="flex justify-between items-center max-w-5xl p-4 mx-auto">
      <nav className="flex items-center space-x-8">
        <Link href="/" className="hover:opacity-80 transition-opacity">
          <h1 className="text-xl font-bold">QuizMaster AI</h1>
        </Link>
        <Link href="/quizzes" className="hover:opacity-80 transition-opacity">
          Explore
        </Link>
      </nav>
      <div className="flex items-center space-x-4">
        <ThemeToggle />
        {user ? (
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