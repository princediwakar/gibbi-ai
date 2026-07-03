"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUser } from "@/hooks/useUser";
import { signOut } from "@/lib/supabase/auth";
import { toast } from "sonner";
import { ThemeToggle } from "./ThemeToggleButton";
import { Header } from "./Header";
import { UserMenu } from "./UserMenu";
import type { SidebarData } from "@/app/layout";
import {
  TrendingUp,
  History,
  Compass,
  Menu,
  PanelLeftClose,
  PlusCircle,
  Target,
  Calendar,
  Flame,
} from "lucide-react";

const mainItems = [
  { title: "Dashboard", url: "/dashboard", icon: Target },
  { title: "Analytics", url: "/analytics", icon: TrendingUp },
  { title: "History", url: "/history", icon: History },
];

export function AppShell({ children, sidebarData }: { children: React.ReactNode; sidebarData?: SidebarData | null }) {
  const pathname = usePathname();
  const { user, isUserLoading } = useUser();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const mql = window.matchMedia("(min-width: 1024px)");
    setSidebarOpen(mql.matches);
    const handler = (e: MediaQueryListEvent) => setSidebarOpen(e.matches);
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success("Signed out successfully.");
    } catch (error) {
      console.error("Sign-out failed:", error);
      toast.error("Failed to sign out. Please try again.");
    }
  };

  const headerTitle =
    pathname === "/dashboard" ? "Dashboard" :
    pathname === "/analytics" ? "Analytics" :
    pathname === "/history" ? "History" :
    pathname === "/setup" ? "Settings" :
    pathname === "/create" ? "Create a Quiz" :
    pathname === "/quizzes" ? "Public Quizzes" : "";

  const showOnRoutes = ["/create", "/quizzes", "/dashboard", "/analytics", "/history", "/setup"];
  const shouldShowSidebar = showOnRoutes.includes(pathname) && !!user;
  const isQuizPage = pathname.startsWith("/quiz/") || pathname.startsWith("/play/") || pathname.startsWith("/session/");

  if (!mounted || isUserLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse">
          <div className="h-8 w-8 bg-primary/20 rounded-full"></div>
        </div>
      </div>
    );
  }

  if (!shouldShowSidebar || isQuizPage) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="pt-16">
          {children}
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      <aside className={`fixed left-0 top-0 h-screen w-64 border-r bg-background z-50 transition-transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-4 h-full flex flex-col">
          <div className="mb-6">
            <Link href="/" className="text-xl font-bold text-primary">
              GibbiAI
            </Link>
            {sidebarData && (
              <div className="mt-2">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Calendar className="w-3 h-3 shrink-0" />
                  <span className="truncate">
                    {sidebarData.examName} &middot; {sidebarData.daysRemaining} day{sidebarData.daysRemaining !== 1 ? "s" : ""}
                  </span>
                </div>
              </div>
            )}
          </div>

          <nav className="flex-1 overflow-auto flex flex-col">
            {/* Main navigation */}
            <div className="space-y-1">
              {mainItems.map((item) => {
                const isActive = pathname === item.url;
                return (
                  <Link
                    key={item.title}
                    href={item.url}
                    className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
                      isActive
                        ? "bg-primary text-black font-medium"
                        : "hover:bg-accent text-foreground"
                    }`}
                  >
                    <item.icon className="w-4 h-4" />
                    <span>{item.title}</span>
                  </Link>
                );
              })}
            </div>

          </nav>

          {user && (
            <div className="border-t pt-4 mt-4 flex flex-col gap-1">
              <div className="mb-3 px-2">
                <p className="text-xs font-semibold text-muted-foreground/60 uppercase tracking-wider mb-1.5">
                  Explore
                </p>
                <Link
                  href="/create"
                  className={`flex items-center gap-3 py-1.5 text-sm rounded-md px-2 transition-colors ${
                    pathname === "/create"
                      ? "text-foreground font-medium"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  Create a Quiz
                </Link>
                <Link
                  href="/quizzes"
                  className={`flex items-center gap-3 py-1.5 text-sm rounded-md px-2 transition-colors ${
                    pathname === "/quizzes"
                      ? "text-foreground font-medium"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Compass className="w-3.5 h-3.5" />
                  Public Quizzes
                </Link>
              </div>

              {sidebarData && sidebarData.streak > 0 && (
                <div className="flex items-center gap-1.5 px-2 py-1 text-xs">
                  <Flame className="w-3.5 h-3.5 text-orange-500" />
                  <span className="text-muted-foreground">
                    {sidebarData.streak} day streak
                  </span>
                </div>
              )}

            </div>
          )}
        </div>
      </aside>

      <div className={`flex-1 transition-[margin-left] duration-200 ${sidebarOpen ? 'lg:ml-64' : 'ml-0'}`}>
        <header className="h-14 border-b flex items-center px-4 sticky top-0 bg-background z-40">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-accent rounded-md mr-4"
          >
            {sidebarOpen ? <PanelLeftClose className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <span className="font-medium">
            {headerTitle}
          </span>
          <div className="ml-auto flex items-center gap-2">
            <ThemeToggle />
            {user && (
              <UserMenu
                user={user}
                isOpen={isDropdownOpen}
                onOpenChange={setIsDropdownOpen}
                onSignOut={handleSignOut}
              />
            )}
          </div>
        </header>

        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
}
