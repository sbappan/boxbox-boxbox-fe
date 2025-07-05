import { useParams } from "react-router-dom";
import ReviewForm from "./review-form";
import ReviewList from "./review-list";
import { useCreateReview, useRaces } from "../lib/queries";
import { mockReviews } from "../lib/mock-data";
import type { Review } from "../lib/types";

const GrandPrixReviewPage = () => {
  const { raceId } = useParams<{ raceId: string }>();
  const { data: races, isLoading: racesLoading } = useRaces();

  // Select the current race based on URL parameter or default to latest/first
  const currentRace = raceId
    ? races?.find((race) => race.id === raceId)
    : races?.find((race) => race.latestRace) || races?.[0];
  const currentRaceId = currentRace?.id;

  // const {
  //   data: reviews,
  //   isLoading: reviewsLoading,
  //   error,
  // } = useReviews(currentRaceId);
  const reviews = mockReviews;
  const reviewsLoading = false;
  const error = false;
  const createReviewMutation = useCreateReview();

  const handleAddReview = (
    review: Omit<Review, "date" | "avatarUrl" | "id">
  ) => {
    if (!currentRaceId) {
      console.error("No race selected");
      return;
    }

    const reviewWithRaceId = {
      ...review,
      raceId: currentRaceId,
    };

    createReviewMutation.mutate(reviewWithRaceId);
  };

  // Show loading state
  if (racesLoading || reviewsLoading) {
    return (
      <div className="container mx-auto max-w-2xl p-4 space-y-8">
        <header>
          <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl text-center">
            Loading...
          </h1>
          <p className="text-center text-muted-foreground mt-2">
            Loading race information...
          </p>
        </header>
        <div className="flex justify-center items-center py-8">
          <p className="text-muted-foreground">Loading reviews...</p>
        </div>
      </div>
    );
  }

  // Show error state if race not found
  if (raceId && !currentRace) {
    return (
      <div className="container mx-auto max-w-2xl p-4 space-y-8">
        <header>
          <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl text-center">
            Race Not Found
          </h1>
          <p className="text-center text-muted-foreground mt-2">
            The requested race could not be found.
          </p>
        </header>
      </div>
    );
  }

  // Show error state with fallback to mock data
  if (error) {
    console.error("Failed to fetch reviews:", error);
  }

  // Use reviews from API or fallback to mock data if there's an error
  const displayReviews = reviews || mockReviews;
  const displayRaceName = currentRace?.name || "Austrian Grand Prix 2025";

  return (
    <div className="container mx-auto max-w-2xl p-4 space-y-8">
      <header>
        <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl text-center">
          {displayRaceName}
        </h1>
        <p className="text-center text-muted-foreground mt-2">
          Share your experience and read what others thought!
        </p>
        {error && (
          <p className="text-center text-amber-600 text-sm mt-1">
            Using offline data (backend unavailable)
          </p>
        )}
      </header>
      <ReviewForm
        onSubmit={handleAddReview}
        isSubmitting={createReviewMutation.isPending}
      />
      <ReviewList reviews={displayReviews} />
    </div>
  );
};

export default GrandPrixReviewPage;
