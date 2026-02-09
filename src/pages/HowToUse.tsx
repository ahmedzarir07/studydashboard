import { Link } from "react-router-dom";
import { ArrowLeft, BookOpen, CheckSquare, BarChart3, Calendar, Download, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AppLayout } from "@/components/AppLayout";

const steps = [
  {
    icon: BookOpen,
    title: "1. Create Your Account",
    description: "Sign up with your email to get started. Your progress will be saved automatically across all your devices.",
  },
  {
    icon: CheckSquare,
    title: "2. Track Your Activities",
    description: "Navigate to the Tracker page, select a subject and chapter, then mark activities as complete — like book reading, class lectures, CQ practice, and more.",
  },
  {
    icon: BarChart3,
    title: "3. View Your Progress",
    description: "Check the Home page for an overall progress overview with circular charts for each subject. Visit the Overview page for detailed analytics and performance insights.",
  },
  {
    icon: Calendar,
    title: "4. Monthly Planning",
    description: "Use the Monthly Planning feature to set goals for each month. Plan which chapters and activities you want to complete and track your monthly progress.",
  },
  {
    icon: Download,
    title: "5. Download Reports",
    description: "Generate PDF reports of your progress — choose between a 1-page summary or a detailed full report. Share your progress with teachers or parents.",
  },
  {
    icon: Users,
    title: "6. Community & AI",
    description: "Join the community to see public leaderboards, and use the AI Analysis feature to get personalized study recommendations based on your progress.",
  },
];

export default function HowToUse() {
  return (
    <AppLayout title="How to Use" showMobileHeader={false}>
      <div className="min-h-screen">
        <div className="px-4 py-4 max-w-2xl mx-auto">
          <Link to="/">
            <Button variant="ghost" size="sm" className="gap-2 text-primary hover:text-primary/80">
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Button>
          </Link>
        </div>

        <main className="px-4 pb-12 max-w-2xl mx-auto">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-1">How to Use</h1>
          <p className="text-muted-foreground mb-8">A quick guide to get the most out of HSC Progress Tracker</p>

          <div className="space-y-4">
            {steps.map((step) => (
              <Card key={step.title} className="border-border/50 bg-card/60">
                <CardContent className="p-5 flex items-start gap-4">
                  <div className="p-3 rounded-xl bg-primary/10 text-primary flex-shrink-0">
                    <step.icon className="h-6 w-6" />
                  </div>
                  <div>
                    <h2 className="font-semibold text-foreground mb-1">{step.title}</h2>
                    <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* CTA */}
          <div className="mt-8 text-center">
            <Link to="/tracker">
              <Button size="lg" className="gap-2">
                <CheckSquare className="h-5 w-5" />
                Start Tracking Now
              </Button>
            </Link>
          </div>
        </main>
      </div>
    </AppLayout>
  );
}
