import GrandPrixReviewPage from "./components/grand-prix-review-page";
import { Header } from "./components/header";

function App() {
  return (
    <div className="relative flex min-h-screen w-full flex-col before:absolute before:inset-0 before:-z-10 before:bg-[url(./assets/images/bg.svg)] before:bg-repeat before:bg-center before:bg-[length:85%_auto] before:opacity-20 sm:px-20 sm:before:bg-cover sm:before:bg-no-repeat dark:before:opacity-30">
      <Header />
      <main className="py-8">
        <GrandPrixReviewPage />
      </main>
    </div>
  );
}

export default App;
