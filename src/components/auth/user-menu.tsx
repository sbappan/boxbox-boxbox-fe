import { LogOut, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { authClient } from "@/lib/auth-client";
import type { User as UserType } from "@/lib/types";
import { useState } from "react";

interface UserMenuProps {
  user: UserType;
}

export function UserMenu({ user }: UserMenuProps) {
  const [imageError, setImageError] = useState(false);
  
  const handleSignOut = async () => {
    try {
      await authClient.signOut();
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full p-0">
          {user.image && !imageError ? (
            <img
              className="h-8 w-8 rounded-full object-cover"
              src={user.image}
              alt={user.name || "User avatar"}
              onError={() => {
                console.error("Failed to load image:", user.image);
                setImageError(true);
              }}
              loading="lazy"
              referrerPolicy="no-referrer"
              crossOrigin="anonymous"
            />
          ) : (
            <User className="h-5 w-5" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <div className="flex items-center justify-start gap-2 p-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
            {user.image && !imageError ? (
              <img
                className="h-10 w-10 rounded-full object-cover"
                src={user.image}
                alt={user.name || "User avatar"}
                onError={() => setImageError(true)}
                loading="lazy"
                referrerPolicy="no-referrer"
                crossOrigin="anonymous"
              />
            ) : (
              <User className="h-5 w-5" />
            )}
          </div>
          <div className="flex flex-col space-y-1 leading-none">
            {user.name && <p className="font-medium">{user.name}</p>}
            {user.email && (
              <p className="w-[200px] truncate text-sm text-muted-foreground">
                {user.email}
              </p>
            )}
          </div>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="cursor-pointer" onSelect={handleSignOut}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Sign out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
