import React, { useState } from 'react';
import { 
  CheckCircle, AlertCircle, HelpCircle, Calendar, 
  Copy, Check, Share2, Flame, Layers, 
  Terminal, Sparkles, UserCheck, ShieldAlert, Cpu, 
  Send, ShieldCheck, AlertTriangle, Link2, BarChart3,
  MessageSquare, ChevronDown, ChevronUp, Code2, FileText, CheckCircle2,
  ArrowRight, Quote, Info, Zap, Target
} from 'lucide-react';

export default function ResultsView({ result, onNewAudit, onApplyClick, onTakeQuiz, theme }) {
  const [copiedBulletIdx, setCopiedBulletIdx] = useState(null);
  const [copiedXyzIdx, setCopiedXyzIdx] = useState(null);
  const [copiedColdPitch, setCopiedColdPitch] = useState(false);
  const [copiedReadme, setCopiedReadme] = useState(false);
  const [copyStatus, setCopyStatus] = useState({ ok: null, message: '' });
  const [activeKeywordFilter, setActiveKeywordFilter] = useState('all');
  const [expandedQuestionIdx, setExpandedQuestionIdx] = useState(0);

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
    } else if (type === 'xyz') {
      setCopiedXyzIdx(index);
      setTimeout(() => setCopiedXyzIdx(null), 2000);
    } else if (type === 'coldPitch') {
      setCopiedColdPitch(true);
      setTimeout(() => setCopiedColdPitch(false), 2000);
    } else if (type === 'readme') {
      setCopiedReadme(true);
      setTimeout(() => setCopiedReadme(false), 2000);
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

  // Filtered heatmap items
  const allHeatmap = result.atsHeatmap || [];
  const filteredHeatmap = allHeatmap.filter(item => {
    if (activeKeywordFilter === 'all') return true;
    return item.status === activeKeywordFilter;
  });

  const detailedStats = result.detailedStats || {
    coreSkillMatchPercent: result.matchScore || result.overallReadinessScore || 0,
    estimatedReadinessIndicator: result.matchScore || result.overallReadinessScore || 0,
    metricMatches: result.resumeStats?.metricMatches ?? (result.resumeStats?.hasMetrics ? 1 : 0),
    actionVerbCount: result.resumeStats?.actionVerbCount ?? 0,
    filterChecklist: [
      { name: 'Core Tech Stack Match', status: (result.overallReadinessScore || result.matchScore) >= 70 ? 'pass' : ((result.overallReadinessScore || result.matchScore) >= 40 ? 'warning' : 'fail'), value: `${result.overallReadinessScore || result.matchScore || 0}%`, detail: 'Evaluated competency coverage' },
      { name: 'Project Links in Resume', status: result.resumeStats?.hasLiveLinks ? 'pass' : 'fail', value: result.resumeStats?.hasLiveLinks ? 'Detected' : 'Not Found', detail: result.resumeStats?.hasLiveLinks ? 'Links detected' : 'No project URLs found' },
      { name: 'Quantified Metrics', status: (result.resumeStats?.metricMatches || 0) > 0 ? 'pass' : 'warning', value: `${result.resumeStats?.metricMatches || 0} metrics`, detail: 'Quantified achievement numbers' },
      { name: 'Document Word Count', status: 'pass', value: `${result.resumeStats?.wordCount || 0} words`, detail: 'Extracted resume text density' }
    ]
  };

  const finalScore = result.overallReadinessScore ?? result.matchScore ?? 0;
  const readinessLabel = result.readinessBand?.label || result.readinessLevel || 'Evaluated';

  return (
    <div id="results-section" className="max-w-6xl mx-auto px-4 sm:px-6 pb-20 space-y-6 pt-4 animate-fadeIn">
      
      {/* 1. TRANSPARENCY BANNER: CLEAR ENGINE INDICATOR */}
      <div className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md transition-colors ${
        result.isAIGenerated
          ? (isDark ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200' : 'bg-emerald-50 border-emerald-300 text-emerald-900')
          : (isDark ? 'bg-amber-950/40 border-amber-500/40 text-amber-200' : 'bg-amber-50 border-amber-300 text-amber-900')
      }`}>
        <div className="flex items-start sm:items-center gap-3">
          <div className={`p-2.5 rounded-xl mt-0.5 sm:mt-0 ${
            result.isAIGenerated 
              ? (isDark ? 'bg-emerald-500/20 text-emerald-300' : 'bg-emerald-200 text-emerald-800')
              : (isDark ? 'bg-amber-500/20 text-amber-300' : 'bg-amber-200 text-amber-800')
          }`}>
            {result.isAIGenerated ? <Cpu className="w-5 h-5" /> : <Sparkles className="w-5 h-5" />}
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-extrabold text-sm flex items-center gap-1.5">
                {result.isAIGenerated ? (
                  <>🟢 Real Gemini LLM Semantic Analysis</>
                ) : (
                  <>🟡 Fallback Analysis (Dynamic Heuristic Engine)</>
                )}
              </span>
              <span className={`text-[11px] font-mono px-2 py-0.5 rounded-full border ${
                isDark ? 'bg-slate-900/80 border-slate-700/60 text-slate-300' : 'bg-white border-slate-300 text-slate-700'
              }`}>
                {result.model ? `Model: ${result.model}` : `Engine: ${result.engine || 'Dynamic Heuristic'}`}
              </span>
              {result.validationTier && (
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                  result.validationTier.includes('LLM') 
                    ? (isDark ? 'bg-emerald-950 border-emerald-500/40 text-emerald-300' : 'bg-emerald-100 border-emerald-300 text-emerald-800')
                    : (isDark ? 'bg-slate-800 border-slate-700 text-slate-300' : 'bg-slate-100 border-slate-300 text-slate-700')
                }`}>
                  ✓ {result.validationTier} {result.groundedExcerptRatio ? `(${Math.round(result.groundedExcerptRatio * 100)}% Grounded)` : ''}
                </span>
              )}
            </div>
            <p className={`text-xs mt-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              Calculated specifically for <strong>{result.targetRole}</strong> against your uploaded resume.
              {!result.isAIGenerated && result.fallbackReason && (
                <span className="block text-[11px] opacity-90 mt-0.5 italic">
                  Note: {result.fallbackReason}
                </span>
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {onTakeQuiz && (
            <button
              onClick={onTakeQuiz}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold border transition cursor-pointer ${
                isDark 
                  ? 'bg-purple-950/60 hover:bg-purple-900/60 border-purple-500/40 text-purple-200' 
                  : 'bg-purple-50 hover:bg-purple-100 border-purple-300 text-purple-900 shadow-sm'
              }`}
            >
              <Zap className="w-3.5 h-3.5 text-amber-500" />
              Take Gap Quiz
            </button>
          )}

          <button
            onClick={onApplyClick}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-500 text-white shadow-md shadow-purple-600/30 transition cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
            Apply via Beep
          </button>

          <button
            onClick={() => handleCopy(window.location.href, 'url')}
            title="Copies current page URL"
            className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition ${
              isDark 
                ? 'bg-slate-900 hover:bg-slate-800 border-slate-700 text-slate-200' 
                : 'bg-white hover:bg-slate-100 border-slate-300 text-slate-700 shadow-sm'
            }`}
          >
            {copyStatus.ok === true ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Link2 className="w-3.5 h-3.5" />}
            <span>Share</span>
            <Share2 className="w-3 h-3 opacity-60" />
          </button>
        </div>
      </div>

      {/* 2. MANDATORY PREREQUISITE BLOCKER ALERT (IF ACTIVE) */}
      {result.mandatoryBlocker?.hasBlocker && (
        <div className={`p-4 rounded-2xl border-2 flex items-start gap-3.5 shadow-md ${
          isDark 
            ? 'bg-rose-950/30 border-rose-500/50 text-rose-200' 
            : 'bg-rose-50 border-rose-300 text-rose-950'
        }`}>
          <ShieldAlert className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-sm uppercase tracking-wide">
                Mandatory Prerequisite Blocker Detected
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-600 text-white font-bold">
                Score Capped at {result.mandatoryBlocker.cappedAt || 65}%
              </span>
            </div>
            <p className="text-xs font-medium leading-relaxed">
              {result.mandatoryBlocker.reason || 'This role requires a mandatory foundational qualification or prerequisite skill not demonstrated in the resume.'}
            </p>
          </div>
        </div>
      )}

      {/* 3. MATCH SCORE & READINESS DASHBOARD */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        
        {/* Score Card */}
        <div className={`border-2 rounded-2xl p-6 flex flex-col justify-between shadow-md transition-colors ${
          isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-300'
        }`}>
          <div>
            <div className="flex items-center justify-between">
              <span className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-700'}`}>
                Overall Readiness Score
              </span>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${isDark ? 'bg-slate-800 border-slate-700 text-slate-300' : 'bg-slate-100 border-slate-300 text-slate-800 font-bold'}`}>
                {result.resumeStats?.wordCount || 120} words
              </span>
            </div>

            <div className="flex items-baseline gap-3 mt-2">
              <span className={`text-6xl font-black tracking-tight ${getScoreColor(finalScore).split(' ')[0]}`}>
                {finalScore}%
              </span>
              <span className={`text-xs font-bold ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                readiness for this role
              </span>
            </div>
            
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span className={`inline-block text-xs font-bold px-3 py-1 rounded-full border ${getScoreColor(finalScore)}`}>
                {readinessLabel}
              </span>
              {result.overallConfidence && (
                <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${
                  result.overallConfidence === 'High'
                    ? (isDark ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300' : 'bg-emerald-50 border-emerald-300 text-emerald-800')
                    : (isDark ? 'bg-slate-800 border-slate-700 text-slate-300' : 'bg-slate-100 border-slate-300 text-slate-700')
                }`}>
                  {result.overallConfidence} Confidence
                </span>
              )}
            </div>

            {result.confidenceExplanation && (
              <p className={`text-[11px] mt-2 italic font-medium leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                "{result.confidenceExplanation}"
              </p>
            )}
          </div>

          {/* Quick Score Breakdown */}
          <div className={`mt-6 pt-4 border-t space-y-2 text-xs ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
            <div className={`flex justify-between ${isDark ? 'text-slate-400' : 'text-slate-700'}`}>
              <span className="font-medium">Must-Have Skills Coverage:</span>
              <span className={`font-bold ${isDark ? 'text-slate-200' : 'text-slate-900'}`}>
                {result.dimensionScores?.requiredCompetencies ? `${result.dimensionScores.requiredCompetencies.score}%` : (result.scoreBreakdown?.mustHaveCoverage || '65%')}
              </span>
            </div>
            <div className={`flex justify-between ${isDark ? 'text-slate-400' : 'text-slate-700'}`}>
              <span className="font-medium">Evidence & Project Depth:</span>
              <span className="font-bold text-indigo-600 dark:text-indigo-400">
                {result.dimensionScores?.depthOfEvidence ? `${result.dimensionScores.depthOfEvidence.score}%` : (result.scoreBreakdown?.transferableBonus || '+15%')}
              </span>
            </div>
            <div className={`flex justify-between ${isDark ? 'text-slate-400' : 'text-slate-700'}`}>
              <span className="font-medium">Semantic Fit Rating:</span>
              <span className="font-bold text-purple-600 dark:text-purple-400">
                {result.semanticJobFitScore ? `${result.semanticJobFitScore}%` : (result.scoreBreakdown?.riskFactor || 'Medium')}
              </span>
            </div>
          </div>
        </div>

        {/* Recruiter Insight Card */}
        <div className={`lg:col-span-2 border-2 rounded-2xl p-6 flex flex-col justify-between shadow-md transition-colors ${
          isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-300'
        }`}>
          <div>
            <div className="flex items-center gap-2 mb-3">
              <UserCheck className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              <h3 className={`text-sm font-bold uppercase tracking-wider ${isDark ? 'text-slate-100' : 'text-slate-950'}`}>
                Recruiter Reality Check ({result.company || 'Hiring Team'})
              </h3>
            </div>
            <div className={`border-2 rounded-xl p-4 text-sm leading-relaxed italic font-medium ${
              isDark 
                ? 'bg-slate-950 border-slate-800 text-slate-300' 
                : 'bg-slate-50 border-slate-300 text-slate-900 shadow-xs'
            }`}>
              "{result.recruiterInsight || result.readinessBand?.summary || 'Candidate displays solid foundational potential. Focus on filling practical evidence gaps before submitting.'}"
            </div>
          </div>

          {/* Proof of Work Highlight */}
          <div className={`mt-5 pt-4 border-t flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl border-2 ${
            isDark 
              ? 'border-slate-800 bg-purple-950/20 border-purple-900/30' 
              : 'border-purple-300 bg-purple-50/70 shadow-xs'
          }`}>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700 dark:text-purple-400 flex items-center gap-1">
                <Flame className="w-3.5 h-3.5 text-amber-500" />
                The Recommended 48-Hour Fix
              </span>
              <h4 className={`text-xs font-black mt-0.5 ${isDark ? 'text-slate-100' : 'text-slate-950'}`}>
                {result.proofOfWorkProject?.title || result.suggestedPortfolioProjects?.[0]?.title || 'Mini-Proof Web App'}
              </h4>
              <p className={`text-[11px] font-medium mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-700'}`}>
                {result.proofOfWorkProject?.deliverable || result.suggestedPortfolioProjects?.[0]?.deliverable}
              </p>
            </div>
            <span className="shrink-0 text-xs font-bold px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white shadow-sm">
              {result.proofOfWorkProject?.estimatedHours || result.suggestedPortfolioProjects?.[0]?.estimatedHours || '6-8 hrs'}
            </span>
          </div>
        </div>

      </div>

      {/* 4. TRANSPARENT THRESHOLD-BASED SCORING BREAKDOWN */}
      {result.dimensionScores && (
        <div className={`border-2 rounded-2xl p-6 shadow-md transition-colors ${
          isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-300'
        }`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              <h3 className={`text-sm font-bold uppercase tracking-wider ${isDark ? 'text-slate-100' : 'text-slate-950'}`}>
                Weighted Threshold Scoring Policy
              </h3>
            </div>
            <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
              isDark ? 'bg-purple-950/40 border-purple-500/30 text-purple-300' : 'bg-purple-50 border-purple-300 text-purple-800'
            }`}>
              Transparent 5-Dimension Evaluation
            </span>
          </div>

          <p className={`text-xs mb-4 font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            Rather than naive keyword matching, readiness is computed through a weighted multi-factor evaluation policy:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
            {[
              { key: 'requiredCompetencies', label: 'Required Competencies', weight: '35%', dim: result.dimensionScores.requiredCompetencies },
              { key: 'depthOfEvidence', label: 'Evidence Depth', weight: '25%', dim: result.dimensionScores.depthOfEvidence },
              { key: 'relevantExperience', label: 'Relevant Experience', weight: '15%', dim: result.dimensionScores.relevantExperience },
              { key: 'preferredCompetencies', label: 'Preferred Competencies', weight: '15%', dim: result.dimensionScores.preferredCompetencies },
              { key: 'transferableSkills', label: 'Transferable Skills', weight: '10%', dim: result.dimensionScores.transferableSkills }
            ].map((col, idx) => {
              const dimData = col.dim || { score: 70, weightedContribution: 10, justification: 'Evaluated' };
              return (
                <div 
                  key={idx}
                  className={`p-3.5 rounded-xl border-2 flex flex-col justify-between ${
                    isDark ? 'bg-slate-950/80 border-slate-800' : 'bg-slate-50 border-slate-300 shadow-xs'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span className={`text-[10px] font-bold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-700'}`}>
                        {col.label}
                      </span>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-purple-600/10 text-purple-600 dark:text-purple-300 font-bold border border-purple-500/20">
                        {col.weight}
                      </span>
                    </div>

                    <div className="flex items-baseline gap-1.5 mt-2">
                      <span className="text-2xl font-black text-purple-600 dark:text-purple-400">
                        {dimData.score}%
                      </span>
                      <span className={`text-[10px] font-mono ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                        (+{dimData.weightedContribution ?? Math.round(dimData.score * parseFloat(col.weight) / 100)} pts)
                      </span>
                    </div>

                    <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden mt-2">
                      <div 
                        className="bg-purple-600 h-full rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(100, Math.max(0, dimData.score))}%` }}
                      />
                    </div>
                  </div>

                  <p className={`text-[11px] mt-2.5 pt-2 border-t font-medium line-clamp-3 leading-snug ${
                    isDark ? 'border-slate-800 text-slate-300' : 'border-slate-200 text-slate-700'
                  }`}>
                    {dimData.justification || 'Score based on verified claims and coursework.'}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 5. EVIDENCE-BACKED STRENGTHS (GROUNDED IN RESUME + JD) */}
      {result.evidenceBackedStrengths && result.evidenceBackedStrengths.length > 0 && (
        <div className={`border-2 rounded-2xl p-6 shadow-md transition-colors ${
          isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-300'
        }`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <h3 className={`text-sm font-bold uppercase tracking-wider ${isDark ? 'text-slate-100' : 'text-slate-950'}`}>
                Evidence-Backed Candidate Strengths
              </h3>
            </div>
            <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
              isDark ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300' : 'bg-emerald-50 border-emerald-300 text-emerald-800'
            }`}>
              Verified Against Source Excerpts
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {result.evidenceBackedStrengths.map((str, sIdx) => (
              <div 
                key={sIdx}
                className={`p-4 rounded-xl border-2 flex flex-col justify-between ${
                  isDark ? 'bg-slate-950/80 border-slate-800' : 'bg-slate-50 border-slate-300 shadow-xs'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <h4 className={`text-xs sm:text-sm font-bold ${isDark ? 'text-slate-100' : 'text-slate-950'}`}>
                      {str.skillOrCompetency || str.competency}
                    </h4>
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase ${
                      (str.depthRating || str.depthLevel) === 'Advanced' || (str.depthRating || str.depthLevel) === 'Project Implementation'
                        ? 'bg-emerald-600 text-white'
                        : (str.depthRating || str.depthLevel) === 'Proficient'
                          ? 'bg-indigo-600 text-white'
                          : 'bg-purple-600 text-white'
                    }`}>
                      {str.depthRating || str.depthLevel || 'Proficient'}
                    </span>
                  </div>

                  {/* Grounded Resume Excerpt */}
                  {(str.resumeExcerpt || str.evidenceExcerptFromResume) && (
                    <div className={`p-2.5 rounded-lg border text-xs italic font-medium mb-2.5 flex items-start gap-2 ${
                      isDark ? 'bg-slate-900 border-slate-800 text-emerald-300/90' : 'bg-white border-slate-200 text-emerald-900'
                    }`}>
                      <Quote className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                      <span>"{str.resumeExcerpt || str.evidenceExcerptFromResume}"</span>
                    </div>
                  )}

                  {/* Analysis */}
                  <p className={`text-xs leading-relaxed font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    {str.analysis || str.reasoning}
                  </p>
                </div>

                {(str.jobRequirementExcerpt || str.jdExcerpt || str.matchingRequirementFromJd) && (
                  <div className={`mt-3 pt-2.5 border-t text-[11px] font-mono flex items-center gap-1.5 ${
                    isDark ? 'border-slate-800 text-slate-400' : 'border-slate-200 text-slate-600'
                  }`}>
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span className="truncate">Matches: "{str.jobRequirementExcerpt || str.jdExcerpt || str.matchingRequirementFromJd}"</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 6. CRITICAL SKILL GAPS & REMEDIATION */}
      {result.criticalSkillGaps && result.criticalSkillGaps.length > 0 && (
        <div className={`border-2 rounded-2xl p-6 shadow-md transition-colors ${
          isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-300'
        }`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-500" />
              <h3 className={`text-sm font-bold uppercase tracking-wider ${isDark ? 'text-slate-100' : 'text-slate-950'}`}>
                Critical Skill Gaps & Remediation
              </h3>
            </div>
            <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
              isDark ? 'bg-rose-950/40 border-rose-500/30 text-rose-300' : 'bg-rose-50 border-rose-300 text-rose-800'
            }`}>
              Targeted Interview Hazards
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {result.criticalSkillGaps.map((gap, gIdx) => {
              const isMandatory = gap.isMandatoryRequirement || gap.isMandatoryBlocker;
              const severity = gap.severity || (isMandatory ? 'Critical' : 'Important');
              return (
                <div 
                  key={gIdx}
                  className={`p-4 rounded-xl border-2 flex flex-col justify-between ${
                    severity === 'Critical'
                      ? (isDark ? 'bg-rose-950/20 border-rose-900/40' : 'bg-rose-50 border-rose-200')
                      : (isDark ? 'bg-amber-950/20 border-amber-900/40' : 'bg-amber-50 border-amber-200')
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <h4 className={`text-xs sm:text-sm font-bold ${isDark ? 'text-slate-100' : 'text-slate-950'}`}>
                        {gap.skillOrCompetency || gap.missingCompetency}
                      </h4>
                      <div className="flex items-center gap-1.5">
                        {isMandatory && (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-600 text-white uppercase">
                            Mandatory
                          </span>
                        )}
                        <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase ${
                          severity === 'Critical'
                            ? 'bg-rose-600/20 border border-rose-500/40 text-rose-400'
                            : 'bg-amber-600/20 border border-amber-500/40 text-amber-400'
                        }`}>
                          {severity}
                        </span>
                      </div>
                    </div>

                    {(gap.jobRequirementExcerpt || gap.jdRequirementExcerpt) && (
                      <div className={`p-2.5 rounded-lg border text-xs italic font-medium mb-2.5 flex items-start gap-2 ${
                        isDark ? 'bg-slate-900 border-slate-800 text-rose-300/90' : 'bg-white border-slate-200 text-rose-900'
                      }`}>
                        <Info className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                        <span>JD Requirement: "{gap.jobRequirementExcerpt || gap.jdRequirementExcerpt}"</span>
                      </div>
                    )}

                    <p className={`text-xs leading-relaxed font-medium ${isDark ? 'text-slate-300' : 'text-slate-800'}`}>
                      <strong className="block text-[11px] uppercase tracking-wider text-purple-600 dark:text-purple-400 mb-0.5">
                        Actionable Remediation:
                      </strong>
                      {gap.remediationAdvice || gap.recommendation || gap.impactOnRole}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 7. CLAIMS NEEDING STRONGER EVIDENCE (GOOGLE XYZ FORMULA) */}
      {result.claimsNeedingEvidence && result.claimsNeedingEvidence.length > 0 && (
        <div className={`border-2 rounded-2xl p-6 shadow-md transition-colors ${
          isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-300'
        }`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-amber-500" />
              <h3 className={`text-sm font-bold uppercase tracking-wider ${isDark ? 'text-slate-100' : 'text-slate-950'}`}>
                Resume Claims Needing Stronger Evidence (Google XYZ Rewrite)
              </h3>
            </div>
            <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
              isDark ? 'bg-amber-950/40 border-amber-500/30 text-amber-300' : 'bg-amber-50 border-amber-300 text-amber-800'
            }`}>
              Accomplished [X] as measured by [Y], by doing [Z]
            </span>
          </div>

          <p className={`text-xs mb-4 font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            Recruiters often skip vague claims. Upgrade these resume excerpts using concrete metrics and outcomes:
          </p>

          <div className="space-y-3.5">
            {result.claimsNeedingEvidence.map((item, cIdx) => (
              <div 
                key={cIdx}
                className={`p-4 rounded-xl border-2 space-y-2.5 ${
                  isDark ? 'bg-slate-950/80 border-slate-800' : 'bg-slate-50 border-slate-300 shadow-xs'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <span className={`text-xs font-bold ${isDark ? 'text-amber-400' : 'text-amber-700'}`}>
                    Claim: "{item.claim || item.title || item.excerpt || item.currentResumeExcerpt}"
                  </span>
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                    isDark ? 'bg-slate-900 border-slate-700 text-slate-300' : 'bg-white border-slate-300 text-slate-700'
                  }`}>
                    Concern: {item.concern}
                  </span>
                </div>

                {(item.suggestedXyzRewrite || item.suggestion) && (
                  <div className={`p-3 rounded-lg border-2 flex items-start justify-between gap-3 ${
                    isDark ? 'bg-purple-950/20 border-purple-900/30 text-purple-200' : 'bg-purple-50/70 border-purple-200 text-purple-950'
                  }`}>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700 dark:text-purple-400 block mb-1">
                        Recommended XYZ Rewrite:
                      </span>
                      <p className="text-xs font-medium leading-relaxed font-mono">
                        "{item.suggestedXyzRewrite || item.suggestion}"
                      </p>
                    </div>
                    <button
                      onClick={() => handleCopy(item.suggestedXyzRewrite || item.suggestion, 'xyz', cIdx)}
                      className="shrink-0 p-1.5 rounded-md border text-xs font-bold transition hover:bg-purple-600 hover:text-white"
                      title="Copy rewrite"
                    >
                      {copiedXyzIdx === cIdx ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 8. ADJACENT & TRANSFERABLE SKILLS */}
      {result.adjacentTransferableSkills && result.adjacentTransferableSkills.length > 0 && (
        <div className={`border-2 rounded-2xl p-6 shadow-md transition-colors ${
          isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-300'
        }`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-blue-500" />
              <h3 className={`text-sm font-bold uppercase tracking-wider ${isDark ? 'text-slate-100' : 'text-slate-950'}`}>
                Adjacent & Transferable Skills Bridge
              </h3>
            </div>
            <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
              isDark ? 'bg-blue-950/40 border-blue-500/30 text-blue-300' : 'bg-blue-50 border-blue-300 text-blue-800'
            }`}>
              Candidate Background Synergy
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {result.adjacentTransferableSkills.map((adj, aIdx) => (
              <div 
                key={aIdx}
                className={`p-4 rounded-xl border-2 flex flex-col justify-between ${
                  isDark ? 'bg-slate-950/80 border-slate-800' : 'bg-slate-50 border-slate-300 shadow-xs'
                }`}
              >
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-blue-600 text-white">
                      {adj.candidateSkill || adj.skill}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-purple-600 text-white">
                      {adj.targetRequirement || adj.targetSkill || adj.matchingRequirement}
                    </span>
                  </div>
                  <p className={`text-xs leading-relaxed font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    {adj.transferabilityAnalysis || adj.reasoning}
                  </p>
                </div>

                {(adj.readinessBridge || adj.bridgeTip || adj.learningBridge) && (
                  <div className={`mt-3 pt-2 border-t text-[11px] font-medium ${
                    isDark ? 'border-slate-800 text-purple-300' : 'border-slate-200 text-purple-800'
                  }`}>
                    💡 <strong>Bridge Tip:</strong> {adj.readinessBridge || adj.bridgeTip || adj.learningBridge}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 9. ATS & RECRUITER SCREENING HUB */}
      <div className={`border-2 rounded-2xl p-6 shadow-md transition-colors ${
        isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-300'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            <h3 className={`text-sm font-bold uppercase tracking-wider ${isDark ? 'text-slate-100' : 'text-slate-950'}`}>
              ATS & Recruiter Screening Statistics
            </h3>
          </div>
          <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
            isDark ? 'bg-purple-950/40 border-purple-500/30 text-purple-300' : 'bg-purple-50 border-purple-300 text-purple-800'
          }`}>
            Evidence-Based Resume Audit
          </span>
        </div>

        {/* 4 Metric Counter Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 mb-5">
          <div className={`p-4 rounded-xl border-2 ${
            isDark ? 'bg-slate-950/80 border-slate-800' : 'bg-slate-50 border-slate-300 shadow-xs'
          }`}>
            <span className={`text-[10px] font-bold uppercase tracking-wider block ${isDark ? 'text-slate-400' : 'text-slate-700'}`}>
              Resume Readiness Indicator
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-black text-purple-600 dark:text-purple-400">
                {finalScore}%
              </span>
              <span className="text-[10px] text-purple-600 dark:text-purple-400 font-bold">
                {result.isAIGenerated ? 'LLM' : 'Heuristic'}
              </span>
            </div>
            <p className={`text-[10px] font-medium mt-1 line-clamp-1 ${isDark ? 'text-slate-400' : 'text-slate-700'}`}>
              Overall calculated readiness
            </p>
          </div>

          <div className={`p-4 rounded-xl border-2 ${
            isDark ? 'bg-slate-950/80 border-slate-800' : 'bg-slate-50 border-slate-300 shadow-xs'
          }`}>
            <span className={`text-[10px] font-bold uppercase tracking-wider block ${isDark ? 'text-slate-400' : 'text-slate-700'}`}>
              Core Tech Coverage
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400">
                {result.dimensionScores?.requiredCompetencies?.score ?? detailedStats.coreSkillMatchPercent}%
              </span>
              <span className={`text-[10px] font-medium ${isDark ? 'text-slate-400' : 'text-slate-700'}`}>
                of required stack
              </span>
            </div>
            <p className={`text-[10px] font-medium mt-1 line-clamp-1 ${isDark ? 'text-slate-400' : 'text-slate-700'}`}>
              Grounded competency matches
            </p>
          </div>

          <div className={`p-4 rounded-xl border-2 ${
            isDark ? 'bg-slate-950/80 border-slate-800' : 'bg-slate-50 border-slate-300 shadow-xs'
          }`}>
            <span className={`text-[10px] font-bold uppercase tracking-wider block ${isDark ? 'text-slate-400' : 'text-slate-700'}`}>
              Quantifiable Metrics
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                {detailedStats.metricMatches}
              </span>
              <span className={`text-[10px] font-medium ${isDark ? 'text-slate-400' : 'text-slate-700'}`}>
                detected
              </span>
            </div>
            <p className={`text-[10px] font-medium mt-1 line-clamp-1 ${isDark ? 'text-slate-400' : 'text-slate-700'}`}>
              Numeric achievement metrics
            </p>
          </div>

          <div className={`p-4 rounded-xl border-2 ${
            isDark ? 'bg-slate-950/80 border-slate-800' : 'bg-slate-50 border-slate-300 shadow-xs'
          }`}>
            <span className={`text-[10px] font-bold uppercase tracking-wider block ${isDark ? 'text-slate-400' : 'text-slate-700'}`}>
              Distinct Action Verbs
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-black text-amber-500">
                {detailedStats.actionVerbCount}
              </span>
              <span className={`text-[10px] font-medium ${isDark ? 'text-slate-400' : 'text-slate-700'}`}>
                unique verbs
              </span>
            </div>
            <p className={`text-[10px] font-medium mt-1 line-clamp-1 ${isDark ? 'text-slate-400' : 'text-slate-700'}`}>
              Action-oriented verbs
            </p>
          </div>
        </div>

        {/* 6-Second Recruiter Filter Checklist */}
        <div className="space-y-2">
          <span className={`text-xs font-bold uppercase tracking-wider block mb-2 ${isDark ? 'text-slate-300' : 'text-slate-800'}`}>
            6-Second Recruiter Filter Checklist
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {detailedStats.filterChecklist?.map((item, idx) => (
              <div 
                key={idx}
                className={`p-3 rounded-xl border-2 flex items-center justify-between text-xs ${
                  item.status === 'pass'
                    ? (isDark ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-200' : 'bg-emerald-50 border-emerald-300 text-emerald-950 font-medium')
                    : item.status === 'warning'
                      ? (isDark ? 'bg-amber-950/20 border-amber-500/30 text-amber-200' : 'bg-amber-50 border-amber-300 text-amber-950 font-medium')
                      : (isDark ? 'bg-rose-950/20 border-rose-500/30 text-rose-200' : 'bg-rose-50 border-rose-300 text-rose-950 font-medium')
                }`}
              >
                <div className="flex items-center gap-2">
                  {item.status === 'pass' && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />}
                  {item.status === 'warning' && <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />}
                  {item.status === 'fail' && <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />}
                  <div>
                    <span className="font-bold block leading-tight">{item.name}</span>
                    <span className="text-[10px] opacity-80">{item.detail}</span>
                  </div>
                </div>
                <span className="font-mono font-bold text-xs shrink-0 pl-2">
                  {item.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 10. SILENT REJECTION RADAR */}
      {result.silentRejectionFlags && result.silentRejectionFlags.length > 0 && (
        <div className={`border-2 rounded-2xl p-6 shadow-md transition-colors ${
          isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-300'
        }`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-500" />
              <h3 className={`text-sm font-bold uppercase tracking-wider ${isDark ? 'text-slate-100' : 'text-slate-950'}`}>
                The Silent Rejection Radar (Recruiter Filter Simulator)
              </h3>
            </div>
            <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
              isDark ? 'bg-amber-500/10 border-amber-500/30 text-amber-400' : 'bg-amber-50 border-amber-300 text-amber-800'
            }`}>
              Hidden ATS & Recruiter Checks
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
            {result.silentRejectionFlags.map((flag, fIdx) => (
              <div
                key={fIdx}
                className={`p-3.5 rounded-xl border-2 flex flex-col justify-between ${
                  flag.type === 'critical'
                    ? (isDark ? 'bg-rose-950/30 border-rose-900/50 text-rose-300' : 'bg-rose-50 border-rose-300 text-rose-950')
                    : flag.type === 'warning'
                      ? (isDark ? 'bg-amber-950/30 border-amber-900/50 text-amber-300' : 'bg-amber-50 border-amber-300 text-amber-950')
                      : (isDark ? 'bg-emerald-950/30 border-emerald-900/50 text-emerald-300' : 'bg-emerald-50 border-emerald-300 text-emerald-950')
                }`}
              >
                <div>
                  <div className="flex items-center gap-1.5 mb-1.5">
                    {flag.type === 'critical' && <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />}
                    {flag.type === 'warning' && <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />}
                    {flag.type === 'pass' && <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />}
                    <h4 className="text-xs font-bold leading-tight">{flag.title}</h4>
                  </div>
                  <p className="text-[11px] leading-relaxed font-medium opacity-90">{flag.description}</p>
                </div>

                <div className="mt-2.5 pt-2 border-t border-current/15 text-[10px] font-mono font-bold uppercase tracking-wider">
                  {flag.type === 'critical' && '⚠️ High Screening Risk (Critical Gap)'}
                  {flag.type === 'warning' && '⚡ Fix Recommended Before Applying'}
                  {flag.type === 'pass' && '✅ Recruiter Check Passed'}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 11. ATS KEYWORD MATRIX / CLOUD */}
      {allHeatmap.length > 0 && (
        <div className={`border-2 rounded-2xl p-6 shadow-md transition-colors ${
          isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-300'
        }`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-500" />
              <h3 className={`text-sm font-bold uppercase tracking-wider ${isDark ? 'text-slate-100' : 'text-slate-950'}`}>
                ATS Keyword Density & Gap Matrix
              </h3>
            </div>

            <div className="flex flex-wrap items-center gap-1.5 text-xs">
              <button
                onClick={() => setActiveKeywordFilter('all')}
                className={`px-2.5 py-1 rounded-lg font-bold transition cursor-pointer ${
                  activeKeywordFilter === 'all'
                    ? 'bg-purple-600 text-white shadow-sm'
                    : (isDark ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-slate-100 border border-slate-300 text-slate-800 hover:bg-slate-200')
                }`}
              >
                All ({allHeatmap.length})
              </button>
              <button
                onClick={() => setActiveKeywordFilter('matched')}
                className={`px-2.5 py-1 rounded-lg font-bold transition cursor-pointer ${
                  activeKeywordFilter === 'matched'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : (isDark ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-slate-100 border border-slate-300 text-slate-800 hover:bg-slate-200')
                }`}
              >
                Matched ({allHeatmap.filter(i => i.status === 'matched').length})
              </button>
              <button
                onClick={() => setActiveKeywordFilter('transferable')}
                className={`px-2.5 py-1 rounded-lg font-bold transition cursor-pointer ${
                  activeKeywordFilter === 'transferable'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : (isDark ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-slate-100 border border-slate-300 text-slate-800 hover:bg-slate-200')
                }`}
              >
                Transferable ({allHeatmap.filter(i => i.status === 'transferable').length})
              </button>
              <button
                onClick={() => setActiveKeywordFilter('missing')}
                className={`px-2.5 py-1 rounded-lg font-bold transition cursor-pointer ${
                  activeKeywordFilter === 'missing'
                    ? 'bg-rose-600 text-white shadow-sm'
                    : (isDark ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-slate-100 border border-slate-300 text-slate-800 hover:bg-slate-200')
                }`}
              >
                Critical Gaps ({allHeatmap.filter(i => i.status === 'missing').length})
              </button>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 pt-1">
            {filteredHeatmap.length > 0 ? (
              filteredHeatmap.map((chip, idx) => (
                <div
                  key={idx}
                  className={`px-3 py-2 rounded-xl border-2 flex items-center gap-2 text-xs font-semibold transition ${
                    chip.status === 'matched'
                      ? (isDark ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200' : 'bg-emerald-50 border-emerald-300 text-emerald-950 shadow-xs')
                      : chip.status === 'transferable'
                        ? (isDark ? 'bg-blue-950/40 border-blue-500/40 text-blue-200' : 'bg-blue-50 border-blue-300 text-blue-950 shadow-xs')
                        : (isDark ? 'bg-rose-950/40 border-rose-500/40 text-rose-200' : 'bg-rose-50 border-rose-300 text-rose-950 shadow-xs')
                  }`}
                >
                  {chip.status === 'matched' && <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />}
                  {chip.status === 'transferable' && <HelpCircle className="w-3.5 h-3.5 text-blue-600 shrink-0" />}
                  {chip.status === 'missing' && <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />}
                  <div>
                    <span className="font-bold">{chip.keyword}</span>
                    <span className="opacity-80 text-[10px] ml-1.5 font-mono">({chip.label})</span>
                  </div>
                </div>
              ))
            ) : (
              <p className={`text-xs py-4 font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                No keywords in this category.
              </p>
            )}
          </div>
        </div>
      )}

      {/* 12. AI RECRUITER INTERVIEW PREDICTOR */}
      {result.interviewQuestions && result.interviewQuestions.length > 0 && (
        <div className={`border-2 rounded-2xl p-6 shadow-md transition-colors ${
          isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-300'
        }`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              <h3 className={`text-sm font-bold uppercase tracking-wider ${isDark ? 'text-slate-100' : 'text-slate-950'}`}>
                AI Recruiter Interview Predictor (Gap-Based Q&A)
              </h3>
            </div>
            <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
              isDark ? 'bg-purple-950/40 border-purple-500/30 text-purple-300' : 'bg-purple-50 border-purple-300 text-purple-800'
            }`}>
              Anticipate Tough Technical Screening Questions
            </span>
          </div>

          <p className={`text-xs mb-4 font-medium ${isDark ? 'text-slate-400' : 'text-slate-700'}`}>
            Based on the semantic gap between your resume and {result.company || 'the job'}'s requirements:
          </p>

          <div className="space-y-3">
            {result.interviewQuestions.map((q, idx) => {
              const isExpanded = expandedQuestionIdx === idx;
              return (
                <div 
                  key={idx}
                  className={`border-2 rounded-xl p-4 transition-all ${
                    isDark 
                      ? 'bg-slate-950/80 border-slate-800 hover:border-slate-700' 
                      : 'bg-slate-50 border-slate-300 hover:border-purple-300 shadow-xs'
                  }`}
                >
                  <div 
                    onClick={() => setExpandedQuestionIdx(isExpanded ? null : idx)}
                    className="flex items-start justify-between gap-3 cursor-pointer select-none"
                  >
                    <div>
                      <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded bg-purple-600/10 text-purple-700 dark:text-purple-300 border border-purple-500/30">
                        {q.topic}
                      </span>
                      <h4 className={`text-xs sm:text-sm font-bold mt-1.5 ${isDark ? 'text-slate-100' : 'text-slate-950'}`}>
                        "{q.question}"
                      </h4>
                    </div>
                    <button className="p-1 text-slate-500 dark:text-slate-400">
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>

                  {isExpanded && (
                    <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-800 space-y-2 text-xs animate-fadeIn">
                      <div className={`p-2.5 rounded-lg border-2 ${
                        isDark ? 'bg-purple-950/20 border-purple-900/30 text-purple-200' : 'bg-purple-50 border-purple-200 text-purple-950'
                      }`}>
                        <span className="font-bold block text-[11px]">🧠 Why Recruiters Ask This:</span>
                        <p className="text-[11px] mt-0.5 font-medium">{q.recruiterIntent}</p>
                      </div>

                      <div className={`p-3 rounded-lg border-2 ${
                        isDark ? 'bg-slate-900 border-slate-800 text-slate-300' : 'bg-white border-slate-300 text-slate-800 shadow-xs'
                      }`}>
                        <span className="font-bold block text-[11px] text-emerald-600 dark:text-emerald-400">
                          🎯 Smart Anchor Answer:
                        </span>
                        <p className="text-xs mt-1 leading-relaxed italic font-medium">{q.recommendedAnswer}</p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 13. 48-HOUR PROOF-OF-WORK PROJECT BLUEPRINT */}
      {result.proofOfWorkProject && (
        <div className={`border-2 rounded-2xl p-6 shadow-md transition-colors ${
          isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-300'
        }`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
            <div className="flex items-center gap-2">
              <Code2 className="w-4 h-4 text-emerald-500" />
              <h3 className={`text-sm font-bold uppercase tracking-wider ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
                48-Hour Proof-of-Work Project Blueprint
              </h3>
            </div>
            <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-purple-600 text-white">
              {result.proofOfWorkProject.estimatedHours || '6-8 hrs'}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className={`p-4 rounded-xl border-2 flex flex-col justify-between ${
              isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-300 shadow-xs'
            }`}>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400 block mb-1">
                  Deliverable Spec
                </span>
                <h4 className="text-sm font-extrabold mb-1">{result.proofOfWorkProject.title}</h4>
                <p className={`text-xs leading-relaxed font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  {result.proofOfWorkProject.deliverable}
                </p>

                <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                  <span className="text-[10px] font-bold uppercase tracking-wider block mb-1">
                    System Architecture:
                  </span>
                  <p className={`text-xs font-medium ${isDark ? 'text-slate-400' : 'text-slate-700'}`}>
                    {result.proofOfWorkProject.architectureOverview || 'Frontend client with modular component architecture, automated tests, and live Vercel/Render deployment.'}
                  </p>
                </div>
              </div>
            </div>

            <div className={`p-4 rounded-xl border-2 flex flex-col justify-between ${
              isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-300 shadow-xs'
            }`}>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 ${isDark ? 'text-slate-400' : 'text-slate-700'}`}>
                    <FileText className="w-3.5 h-3.5" />
                    GitHub README.md Boilerplate
                  </span>
                  <button
                    onClick={() => handleCopy(result.proofOfWorkProject.readmeTemplate, 'readme')}
                    className="inline-flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-lg border-2 border-purple-500/40 text-purple-700 dark:text-purple-400 hover:bg-purple-500/10 font-bold transition cursor-pointer"
                  >
                    {copiedReadme ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedReadme ? 'Copied README!' : 'Copy README'}</span>
                  </button>
                </div>

                <div className={`p-3 rounded-lg font-mono text-[11px] max-h-36 overflow-y-auto whitespace-pre-wrap border-2 ${
                  isDark ? 'bg-slate-900 border-slate-800 text-slate-300' : 'bg-white border-slate-300 text-slate-900 shadow-xs'
                }`}>
                  {result.proofOfWorkProject.readmeTemplate || '# Proof of Work Demo\n\nBuild and deploy to Vercel/Render.'}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 14. 7-DAY DAY-BY-DAY PREPARATION PLAN */}
      {result.sevenDayPlan && result.sevenDayPlan.length > 0 && (
        <div className={`border-2 rounded-2xl p-6 shadow-md transition-colors ${
          isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-300'
        }`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              <h3 className={`text-sm font-bold uppercase tracking-wider ${isDark ? 'text-slate-100' : 'text-slate-950'}`}>
                7-Day Sprint: Zero to Interview-Ready
              </h3>
            </div>
            <span className={`text-xs font-semibold ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              Designed for student schedules
            </span>
          </div>

          <div className="space-y-3">
            {result.sevenDayPlan.map((planItem, idx) => (
              <div key={idx} className={`border-2 rounded-xl p-4 transition ${
                isDark 
                  ? 'bg-slate-950 border-slate-800 hover:border-slate-700' 
                  : 'bg-slate-50 border-slate-300 hover:border-purple-300 shadow-xs'
              }`}>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-purple-600 text-white">
                    {planItem.day}
                  </span>
                  <span className={`text-xs font-bold ${isDark ? 'text-slate-200' : 'text-slate-900'}`}>
                    {planItem.phase}
                  </span>
                </div>
                <ul className="space-y-1.5 mt-2">
                  {planItem.tasks.map((task, tIdx) => (
                    <li key={tIdx} className={`text-xs flex items-start gap-2 font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                      <span className="text-purple-600 dark:text-purple-400 font-bold">•</span>
                      <span>{task}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 15. APPLICATION BOOSTER: RESUME BULLETS & COLD OUTREACH */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className={`border-2 rounded-2xl p-6 shadow-md flex flex-col justify-between transition-colors ${
          isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-300'
        }`}>
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Terminal className="w-4 h-4 text-emerald-500" />
              <h3 className={`text-sm font-bold uppercase tracking-wider ${isDark ? 'text-slate-100' : 'text-slate-950'}`}>
                Tailored Resume Bullets (Google XYZ Formula)
              </h3>
            </div>
            <p className={`text-xs mb-4 font-medium ${isDark ? 'text-slate-400' : 'text-slate-700'}`}>
              Copy and adapt these metric-driven bullets directly into your resume:
            </p>

            <div className="space-y-3">
              {result.applicationBooster?.tailoredBullets?.map((bullet, idx) => (
                <div key={idx} className={`border-2 rounded-xl p-3 text-xs relative group ${
                  isDark ? 'bg-slate-950 border-slate-800 text-slate-300' : 'bg-slate-50 border-slate-300 text-slate-800 shadow-xs'
                }`}>
                  <p className="pr-8 leading-relaxed font-sans font-medium">{bullet}</p>
                  <button
                    onClick={() => handleCopy(bullet, 'bullet', idx)}
                    className={`absolute top-2.5 right-2.5 p-1.5 rounded-md border-2 transition ${
                      isDark 
                        ? 'bg-slate-900 hover:bg-slate-800 border-slate-700 text-slate-400 hover:text-white' 
                        : 'bg-white hover:bg-slate-100 border-slate-300 text-slate-700 hover:text-slate-950 shadow-xs'
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

        <div className={`border-2 rounded-2xl p-6 shadow-md flex flex-col justify-between transition-colors ${
          isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-300'
        }`}>
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-pink-500" />
                <h3 className={`text-sm font-bold uppercase tracking-wider ${isDark ? 'text-slate-100' : 'text-slate-950'}`}>
                  Recruiter / Founder Cold Outreach
                </h3>
              </div>
              <button
                onClick={() => handleCopy(result.applicationBooster?.coldPitchMessage, 'coldPitch')}
                className="inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold transition shadow-sm cursor-pointer"
              >
                {copiedColdPitch ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedColdPitch ? 'Copied DM!' : 'Copy Pitch'}</span>
              </button>
            </div>
            <p className={`text-xs mb-4 font-medium ${isDark ? 'text-slate-400' : 'text-slate-700'}`}>
              Send this 4-sentence DM directly to founders or hiring leads on LinkedIn:
            </p>

            <div className={`border-2 rounded-xl p-4 text-xs font-mono whitespace-pre-wrap leading-relaxed ${
              isDark ? 'bg-slate-950 border-slate-800 text-slate-300' : 'bg-slate-50 border-slate-300 text-slate-800 shadow-xs'
            }`}>
              {result.applicationBooster?.coldPitchMessage}
            </div>
          </div>

          <div className={`mt-4 pt-3 border-t text-[11px] font-medium ${isDark ? 'border-slate-800 text-slate-400' : 'border-slate-200 text-slate-600'}`}>
            💡 Pro-tip: Insert your GitHub or demo link in the bracketed area before hitting send.
          </div>
        </div>
      </div>

      {/* 16. WHAT CANDIDATE SHOULD DO NEXT & CALL TO ACTION */}
      <div className={`border-2 rounded-3xl p-6 sm:p-8 text-center space-y-4 shadow-xl transition-all ${
        isDark 
          ? 'bg-gradient-to-r from-purple-950/40 via-indigo-950/30 to-slate-900 border-purple-500/30' 
          : 'bg-gradient-to-r from-purple-50 via-indigo-50 to-white border-purple-300'
      }`}>
        <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-purple-600/10 text-purple-600 border border-purple-500/20">
          Candidate Action Plan
        </span>
        <h3 className={`text-lg sm:text-2xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
          {result.whatCandidateShouldDoNext ? 'Recommended Next Move' : `Apply for ${result.targetRole} at ${result.company || 'Partner Team'}`}
        </h3>
        <p className={`text-xs sm:text-sm max-w-2xl mx-auto leading-relaxed font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
          {result.whatCandidateShouldDoNext || 'Submit your verified readiness profile and tailored Google XYZ bullets directly to the Beep candidate fast-track pipeline.'}
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-3">
          {onTakeQuiz && (
            <button
              onClick={onTakeQuiz}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-extrabold shadow-lg shadow-amber-500/20 transition cursor-pointer"
            >
              <Zap className="w-4 h-4" />
              Take Adaptive Tech Quiz
            </button>
          )}
          <button
            onClick={onApplyClick}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-extrabold shadow-xl shadow-purple-600/30 transition transform hover:-translate-y-0.5 cursor-pointer"
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
