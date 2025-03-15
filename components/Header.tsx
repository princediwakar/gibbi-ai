"use client";

import { useUser } from "@/hooks/use-user";
import { supabase } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { memo, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut } from "lucide-react";

const Header = memo(() => {
  const user = useUser();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  const handleSignIn = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
    });
    if (error) console.error("Sign-in error:", error.message);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/");
    setIsOpen(false);
  };

  return (
    <header className="flex justify-between items-center p-4 max-w-5xl text-gray-900 mx-auto">
      <div className="flex items-center space-x-8">
        <Link
          href="/"
          className="hover:opacity-80 transition-opacity"
        >
          <h1 className="text-xl font-bold">QuizMaster AI</h1>
        </Link>
        <Link href="/quizzes">Explore</Link>
      </div>
      <div className="flex items-center space-x-4">
        {user ? (
          <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
            <DropdownMenuTrigger asChild>
              <button className="hover:opacity-80 transition-opacity">
                <Avatar>
                  <AvatarImage
                    src={user?.user_metadata?.avatar_url}
                  />
                  <AvatarFallback className="text-gray-900">
                    {user?.user_metadata?.name?.[0] || "U"}
                  </AvatarFallback>
                </Avatar>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem
                onClick={handleSignOut}
                className="text-red-600 focus:text-red-700 focus:bg-red-50"
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log Out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Button onClick={handleSignIn}>Sign In</Button>
        )}
      </div>
    </header>
  );
});

Header.displayName = "Header";
export default Header;
