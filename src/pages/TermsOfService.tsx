import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AppLayout } from "@/components/AppLayout";

const sections = [
  {
    title: "Acceptance of Terms",
    content:
      "By accessing or using HSC Progress Tracker, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our service. We reserve the right to update these terms at any time, and your continued use of the service constitutes acceptance of any changes.",
  },
  {
    title: "Description of Service",
    content:
      "HSC Progress Tracker is a study tracking application designed for HSC (Higher Secondary Certificate) students. The service allows users to track their study progress, plan monthly goals, access AI-powered study analysis, and connect with a community of learners. Features may be added, modified, or removed at our discretion.",
  },
  {
    title: "User Accounts",
    content:
      "You must create an account to access certain features of the service. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You must provide accurate and complete information when creating your account and keep it updated.",
  },
  {
    title: "User Conduct",
    content:
      "You agree not to use the service for any unlawful purpose or in any way that could damage, disable, or impair the service. You must not upload harmful content, harass other users, or attempt to gain unauthorized access to any part of the service. Violations may result in account suspension or termination.",
  },
  {
    title: "Intellectual Property",
    content:
      "All content, features, and functionality of HSC Progress Tracker are owned by us and are protected by copyright, trademark, and other intellectual property laws. You may not reproduce, distribute, or create derivative works from any part of the service without our express written permission.",
  },
  {
    title: "User-Generated Content",
    content:
      "You retain ownership of any content you submit to the service (study data, doubts, answers, etc.). By submitting content, you grant us a non-exclusive, worldwide license to use, display, and distribute your content within the service. You are solely responsible for the content you post.",
  },
  {
    title: "Disclaimer of Warranties",
    content:
      "The service is provided 'as is' and 'as available' without any warranties of any kind, either express or implied. We do not guarantee that the service will be uninterrupted, error-free, or secure. We are not responsible for any loss of data or any damages arising from your use of the service.",
  },
  {
    title: "Limitation of Liability",
    content:
      "To the maximum extent permitted by law, HSC Progress Tracker and its operators shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of the service. Our total liability shall not exceed the amount you paid for the service, if any.",
  },
  {
    title: "Termination",
    content:
      "We reserve the right to suspend or terminate your account at any time for any reason, including violation of these terms. Upon termination, your right to use the service will immediately cease, and we may delete your account data in accordance with our Privacy Policy.",
  },
  {
    title: "Contact Us",
    content:
      "If you have any questions about these Terms of Service, please contact us at hscstudypdf@gmail.com.",
  },
];

export default function TermsOfService() {
  return (
    <AppLayout title="Terms of Service" showMobileHeader={false}>
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
          <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-1">Terms of Service</h1>
          <p className="text-sm text-muted-foreground mb-8">Last updated: February 2026</p>
          <p className="text-muted-foreground mb-8 leading-relaxed">
            Welcome to HSC Progress Tracker. Please read these Terms of Service carefully before using our study tracking application. By using our service, you agree to comply with and be bound by the following terms and conditions.
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
