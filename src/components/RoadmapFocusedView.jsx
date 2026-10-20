import React, { useState } from 'react';
import { 
  Terminal, Copy, Check, Calendar, 
  Sparkles 
} from 'lucide-react';

export default function RoadmapFocusedView({ 
  result, 
  selectedInternship, 
  onNavigate, 
  theme 
}) {
  const isDark = theme === 'dark';
  const [copiedReadme, setCopiedReadme] = useState(false);
  const [copiedBulletIdx, setCopiedBulletIdx] = useState(null);

  // Fallback blueprint if candidate hasn't audited yet
  const activeRole = result?.targetRole || selectedInternship?.title || 'Fullstack Engineering Intern';
  const blueprint = result?.proofOfWorkProject || {
    title: `Production ${activeRole} Proof-of-Work App`,
    problemStatement: `Engineered an end-to-end fullstack platform addressing high-concurrency client requests with responsive UI and sub-100ms response times.`,
    architectureSpec: `React (Vite) + Node.js (Express) + SQLite/PostgreSQL with JWT authentication, indexed relational schema, and rate-limiting middleware.`,
    deliverables: [
      'Interactive client dashboard with responsive navigation and state caching',
      'Authenticated REST API endpoints protected with rate limiting and security headers',
      'Database integration with parameterized queries and indexed lookups',
      'Live deployment with CI/CD pipeline on Vercel and Render'
    ],
    timeline: [
      { phase: 'Hours 0-12', milestone: 'Repository setup, schema design, and basic route scaffolding' },
      { phase: 'Hours 12-24', milestone: 'Core business logic, data models, and API endpoints' },
      { phase: 'Hours 24-36', milestone: 'Frontend state integration, UI polish, and error states' },
      { phase: 'Hours 36-48', milestone: 'Test execution, deployment to Vercel/Render, and README documentation' }
    ],
    googleXyzBullets: [
      `Architected full-lifecycle web platform for ${activeRole}, reducing API latency by 35% through query indexing and response caching.`,
      `Engineered authenticated role-based access control protecting 5 sensitive routes with zero reported unauthorized data leaks.`,
      `Implemented CI/CD automated test suite achieving 100% pass rate across core security and data isolation flows.`
    ],
    readmeTemplate: `# ${activeRole} - Weekend Proof-of-Work Project
> Built for the EventBeep Internship Fast-Track Evaluation

## 🚀 Live Demo & Links
- **Live Deployment:** https://my-project.vercel.app
- **API Health:** https://api.my-project.com/health

## 🛠️ Tech Stack & Architecture
- **Frontend:** React 19, Tailwind CSS, Vite
- **Backend:** Node.js, Express 5, JWT, Helmet
- **Database:** SQLite / PostgreSQL (WAL mode, parameterized queries)

## 🎯 Quantified Engineering Highlights (Google XYZ)
- Built responsive client dashboard supporting sub-100ms client state transitions.
- Enforced strict relational constraints and token-based authentication.
`
  };

  const sprintPlan = result?.sprintPlan || [
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
      
      {/* Header Banner */}
      <div className={`p-6 rounded-3xl border ${
        isDark ? 'bg-slate-900/70 border-slate-800' : 'bg-white border-slate-200'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                isDark ? 'bg-purple-950/60 border-purple-500/40 text-purple-300' : 'bg-purple-50 border-purple-200 text-purple-700'
              }`}>
                48-Hour Weekend Blueprint
              </span>
              <span className="text-xs text-slate-400">
                Tailored for {activeRole}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight mt-1">
              Proof-of-Work Project & 7-Day Sprint Roadmap
            </h2>
            <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Overcome the proof-of-work barrier with an architectural blueprint, Google XYZ resume bullets, and a copyable README.
            </p>
          </div>

          {!result && (
            <button
              onClick={() => onNavigate('resume')}
              className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md transition cursor-pointer flex items-center gap-2 shrink-0"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Personalize with My Resume</span>
            </button>
          )}
        </div>
      </div>

      {/* Blueprint Core Spec */}
      <div className={`p-6 rounded-3xl border space-y-5 ${
        isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200'
      }`}>
        <div className="flex items-center gap-2 pb-2 border-b border-inherit/40">
          <Terminal className="w-4 h-4 text-purple-500" />
          <h3 className="text-sm font-extrabold tracking-tight">
            Architectural Specification: {blueprint.title}
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className={`p-4 rounded-2xl border ${
            isDark ? 'bg-slate-950/50 border-slate-800' : 'bg-slate-50 border-slate-200'
          }`}>
            <span className="font-bold text-slate-400 uppercase text-[10px] tracking-wider block mb-1">
              Problem Statement
            </span>
            <p className="leading-relaxed opacity-90">
              {blueprint.problemStatement}
            </p>
          </div>

          <div className={`p-4 rounded-2xl border ${
            isDark ? 'bg-slate-950/50 border-slate-800' : 'bg-slate-50 border-slate-200'
          }`}>
            <span className="font-bold text-slate-400 uppercase text-[10px] tracking-wider block mb-1">
              Architecture & Stack
            </span>
            <p className="leading-relaxed opacity-90 font-mono text-[11px]">
              {blueprint.architectureSpec}
            </p>
          </div>
        </div>

        {/* 48-Hour Weekend Phases */}
        <div>
          <span className="font-bold text-slate-400 uppercase text-[10px] tracking-wider block mb-2">
            Weekend Execution Timeline
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
            {blueprint.timeline.map((phase, idx) => (
              <div 
                key={idx}
                className={`p-3.5 rounded-2xl border text-xs ${
                  isDark ? 'bg-slate-950/40 border-slate-800' : 'bg-slate-50 border-slate-200'
                }`}
              >
                <span className="text-[10px] font-mono font-bold text-purple-500 uppercase block mb-1">
                  {phase.phase}
                </span>
                <p className="leading-snug opacity-90 text-[11px]">
                  {phase.milestone}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Google XYZ Bullets */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="font-bold text-slate-400 uppercase text-[10px] tracking-wider">
              Google XYZ Resume Bullet Formulas
            </span>
            <span className="text-[10px] text-purple-500 font-semibold">Click bullet to copy</span>
          </div>

          <div className="space-y-2">
            {blueprint.googleXyzBullets.map((bullet, idx) => (
              <div
                key={idx}
                onClick={() => handleCopyBullet(bullet, idx)}
                className={`p-3 rounded-2xl border flex items-center justify-between text-xs transition cursor-pointer ${
                  copiedBulletIdx === idx
                    ? (isDark ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300' : 'bg-emerald-50 border-emerald-300 text-emerald-900')
                    : (isDark ? 'bg-slate-950/40 border-slate-800 hover:border-slate-700' : 'bg-slate-50 border-slate-200 hover:border-slate-300')
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

        {/* Copyable README Template */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="font-bold text-slate-400 uppercase text-[10px] tracking-wider">
              Copyable GitHub README.md Template
            </span>
            <button
              onClick={handleCopyReadme}
              className={`px-3 py-1 rounded-xl text-xs font-bold border transition cursor-pointer flex items-center gap-1.5 ${
                copiedReadme 
                  ? 'bg-emerald-500 text-white border-emerald-500' 
                  : (isDark ? 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-200' : 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-800')
              }`}
            >
              {copiedReadme ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedReadme ? 'Copied README' : 'Copy README.md'}</span>
            </button>
          </div>

          <pre className={`p-4 rounded-2xl border text-[11px] font-mono overflow-x-auto max-h-48 leading-relaxed ${
            isDark ? 'bg-slate-950 border-slate-800 text-slate-300' : 'bg-slate-900 border-slate-800 text-slate-200'
          }`}>
            {blueprint.readmeTemplate}
          </pre>
        </div>

      </div>

      {/* 7-Day Sprint Plan */}
      <div className={`p-6 rounded-3xl border space-y-4 ${
        isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200'
      }`}>
        <div className="flex items-center gap-2 pb-2 border-b border-inherit/40">
          <Calendar className="w-4 h-4 text-purple-500" />
          <h3 className="text-sm font-extrabold tracking-tight">
            7-Day Preparation Sprint: From Keyword Gap to Applied
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {sprintPlan.map((step, idx) => (
            <div
              key={idx}
              className={`p-3.5 rounded-2xl border text-xs flex flex-col justify-between ${
                isDark ? 'bg-slate-950/40 border-slate-800' : 'bg-slate-50 border-slate-200'
              }`}
            >
              <div>
                <span className="text-[10px] font-mono font-bold text-purple-500 uppercase block mb-1">
                  {step.day} • {step.focus}
                </span>
                <p className="leading-snug opacity-90 text-[11px]">
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
