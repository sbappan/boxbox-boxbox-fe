import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

interface UserAvatarProps {
  name?: string | null;
  image?: string | null;
  className?: string;
}

export function UserAvatar({ 
  name, 
  image, 
  className
}: UserAvatarProps) {
  const getFallback = () => {
    // When the name is missing, use X as the fallback.
    // Why X? - x is unknown - math nerd joke
    return name?.charAt(0)?.toUpperCase() || 'X';
  };

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
      <AvatarFallback>{getFallback()}</AvatarFallback>
    </Avatar>
  );
}