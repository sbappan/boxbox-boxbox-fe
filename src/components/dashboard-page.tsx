import { useMemo } from "react";
import { useReviews, useRaces } from "@/lib/queries";
import { Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import ReviewListItem from "@/components/review-list-item";
import type { Race } from "@/lib/types";

export function DashboardPage() {
  const { data: reviews, isLoading: reviewsLoading, error: reviewsError } = useReviews();
  const { data: races, isLoading: racesLoading, error: racesError } = useRaces();

  // Create a map of race IDs to race names for quick lookup
  const raceMap = useMemo(() => {
    const map = new Map<string, Race>();
    races?.forEach((race) => {
      map.set(race.id, race);
    });
    return map;
  }, [races]);

  // Combine reviews with race information and sort by date (newest first)
  const reviewsWithRaceInfo = useMemo(() => {
    return reviews?.map((review) => ({
      ...review,
      raceName: review.raceId ? raceMap.get(review.raceId)?.name : undefined,
    }))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()) || [];
  }, [reviews, raceMap]);

  const isLoading = reviewsLoading || racesLoading;
  const error = reviewsError || racesError;

  if (isLoading) {
    return (
      <div className="container mx-auto max-w-2xl p-4 space-y-8">
        <header>
          <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl text-center">
            All Reviews
          </h1>
          <p className="text-center text-muted-foreground mt-2">
            Loading reviews from all races...
          </p>
        </header>
        <div className="flex justify-center items-center py-8">
          <Loader2 className="animate-spin h-8 w-8" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto max-w-2xl p-4 space-y-8">
        <header>
          <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl text-center">
            All Reviews
          </h1>
          <p className="text-center text-muted-foreground mt-2">
            Browse reviews from all Formula 1 races
          </p>
        </header>
        <Alert variant="destructive">
          <AlertDescription>
            Failed to load reviews. Please try refreshing the page.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-2xl p-4 space-y-8">
      <header>
        <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl text-center">
          All Reviews
        </h1>
        <p className="text-center text-muted-foreground mt-2">
          Browse reviews from all Formula 1 races
        </p>
      </header>
      
      {reviewsWithRaceInfo.length === 0 ? (
        <div className="flex justify-center items-center py-8">
          <p className="text-muted-foreground">No reviews yet. Be the first to review a race!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviewsWithRaceInfo.map((review) => (
            <ReviewListItem
              key={review.id}
              review={review}
              raceName={review.raceName}
            />
          ))}
        </div>
      )}
    </div>
  );
}
