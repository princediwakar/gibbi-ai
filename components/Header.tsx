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
  const { user, isUserLoading } = useUser();
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
    <div className="h-16"> {/* Set a fixed height for the header container */}
      <header className="flex justify-between items-center max-w-5xl p-4 mx-auto">
        <nav className="flex items-center space-x-8">
          <Link href="/" className="flex gap-2 hover:opacity-80 transition-opacity">
            <h1 className="text-xl font-bold">Gibbi AI</h1>
          </Link>
          <Link href="/quizzes" className="hover:opacity-80 transition-opacity">
            Explore
          </Link>
        </nav>
        <div className="flex items-center space-x-4">
          <ThemeToggle />
          {isUserLoading ? ( // Show a placeholder to maintain consistent height
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