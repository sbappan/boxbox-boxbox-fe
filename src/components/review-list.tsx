import type { Review } from "../lib/types";
import ReviewListItem from "./review-list-item";

type ReviewListProps = {
  reviews: Review[];
};

const ReviewList = ({ reviews }: ReviewListProps) => {
  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Reviews</h2>
      <div className="space-y-4">
        {reviews.map((review, index) => (
          <ReviewListItem key={index} review={review} />
        ))}
      </div>
    </div>
  );
};

export default ReviewList;
