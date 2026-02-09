import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AppLayout } from "@/components/AppLayout";

const sections = [
  {
    title: "Information We Collect",
    content:
      "We collect information you provide directly to us when you create an account, including your email address and any study-related data you choose to input (subjects, tasks, mock test scores, etc.). We also automatically collect certain technical information when you use our service, such as your browser type and device information.",
  },
  {
    title: "How We Use Your Information",
    content:
      "Your information is used solely to provide and improve the HSC Progress Tracker service. This includes storing your study data so you can access it across sessions, providing personalized study tracking features, and improving our application based on usage patterns. We do not sell or share your personal information with third parties for marketing purposes.",
  },
  {
    title: "Data Storage and Security",
    content:
      "Your data is stored securely using industry-standard encryption and security practices. We use secure cloud infrastructure to protect your information. While we implement appropriate security measures, no method of transmission over the Internet is 100% secure, and we cannot guarantee absolute security.",
  },
  {
    title: "Your Rights",
    content:
      "You have the right to access, update, or delete your personal information at any time. You can do this through your account settings or by contacting us directly. If you choose to delete your account, all associated data will be permanently removed from our systems.",
  },
  {
    title: "Cookies and Tracking",
    content:
      "We use essential cookies to maintain your session and remember your preferences. We may use analytics tools to understand how users interact with our application, which helps us improve the service. You can control cookie settings through your browser.",
  },
  {
    title: "Third-Party Services",
    content:
      "We use Google AdSense to display advertisements. Google may use cookies to serve ads based on your prior visits to our website or other websites. You can opt out of personalized advertising by visiting Google's Ads Settings.",
  },
  {
    title: "Changes to This Policy",
    content:
      "We may update this privacy policy from time to time. We will notify you of any significant changes by posting the new policy on this page with an updated revision date.",
  },
  {
    title: "Contact Us",
    content:
      "If you have any questions about this Privacy Policy, please contact us at md01610988605@gmail.com.",
  },
];

export default function PrivacyPolicy() {
  return (
    <AppLayout title="Privacy Policy" showMobileHeader={false}>
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
          <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-1">Privacy Policy</h1>
          <p className="text-sm text-muted-foreground mb-8">Last updated: January 2025</p>
          <p className="text-muted-foreground mb-8 leading-relaxed">
            At HSC Progress Tracker, we take your privacy seriously. This Privacy Policy explains how we collect, use, and protect your personal information when you use our study tracking application.
          </p>

          <div className="space-y-8">
            {sections.map((section) => (
              <div key={section.title}>
                <h2 className="text-lg font-semibold text-foreground mb-2">{section.title}</h2>
                <p className="text-muted-foreground leading-relaxed">{section.content}</p>
              </div>
            ))}
          </div>
        </main>
      </div>
    </AppLayout>
  );
}
