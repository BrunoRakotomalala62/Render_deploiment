import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { getUncachableGitHubClient } from "./github-client";
import { simulateDeployment, registerDeploymentListener, unregisterDeploymentListener } from "./deployment-simulator";
import { z } from "zod";
import { insertProjectSchema, insertDeploymentSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // GitHub repositories endpoint
  app.get("/api/repositories", async (req, res) => {
    try {
      console.log("[API] GET /api/repositories");
      const octokit = await getUncachableGitHubClient();
      
      const { data } = await octokit.repos.listForAuthenticatedUser({
        sort: "updated",
        per_page: 50,
      });
      
      const repositories = data.map(repo => ({
        id: repo.id,
        name: repo.name,
        full_name: repo.full_name,
        description: repo.description,
        private: repo.private,
        default_branch: repo.default_branch,
        updated_at: repo.updated_at,
      }));
      
      console.log(`[API] Found ${repositories.length} repositories`);
      res.json(repositories);
    } catch (error) {
      console.error("[API] Error fetching repositories:", error);
      res.status(500).json({ 
        error: "Failed to fetch repositories",
        message: error instanceof Error ? error.message : "Unknown error" 
      });
    }
  });

  // GitHub branches endpoint
  app.get("/api/repositories/:owner/:repo/branches", async (req, res) => {
    try {
      const { owner, repo } = req.params;
      console.log(`[API] GET /api/repositories/${owner}/${repo}/branches`);
      
      const octokit = await getUncachableGitHubClient();
      const { data } = await octokit.repos.listBranches({
        owner,
        repo,
        per_page: 100,
      });
      
      const branches = data.map(branch => ({
        name: branch.name,
        commit: {
          sha: branch.commit.sha,
          url: branch.commit.url,
        },
      }));
      
      console.log(`[API] Found ${branches.length} branches for ${owner}/${repo}`);
      res.json(branches);
    } catch (error) {
      console.error("[API] Error fetching branches:", error);
      res.status(500).json({ 
        error: "Failed to fetch branches",
        message: error instanceof Error ? error.message : "Unknown error" 
      });
    }
  });

  // Get all projects
  app.get("/api/projects", async (req, res) => {
    try {
      console.log("[API] GET /api/projects");
      const projects = await storage.getProjects();
      console.log(`[API] Returning ${projects.length} projects`);
      res.json(projects);
    } catch (error) {
      console.error("[API] Error fetching projects:", error);
      res.status(500).json({ 
        error: "Failed to fetch projects",
        message: error instanceof Error ? error.message : "Unknown error" 
      });
    }
  });

  // Get single project
  app.get("/api/projects/:id", async (req, res) => {
    try {
      const { id } = req.params;
      console.log(`[API] GET /api/projects/${id}`);
      
      const project = await storage.getProject(id);
      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }
      
      res.json(project);
    } catch (error) {
      console.error("[API] Error fetching project:", error);
      res.status(500).json({ 
        error: "Failed to fetch project",
        message: error instanceof Error ? error.message : "Unknown error" 
      });
    }
  });

  // Get project deployments
  app.get("/api/projects/:id/deployments", async (req, res) => {
    try {
      const { id } = req.params;
      console.log(`[API] GET /api/projects/${id}/deployments`);
      
      const deployments = await storage.getDeployments(id);
      console.log(`[API] Found ${deployments.length} deployments for project ${id}`);
      res.json(deployments);
    } catch (error) {
      console.error("[API] Error fetching deployments:", error);
      res.status(500).json({ 
        error: "Failed to fetch deployments",
        message: error instanceof Error ? error.message : "Unknown error" 
      });
    }
  });

  // Get single deployment
  app.get("/api/deployments/:id", async (req, res) => {
    try {
      const { id } = req.params;
      console.log(`[API] GET /api/deployments/${id}`);
      
      const deployment = await storage.getDeployment(id);
      if (!deployment) {
        return res.status(404).json({ error: "Deployment not found" });
      }
      
      res.json(deployment);
    } catch (error) {
      console.error("[API] Error fetching deployment:", error);
      res.status(500).json({ 
        error: "Failed to fetch deployment",
        message: error instanceof Error ? error.message : "Unknown error" 
      });
    }
  });

  // Create new deployment
  app.post("/api/deploy", async (req, res) => {
    try {
      console.log("[API] POST /api/deploy", req.body);
      
      const deploySchema = z.object({
        name: z.string().min(1),
        repository: z.string().min(1),
        branch: z.string().min(1),
        type: z.enum(["frontend", "backend", "fullstack"]),
      });
      
      const validated = deploySchema.parse(req.body);
      
      // Create project
      const project = await storage.createProject({
        name: validated.name,
        repository: validated.repository,
        branch: validated.branch,
        type: validated.type,
        status: "idle",
        deployedUrl: null,
      });
      
      // Get commit hash from GitHub
      let commitHash: string | undefined;
      try {
        const octokit = await getUncachableGitHubClient();
        const [owner, repo] = validated.repository.split('/');
        const { data } = await octokit.repos.getBranch({
          owner,
          repo,
          branch: validated.branch,
        });
        commitHash = data.commit.sha;
      } catch (error) {
        console.error("[API] Could not fetch commit hash:", error);
        commitHash = Math.random().toString(36).substring(2, 10);
      }
      
      // Create deployment
      const deployment = await storage.createDeployment({
        projectId: project.id,
        status: "pending",
        commitHash,
      });
      
      // Start deployment simulation asynchronously
      simulateDeployment(deployment.id, project.id, project.name, project.type).catch(err => {
        console.error("[API] Deployment simulation error:", err);
      });
      
      console.log(`[API] Created deployment ${deployment.id} for project ${project.id}`);
      
      res.json({
        projectId: project.id,
        deploymentId: deployment.id,
        message: "Deployment started",
      });
    } catch (error) {
      console.error("[API] Error creating deployment:", error);
      
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          error: "Validation error",
          details: error.errors 
        });
      }
      
      res.status(500).json({ 
        error: "Failed to create deployment",
        message: error instanceof Error ? error.message : "Unknown error" 
      });
    }
  });

  const httpServer = createServer(app);

  // WebSocket server for deployment logs
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  
  wss.on('connection', (ws: WebSocket) => {
    console.log("[WebSocket] Client connected");
    let currentDeploymentId: string | null = null;
    
    ws.on('message', async (message: Buffer) => {
      try {
        const data = JSON.parse(message.toString());
        console.log("[WebSocket] Received message:", data);
        
        if (data.type === 'subscribe' && data.deploymentId) {
          currentDeploymentId = data.deploymentId;
          registerDeploymentListener(data.deploymentId, ws);
          
          // Send existing logs
          const logs = await storage.getDeploymentLogs(data.deploymentId);
          for (const log of logs) {
            if (ws.readyState === WebSocket.OPEN) {
              ws.send(JSON.stringify({ type: 'log', log }));
            }
          }
        }
      } catch (error) {
        console.error("[WebSocket] Error handling message:", error);
      }
    });
    
    ws.on('close', () => {
      console.log("[WebSocket] Client disconnected");
      if (currentDeploymentId) {
        unregisterDeploymentListener(currentDeploymentId, ws);
      }
    });
    
    ws.on('error', (error) => {
      console.error("[WebSocket] Error:", error);
    });
  });

  console.log("[Server] WebSocket server initialized on path /ws");

  return httpServer;
}
