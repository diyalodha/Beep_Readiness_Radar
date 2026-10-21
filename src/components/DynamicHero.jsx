import React from 'react';
import { Target, Zap, Clock, FileText, HelpCircle, Briefcase, BarChart3, Sparkles } from 'lucide-react';

const HERO_CONFIGS = {
  matcher: {
    badge: "EventBeep Founder's Office • Role Alignment Radar",
    line1: "Stop getting ghosted by internships.",
    line2: "Know your real match & 48-hour fix.",
    subtitle: "Job descriptions are full of overwhelming buzzwords. Select any target internship or paste a custom JD to diagnose your true technical alignment using boundary-aware token matching.",
    gradient: "from-purple-600 via-pink-500 to-indigo-600",
    features: [
      { icon: Target, title: "Boundary-Aware Match", desc: "No false collisions (Java != JavaScript, C != CSS)." },
      { icon: Zap, title: "48-Hour Proof Project", desc: "Concrete weekend blueprint for critical missing skills." },
      { icon: Clock, title: "7-Day Sprint Plan", desc: "Structured daily tasks from gap analysis to outreach." }
    ]
  },
  resume: {
    badge: "EventBeep Founder's Office • Secure Document Ingestion",
    line1: "Client-side resume ingestion & parsing.",
    line2: "Extract skills, metrics & project links.",
    subtitle: "Attach your PDF or DOCX resume to extract tech keywords, quantifiable Google XYZ metrics, and GitHub portfolio links in-browser with zero server-side storage.",
    gradient: "from-blue-600 via-indigo-600 to-purple-600",
    features: [
      { icon: FileText, title: "Multi-Format Parser", desc: "PDF (via pdf.js) & DOCX (via Mammoth) parsed in-session." },
      { icon: Sparkles, title: "Live PDF Viewer", desc: "Native embedded document inspection directly in browser." },
      { icon: Target, title: "Privacy Guaranteed", desc: "Text is analyzed client-side and never saved to a public database." }
    ]
  },
  roadmap: {
    badge: "EventBeep Founder's Office • Actionability Gap Engine",
    line1: "Bridge the proof-of-work barrier.",
    line2: "Architectural blueprint & copyable README.",
    subtitle: "Overcome recruiter skepticism with an architectural specification tailored to your missing skills, phased weekend milestones, Google XYZ formulas, and a 7-day preparation plan.",
    gradient: "from-amber-500 via-purple-600 to-pink-600",
    features: [
      { icon: Zap, title: "Phased Milestones", desc: "Hours 0-12 through 36-48 structured execution roadmap." },
      { icon: FileText, title: "Copyable README.md", desc: "Ready-to-commit GitHub markdown with architectural diagrams." },
      { icon: Target, title: "Google XYZ Bullets", desc: "Accomplished [X] measured by [Y] doing [Z] formulas." }
    ]
  },
  interview: {
    badge: "EventBeep Founder's Office • Technical Screening Prep",
    line1: "Master domain technical questions.",
    line2: "Structured STAR answers & recruiter outreach.",
    subtitle: "Anticipated engineering screening questions with complete Situation, Task, Action, Result frameworks and a 1-click cold outreach message for startup founders and recruiters.",
    gradient: "from-emerald-600 via-teal-600 to-indigo-600",
    features: [
      { icon: HelpCircle, title: "Targeted Questions", desc: "Anticipated hurdles from state diffing to auth tokens." },
      { icon: Sparkles, title: "STAR Framework", desc: "Situation, Task, Action, Result answers ready for interviews." },
      { icon: Clock, title: "Recruiter Pitch", desc: "High-conversion cold LinkedIn/email outreach template." }
    ]
  },
  quiz: {
    badge: "EventBeep Founder's Office • Foundational Screening",
    line1: "Adaptive engineering fundamentals quiz.",
    line2: "Test core system & web concepts.",
    subtitle: "5 high-yield screening questions covering React reconciliation, HTTP idempotency, B-tree indexes, JWT client storage, and Git architecture with immediate feedback.",
    gradient: "from-violet-600 via-purple-600 to-pink-600",
    features: [
      { icon: HelpCircle, title: "5 High-Yield Questions", desc: "Screening concepts asked across early-career tech rounds." },
      { icon: Zap, title: "Instant Explanations", desc: "Learn the architectural reasoning behind every option." },
      { icon: BarChart3, title: "Scoring Feedback", desc: "Instant percentage score saved to your candidate session." }
    ]
  },
  applications: {
    badge: "EventBeep Founder's Office • Persistent Application Pipeline",
    line1: "Authenticated application tracking.",
    line2: "SQLite storage & verifiable submission slips.",
    subtitle: "Track your submitted internship applications stored securely in SQLite with lifecycle status stages and downloadable timestamped submission receipts.",
    gradient: "from-purple-600 via-indigo-600 to-blue-600",
    features: [
      { icon: Briefcase, title: "SQLite Persistence", desc: "Stored in relational tables with strict student isolation." },
      { icon: Clock, title: "4-Stage Pipeline", desc: "Submitted to Beep -> Readiness Stored -> Awaiting Update." },
      { icon: FileText, title: "Submission Receipts", desc: "Download official text submission slips with unique Reference IDs." }
    ]
  },
  analytics: {
    badge: "EventBeep Founder's Office • Placement Intelligence",
    line1: "Candidate metrics & market insights.",
    line2: "Illustrative campus hiring benchmarks.",
    subtitle: "Track your student readiness health alongside educational early-career stipend ranges and recruiter screening priorities clearly labeled as illustrative estimates.",
    gradient: "from-indigo-600 via-purple-600 to-pink-600",
    features: [
      { icon: BarChart3, title: "Student Readiness KPIs", desc: "Keyword health, metric counts, and action verb density." },
      { icon: Target, title: "Illustrative Benchmarks", desc: "Educational targets and market stipend ranges for 5 roles." },
      { icon: Zap, title: "Zero False Claims", desc: "Clearly labeled educational guidelines for career preparation." }
    ]
  }
};

