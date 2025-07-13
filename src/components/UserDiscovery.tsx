import { useUserSuggestions } from "@/lib/queries";
import { FollowButton } from "@/components/follow-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Users, UserSearch } from "lucide-react";
import { Link } from "react-router-dom";

interface UserDiscoveryProps {
  limit?: number;
  className?: string;
}

export function UserDiscovery({ limit = 5, className }: UserDiscoveryProps) {
  const {
    data,
    isLoading,
    isError,
    error,
  } = useUserSuggestions(limit);

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Suggested Users
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array.from({ length: limit }).map((_, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 border rounded-lg bg-muted/20"
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="h-9 w-9 bg-muted rounded-full animate-pulse flex-shrink-0" />
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="h-4 bg-muted rounded animate-pulse w-24" />
                    <div className="h-3 bg-muted rounded animate-pulse w-16" />
                  </div>
                </div>
                <div className="h-8 w-16 bg-muted rounded animate-pulse flex-shrink-0" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isError) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Suggested Users
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground py-4">
            <p className="text-sm">
              {error instanceof Error ? error.message : "Failed to load suggestions"}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const suggestions = data?.suggestions || [];

  if (suggestions.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Suggested Users
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <UserSearch className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
            <h3 className="font-medium text-muted-foreground mb-2">No suggestions available</h3>
            <p className="text-sm text-muted-foreground/80 max-w-sm mx-auto">
              We're still learning about your preferences. Follow some users or write reviews to get personalized suggestions!
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Suggested Users
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {suggestions.map((user) => (
            <div
              key={user.id}
              className="flex items-center justify-between p-3 border rounded-lg bg-muted/20 hover:bg-muted/40 transition-colors"
            >
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <Avatar className="h-9 w-9 flex-shrink-0">
                  <AvatarImage
                    src={user.image || undefined}
                    alt={user.name}
                  />
                  <AvatarFallback>
                    {user.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()
                      .slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <Link
                    to={`/user/${user.id}`}
                    className="font-medium hover:underline block truncate"
                  >
                    {user.name}
                  </Link>
                  <p className="text-xs text-muted-foreground">
                    {user.followerCount} follower{user.followerCount !== 1 ? "s" : ""}
                  </p>
                </div>
              </div>
              
              <FollowButton
                userId={user.id}
                isFollowing={user.isFollowing}
                variant="outline"
                size="sm"
                className="flex-shrink-0"
              />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}