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
  followUser,
  unfollowUser,
  fetchUserProfile,
  fetchFollowers,
  fetchFollowing,
  fetchUserSuggestions,
  fetchTopReviewers,
  fetchFollowingFeed,
} from "./api";

// Query keys for consistent caching
export const queryKeys = {
  races: ["races"] as const,
  race: (id: string) => ["races", id] as const,
  reviews: ["reviews"] as const,
  reviewsByRace: (raceId: string) => ["reviews", "race", raceId] as const,
  user: (id: string) => ["user", id] as const,
  users: ["users"] as const,
  followers: (userId: string, page: number) => ["followers", userId, page] as const,
  following: (userId: string, page: number) => ["following", userId, page] as const,
  userSuggestions: ["userSuggestions"] as const,
  topReviewers: ["topReviewers"] as const,
  followingFeed: (page: number) => ["followingFeed", page] as const,
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

// Follow mutations
export function useFollow() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, isFollowing }: { userId: string; isFollowing: boolean }) =>
      isFollowing ? unfollowUser(userId) : followUser(userId),
    onMutate: async ({ userId, isFollowing }) => {
      // Cancel any outgoing refetches for user profile
      await queryClient.cancelQueries({ queryKey: queryKeys.user(userId) });

      // Snapshot the previous value
      const previousUserProfile = queryClient.getQueryData(queryKeys.user(userId));

      // Optimistically update the user profile
      queryClient.setQueryData(queryKeys.user(userId), (old: unknown) => {
        if (!old || typeof old !== 'object' || !('user' in old)) return old;
        const oldData = old as { user: { isFollowing: boolean; followerCount: number; [key: string]: unknown } };
        return {
          ...oldData,
          user: {
            ...oldData.user,
            isFollowing: !isFollowing,
            followerCount: oldData.user.followerCount + (isFollowing ? -1 : 1),
          },
        };
      });

      // Also optimistically update followers/following lists
      const allFollowersQueries = queryClient.getQueriesData({ 
        queryKey: ["followers"], 
        exact: false 
      });
      
      const allFollowingQueries = queryClient.getQueriesData({ 
        queryKey: ["following"], 
        exact: false 
      });

      // Update follow status in followers lists
      allFollowersQueries.forEach(([queryKey, data]) => {
        if (data && typeof data === 'object' && 'followers' in data) {
          queryClient.setQueryData(queryKey, (old: unknown) => {
            if (!old || typeof old !== 'object' || !('followers' in old)) return old;
            const oldData = old as { followers: Array<{ id: string; isFollowing: boolean; [key: string]: unknown }> };
            return {
              ...oldData,
              followers: oldData.followers.map((follower) => 
                follower.id === userId 
                  ? { ...follower, isFollowing: !isFollowing }
                  : follower
              ),
            };
          });
        }
      });

      // Update follow status in following lists
      allFollowingQueries.forEach(([queryKey, data]) => {
        if (data && typeof data === 'object' && 'following' in data) {
          queryClient.setQueryData(queryKey, (old: unknown) => {
            if (!old || typeof old !== 'object' || !('following' in old)) return old;
            const oldData = old as { following: Array<{ id: string; isFollowing: boolean; [key: string]: unknown }> };
            return {
              ...oldData,
              following: oldData.following.map((following) => 
                following.id === userId 
                  ? { ...following, isFollowing: !isFollowing }
                  : following
              ),
            };
          });
        }
      });

      // Return context for rollback
      return { 
        previousUserProfile,
        userId,
        wasFollowing: isFollowing,
      };
    },
    onError: (err, _variables, context) => {
      // Rollback optimistic update
      if (context?.previousUserProfile) {
        queryClient.setQueryData(queryKeys.user(context.userId), context.previousUserProfile);
      }
      
      // Rollback followers/following list updates
      const allFollowersQueries = queryClient.getQueriesData({ 
        queryKey: ["followers"], 
        exact: false 
      });
      
      const allFollowingQueries = queryClient.getQueriesData({ 
        queryKey: ["following"], 
        exact: false 
      });

      // Revert follow status in followers lists
      allFollowersQueries.forEach(([queryKey]) => {
        queryClient.setQueryData(queryKey, (old: unknown) => {
          if (!old || typeof old !== 'object' || !('followers' in old)) return old;
          const oldData = old as { followers: Array<{ id: string; isFollowing: boolean; [key: string]: unknown }> };
          return {
            ...oldData,
            followers: oldData.followers.map((follower) => 
              follower.id === context?.userId 
                ? { ...follower, isFollowing: context?.wasFollowing }
                : follower
            ),
          };
        });
      });

      // Revert follow status in following lists
      allFollowingQueries.forEach(([queryKey]) => {
        queryClient.setQueryData(queryKey, (old: unknown) => {
          if (!old || typeof old !== 'object' || !('following' in old)) return old;
          const oldData = old as { following: Array<{ id: string; isFollowing: boolean; [key: string]: unknown }> };
          return {
            ...oldData,
            following: oldData.following.map((following) => 
              following.id === context?.userId 
                ? { ...following, isFollowing: context?.wasFollowing }
                : following
            ),
          };
        });
      });

      console.error("Failed to update follow status:", err);
    },
    onSettled: (_data, _error, variables) => {
      // Always refetch after error or success to ensure consistency
      queryClient.invalidateQueries({ queryKey: queryKeys.user(variables.userId) });
      queryClient.invalidateQueries({ queryKey: ["followers"] });
      queryClient.invalidateQueries({ queryKey: ["following"] });
    },
  });
}

// User profile query
export function useUserProfile(userId: string) {
  return useQuery({
    queryKey: queryKeys.user(userId),
    queryFn: () => fetchUserProfile(userId),
    enabled: !!userId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

// Followers and following queries
export function useFollowers(userId: string, page = 1, limit = 20) {
  return useQuery({
    queryKey: queryKeys.followers(userId, page),
    queryFn: () => fetchFollowers(userId, page, limit),
    enabled: !!userId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

export function useFollowing(userId: string, page = 1, limit = 20) {
  return useQuery({
    queryKey: queryKeys.following(userId, page),
    queryFn: () => fetchFollowing(userId, page, limit),
    enabled: !!userId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

// User suggestions query
export function useUserSuggestions(limit = 10) {
  return useQuery({
    queryKey: queryKeys.userSuggestions,
    queryFn: () => fetchUserSuggestions(limit),
    staleTime: 5 * 60 * 1000, // 5 minutes - suggestions don't change frequently
  });
}

// Top reviewers query
export function useTopReviewers(limit = 10) {
  return useQuery({
    queryKey: queryKeys.topReviewers,
    queryFn: () => fetchTopReviewers(limit),
    staleTime: 10 * 60 * 1000, // 10 minutes - leaderboard changes slowly
  });
}

// Following feed query
export function useFollowingFeed(page = 1, limit = 20) {
  return useQuery({
    queryKey: queryKeys.followingFeed(page),
    queryFn: () => fetchFollowingFeed(page, limit),
    staleTime: 2 * 60 * 1000, // 2 minutes - feed should be relatively fresh
  });
}
