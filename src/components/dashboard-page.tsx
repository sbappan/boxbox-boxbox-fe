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
    if (!reviews || reviews.length === 0) {
      return [];
    }

    return reviews
      .map((review) => {
        let raceName: string | undefined;
        
        // Explicit null checks for better error handling
        if (review.raceId && raceMap.has(review.raceId)) {
          const race = raceMap.get(review.raceId);
          if (race && race.name) {
            raceName = race.name;
          } else {
            console.warn(`Race ${review.raceId} exists but has no name`);
          }
        } else if (review.raceId) {
          console.warn(`Review references non-existent race: ${review.raceId}`);
        }

        return {
          ...review,
          raceName,
        };
      })
      .sort((a, b) => {
        // Ensure dates are valid before sorting
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        
        if (isNaN(dateA.getTime()) || isNaN(dateB.getTime())) {
          console.warn('Invalid date found in reviews');
          return 0;
        }
        
        return dateB.getTime() - dateA.getTime();
      });
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
        <Alert variant="destructive" data-testid="error-alert">
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
