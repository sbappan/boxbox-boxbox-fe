import { Logo } from "./logo";
import { Button } from "../ui/button";
import { Link } from "react-router-dom";
import { ExternalLinkIcon } from "lucide-react";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto max-w-6xl px-4 py-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground flex flex-row items-center gap-2">
              <Logo /> BoxBox BoxBox
            </h3>
            <p className="text-sm text-muted-foreground">
              Your ultimate destination for FORMULA 1 Grand Prix reviews.
            </p>
          </div>
          <div className="space-y-4 col-span-2">
            <h3 className="text-lg font-semibold text-muted-foreground">
              Disclaimer
            </h3>
            <p className="text-sm text-muted-foreground">
              This website is unofficial and is not associated in any way with
              the Formula 1 companies. F1, FORMULA ONE, FORMULA 1, FIA FORMULA
              ONE WORLD CHAMPIONSHIP, GRAND PRIX and related marks are trade
              marks of Formula One Licensing B.V.
            </p>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-8 flex flex-col items-center justify-between space-y-4 border-t border-border/40 pt-6 md:flex-row md:space-y-0">
          <div className="flex flex-col items-center space-y-2 text-sm text-muted-foreground md:flex-row md:space-y-0 md:space-x-4">
            <p>&copy; 2025 BoxBox BoxBox. All rights reserved.</p>
            <div className="flex space-x-4">
              <FooterLinkButton>
                <Link
                  to={import.meta.env.VITE_PRIVACY_POLICY_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-row items-center gap-2"
                >
                  Privacy Policy <ExternalLinkIcon />
                </Link>
              </FooterLinkButton>
              <FooterLinkButton>
                <Link
                  to={import.meta.env.VITE_TERMS_AND_CONDITIONS_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-row items-center gap-2"
                >
                  Terms of Service <ExternalLinkIcon />
                </Link>
              </FooterLinkButton>
              {/* <FooterLinkButton>Contact</FooterLinkButton> */}
            </div>
          </div>
          <div className="text-xs text-muted-foreground">
            Made with ❤️ for F1 fans by an F1 fan
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterLinkButton({ children }: { children: React.ReactNode }) {
  return (
    <Button
      size="sm"
      variant="ghost"
      className="p-0 h-auto text-sm text-muted-foreground hover:text-foreground hover:cursor-pointer hover:underline hover:underline-offset-4"
    >
      {children}
    </Button>
  );
}
