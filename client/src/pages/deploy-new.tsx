import { useState } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { GitBranch, Rocket, Search } from "lucide-react";
import { SiGithub } from "react-icons/si";
import type { GitHubRepository, GitHubBranch } from "@shared/schema";
import { useGitHubAuth } from "@/hooks/useGitHubAuth";
import { GitHubConnectCard } from "@/components/github-connect-card";

export default function DeployNew() {
  const { isAuthenticated, isLoading: authLoading } = useGitHubAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRepo, setSelectedRepo] = useState<GitHubRepository | null>(null);
  const [selectedBranch, setSelectedBranch] = useState("");
  const [projectName, setProjectName] = useState("");
  const [projectType, setProjectType] = useState<"frontend" | "backend" | "fullstack">("frontend");

  const { data: repositories, isLoading: loadingRepos, error: repoError } = useQuery<GitHubRepository[]>({
    queryKey: ["/api/repositories"],
    enabled: isAuthenticated,
  });

  const { data: branches, isLoading: loadingBranches } = useQuery<GitHubBranch[]>({
    queryKey: selectedRepo ? [`/api/repositories/${selectedRepo.full_name}/branches`] : [],
    enabled: !!selectedRepo,
  });

  const deployMutation = useMutation({
    mutationFn: async (data: { name: string; repository: string; branch: string; type: string }) => {
      const response = await apiRequest("POST", "/api/deploy", data);
      return await response.json();
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      toast({
        title: "Deployment started!",
        description: "Redirecting to deployment console...",
      });
      setLocation(`/deploy/${data.deploymentId}`);
    },
    onError: (error: Error) => {
      toast({
        title: "Deployment failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const filteredRepos = repositories?.filter((repo) =>
    repo.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    repo.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDeploy = () => {
    if (!selectedRepo || !selectedBranch || !projectName) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    deployMutation.mutate({
      name: projectName,
      repository: selectedRepo.full_name,
      branch: selectedBranch,
      type: projectType,
    });
  };

  if (authLoading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="text-center space-y-4">
          <Skeleton className="h-12 w-64 mx-auto" />
          <Skeleton className="h-6 w-48 mx-auto" />
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <GitHubConnectCard />;
  }

  return (
    <div className="min-h-[calc(100vh-4rem)]">
      <div className="container max-w-4xl px-4 md:px-6 py-8 md:py-12">
        <div className="flex flex-col gap-8">
          {/* Header */}
          <div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2" data-testid="text-deploy-title">
              New Deployment
            </h1>
            <p className="text-muted-foreground">
              Select a repository and configure your deployment
            </p>
          </div>

          {/* Repository Selection */}
          <Card data-testid="card-repository-selection">
            <CardHeader>
              <CardTitle>Select Repository</CardTitle>
              <CardDescription>
                Choose a GitHub repository to deploy
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {loadingRepos ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : repositories && repositories.length > 0 ? (
                <>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search repositories..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                      data-testid="input-search-repository"
                    />
                  </div>

                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {filteredRepos?.map((repo) => (
                      <div
                        key={repo.id}
                        onClick={() => {
                          setSelectedRepo(repo);
                          setSelectedBranch(repo.default_branch);
                          setProjectName(repo.name);
                        }}
                        className={`p-4 rounded-md border cursor-pointer hover-elevate active-elevate-2 transition-all ${
                          selectedRepo?.id === repo.id
                            ? "border-primary bg-primary/5"
                            : "border-border"
                        }`}
                        data-testid={`repo-item-${repo.id}`}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <SiGithub className="h-4 w-4 flex-shrink-0" />
                              <span className="font-medium truncate">{repo.full_name}</span>
                            </div>
                            {repo.description && (
                              <p className="text-sm text-muted-foreground line-clamp-2">
                                {repo.description}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <GitBranch className="h-3 w-3 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">
                              {repo.default_branch}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">
                    No repositories found. Make sure your GitHub account is connected.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Configuration */}
          {selectedRepo && (
            <Card data-testid="card-configuration">
              <CardHeader>
                <CardTitle>Configuration</CardTitle>
                <CardDescription>
                  Configure your deployment settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="project-name">Project Name</Label>
                  <Input
                    id="project-name"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    placeholder="my-awesome-project"
                    data-testid="input-project-name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="branch">Branch</Label>
                  {loadingBranches ? (
                    <Skeleton className="h-10 w-full" />
                  ) : (
                    <Select value={selectedBranch} onValueChange={setSelectedBranch}>
                      <SelectTrigger id="branch" data-testid="select-branch">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {branches?.map((branch) => (
                          <SelectItem key={branch.name} value={branch.name}>
                            {branch.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="type">Project Type</Label>
                  <Select value={projectType} onValueChange={(v: any) => setProjectType(v)}>
                    <SelectTrigger id="type" data-testid="select-type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="frontend">Frontend</SelectItem>
                      <SelectItem value="backend">Backend</SelectItem>
                      <SelectItem value="fullstack">Fullstack</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  onClick={handleDeploy}
                  disabled={deployMutation.isPending}
                  className="w-full gap-2"
                  size="lg"
                  data-testid="button-deploy"
                >
                  <Rocket className="h-5 w-5" />
                  {deployMutation.isPending ? "Deploying..." : "Deploy Now"}
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