export default function DynamicHero({ activeTab = 'matcher', theme }) {
  const isDark = theme === 'dark';
  const config = HERO_CONFIGS[activeTab] || HERO_CONFIGS.matcher;

  return (
    <section className={`relative overflow-hidden pt-8 pb-7 border-b transition-colors duration-200 ${
      isDark ? 'border-slate-800 bg-slate-950' : 'border-slate-300 bg-gradient-to-b from-white to-slate-50/80 shadow-xs'
    }`}>
      {/* Background ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-purple-600/10 blur-[130px] pointer-events-none rounded-full" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center relative z-10">
        
        {/* Prominent Centered Mission Pill */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border text-xs font-bold mb-4 shadow-sm transition-all animate-fadeIn">
          <span className="w-2 h-2 rounded-full bg-purple-600 animate-pulse" />
          <span className={isDark ? 'text-purple-300' : 'text-purple-900 font-extrabold'}>
            {config.badge}
          </span>
        </div>

        {/* Dynamic 2-Line Bold Centered Headline */}
        <h1 className={`text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-tight sm:leading-tight mb-3 transition-all duration-300 animate-fadeIn ${
          isDark ? 'text-white' : 'text-slate-950 font-black'
        }`}>
          <span>{config.line1}</span>
          <br />
          <span className={`bg-gradient-to-r ${config.gradient} bg-clip-text text-transparent`}>
            {config.line2}
          </span>
        </h1>

        {/* Dynamic Subtitle with High Contrast */}
        <p className={`text-xs sm:text-sm max-w-2xl mx-auto mb-6 leading-relaxed transition-all duration-300 ${
          isDark ? 'text-slate-300 font-medium' : 'text-slate-800 font-semibold'
        }`}>
          {config.subtitle}
        </p>

        {/* 3 Pillar Feature Cards with High Contrast in Both Themes */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-4xl mx-auto text-left">
          {config.features.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div 
                key={idx}
                className={`p-3.5 rounded-2xl border flex items-start gap-3 transition-all ${
                  isDark 
                    ? 'bg-slate-900/90 border-slate-800 text-white shadow-sm' 
                    : 'bg-white border-slate-300 shadow-sm hover:border-purple-300 text-slate-900'
                }`}
              >
                <div className="p-2 rounded-xl bg-purple-600/10 text-purple-600 dark:text-purple-400 mt-0.5 shrink-0 border border-purple-500/20">
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <h4 className={`text-xs font-bold leading-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    {item.title}
                  </h4>
                  <p className={`text-[11px] mt-1 leading-snug ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    {item.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
