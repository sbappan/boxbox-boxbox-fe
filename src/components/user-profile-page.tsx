import { useParams, useNavigate } from "react-router-dom";
import { UserProfile } from "@/components/user-profile";

export function UserProfilePage() {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();

  if (!userId) {
    return (
      <div className="container mx-auto max-w-2xl px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-muted-foreground">User Not Found</h1>
          <p className="text-muted-foreground mt-2">The user profile you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  const handleFollowersClick = () => {
    navigate(`/user/${userId}/followers`);
  };

  const handleFollowingClick = () => {
    navigate(`/user/${userId}/following`);
  };

  return (
    <UserProfile
      userId={userId}
      onFollowersClick={handleFollowersClick}
      onFollowingClick={handleFollowingClick}
    />
  );
}