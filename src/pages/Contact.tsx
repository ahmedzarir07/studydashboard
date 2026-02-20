import { Link } from "react-router-dom";
import { ArrowLeft, Mail, Send, Facebook, Instagram, Github, Youtube } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AppLayout } from "@/components/AppLayout";

const contactMethods = [
  {
    icon: Mail,
    label: "Email",
    value: "https://www.example.com/",
    url: "mailto:https://example.com/",
    note: "Best for detailed inquiries",
  },
  {
    icon: Send,
    label: "Telegram",
    value: "https://example.com/",
    url: "https://www.example.com/",
    note: "Quick responses",
  },
  {
    icon: Facebook,
    label: "Facebook",
    value: "https://example.com/",
    url: "https://www.example.com/",
    note: "Connect on social",
  },
];

const socialLinks = [
  { name: "Facebook", icon: Facebook, url: "https://www.example.com/" },
  { name: "Instagram", icon: Instagram, url: "https://www.example.com/" },
  { name: "Telegram", icon: Send, url: "https://www.example.com/" },
  { name: "GitHub", icon: Github, url: "https://www.example.com/" },
  { name: "YouTube", icon: Youtube, url: "https://www.example.com/" },
];

export default function Contact() {
  return (
    <AppLayout title="Contact" showMobileHeader={false}>
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
          <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-1">Contact Us</h1>
          <p className="text-muted-foreground mb-8">Get in touch with the HSC Progress Tracker team</p>
          <p className="text-muted-foreground mb-8 leading-relaxed">
            Have questions, feedback, or suggestions? We would love to hear from you! Choose your preferred method of contact below.
          </p>

          {/* Contact Methods */}
          <div className="grid gap-4 mb-8">
            {contactMethods.map((method) => (
              <a key={method.label} href={method.url} target="_blank" rel="noopener noreferrer">
                <Card className="border-border/50 bg-card/60 hover:border-primary/30 transition-colors">
                  <CardContent className="p-5 flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-primary/10 text-primary">
                      <method.icon className="h-6 w-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-foreground">{method.label}</p>
                      <p className="text-sm text-primary truncate">{method.value}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{method.note}</p>
                    </div>
                  </CardContent>
                </Card>
              </a>
            ))}
          </div>

          {/* Follow Us */}
          <Card className="border-border/50 bg-card/60 mb-8">
            <CardContent className="p-5">
              <h2 className="text-lg font-semibold text-foreground mb-4">Follow Us</h2>
              <div className="flex flex-wrap gap-2">
                {socialLinks.map((link) => (
                  <a key={link.name} href={link.url} target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" size="sm" className="gap-2 border-border/50 hover:border-primary/50 hover:text-primary">
                      <link.icon className="h-4 w-4" />
                      {link.name}
                    </Button>
                  </a>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Response Time */}
          <Card className="border-border/50 bg-card/60">
            <CardContent className="p-5">
              <h2 className="text-lg font-semibold text-foreground mb-2">Response Time</h2>
              <p className="text-muted-foreground leading-relaxed">
                We typically respond within 24-48 hours. For urgent matters, Telegram is the fastest way to reach us. Please include as much detail as possible about your inquiry to help us assist you better.
              </p>
            </CardContent>
          </Card>
        </main>
      </div>
    </AppLayout>
  );
}
