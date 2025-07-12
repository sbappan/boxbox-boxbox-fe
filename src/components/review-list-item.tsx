import React from "react";
import type { Review } from "../lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { formatRelativeTime, formatHoverDate } from "@/lib/utils";
import HeartIcon from "@/components/ui/heart-icon";
import { useLikeReview } from "@/lib/queries";
import { authClient } from "@/lib/auth-client";
import { Link } from "react-router-dom";

type ReviewListItemProps = {
  review: Review;
  raceName?: string;
};

const StarIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="currentColor"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

const ReviewListItem = ({ review, raceName }: ReviewListItemProps) => {
  const session = authClient.useSession();
  const likeMutation = useLikeReview();

  // Validate review data
  if (!review || !review.author) {
    console.error('Invalid review data provided to ReviewListItem');
    return null;
  }

  const handleLike = () => {
    if (!session.data?.user || !review.id) return;
    
    likeMutation.mutate({
      reviewId: review.id,
      isLiked: review.isLikedByUser ?? false,
    });
  };

  return (
    <Card data-testid="review-item">
      <CardHeader className="flex flex-row items-center gap-4">
        <Avatar className="w-12 h-12">
          <AvatarImage 
            src={review.avatarUrl} 
            alt={review.author}
            referrerPolicy="no-referrer"
            crossOrigin="anonymous"
          />
          {/* When the author's name is missing, use X as the fallback. */}
          {/* Why X? - x is unknown - math nerd joke */}
          <AvatarFallback>{review.author?.charAt(0)?.toUpperCase() || 'X'}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <CardTitle>{review.author}</CardTitle>
          {raceName && review.raceId && (
            <Link 
              to={`/race/${review.raceId}`} 
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {raceName}
            </Link>
          )}
          <p
            className="text-sm text-gray-500 dark:text-muted-foreground cursor-help"
            title={formatHoverDate(review.date)}
          >
            {formatRelativeTime(review.date)}
          </p>
        </div>
        <div className="flex items-center gap-1">
          {Array.from({ length: 5 }, (_, i) => (
            <StarIcon
              key={i}
              className={`w-5 h-5 ${
                i < review.rating
                  ? "text-yellow-400"
                  : "text-gray-300 dark:text-muted-foreground"
              }`}
            />
          ))}
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-gray-700 dark:text-muted-foreground">
          {review.text}
        </p>
        {session.data?.user && review.id && (
          <div className="flex justify-end items-center gap-2 mt-4">
            <span className="text-sm text-gray-500 dark:text-muted-foreground min-w-[2ch] text-right">
              {review.likeCount ?? 0}
            </span>
            <HeartIcon
              filled={review.isLikedByUser ?? false}
              onClick={handleLike}
              className={likeMutation.isPending ? "opacity-50 cursor-not-allowed" : ""}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ReviewListItem;
