import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Rocket, ExternalLink, Clock, GitBranch } from "lucide-react";
import type { Project } from "@shared/schema";

export default function Dashboard() {
  const { data: projects, isLoading } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "deployed":
        return "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20";
      case "deploying":
        return "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20";
      case "failed":
        return "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20";
      default:
        return "bg-gray-500/10 text-gray-700 dark:text-gray-400 border-gray-500/20";
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "frontend":
        return "bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20";
      case "backend":
        return "bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/20";
      case "fullstack":
        return "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20";
      default:
        return "bg-gray-500/10 text-gray-700 dark:text-gray-400 border-gray-500/20";
    }
  };

  const formatDate = (date: string | null) => {
    if (!date) return "Never";
    return new Date(date).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="min-h-[calc(100vh-4rem)]">
      <div className="container px-4 md:px-6 py-8 md:py-12">
        <div className="flex flex-col gap-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight" data-testid="text-dashboard-title">
                Your Projects
              </h1>
              <p className="text-muted-foreground mt-2">
                {isLoading ? "Loading..." : `${projects?.length || 0} ${projects?.length === 1 ? "project" : "projects"}`}
              </p>
            </div>
            
            <Link href="/deploy/new" data-testid="link-new-deployment">
              <a>
                <Button size="lg" className="gap-2">
                  <Plus className="h-5 w-5" />
                  New Deployment
                </Button>
              </a>
            </Link>
          </div>

          {/* Projects Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <Card key={i}>
                  <CardHeader>
                    <Skeleton className="h-6 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-full" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-20 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : projects && projects.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((project) => (
                <Card 
                  key={project.id} 
                  className="hover-elevate active-elevate-2 cursor-pointer transition-all"
                  data-testid={`card-project-${project.id}`}
                >
                  <Link href={`/project/${project.id}`}>
                    <a className="block">
                      <CardHeader className="space-y-0 pb-4">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <CardTitle className="text-xl" data-testid={`text-project-name-${project.id}`}>
                            {project.name}
                          </CardTitle>
                          <Badge 
                            className={`${getStatusColor(project.status)} text-xs uppercase tracking-wide`}
                            data-testid={`badge-status-${project.id}`}
                          >
                            {project.status}
                          </Badge>
                        </div>
                        <CardDescription className="flex items-center gap-1" data-testid={`text-repository-${project.id}`}>
                          <GitBranch className="h-3 w-3" />
                          {project.repository}
                        </CardDescription>
                      </CardHeader>
                      
                      <CardContent className="space-y-4">
                        <div className="flex items-center gap-2">
                          <Badge className={`${getTypeColor(project.type)} text-xs`}>
                            {project.type}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {project.branch}
                          </span>
                        </div>

                        {project.deployedUrl && (
                          <div className="flex items-center gap-2 text-sm">
                            <ExternalLink className="h-4 w-4 text-muted-foreground" />
                            <a 
                              href={project.deployedUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary hover:underline truncate"
                              onClick={(e) => e.stopPropagation()}
                              data-testid={`link-deployed-url-${project.id}`}
                            >
                              {project.deployedUrl.replace(/^https?:\/\//, "")}
                            </a>
                          </div>
                        )}

                        <div className="flex items-center gap-2 text-sm text-muted-foreground pt-2 border-t">
                          <Clock className="h-4 w-4" />
                          <span data-testid={`text-last-deployed-${project.id}`}>
                            {formatDate(project.lastDeployedAt)}
                          </span>
                        </div>
                      </CardContent>
                    </a>
                  </Link>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="py-16" data-testid="card-empty-state">
              <CardContent className="flex flex-col items-center text-center gap-6">
                <div className="h-24 w-24 rounded-full bg-muted flex items-center justify-center">
                  <Rocket className="h-12 w-12 text-muted-foreground" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">No projects yet</h3>
                  <p className="text-muted-foreground mb-6 max-w-md">
                    Get started by connecting your first GitHub repository and deploying your application.
                  </p>
                  <Link href="/deploy/new" data-testid="link-empty-new-deployment">
                    <a>
                      <Button size="lg" className="gap-2">
                        <Plus className="h-5 w-5" />
                        Create Your First Deployment
                      </Button>
                    </a>
                  </Link>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
