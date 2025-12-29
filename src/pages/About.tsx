import { Link } from "react-router-dom";
import { ArrowLeft, Facebook, Instagram, Send, Github, Youtube, Mail, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const socialLinks = [
  { name: "Facebook", icon: Facebook, url: "https://www.facebook.com/md.monir.hossen.414752/" },
  { name: "Instagram", icon: Instagram, url: "https://www.instagram.com/monir_.hossen/" },
  { name: "Telegram", icon: Send, url: "https://t.me/md_monir01" },
  { name: "GitHub", icon: Github, url: "https://github.com/mdmonirhossen6" },
  { name: "YouTube", icon: Youtube, url: "https://www.youtube.com/@MonirHossen-i6j" },
  { name: "Email", icon: Mail, url: "mailto:md01610988605@gmail.com" },
];

const features = [
  "Subject-wise progress tracking",
  "Chapter & activity management",
  "PDF progress reports",
  "Resource linking for chapters",
  "Monthly summary views",
  "Multi-subject support",
];

export default function About() {
  return (
    <div className="min-h-screen bg-background">
      {/* Back button */}
      <div className="px-4 py-4 max-w-2xl mx-auto">
        <Link to="/">
          <Button variant="ghost" size="sm" className="gap-2 text-primary hover:text-primary/80">
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Button>
        </Link>
      </div>

      <main className="px-4 pb-12 max-w-2xl mx-auto">
        {/* Main Card */}
        <Card className="border-border/50 bg-card/60 overflow-hidden">
          <CardContent className="p-6 md:p-8">
            <div className="flex flex-col md:flex-row gap-6 items-start">
              {/* Logo */}
              <div className="w-28 h-28 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 flex items-center justify-center flex-shrink-0">
                <div className="text-center">
                  <div className="w-12 h-12 mx-auto mb-1 rounded-lg bg-primary/20 flex items-center justify-center">
                    <span className="text-2xl">📚</span>
                  </div>
                  <span className="text-xs font-medium text-primary">HSC Tracker</span>
                </div>
              </div>

              {/* Info */}
              <div className="flex-1">
                <h1 className="text-2xl md:text-3xl font-bold text-foreground">
                  HSC Tracker
                </h1>
                <p className="text-primary mt-1 font-medium">
                  by Mohammad Monir Hossen
                </p>
                <p className="text-muted-foreground mt-3 leading-relaxed">
                  A personal project for HSC students to organize tasks, track study progress, and maintain consistency. Built with focus on clean UI, speed, and practical features.
                </p>

                {/* Location & Year */}
                <div className="flex gap-8 mt-5">
                  <div>
                    <p className="text-xs text-muted-foreground">Location</p>
                    <p className="font-medium text-foreground">Bangladesh</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Year</p>
                    <p className="font-medium text-foreground">2025</p>
                  </div>
                </div>

                {/* Social Links */}
                <div className="flex flex-wrap gap-2 mt-6">
                  {socialLinks.map((link) => (
                    <a
                      key={link.name}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-2 border-border/50 hover:border-primary/50 hover:text-primary"
                      >
                        <link.icon className="h-4 w-4" />
                        {link.name}
                      </Button>
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Features Card */}
        <Card className="border-border/50 bg-card/60 mt-6">
          <CardContent className="p-6 md:p-8">
            <h2 className="text-lg font-semibold text-foreground mb-4">Features</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {features.map((feature, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />
                  <span className="text-muted-foreground">{feature}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Links */}
        <Card className="border-border/50 bg-card/60 mt-6">
          <CardContent className="p-6 md:p-8">
            <h2 className="text-lg font-semibold text-foreground mb-4">🔗 Quick Links</h2>
            <div className="space-y-3">
              <a 
                href="https://trackinger.lovable.app" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
              >
                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                  <ExternalLink className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-foreground">Trackinger</p>
                  <p className="text-xs text-muted-foreground">trackinger.lovable.app</p>
                </div>
              </a>

              <a 
                href="https://t.me/trackingerapp" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
              >
                <div className="p-2 rounded-lg bg-[hsl(200_100%_50%)]/10 text-[hsl(200_100%_50%)]">
                  <Send className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-foreground">Telegram Group</p>
                  <p className="text-xs text-muted-foreground">t.me/trackingerapp</p>
                </div>
              </a>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
