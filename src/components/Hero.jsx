import React from 'react';
import { Target, Zap, Clock } from 'lucide-react';

export default function Hero({ theme }) {
  const isDark = theme === 'dark';

  return (
    <section className={`relative overflow-hidden pt-10 pb-6 border-b transition-colors duration-200 ${
      isDark ? 'border-slate-900' : 'border-slate-200/80 bg-slate-50/50'
    }`}>
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-purple-600/10 blur-[120px] pointer-events-none rounded-full" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center relative z-10">
        
        {/* Mission Pill */}
        <div className={`inline-flex items-center gap-2 px-3.5 py-1 rounded-full border text-xs mb-5 shadow-sm transition-all ${
          isDark 
            ? 'bg-slate-900 border-slate-800 text-slate-300' 
            : 'bg-white border-slate-200 text-slate-700'
        }`}>
          <span className="w-2 h-2 rounded-full bg-purple-500 animate-ping" />
          <span>Solving the Student Actionability Gap for Indian Campuses</span>
        </div>

        {/* Main Headline */}
        <h1 className={`text-3xl sm:text-5xl font-black tracking-tight leading-tight sm:leading-tight mb-3 ${
          isDark ? 'text-white' : 'text-slate-900'
        }`}>
          Stop getting ghosted by internships. <br />
          <span className="bg-gradient-to-r from-purple-600 via-pink-500 to-indigo-500 bg-clip-text text-transparent">
            Know your real match & 7-day fix.
          </span>
        </h1>

        {/* Subtitle */}
        <p className={`text-xs sm:text-sm max-w-2xl mx-auto mb-7 leading-relaxed ${
          isDark ? 'text-slate-400' : 'text-slate-600'
        }`}>
          Job descriptions are full of overwhelming buzzwords. Paste your current skills and any internship listing to get a transparent match analysis, critical missing skills, and a weekend proof-of-work project plan.
        </p>

        {/* 3 Pillars */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-3xl mx-auto text-left">
          <div className={`border p-3.5 rounded-2xl flex items-start gap-3 transition-all ${
            isDark 
              ? 'bg-slate-900/70 border-slate-800/80 text-white' 
              : 'bg-white border-slate-200/90 shadow-sm text-slate-900'
          }`}>
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-600 mt-0.5">
              <Target className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold">Transparent Match</h4>
              <p className={`text-[11px] mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Clear breakdown of must-haves vs. transferable skills.
              </p>
            </div>
          </div>

          <div className={`border p-3.5 rounded-2xl flex items-start gap-3 transition-all ${
            isDark 
              ? 'bg-slate-900/70 border-slate-800/80 text-white' 
              : 'bg-white border-slate-200/90 shadow-sm text-slate-900'
          }`}>
            <div className="p-2 rounded-xl bg-pink-500/10 text-pink-600 mt-0.5">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold">48-Hr Proof of Work</h4>
              <p className={`text-[11px] mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                1 specific micro-project to prove the missing skill.
              </p>
            </div>
          </div>

          <div className={`border p-3.5 rounded-2xl flex items-start gap-3 transition-all ${
            isDark 
              ? 'bg-slate-900/70 border-slate-800/80 text-white' 
              : 'bg-white border-slate-200/90 shadow-sm text-slate-900'
          }`}>
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-600 mt-0.5">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold">7-Day Sprint Plan</h4>
              <p className={`text-[11px] mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Daily micro-tasks from learning to outreach.
              </p>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
