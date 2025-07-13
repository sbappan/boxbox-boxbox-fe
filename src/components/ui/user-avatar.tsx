import React, { useMemo } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

interface UserAvatarProps {
  name?: string | null;
  image?: string | null;
  className?: string;
}

export const UserAvatar = React.memo(function UserAvatar({ 
  name, 
  image, 
  className
}: UserAvatarProps) {
  const fallback = useMemo(() => {
    // When the name is missing, use X as the fallback.
    // Why X? - x is unknown - math nerd joke
    return name?.charAt(0)?.toUpperCase() || 'X';
  }, [name]);

  return (
    <Avatar className={className}>
      {image && (
        <AvatarImage 
          src={image} 
          alt={name || "User avatar"}
          referrerPolicy="no-referrer"
          crossOrigin="anonymous"
        />
      )}
      <AvatarFallback>{fallback}</AvatarFallback>
    </Avatar>
  );
});