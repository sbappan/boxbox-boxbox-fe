import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Calendar, Mail, RotateCcw } from "lucide-react";
import { UserAvatar } from "@/components/ui/user-avatar";
import { useDeleteAccount } from "@/lib/queries";
import { format } from "date-fns";
import { toast } from "sonner";
import { ApiError } from "@/lib/api";

// Error categorization helper
function categorizeError(error: unknown): { message: string; isRecoverable: boolean; shouldCloseDialog: boolean } {
  // Network errors
  if (error instanceof Error && error.message.includes('Network error')) {
    return {
      message: error.message,
      isRecoverable: true,
      shouldCloseDialog: false
    };
  }

  // API errors with status codes
  if (error instanceof ApiError) {
    if (error.status === 401 || error.status === 403) {
      return {
        message: "Your session has expired. Please sign in again.",
        isRecoverable: false,
        shouldCloseDialog: true
      };
    }
    
    if (error.status >= 500) {
      return {
        message: error.serverMessage || "Server error. Please try again later or contact support.",
        isRecoverable: true,
        shouldCloseDialog: false
      };
    }
    
    if (error.status === 404) {
      return {
        message: "Account not found. Please refresh the page and try again.",
        isRecoverable: false,
        shouldCloseDialog: true
      };
    }
    
    // Other client errors (400, etc.)
    return {
      message: error.serverMessage || "Invalid request. Please refresh and try again.",
      isRecoverable: false,
      shouldCloseDialog: true
    };
  }

  // Generic error fallback
  const message = error instanceof Error ? error.message : "An unexpected error occurred. Please try again.";
  return {
    message,
    isRecoverable: true,
    shouldCloseDialog: false
  };
}

export function ManageAccountPage() {
  const navigate = useNavigate();
  const { data: session } = authClient.useSession();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [lastError, setLastError] = useState<{ message: string; isRecoverable: boolean } | null>(null);
  const deleteAccountMutation = useDeleteAccount();

  if (!session?.user) {
    return null;
  }

  const handleDeleteAccount = async () => {
    setLastError(null);
    
    try {
      await deleteAccountMutation.mutateAsync(session.user.id);
      toast.success("Account successfully deleted");
      
      // Close dialog and logout after brief delay
      setShowDeleteDialog(false);
      setTimeout(async () => {
        await authClient.signOut();
        navigate("/");
      }, 1500);
    } catch (error) {
      console.error("Failed to delete account:", error, {
        userId: session.user.id,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent
      });
      
      const { message, isRecoverable, shouldCloseDialog } = categorizeError(error);
      
      toast.error(message);
      setLastError({ message, isRecoverable });
      
      if (shouldCloseDialog) {
        setShowDeleteDialog(false);
        
        // For auth errors, redirect to sign in
        if (message.includes('session has expired')) {
          setTimeout(() => {
            window.location.reload();
          }, 2000);
        }
      }
    }
  };

  return (
    <div className="container mx-auto max-w-2xl px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Manage Account</h1>

      <div className="space-y-6">
        {/* Account Information */}
        <Card>
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
            <CardDescription>Your personal account details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-4">
              <UserAvatar 
                name={session.user.name}
                image={session.user.image}
                className="h-16 w-16"
              />
              <div className="space-y-1">
                <h3 className="text-lg font-medium">{session.user.name}</h3>
                <div className="flex items-center text-sm text-muted-foreground">
                  <Mail className="mr-1 h-3 w-3" />
                  {session.user.email}
                </div>
              </div>
            </div>

            <div className="pt-4 border-t">
              <div className="flex items-center text-sm text-muted-foreground">
                <Calendar className="mr-2 h-4 w-4" />
                Member since {format(new Date(session.user.createdAt), "MMMM d, yyyy")}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Delete Account */}
        <Card className="border-destructive/50">
          <CardHeader>
            <CardTitle className="text-destructive">Delete Account</CardTitle>
            <CardDescription>
              Permanently delete your account and all associated data
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Once you delete your account, there is no going back. Please be certain.
            </p>
            <Button
              variant="destructive"
              onClick={() => setShowDeleteDialog(true)}
              disabled={deleteAccountMutation.isPending}
            >
              Delete Account
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your account
              and remove all of your data including your reviews and ratings.
            </AlertDialogDescription>
          </AlertDialogHeader>
          {/* Show error details if error occurred */}
          {lastError && (
            <div className="text-sm text-muted-foreground p-3 bg-muted rounded-md">
              <p className="font-medium mb-1">Error details:</p>
              <p>{lastError.message}</p>
              {lastError.isRecoverable && (
                <p className="mt-1 text-xs">You can try again or close this dialog.</p>
              )}
            </div>
          )}
          
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteAccountMutation.isPending}>
              Cancel
            </AlertDialogCancel>
            
            {/* Show retry button for recoverable errors */}
            {lastError?.isRecoverable && (
              <Button
                variant="outline"
                onClick={handleDeleteAccount}
                disabled={deleteAccountMutation.isPending}
                className="mr-2"
              >
                <RotateCcw className="mr-2 h-4 w-4" />
                {deleteAccountMutation.isPending ? "Retrying..." : "Retry"}
              </Button>
            )}
            
            <AlertDialogAction
              onClick={handleDeleteAccount}
              disabled={deleteAccountMutation.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteAccountMutation.isPending ? "Deleting..." : "Delete Account"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}