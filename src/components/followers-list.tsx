import { useState } from "react";
import { useParams } from "react-router-dom";
import { useFollowers } from "@/lib/queries";
import { FollowButton } from "@/components/follow-button";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

export function FollowersList() {
  const { userId } = useParams<{ userId: string }>();
  const [currentPage, setCurrentPage] = useState(1);
  const limit = 20;

  const {
    data,
    isLoading,
    isError,
    error,
  } = useFollowers(userId || "", currentPage, limit);

  if (!userId) {
    return (
      <div className="container mx-auto max-w-2xl px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-muted-foreground">Invalid User</h1>
          <p className="text-muted-foreground mt-2">Unable to load followers list.</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container mx-auto max-w-2xl px-4 py-8">
        <div className="mb-6">
          <Link
            to={`/user/${userId}`}
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Profile
          </Link>
        </div>
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-6">Followers</h1>
          <div className="flex justify-center items-center py-8">
            <Loader2 className="animate-spin h-8 w-8" />
          </div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="container mx-auto max-w-2xl px-4 py-8">
        <div className="mb-6">
          <Link
            to={`/user/${userId}`}
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Profile
          </Link>
        </div>
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-6">Followers</h1>
          <div className="text-center text-destructive">
            <p>Failed to load followers</p>
            <p className="text-sm text-muted-foreground mt-1">
              {error instanceof Error ? error.message : "Unknown error occurred"}
            </p>
          </div>
        </div>
      </div>
    );
  }

  const followers = data?.followers || [];
  const pagination = data?.pagination;

  return (
    <div className="container mx-auto max-w-2xl px-4 py-8">
      <div className="mb-6">
        <Link
          to={`/user/${userId}`}
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Profile
        </Link>
      </div>

      <div className="mb-6">
        <h1 className="text-2xl font-bold">Followers</h1>
        {pagination && (
          <p className="text-muted-foreground">
            {pagination.total} follower{pagination.total !== 1 ? "s" : ""}
          </p>
        )}
      </div>

      {followers.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground">No followers yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {followers.map((follower) => (
            <div
              key={follower.id}
              className="flex items-center justify-between p-4 border rounded-lg bg-card"
            >
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage
                    src={follower.image || undefined}
                    alt={follower.name}
                  />
                  <AvatarFallback>
                    {follower.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()
                      .slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <Link
                    to={`/user/${follower.id}`}
                    className="font-semibold hover:underline"
                  >
                    {follower.name}
                  </Link>
                  <p className="text-sm text-muted-foreground">
                    {follower.followerCount} follower{follower.followerCount !== 1 ? "s" : ""}
                  </p>
                </div>
              </div>
              
              {follower.id !== userId && (
                <FollowButton
                  userId={follower.id}
                  isFollowing={follower.isFollowing}
                  variant="outline"
                  size="sm"
                />
              )}
            </div>
          ))}
        </div>
      )}

      {pagination && pagination.hasMore && (
        <div className="mt-8 flex justify-center">
          <Button
            onClick={() => setCurrentPage(currentPage + 1)}
            variant="outline"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Loading...
              </>
            ) : (
              "Load More"
            )}
          </Button>
        </div>
      )}

      {pagination && currentPage > 1 && (
        <div className="mt-4 flex justify-center">
          <Button
            onClick={() => setCurrentPage(currentPage - 1)}
            variant="ghost"
            size="sm"
          >
            Previous Page
          </Button>
        </div>
      )}
    </div>
  );
}