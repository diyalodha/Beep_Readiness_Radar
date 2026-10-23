import React, { useState, useMemo } from 'react';
import { 
  ChevronDown, ChevronUp, Copy, Check, 
  Sparkles, Send, HelpCircle 
} from 'lucide-react';
import { runDynamicHeuristicAnalysis } from '../utils/heuristicCore';

export default function InterviewFocusedView({ 
  result, 
  selectedInternship, 
  resumeText = '',
  fileName = '',
  isCustomJob = false,
  customRoleTitle = '',
  customJd = '',
  user,
  onNavigate, 
  theme 
}) {
  const isDark = theme === 'dark';
  const [expandedQuestionIdx, setExpandedQuestionIdx] = useState(0);
  const [copiedPitch, setCopiedPitch] = useState(false);

  const activeRole = result?.targetRole 
    || (isCustomJob ? (customRoleTitle || 'Software Engineer') : (selectedInternship?.title || selectedInternship?.role || 'Frontend Engineer Intern'));
  const targetCompany = result?.companyName 
    || (isCustomJob ? 'Target Partner' : (selectedInternship?.company || 'Target Company'));
  const targetJd = isCustomJob 
    ? customJd 
    : (selectedInternship?.description || (selectedInternship?.requirements ? selectedInternship.requirements.join(' ') : ''));
  const candidateName = user?.name || 'Student Candidate';

  // Compute dynamic analysis if result not run yet but resume is attached
  const dynamicAnalysis = useMemo(() => {
    if (result) return result;
    if (resumeText && resumeText.trim().length >= 20) {
      try {
        return runDynamicHeuristicAnalysis(resumeText, targetJd || '', activeRole, targetCompany);
      } catch (err) {
        console.warn('Failed to compute dynamic interview prep from uploaded resume:', err);
      }
    }
    return null;
  }, [result, resumeText, targetJd, activeRole, targetCompany]);

  const activeData = dynamicAnalysis || result;
  const isPersonalized = Boolean(activeData && (resumeText || result));

  // Extract raw questions from any supported schema property
  const rawQuestions = activeData?.suggestedInterviewTopics 
    || activeData?.interviewPreparation?.technicalQuestions 
    || activeData?.interviewQuestions;

  // Fully normalize question items: guarantee q, hint, and sampleStarAnswer are never blank
  const questions = (Array.isArray(rawQuestions) && rawQuestions.length > 0)
    ? rawQuestions.map((item, idx) => {
        const questionText = item.q || item.question || item.topic || `Technical Screening Question ${idx + 1}`;
        const hintText = item.hint || item.recruiterIntent || item.focalPoint || 'Focus on architectural trade-offs, edge cases, and engineering fundamentals.';
        
        let starAnswer = null;
        if (item.sampleStarAnswer && typeof item.sampleStarAnswer === 'object') {
          starAnswer = {
            situation: item.sampleStarAnswer.situation || `In production engineering work for ${activeRole}.`,
            task: item.sampleStarAnswer.task || 'Solve core domain constraints while maintaining system stability.',
            action: item.sampleStarAnswer.action || 'Applied modular architecture, clean data contracts, and automated tests.',
            result: item.sampleStarAnswer.result || 'Achieved sub-100ms response latency with zero regression failures.'
          };
        } else if (typeof item.sampleStarAnswer === 'string' && item.sampleStarAnswer.trim()) {
          starAnswer = {
            situation: `In engineering projects targeting ${activeRole} standards.`,
            task: 'Address technical gaps and feature requirements under sprint deadlines.',
            action: item.sampleStarAnswer,
            result: 'Validated through test suites and verified live deployment.'
          };
        } else if (item.recommendedAnswer && typeof item.recommendedAnswer === 'string') {
          starAnswer = {
            situation: `In technical projects targeting ${activeRole} standards.`,
            task: `Demonstrate hands-on execution for ${targetCompany}.`,
            action: item.recommendedAnswer,
            result: 'Validated through clean git commit history and working proof-of-work demonstration.'
          };
        } else {
          starAnswer = {
            situation: `Encountered during high-throughput feature implementation for ${activeRole}.`,
            task: 'Isolate root causes and maintain optimal latency under concurrent load.',
            action: 'Implemented defensive error boundaries, query indexing, and typed component interfaces.',
            result: 'Zero unhandled exceptions and sub-50ms query execution times.'
          };
        }

        return {
          q: questionText,
          hint: hintText,
          sampleStarAnswer: starAnswer
        };
      })
    : [
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

  const coldOutreachMessage = activeData?.applicationBooster?.coldPitchMessage 
    || activeData?.interviewPreparation?.recruiterOutreachMessage 
    || `Hi [Recruiter / Founder Name],

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
      <div className={`p-6 sm:p-8 rounded-3xl border shadow-md transition-colors ${
        isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200'
      }`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                isDark ? 'bg-purple-950/60 border-purple-500/40 text-purple-300' : 'bg-purple-50 border-purple-200 text-purple-700'
              }`}>
                Interview & STAR Preparation
              </span>
              <span className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full border ${
                isDark ? 'bg-slate-800 border-slate-700 text-slate-300' : 'bg-slate-100 border-slate-300 text-slate-700'
              }`}>
                Target: {activeRole}
              </span>
            </div>
            <h2 className={`text-xl sm:text-2xl font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Technical Q&A & Recruiter Cold Outreach Pitch
            </h2>
            <p className={`text-xs max-w-2xl font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              Prepare for early-career screening rounds with structured STAR answers and a copyable recruiter cold outreach template tailored to your background.
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

        {/* Personalization Status Banner */}
        {isPersonalized ? (
          <div className={`mt-5 p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs ${
            isDark ? 'bg-emerald-950/25 border-emerald-500/40 text-emerald-200' : 'bg-emerald-50 border-emerald-300 text-emerald-900 shadow-2xs'
          }`}>
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
              <div>
                <span className="font-extrabold mr-1">100% Resume-Personalized Interview Prep:</span>
                <span className="font-medium">
                  STAR responses and recruiter outreach tailored to {fileName || 'your uploaded resume'} and {activeRole}.
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
                <strong>Standard Screening Questions:</strong> Showing baseline interview questions for {activeRole}. Upload your resume in the Resume Parser or JD Matcher to personalize questions to your projects.
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

      {/* Domain Interview Questions (Accordion) */}
      <div className={`p-6 sm:p-8 rounded-3xl border-2 space-y-4 shadow-sm transition-colors ${
        isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200'
      }`}>
        <div className="flex items-center gap-2.5 pb-3 border-b border-inherit/40">
          <HelpCircle className="w-5 h-5 text-purple-500" />
          <div>
            <h3 className={`text-base font-extrabold tracking-tight ${isDark ? 'text-white' : 'text-slate-950'}`}>
              Anticipated Technical Questions & Structured STAR Answers
            </h3>
            <p className={`text-xs mt-0.5 font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              Click each question to view the interviewer focal point and model STAR response.
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {questions.map((qObj, idx) => {
            const isExpanded = expandedQuestionIdx === idx;

            return (
              <div 
                key={idx}
                className={`rounded-2xl border-2 transition-all overflow-hidden ${
                  isExpanded
                    ? (isDark ? 'bg-slate-950/70 border-purple-500/50 shadow-sm' : 'bg-slate-50 border-purple-300 shadow-sm')
                    : (isDark ? 'bg-slate-950/40 border-slate-800 hover:border-slate-700' : 'bg-slate-50/60 border-slate-200 hover:border-slate-300')
                }`}
              >
                <button
                  type="button"
                  onClick={() => setExpandedQuestionIdx(isExpanded ? null : idx)}
                  className="w-full p-4 text-left flex items-center justify-between gap-3 cursor-pointer select-none"
                >
                  <div className="flex items-start gap-3">
                    <span className="w-5 h-5 rounded-full bg-purple-600/10 text-purple-600 dark:text-purple-400 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5 font-mono">
                      {idx + 1}
                    </span>
                    <div>
                      <h4 className={`text-xs sm:text-sm font-bold leading-snug ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        {qObj.q}
                      </h4>
                      {qObj.hint && (
                        <p className={`text-[11px] mt-1 font-medium italic ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                          Focal Point: {qObj.hint}
                        </p>
                      )}
                    </div>
                  </div>
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4 text-purple-500 shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                  )}
                </button>

                {isExpanded && qObj.sampleStarAnswer && (
                  <div className={`p-4 border-t-2 text-xs space-y-3 ${
                    isDark ? 'bg-slate-950/90 border-slate-800 text-slate-300' : 'bg-white border-slate-200 text-slate-700'
                  }`}>
                    <span className="text-[10px] font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider block">
                      Sample STAR Method Answer:
                    </span>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <div className={`p-2.5 rounded-xl border ${isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                        <strong className="block text-[10px] uppercase tracking-wider text-purple-500 mb-0.5">Situation</strong>
                        <p className="opacity-90 leading-relaxed text-[11px]">{qObj.sampleStarAnswer.situation}</p>
                      </div>

                      <div className={`p-2.5 rounded-xl border ${isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                        <strong className="block text-[10px] uppercase tracking-wider text-purple-500 mb-0.5">Task</strong>
                        <p className="opacity-90 leading-relaxed text-[11px]">{qObj.sampleStarAnswer.task}</p>
                      </div>

                      <div className={`p-2.5 rounded-xl border ${isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                        <strong className="block text-[10px] uppercase tracking-wider text-purple-500 mb-0.5">Action</strong>
                        <p className="opacity-90 leading-relaxed text-[11px]">{qObj.sampleStarAnswer.action}</p>
                      </div>

                      <div className={`p-2.5 rounded-xl border ${isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                        <strong className="block text-[10px] uppercase tracking-wider text-emerald-500 mb-0.5">Result</strong>
                        <p className="opacity-90 leading-relaxed text-[11px]">{qObj.sampleStarAnswer.result}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Recruiter Cold Outreach Message Template */}
      <div className={`p-6 sm:p-8 rounded-3xl border-2 space-y-4 shadow-sm transition-colors ${
        isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200'
      }`}>
        <div className="flex items-center justify-between pb-3 border-b border-inherit/40">
          <div className="flex items-center gap-2.5">
            <Send className="w-5 h-5 text-purple-500" />
            <div>
              <h3 className={`text-base font-extrabold tracking-tight ${isDark ? 'text-white' : 'text-slate-950'}`}>
                Recruiter & Founder Cold Pitch Template
              </h3>
              <p className={`text-xs mt-0.5 font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                Reach out directly on LinkedIn with this concise pitch referencing your weekend proof-of-work project.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleCopyPitch}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition cursor-pointer flex items-center gap-1.5 shrink-0 ${
              copiedPitch
                ? 'bg-emerald-500 text-white border-emerald-500 shadow-sm'
                : (isDark ? 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-200' : 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-800 shadow-2xs')
            }`}
          >
            {copiedPitch ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedPitch ? 'Copied Pitch' : 'Copy Pitch'}</span>
          </button>
        </div>

        <pre className={`p-4 rounded-2xl border-2 text-xs font-mono whitespace-pre-wrap leading-relaxed ${
          isDark ? 'bg-slate-950 border-slate-800 text-slate-300' : 'bg-slate-900 border-slate-800 text-slate-200'
        }`}>
          {coldOutreachMessage}
        </pre>
      </div>

    </div>
  );
}
