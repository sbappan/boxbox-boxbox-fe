import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Review } from "./types";
import {
  fetchRaces,
  fetchRaceById,
  fetchReviews,
  createReview,
  updateReview,
  deleteReview,
  likeReview,
  unlikeReview,
  deleteAccount,
} from "./api";

// Query keys for consistent caching
export const queryKeys = {
  races: ["races"] as const,
  race: (id: string) => ["races", id] as const,
  reviews: ["reviews"] as const,
  reviewsByRace: (raceId: string) => ["reviews", "race", raceId] as const,
} as const;

// Race queries
export function useRaces(enabled = true) {
  return useQuery({
    queryKey: queryKeys.races,
    queryFn: fetchRaces,
    enabled,
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

// Like/unlike mutations with optimistic updates
export function useLikeReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ reviewId, isLiked }: { reviewId: string; isLiked: boolean }) => 
      isLiked ? unlikeReview(reviewId) : likeReview(reviewId),
    onMutate: async ({ reviewId, isLiked }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.reviews });

      // Snapshot the previous value
      const previousReviews = queryClient.getQueryData<Review[]>(queryKeys.reviews);

      // Optimistically update the review
      queryClient.setQueryData<Review[]>(queryKeys.reviews, (oldReviews) => {
        if (!oldReviews) return oldReviews;
        return oldReviews.map((review) => {
          if (review.id === reviewId) {
            return {
              ...review,
              likeCount: (review.likeCount ?? 0) + (isLiked ? -1 : 1),
              isLikedByUser: !isLiked,
            };
          }
          return review;
        });
      });

      // Also update reviews by race if they exist
      const allQueries = queryClient.getQueriesData<Review[]>({ 
        queryKey: ["reviews"], 
        exact: false 
      });
      
      allQueries.forEach(([queryKey, data]) => {
        if (data) {
          queryClient.setQueryData<Review[]>(queryKey, (oldReviews) => {
            if (!oldReviews) return oldReviews;
            return oldReviews.map((review) => {
              if (review.id === reviewId) {
                return {
                  ...review,
                  likeCount: (review.likeCount ?? 0) + (isLiked ? -1 : 1),
                  isLikedByUser: !isLiked,
                };
              }
              return review;
            });
          });
        }
      });

      // Return a context object with the snapshotted value
      return { previousReviews };
    },
    onError: (err, _, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousReviews) {
        queryClient.setQueryData(queryKeys.reviews, context.previousReviews);
      }
      console.error("Failed to update like:", err);
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: queryKeys.reviews });
    },
  });
}

// User mutations
export function useDeleteAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteAccount,
    onSuccess: () => {
      // Clear all cached data after account deletion
      queryClient.clear();
    },
    onError: (error) => {
      console.error("Failed to delete account:", error);
    },
  });
}
