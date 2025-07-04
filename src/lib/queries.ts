import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Review } from "./types";
import {
  fetchRaces,
  fetchRaceById,
  fetchReviews,
  createReview,
  updateReview,
  deleteReview,
} from "./api";

// Query keys for consistent caching
export const queryKeys = {
  races: ["races"] as const,
  race: (id: string) => ["races", id] as const,
  reviews: ["reviews"] as const,
  reviewsByRace: (raceId: string) => ["reviews", "race", raceId] as const,
} as const;

// Race queries
export function useRaces() {
  return useQuery({
    queryKey: queryKeys.races,
    queryFn: fetchRaces,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useRace(raceId: string) {
  return useQuery({
    queryKey: queryKeys.race(raceId),
    queryFn: () => fetchRaceById(raceId),
    enabled: !!raceId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Review queries
export function useReviews(raceId?: string) {
  return useQuery({
    queryKey: raceId ? queryKeys.reviewsByRace(raceId) : queryKeys.reviews,
    queryFn: () => fetchReviews(raceId),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

// Review mutations
export function useCreateReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createReview,
    onSuccess: (newReview) => {
      // Invalidate and refetch reviews
      queryClient.invalidateQueries({ queryKey: queryKeys.reviews });

      // Optimistically add the new review to the cache
      queryClient.setQueryData<Review[]>(queryKeys.reviews, (oldReviews) => {
        return oldReviews ? [newReview, ...oldReviews] : [newReview];
      });
    },
    onError: (error) => {
      console.error("Failed to create review:", error);
    },
  });
}

export function useUpdateReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      reviewId,
      reviewData,
    }: {
      reviewId: string;
      reviewData: Partial<Review>;
    }) => updateReview(reviewId, reviewData),
    onSuccess: (updatedReview) => {
      // Invalidate and refetch reviews
      queryClient.invalidateQueries({ queryKey: queryKeys.reviews });

      // Update the specific review in the cache
      queryClient.setQueryData<Review[]>(queryKeys.reviews, (oldReviews) => {
        if (!oldReviews) return [updatedReview];
        return oldReviews.map((review) =>
          review === updatedReview ? updatedReview : review
        );
      });
    },
    onError: (error) => {
      console.error("Failed to update review:", error);
    },
  });
}

export function useDeleteReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteReview,
    onSuccess: () => {
      // Invalidate and refetch reviews
      queryClient.invalidateQueries({ queryKey: queryKeys.reviews });
    },
    onError: (error) => {
      console.error("Failed to delete review:", error);
    },
  });
}
