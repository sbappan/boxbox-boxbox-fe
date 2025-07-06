import React, { useState } from "react";
import type { Review } from "../lib/types";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { StarIcon } from "@/components/ui/star-icon";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { authClient } from "@/lib/auth-client";
import { useReviews } from "../lib/queries";

type ReviewFormProps = {
  onSubmit: (review: Omit<Review, "date" | "avatarUrl">) => void;
  isSubmitting?: boolean;
  raceId?: string;
};

const ReviewForm = ({
  onSubmit,
  isSubmitting = false,
  raceId,
}: ReviewFormProps) => {
  const { data: session } = authClient.useSession();
  const { data: reviews } = useReviews(raceId);

  const [text, setText] = useState("");
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [hasSubmitted, setHasSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.user || !text) {
      // Basic validation
      return;
    }
    onSubmit({ author: session.user.name, text, rating });
    // Reset form
    setText("");
    setRating(0);
    setHasSubmitted(true);
  };

  // Check if the current user already has a review for this race
  const userHasReview = reviews?.some(
    (review) => review.author === session?.user?.name
  );

  if (!session?.user) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Leave a Review</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Please sign in to leave a review.
          </p>
        </CardContent>
      </Card>
    );
  }

  // Don't show the form if the user already has a review
  if (userHasReview) {
    return null;
  }

  if (hasSubmitted) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Review Submitted!</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            Thank you for your review! It has been submitted successfully.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Leave a Review</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="rating">Rating</Label>
              <div
                className="flex items-center space-x-2"
                onMouseLeave={() => setHoverRating(0)}
              >
                {[1, 2, 3, 4, 5].map((star) => (
                  <StarIcon
                    key={star}
                    className="h-6 w-6 cursor-pointer"
                    fill={
                      (hoverRating || Number(rating)) >= star
                        ? "currentColor"
                        : "none"
                    }
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                  />
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="review">Review</Label>
              <Textarea
                id="review"
                placeholder="Your review"
                value={text}
                onChange={(e) => setText(e.target.value)}
                required
              />
            </div>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Submitting..." : "Submit Review"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Preview Section */}
      {(text || rating > 0) && (
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">Preview of your review</h3>
          <Card>
            <CardHeader className="flex flex-row items-center gap-4">
              <img
                src={
                  session.user.image ||
                  `https://ui-avatars.com/api/?name=${encodeURIComponent(
                    session.user.name
                  )}&background=random`
                }
                alt={session.user.name}
                className="w-12 h-12 rounded-full"
              />
              <div className="flex-1">
                <CardTitle>{session.user.name}</CardTitle>
                <p className="text-sm text-gray-500 dark:text-muted-foreground">
                  Just now
                </p>
              </div>
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }, (_, i) => (
                  <StarIcon
                    key={i}
                    className={`w-5 h-5 ${
                      i < rating
                        ? "text-yellow-400"
                        : "text-gray-300 dark:text-muted-foreground"
                    }`}
                    fill={i < rating ? "currentColor" : "none"}
                  />
                ))}
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 dark:text-muted-foreground">
                {text || "Your review will appear here..."}
              </p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default ReviewForm;
