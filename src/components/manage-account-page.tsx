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
import { Calendar, Mail } from "lucide-react";
import { UserAvatar } from "@/components/ui/user-avatar";
import { useDeleteAccount } from "@/lib/queries";
import { format } from "date-fns";

export function ManageAccountPage() {
  const navigate = useNavigate();
  const { data: session } = authClient.useSession();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const deleteAccountMutation = useDeleteAccount();

  if (!session?.user) {
    return null;
  }

  const handleDeleteAccount = async () => {
    try {
      await deleteAccountMutation.mutateAsync(session.user.id);
      await authClient.signOut();
      navigate("/");
    } catch (error) {
      console.error("Failed to delete account:", error);
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
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAccount}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete Account
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}