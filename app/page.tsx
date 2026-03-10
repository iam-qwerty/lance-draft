import Link from "next/link";
import {
  Zap,
  FileText,
  Shield,
  ArrowRight,
  Bot,
  Search,
  Send,
} from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* ---- Nav ---- */}
      <nav className="flex items-center justify-between px-6 py-4 border-b border-border">
        <div className="flex items-center gap-2">
          <Zap className="w-6 h-6 text-primary" />
          <span className="text-lg font-bold tracking-tight">LanceDraft</span>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/sign-in"
            className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Sign in
          </Link>
          <Link
            href="/sign-up"
            className="px-4 py-2 text-sm font-medium rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Get Started
          </Link>
        </div>
      </nav>

      {/* ---- Hero ---- */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-24">
        <div className="max-w-3xl mx-auto text-center space-y-8">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border bg-secondary text-sm text-muted-foreground">
            <Bot className="w-4 h-4 text-primary" />
            AI-Powered Proposal Assistant
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-tight">
            Stop writing proposals.
            <br />
            <span className="gradient-text">Start winning them.</span>
          </h1>

          {/* Subtext */}
          <p className="text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed">
            LanceDraft monitors Upwork for jobs matching your skills, scores
            relevance with AI, and drafts personalized proposals — ready for
            your review and send.
          </p>

          {/* CTA */}
          <div className="flex items-center justify-center gap-4">
            <Link
              href="/sign-up"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors glow"
            >
              Start Free <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/sign-in"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg border border-border text-muted-foreground font-medium hover:text-foreground hover:border-muted-foreground transition-colors"
            >
              Sign In
            </Link>
          </div>
        </div>

        {/* ---- Feature Cards ---- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-24 max-w-4xl mx-auto w-full">
          <FeatureCard
            icon={<Search className="w-5 h-5" />}
            title="Auto-Discover Jobs"
            description="RSS-powered job monitoring finds relevant postings every 15 minutes based on your skills and filters."
          />
          <FeatureCard
            icon={<FileText className="w-5 h-5" />}
            title="AI-Drafted Proposals"
            description="Gemini crafts tailored, human-sounding proposals using your portfolio, tone, and case studies."
          />
          <FeatureCard
            icon={<Shield className="w-5 h-5" />}
            title="You Stay in Control"
            description="Every proposal requires your manual review and send. No auto-submissions, ever."
          />
        </div>
      </main>

      {/* ---- Footer ---- */}
      <footer className="border-t border-border py-6 px-6 text-center text-sm text-muted-foreground">
        <div className="flex items-center justify-center gap-6">
          <span>© {new Date().getFullYear()} LanceDraft</span>
          <Link href="/privacy" className="hover:text-foreground transition-colors">
            Privacy
          </Link>
          <Link href="/terms" className="hover:text-foreground transition-colors">
            Terms
          </Link>
        </div>
      </footer>
    </div>
  );
}

/* ---- Feature Card Component ---- */

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <div className="group p-6 rounded-xl border border-border bg-card hover:border-primary/30 hover:glow transition-all duration-300">
      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-4 group-hover:bg-primary/20 transition-colors">
        {icon}
      </div>
      <h3 className="font-semibold text-lg mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed">
        {description}
      </p>
    </div>
  );
}
