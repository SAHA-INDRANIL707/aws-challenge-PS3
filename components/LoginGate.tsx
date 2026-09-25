'use client';

import React from 'react';
import { signIn } from 'next-auth/react';
import { 
  Sparkles, 
  Calendar, 
  Layers, 
  Mail, 
  MessageSquare, 
  ShieldCheck, 
  Zap, 
  CheckCircle2, 
  FileCheck,
  ArrowRight
} from 'lucide-react';

export const LoginGate: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#070b13] text-slate-100 overflow-hidden relative">
      {/* Background Decorative Gradients */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-blue-600/10 blur-[140px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[300px] bg-purple-600/10 blur-[140px] rounded-full pointer-events-none" />

      {/* Top Bar */}
      <header className="max-w-7xl mx-auto w-full px-6 py-6 flex items-center justify-between relative z-10">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-violet-500 flex items-center justify-center shadow-lg shadow-blue-500/20 ring-1 ring-white/20">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="font-bold text-lg text-white tracking-tight">SyncPulse</span>
            <span className="ml-2 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-full">
              AI Action Engine
            </span>
          </div>
        </div>

        <button
          onClick={() => signIn('google')}
          className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700 text-xs font-semibold transition hover:scale-105"
        >
          <span>Sign In</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </header>

      {/* Hero Section */}
      <main className="max-w-5xl mx-auto px-6 py-12 text-center space-y-8 relative z-10 my-auto">
        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs font-semibold text-blue-400">
          <Zap className="w-3.5 h-3.5 text-amber-400" />
          <span>Automated Meeting Intelligence & Tool Dispatch</span>
        </div>

        <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold text-white tracking-tight leading-tight">
          Never let a meeting decision <br />
          <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-violet-400 bg-clip-text text-transparent">
            slip through the cracks again.
          </span>
        </h1>

        <p className="max-w-2xl mx-auto text-sm sm:text-base text-slate-400 leading-relaxed">
          Paste any meeting transcript. SyncPulse instantly extracts verified decisions, assigned owners, and deadlines, and automatically pushes them to <strong className="text-slate-200">Google Calendar</strong>, <strong className="text-slate-200">Jira</strong>, <strong className="text-slate-200">Slack</strong>, and <strong className="text-slate-200">Gmail</strong>.
        </p>

        {/* Google Sign-in CTA */}
        <div className="pt-4 flex flex-col items-center justify-center space-y-3">
          <button
            onClick={() => signIn('google')}
            className="flex items-center space-x-3 px-8 py-4 rounded-2xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-sm shadow-2xl shadow-blue-500/20 hover:scale-105 active:scale-95 transition-all duration-200 ring-4 ring-white/10"
          >
            {/* Google SVG Icon */}
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Continue with Google Account</span>
          </button>

          <div className="flex items-center space-x-2 text-xs text-slate-500">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Secured via Google OAuth • Direct Calendar & Email Access</span>
          </div>
        </div>

        {/* 3 Value Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-10 text-left">
          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400">
              <Calendar className="w-4 h-4" />
            </div>
            <h4 className="font-bold text-sm text-slate-200">Google Calendar Sync</h4>
            <p className="text-xs text-slate-400">
              Action item deadlines and follow-up milestones are added directly to your Google Calendar.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
              <FileCheck className="w-4 h-4" />
            </div>
            <h4 className="font-bold text-sm text-slate-200">Supabase User Profile & Archive</h4>
            <p className="text-xs text-slate-400">
              Your meeting records, decisions, and action owners are securely stored and indexed in Supabase.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400">
              <Layers className="w-4 h-4" />
            </div>
            <h4 className="font-bold text-sm text-slate-200">Jira, Slack & Email Dispatch</h4>
            <p className="text-xs text-slate-400">
              Create Jira tickets and send task assignment emails on your behalf with a single click.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto w-full px-6 py-6 text-center text-xs text-slate-500 border-t border-slate-900 relative z-10">
        SyncPulse • Intelligent Meeting Action Engine powered by Groq & Supabase
      </footer>
    </div>
  );
};
