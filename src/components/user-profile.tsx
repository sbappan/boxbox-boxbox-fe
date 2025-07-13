import { useUserProfile } from "@/lib/queries";
import { authClient } from "@/lib/auth-client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/ui/user-avatar";
import { FollowButton } from "@/components/follow-button";
import { Calendar, Users } from "lucide-react";
import { format } from "date-fns";

interface UserProfileProps {
  userId: string;
  onFollowersClick?: () => void;
  onFollowingClick?: () => void;
}

export function UserProfile({ userId, onFollowersClick, onFollowingClick }: UserProfileProps) {
  const { data: session } = authClient.useSession();
  const { data: userProfile, isLoading, error } = useUserProfile(userId);

  if (isLoading) {
    return (
      <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="h-16 w-16 bg-muted rounded-full animate-pulse" />
              <div className="space-y-2 flex-1">
                <div className="h-6 bg-muted rounded animate-pulse" />
                <div className="h-4 bg-muted rounded w-2/3 animate-pulse" />
              </div>
            </div>
            <div className="mt-6 grid grid-cols-2 gap-4">
              <div className="h-20 bg-muted rounded animate-pulse" />
              <div className="h-20 bg-muted rounded animate-pulse" />
            </div>
          </CardContent>
        </Card>
    );
  }

  if (error) {
    return (
      <Card>
          <CardContent className="p-6 text-center">
            <h3 className="text-lg font-medium text-muted-foreground">
              User not found
            </h3>
            <p className="text-sm text-muted-foreground mt-2">
              The user you're looking for doesn't exist or you don't have permission to view their profile.
            </p>
          </CardContent>
        </Card>
    );
  }

  if (!userProfile?.user) {
    return null;
  }

  const { user } = userProfile;
  const isOwnProfile = session?.user?.id === userId;

  return (
    <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <UserAvatar 
                name={user.name}
                image={user.image}
                className="h-16 w-16"
              />
              <div className="space-y-1">
                <CardTitle className="text-xl">{user.name}</CardTitle>
                {user.email && isOwnProfile && (
                  <CardDescription className="flex items-center">
                    <Users className="mr-1 h-3 w-3" />
                    {user.email}
                  </CardDescription>
                )}
              </div>
            </div>
            
            {!isOwnProfile && session?.user && (
              <FollowButton
                userId={userId}
                isFollowing={user.isFollowing}
                variant="default"
                size="default"
              />
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Stats Section */}
          <div className="grid grid-cols-2 gap-4">
            <Button
              variant="ghost"
              className="flex flex-col items-center justify-center h-20 space-y-1 hover:bg-accent hover:text-primary transition-colors"
              onClick={onFollowersClick}
              title="View followers list"
            >
              <div className="text-2xl font-bold">{user.followerCount}</div>
              <div className="text-sm text-muted-foreground group-hover:text-primary">
                {user.followerCount === 1 ? 'Follower' : 'Followers'}
              </div>
            </Button>

            <Button
              variant="ghost"
              className="flex flex-col items-center justify-center h-20 space-y-1 hover:bg-accent hover:text-primary transition-colors"
              onClick={onFollowingClick}
              title="View following list"
            >
              <div className="text-2xl font-bold">{user.followingCount}</div>
              <div className="text-sm text-muted-foreground group-hover:text-primary">
                Following
              </div>
            </Button>
          </div>

          {/* Member Since */}
          <div className="pt-4 border-t">
            <div className="flex items-center text-sm text-muted-foreground">
              <Calendar className="mr-2 h-4 w-4" />
              Member since {format(new Date(user.createdAt), "MMMM d, yyyy")}
            </div>
          </div>

          {/* Additional Actions for Own Profile */}
          {isOwnProfile && (
            <div className="pt-4 border-t">
              <Button variant="outline" asChild>
                <a href="/manage-account">
                  Manage Account
                </a>
              </Button>
            </div>
          )}
        </CardContent>
    </Card>
  );
}