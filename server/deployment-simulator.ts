import { storage } from "./storage";
import type { DeploymentLog } from "@shared/schema";
import type { WebSocket } from "ws";

const deploymentSessions = new Map<string, WebSocket[]>();

export function registerDeploymentListener(deploymentId: string, ws: WebSocket) {
  const listeners = deploymentSessions.get(deploymentId) || [];
  listeners.push(ws);
  deploymentSessions.set(deploymentId, listeners);
  console.log(`[DeploymentSimulator] Registered listener for deployment ${deploymentId}`);
}

export function unregisterDeploymentListener(deploymentId: string, ws: WebSocket) {
  const listeners = deploymentSessions.get(deploymentId) || [];
  const filtered = listeners.filter(l => l !== ws);
  
  if (filtered.length === 0) {
    deploymentSessions.delete(deploymentId);
  } else {
    deploymentSessions.set(deploymentId, filtered);
  }
  console.log(`[DeploymentSimulator] Unregistered listener for deployment ${deploymentId}`);
}

async function broadcastLog(deploymentId: string, log: DeploymentLog) {
  await storage.addDeploymentLog(deploymentId, log);
  
  const listeners = deploymentSessions.get(deploymentId) || [];
  const message = JSON.stringify({ type: "log", log });
  
  for (const ws of listeners) {
    if (ws.readyState === 1) { // WebSocket.OPEN
      ws.send(message);
    }
  }
}

function createLog(level: DeploymentLog["level"], message: string): DeploymentLog {
  return {
    timestamp: new Date().toISOString().split('T')[1].split('.')[0],
    level,
    message,
  };
}

async function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export async function simulateDeployment(deploymentId: string, projectId: string, projectName: string, projectType: string) {
  console.log(`[DeploymentSimulator] Starting deployment ${deploymentId} for project ${projectName}`);
  
  try {
    // Phase 1: Pending -> Building
    await storage.updateDeployment(deploymentId, { status: "pending" });
    await broadcastLog(deploymentId, createLog("info", "Deployment initialized"));
    await sleep(1000);
    
    await broadcastLog(deploymentId, createLog("info", `Preparing to deploy ${projectName}...`));
    await sleep(800);
    
    await storage.updateDeployment(deploymentId, { status: "building" });
    await broadcastLog(deploymentId, createLog("info", "Fetching repository from GitHub..."));
    await sleep(1200);
    
    await broadcastLog(deploymentId, createLog("success", "Repository cloned successfully"));
    await sleep(600);
    
    await broadcastLog(deploymentId, createLog("info", "Installing dependencies..."));
    await sleep(1500);
    
    await broadcastLog(deploymentId, createLog("success", "Dependencies installed"));
    await sleep(800);
    
    // Different logs based on project type
    if (projectType === "frontend" || projectType === "fullstack") {
      await broadcastLog(deploymentId, createLog("info", "Building frontend assets..."));
      await sleep(2000);
      await broadcastLog(deploymentId, createLog("info", "Optimizing bundle size..."));
      await sleep(1000);
      await broadcastLog(deploymentId, createLog("success", "Frontend build completed"));
      await sleep(600);
    }
    
    if (projectType === "backend" || projectType === "fullstack") {
      await broadcastLog(deploymentId, createLog("info", "Compiling backend code..."));
      await sleep(1500);
      await broadcastLog(deploymentId, createLog("success", "Backend compilation successful"));
      await sleep(600);
    }
    
    // Phase 2: Building -> Deploying
    await storage.updateDeployment(deploymentId, { status: "deploying" });
    await broadcastLog(deploymentId, createLog("info", "Deploying to production..."));
    await sleep(1200);
    
    await broadcastLog(deploymentId, createLog("info", "Creating container..."));
    await sleep(1000);
    
    await broadcastLog(deploymentId, createLog("info", "Configuring networking..."));
    await sleep(800);
    
    await broadcastLog(deploymentId, createLog("info", "Setting up SSL certificate..."));
    await sleep(1000);
    
    await broadcastLog(deploymentId, createLog("success", "SSL certificate configured"));
    await sleep(600);
    
    await broadcastLog(deploymentId, createLog("info", "Starting application..."));
    await sleep(1500);
    
    // Phase 3: Deploying -> Success
    const deployedUrl = `https://${projectName.toLowerCase().replace(/\s+/g, '-')}.deployhub.app`;
    
    await storage.updateDeployment(deploymentId, { 
      status: "success",
      completedAt: new Date().toISOString(),
    });
    
    await storage.updateProject(projectId, {
      status: "deployed",
      deployedUrl,
      lastDeployedAt: new Date().toISOString(),
    });
    
    await broadcastLog(deploymentId, createLog("success", "Application started successfully"));
    await sleep(500);
    await broadcastLog(deploymentId, createLog("success", `Deployment complete! Available at ${deployedUrl}`));
    await sleep(500);
    await broadcastLog(deploymentId, createLog("info", "Health checks passed"));
    
    console.log(`[DeploymentSimulator] Deployment ${deploymentId} completed successfully`);
    
  } catch (error) {
    console.error(`[DeploymentSimulator] Deployment ${deploymentId} failed:`, error);
    
    await storage.updateDeployment(deploymentId, { 
      status: "failed",
      completedAt: new Date().toISOString(),
    });
    
    await storage.updateProject(projectId, {
      status: "failed",
    });
    
    await broadcastLog(deploymentId, createLog("error", `Deployment failed: ${error instanceof Error ? error.message : "Unknown error"}`));
  }
}
