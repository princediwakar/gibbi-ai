// components/Header.tsx
"use client";

import { useState, memo } from "react";
import Link from "next/link";
import { useUser } from "@/hooks/useUser";
import { SignInButton } from "./SignInButton";
import { UserMenu } from "./UserMenu";
import { signOut } from "@/lib/supabase/auth";
import { toast } from "sonner";

export const Header = memo(() => {
  const user = useUser();
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

  return (
    <header className="flex justify-between items-center p-4 max-w-5xl mx-auto text-gray-900">
      <nav className="flex items-center space-x-8">
        <Link href="/" className="hover:opacity-80 transition-opacity">
          <h1 className="text-xl font-bold">QuizMaster AI</h1>
        </Link>
        <Link href="/quizzes" className="hover:opacity-80 transition-opacity">
          Explore
        </Link>
      </nav>
      <div className="flex items-center space-x-4">
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
  );
});

Header.displayName = "Header";