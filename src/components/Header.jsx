import React, { useState } from 'react';
import { Sparkles, ShieldCheck, Info, HelpCircle } from 'lucide-react';

export default function Header({ apiStatus }) {
  const [showInfo, setShowInfo] = useState(false);

  return (
    <header className="border-b border-slate-800 bg-slate-900/60 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
        
        {/* Brand / Logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-purple-500/20 text-white font-bold text-xl tracking-tight">
            B
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-white via-slate-200 to-purple-300 bg-clip-text text-transparent">
                Beep
              </span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-purple-500/15 border border-purple-500/30 text-purple-300">
                Readiness Radar
              </span>
            </div>
            <p className="text-[11px] text-slate-400">Founder’s Office Discovery MVP</p>
          </div>
        </div>

        {/* Engine Transparency Indicator */}
        <div className="flex items-center gap-3">
          <div 
            onClick={() => setShowInfo(!showInfo)}
            className={`cursor-pointer group flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
              apiStatus?.aiEnabled 
                ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300 hover:bg-emerald-900/50' 
                : 'bg-amber-950/50 border-amber-500/40 text-amber-300 hover:bg-amber-900/40'
            }`}
          >
            <span className={`w-2 h-2 rounded-full animate-pulse ${apiStatus?.aiEnabled ? 'bg-emerald-400' : 'bg-amber-400'}`} />
            <span>{apiStatus?.aiEnabled ? 'Live AI Engine (Gemini)' : 'Demo Engine (Active)'}</span>
            <HelpCircle className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100" />
          </div>

          <a 
            href="#audit-tool" 
            className="hidden sm:inline-flex items-center gap-1.5 text-xs font-medium bg-purple-600 hover:bg-purple-500 text-white px-3.5 py-1.5 rounded-lg shadow-sm transition"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Check My Role
          </a>
        </div>
      </div>

      {/* Info Modal / Dropdown */}
      {showInfo && (
        <div className="bg-slate-900 border-b border-slate-800 px-4 py-3 text-xs text-slate-300 transition-all">
          <div className="max-w-7xl mx-auto flex items-start gap-3">
            <Info className="w-4 h-4 text-purple-400 mt-0.5 shrink-0" />
            <div className="space-y-1">
              <p className="font-semibold text-slate-100">
                System Mode: {apiStatus?.aiEnabled ? '🟢 Genuine Gemini 2.5 Flash' : '🟡 Curated Heuristic Simulation (Demo Mode)'}
              </p>
              <p className="text-slate-400">
                {apiStatus?.message || 'API keys are stored exclusively in the backend server environment (.env) to prevent client-side leaks.'}
              </p>
              <p className="text-slate-500 text-[11px]">
                To switch to live AI, add <code className="bg-slate-800 text-purple-300 px-1 py-0.5 rounded">GEMINI_API_KEY=your_key</code> in the server <code className="bg-slate-800 text-purple-300 px-1 py-0.5 rounded">.env</code> file. No code changes needed.
              </p>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
