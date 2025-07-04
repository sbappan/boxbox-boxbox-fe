import type { Review, Race } from "./types";

const API_BASE_URL =
  import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

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
    ...options,
  };

  const response = await fetch(url, config);

  if (!response.ok) {
    throw new Error(
      `API request failed: ${response.status} ${response.statusText}`
    );
  }

  return response.json();
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
