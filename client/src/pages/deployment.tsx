import { useEffect, useRef, useState } from "react";
import { useRoute, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CheckCircle2, XCircle, Loader2, Copy, GitBranch, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Deployment, DeploymentLog } from "@shared/schema";

export default function DeploymentPage() {
  const [, params] = useRoute("/deploy/:id");
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const deploymentId = params?.id;
  const scrollRef = useRef<HTMLDivElement>(null);
  const [logs, setLogs] = useState<DeploymentLog[]>([]);
  const wsRef = useRef<WebSocket | null>(null);

  const { data: deployment } = useQuery<Deployment>({
    queryKey: ["/api/deployments", deploymentId],
    enabled: !!deploymentId,
    refetchInterval: (query) => {
      const data = query.state.data;
      return data && (data.status === "pending" || data.status === "building" || data.status === "deploying") ? 2000 : false;
    },
  });

  useEffect(() => {
    if (!deploymentId) return;

    let reconnectTimeout: NodeJS.Timeout | null = null;
    let shouldReconnect = true;

    const connect = () => {
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const wsUrl = `${protocol}//${window.location.host}/ws`;
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log("[WebSocket] Connected to deployment logs");
        ws.send(JSON.stringify({ type: "subscribe", deploymentId }));
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === "log") {
            setLogs((prev) => [...prev, data.log]);
          }
        } catch (error) {
          console.error("[WebSocket] Failed to parse message:", error);
        }
      };

      ws.onerror = (error) => {
        console.error("[WebSocket] Error:", error);
      };

      ws.onclose = () => {
        console.log("[WebSocket] Disconnected from deployment logs");
        
        // Attempt to reconnect if deployment is still in progress
        if (shouldReconnect && deployment && (deployment.status === "pending" || deployment.status === "building" || deployment.status === "deploying")) {
          reconnectTimeout = setTimeout(() => {
            console.log("[WebSocket] Attempting to reconnect...");
            connect();
          }, 3000);
        }
      };
    };

    connect();

    return () => {
      shouldReconnect = false;
      if (reconnectTimeout) {
        clearTimeout(reconnectTimeout);
      }
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.close();
      }
    };
  }, [deploymentId, deployment?.status]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  useEffect(() => {
    if (deployment?.status === "success") {
      const timer = setTimeout(() => {
        setLocation(`/deploy/success/${deploymentId}`);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [deployment?.status, deploymentId, setLocation]);

  const getStatusIcon = () => {
    switch (deployment?.status) {
      case "success":
        return <CheckCircle2 className="h-8 w-8 text-green-500" />;
      case "failed":
        return <XCircle className="h-8 w-8 text-red-500" />;
      default:
        return <Loader2 className="h-8 w-8 text-primary animate-spin" />;
    }
  };

  const getProgress = () => {
    switch (deployment?.status) {
      case "pending":
        return 10;
      case "building":
        return 50;
      case "deploying":
        return 80;
      case "success":
        return 100;
      case "failed":
        return 100;
      default:
        return 0;
    }
  };

  const copyLogs = () => {
    const logText = logs.map((log) => `[${log.timestamp}] [${log.level.toUpperCase()}] ${log.message}`).join("\n");
    navigator.clipboard.writeText(logText);
    toast({
      title: "Logs copied!",
      description: "Deployment logs copied to clipboard",
    });
  };

  const getLogColor = (level: string) => {
    switch (level) {
      case "success":
        return "text-green-600 dark:text-green-400";
      case "error":
        return "text-red-600 dark:text-red-400";
      case "warning":
        return "text-yellow-600 dark:text-yellow-400";
      default:
        return "text-muted-foreground";
    }
  };

  if (!deployment) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading deployment...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)]">
      <div className="container max-w-6xl px-4 md:px-6 py-8 md:py-12">
        <div className="flex flex-col gap-6">
          {/* Status Header */}
          <Card data-testid="card-deployment-status">
            <CardHeader>
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  {getStatusIcon()}
                  <div>
                    <CardTitle className="text-2xl" data-testid="text-deployment-status">
                      {deployment.status === "pending" && "Initializing Deployment..."}
                      {deployment.status === "building" && "Building Application..."}
                      {deployment.status === "deploying" && "Deploying to Production..."}
                      {deployment.status === "success" && "Deployment Successful!"}
                      {deployment.status === "failed" && "Deployment Failed"}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-2 mt-1">
                      <Clock className="h-4 w-4" />
                      Started {new Date(deployment.startedAt).toLocaleTimeString()}
                    </CardDescription>
                  </div>
                </div>
                <Badge 
                  className={`text-xs uppercase tracking-wide ${
                    deployment.status === "success" 
                      ? "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20"
                      : deployment.status === "failed"
                      ? "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20"
                      : "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20"
                  }`}
                  data-testid="badge-deployment-status"
                >
                  {deployment.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Progress</span>
                  <span className="font-medium">{getProgress()}%</span>
                </div>
                <Progress value={getProgress()} data-testid="progress-deployment" />
              </div>
            </CardContent>
          </Card>

          {/* Deployment Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-4">
                <CardDescription>Deployment ID</CardDescription>
                <CardTitle className="text-sm font-mono" data-testid="text-deployment-id">
                  {deployment.id}
                </CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-4">
                <CardDescription>Project ID</CardDescription>
                <CardTitle className="text-sm font-mono" data-testid="text-project-id">
                  {deployment.projectId}
                </CardTitle>
              </CardHeader>
            </Card>
            {deployment.commitHash && (
              <Card>
                <CardHeader className="pb-4">
                  <CardDescription>Commit Hash</CardDescription>
                  <CardTitle className="text-sm font-mono flex items-center gap-2" data-testid="text-commit-hash">
                    <GitBranch className="h-4 w-4" />
                    {deployment.commitHash.substring(0, 8)}
                  </CardTitle>
                </CardHeader>
              </Card>
            )}
          </div>

          {/* Console Logs */}
          <Card data-testid="card-console-logs">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Console Logs</CardTitle>
                  <CardDescription>Real-time deployment logs</CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={copyLogs}
                  className="gap-2"
                  data-testid="button-copy-logs"
                >
                  <Copy className="h-4 w-4" />
                  Copy
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea 
                className="h-[500px] w-full rounded-md bg-muted/50 p-4 font-mono text-xs md:text-sm"
                ref={scrollRef}
                data-testid="scroll-logs"
              >
                {logs.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    <p>Waiting for logs...</p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {logs.map((log, index) => (
                      <div 
                        key={index} 
                        className={`${getLogColor(log.level)}`}
                        data-testid={`log-line-${index}`}
                      >
                        <span className="text-muted-foreground mr-2">[{log.timestamp}]</span>
                        <span className="font-semibold mr-2">[{log.level.toUpperCase()}]</span>
                        <span>{log.message}</span>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
