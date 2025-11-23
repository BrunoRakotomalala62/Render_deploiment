import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SiGithub } from "react-icons/si";
import { Rocket } from "lucide-react";
import { connectGitHub } from "@/hooks/useGitHubAuth";

export function GitHubConnectCard() {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
      <div className="container max-w-2xl px-4">
        <Card data-testid="card-github-connect">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto bg-primary/10 w-20 h-20 rounded-full flex items-center justify-center">
              <Rocket className="h-10 w-10 text-primary" />
            </div>
            <CardTitle className="text-2xl md:text-3xl">
              No projects yet
            </CardTitle>
            <CardDescription className="text-base">
              Get started by connecting your first GitHub repository and deploying your application.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              size="lg"
              className="w-full gap-2"
              onClick={connectGitHub}
              data-testid="button-connect-github"
            >
              <SiGithub className="h-5 w-5" />
              Connect GitHub
            </Button>
            <p className="text-sm text-muted-foreground text-center">
              You'll be redirected to GitHub to authorize access to your repositories.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
