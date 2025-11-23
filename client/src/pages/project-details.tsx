import { useRoute, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, ExternalLink, GitBranch, Clock, Rocket } from "lucide-react";
import type { Project, Deployment } from "@shared/schema";

export default function ProjectDetails() {
  const [, params] = useRoute("/project/:id");
  const projectId = params?.id;

  const { data: project, isLoading: loadingProject } = useQuery<Project>({
    queryKey: ["/api/projects", projectId],
    enabled: !!projectId,
  });

  const { data: deployments, isLoading: loadingDeployments } = useQuery<Deployment[]>({
    queryKey: ["/api/projects", projectId, "deployments"],
    enabled: !!projectId,
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "success":
      case "deployed":
        return "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20";
      case "deploying":
      case "building":
      case "pending":
        return "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20";
      case "failed":
        return "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20";
      default:
        return "bg-gray-500/10 text-gray-700 dark:text-gray-400 border-gray-500/20";
    }
  };

  if (loadingProject) {
    return (
      <div className="min-h-[calc(100vh-4rem)]">
        <div className="container max-w-6xl px-4 md:px-6 py-8 md:py-12">
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <p className="text-muted-foreground">Project not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)]">
      <div className="container max-w-6xl px-4 md:px-6 py-8 md:py-12">
        <div className="flex flex-col gap-8">
          {/* Header */}
          <div className="flex items-center gap-4">
            <Link href="/dashboard" data-testid="link-back">
              <a>
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </a>
            </Link>
            <div className="flex-1">
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight" data-testid="text-project-name">
                {project.name}
              </h1>
              <p className="text-muted-foreground mt-1 flex items-center gap-2">
                <GitBranch className="h-4 w-4" />
                {project.repository} ({project.branch})
              </p>
            </div>
            <Link href={`/deploy/${project.id}/redeploy`} data-testid="link-redeploy">
              <a>
                <Button className="gap-2">
                  <Rocket className="h-5 w-5" />
                  Redeploy
                </Button>
              </a>
            </Link>
          </div>

          {/* Project Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardDescription>Status</CardDescription>
                <Badge className={`${getStatusColor(project.status)} w-fit`} data-testid="badge-status">
                  {project.status}
                </Badge>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <CardDescription>Type</CardDescription>
                <CardTitle data-testid="text-type">{project.type}</CardTitle>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <CardDescription>Last Deployed</CardDescription>
                <CardTitle className="flex items-center gap-2 text-base" data-testid="text-last-deployed">
                  <Clock className="h-4 w-4" />
                  {project.lastDeployedAt
                    ? new Date(project.lastDeployedAt).toLocaleString()
                    : "Never"}
                </CardTitle>
              </CardHeader>
            </Card>
          </div>

          {/* Deployed URL */}
          {project.deployedUrl && (
            <Card>
              <CardHeader>
                <CardTitle>Deployed Application</CardTitle>
                <CardDescription>
                  Your application is live at the following URL
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3 flex-wrap">
                  <code className="text-sm bg-muted px-3 py-2 rounded-md flex-1 min-w-0 truncate" data-testid="text-deployed-url">
                    {project.deployedUrl}
                  </code>
                  <a
                    href={project.deployedUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    data-testid="link-visit"
                  >
                    <Button variant="outline" className="gap-2">
                      <ExternalLink className="h-4 w-4" />
                      Visit
                    </Button>
                  </a>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Deployment History */}
          <Card>
            <CardHeader>
              <CardTitle>Deployment History</CardTitle>
              <CardDescription>
                Recent deployments for this project
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadingDeployments ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : deployments && deployments.length > 0 ? (
                <div className="space-y-3">
                  {deployments.map((deployment) => (
                    <Link key={deployment.id} href={`/deploy/${deployment.id}`} data-testid={`link-deployment-${deployment.id}`}>
                      <a className="block">
                        <div className="p-4 rounded-md border hover-elevate active-elevate-2 cursor-pointer">
                          <div className="flex items-center justify-between gap-4 flex-wrap">
                            <div className="flex items-center gap-3">
                              <Badge className={`${getStatusColor(deployment.status)} text-xs`}>
                                {deployment.status}
                              </Badge>
                              {deployment.commitHash && (
                                <span className="text-sm font-mono text-muted-foreground">
                                  {deployment.commitHash.substring(0, 8)}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Clock className="h-4 w-4" />
                              {new Date(deployment.startedAt).toLocaleString()}
                            </div>
                          </div>
                        </div>
                      </a>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  No deployments yet
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
