import type { ReactNode } from "react";
import { authClient } from "@/lib/auth-client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AuthModal } from "@/components/auth/auth-modal";
import { useState } from "react";

interface ProtectedRouteProps {
  children: ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const { data: session, isPending } = authClient.useSession();

  // Show loading state while checking authentication
  if (isPending) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Show login prompt if not authenticated
  if (!session) {
    return (
      <>
        <div className="flex items-center justify-center min-h-[60vh] px-4">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold">
                Authentication Required
              </CardTitle>
              <CardDescription className="text-base">
                Please sign in to access Grand Prix reviews
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center space-y-2">
                <p className="text-sm text-muted-foreground">
                  Join our community to share your thoughts on races, read
                  reviews from fellow F1 fans, and participate in discussions.
                </p>
              </div>
              <div className="space-y-3">
                <Button
                  onClick={() => setIsAuthModalOpen(true)}
                  className="w-full"
                  size="lg"
                >
                  Sign In to Continue
                </Button>
                <Button
                  onClick={() => window.history.back()}
                  variant="outline"
                  className="w-full"
                >
                  Go Back
                </Button>
                <p className="text-xs text-center text-muted-foreground">
                  Sign in to access all features
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
        />
      </>
    );
  }

  // Render protected content if authenticated
  return <>{children}</>;
}
