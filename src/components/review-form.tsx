import React, { useState } from "react";
import type { Review } from "../lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { StarIcon } from "@/components/ui/star-icon";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { authClient } from "@/lib/auth-client";

type ReviewFormProps = {
  onSubmit: (review: Omit<Review, "date" | "avatarUrl">) => void;
  isSubmitting?: boolean;
};

const ReviewForm = ({ onSubmit, isSubmitting = false }: ReviewFormProps) => {
  const session = {
    user: {
      name: "John Doe",
    },
  };
  const [text, setText] = useState("");
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.user || !text) {
      // Basic validation
      return;
    }
    onSubmit({ author: session.user.name, text, rating });
    // Reset form
    setText("");
    setRating(5);
  };

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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Leave a Review</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={session.user.name}
              disabled
              className="bg-muted"
            />
          </div>
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
  );
};

export default ReviewForm;
