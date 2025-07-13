import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HomePage } from "./components/home-page";
import { Header } from "./components/layout/header";
import { Footer } from "./components/layout/footer";
import { ProtectedRoute } from "./components/protected-route";
import GrandPrixReviewPage from "./components/grand-prix-review-page";
import { ManageAccountPage } from "./components/manage-account-page";
import { UserProfilePage } from "./components/user-profile-page";
import { FollowersList } from "./components/followers-list";
import { FollowingList } from "./components/following-list";
import { Toaster } from "./components/ui/sonner";

function App() {
  return (
    <BrowserRouter>
      <div className="relative flex min-h-screen w-full flex-col before:absolute before:inset-0 before:-z-10 before:bg-[url(./assets/images/bg.svg)] before:bg-repeat before:bg-center before:bg-[length:85%_auto] before:opacity-20 sm:px-20 sm:before:bg-cover sm:before:bg-no-repeat dark:before:opacity-30">
        <Header />
        <main className="flex-1 py-8">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route
              path="/race/:raceId"
              element={
                <ProtectedRoute>
                  <GrandPrixReviewPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/manage-account"
              element={
                <ProtectedRoute>
                  <ManageAccountPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/user/:userId"
              element={
                <ProtectedRoute>
                  <UserProfilePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/user/:userId/followers"
              element={
                <ProtectedRoute>
                  <FollowersList />
                </ProtectedRoute>
              }
            />
            <Route
              path="/user/:userId/following"
              element={
                <ProtectedRoute>
                  <FollowingList />
                </ProtectedRoute>
              }
            />
          </Routes>
        </main>
        <Footer />
        <Toaster />
      </div>
    </BrowserRouter>
  );
}

export default App;
