import { useState } from "react";
import { useFollowingFeed } from "@/lib/queries";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import ReviewListItem from "@/components/review-list-item";
import { Loader2, Users, UserPlus } from "lucide-react";
import { Link } from "react-router-dom";

export function FollowingFeed() {
  const [currentPage, setCurrentPage] = useState(1);
  const limit = 20;
  const { data: session } = authClient.useSession();

  const {
    data,
    isLoading,
    isError,
    error,
  } = useFollowingFeed(currentPage, limit);

  // Redirect to login if not authenticated (this page requires auth)
  if (!session?.user) {
    return (
      <div className="container mx-auto max-w-2xl px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-muted-foreground">Authentication Required</h1>
          <p className="text-muted-foreground mt-2">You need to be logged in to view your following feed.</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container mx-auto max-w-2xl px-4 py-8">
        <header className="mb-8">
          <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl text-center">
            Following Feed
          </h1>
          <p className="text-center text-muted-foreground mt-2">
            Reviews from people you follow
          </p>
        </header>
        <div className="flex justify-center items-center py-8">
          <Loader2 className="animate-spin h-8 w-8" />
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="container mx-auto max-w-2xl px-4 py-8">
        <header className="mb-8">
          <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl text-center">
            Following Feed
          </h1>
          <p className="text-center text-muted-foreground mt-2">
            Reviews from people you follow
          </p>
        </header>
        <Alert variant="destructive">
          <AlertDescription>
            {error instanceof Error ? error.message : "Failed to load your following feed. Please try again."}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const reviews = data?.reviews || [];
  const pagination = data?.pagination;

  return (
    <div className="container mx-auto max-w-2xl px-4 py-8">
      <header className="mb-8">
        <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl text-center">
          Following Feed
        </h1>
        <p className="text-center text-muted-foreground mt-2">
          Reviews from people you follow
        </p>
      </header>

      {reviews.length === 0 ? (
        <div className="text-center py-12">
          <UserPlus className="h-16 w-16 text-muted-foreground/50 mx-auto mb-6" />
          <h3 className="text-xl font-medium text-muted-foreground mb-4">Your feed is empty</h3>
          <p className="text-muted-foreground/80 max-w-md mx-auto mb-6">
            You're not following anyone yet, or the people you follow haven't written any reviews. 
            Start following other F1 fans to see their reviews here!
          </p>
          <div className="space-y-3">
            <Button asChild>
              <Link to="/">
                <Users className="h-4 w-4 mr-2" />
                Discover Users
              </Link>
            </Button>
            <p className="text-sm text-muted-foreground">
              Find interesting reviewers on the home page
            </p>
          </div>
        </div>
      ) : (
        <>
          <div className="space-y-4 mb-8">
            {reviews.map((review) => (
              <ReviewListItem
                key={review.id}
                review={review}
                raceName={review.raceName}
              />
            ))}
          </div>

          {/* Pagination */}
          {pagination && (
            <div className="flex justify-center items-center gap-4">
              {currentPage > 1 && (
                <Button
                  onClick={() => setCurrentPage(currentPage - 1)}
                  variant="outline"
                  disabled={isLoading}
                >
                  Previous
                </Button>
              )}
              
              <span className="text-sm text-muted-foreground px-4">
                Page {currentPage} of {Math.ceil(pagination.total / pagination.limit)}
              </span>

              {pagination.hasMore && (
                <Button
                  onClick={() => setCurrentPage(currentPage + 1)}
                  variant="outline"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    "Next"
                  )}
                </Button>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}