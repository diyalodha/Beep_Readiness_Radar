import React from 'react';
import { Target, Zap, Clock, CheckCircle2 } from 'lucide-react';

export default function Hero() {
  return (
    <section className="relative overflow-hidden pt-12 pb-8 border-b border-slate-900">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-purple-600/10 blur-[120px] pointer-events-none rounded-full" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center relative z-10">
        
        {/* Mission Pill */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-slate-300 text-xs mb-6 shadow-sm">
          <span className="w-2 h-2 rounded-full bg-purple-500 animate-ping" />
          <span>Solving the Student Actionability Gap for Indian Campuses</span>
        </div>

        {/* Main Headline */}
        <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight sm:leading-tight mb-4">
          Stop getting ghosted by internships. <br />
          <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-300 bg-clip-text text-transparent">
            Know your real match & 7-day fix.
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-slate-400 text-sm sm:text-base max-w-2xl mx-auto mb-8 leading-relaxed">
          Job descriptions are full of overwhelming buzzwords. Paste your current skills and any internship listing to get a transparent match analysis, critical missing skills, and a weekend proof-of-work project plan.
        </p>

        {/* 3 Pillars */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-3xl mx-auto text-left">
          <div className="bg-slate-900/60 border border-slate-800/80 p-3.5 rounded-xl flex items-start gap-3">
            <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400 mt-0.5">
              <Target className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-semibold text-white">Transparent Match</h4>
              <p className="text-[11px] text-slate-400 mt-0.5">Clear breakdown of must-haves vs. transferable skills.</p>
            </div>
          </div>

          <div className="bg-slate-900/60 border border-slate-800/80 p-3.5 rounded-xl flex items-start gap-3">
            <div className="p-2 rounded-lg bg-pink-500/10 text-pink-400 mt-0.5">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-semibold text-white">48-Hr Proof of Work</h4>
              <p className="text-[11px] text-slate-400 mt-0.5">1 specific micro-project to prove the missing skill.</p>
            </div>
          </div>

          <div className="bg-slate-900/60 border border-slate-800/80 p-3.5 rounded-xl flex items-start gap-3">
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 mt-0.5">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-semibold text-white">7-Day Sprint Plan</h4>
              <p className="text-[11px] text-slate-400 mt-0.5">Daily micro-tasks from learning to outreach.</p>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
