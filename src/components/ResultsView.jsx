import React, { useState } from 'react';
import { 
  CheckCircle, AlertCircle, HelpCircle, Calendar, 
  Copy, Check, Share2, ArrowUpRight, Flame, Layers, 
  Terminal, Sparkles, UserCheck, ShieldAlert, Cpu
} from 'lucide-react';

export default function ResultsView({ result, onNewAudit }) {
  const [copiedBulletIdx, setCopiedBulletIdx] = useState(null);
  const [copiedColdPitch, setCopiedColdPitch] = useState(false);
  const [shareFeedback, setShareFeedback] = useState(false);

  if (!result) return null;

  const copyToClipboard = (text, type, index = null) => {
    navigator.clipboard.writeText(text);
    if (type === 'bullet') {
      setCopiedBulletIdx(index);
      setTimeout(() => setCopiedBulletIdx(null), 2000);
    } else if (type === 'coldPitch') {
      setCopiedColdPitch(true);
      setTimeout(() => setCopiedColdPitch(false), 2000);
    } else if (type === 'share') {
      setShareFeedback(true);
      setTimeout(() => setShareFeedback(false), 2500);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-emerald-400 border-emerald-500/40 bg-emerald-950/30';
    if (score >= 55) return 'text-amber-400 border-amber-500/40 bg-amber-950/30';
    return 'text-rose-400 border-rose-500/40 bg-rose-950/30';
  };

  return (
    <div id="results-section" className="max-w-6xl mx-auto px-4 sm:px-6 pb-20 space-y-6">
      
      {/* 1. TRANSPARENCY BANNER: CLEARLY DISTINGUISH DEMO FROM GENUINE AI */}
      <div className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg ${
        result.isAIGenerated
          ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200'
          : 'bg-amber-950/40 border-amber-500/40 text-amber-200'
      }`}>
        <div className="flex items-start sm:items-center gap-3">
          <div className={`p-2 rounded-xl mt-0.5 sm:mt-0 ${
            result.isAIGenerated ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'
          }`}>
            {result.isAIGenerated ? <Cpu className="w-5 h-5" /> : <Sparkles className="w-5 h-5" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm">
                {result.isAIGenerated ? '🟢 Genuine AI-Generated Analysis' : '🟡 Curated Heuristic Demo Results'}
              </span>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-slate-900/80 border border-slate-700/60 text-slate-300">
                Engine: {result.engine || 'Heuristic Simulator'}
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              {result.isAIGenerated 
                ? 'Processed live by backend Google Gemini model against industry recruiter standards.' 
                : 'Deterministic matching simulation. To switch to live Gemini AI, set GEMINI_API_KEY in server .env.'}
            </p>
          </div>
        </div>

        <button
          onClick={() => copyToClipboard(window.location.href, 'share')}
          className="self-start sm:self-auto inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 transition"
        >
          {shareFeedback ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
          {shareFeedback ? 'Audit Link Copied!' : 'Share Scorecard'}
        </button>
      </div>

      {/* 2. MATCH SCORE & READINESS DASHBOARD */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        
        {/* Score Card */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between shadow-xl">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Readiness Score
            </span>
            <div className="flex items-baseline gap-3 mt-2">
              <span className={`text-6xl font-black tracking-tight ${getScoreColor(result.matchScore).split(' ')[0]}`}>
                {result.matchScore}%
              </span>
              <span className="text-xs text-slate-400 font-medium">overall match</span>
            </div>
            
            <div className="mt-3">
              <span className={`inline-block text-xs font-bold px-3 py-1 rounded-full border ${getScoreColor(result.matchScore)}`}>
                {result.readinessLevel}
              </span>
            </div>
          </div>

          {/* Scoring Methodology */}
          <div className="mt-6 pt-4 border-t border-slate-800 space-y-2 text-xs">
            <div className="flex justify-between text-slate-400">
              <span>Must-Have Skills Match:</span>
              <span className="font-semibold text-slate-200">{result.scoreBreakdown?.mustHaveCoverage || '65%'}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Transferable Skills Bonus:</span>
              <span className="font-semibold text-purple-400">{result.scoreBreakdown?.transferableBonus || '+15%'}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>ATS Filter Risk:</span>
              <span className="font-semibold text-rose-400">{result.scoreBreakdown?.riskFactor || 'Medium'}</span>
            </div>
          </div>
        </div>

        {/* Recruiter Insight Card */}
        <div className="lg:col-span-2 bg-slate-900/90 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between shadow-xl">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <UserCheck className="w-4 h-4 text-purple-400" />
              <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider">
                Recruiter Reality Check
              </h3>
            </div>
            <div className="bg-slate-950 border border-slate-800/80 rounded-xl p-4 text-sm text-slate-300 leading-relaxed italic">
              "{result.recruiterInsight}"
            </div>
          </div>

          {/* Proof of Work Highlight */}
          <div className="mt-5 pt-4 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-purple-950/20 p-3.5 rounded-xl border border-purple-900/30">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400 flex items-center gap-1">
                <Flame className="w-3.5 h-3.5 text-amber-400" />
                The Recommended 48-Hour Fix
              </span>
              <h4 className="text-xs font-bold text-slate-100 mt-0.5">
                {result.proofOfWorkProject?.title || 'Mini-Proof Web App'}
              </h4>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {result.proofOfWorkProject?.deliverable}
              </p>
            </div>
            <span className="shrink-0 text-xs font-semibold px-2.5 py-1 rounded-md bg-purple-900/50 text-purple-200 border border-purple-700/50">
              {result.proofOfWorkProject?.estimatedHours || '6-8 hrs'}
            </span>
          </div>
        </div>

      </div>

      {/* 3. SKILLS MATCH BREAKDOWN GRID */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider mb-4 flex items-center gap-2">
          <Layers className="w-4 h-4 text-indigo-400" />
          Transparent Skills Diagnostic
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* Matched Skills */}
          <div className="bg-slate-950 border border-emerald-900/40 rounded-xl p-4">
            <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-bold mb-3">
              <CheckCircle className="w-4 h-4" />
              <span>Matched Skills ({result.skillsBreakdown?.matched?.length || 0})</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {result.skillsBreakdown?.matched?.length > 0 ? (
                result.skillsBreakdown.matched.map((s, idx) => (
                  <span key={idx} className="text-xs px-2.5 py-1 rounded-lg bg-emerald-950/60 border border-emerald-800/50 text-emerald-300 font-mono font-medium">
                    {s}
                  </span>
                ))
              ) : (
                <span className="text-xs text-slate-500">No direct skill matches detected.</span>
              )}
            </div>
          </div>

          {/* Transferable Skills */}
          <div className="bg-slate-950 border border-blue-900/40 rounded-xl p-4">
            <div className="flex items-center gap-1.5 text-blue-400 text-xs font-bold mb-3">
              <HelpCircle className="w-4 h-4" />
              <span>Transferable Skills ({result.skillsBreakdown?.transferable?.length || 0})</span>
            </div>
            <div className="space-y-1.5">
              {result.skillsBreakdown?.transferable?.length > 0 ? (
                result.skillsBreakdown.transferable.map((t, idx) => (
                  <div key={idx} className="text-xs p-2 rounded-lg bg-blue-950/40 border border-blue-800/40 text-blue-200">
                    {t}
                  </div>
                ))
              ) : (
                <span className="text-xs text-slate-500">No adjacent skills identified.</span>
              )}
            </div>
          </div>

          {/* Missing Critical Skills */}
          <div className="bg-slate-950 border border-rose-900/40 rounded-xl p-4">
            <div className="flex items-center gap-1.5 text-rose-400 text-xs font-bold mb-3">
              <AlertCircle className="w-4 h-4" />
              <span>Critical Gaps ({result.skillsBreakdown?.missingCritical?.length || 0})</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {result.skillsBreakdown?.missingCritical?.length > 0 ? (
                result.skillsBreakdown.missingCritical.map((m, idx) => (
                  <span key={idx} className="text-xs px-2.5 py-1 rounded-lg bg-rose-950/60 border border-rose-800/50 text-rose-300 font-mono font-medium">
                    {m}
                  </span>
                ))
              ) : (
                <span className="text-xs text-emerald-400">All required skills present!</span>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* 4. THE 7-DAY DAY-BY-DAY PREPARATION PLAN */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-purple-400" />
            <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider">
              7-Day Sprint: Zero to Interview-Ready
            </h3>
          </div>
          <span className="text-xs text-slate-400">Designed for student schedules</span>
        </div>

        <div className="space-y-3">
          {result.sevenDayPlan?.map((planItem, idx) => (
            <div key={idx} className="bg-slate-950 border border-slate-800/80 rounded-xl p-4 hover:border-slate-700 transition">
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  {planItem.day}
                </span>
                <span className="text-xs font-semibold text-slate-300">
                  {planItem.phase}
                </span>
              </div>
              <ul className="space-y-1.5 mt-2">
                {planItem.tasks.map((task, tIdx) => (
                  <li key={tIdx} className="text-xs text-slate-400 flex items-start gap-2">
                    <span className="text-purple-400 font-bold">•</span>
                    <span>{task}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* 5. APPLICATION BOOSTER: RESUME BULLETS & COLD OUTREACH */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        
        {/* Tailored Resume Bullets */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Terminal className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider">
                Tailored Resume Bullets (XYZ Formula)
              </h3>
            </div>
            <p className="text-xs text-slate-400 mb-4">
              Copy and adapt these metric-driven bullets directly into your resume:
            </p>

            <div className="space-y-3">
              {result.applicationBooster?.tailoredBullets?.map((bullet, idx) => (
                <div key={idx} className="bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-300 relative group">
                  <p className="pr-8 leading-relaxed font-sans">{bullet}</p>
                  <button
                    onClick={() => copyToClipboard(bullet, 'bullet', idx)}
                    className="absolute top-2.5 right-2.5 p-1.5 rounded-md bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-400 hover:text-white transition"
                    title="Copy bullet"
                  >
                    {copiedBulletIdx === idx ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Cold Outreach DM */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-pink-400" />
                <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider">
                  Recruiter / Founder Cold Outreach
                </h3>
              </div>
              <button
                onClick={() => copyToClipboard(result.applicationBooster?.coldPitchMessage, 'coldPitch')}
                className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-md bg-purple-600 hover:bg-purple-500 text-white font-medium transition"
              >
                {copiedColdPitch ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedColdPitch ? 'Copied DM!' : 'Copy Pitch'}
              </button>
            </div>
            <p className="text-xs text-slate-400 mb-4">
              Send this 4-sentence DM directly to founders or hiring leads on LinkedIn:
            </p>

            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 text-xs text-slate-300 font-mono whitespace-pre-wrap leading-relaxed">
              {result.applicationBooster?.coldPitchMessage}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-500">
            💡 Pro-tip: Insert your GitHub or demo link in the bracketed area before hitting send.
          </div>
        </div>

      </div>

      {/* 6. BEEP COMMUNITY BRIDGE & NEW AUDIT BUTTON */}
      <div className="bg-gradient-to-r from-purple-900/40 via-indigo-900/30 to-slate-900 border border-purple-500/30 rounded-2xl p-6 sm:p-8 text-center space-y-4 shadow-2xl">
        <h3 className="text-lg sm:text-xl font-bold text-white">
          Don't prepare alone. Build & get verified on Beep.
        </h3>
        <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto">
          Need a peer study group or review on your 48-hour proof-of-work project? Connect with mentors and other Indian college students on the Beep platform.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <a
            href="https://eventbeep.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-lg shadow-purple-600/30 transition"
          >
            Explore Beep Career Community
            <ArrowUpRight className="w-4 h-4" />
          </a>
          <button
            onClick={onNewAudit}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white text-xs font-bold transition"
          >
            Audit Another Internship
          </button>
        </div>
      </div>

    </div>
  );
}
