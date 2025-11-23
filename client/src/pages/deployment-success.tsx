import { useEffect } from "react";
import { useRoute, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, ExternalLink, Clock, GitBranch, LayoutDashboard, Rocket, Activity } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import type { Deployment, Project } from "@shared/schema";

export default function DeploymentSuccess() {
  const [, params] = useRoute("/deploy/success/:id");
  const deploymentId = params?.id;

  const { data: deployment, isLoading } = useQuery<Deployment>({
    queryKey: ["/api/deployments", deploymentId],
    enabled: !!deploymentId,
  });

  const { data: project } = useQuery<Project>({
    queryKey: ["/api/projects", deployment?.projectId],
    enabled: !!deployment?.projectId,
  });

  useEffect(() => {
    if (deployment?.status === "success") {
      const confetti = document.createElement("div");
      confetti.style.position = "fixed";
      confetti.style.top = "0";
      confetti.style.left = "0";
      confetti.style.width = "100%";
      confetti.style.height = "100%";
      confetti.style.pointerEvents = "none";
      confetti.style.zIndex = "9999";
      document.body.appendChild(confetti);
      
      setTimeout(() => {
        document.body.removeChild(confetti);
      }, 3000);
    }
  }, [deployment?.status]);

  if (isLoading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <Skeleton className="h-96 w-full max-w-2xl" />
      </div>
    );
  }

  if (!deployment || !project) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <p className="text-muted-foreground">Deployment not found</p>
      </div>
    );
  }

  const buildTime = deployment.completedAt && deployment.startedAt
    ? Math.round((new Date(deployment.completedAt).getTime() - new Date(deployment.startedAt).getTime()) / 1000)
    : 0;

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
      <div className="container max-w-3xl px-4 md:px-6 py-8 md:py-12">
        <Card className="text-center" data-testid="card-success">
          <CardHeader className="space-y-6 pt-12 pb-8">
            <div className="flex justify-center">
              <div className="h-24 w-24 rounded-full bg-green-500/10 flex items-center justify-center">
                <CheckCircle2 className="h-16 w-16 text-green-500" data-testid="icon-success" />
              </div>
            </div>
            
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-3" data-testid="text-success-title">
                Deployment Successful!
              </h1>
              <p className="text-lg text-muted-foreground">
                Your application is now live and ready to use
              </p>
            </div>

            {project.deployedUrl && (
              <div className="bg-muted/50 rounded-lg p-6 space-y-3">
                <p className="text-sm text-muted-foreground font-medium">
                  Your application is deployed at:
                </p>
                <div className="flex items-center justify-center gap-2 flex-wrap">
                  <code className="text-lg font-mono bg-background px-4 py-2 rounded-md border" data-testid="text-deployed-url">
                    {project.deployedUrl}
                  </code>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => navigator.clipboard.writeText(project.deployedUrl!)}
                    data-testid="button-copy-url"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>
                <a
                  href={project.deployedUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-testid="link-visit-site"
                >
                  <Button size="lg" className="gap-2 mt-2">
                    <ExternalLink className="h-5 w-5" />
                    Visit Your Site
                  </Button>
                </a>
              </div>
            )}
          </CardHeader>

          <CardContent className="space-y-6 pb-12">
            {/* Deployment Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 py-6 border-y">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Build Time</p>
                <div className="flex items-center justify-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="font-semibold" data-testid="text-build-time">
                    {buildTime}s
                  </span>
                </div>
              </div>
              
              {deployment.commitHash && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Commit</p>
                  <div className="flex items-center justify-center gap-2">
                    <GitBranch className="h-4 w-4 text-muted-foreground" />
                    <span className="font-mono text-sm" data-testid="text-commit">
                      {deployment.commitHash.substring(0, 8)}
                    </span>
                  </div>
                </div>
              )}
              
              <div>
                <p className="text-sm text-muted-foreground mb-1">Type</p>
                <div className="flex items-center justify-center">
                  <Badge 
                    className={
                      project.type === "frontend"
                        ? "bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20"
                        : project.type === "backend"
                        ? "bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/20"
                        : "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20"
                    }
                    data-testid="badge-project-type"
                  >
                    {project.type}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Next Steps */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Next Steps</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Link href={`/deploy/${deploymentId}`} data-testid="link-view-logs">
                  <a className="block">
                    <Button variant="outline" className="w-full gap-2">
                      <Activity className="h-4 w-4" />
                      View Logs
                    </Button>
                  </a>
                </Link>
                
                <Link href="/dashboard" data-testid="link-dashboard">
                  <a className="block">
                    <Button variant="outline" className="w-full gap-2">
                      <LayoutDashboard className="h-4 w-4" />
                      Go to Dashboard
                    </Button>
                  </a>
                </Link>
                
                <Link href="/deploy/new" data-testid="link-new-deployment">
                  <a className="block">
                    <Button variant="outline" className="w-full gap-2">
                      <Rocket className="h-4 w-4" />
                      New Deployment
                    </Button>
                  </a>
                </Link>
                
                <Link href={`/project/${project.id}`} data-testid="link-project-details">
                  <a className="block">
                    <Button variant="outline" className="w-full gap-2">
                      <GitBranch className="h-4 w-4" />
                      Project Settings
                    </Button>
                  </a>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
