// components/UserMenu.tsx
"use client";

import { memo } from "react";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { User } from "@/types/quiz";

interface UserMenuProps {
  user: User
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSignOut: () => Promise<void>;
}

export const UserMenu = memo(({ user, isOpen, onOpenChange, onSignOut }: UserMenuProps) => {
  const initials = user?.user_metadata?.name?.[0] || "U";
  const avatarUrl = user?.user_metadata?.avatar_url;

  return (
    <DropdownMenu open={isOpen} onOpenChange={onOpenChange}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="size-6 p-0 rounded-full hover:opacity-80 transition-opacity">
          <Avatar>
            <AvatarImage src={avatarUrl} alt="User avatar" />
            <AvatarFallback className="">{initials}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuItem
          onClick={onSignOut}
          className="text-red-600 focus:text-red-700 focus:bg-red-50 cursor-pointer"
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log Out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
});

UserMenu.displayName = "UserMenu";