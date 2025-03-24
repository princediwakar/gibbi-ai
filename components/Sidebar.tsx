// components/Sidebar.tsx
"use client";

import { useUser } from "@/hooks/useUser";
import { supabase } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { LogOut, Book, Globe } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function Sidebar() {
  const user = useUser();
  const pathname = usePathname();

  if (!user) return null; // Hide sidebar if not logged in

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/login"; // Redirect to login after logout
  };

  const navItems = [
    { label: "My Library", href: "/", icon: Book },
    { label: "Public Quizzes", href: "/quizzes", icon: Globe },
  ];

  return (
    <aside className="fixed top-0 left-0 w-64 h-screen bg-gray-100 p-4 flex flex-col border-r">
      <div className="flex-1 space-y-2">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-2 p-2 rounded ${
              pathname === item.href
                ? "bg-gray-200 text-gray-900"
                : "text-gray-700 hover:bg-gray-200"
            }`}
          >
            <item.icon className="w-5 h-5" />
            <span>{item.label}</span>
          </Link>
        ))}
      </div>
      <Button
        variant="outline"
        className="w-full flex items-center gap-2"
        onClick={handleLogout}
      >
        <LogOut className="w-5 h-5" />
        Logout
      </Button>
    </aside>
  );
}