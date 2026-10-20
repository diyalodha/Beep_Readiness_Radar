import React, { useState } from 'react';
import { CheckCircle2, XCircle, RotateCcw, ArrowRight } from 'lucide-react';

const QUIZ_QUESTIONS = [
  {
    id: 1,
    category: 'Frontend Engineering',
    question: 'Why does React require keys when rendering lists of elements?',
    options: [
      'To automatically sort the list elements alphabetically in the DOM',
      'To help React identify which items have changed, been added, or removed during reconciliation',
      'To enforce unique CSS styling rules for each rendered component',
      'To prevent memory leaks by destroying unmounted array elements'
    ],
    correctIdx: 1,
    explanation: 'Keys give elements a stable identity so React can match elements between render passes without re-rendering the entire list.'
  },
  {
    id: 2,
    category: 'Backend & APIs',
    question: 'Which of the following HTTP methods is guaranteed to be idempotent according to the RFC spec?',
    options: [
      'POST',
      'PATCH',
      'PUT',
      'CONNECT'
    ],
    correctIdx: 2,
    explanation: 'PUT and DELETE are idempotent: making the same request multiple times produces the exact same server state as a single request.'
  },
  {
    id: 3,
    category: 'Databases & SQL',
    question: 'What is the primary trade-off of adding a B-tree index to a frequently queried database column?',
    options: [
      'Faster reads at the expense of increased storage and slower write/insert performance',
      'Guaranteed encryption at rest at the cost of network throughput',
      'Faster writes at the expense of query cache invalidation',
      'Automatic table sharding with higher CPU memory overhead'
    ],
    correctIdx: 0,
    explanation: 'Indexes drastically speed up SELECT queries via log-time lookups, but every INSERT, UPDATE, and DELETE must maintain the index structure.'
  },
  {
    id: 4,
    category: 'System Design & Auth',
    question: 'Where should a JSON Web Token (JWT) ideally be stored in a web client to mitigate XSS attacks?',
    options: [
      'In a global JavaScript window variable',
      'In an httpOnly, Secure, SameSite cookie',
      'In the HTML meta tags of index.html',
      'In localStorage accessible by third-party scripts'
    ],
    correctIdx: 1,
    explanation: 'httpOnly cookies cannot be read by JavaScript, protecting authentication credentials even if an XSS vulnerability exists.'
  },
  {
    id: 5,
    category: 'Git & Version Control',
    question: 'What is the key difference between "git merge" and "git rebase"?',
    options: [
      'git merge deletes previous commit logs, while git rebase archives them',
      'git merge combines histories preserving commit chronology, while git rebase rewrites commits linearly on top of the target base',
      'git rebase only works on remote tracking branches',
      'git merge is only supported in GitHub Enterprise'
    ],
    correctIdx: 1,
    explanation: 'Rebase rewrites the commit history to produce a clean, linear sequence of commits, whereas merge creates a dedicated merge commit preserving branch topology.'
  }
];

