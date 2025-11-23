# Design Guidelines: Render.com Clone - Deployment Platform

## Design Approach
**Reference-Based Approach**: Drawing inspiration from modern developer platforms:
- **Render.com**: Clean, trust-inspiring deployment flows
- **Vercel**: High-contrast, minimalist dashboard aesthetics  
- **Linear**: Exceptional typography hierarchy and precise spacing
- **GitHub**: Familiar repository/branch selection patterns

**Key Principles**: Developer trust through clarity, real-time feedback visibility, confidence-inspiring status indicators, efficient information density

## Typography System

**Font Family**: 
- Primary: Inter (headings, UI elements, buttons)
- Monospace: JetBrains Mono (code, logs, technical data)

**Hierarchy**:
- Hero/Page Titles: text-4xl md:text-5xl font-bold tracking-tight
- Section Headers: text-2xl md:text-3xl font-semibold
- Card Titles: text-xl font-semibold
- Body Text: text-base font-normal
- Labels/Metadata: text-sm font-medium
- Console Logs: text-xs md:text-sm font-mono
- Status Badges: text-xs font-semibold uppercase tracking-wide

## Layout System

**Spacing Primitives**: Use Tailwind units of **2, 4, 6, 8, 12, 16** (p-2, gap-4, mb-6, py-8, space-y-12, mt-16)

**Container Strategy**:
- Full-width sections with inner max-w-7xl mx-auto px-4 md:px-6
- Dashboard content: max-w-6xl
- Console/logs: max-w-full for horizontal scrolling

**Grid Patterns**:
- Project cards: grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6
- Deployment details: Two-column split (lg:grid-cols-2) for info + logs
- Repository list: Single column with hover states

## Component Library

### Navigation
- **Top Bar**: Fixed header with logo left, user menu right, deploy button prominent
- **Dashboard Nav**: Sidebar (hidden mobile, visible lg:) with Projects, Deployments, Settings
- Height: h-16 with backdrop-blur-lg for modern feel

### Cards & Containers
- **Project Cards**: Rounded corners (rounded-lg), subtle borders, hover:shadow-lg transition
- **Deployment Status Card**: Large centered card with icon + status + metadata
- **Log Console**: Full-width dark container with scrollable content, line numbers, syntax highlighting for different log types
- Padding: p-6 for cards, p-4 for compact elements

### Status Indicators
- **Deployment States**: Large icon badges (Success: checkmark, In Progress: spinner, Failed: X)
- **Live Indicators**: Pulsing dot + "Live" text for active deployments
- **Status Badges**: Rounded-full px-3 py-1 with semantic meaning (green/yellow/red tones)

### Forms & Inputs
- **Repository Selector**: Dropdown with search, repository icons, branch badges
- **Input Fields**: Consistent height (h-12), rounded-md borders, focus rings
- **Deploy Button**: Large, prominent (px-8 py-3), primary CTA throughout experience

### Console/Logs
- **Container**: Dark background, monospace font, auto-scroll to bottom
- **Log Lines**: Timestamp + message, different styles for [INFO], [ERROR], [SUCCESS]
- **Copy Button**: Top-right corner for easy log copying
- Height: min-h-96 max-h-screen with overflow-y-auto

## Page Structures

### Landing Page (5-6 sections)
1. **Hero**: Full-viewport (min-h-screen) with gradient background, centered headline "Deploy with Confidence", deploy CTA + GitHub connect button, floating dashboard preview image
2. **Features Grid**: 3 columns showcasing instant deployment, GitHub integration, live logs
3. **Deployment Flow**: Visual step-by-step (Connect → Deploy → Monitor) with icons
4. **Trust Section**: Metrics in 4 columns (deployments/day, uptime %, users)
5. **CTA Section**: Large centered "Start Deploying" with free tier messaging
6. **Footer**: Multi-column (Docs, API, Support, Social links)

### Dashboard
- **Header**: Project count + "New Deployment" button
- **Project Grid**: Cards showing project name, type badge (Frontend/Backend), last deployed time, status indicator, live URL
- **Empty State**: Centered illustration + "Connect your first repository" CTA

### Deployment Page
- **Two-Column Layout** (mobile stacks):
  - Left: Repository info, branch selected, environment variables (collapsible)
  - Right: Live console logs with real-time updates, scrollable
- **Progress Bar**: Top of page showing deployment stages (Build → Test → Deploy)
- **Action Bar**: Bottom-fixed with Cancel and View Logs buttons

### Post-Deployment Success
- **Centered Card**: Large success icon, "Deployment Successful" headline, deployed URL (click to copy), visit site button
- **Deployment Summary**: Build time, commit hash, deployment ID in smaller text
- **Next Steps**: Quick links to view logs, configure domains, redeploy

## Images

**Hero Section**: Large preview image of dashboard interface (floating/tilted perspective), showing project cards and deployment status - positioned center-right with gradient fade edges

**Features Section**: Small icons (64x64) for each feature - no large images needed

**Trust Section**: Small company/user logos if applicable, or abstract deployment visualization graphics

## Interactions (Minimal)

- **Hover States**: Subtle scale (scale-105) on project cards, button brightness changes
- **Console Logs**: Auto-scroll behavior, slight fade-in for new log lines
- **Status Updates**: Smooth transitions between deployment states
- **Loading States**: Skeleton screens for repository loading, spinner for active deployments

**No complex animations** - focus on instant feedback and smooth state transitions for professional feel