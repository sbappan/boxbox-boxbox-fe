import type { Review, Race } from "./types";

const API_BASE_URL =
  import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

// Enhanced error class for API errors
export class ApiError extends Error {
  public status: number;
  public statusText: string;
  public serverMessage?: string;
  public endpoint?: string;

  constructor(
    status: number,
    statusText: string,
    serverMessage?: string,
    endpoint?: string
  ) {
    super(`API request failed: ${status} ${statusText}`);
    this.name = 'ApiError';
    this.status = status;
    this.statusText = statusText;
    this.serverMessage = serverMessage;
    this.endpoint = endpoint;
  }
}

// Generic API request function
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  const config: RequestInit = {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    credentials: "include", // Include cookies for authentication
    ...options,
  };

  try {
    const response = await fetch(url, config);

    if (!response.ok) {
      // Try to extract error message from response body
      let serverMessage: string | undefined;
      try {
        const errorBody = await response.text();
        const parsedError = JSON.parse(errorBody);
        serverMessage = parsedError.message || parsedError.error || errorBody;
      } catch {
        // If parsing fails, use status text
        serverMessage = response.statusText;
      }

      throw new ApiError(
        response.status,
        response.statusText,
        serverMessage,
        endpoint
      );
    }

    return response.json();
  } catch (error) {
    // Re-throw ApiError as-is
    if (error instanceof ApiError) {
      throw error;
    }
    
    // Handle network errors (fetch failures)
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('Network error. Please check your connection and try again.');
    }
    
    // Handle other errors
    throw new Error('An unexpected error occurred. Please try again.');
  }
}

// Race-related API functions
export async function fetchRaces(): Promise<Race[]> {
  return apiRequest<Race[]>("/api/races");
}

export async function fetchRaceById(raceId: string): Promise<Race> {
  return apiRequest<Race>(`/api/races/${raceId}`);
}

// Review-related API functions
export async function fetchReviews(raceId?: string): Promise<Review[]> {
  const endpoint = raceId ? `/api/reviews?raceId=${raceId}` : "/api/reviews";
  return apiRequest<Review[]>(endpoint);
}

export async function fetchReviewById(reviewId: string): Promise<Review> {
  return apiRequest<Review>(`/api/reviews/${reviewId}`);
}

export async function createReview(
  reviewData: Omit<Review, "date" | "avatarUrl" | "id"> & { raceId: string }
): Promise<Review> {
  return apiRequest<Review>("/api/reviews", {
    method: "POST",
    body: JSON.stringify(reviewData),
  });
}

export async function updateReview(
  reviewId: string,
  reviewData: Partial<Review>
): Promise<Review> {
  return apiRequest<Review>(`/api/reviews/${reviewId}`, {
    method: "PUT",
    body: JSON.stringify(reviewData),
  });
}

export async function deleteReview(reviewId: string): Promise<void> {
  return apiRequest<void>(`/api/reviews/${reviewId}`, {
    method: "DELETE",
  });
}

export async function likeReview(reviewId: string): Promise<{ message: string; likeCount: number }> {
  return apiRequest<{ message: string; likeCount: number }>(`/api/reviews/${reviewId}/like`, {
    method: "POST",
  });
}

export async function unlikeReview(reviewId: string): Promise<{ message: string; likeCount: number }> {
  return apiRequest<{ message: string; likeCount: number }>(`/api/reviews/${reviewId}/like`, {
    method: "DELETE",
  });
}

// User-related API functions
export async function deleteAccount(userId: string): Promise<void> {
  // Validate userId before making API call
  if (!userId) {
    throw new Error("User ID is required");
  }
  
  if (typeof userId !== 'string') {
    throw new Error("User ID must be a string");
  }
  
  if (!userId.trim()) {
    throw new Error("User ID cannot be empty or whitespace");
  }

  return apiRequest<void>(`/api/user/${userId}`, {
    method: "DELETE",
  });
}

// Follow-related API functions
export async function followUser(userId: string): Promise<{ message: string }> {
  return apiRequest<{ message: string }>(`/api/users/${userId}/follow`, {
    method: "POST",
  });
}

export async function unfollowUser(userId: string): Promise<{ message: string }> {
  return apiRequest<{ message: string }>(`/api/users/${userId}/follow`, {
    method: "DELETE",
  });
}

export async function fetchUserProfile(userId: string): Promise<{
  user: {
    id: string;
    name: string;
    email?: string;
    image: string | null;
    followerCount: number;
    followingCount: number;
    createdAt: string;
    isFollowing: boolean;
  };
}> {
  return apiRequest<{
    user: {
      id: string;
      name: string;
      email?: string;
      image: string | null;
      followerCount: number;
      followingCount: number;
      createdAt: string;
      isFollowing: boolean;
    };
  }>(`/api/user/${userId}`);
}

export async function fetchFollowers(userId: string, page = 1, limit = 20): Promise<{
  followers: Array<{
    id: string;
    name: string;
    image: string | null;
    followerCount: number;
    isFollowing: boolean;
  }>;
  pagination: {
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
  };
}> {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });
  
  return apiRequest<{
    followers: Array<{
      id: string;
      name: string;
      image: string | null;
      followerCount: number;
      isFollowing: boolean;
    }>;
    pagination: {
      page: number;
      limit: number;
      total: number;
      hasMore: boolean;
    };
  }>(`/api/users/${userId}/followers?${params}`);
}

export async function fetchFollowing(userId: string, page = 1, limit = 20): Promise<{
  following: Array<{
    id: string;
    name: string;
    image: string | null;
    followerCount: number;
    isFollowing: boolean;
  }>;
  pagination: {
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
  };
}> {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });
  
  return apiRequest<{
    following: Array<{
      id: string;
      name: string;
      image: string | null;
      followerCount: number;
      isFollowing: boolean;
    }>;
    pagination: {
      page: number;
      limit: number;
      total: number;
      hasMore: boolean;
    };
  }>(`/api/users/${userId}/following?${params}`);
}
