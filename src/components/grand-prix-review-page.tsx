import { useParams } from "react-router-dom";
import ReviewForm from "./review-form";
import ReviewList from "./review-list";
import { useCreateReview, useRaces, useReviews } from "../lib/queries";
import { mockReviews } from "../lib/mock-data";
import type { Review } from "../lib/types";
import { Button } from "./ui/button";
import YouTubeIcon from "./ui/youtube-icon";
import { ExternalLinkIcon } from "lucide-react";

const GrandPrixReviewPage = () => {
  const { raceId } = useParams<{ raceId: string }>();
  const { data: races, isLoading: racesLoading } = useRaces(true);

  // Select the current race based on URL parameter or default to latest/first
  const currentRace = raceId
    ? races?.find((race) => race.id === raceId)
    : races?.find((race) => race.latestRace) || races?.[0];
  const currentRaceId = currentRace?.id;

  const {
    data: reviews,
    isLoading: reviewsLoading,
    error,
  } = useReviews(currentRaceId);

  console.log("reviews", reviews);
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

  // Use reviews from API or fallback to mock data if there's an error but only in development
  const displayReviews =
    reviews && reviews.length > 0
      ? reviews
      : process.env.NODE_ENV === "development" &&
        import.meta.env.VITE_SHOW_MOCK_DATA === "true"
      ? mockReviews
      : [];
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
      {currentRace?.highlightsUrl && (
        <div className="flex flex-col items-center gap-2 py-4">
          <p className="text-muted-foreground text-sm">
            Missed the race? Catch the race highlights.
          </p>
          <Button asChild variant="outline" size="default">
            <a
              href={currentRace.highlightsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2"
            >
              <YouTubeIcon />
              Watch Highlights <ExternalLinkIcon />
            </a>
          </Button>
        </div>
      )}
      <ReviewForm
        onSubmit={handleAddReview}
        isSubmitting={createReviewMutation.isPending}
        raceId={currentRaceId}
      />
      <ReviewList reviews={displayReviews} />
    </div>
  );
};

export default GrandPrixReviewPage;
