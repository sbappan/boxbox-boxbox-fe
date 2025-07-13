import { Button } from "@/components/ui/button";
import { useFollow } from "@/lib/queries";
import { cn } from "@/lib/utils";
import { UserPlus, UserMinus, Loader2 } from "lucide-react";

interface FollowButtonProps {
  userId: string;
  isFollowing: boolean;
  disabled?: boolean;
  variant?: "default" | "outline" | "ghost";
  size?: "sm" | "default" | "lg";
  showIcon?: boolean;
  className?: string;
  onFollowChange?: (isFollowing: boolean) => void;
}

export function FollowButton({
  userId,
  isFollowing,
  disabled = false,
  variant = "default",
  size = "default",
  showIcon = true,
  className,
  onFollowChange,
}: FollowButtonProps) {
  const followMutation = useFollow();

  const handleClick = () => {
    if (disabled || followMutation.isPending) return;
    
    followMutation.mutate({ userId, isFollowing }, {
      onSuccess: () => {
        // Call the callback if provided
        onFollowChange?.(!isFollowing);
      },
    });
  };

  const isLoading = followMutation.isPending;
  const buttonDisabled = disabled || isLoading;

  // Button text based on state
  const getButtonText = () => {
    if (isLoading) {
      return isFollowing ? "Unfollowing..." : "Following...";
    }
    return isFollowing ? "Following" : "Follow";
  };

  // Button icon based on state
  const getButtonIcon = () => {
    if (isLoading) {
      return <Loader2 className="animate-spin" />;
    }
    return isFollowing ? <UserMinus /> : <UserPlus />;
  };

  // Determine button variant based on follow state
  const getButtonVariant = () => {
    if (variant !== "default") return variant;
    return isFollowing ? "outline" : "default";
  };

  return (
    <Button
      onClick={handleClick}
      disabled={buttonDisabled}
      variant={getButtonVariant()}
      size={size}
      className={cn(
        "transition-all duration-200",
        isFollowing && variant === "default" && "hover:bg-destructive hover:text-white",
        className
      )}
    >
      {showIcon && getButtonIcon()}
      <span>{getButtonText()}</span>
    </Button>
  );
}