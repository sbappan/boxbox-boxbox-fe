import React from "react";
import type { Review } from "../lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type ReviewListItemProps = {
  review: Review;
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

const ReviewListItem = ({ review }: ReviewListItemProps) => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-4">
        <img
          src={review.avatarUrl}
          alt={review.author}
          className="w-12 h-12 rounded-full"
        />
        <div className="flex-1">
          <CardTitle>{review.author}</CardTitle>
          <p className="text-sm text-gray-500 dark:text-muted-foreground">
            {review.date}
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
      </CardContent>
    </Card>
  );
};

export default ReviewListItem;