export default function AdaptiveQuizView({ theme, onCompleteQuiz }) {
  const isDark = theme === 'dark';
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSelect = (qIdx, optIdx) => {
    if (isSubmitted) return;
    setSelectedAnswers(prev => ({
      ...prev,
      [qIdx]: optIdx
    }));
  };

  const calculateScore = () => {
    let correct = 0;
    QUIZ_QUESTIONS.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.correctIdx) {
        correct++;
      }
    });
    return Math.round((correct / QUIZ_QUESTIONS.length) * 100);
  };

  const handleSubmit = () => {
    setIsSubmitted(true);
    const score = calculateScore();
    if (onCompleteQuiz) {
      onCompleteQuiz(score);
    }
  };

  const handleReset = () => {
    setSelectedAnswers({});
    setIsSubmitted(false);
  };

  const answeredCount = Object.keys(selectedAnswers).length;
  const score = isSubmitted ? calculateScore() : 0;

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fadeIn pb-12">
      {/* Quiz Header */}
      <div className={`p-6 rounded-3xl border ${
        isDark ? 'bg-slate-900/70 border-slate-800' : 'bg-white border-slate-200'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                isDark ? 'bg-purple-950/60 border-purple-500/40 text-purple-300' : 'bg-purple-50 border-purple-200 text-purple-700'
              }`}>
                Adaptive CS Assessment
              </span>
              <span className="text-xs text-slate-400">
                5 Questions • 8 Mins
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight mt-1">
              Core Tech & System Fundamentals Quiz
            </h2>
            <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Benchmark your foundational knowledge against standard Indian tech startup screening rounds.
            </p>
          </div>

          {isSubmitted ? (
            <div className={`p-4 rounded-2xl border text-center min-w-[140px] ${
              score >= 70 
                ? (isDark ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-400' : 'bg-emerald-50 border-emerald-300 text-emerald-700')
                : (isDark ? 'bg-amber-950/40 border-amber-500/40 text-amber-400' : 'bg-amber-50 border-amber-300 text-amber-700')
            }`}>
              <span className="text-2xl font-black block">{score}%</span>
              <span className="text-[10px] font-bold uppercase tracking-wider block mt-0.5">
                {score >= 70 ? 'Passed Screen' : 'Needs Practice'}
              </span>
            </div>
          ) : (
            <div className={`p-3 rounded-2xl border text-center min-w-[120px] ${
              isDark ? 'bg-slate-950/40 border-slate-800' : 'bg-slate-50 border-slate-200'
            }`}>
              <span className="text-lg font-black block text-purple-500">
                {answeredCount} / {QUIZ_QUESTIONS.length}
              </span>
              <span className="text-[10px] text-slate-400 font-semibold block">
                Answered
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Questions List */}
      <div className="space-y-4">
        {QUIZ_QUESTIONS.map((q, qIdx) => {
          const userChoice = selectedAnswers[qIdx];
          const isCorrect = userChoice === q.correctIdx;

          return (
            <div 
              key={q.id}
              className={`p-5 rounded-3xl border transition-all ${
                isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200'
              }`}
            >
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="text-[10px] font-mono font-bold uppercase text-purple-500 tracking-wider">
                  Question {qIdx + 1} • {q.category}
                </span>
                {isSubmitted && (
                  <span className={`text-[11px] font-bold flex items-center gap-1 ${
                    isCorrect ? 'text-emerald-500' : 'text-rose-500'
                  }`}>
                    {isCorrect ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                    {isCorrect ? 'Correct' : 'Incorrect'}
                  </span>
                )}
              </div>

              <h3 className="text-sm font-bold leading-snug">
                {q.question}
              </h3>

              {/* Options */}
              <div className="grid grid-cols-1 gap-2 mt-3">
                {q.options.map((opt, optIdx) => {
                  const isSelected = userChoice === optIdx;
                  let optStyle = isDark 
                    ? 'bg-slate-950/40 border-slate-800 text-slate-300 hover:border-slate-700' 
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300';

                  if (isSelected) {
                    optStyle = isDark 
                      ? 'bg-purple-950/40 border-purple-500 text-purple-200 ring-1 ring-purple-500' 
                      : 'bg-purple-50 border-purple-500 text-purple-900 ring-1 ring-purple-400';
                  }

                  if (isSubmitted) {
                    if (optIdx === q.correctIdx) {
                      optStyle = isDark 
                        ? 'bg-emerald-950/40 border-emerald-500 text-emerald-300 ring-1 ring-emerald-500' 
                        : 'bg-emerald-50 border-emerald-500 text-emerald-900 ring-1 ring-emerald-500';
                    } else if (isSelected && !isCorrect) {
                      optStyle = isDark 
                        ? 'bg-rose-950/40 border-rose-500 text-rose-300 ring-1 ring-rose-500' 
                        : 'bg-rose-50 border-rose-500 text-rose-900 ring-1 ring-rose-500';
                    }
                  }

                  return (
                    <button
                      key={optIdx}
                      type="button"
                      disabled={isSubmitted}
                      onClick={() => handleSelect(qIdx, optIdx)}
                      className={`p-3 rounded-2xl border text-left text-xs font-medium transition cursor-pointer flex items-center justify-between ${optStyle}`}
                    >
                      <span>{opt}</span>
                      <span className="w-4 h-4 rounded-full border border-current/40 flex items-center justify-center shrink-0 ml-2">
                        {isSelected && <span className="w-2 h-2 rounded-full bg-current" />}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Explanation upon submit */}
              {isSubmitted && (
                <div className={`mt-3 p-3 rounded-xl border text-[11px] leading-relaxed ${
                  isCorrect
                    ? (isDark ? 'bg-emerald-950/20 border-emerald-800/40 text-emerald-300' : 'bg-emerald-50/70 border-emerald-200 text-emerald-800')
                    : (isDark ? 'bg-slate-950/40 border-slate-800 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-700')
                }`}>
                  <strong>Explanation:</strong> {q.explanation}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between pt-2">
        <button
          onClick={handleReset}
          className={`px-4 py-2 rounded-xl text-xs font-semibold border flex items-center gap-1.5 transition cursor-pointer ${
            isDark ? 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300' : 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-700'
          }`}
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Quiz</span>
        </button>

        {!isSubmitted ? (
          <button
            onClick={handleSubmit}
            disabled={answeredCount === 0}
            className={`px-6 py-2.5 rounded-xl font-bold text-xs shadow-md transition cursor-pointer flex items-center gap-2 ${
              answeredCount === 0
                ? 'bg-slate-300 dark:bg-slate-800 text-slate-500 cursor-not-allowed'
                : 'bg-purple-600 hover:bg-purple-500 text-white shadow-purple-600/30'
            }`}
          >
            <span>Submit Assessment</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        ) : (
          <div className="text-xs font-bold text-emerald-500 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4" />
            <span>Score saved to candidate dashboard</span>
          </div>
        )}
      </div>
    </div>
  );
}
