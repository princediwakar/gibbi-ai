"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUser } from "@/hooks/useUser";
import { signOut } from "@/lib/supabase/auth";
import { toast } from "sonner";
import { ThemeToggle } from "./ThemeToggleButton";
import { SignInButton } from "./SignInButton";
import { Header } from "./Header";
import {
  TrendingUp,
  History,
  Compass,
  LogOut,
  Home,
  Menu,
  PanelLeftClose,
  PlusCircle,
} from "lucide-react";

const mainMenuItems = [
  { title: "Home", url: "/", icon: Home },
  { title: "Explore", url: "/quizzes", icon: Compass },
];

const userMenuItems = [
  { title: "My Quizzes", url: "/my-quizzes", icon: PlusCircle },
  { title: "Progress", url: "/dashboard", icon: TrendingUp },
  { title: "History", url: "/history", icon: History },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, isUserLoading } = useUser();
  const [isSignOutLoading, setIsSignOutLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSignOut = async () => {
    try {
      setIsSignOutLoading(true);
      await signOut();
      toast.success("Signed out successfully.");
    } catch (error) {
      console.error("Sign-out failed:", error);
      toast.error("Failed to sign out. Please try again.");
    } finally {
      setIsSignOutLoading(false);
    }
  };

  const showOnRoutes = ["/", "/quizzes", "/my-quizzes", "/dashboard", "/history"];
  const shouldShowSidebar = showOnRoutes.includes(pathname) && !!user;
  const isQuizPage = pathname.startsWith("/quiz/") || pathname.startsWith("/play/");

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
      <aside className={`fixed left-0 top-0 h-screen w-64 border-r bg-background z-50 transition-transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-4 h-full flex flex-col">
          <div className="mb-6">
            <Link href="/" className="text-xl font-bold text-primary">
              GibbiAI
            </Link>
          </div>
          
          <nav className="space-y-6 flex-1 overflow-auto">
            <div>
              <h3 className="text-xs font-medium text-muted-foreground mb-2 px-2">Main</h3>
              <div className="space-y-1">
                {mainMenuItems.map((item) => {
                  const isActive = pathname === item.url;
                  return (
                    <Link
                      key={item.title}
                      href={item.url}
className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
                          isActive 
                            ? 'bg-primary text-black font-medium' 
                            : 'hover:bg-accent text-foreground'
                        }`}
                    >
                      <item.icon className="w-4 h-4" />
                      <span>{item.title}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
            
            {user && (
              <div>
                <h3 className="text-xs font-medium text-muted-foreground mb-2 px-2">My Learning</h3>
                <div className="space-y-1">
                  {userMenuItems.map((item) => {
                    const isActive = pathname === item.url;
                    return (
                      <Link
                        key={item.title}
                        href={item.url}
                        className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
                          isActive 
                            ? 'bg-primary text-black font-medium' 
                            : 'hover:bg-accent text-foreground'
                        }`}
                      >
                        <item.icon className="w-4 h-4" />
                        <span>{item.title}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}
          </nav>

          {user && (
            <div className="border-t pt-4 mt-4">
              <button
                onClick={handleSignOut}
                disabled={isSignOutLoading}
                className="flex items-center gap-3 px-3 py-2 rounded-md text-sm hover:bg-accent w-full text-left text-red-500"
              >
                <LogOut className="w-4 h-4" />
                <span>{isSignOutLoading ? "Signing out..." : "Sign Out"}</span>
              </button>
            </div>
          )}
        </div>
      </aside>
      
      <div className={`flex-1 transition-all ${sidebarOpen ? 'ml-64' : 'ml-0'}`}>
        <header className="h-14 border-b flex items-center px-4 sticky top-0 bg-background z-40">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-accent rounded-md mr-4"
          >
            {sidebarOpen ? <PanelLeftClose className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <span className="font-medium">
            {pathname === "/dashboard" ? "Progress" : 
             pathname === "/history" ? "Quiz History" :
             pathname === "/my-quizzes" ? "My Quizzes" :
             pathname === "/quizzes" ? "Explore" :
             pathname === "/" ? "Home" : ""}
          </span>
          <div className="ml-auto">
            <ThemeToggle />
          </div>
        </header>
        
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
}