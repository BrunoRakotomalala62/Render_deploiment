import { 
  type Project, 
  type InsertProject,
  type Deployment, 
  type InsertDeployment,
  type DeploymentLog,
  projects,
  deployments 
} from "@shared/schema";
import { randomUUID } from "crypto";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  // Projects
  getProjects(): Promise<Project[]>;
  getProject(id: string): Promise<Project | undefined>;
  createProject(project: InsertProject): Promise<Project>;
  updateProject(id: string, updates: Partial<Project>): Promise<Project | undefined>;
  
  // Deployments
  getDeployments(projectId?: string): Promise<Deployment[]>;
  getDeployment(id: string): Promise<Deployment | undefined>;
  createDeployment(deployment: InsertDeployment): Promise<Deployment>;
  updateDeployment(id: string, updates: Partial<Deployment>): Promise<Deployment | undefined>;
  
  // Deployment Logs (in-memory only, not persisted)
  getDeploymentLogs(deploymentId: string): Promise<DeploymentLog[]>;
  addDeploymentLog(deploymentId: string, log: DeploymentLog): Promise<void>;
  clearDeploymentLogs(deploymentId: string): Promise<void>;
}

export class MemStorage implements IStorage {
  private projects: Map<string, Project>;
  private deployments: Map<string, Deployment>;
  private deploymentLogs: Map<string, DeploymentLog[]>;

  constructor() {
    this.projects = new Map();
    this.deployments = new Map();
    this.deploymentLogs = new Map();
  }

  // Projects
  async getProjects(): Promise<Project[]> {
    return Array.from(this.projects.values()).sort((a, b) => {
      const dateA = a.lastDeployedAt ? new Date(a.lastDeployedAt).getTime() : 0;
      const dateB = b.lastDeployedAt ? new Date(b.lastDeployedAt).getTime() : 0;
      return dateB - dateA;
    });
  }

  async getProject(id: string): Promise<Project | undefined> {
    return this.projects.get(id);
  }

  async createProject(insertProject: InsertProject): Promise<Project> {
    const id = randomUUID();
    const project: Project = { 
      ...insertProject, 
      id,
      lastDeployedAt: null,
    };
    this.projects.set(id, project);
    console.log(`[Storage] Created project: ${project.name} (${id})`);
    return project;
  }

  async updateProject(id: string, updates: Partial<Project>): Promise<Project | undefined> {
    const project = this.projects.get(id);
    if (!project) return undefined;
    
    const updated = { ...project, ...updates };
    this.projects.set(id, updated);
    console.log(`[Storage] Updated project: ${project.name} (${id})`);
    return updated;
  }

  // Deployments
  async getDeployments(projectId?: string): Promise<Deployment[]> {
    const deployments = Array.from(this.deployments.values());
    const filtered = projectId 
      ? deployments.filter(d => d.projectId === projectId)
      : deployments;
    
    return filtered.sort((a, b) => 
      new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime()
    );
  }

  async getDeployment(id: string): Promise<Deployment | undefined> {
    return this.deployments.get(id);
  }

  async createDeployment(insertDeployment: InsertDeployment): Promise<Deployment> {
    const id = randomUUID();
    const deployment: Deployment = {
      ...insertDeployment,
      id,
      startedAt: new Date().toISOString(),
      completedAt: null,
    };
    this.deployments.set(id, deployment);
    this.deploymentLogs.set(id, []);
    console.log(`[Storage] Created deployment: ${id} for project ${deployment.projectId}`);
    return deployment;
  }

  async updateDeployment(id: string, updates: Partial<Deployment>): Promise<Deployment | undefined> {
    const deployment = this.deployments.get(id);
    if (!deployment) return undefined;
    
    const updated = { ...deployment, ...updates };
    this.deployments.set(id, updated);
    console.log(`[Storage] Updated deployment: ${id} - status: ${updated.status}`);
    return updated;
  }

  // Deployment Logs
  async getDeploymentLogs(deploymentId: string): Promise<DeploymentLog[]> {
    return this.deploymentLogs.get(deploymentId) || [];
  }

  async addDeploymentLog(deploymentId: string, log: DeploymentLog): Promise<void> {
    const logs = this.deploymentLogs.get(deploymentId) || [];
    logs.push(log);
    this.deploymentLogs.set(deploymentId, logs);
  }

  async clearDeploymentLogs(deploymentId: string): Promise<void> {
    this.deploymentLogs.delete(deploymentId);
  }
}

export class DbStorage implements IStorage {
  private deploymentLogs: Map<string, DeploymentLog[]>;

  constructor() {
    this.deploymentLogs = new Map();
  }

  async getProjects(): Promise<Project[]> {
    const result = await db
      .select()
      .from(projects)
      .orderBy(desc(projects.lastDeployedAt));
    return result;
  }

  async getProject(id: string): Promise<Project | undefined> {
    const result = await db
      .select()
      .from(projects)
      .where(eq(projects.id, id))
      .limit(1);
    return result[0];
  }

  async createProject(insertProject: InsertProject): Promise<Project> {
    const result = await db
      .insert(projects)
      .values(insertProject)
      .returning();
    console.log(`[Storage] Created project: ${result[0].name} (${result[0].id})`);
    return result[0];
  }

  async updateProject(id: string, updates: Partial<Project>): Promise<Project | undefined> {
    const result = await db
      .update(projects)
      .set(updates)
      .where(eq(projects.id, id))
      .returning();
    if (result.length > 0) {
      console.log(`[Storage] Updated project: ${result[0].name} (${id})`);
    }
    return result[0];
  }

  async getDeployments(projectId?: string): Promise<Deployment[]> {
    const query = db.select().from(deployments);
    
    if (projectId) {
      const result = await query
        .where(eq(deployments.projectId, projectId))
        .orderBy(desc(deployments.startedAt));
      return result;
    }
    
    const result = await query.orderBy(desc(deployments.startedAt));
    return result;
  }

  async getDeployment(id: string): Promise<Deployment | undefined> {
    const result = await db
      .select()
      .from(deployments)
      .where(eq(deployments.id, id))
      .limit(1);
    return result[0];
  }

  async createDeployment(insertDeployment: InsertDeployment): Promise<Deployment> {
    const result = await db
      .insert(deployments)
      .values(insertDeployment)
      .returning();
    this.deploymentLogs.set(result[0].id, []);
    console.log(`[Storage] Created deployment: ${result[0].id} for project ${result[0].projectId}`);
    return result[0];
  }

  async updateDeployment(id: string, updates: Partial<Deployment>): Promise<Deployment | undefined> {
    const result = await db
      .update(deployments)
      .set(updates)
      .where(eq(deployments.id, id))
      .returning();
    if (result.length > 0) {
      console.log(`[Storage] Updated deployment: ${id} - status: ${result[0].status}`);
    }
    return result[0];
  }

  async getDeploymentLogs(deploymentId: string): Promise<DeploymentLog[]> {
    return this.deploymentLogs.get(deploymentId) || [];
  }

  async addDeploymentLog(deploymentId: string, log: DeploymentLog): Promise<void> {
    const logs = this.deploymentLogs.get(deploymentId) || [];
    logs.push(log);
    this.deploymentLogs.set(deploymentId, logs);
  }

  async clearDeploymentLogs(deploymentId: string): Promise<void> {
    this.deploymentLogs.delete(deploymentId);
  }
}

export const storage = new DbStorage();
