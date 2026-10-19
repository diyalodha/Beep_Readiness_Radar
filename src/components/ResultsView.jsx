import React, { useState } from 'react';
import { 
  CheckCircle, AlertCircle, HelpCircle, Calendar, 
  Copy, Check, Share2, Flame, Layers, 
  Terminal, Sparkles, UserCheck, ShieldAlert, Cpu, 
  Send, ShieldCheck, AlertTriangle, Link2
} from 'lucide-react';

export default function ResultsView({ result, onNewAudit, onApplyClick, theme }) {
  const [copiedBulletIdx, setCopiedBulletIdx] = useState(null);
  const [copiedColdPitch, setCopiedColdPitch] = useState(false);
  const [copyStatus, setCopyStatus] = useState({ ok: null, message: '' });

  if (!result) return null;

  const isDark = theme === 'dark';

  const doCopy = async (text) => {
    try {
      if (!navigator.clipboard || typeof navigator.clipboard.writeText !== 'function') {
        throw new Error('Clipboard API not available in this browser context.');
      }
      await navigator.clipboard.writeText(text);
      return { ok: true };
    } catch (err) {
      return { ok: false, error: err?.message || 'Clipboard permission denied.' };
    }
  };

  const flashCopyStatus = (payload) => {
    setCopyStatus(payload);
    setTimeout(() => setCopyStatus({ ok: null, message: '' }), 2500);
  };

  const handleCopy = async (text, type, index = null) => {
    const outcome = await doCopy(text);
    if (!outcome.ok) {
      flashCopyStatus({ ok: false, message: outcome.error });
      return;
    }
    if (type === 'bullet') {
      setCopiedBulletIdx(index);
      setTimeout(() => setCopiedBulletIdx(null), 2000);
    } else if (type === 'coldPitch') {
      setCopiedColdPitch(true);
      setTimeout(() => setCopiedColdPitch(false), 2000);
    } else if (type === 'url') {
      flashCopyStatus({ ok: true, message: 'Page URL copied to clipboard.' });
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) {
      return isDark 
        ? 'text-emerald-400 border-emerald-500/40 bg-emerald-950/30' 
        : 'text-emerald-700 border-emerald-300 bg-emerald-50';
    }
    if (score >= 55) {
      return isDark 
        ? 'text-amber-400 border-amber-500/40 bg-amber-950/30' 
        : 'text-amber-700 border-amber-300 bg-amber-50';
    }
    return isDark 
      ? 'text-rose-400 border-rose-500/40 bg-rose-950/30' 
      : 'text-rose-700 border-rose-300 bg-rose-50';
  };

  return (
    <div id="results-section" className="max-w-6xl mx-auto px-4 sm:px-6 pb-20 space-y-6 pt-4">
      
      {/* 1. TRANSPARENCY BANNER: CLEARLY DISTINGUISH DEMO FROM GENUINE AI */}
      <div className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md transition-colors ${
        result.isAIGenerated
          ? (isDark ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200' : 'bg-emerald-50 border-emerald-300 text-emerald-900')
          : (isDark ? 'bg-amber-950/40 border-amber-500/40 text-amber-200' : 'bg-amber-50 border-amber-300 text-amber-900')
      }`}>
        <div className="flex items-start sm:items-center gap-3">
          <div className={`p-2 rounded-xl mt-0.5 sm:mt-0 ${
            result.isAIGenerated 
              ? (isDark ? 'bg-emerald-500/20 text-emerald-300' : 'bg-emerald-200 text-emerald-800')
              : (isDark ? 'bg-amber-500/20 text-amber-300' : 'bg-amber-200 text-amber-800')
          }`}>
            {result.isAIGenerated ? <Cpu className="w-5 h-5" /> : <Sparkles className="w-5 h-5" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm">
                {result.isAIGenerated ? '🟢 Genuine AI-Generated Analysis' : '🟡 Dynamic Heuristic Engine (Demo Mode)'}
              </span>
              <span className={`text-[11px] font-mono px-2 py-0.5 rounded-full border ${
                isDark ? 'bg-slate-900/80 border-slate-700/60 text-slate-300' : 'bg-white border-slate-300 text-slate-700'
              }`}>
                Engine: {result.engine || 'Dynamic Simulator'}
              </span>
            </div>
            <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              Calculated specifically for <strong>{result.targetRole}</strong> against your uploaded resume.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Apply Button in Banner */}
          <button
            onClick={onApplyClick}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-500 text-white shadow-md shadow-purple-600/30 transition"
          >
            <Send className="w-3.5 h-3.5" />
            Apply via Beep
          </button>

          <button
            onClick={() => handleCopy(window.location.href, 'url')}
            title="Copies the current page URL to your clipboard. Anyone you share it with will need to redo the audit themselves."
            className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition ${
              isDark 
                ? 'bg-slate-900 hover:bg-slate-800 border-slate-700 text-slate-200' 
                : 'bg-white hover:bg-slate-100 border-slate-300 text-slate-700 shadow-sm'
            }`}
          >
            {copyStatus.ok === true ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Link2 className="w-3.5 h-3.5" />}
            <span>Copy Page URL</span>
            <Share2 className="w-3 h-3 opacity-60" />
          </button>
        </div>
      </div>

      {/* 2. MATCH SCORE & READINESS DASHBOARD */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        
        {/* Score Card */}
        <div className={`border rounded-2xl p-6 flex flex-col justify-between shadow-lg transition-colors ${
          isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200'
        }`}>
          <div>
            <div className="flex items-center justify-between">
              <span className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Dynamic Readiness Score
              </span>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${isDark ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-600'}`}>
                {result.resumeStats?.wordCount || 120} words
              </span>
            </div>

            <div className="flex items-baseline gap-3 mt-2">
              <span className={`text-6xl font-black tracking-tight ${getScoreColor(result.matchScore).split(' ')[0]}`}>
                {result.matchScore}%
              </span>
              <span className={`text-xs font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                match for this role
              </span>
            </div>
            
            <div className="mt-3">
              <span className={`inline-block text-xs font-bold px-3 py-1 rounded-full border ${getScoreColor(result.matchScore)}`}>
                {result.readinessLevel}
              </span>
            </div>
          </div>

          {/* Scoring Methodology */}
          <div className={`mt-6 pt-4 border-t space-y-2 text-xs ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
            <div className={`flex justify-between ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              <span>Must-Have Skills Match:</span>
              <span className={`font-semibold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                {result.scoreBreakdown?.mustHaveCoverage || '65%'}
              </span>
            </div>
            <div className={`flex justify-between ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              <span>Transferable Skills Bonus:</span>
              <span className="font-semibold text-purple-600 dark:text-purple-400">
                {result.scoreBreakdown?.transferableBonus || '+15%'}
              </span>
            </div>
            <div className={`flex justify-between ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              <span>ATS Filter Risk:</span>
              <span className="font-semibold text-rose-500">
                {result.scoreBreakdown?.riskFactor || 'Medium'}
              </span>
            </div>
          </div>
        </div>

        {/* Recruiter Insight Card */}
        <div className={`lg:col-span-2 border rounded-2xl p-6 flex flex-col justify-between shadow-lg transition-colors ${
          isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200'
        }`}>
          <div>
            <div className="flex items-center gap-2 mb-3">
              <UserCheck className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              <h3 className={`text-sm font-bold uppercase tracking-wider ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
                Recruiter Reality Check ({result.company || 'Hiring Team'})
              </h3>
            </div>
            <div className={`border rounded-xl p-4 text-sm leading-relaxed italic ${
              isDark 
                ? 'bg-slate-950 border-slate-800 text-slate-300' 
                : 'bg-slate-50 border-slate-200 text-slate-700'
            }`}>
              "{result.recruiterInsight}"
            </div>
          </div>

          {/* Proof of Work Highlight */}
          <div className={`mt-5 pt-4 border-t flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl border ${
            isDark 
              ? 'border-slate-800 bg-purple-950/20 border-purple-900/30' 
              : 'border-purple-200 bg-purple-50/60'
          }`}>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400 flex items-center gap-1">
                <Flame className="w-3.5 h-3.5 text-amber-500" />
                The Recommended 48-Hour Fix
              </span>
              <h4 className={`text-xs font-bold mt-0.5 ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
                {result.proofOfWorkProject?.title || 'Mini-Proof Web App'}
              </h4>
              <p className={`text-[11px] mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                {result.proofOfWorkProject?.deliverable}
              </p>
            </div>
            <span className="shrink-0 text-xs font-semibold px-2.5 py-1 rounded-md bg-purple-600 text-white shadow-sm">
              {result.proofOfWorkProject?.estimatedHours || '6-8 hrs'}
            </span>
          </div>
        </div>

      </div>
 
      {/* 2.5 (removed) Fabricated applicant-pool percentile stats deleted. */}

      {/* Copy status toast (bottom-left) */}
      {copyStatus.ok !== null && (
        <div className={`fixed bottom-4 left-4 z-50 px-3.5 py-2 rounded-xl border text-xs font-semibold shadow-lg ${
          copyStatus.ok
            ? (isDark ? 'bg-emerald-950/90 border-emerald-500/40 text-emerald-200' : 'bg-emerald-50 border-emerald-300 text-emerald-800')
            : (isDark ? 'bg-rose-950/90 border-rose-500/40 text-rose-200' : 'bg-rose-50 border-rose-300 text-rose-800')
        }`}>
          {copyStatus.ok ? 'Copied.' : `Copy failed: ${copyStatus.message}`}
        </div>
      )}

      {/* 3. OUT-OF-THE-BOX FEATURE: THE SILENT REJECTION RADAR */}
      {result.silentRejectionFlags && result.silentRejectionFlags.length > 0 && (
        <div className={`border rounded-2xl p-6 shadow-lg transition-colors ${
          isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200'
        }`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-500" />
              <h3 className={`text-sm font-bold uppercase tracking-wider ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
                The Silent Rejection Radar (Recruiter Filter Simulator)
              </h3>
            </div>
            <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${
              isDark ? 'bg-amber-500/10 border-amber-500/30 text-amber-400' : 'bg-amber-50 border-amber-300 text-amber-700'
            }`}>
              Hidden ATS & Recruiter Checks
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
            {result.silentRejectionFlags.map((flag, fIdx) => (
              <div
                key={fIdx}
                className={`p-3.5 rounded-xl border flex flex-col justify-between ${
                  flag.type === 'critical'
                    ? (isDark ? 'bg-rose-950/30 border-rose-900/50 text-rose-300' : 'bg-rose-50 border-rose-200 text-rose-900')
                    : flag.type === 'warning'
                      ? (isDark ? 'bg-amber-950/30 border-amber-900/50 text-amber-300' : 'bg-amber-50 border-amber-200 text-amber-900')
                      : (isDark ? 'bg-emerald-950/30 border-emerald-900/50 text-emerald-300' : 'bg-emerald-50 border-emerald-200 text-emerald-900')
                }`}
              >
                <div>
                  <div className="flex items-center gap-1.5 mb-1.5">
                    {flag.type === 'critical' && <ShieldAlert className="w-4 h-4 text-rose-500 shrink-0" />}
                    {flag.type === 'warning' && <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />}
                    {flag.type === 'pass' && <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />}
                    <h4 className="text-xs font-bold leading-tight">{flag.title}</h4>
                  </div>
                  <p className="text-[11px] leading-relaxed opacity-90">{flag.description}</p>
                </div>

                <div className="mt-2.5 pt-2 border-t border-current/10 text-[10px] font-mono font-bold uppercase tracking-wider">
                  {flag.type === 'critical' && '⚠️ High Risk of Silent Auto-Drop'}
                  {flag.type === 'warning' && '⚡ Fix Recommended Before Applying'}
                  {flag.type === 'pass' && '✅ Recruiter Check Passed'}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. SKILLS MATCH BREAKDOWN GRID */}
      <div className={`border rounded-2xl p-6 shadow-lg transition-colors ${
        isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200'
      }`}>
        <h3 className={`text-sm font-bold uppercase tracking-wider mb-4 flex items-center gap-2 ${
          isDark ? 'text-slate-100' : 'text-slate-900'
        }`}>
          <Layers className="w-4 h-4 text-indigo-500" />
          Transparent Skills Diagnostic
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* Matched Skills */}
          <div className={`border rounded-xl p-4 ${
            isDark ? 'bg-slate-950 border-emerald-900/40' : 'bg-emerald-50/50 border-emerald-200'
          }`}>
            <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 text-xs font-bold mb-3">
              <CheckCircle className="w-4 h-4" />
              <span>Matched Skills ({result.skillsBreakdown?.matched?.length || 0})</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {result.skillsBreakdown?.matched?.length > 0 ? (
                result.skillsBreakdown.matched.map((s, idx) => (
                  <span key={idx} className={`text-xs px-2.5 py-1 rounded-lg font-mono font-medium border ${
                    isDark 
                      ? 'bg-emerald-950/60 border-emerald-800/50 text-emerald-300' 
                      : 'bg-white border-emerald-300 text-emerald-800 shadow-sm'
                  }`}>
                    {s}
                  </span>
                ))
              ) : (
                <span className="text-xs text-slate-400">No direct skill matches detected.</span>
              )}
            </div>
          </div>

          {/* Transferable Skills */}
          <div className={`border rounded-xl p-4 ${
            isDark ? 'bg-slate-950 border-blue-900/40' : 'bg-blue-50/50 border-blue-200'
          }`}>
            <div className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400 text-xs font-bold mb-3">
              <HelpCircle className="w-4 h-4" />
              <span>Transferable Skills ({result.skillsBreakdown?.transferable?.length || 0})</span>
            </div>
            <div className="space-y-1.5">
              {result.skillsBreakdown?.transferable?.length > 0 ? (
                result.skillsBreakdown.transferable.map((t, idx) => (
                  <div key={idx} className={`text-xs p-2 rounded-lg border ${
                    isDark 
                      ? 'bg-blue-950/40 border-blue-800/40 text-blue-200' 
                      : 'bg-white border-blue-200 text-blue-800 shadow-sm'
                  }`}>
                    {t}
                  </div>
                ))
              ) : (
                <span className="text-xs text-slate-400">No adjacent skills identified.</span>
              )}
            </div>
          </div>

          {/* Missing Critical Skills */}
          <div className={`border rounded-xl p-4 ${
            isDark ? 'bg-slate-950 border-rose-900/40' : 'bg-rose-50/50 border-rose-200'
          }`}>
            <div className="flex items-center gap-1.5 text-rose-600 dark:text-rose-400 text-xs font-bold mb-3">
              <AlertCircle className="w-4 h-4" />
              <span>Critical Gaps ({result.skillsBreakdown?.missingCritical?.length || 0})</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {result.skillsBreakdown?.missingCritical?.length > 0 ? (
                result.skillsBreakdown.missingCritical.map((m, idx) => (
                  <span key={idx} className={`text-xs px-2.5 py-1 rounded-lg font-mono font-medium border ${
                    isDark 
                      ? 'bg-rose-950/60 border-rose-800/50 text-rose-300' 
                      : 'bg-white border-rose-300 text-rose-800 shadow-sm'
                  }`}>
                    {m}
                  </span>
                ))
              ) : (
                <span className="text-xs text-emerald-500 font-semibold">All required skills present!</span>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* 5. THE 7-DAY DAY-BY-DAY PREPARATION PLAN */}
      <div className={`border rounded-2xl p-6 shadow-lg transition-colors ${
        isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200'
      }`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            <h3 className={`text-sm font-bold uppercase tracking-wider ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
              7-Day Sprint: Zero to Interview-Ready
            </h3>
          </div>
          <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Designed for student schedules
          </span>
        </div>

        <div className="space-y-3">
          {result.sevenDayPlan?.map((planItem, idx) => (
            <div key={idx} className={`border rounded-xl p-4 transition ${
              isDark 
                ? 'bg-slate-950 border-slate-800 hover:border-slate-700' 
                : 'bg-slate-50 border-slate-200 hover:bg-slate-100/60'
            }`}>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-purple-600 text-white">
                  {planItem.day}
                </span>
                <span className={`text-xs font-semibold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                  {planItem.phase}
                </span>
              </div>
              <ul className="space-y-1.5 mt-2">
                {planItem.tasks.map((task, tIdx) => (
                  <li key={tIdx} className={`text-xs flex items-start gap-2 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                    <span className="text-purple-600 dark:text-purple-400 font-bold">•</span>
                    <span>{task}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* 6. APPLICATION BOOSTER: RESUME BULLETS & COLD OUTREACH */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        
        {/* Tailored Resume Bullets */}
        <div className={`border rounded-2xl p-6 shadow-lg flex flex-col justify-between transition-colors ${
          isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200'
        }`}>
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Terminal className="w-4 h-4 text-emerald-500" />
              <h3 className={`text-sm font-bold uppercase tracking-wider ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
                Tailored Resume Bullets (XYZ Formula)
              </h3>
            </div>
            <p className={`text-xs mb-4 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Copy and adapt these metric-driven bullets directly into your resume:
            </p>

            <div className="space-y-3">
              {result.applicationBooster?.tailoredBullets?.map((bullet, idx) => (
                <div key={idx} className={`border rounded-xl p-3 text-xs relative group ${
                  isDark ? 'bg-slate-950 border-slate-800 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-700'
                }`}>
                  <p className="pr-8 leading-relaxed font-sans">{bullet}</p>
                  <button
                    onClick={() => handleCopy(bullet, 'bullet', idx)}
                    className={`absolute top-2.5 right-2.5 p-1.5 rounded-md border transition ${
                      isDark 
                        ? 'bg-slate-900 hover:bg-slate-800 border-slate-700 text-slate-400 hover:text-white' 
                        : 'bg-white hover:bg-slate-100 border-slate-300 text-slate-600 hover:text-slate-900 shadow-sm'
                    }`}
                    title="Copy bullet"
                  >
                    {copiedBulletIdx === idx ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Cold Outreach DM */}
        <div className={`border rounded-2xl p-6 shadow-lg flex flex-col justify-between transition-colors ${
          isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200'
        }`}>
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-pink-500" />
                <h3 className={`text-sm font-bold uppercase tracking-wider ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
                  Recruiter / Founder Cold Outreach
                </h3>
              </div>
              <button
                onClick={() => handleCopy(result.applicationBooster?.coldPitchMessage, 'coldPitch')}
                className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-md bg-purple-600 hover:bg-purple-500 text-white font-medium transition shadow-sm"
              >
                {copiedColdPitch ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedColdPitch ? 'Copied DM!' : 'Copy Pitch'}
              </button>
            </div>
            <p className={`text-xs mb-4 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Send this 4-sentence DM directly to founders or hiring leads on LinkedIn:
            </p>

            <div className={`border rounded-xl p-4 text-xs font-mono whitespace-pre-wrap leading-relaxed ${
              isDark ? 'bg-slate-950 border-slate-800 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-700'
            }`}>
              {result.applicationBooster?.coldPitchMessage}
            </div>
          </div>

          <div className={`mt-4 pt-3 border-t text-[11px] ${isDark ? 'border-slate-800 text-slate-500' : 'border-slate-100 text-slate-400'}`}>
            💡 Pro-tip: Insert your GitHub or demo link in the bracketed area before hitting send.
          </div>
        </div>

      </div>

      {/* 7. BEEP APPLICATION ACTION CARD */}
      <div className={`border rounded-3xl p-6 sm:p-8 text-center space-y-4 shadow-xl transition-all ${
        isDark 
          ? 'bg-gradient-to-r from-purple-950/40 via-indigo-950/30 to-slate-900 border-purple-500/30' 
          : 'bg-gradient-to-r from-purple-50 via-indigo-50 to-white border-purple-200'
      }`}>
        <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-purple-600/10 text-purple-600 border border-purple-500/20">
          Ready to Make Your Move?
        </span>
        <h3 className={`text-lg sm:text-2xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
          Apply for {result.targetRole} at {result.company}
        </h3>
        <p className={`text-xs sm:text-sm max-w-xl mx-auto leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
          Submit your application through the Beep Fast-Track Queue with your verified readiness profile and tailored Google XYZ bullets attached.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <button
            onClick={onApplyClick}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-extrabold shadow-xl shadow-purple-600/30 transition transform hover:-translate-y-0.5"
          >
            <Send className="w-4 h-4" />
            Apply Now via Beep
          </button>
          <button
            onClick={onNewAudit}
            className={`inline-flex items-center gap-2 px-5 py-3 rounded-2xl border text-xs font-bold transition ${
              isDark 
                ? 'bg-slate-900 hover:bg-slate-800 border-slate-700 text-slate-300 hover:text-white' 
                : 'bg-white hover:bg-slate-50 border-slate-300 text-slate-700 hover:text-slate-900 shadow-sm'
            }`}
          >
            Audit Another Internship
          </button>
        </div>
      </div>

    </div>
  );
}
