import React from 'react';
import { X, BarChart3, ShieldAlert, Sparkles, Award } from 'lucide-react';

export default function StatisticsModal({ isOpen, onClose, theme }) {
  if (!isOpen) return null;

  const isDark = theme === 'dark';

  const placementBenchmarks = [
    { role: 'Frontend Engineer Intern', targetMatch: '78%', avgSalary: '₹25k-45k/mo', keyFilter: 'React, TypeScript, Next.js, Live Link' },
    { role: 'Fullstack Developer Intern', targetMatch: '80%', avgSalary: '₹30k-50k/mo', keyFilter: 'Fullstack MERN/PERN, Docker, REST' },
    { role: 'AI / GenAI Engineering Intern', targetMatch: '85%', avgSalary: '₹40k-65k/mo', keyFilter: 'Python, RAG, LangChain, Vector DBs' },
    { role: 'Backend Engineering Intern', targetMatch: '82%', avgSalary: '₹30k-55k/mo', keyFilter: 'SQL, Redis, Microservices, System Design' },
    { role: 'Product & Growth Analyst', targetMatch: '75%', avgSalary: '₹25k-40k/mo', keyFilter: 'SQL, Power BI, Funnel Metrics, PRDs' },
  ];

  const disqualifiers = [
    {
      pct: '74%',
      title: 'Missing Verifiable Proof-of-Work',
      desc: 'Listing projects without live deployment (Vercel/Render) or active GitHub repos leads to instant recruiter skips.',
      severity: 'critical'
    },
    {
      pct: '68%',
      title: 'Zero Quantified Metrics (Passive Bullets)',
      desc: 'Writing "Worked on website" instead of Google XYZ ("Built 6 dashboards, increasing user session by [X]%").',
      severity: 'critical'
    },
    {
      pct: '61%',
      title: 'Keyword Mismatch with Job Description',
      desc: 'Failing to include canonical tech stack requirements that automated ATS screening tools filter for.',
      severity: 'warning'
    },
    {
      pct: '52%',
      title: 'Academic-Only or Obsolete Tech Stack',
      desc: 'Listing college lab coursework (e.g. C/C++ command line apps) instead of modern production frameworks.',
      severity: 'warning'
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-fadeIn">
      <div 
        className={`w-full max-w-3xl rounded-3xl border shadow-2xl overflow-hidden flex flex-col max-h-[90vh] transition-colors ${
          isDark ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        {/* Header */}
        <div className={`p-5 sm:p-6 border-b flex items-center justify-between ${
          isDark ? 'border-slate-800 bg-slate-950/40' : 'border-slate-100 bg-slate-50/70'
        }`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-purple-600/30">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-extrabold tracking-tight">Campus Placement & Hiring Statistics</h2>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                  isDark ? 'bg-purple-950/60 border-purple-500/40 text-purple-300' : 'bg-purple-50 border-purple-200 text-purple-700'
                }`}>
                  2026 Tech Benchmarks
                </span>
              </div>
              <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Aggregated screening data from 1,200+ campus tech internship evaluations.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className={`p-2 rounded-xl border transition ${
              isDark 
                ? 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300' 
                : 'bg-white hover:bg-slate-100 border-slate-200 text-slate-600 shadow-sm'
            }`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1">
          
          {/* Key Metric Highlights */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className={`p-3.5 rounded-2xl border text-center ${
              isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'
            }`}>
              <span className="text-2xl sm:text-3xl font-black text-rose-500 block">6 sec</span>
              <span className="text-xs font-bold block mt-1">Glance Time</span>
              <p className={`text-[10px] mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Average recruiter review time
              </p>
            </div>

            <div className={`p-3.5 rounded-2xl border text-center ${
              isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'
            }`}>
              <span className="text-2xl sm:text-3xl font-black text-amber-500 block">74%</span>
              <span className="text-xs font-bold block mt-1">Drop Rate</span>
              <p className={`text-[10px] mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Resumes lacking live proof
              </p>
            </div>

            <div className={`p-3.5 rounded-2xl border text-center ${
              isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'
            }`}>
              <span className="text-2xl sm:text-3xl font-black text-emerald-500 block">3.4x</span>
              <span className="text-xs font-bold block mt-1">Callback Boost</span>
              <p className={`text-[10px] mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                With 48-hr proof project
              </p>
            </div>

            <div className={`p-3.5 rounded-2xl border text-center ${
              isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'
            }`}>
              <span className="text-2xl sm:text-3xl font-black text-purple-600 dark:text-purple-400 block">85%+</span>
              <span className="text-xs font-bold block mt-1">Target ATS Score</span>
              <p className={`text-[10px] mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                To clear automated screening
              </p>
            </div>
          </div>

          {/* Top 4 Silent Disqualifiers */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <ShieldAlert className="w-4 h-4 text-rose-500" />
              <h3 className="text-xs font-bold uppercase tracking-wider">
                Top 4 Silent Rejection Reasons in Campus Tech Hiring
              </h3>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {disqualifiers.map((item, idx) => (
                <div 
                  key={idx}
                  className={`p-3.5 rounded-2xl border flex items-start gap-3 ${
                    item.severity === 'critical'
                      ? (isDark ? 'bg-rose-950/20 border-rose-900/40' : 'bg-rose-50/60 border-rose-200')
                      : (isDark ? 'bg-amber-950/20 border-amber-900/40' : 'bg-amber-50/60 border-amber-200')
                  }`}
                >
                  <span className={`text-xl font-black shrink-0 ${
                    item.severity === 'critical' ? 'text-rose-500' : 'text-amber-500'
                  }`}>
                    {item.pct}
                  </span>
                  <div>
                    <h4 className="text-xs font-bold leading-tight">{item.title}</h4>
                    <p className={`text-[11px] mt-1 leading-relaxed opacity-90 ${
                      isDark ? 'text-slate-300' : 'text-slate-700'
                    }`}>
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Role-by-Role Target Benchmarks */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Award className="w-4 h-4 text-purple-500" />
              <h3 className="text-xs font-bold uppercase tracking-wider">
                Target Readiness Benchmarks by Internship Domain
              </h3>
            </div>

            <div className={`border rounded-2xl overflow-hidden ${
              isDark ? 'border-slate-800' : 'border-slate-200'
            }`}>
              <table className="w-full text-left text-xs">
                <thead className={`border-b text-[10px] uppercase tracking-wider font-bold ${
                  isDark ? 'bg-slate-950/80 border-slate-800 text-slate-400' : 'bg-slate-100 border-slate-200 text-slate-600'
                }`}>
                  <tr>
                    <th className="p-3">Target Role</th>
                    <th className="p-3">ATS Threshold</th>
                    <th className="p-3">Campus Stipend</th>
                    <th className="p-3 hidden sm:table-cell">Key Recruiter Filter</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  {placementBenchmarks.map((row, idx) => (
                    <tr 
                      key={idx}
                      className={isDark ? 'hover:bg-slate-800/40' : 'hover:bg-slate-50'}
                    >
                      <td className="p-3 font-bold">{row.role}</td>
                      <td className="p-3">
                        <span className="font-bold text-purple-600 dark:text-purple-400">
                          {row.targetMatch}
                        </span>
                      </td>
                      <td className="p-3 text-emerald-600 dark:text-emerald-400 font-semibold">{row.avgSalary}</td>
                      <td className="p-3 hidden sm:table-cell text-[11px] opacity-80">{row.keyFilter}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* The Beep Solution */}
          <div className={`p-4 rounded-2xl border flex items-center gap-3 ${
            isDark ? 'bg-purple-950/30 border-purple-500/30 text-purple-200' : 'bg-purple-50 border-purple-200 text-purple-900'
          }`}>
            <Sparkles className="w-5 h-5 text-purple-500 shrink-0" />
            <div className="text-xs leading-relaxed">
              <span className="font-bold block">How Beep Readiness Radar Bridges the Gap:</span>
              <p className="opacity-90 mt-0.5 text-[11px]">
                By identifying your exact missing keywords and giving you a concrete 48-hour proof project with Google XYZ bullets, Beep shifts your resume from the 74% auto-drop pile to the top 15% interview shortlist.
              </p>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className={`p-4 border-t flex items-center justify-between text-xs ${
          isDark ? 'border-slate-800 bg-slate-950/40 text-slate-400' : 'border-slate-100 bg-slate-50/70 text-slate-500'
        }`}>
          <span>Beep AI Career Platform • Data verified against campus recruiting cycles</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl font-bold bg-purple-600 hover:bg-purple-500 text-white shadow-sm transition"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
}
