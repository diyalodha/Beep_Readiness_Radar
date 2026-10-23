import React, { useState, useMemo } from 'react';
import { 
  Terminal, Copy, Check, Calendar, 
  Sparkles 
} from 'lucide-react';
import { runDynamicHeuristicAnalysis } from '../utils/heuristicCore';

export default function RoadmapFocusedView({ 
  result, 
  selectedInternship, 
  resumeText = '',
  fileName = '',
  isCustomJob = false,
  customRoleTitle = '',
  customJd = '',
  onNavigate, 
  theme 
}) {
  const isDark = theme === 'dark';
  const [copiedReadme, setCopiedReadme] = useState(false);
  const [copiedBulletIdx, setCopiedBulletIdx] = useState(null);

  // Derive target role, company, and JD criteria
  const activeRole = result?.targetRole 
    || (isCustomJob ? (customRoleTitle || 'Software Engineer') : (selectedInternship?.title || selectedInternship?.role || 'Software Engineering Intern'));
  const targetCompany = result?.companyName 
    || (isCustomJob ? 'Target Partner' : (selectedInternship?.company || 'Target Company'));
  const targetJd = isCustomJob 
    ? customJd 
    : (selectedInternship?.description || (selectedInternship?.requirements ? selectedInternship.requirements.join(' ') : ''));

  // If full analysis result is not present yet, but candidate resume is uploaded, compute dynamic personalization on the fly
  const dynamicAnalysis = useMemo(() => {
    if (result) return result;
    if (resumeText && resumeText.trim().length >= 20) {
      try {
        return runDynamicHeuristicAnalysis(resumeText, targetJd || '', activeRole, targetCompany);
      } catch (err) {
        console.warn('Failed to compute dynamic roadmap from uploaded resume:', err);
      }
    }
    return null;
  }, [result, resumeText, targetJd, activeRole, targetCompany]);

  const activeData = dynamicAnalysis || result;
  const isPersonalized = Boolean(activeData && (resumeText || result));
  const rawBlueprint = activeData?.proofOfWorkProject;

  // Normalized Proof-of-Work Project Blueprint
  const blueprint = {
    title: rawBlueprint?.title || `Production ${activeRole} Proof-of-Work App`,
    problemStatement: rawBlueprint?.problemStatement 
      || rawBlueprint?.deliverable 
      || `Engineered an end-to-end platform addressing technical gaps for ${activeRole} with responsive UI and sub-100ms response times.`,
    architectureSpec: rawBlueprint?.architectureSpec 
      || rawBlueprint?.architectureOverview 
      || `React (Vite) + Node.js (Express) + SQLite/PostgreSQL with JWT authentication, indexed relational schema, and rate-limiting middleware.`,
    deliverables: rawBlueprint?.deliverables || [
      'Interactive client dashboard with responsive navigation and state caching',
      'Authenticated REST API endpoints protected with rate limiting and security headers',
      'Database integration with parameterized queries and indexed lookups',
      'Live deployment with CI/CD pipeline on Vercel and Render'
    ],
    timeline: rawBlueprint?.timeline || [
      { phase: 'Hours 0-12', milestone: 'Repository setup, schema design, and basic route scaffolding' },
      { phase: 'Hours 12-24', milestone: 'Core business logic, data models, and API endpoints' },
      { phase: 'Hours 24-36', milestone: 'Frontend state integration, UI polish, and error states' },
      { phase: 'Hours 36-48', milestone: 'Test execution, deployment to Vercel/Render, and README documentation' }
    ],
    googleXyzBullets: (Array.isArray(rawBlueprint?.googleXyzBullets) && rawBlueprint.googleXyzBullets.length > 0)
      ? rawBlueprint.googleXyzBullets
      : ((Array.isArray(activeData?.applicationBooster?.tailoredBullets) && activeData.applicationBooster.tailoredBullets.length > 0)
          ? activeData.applicationBooster.tailoredBullets
          : [
              `Architected full-lifecycle web platform for ${activeRole}, reducing API latency by 35% through query indexing and response caching.`,
              `Engineered authenticated role-based access control protecting 5 sensitive routes with zero reported unauthorized data leaks.`,
              `Implemented CI/CD automated test suite achieving 100% pass rate across core security and data isolation flows.`
            ]),
    readmeTemplate: rawBlueprint?.readmeTemplate || `# ${activeRole} - Weekend Proof-of-Work Project\n> Built for the EventBeep Internship Fast-Track Evaluation\n\n## 🚀 Live Demo & Links\n- **Live Deployment:** https://my-project.vercel.app\n- **API Health:** https://api.my-project.com/health\n\n## 🛠️ Tech Stack & Architecture\n- **Frontend:** React 19, Tailwind CSS, Vite\n- **Backend:** Node.js, Express 5, JWT, Helmet\n- **Database:** SQLite / PostgreSQL (WAL mode, parameterized queries)\n\n## 🎯 Quantified Engineering Highlights (Google XYZ)\n- Built responsive client dashboard supporting sub-100ms client state transitions.\n- Enforced strict relational constraints and token-based authentication.\n`
  };

  // Normalized 7-Day Sprint Plan
  const rawPlan = activeData?.sevenDayPlan || activeData?.sprintPlan;
  const sprintPlan = Array.isArray(rawPlan) && rawPlan.length > 0
    ? rawPlan.map((step, idx) => {
        const dayLabel = step.day || `Day ${idx + 1}`;
        const focusLabel = step.phase || step.focus || `Sprint Milestone ${idx + 1}`;
        const taskText = Array.isArray(step.tasks) 
          ? step.tasks.join(' ') 
          : (step.task || step.description || '');
        return {
          day: dayLabel,
          focus: focusLabel,
          task: taskText
        };
      })
    : [
        { day: 'Day 1', focus: 'Target JD Analysis & Skill Gaps', task: 'Analyze target tech stack requirements and configure project scaffolding.' },
        { day: 'Day 2', focus: 'Data Schema & Backend Scaffolding', task: 'Establish relational database tables and secure authenticated endpoints.' },
        { day: 'Day 3', focus: 'Core Feature Engineering', task: 'Develop primary domain workflows and test with synthetic mock data.' },
        { day: 'Day 4', focus: 'Frontend Integration & UI Polish', task: 'Connect React client to backend with loading skeletons and validation.' },
        { day: 'Day 5', focus: 'Testing & Security Hardening', task: 'Run unit test suite, verify CSP headers, and validate token sessions.' },
        { day: 'Day 6', focus: 'Live Deployment & Verification', task: 'Deploy frontend to Vercel and backend to Render; verify health endpoint.' },
        { day: 'Day 7', focus: 'Portfolio Polish & Outreach', task: 'Update resume with Google XYZ bullets and initiate recruiter outreach.' }
      ];

  const handleCopyReadme = async () => {
    try {
      await navigator.clipboard.writeText(blueprint.readmeTemplate);
      setCopiedReadme(true);
      setTimeout(() => setCopiedReadme(false), 2000);
    } catch (e) {
      console.warn('Clipboard failed:', e);
    }
  };

  const handleCopyBullet = async (text, idx) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedBulletIdx(idx);
      setTimeout(() => setCopiedBulletIdx(null), 2000);
    } catch (e) {
      console.warn('Clipboard failed:', e);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fadeIn pb-12">
      
      {/* 1. HEADER BANNER */}
      <div className={`p-6 sm:p-8 rounded-3xl border shadow-md transition-colors ${
        isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200'
      }`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                isDark ? 'bg-purple-950/60 border-purple-500/40 text-purple-300' : 'bg-purple-50 border-purple-200 text-purple-700'
              }`}>
                48-Hour Weekend Blueprint
              </span>
              <span className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full border ${
                isDark ? 'bg-slate-800 border-slate-700 text-slate-300' : 'bg-slate-100 border-slate-300 text-slate-700'
              }`}>
                Target: {activeRole}
              </span>
            </div>
            
            <h2 className={`text-xl sm:text-2xl font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Proof-of-Work Project & 7-Day Sprint Roadmap
            </h2>
            <p className={`text-xs max-w-2xl font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              Overcome the proof-of-work barrier with an architectural blueprint, Google XYZ resume bullets, and a copyable README configured to bridge your detected skill gaps.
            </p>
          </div>

          {!resumeText && onNavigate && (
            <button
              onClick={() => onNavigate('resume')}
              className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md transition cursor-pointer flex items-center gap-2 shrink-0 self-start md:self-auto"
            >
              <Sparkles className="w-4 h-4" />
              <span>Attach Resume to Personalize</span>
            </button>
          )}
        </div>

        {/* 100% Resume-Personalized Status Indicator */}
        {isPersonalized ? (
          <div className={`mt-5 p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs ${
            isDark ? 'bg-emerald-950/25 border-emerald-500/40 text-emerald-200' : 'bg-emerald-50 border-emerald-300 text-emerald-900 shadow-2xs'
          }`}>
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
              <div>
                <span className="font-extrabold mr-1">100% Resume-Personalized Blueprint:</span>
                <span className="font-medium">
                  Tailored to {fileName || 'your uploaded resume'} projects and missing skill gaps for {activeRole}.
                </span>
              </div>
            </div>
            <span className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full border shrink-0 self-start sm:self-auto ${
              isDark ? 'bg-slate-900 border-emerald-500/30 text-emerald-300' : 'bg-white border-emerald-300 text-emerald-800'
            }`}>
              {activeData?.engine || 'Resume Skill Diagnostics'}
            </span>
          </div>
        ) : (
          <div className={`mt-5 p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs ${
            isDark ? 'bg-purple-950/20 border-purple-800/40 text-slate-300' : 'bg-purple-50/60 border-purple-200 text-slate-700'
          }`}>
            <div className="flex items-start sm:items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-500 shrink-0 mt-0.5 sm:mt-0" />
              <span>
                <strong>Generic Role Baseline:</strong> Showing standard weekend blueprints for {activeRole}. Upload your resume in the Resume Parser or JD Matcher to personalize this project to your exact profile.
              </span>
            </div>
            {onNavigate && (
              <button
                type="button"
                onClick={() => onNavigate('resume')}
                className="text-[11px] font-bold px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white shrink-0 shadow-xs transition cursor-pointer self-start sm:self-auto"
              >
                Upload Resume in Parser
              </button>
            )}
          </div>
        )}
      </div>

      {/* 2. BLUEPRINT ARCHITECTURAL SPECIFICATION */}
      <div className={`p-6 sm:p-8 rounded-3xl border-2 space-y-6 shadow-sm transition-colors ${
        isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200'
      }`}>
        <div className="flex items-center gap-2.5 pb-3 border-b border-inherit/40">
          <Terminal className="w-5 h-5 text-purple-500" />
          <div>
            <h3 className={`text-base font-extrabold tracking-tight ${isDark ? 'text-white' : 'text-slate-950'}`}>
              Recommended Proof-of-Work Project: {blueprint.title}
            </h3>
            <p className={`text-xs mt-0.5 font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              Build this focused weekend micro-application to substantiate missing technical competencies on your resume.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className={`p-4 rounded-2xl border-2 space-y-1.5 ${
            isDark ? 'bg-slate-950/70 border-slate-800 text-slate-200' : 'bg-slate-50 border-slate-200 text-slate-800'
          }`}>
            <span className="font-bold text-purple-600 dark:text-purple-400 uppercase text-[10px] tracking-wider block">
              Problem Statement & Deliverable
            </span>
            <p className="leading-relaxed font-medium">
              {blueprint.problemStatement}
            </p>
          </div>

          <div className={`p-4 rounded-2xl border-2 space-y-1.5 ${
            isDark ? 'bg-slate-950/70 border-slate-800 text-slate-200' : 'bg-slate-50 border-slate-200 text-slate-800'
          }`}>
            <span className="font-bold text-purple-600 dark:text-purple-400 uppercase text-[10px] tracking-wider block">
              Architecture & Recommended Stack
            </span>
            <p className="leading-relaxed font-mono text-[11px]">
              {blueprint.architectureSpec}
            </p>
          </div>
        </div>

        {/* 48-Hour Weekend Execution Timeline */}
        <div className="space-y-3">
          <span className="font-bold text-slate-400 uppercase text-[10px] tracking-wider block">
            48-Hour Weekend Execution Timeline
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {blueprint.timeline.map((phase, idx) => (
              <div 
                key={idx}
                className={`p-4 rounded-2xl border-2 text-xs flex flex-col justify-between ${
                  isDark ? 'bg-slate-950/50 border-slate-800' : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div>
                  <span className="text-[10px] font-mono font-extrabold text-purple-500 uppercase block mb-1">
                    {phase.phase}
                  </span>
                  <p className={`leading-relaxed font-medium text-[11px] ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    {phase.milestone}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Google XYZ Resume Bullets (Ready to copy) */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <span className="font-bold text-slate-400 uppercase text-[10px] tracking-wider block">
                Google XYZ Resume Bullet Formulas
              </span>
              <span className={`text-[11px] font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                Accomplished [X] as measured by [Y] by doing [Z] — replace bracketed metrics with measured results.
              </span>
            </div>
            <span className="text-[10px] text-purple-500 font-bold shrink-0">Click to copy</span>
          </div>

          <div className="space-y-2">
            {blueprint.googleXyzBullets.map((bullet, idx) => (
              <div
                key={idx}
                onClick={() => handleCopyBullet(bullet, idx)}
                className={`p-3.5 rounded-2xl border-2 flex items-center justify-between text-xs transition cursor-pointer select-none ${
                  copiedBulletIdx === idx
                    ? (isDark ? 'bg-emerald-950/30 border-emerald-500/50 text-emerald-300' : 'bg-emerald-50 border-emerald-400 text-emerald-950')
                    : (isDark ? 'bg-slate-950/60 border-slate-800 hover:border-purple-500/50 text-slate-300' : 'bg-slate-50 border-slate-200 hover:border-purple-300 text-slate-800')
                }`}
              >
                <div className="flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-1.5 shrink-0" />
                  <p className="leading-relaxed font-medium">{bullet}</p>
                </div>
                {copiedBulletIdx === idx ? (
                  <Check className="w-4 h-4 text-emerald-500 shrink-0 ml-2" />
                ) : (
                  <Copy className="w-4 h-4 text-slate-400 shrink-0 ml-2 opacity-60" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Copyable GitHub README.md Template */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-bold text-slate-400 uppercase text-[10px] tracking-wider">
              Copyable GitHub README.md Template
            </span>
            <button
              onClick={handleCopyReadme}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition cursor-pointer flex items-center gap-1.5 ${
                copiedReadme 
                  ? 'bg-emerald-500 text-white border-emerald-500 shadow-sm' 
                  : (isDark ? 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-200' : 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-800 shadow-2xs')
              }`}
            >
              {copiedReadme ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedReadme ? 'Copied README' : 'Copy README.md'}</span>
            </button>
          </div>

          <pre className={`p-4 rounded-2xl border-2 text-[11px] font-mono overflow-x-auto max-h-52 leading-relaxed ${
            isDark ? 'bg-slate-950 border-slate-800 text-slate-300' : 'bg-slate-900 border-slate-800 text-slate-200'
          }`}>
            {blueprint.readmeTemplate}
          </pre>
        </div>

      </div>

      {/* 3. 7-DAY PREPARATION SPRINT PLAN */}
      <div className={`p-6 sm:p-8 rounded-3xl border-2 space-y-5 shadow-sm transition-colors ${
        isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200'
      }`}>
        <div className="flex items-center gap-2.5 pb-3 border-b border-inherit/40">
          <Calendar className="w-5 h-5 text-purple-500" />
          <div>
            <h3 className={`text-base font-extrabold tracking-tight ${isDark ? 'text-white' : 'text-slate-950'}`}>
              7-Day Preparation Sprint: From Resume Gap to Submitted Application
            </h3>
            <p className={`text-xs mt-0.5 font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              Structured day-by-day progression to master missing skills, build proof, and submit a competitive application.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {sprintPlan.map((step, idx) => (
            <div
              key={idx}
              className={`p-4 rounded-2xl border-2 text-xs flex flex-col justify-between transition-all ${
                isDark ? 'bg-slate-950/50 border-slate-800 hover:border-slate-700' : 'bg-slate-50 border-slate-200 hover:border-slate-300'
              }`}
            >
              <div>
                <span className="text-[10px] font-mono font-extrabold text-purple-500 uppercase block mb-1">
                  {step.day} • {step.focus}
                </span>
                <p className={`leading-relaxed font-medium text-[11px] ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  {step.task}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
