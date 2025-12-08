import { Link } from "react-router-dom";
import { BookOpen, FileText } from "lucide-react";
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
                <Button variant="ghost" className="text-slate-300 hover:text-slate-100">Home</Button>
              </Link>
              <Link to="/tracker">
                <Button variant="ghost" className="text-slate-300 hover:text-slate-100">Tracker</Button>
              </Link>
              <Link to="/resources">
                <Button variant="ghost" className="text-slate-300 hover:text-slate-100">Resources</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold text-slate-100 mb-4">
            HSC Study Tracker
          </h2>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto">
            Complete study tracking system for Physics, Chemistry, Higher Math, and Biology
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto mb-16">
          <Card className="bg-slate-800/50 border-slate-700 hover:bg-slate-800/70 transition-colors">
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-blue-500/20 flex items-center justify-center mb-4">
                <BookOpen className="w-6 h-6 text-blue-400" />
              </div>
              <CardTitle className="text-slate-100">Study Tracker</CardTitle>
              <CardDescription className="text-slate-400">
                Track all chapters and activities across four subjects
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link to="/tracker">
                <Button className="w-full bg-blue-600 hover:bg-blue-700">
                  Open Tracker
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700 hover:bg-slate-800/70 transition-colors">
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-green-500/20 flex items-center justify-center mb-4">
                <FileText className="w-6 h-6 text-green-400" />
              </div>
              <CardTitle className="text-slate-100">Resources</CardTitle>
              <CardDescription className="text-slate-400">
                Manage class notes, MCQs, and other study resources
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link to="/resources">
                <Button className="w-full bg-green-600 hover:bg-green-700">
                  View Resources
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        <div className="text-center">
          <h3 className="text-2xl font-semibold text-slate-100 mb-6">Subjects</h3>
          <div className="flex flex-wrap justify-center gap-4">
            <div className="px-6 py-3 bg-slate-800/50 border border-slate-700 rounded-lg">
              <span className="text-slate-300">Physics 1st Paper (10 chapters)</span>
            </div>
            <div className="px-6 py-3 bg-slate-800/50 border border-slate-700 rounded-lg">
              <span className="text-slate-300">Chemistry 1st Paper (5 chapters)</span>
            </div>
            <div className="px-6 py-3 bg-slate-800/50 border border-slate-700 rounded-lg">
              <span className="text-slate-300">Higher Math 1st Paper (10 chapters)</span>
            </div>
            <div className="px-6 py-3 bg-slate-800/50 border border-slate-700 rounded-lg">
              <span className="text-slate-300">Biology 1st Paper (12 chapters)</span>
            </div>
            <div className="px-6 py-3 bg-slate-800/50 border border-slate-700 rounded-lg">
              <span className="text-slate-300">ICT (6 chapters)</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
