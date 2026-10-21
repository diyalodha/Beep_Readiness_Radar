import React from 'react';
import { Target, Zap, Clock, ShieldCheck, Sparkles, ArrowRight } from 'lucide-react';

export default function Hero({ theme, onScrollToRoles, onOpenStats, onOpenQuiz }) {
  const isDark = theme === 'dark';

  return (
    <section className={`relative overflow-hidden pt-12 pb-10 border-b transition-colors duration-200 ${
      isDark ? 'border-slate-800 bg-slate-950/70' : 'border-slate-200 bg-gradient-to-b from-white via-slate-50 to-slate-100/60'
    }`}>
      {/* Background Decorative Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[320px] bg-purple-600/10 blur-[130px] pointer-events-none rounded-full" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center relative z-10">
        
        {/* Mission Pill */}
        <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full border text-xs font-bold mb-5 shadow-sm transition-all ${
          isDark 
            ? 'bg-slate-900/90 border-slate-700 text-purple-300 shadow-purple-950/30' 
            : 'bg-white border-purple-200 text-purple-800 shadow-sm'
        }`}>
          <Sparkles className="w-3.5 h-3.5 text-purple-600 animate-pulse" />
          <span>EventBeep Founder’s Office</span>
          <span className="opacity-40">•</span>
          <span className="font-semibold">Discovery Assignment Platform</span>
        </div>

        {/* Highlighted Bold 2-Line Headline */}
        <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight leading-[1.15] sm:leading-[1.15] mb-4">
          <span className={`block ${isDark ? 'text-white' : 'text-slate-950'}`}>
            Internship Readiness Radar
          </span>
          <span className="block mt-1 bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 bg-clip-text text-transparent">
            Know Your Real Match & 48-Hour Fix.
          </span>
        </h1>

        {/* High-Contrast Subtitle */}
        <p className={`text-sm sm:text-base max-w-2xl mx-auto mb-8 leading-relaxed font-medium ${
          isDark ? 'text-slate-200' : 'text-slate-700'
        }`}>
          Stop getting ghosted by campus tech roles. Job descriptions are filled with overwhelming buzzwords—audit your resume against verified criteria, diagnose missing skills with token-aware precision, and generate a concrete 48-hour proof-of-work project blueprint.
        </p>

        {/* Quick Action CTAs */}
        <div className="flex flex-wrap items-center justify-center gap-3 mb-10">
          <button
            onClick={onScrollToRoles}
            className="px-6 py-3 rounded-2xl font-black text-xs sm:text-sm bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-500 hover:from-purple-500 hover:to-indigo-500 text-white shadow-lg shadow-purple-600/30 hover:shadow-purple-600/50 transition transform hover:-translate-y-0.5 cursor-pointer inline-flex items-center gap-2"
          >
            <span>Start Resume & Role Audit</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          {onOpenQuiz && (
            <button
              onClick={onOpenQuiz}
              className={`px-5 py-3 rounded-2xl font-bold text-xs sm:text-sm border transition cursor-pointer inline-flex items-center gap-2 ${
                isDark 
                  ? 'bg-slate-900 hover:bg-slate-800 border-slate-700 text-slate-200' 
                  : 'bg-white hover:bg-slate-50 border-slate-300 text-slate-800 shadow-sm'
              }`}
            >
              <Zap className="w-4 h-4 text-amber-500" />
              <span>Adaptive CS Quiz</span>
            </button>
          )}

          {onOpenStats && (
            <button
              onClick={onOpenStats}
              className={`px-5 py-3 rounded-2xl font-bold text-xs sm:text-sm border transition cursor-pointer inline-flex items-center gap-2 ${
                isDark 
                  ? 'bg-slate-900 hover:bg-slate-800 border-slate-700 text-slate-200' 
                  : 'bg-white hover:bg-slate-50 border-slate-300 text-slate-800 shadow-sm'
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>Placement Guidelines</span>
            </button>
          )}
        </div>

        {/* 3 Pillars */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 max-w-4xl mx-auto text-left">
          
          {/* Pillar 1 */}
          <div className={`border p-4 rounded-2xl flex items-start gap-3.5 transition-all ${
            isDark 
              ? 'bg-slate-900/80 border-slate-800 text-white shadow-md' 
              : 'bg-white border-slate-200 shadow-sm text-slate-900'
          }`}>
            <div className={`p-2.5 rounded-xl mt-0.5 ${
              isDark ? 'bg-purple-500/20 text-purple-300' : 'bg-purple-100 text-purple-700'
            }`}>
              <Target className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold leading-tight">Token-Aware Matching</h4>
              <p className={`text-[11px] mt-1 leading-snug font-medium ${
                isDark ? 'text-slate-300' : 'text-slate-600'
              }`}>
                Strict boundary regex checks. No false positives like Java in JavaScript or C in CSS.
              </p>
            </div>
          </div>

          {/* Pillar 2 */}
          <div className={`border p-4 rounded-2xl flex items-start gap-3.5 transition-all ${
            isDark 
              ? 'bg-slate-900/80 border-slate-800 text-white shadow-md' 
              : 'bg-white border-slate-200 shadow-sm text-slate-900'
          }`}>
            <div className={`p-2.5 rounded-xl mt-0.5 ${
              isDark ? 'bg-pink-500/20 text-pink-300' : 'bg-pink-100 text-pink-700'
            }`}>
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold leading-tight">48-Hr Proof of Work</h4>
              <p className={`text-[11px] mt-1 leading-snug font-medium ${
                isDark ? 'text-slate-300' : 'text-slate-600'
              }`}>
                Tailored architectural spec, Google XYZ resume bullets, and a copyable README.md.
              </p>
            </div>
          </div>

          {/* Pillar 3 */}
          <div className={`border p-4 rounded-2xl flex items-start gap-3.5 transition-all ${
            isDark 
              ? 'bg-slate-900/80 border-slate-800 text-white shadow-md' 
              : 'bg-white border-slate-200 shadow-sm text-slate-900'
          }`}>
            <div className={`p-2.5 rounded-xl mt-0.5 ${
              isDark ? 'bg-indigo-500/20 text-indigo-300' : 'bg-indigo-100 text-indigo-700'
            }`}>
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold leading-tight">7-Day Sprint & STAR Prep</h4>
              <p className={`text-[11px] mt-1 leading-snug font-medium ${
                isDark ? 'text-slate-300' : 'text-slate-600'
              }`}>
                Day-by-day remediation sprint, technical interview STAR answers, and cold pitch.
              </p>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
