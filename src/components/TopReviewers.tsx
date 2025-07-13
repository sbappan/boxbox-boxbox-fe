import { useTopReviewers } from "@/lib/queries";
import { FollowButton } from "@/components/follow-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { StarIcon } from "@/components/ui/star-icon";
import { Trophy, Medal, PenTool } from "lucide-react";
import { Link } from "react-router-dom";

interface TopReviewersProps {
  limit?: number;
  className?: string;
}

export function TopReviewers({ limit = 10, className }: TopReviewersProps) {
  const {
    data,
    isLoading,
    isError,
    error,
  } = useTopReviewers(limit);

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            Top Reviewers
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array.from({ length: limit }).map((_, index) => (
              <div
                key={index}
                className="flex items-center gap-3 p-3 border rounded-lg bg-muted/20"
              >
                {/* Rank skeleton */}
                <div className="flex-shrink-0 w-6 flex justify-center">
                  <div className="h-4 w-4 bg-muted rounded animate-pulse" />
                </div>

                {/* Avatar skeleton */}
                <div className="h-10 w-10 bg-muted rounded-full animate-pulse flex-shrink-0" />

                {/* User info skeleton */}
                <div className="min-w-0 flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded animate-pulse w-28" />
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-0.5">
                      {Array.from({ length: 5 }).map((_, starIndex) => (
                        <div key={starIndex} className="h-3 w-3 bg-muted rounded animate-pulse" />
                      ))}
                      <div className="h-3 w-6 bg-muted rounded animate-pulse ml-1" />
                    </div>
                    <div className="h-3 w-12 bg-muted rounded animate-pulse" />
                    <div className="h-3 w-16 bg-muted rounded animate-pulse" />
                  </div>
                </div>

                {/* Follow button skeleton */}
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
            <Trophy className="h-5 w-5 text-yellow-500" />
            Top Reviewers
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground py-4">
            <p className="text-sm">
              {error instanceof Error ? error.message : "Failed to load top reviewers"}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const topReviewers = data?.topReviewers || [];

  if (topReviewers.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            Top Reviewers
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <PenTool className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
            <h3 className="font-medium text-muted-foreground mb-2">No reviewers yet</h3>
            <p className="text-sm text-muted-foreground/80 max-w-sm mx-auto">
              Be the first to share your thoughts on the latest Grand Prix races and climb the leaderboard!
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getRankIcon = (index: number) => {
    switch (index) {
      case 0:
        return <Trophy className="h-4 w-4 text-yellow-500" />;
      case 1:
        return <Medal className="h-4 w-4 text-gray-400" />;
      case 2:
        return <Medal className="h-4 w-4 text-amber-600" />;
      default:
        return <span className="text-xs font-bold text-muted-foreground w-4 text-center">#{index + 1}</span>;
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <StarIcon
            key={star}
            className="h-3 w-3"
            fill={star <= Math.round(rating) ? "currentColor" : "none"}
          />
        ))}
        <span className="text-xs text-muted-foreground ml-1">
          {rating.toFixed(1)}
        </span>
      </div>
    );
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-yellow-500" />
          Top Reviewers
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {topReviewers.map((reviewer, index) => (
            <div
              key={reviewer.id}
              className="flex items-center gap-3 p-3 border rounded-lg bg-muted/20 hover:bg-muted/40 transition-colors"
            >
              {/* Rank */}
              <div className="flex-shrink-0 w-6 flex justify-center">
                {getRankIcon(index)}
              </div>

              {/* Avatar */}
              <Avatar className="h-10 w-10 flex-shrink-0">
                <AvatarImage
                  src={reviewer.image || undefined}
                  alt={reviewer.name}
                />
                <AvatarFallback>
                  {reviewer.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase()
                    .slice(0, 2)}
                </AvatarFallback>
              </Avatar>

              {/* User Info */}
              <div className="min-w-0 flex-1">
                <Link
                  to={`/user/${reviewer.id}`}
                  className="font-medium hover:underline block truncate"
                >
                  {reviewer.name}
                </Link>
                <div className="flex items-center gap-3 mt-1">
                  <div className="flex items-center gap-1">
                    {renderStars(reviewer.averageRating)}
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {reviewer.reviewCount} review{reviewer.reviewCount !== 1 ? "s" : ""}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {reviewer.followerCount} follower{reviewer.followerCount !== 1 ? "s" : ""}
                  </span>
                </div>
              </div>

              {/* Follow Button */}
              <FollowButton
                userId={reviewer.id}
                isFollowing={reviewer.isFollowing}
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