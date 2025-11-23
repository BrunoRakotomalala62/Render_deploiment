import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "./theme-toggle";
import { Rocket, LayoutDashboard } from "lucide-react";
import { SiGithub } from "react-icons/si";

export function Header() {
  const [location] = useLocation();
  const isLanding = location === "/";

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4 md:px-6">
        <Link href="/" data-testid="link-home">
          <a className="flex items-center gap-2 hover-elevate active-elevate-2 rounded-md px-2 py-1">
            <Rocket className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold tracking-tight">DeployHub</span>
          </a>
        </Link>

        <div className="flex items-center gap-2">
          {!isLanding && (
            <Link href="/dashboard" data-testid="link-dashboard">
              <a>
                <Button variant="ghost" className="gap-2">
                  <LayoutDashboard className="h-4 w-4" />
                  Dashboard
                </Button>
              </a>
            </Link>
          )}
          
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            data-testid="link-github"
          >
            <Button variant="ghost" size="icon" className="h-9 w-9">
              <SiGithub className="h-4 w-4" />
              <span className="sr-only">GitHub</span>
            </Button>
          </a>
          
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
