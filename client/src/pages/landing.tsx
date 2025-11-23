import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Rocket, Github, Activity, Zap, Shield, Clock } from "lucide-react";
import { SiGithub } from "react-icons/si";

export default function Landing() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative min-h-[calc(100vh-4rem)] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5" />
        <div className="container relative z-10 px-4 md:px-6 py-16 md:py-24">
          <div className="flex flex-col items-center text-center gap-8 max-w-4xl mx-auto">
            <Badge className="px-4 py-1.5" data-testid="badge-beta">
              <Zap className="h-3 w-3 mr-1" />
              Now in Beta
            </Badge>
            
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight" data-testid="text-hero-title">
              Deploy with Confidence
            </h1>
            
            <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl" data-testid="text-hero-description">
              Connect your GitHub repository and deploy your applications instantly. 
              Modern deployment platform with real-time logs and monitoring.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 mt-4">
              <Link href="/dashboard" data-testid="link-get-started">
                <a>
                  <Button size="lg" className="gap-2 px-8">
                    <Rocket className="h-5 w-5" />
                    Get Started
                  </Button>
                </a>
              </Link>
              
              <Button size="lg" variant="outline" className="gap-2 px-8" data-testid="button-connect-github">
                <SiGithub className="h-5 w-5" />
                Connect GitHub
              </Button>
            </div>

            <div className="grid grid-cols-3 gap-8 md:gap-12 mt-12 text-center">
              <div data-testid="stat-deployments">
                <div className="text-3xl md:text-4xl font-bold text-primary">10K+</div>
                <div className="text-sm text-muted-foreground mt-1">Deployments</div>
              </div>
              <div data-testid="stat-uptime">
                <div className="text-3xl md:text-4xl font-bold text-primary">99.9%</div>
                <div className="text-sm text-muted-foreground mt-1">Uptime</div>
              </div>
              <div data-testid="stat-users">
                <div className="text-3xl md:text-4xl font-bold text-primary">5K+</div>
                <div className="text-sm text-muted-foreground mt-1">Developers</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="container px-4 md:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4" data-testid="text-features-title">
              Everything you need to deploy
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Powerful features designed for modern development workflows
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            <Card data-testid="card-feature-github">
              <CardHeader>
                <div className="h-12 w-12 rounded-md bg-primary/10 flex items-center justify-center mb-4">
                  <Github className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>GitHub Integration</CardTitle>
                <CardDescription>
                  Connect your repositories and deploy with a single click. Support for all branches and automatic deployments.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card data-testid="card-feature-logs">
              <CardHeader>
                <div className="h-12 w-12 rounded-md bg-primary/10 flex items-center justify-center mb-4">
                  <Activity className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Real-time Logs</CardTitle>
                <CardDescription>
                  Watch your deployment progress with live console logs. Instant feedback at every step of the build process.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card data-testid="card-feature-instant">
              <CardHeader>
                <div className="h-12 w-12 rounded-md bg-primary/10 flex items-center justify-center mb-4">
                  <Zap className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Instant Deployment</CardTitle>
                <CardDescription>
                  Deploy frontend, backend, and fullstack applications in seconds. Optimized build process for speed.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card data-testid="card-feature-secure">
              <CardHeader>
                <div className="h-12 w-12 rounded-md bg-primary/10 flex items-center justify-center mb-4">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Secure & Reliable</CardTitle>
                <CardDescription>
                  Enterprise-grade security with automatic SSL certificates. Your applications are safe and always accessible.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card data-testid="card-feature-monitoring">
              <CardHeader>
                <div className="h-12 w-12 rounded-md bg-primary/10 flex items-center justify-center mb-4">
                  <Activity className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Live Monitoring</CardTitle>
                <CardDescription>
                  Track deployment status and health in real-time. Get notified when builds complete or fail.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card data-testid="card-feature-fast">
              <CardHeader>
                <div className="h-12 w-12 rounded-md bg-primary/10 flex items-center justify-center mb-4">
                  <Clock className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Lightning Fast</CardTitle>
                <CardDescription>
                  Optimized infrastructure ensures your deployments complete in record time. No more waiting around.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Deployment Flow Section */}
      <section className="py-16 md:py-24">
        <div className="container px-4 md:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4" data-testid="text-flow-title">
              Simple deployment process
            </h2>
            <p className="text-lg text-muted-foreground">
              From code to production in three easy steps
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="flex flex-col items-center text-center" data-testid="step-connect">
              <div className="h-16 w-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-2xl font-bold mb-4">
                1
              </div>
              <h3 className="text-xl font-semibold mb-2">Connect</h3>
              <p className="text-muted-foreground">
                Link your GitHub account and select the repository you want to deploy
              </p>
            </div>

            <div className="flex flex-col items-center text-center" data-testid="step-deploy">
              <div className="h-16 w-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-2xl font-bold mb-4">
                2
              </div>
              <h3 className="text-xl font-semibold mb-2">Deploy</h3>
              <p className="text-muted-foreground">
                Click deploy and watch real-time logs as your application builds
              </p>
            </div>

            <div className="flex flex-col items-center text-center" data-testid="step-monitor">
              <div className="h-16 w-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-2xl font-bold mb-4">
                3
              </div>
              <h3 className="text-xl font-semibold mb-2">Monitor</h3>
              <p className="text-muted-foreground">
                Your app is live! Monitor deployments and manage your projects
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-primary/5">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center text-center gap-6 max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold" data-testid="text-cta-title">
              Start deploying today
            </h2>
            <p className="text-lg text-muted-foreground">
              Join thousands of developers who trust DeployHub for their deployments. Free tier available.
            </p>
            <Link href="/dashboard" data-testid="link-cta-start">
              <a>
                <Button size="lg" className="gap-2 px-8">
                  <Rocket className="h-5 w-5" />
                  Start Deploying Free
                </Button>
              </a>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container px-4 md:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground">Features</a></li>
                <li><a href="#" className="hover:text-foreground">Pricing</a></li>
                <li><a href="#" className="hover:text-foreground">Documentation</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground">About</a></li>
                <li><a href="#" className="hover:text-foreground">Blog</a></li>
                <li><a href="#" className="hover:text-foreground">Careers</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground">Help Center</a></li>
                <li><a href="#" className="hover:text-foreground">API</a></li>
                <li><a href="#" className="hover:text-foreground">Status</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Legal</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground">Privacy</a></li>
                <li><a href="#" className="hover:text-foreground">Terms</a></li>
                <li><a href="#" className="hover:text-foreground">Security</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
            © 2024 DeployHub. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
