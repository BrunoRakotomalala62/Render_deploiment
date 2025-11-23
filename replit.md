# DeployHub - Deployment Platform

## Overview

DeployHub is a modern deployment platform inspired by Render.com and Vercel, designed to provide seamless GitHub-integrated application deployments with real-time monitoring. The platform enables users to connect their GitHub repositories and deploy frontend, backend, and fullstack applications with live deployment logs and status tracking.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework & Build System**
- **React 18** with TypeScript for type-safe component development
- **Vite** as the build tool and development server, providing fast HMR (Hot Module Replacement) and optimized production builds
- **Wouter** for lightweight client-side routing without the overhead of React Router
- **TanStack Query (React Query)** for server state management, data fetching, and caching

**UI Component System**
- **Radix UI** primitives provide accessible, unstyled components as the foundation
- **shadcn/ui** component library built on top of Radix, customized with the "new-york" style variant
- **Tailwind CSS** for utility-first styling with custom design tokens defined in CSS variables
- **class-variance-authority (CVA)** for managing component variants and conditional styling
- **Design System**: Follows principles from Render.com, Vercel, Linear, and GitHub, prioritizing developer trust through clarity and real-time feedback

**Typography & Fonts**
- **Inter** for UI elements, headings, and body text
- **JetBrains Mono** for code snippets, logs, and technical content

**Theme System**
- Custom theme provider supporting light/dark modes
- Theme state persisted to localStorage
- CSS variables for consistent color management across themes

### Backend Architecture

**Server Framework**
- **Express.js** with TypeScript running on Node.js
- **Development Mode** (`index-dev.ts`): Uses Vite middleware for hot reloading and SSR
- **Production Mode** (`index-prod.ts`): Serves pre-built static files from the `dist/public` directory

**Session Management**
- Uses `connect-pg-simple` for PostgreSQL-backed session storage
- Sessions are tied to database for persistence across server restarts

**API Design**
- RESTful endpoints with JSON payloads
- WebSocket connections for real-time deployment log streaming
- Request logging middleware tracks API response times and payloads

**Real-time Communication**
- **WebSocket Server** (`ws` library) integrated with Express HTTP server
- Deployment logs broadcast to connected clients in real-time
- Session-based WebSocket management with subscription/unsubscription model

### Data Storage

**Database**
- **PostgreSQL** (via Neon serverless driver `@neondatabase/serverless`)
- **Drizzle ORM** for type-safe database queries and schema management
- Connection string configured via `DATABASE_URL` environment variable

**Schema Design**
- **Projects Table**: Stores project metadata including repository, branch, deployment type, status, and deployed URL
- **Deployments Table**: Tracks individual deployment attempts with status, commit hash, and timestamps
- **Deployment Logs**: In-memory only (not persisted to database), stored in `MemStorage` Map structure for current session access

**Storage Abstraction**
- `IStorage` interface defines contract for data operations
- `MemStorage` class provides in-memory implementation for development/testing
- Design allows easy swapping to database-backed storage by implementing the same interface

### Authentication & Authorization

**GitHub OAuth Integration**
- Uses **Octokit REST API** (`@octokit/rest`) for GitHub API interactions
- **Manual OAuth Setup**: User opted not to use Replit's GitHub connector integration
- OAuth credentials (CLIENT_ID, CLIENT_SECRET) managed via Replit Secrets (encrypted storage)
- Session secret for secure session management stored in Replit Secrets

**Authorization Pattern**
- GitHub client regenerated on each API call to avoid stale token issues
- Comment in code explicitly warns: "WARNING: Never cache this client"

### External Dependencies

**Third-party Services**
- **GitHub API**: Repository listing, branch fetching, and code access via Octokit
- **Replit Connectors**: OAuth token management and credential refresh
- **Neon Database**: Serverless PostgreSQL hosting

**Deployment Simulation**
- `vercel-deployer.ts` simulates deployment workflows (building, deploying phases)
- Real-time log broadcasting to WebSocket clients
- Deployment lifecycle: pending → building → deploying → success/failed

**Build & Development Tools**
- **TypeScript** with strict mode enabled
- **ESBuild** for production server bundling
- **Drizzle Kit** for database migrations
- **PostCSS** with Autoprefixer for CSS processing

**Key Integrations**
- Form validation with `react-hook-form` and `@hookform/resolvers`
- Date formatting with `date-fns`
- Schema validation with Zod and `drizzle-zod`
- Icon libraries: `lucide-react` and `react-icons` (specifically GitHub icon)