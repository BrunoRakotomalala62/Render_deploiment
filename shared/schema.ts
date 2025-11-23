import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Projects table
export const projects = pgTable("projects", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  repository: text("repository").notNull(),
  branch: text("branch").notNull().default("main"),
  type: text("type").notNull(), // "frontend", "backend", "fullstack"
  status: text("status").notNull().default("idle"), // "idle", "deploying", "deployed", "failed"
  deployedUrl: text("deployed_url"),
  lastDeployedAt: timestamp("last_deployed_at"),
});

export const insertProjectSchema = createInsertSchema(projects).omit({
  id: true,
  lastDeployedAt: true,
});

export type InsertProject = z.infer<typeof insertProjectSchema>;
export type Project = typeof projects.$inferSelect;

// Deployments table
export const deployments = pgTable("deployments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  projectId: varchar("project_id").notNull(),
  status: text("status").notNull().default("pending"), // "pending", "building", "deploying", "success", "failed"
  commitHash: text("commit_hash"),
  startedAt: timestamp("started_at").notNull().default(sql`now()`),
  completedAt: timestamp("completed_at"),
});

export const insertDeploymentSchema = createInsertSchema(deployments).omit({
  id: true,
  startedAt: true,
  completedAt: true,
});

export type InsertDeployment = z.infer<typeof insertDeploymentSchema>;
export type Deployment = typeof deployments.$inferSelect;

// Deployment logs - in-memory only, not persisted
export interface DeploymentLog {
  timestamp: string;
  level: "info" | "success" | "error" | "warning";
  message: string;
}

// GitHub repository interface
export interface GitHubRepository {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  private: boolean;
  default_branch: string;
  updated_at: string;
}

// GitHub branch interface
export interface GitHubBranch {
  name: string;
  commit: {
    sha: string;
    url: string;
  };
}
