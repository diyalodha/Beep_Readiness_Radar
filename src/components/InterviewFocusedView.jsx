import React, { useState } from 'react';
import { 
  ChevronDown, ChevronUp, Copy, Check, 
  Sparkles, Send, HelpCircle 
} from 'lucide-react';

export default function InterviewFocusedView({ 
  result, 
  selectedInternship, 
  user,
  onNavigate, 
  theme 
}) {
  const isDark = theme === 'dark';
  const [expandedQuestionIdx, setExpandedQuestionIdx] = useState(0);
  const [copiedPitch, setCopiedPitch] = useState(false);

  const activeRole = result?.targetRole || selectedInternship?.title || 'Frontend Engineer Intern';
  const candidateName = user?.name || 'Student Candidate';

  const questions = result?.interviewPreparation?.technicalQuestions || [
    {
      q: `How do you architect responsive client state transitions in ${activeRole} to minimize unneeded re-renders?`,
      hint: 'Focus on memoization (useMemo, useCallback), atomic state slices, and virtual DOM diffing mechanisms.',
      sampleStarAnswer: {
        situation: `In our production dashboard project handling live candidate application metrics.`,
        task: `We needed to ensure smooth filtering across hundreds of items without UI freezing.`,
        action: `I implemented debounced search inputs, memoized expensive calculation selectors with useMemo, and broke down state into localized component trees.`,
        result: `Eliminated 70% of unnecessary DOM re-renders and brought interaction latency under 16ms.`
      }
    },
    {
      q: 'How do you handle authentication, session expiration, and silent token refresh in modern web architectures?',
      hint: 'Explain short-lived JWTs, httpOnly refresh cookies, and Axios/Fetch 401 response interceptors.',
      sampleStarAnswer: {
        situation: `During our secure student portal implementation with SQLite and Express backend.`,
        task: `Safeguard candidate data from session hijacking while maintaining an uninterrupted user experience.`,
        action: `I configured 24-hour signed JWT tokens, added a 401 response interceptor in the React client to force clean logout, and enforced server-side parameterized queries.`,
        result: `Achieved 100% test pass rate on automated authentication and isolation unit tests.`
      }
    },
    {
      q: 'Can you describe a challenging bug you debugged in your proof-of-work project and your methodical diagnosis process?',
      hint: 'Use the STAR format: specify logs analyzed, root cause discovered, regression test added.',
      sampleStarAnswer: {
        situation: `Encountered false-positive keyword matching where "Java" matched inside "JavaScript" and "C" inside "CSS".`,
        task: `Prevent corrupted match score calculations for student resumes.`,
        action: `Re-architected regex matching to enforce strict word boundaries (\\b) with custom handlers for special language symbols like C++ and C#.`,
        result: `Resolved all false-positive collisions verified by 14 automated unit tests.`
      }
    }
  ];

  const coldOutreachMessage = result?.interviewPreparation?.recruiterOutreachMessage || 
`Hi [Recruiter / Founder Name],

I noticed your team is building for high-impact campus tech initiatives. I recently built a full-lifecycle proof-of-work project tailored for ${activeRole}:

- Engineered end-to-end platform with responsive UI and sub-100ms API transitions.
- Validated core authentication, relational queries, and test suite with 100% pass rate.
- Live deployment & code: [Your GitHub / Vercel Link]

Would love to share how I can contribute immediately to your engineering sprint. Are you open to a brief 10-minute chat this week?

Best regards,
${candidateName}
[LinkedIn Profile] | [Portfolio]`;

  const handleCopyPitch = async () => {
    try {
      await navigator.clipboard.writeText(coldOutreachMessage);
      setCopiedPitch(true);
      setTimeout(() => setCopiedPitch(false), 2000);
    } catch (e) {
      console.warn('Clipboard copy failed:', e);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fadeIn pb-12">
      
      {/* Header */}
      <div className={`p-6 rounded-3xl border ${
        isDark ? 'bg-slate-900/70 border-slate-800' : 'bg-white border-slate-200'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                isDark ? 'bg-purple-950/60 border-purple-500/40 text-purple-300' : 'bg-purple-50 border-purple-200 text-purple-700'
              }`}>
                Interview & STAR Preparation
              </span>
              <span className="text-xs text-slate-400">
                Tailored for {activeRole}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight mt-1">
              Technical Q&A & Recruiter Cold Outreach Pitch
            </h2>
            <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Prepare for early-career screening rounds with structured STAR answers and a copyable recruiter cold outreach template.
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

      {/* Domain Interview Questions (Accordion) */}
      <div className={`p-6 rounded-3xl border space-y-4 ${
        isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200'
      }`}>
        <div className="flex items-center gap-2 pb-2 border-b border-inherit/40">
          <HelpCircle className="w-4 h-4 text-purple-500" />
          <h3 className="text-sm font-extrabold tracking-tight">
            Anticipated Technical Questions & Structured STAR Answers
          </h3>
        </div>

        <div className="space-y-3">
          {questions.map((qObj, idx) => {
            const isExpanded = expandedQuestionIdx === idx;

            return (
              <div 
                key={idx}
                className={`rounded-2xl border transition-all overflow-hidden ${
                  isExpanded
                    ? (isDark ? 'bg-slate-950/60 border-purple-500/40' : 'bg-slate-50 border-purple-300 shadow-sm')
                    : (isDark ? 'bg-slate-950/30 border-slate-800' : 'bg-slate-50/60 border-slate-200')
                }`}
              >
                <button
                  type="button"
                  onClick={() => setExpandedQuestionIdx(isExpanded ? null : idx)}
                  className="w-full p-4 text-left flex items-center justify-between gap-3 text-xs font-bold cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-6 h-6 rounded-lg bg-purple-600/10 text-purple-500 flex items-center justify-center font-mono text-[11px] shrink-0 font-bold">
                      Q{idx + 1}
                    </span>
                    <span className="leading-snug">{qObj.q}</span>
                  </div>
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4 text-purple-500 shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                  )}
                </button>

                {isExpanded && (
                  <div className="px-4 pb-4 pt-1 border-t border-inherit/30 space-y-3 text-xs animate-fadeIn">
                    <div className={`p-3 rounded-xl border text-[11px] ${
                      isDark ? 'bg-slate-900/60 border-slate-800 text-slate-300' : 'bg-white border-slate-200 text-slate-700'
                    }`}>
                      <strong className="text-purple-500">Recruiter Evaluation Focus:</strong> {qObj.hint}
                    </div>

                    {qObj.sampleStarAnswer && (
                      <div className="space-y-2 pt-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                          Recommended STAR Response Structure:
                        </span>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                          <div className={`p-2.5 rounded-xl border ${
                            isDark ? 'bg-slate-900/40 border-slate-800' : 'bg-white border-slate-200'
                          }`}>
                            <strong className="text-purple-400 block mb-0.5">S (Situation):</strong>
                            <p className="opacity-90">{qObj.sampleStarAnswer.situation}</p>
                          </div>
                          <div className={`p-2.5 rounded-xl border ${
                            isDark ? 'bg-slate-900/40 border-slate-800' : 'bg-white border-slate-200'
                          }`}>
                            <strong className="text-indigo-400 block mb-0.5">T (Task):</strong>
                            <p className="opacity-90">{qObj.sampleStarAnswer.task}</p>
                          </div>
                          <div className={`p-2.5 rounded-xl border ${
                            isDark ? 'bg-slate-900/40 border-slate-800' : 'bg-white border-slate-200'
                          }`}>
                            <strong className="text-emerald-400 block mb-0.5">A (Action):</strong>
                            <p className="opacity-90">{qObj.sampleStarAnswer.action}</p>
                          </div>
                          <div className={`p-2.5 rounded-xl border ${
                            isDark ? 'bg-slate-900/40 border-slate-800' : 'bg-white border-slate-200'
                          }`}>
                            <strong className="text-amber-400 block mb-0.5">R (Result):</strong>
                            <p className="opacity-90">{qObj.sampleStarAnswer.result}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Recruiter Cold Outreach Generator */}
      <div className={`p-6 rounded-3xl border space-y-4 ${
        isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200'
      }`}>
        <div className="flex items-center justify-between pb-2 border-b border-inherit/40">
          <div className="flex items-center gap-2">
            <Send className="w-4 h-4 text-purple-500" />
            <h3 className="text-sm font-extrabold tracking-tight">
              Direct Recruiter Outreach Message Template
            </h3>
          </div>

          <button
            onClick={handleCopyPitch}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition cursor-pointer flex items-center gap-1.5 ${
              copiedPitch
                ? 'bg-emerald-500 text-white border-emerald-500'
                : (isDark ? 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-200' : 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-800')
            }`}
          >
            {copiedPitch ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedPitch ? 'Copied Pitch' : 'Copy Pitch'}</span>
          </button>
        </div>

        <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
          Use this high-conversion cold message on LinkedIn or email to reach startup founders and engineering leads directly with your proof-of-work link.
        </p>

        <pre className={`p-4 rounded-2xl border text-[11px] font-mono whitespace-pre-wrap leading-relaxed ${
          isDark ? 'bg-slate-950 border-slate-800 text-slate-300' : 'bg-slate-900 border-slate-800 text-slate-200'
        }`}>
          {coldOutreachMessage}
        </pre>
      </div>

    </div>
  );
}
