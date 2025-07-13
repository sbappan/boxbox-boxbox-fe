import { useParams, useNavigate } from "react-router-dom";
import { UserProfile } from "@/components/user-profile";
import { UserDiscovery } from "@/components/UserDiscovery";

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
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main profile content */}
        <div className="lg:col-span-2">
          <UserProfile
            userId={userId}
            onFollowersClick={handleFollowersClick}
            onFollowingClick={handleFollowingClick}
          />
        </div>
        
        {/* Discovery sidebar */}
        <div className="space-y-6">
          <UserDiscovery limit={5} />
        </div>
      </div>
    </div>
  );
}