import { useState } from "react";
import { Link } from "react-router-dom";
import { ModeToggle } from "../ui/mode-toggle";
import { useRaces } from "@/lib/queries";
import { Button } from "../ui/button";
import { AuthModal } from "../auth/auth-modal";
import { UserMenu } from "../auth/user-menu";
import { authClient } from "@/lib/auth-client";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "../ui/navigation-menu";
import { Logo } from "./logo";

export function Header() {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const { data: session } = authClient.useSession();
  const { data: races, isLoading, isError } = useRaces(!!session?.user);
  console.log("races", { races });
  console.log("session", { session });

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-14 max-w-2xl items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <Logo />
            {session?.user ? (
              <NavigationMenu>
                <NavigationMenuList>
                  <NavigationMenuItem>
                    <NavigationMenuLink asChild>
                      <Link
                        to="/"
                        className="font-bold px-3 py-2 rounded-md transition-all duration-200 hover:text-foreground hover:bg-accent/50"
                      >
                        Dashboard
                      </Link>
                    </NavigationMenuLink>
                  </NavigationMenuItem>
                  <NavigationMenuItem>
                    <NavigationMenuTrigger className="px-3 py-2 text-foreground/60">
                      2025
                    </NavigationMenuTrigger>
                    <NavigationMenuContent>
                      <div className="w-56 p-1">
                        {isLoading && (
                          <div className="px-3 py-1.5 text-sm text-muted-foreground">
                            Loading races...
                          </div>
                        )}
                        {isError && (
                          <div className="px-3 py-1.5 text-sm text-destructive">
                            Failed to load races
                          </div>
                        )}
                        {races &&
                          races.map((race) => (
                            <NavigationMenuLink key={race.id} asChild>
                              <Link
                                to={`/race/${race.id}`}
                                className={`w-full flex flex-row justify-start items-center text-left px-3 py-1.5 rounded-md transition-all duration-200 text-sm ${
                                  race.latestRace
                                    ? "bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground"
                                    : "hover:bg-accent/50"
                                }`}
                              >
                                {race.name}
                              </Link>
                            </NavigationMenuLink>
                          ))}
                      </div>
                    </NavigationMenuContent>
                  </NavigationMenuItem>
                </NavigationMenuList>
              </NavigationMenu>
            ) : null}
          </div>

          <div className="flex items-center gap-2">
            {session?.user ? (
              <UserMenu user={session.user} />
            ) : (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsAuthModalOpen(true)}
              >
                Sign In
              </Button>
            )}
            <ModeToggle />
          </div>
        </div>
      </header>

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </>
  );
}
