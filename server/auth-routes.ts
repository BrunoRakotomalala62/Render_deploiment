import { Router } from "express";
import { db } from "./db";
import { users } from "@shared/schema";
import { eq } from "drizzle-orm";

export function setupAuthRoutes(app: Router) {
  app.get("/api/auth/github", (req, res) => {
    const clientId = process.env.GITHUB_CLIENT_ID;
    
    if (!clientId) {
      return res.status(500).json({ error: "GitHub OAuth not configured" });
    }

    const redirectUri = `${req.protocol}://${req.get('host')}/api/auth/github/callback`;
    const scope = "repo,user";
    
    const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${scope}`;
    
    res.redirect(githubAuthUrl);
  });

  app.get("/api/auth/github/callback", async (req, res) => {
    const { code } = req.query;
    const clientId = process.env.GITHUB_CLIENT_ID;
    const clientSecret = process.env.GITHUB_CLIENT_SECRET;

    if (!code || !clientId || !clientSecret) {
      return res.status(400).json({ error: "Invalid OAuth callback" });
    }

    try {
      const tokenResponse = await fetch("https://github.com/login/oauth/access_token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: JSON.stringify({
          client_id: clientId,
          client_secret: clientSecret,
          code,
        }),
      });

      const tokenData = await tokenResponse.json();
      
      if (tokenData.error || !tokenData.access_token) {
        console.error("[Auth] GitHub OAuth error:", tokenData);
        return res.status(400).json({ error: "Failed to get access token" });
      }

      const userResponse = await fetch("https://api.github.com/user", {
        headers: {
          "Authorization": `Bearer ${tokenData.access_token}`,
          "Accept": "application/json",
        },
      });

      const githubUser = await userResponse.json();

      const existingUser = await db
        .select()
        .from(users)
        .where(eq(users.githubId, githubUser.id))
        .limit(1);

      if (existingUser.length > 0) {
        await db
          .update(users)
          .set({
            accessToken: tokenData.access_token,
            username: githubUser.login,
            avatarUrl: githubUser.avatar_url,
            updatedAt: new Date(),
          })
          .where(eq(users.githubId, githubUser.id));
        
        console.log(`[Auth] Updated user: ${githubUser.login}`);
      } else {
        await db.insert(users).values({
          githubId: githubUser.id,
          username: githubUser.login,
          avatarUrl: githubUser.avatar_url,
          accessToken: tokenData.access_token,
        });
        
        console.log(`[Auth] Created new user: ${githubUser.login}`);
      }

      res.redirect("/?github_connected=true");
    } catch (error) {
      console.error("[Auth] Error during GitHub OAuth:", error);
      res.status(500).json({ 
        error: "Authentication failed",
        message: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  app.get("/api/auth/user", async (req, res) => {
    try {
      const allUsers = await db.select().from(users).limit(1);
      
      if (allUsers.length === 0) {
        return res.json({ authenticated: false });
      }

      const user = allUsers[0];
      res.json({
        authenticated: true,
        user: {
          id: user.id,
          username: user.username,
          avatarUrl: user.avatarUrl,
        },
      });
    } catch (error) {
      console.error("[Auth] Error fetching user:", error);
      res.status(500).json({ error: "Failed to fetch user" });
    }
  });

  app.post("/api/auth/logout", async (req, res) => {
    try {
      await db.delete(users);
      res.json({ success: true });
    } catch (error) {
      console.error("[Auth] Error during logout:", error);
      res.status(500).json({ error: "Logout failed" });
    }
  });
}
