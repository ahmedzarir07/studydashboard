import { Link } from "react-router-dom";
import { BookOpen, BarChart3, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <nav className="border-b border-slate-700 bg-slate-900/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-slate-100">HSC Study Tracker</h1>
            <div className="flex gap-4">
              <Link to="/">
                <Button variant="ghost" className="text-slate-300 hover:text-slate-100">হোম</Button>
              </Link>
              <Link to="/tracker">
                <Button variant="ghost" className="text-slate-300 hover:text-slate-100">ট্র্যাকার</Button>
              </Link>
              <Link to="/resources">
                <Button variant="ghost" className="text-slate-300 hover:text-slate-100">রিসোর্স</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold text-slate-100 mb-4">
            HSC পড়াশোনা ট্র্যাকার
          </h2>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto">
            পদার্থবিজ্ঞান, রসায়ন, উচ্চতর গণিত এবং জীববিজ্ঞানের জন্য সম্পূর্ণ অধ্যয়ন ট্র্যাকিং সিস্টেম
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto mb-16">
          <Card className="bg-slate-800/50 border-slate-700 hover:bg-slate-800/70 transition-colors">
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-blue-500/20 flex items-center justify-center mb-4">
                <BookOpen className="w-6 h-6 text-blue-400" />
              </div>
              <CardTitle className="text-slate-100">স্টাডি ট্র্যাকার</CardTitle>
              <CardDescription className="text-slate-400">
                চারটি বিষয়ের সমস্ত অধ্যায় এবং কার্যক্রম ট্র্যাক করুন
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link to="/tracker">
                <Button className="w-full bg-blue-600 hover:bg-blue-700">
                  ট্র্যাকার খুলুন
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700 hover:bg-slate-800/70 transition-colors">
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-green-500/20 flex items-center justify-center mb-4">
                <FileText className="w-6 h-6 text-green-400" />
              </div>
              <CardTitle className="text-slate-100">রিসোর্স ম্যানেজার</CardTitle>
              <CardDescription className="text-slate-400">
                ক্লাস নোট, MCQ এবং অন্যান্য রিসোর্স পরিচালনা করুন
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link to="/resources">
                <Button className="w-full bg-green-600 hover:bg-green-700">
                  রিসোর্স দেখুন
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700 hover:bg-slate-800/70 transition-colors">
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-purple-500/20 flex items-center justify-center mb-4">
                <BarChart3 className="w-6 h-6 text-purple-400" />
              </div>
              <CardTitle className="text-slate-100">অগ্রগতি পরিসংখ্যান</CardTitle>
              <CardDescription className="text-slate-400">
                আপনার অধ্যয়নের অগ্রগতি দেখুন এবং বিশ্লেষণ করুন
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" variant="secondary" disabled>
                শীঘ্রই আসছে
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="text-center">
          <h3 className="text-2xl font-semibold text-slate-100 mb-6">বিষয়সমূহ</h3>
          <div className="flex flex-wrap justify-center gap-4">
            <div className="px-6 py-3 bg-slate-800/50 border border-slate-700 rounded-lg">
              <span className="text-slate-300">পদার্থবিজ্ঞান ১ম পত্র (১০ অধ্যায়)</span>
            </div>
            <div className="px-6 py-3 bg-slate-800/50 border border-slate-700 rounded-lg">
              <span className="text-slate-300">রসায়ন ১ম পত্র (৫ অধ্যায়)</span>
            </div>
            <div className="px-6 py-3 bg-slate-800/50 border border-slate-700 rounded-lg">
              <span className="text-slate-300">উচ্চতর গণিত ১ম পত্র (১০ অধ্যায়)</span>
            </div>
            <div className="px-6 py-3 bg-slate-800/50 border border-slate-700 rounded-lg">
              <span className="text-slate-300">জীববিজ্ঞান ১ম পত্র (১২ অধ্যায়)</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
