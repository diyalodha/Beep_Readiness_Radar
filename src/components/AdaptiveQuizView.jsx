import React, { useState, useEffect, useCallback } from 'react';
import { 
  CheckCircle2, XCircle, RotateCcw, 
  Sparkles, Terminal, Code2, 
  AlertTriangle, Send, 
  BrainCircuit, Layers, Check, Award
} from 'lucide-react';

export default function AdaptiveQuizView({ 
  theme, 
  targetRole = 'Frontend Developer', 
  customJd = '', 
  detectedGaps = [], 
  token = '',
  onCompleteQuiz 
}) {
  const isDark = theme === 'dark';

  const [difficulty, setDifficulty] = useState('expert');
  const [role, setRole] = useState(targetRole || 'Frontend Developer');
  const [prevTargetRole, setPrevTargetRole] = useState(targetRole);
  if (targetRole !== prevTargetRole) {
    setPrevTargetRole(targetRole);
    setRole(targetRole || 'Frontend Developer');
  }

  // Fetch or generate a quiz session from the server
  const generateQuiz = useCallback(async (selectedDifficulty = difficulty, selectedRole = role) => {
    setIsLoading(true);
    setErrorMessage('');
    setGradedResult(null);
    setUserAnswers({});

    try {
      const headers = { 'Content-Type': 'application/json' };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await fetch('/api/quiz/generate', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          role: selectedRole,
          difficulty: selectedDifficulty,
          customJd: customJd || '',
          detectedGaps: Array.isArray(detectedGaps) ? detectedGaps : []
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to generate technical assessment.');
      }

      setQuizSession(data);
    } catch (err) {
      setErrorMessage(err.message || 'Unable to connect to quiz service.');
    } finally {
      setIsLoading(false);
    }
  }, [difficulty, role, customJd, detectedGaps, token]);

  // Initial asynchronous load on mount or role change
  useEffect(() => {
    let ignore = false;
    const fetchInitialQuiz = async () => {
      try {
        const headers = { 'Content-Type': 'application/json' };
        if (token) headers['Authorization'] = `Bearer ${token}`;
        const res = await fetch('/api/quiz/generate', {
          method: 'POST',
          headers,
          body: JSON.stringify({
            role,
            difficulty,
            customJd: customJd || '',
            detectedGaps: Array.isArray(detectedGaps) ? detectedGaps : []
          })
        });
        const data = await res.json();
        if (!ignore) {
          if (res.ok) setQuizSession(data);
          else setErrorMessage(data.error || 'Failed to generate technical assessment.');
        }
      } catch (err) {
        if (!ignore) setErrorMessage(err.message || 'Unable to connect to quiz service.');
      }
    };
    fetchInitialQuiz();
    return () => { ignore = true; };
  }, [difficulty, role, customJd, detectedGaps, token]);

  // Handle single-select or code-analysis choice
  const handleSingleSelect = (questionId, optionIdx) => {
    if (gradedResult || isGrading) return;
    setUserAnswers(prev => ({
      ...prev,
      [questionId]: optionIdx
    }));
  };

  // Handle multi-select choice
  const handleMultiSelect = (questionId, optionIdx) => {
    if (gradedResult || isGrading) return;
    setUserAnswers(prev => {
      const current = Array.isArray(prev[questionId]) ? [...prev[questionId]] : [];
      const exists = current.includes(optionIdx);
      const updated = exists 
        ? current.filter(i => i !== optionIdx)
        : [...current, optionIdx].sort();
      return {
        ...prev,
        [questionId]: updated
      };
    });
  };

  // Handle short-answer text
  const handleShortAnswerChange = (questionId, text) => {
    if (gradedResult || isGrading) return;
    setUserAnswers(prev => ({
      ...prev,
      [questionId]: text
    }));
  };

  // Submit assessment to backend for grading with server-side keys
  const handleSubmitQuiz = async () => {
    if (!quizSession?.sessionId) return;
    setIsGrading(true);
    setErrorMessage('');

    try {
      const headers = { 'Content-Type': 'application/json' };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await fetch('/api/quiz/grade', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          sessionId: quizSession.sessionId,
          answers: userAnswers
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to evaluate quiz submission.');
      }

      setGradedResult(data);
      if (onCompleteQuiz && typeof onCompleteQuiz === 'function') {
        onCompleteQuiz(data.scorePercent);
      }

      // Scroll smoothly to results
      window.scrollTo({ top: 120, behavior: 'smooth' });
    } catch (err) {
      setErrorMessage(err.message || 'Error grading assessment.');
    } finally {
      setIsGrading(false);
    }
  };

  const answeredCount = quizSession?.questions 
    ? quizSession.questions.filter(q => {
        const val = userAnswers[q.id];
        if (q.type === 'multi-select') return Array.isArray(val) && val.length > 0;
        if (q.type === 'short-answer') return typeof val === 'string' && val.trim().length > 0;
        return val !== undefined && val !== null;
      }).length
    : 0;

  const totalQuestions = quizSession?.questions?.length || 0;
  const progressPercent = totalQuestions > 0 ? Math.round((answeredCount / totalQuestions) * 100) : 0;

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fadeIn pb-16 px-4">
      
      {/* 1. QUIZ HEADER & DIFFICULTY SELECTOR */}
      <div className={`p-6 sm:p-8 rounded-3xl border shadow-md transition-colors ${
        isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200'
      }`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                isDark ? 'bg-purple-950/60 border-purple-500/40 text-purple-300' : 'bg-purple-50 border-purple-200 text-purple-700'
              }`}>
                Expert-Level Adaptive Assessment
              </span>
              <select
                value={role}
                onChange={(e) => {
                  const newRole = e.target.value;
                  setRole(newRole);
                  generateQuiz(difficulty, newRole);
                }}
                disabled={isLoading || isGrading}
                className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full border transition cursor-pointer ${
                  isDark ? 'bg-slate-800 border-slate-700 text-slate-300' : 'bg-slate-100 border-slate-300 text-slate-700'
                }`}
              >
                <option value="Frontend Developer">Frontend Developer</option>
                <option value="Backend Developer">Backend Developer</option>
                <option value="Full Stack Developer">Full Stack Developer</option>
                <option value="Data Science & ML">Data Science & ML</option>
                <option value="DevOps & Cloud">DevOps & Cloud</option>
              </select>
              <span className="text-xs text-slate-400 font-medium">
                {totalQuestions > 0 ? `${totalQuestions} Questions` : '5 Questions'}
              </span>
            </div>
            
            <h2 className={`text-xl sm:text-2xl font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Scenario-Based Technical Assessment
            </h2>
            <p className={`text-xs max-w-2xl font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              Multi-step engineering scenarios, code analysis, and architectural edge cases grounded in real tech startup screening bars. Zero client-side answer leakage.
            </p>
          </div>

          {/* Difficulty & Refresh Controls */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 shrink-0">
            <div className={`inline-flex p-1 rounded-xl border text-xs font-bold ${
              isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-100 border-slate-300'
            }`}>
              {['foundational', 'intermediate', 'expert'].map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => {
                    setDifficulty(lvl);
                    generateQuiz(lvl, role);
                  }}
                  disabled={isLoading || isGrading}
                  className={`px-2.5 py-1 rounded-lg capitalize transition cursor-pointer ${
                    difficulty === lvl
                      ? 'bg-purple-600 text-white shadow-sm'
                      : (isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-950')
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>

            <button
              onClick={() => generateQuiz(difficulty, role)}
              disabled={isLoading || isGrading}
              title="Generate fresh questions"
              className={`p-2 rounded-xl border transition cursor-pointer ${
                isDark 
                  ? 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300' 
                  : 'bg-white hover:bg-slate-100 border-slate-300 text-slate-700 shadow-sm'
              }`}
            >
              <RotateCcw className={`w-4 h-4 ${isLoading ? 'animate-spin text-purple-500' : ''}`} />
            </button>
          </div>
        </div>

        {/* Detected Gaps Bridge Notice */}
        {detectedGaps && detectedGaps.length > 0 && (
          <div className={`mt-4 pt-3 border-t flex flex-wrap items-center gap-2 text-xs ${
            isDark ? 'border-slate-800 text-slate-400' : 'border-slate-200 text-slate-600'
          }`}>
            <span className="font-bold text-amber-500 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" />
              Tailored to Gaps:
            </span>
            {detectedGaps.slice(0, 4).map((gap, idx) => (
              <span 
                key={idx}
                className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                  isDark ? 'bg-amber-950/30 border-amber-500/30 text-amber-300' : 'bg-amber-50 border-amber-200 text-amber-800'
                }`}
              >
                {gap}
              </span>
            ))}
          </div>
        )}

        {/* Progress Bar (While In Progress) */}
        {!gradedResult && totalQuestions > 0 && (
          <div className="mt-5 space-y-1.5">
            <div className="flex justify-between text-xs font-bold">
              <span className={isDark ? 'text-slate-400' : 'text-slate-600'}>
                Progress: {answeredCount} of {totalQuestions} answered
              </span>
              <span className="text-purple-600 dark:text-purple-400">{progressPercent}%</span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
              <div 
                className="bg-purple-600 h-full rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* ERROR ALERT */}
      {errorMessage && (
        <div className={`p-4 rounded-2xl border flex items-center gap-3 text-xs font-medium ${
          isDark ? 'bg-rose-950/40 border-rose-500/40 text-rose-300' : 'bg-rose-50 border-rose-300 text-rose-900'
        }`}>
          <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* LOADING STATE */}
      {isLoading && (
        <div className={`p-12 rounded-3xl border text-center space-y-3 ${
          isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200'
        }`}>
          <BrainCircuit className="w-8 h-8 text-purple-600 animate-pulse mx-auto" />
          <h3 className={`text-base font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Synthesizing Hard Scenario Questions...
          </h3>
          <p className={`text-xs max-w-sm mx-auto font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Constructing realistic edge cases, code snippets, and diagnostic rubrics for {role}.
          </p>
        </div>
      )}

      {/* 2. GRADED SCORE CARD (AFTER EVALUATION) */}
      {gradedResult && (
        <div className={`p-6 sm:p-8 rounded-3xl border-2 space-y-5 shadow-lg ${
          gradedResult.passed
            ? (isDark ? 'bg-emerald-950/20 border-emerald-500/40' : 'bg-emerald-50 border-emerald-300')
            : (isDark ? 'bg-amber-950/20 border-amber-500/40' : 'bg-amber-50 border-amber-300')
        }`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Award className={`w-5 h-5 ${gradedResult.passed ? 'text-emerald-500' : 'text-amber-500'}`} />
                <span className="text-xs font-bold uppercase tracking-wider">
                  Assessment Evaluation Complete
                </span>
              </div>
              <h3 className={`text-2xl font-black mt-1 ${isDark ? 'text-white' : 'text-slate-950'}`}>
                {gradedResult.readinessTier || (gradedResult.passed ? 'Strong Candidate Readiness' : 'Needs Practice On Core Trade-Offs')}
              </h3>
              <p className={`text-xs mt-1 font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                Scored {gradedResult.correctCount} of {gradedResult.totalQuestions} questions correctly.
              </p>
            </div>

            <div className={`p-4 rounded-2xl border-2 text-center min-w-[140px] shrink-0 ${
              gradedResult.passed
                ? (isDark ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-300' : 'bg-white border-emerald-300 text-emerald-800 shadow-sm')
                : (isDark ? 'bg-amber-950/60 border-amber-500/50 text-amber-300' : 'bg-white border-amber-300 text-amber-800 shadow-sm')
            }`}>
              <span className="text-4xl font-black block tracking-tight">
                {gradedResult.scorePercent}%
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider block mt-0.5">
                {gradedResult.passed ? 'Interview Ready' : 'Focus On Gaps'}
              </span>
            </div>
          </div>

          {/* Knowledge Gaps Identified Banner */}
          {gradedResult.knowledgeGapsIdentified && gradedResult.knowledgeGapsIdentified.length > 0 && (
            <div className={`p-4 rounded-2xl border-2 space-y-2 ${
              isDark ? 'bg-slate-950/80 border-slate-800' : 'bg-white border-slate-300 shadow-xs'
            }`}>
              <div className="flex items-center gap-2 text-xs font-bold text-purple-600 dark:text-purple-400">
                <Layers className="w-4 h-4" />
                <span>Diagnosed Knowledge Gaps For Focused Revision:</span>
              </div>
              <ul className="space-y-1.5 text-xs font-medium">
                {gradedResult.knowledgeGapsIdentified.map((item, idx) => (
                  <li key={idx} className={`flex items-start gap-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    <span className="text-rose-500 font-bold">•</span>
                    <div>
                      <strong className={isDark ? 'text-slate-200' : 'text-slate-900'}>{item.category}:</strong> {item.gap}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={() => generateQuiz(difficulty, role)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-md cursor-pointer transition"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Retake Adaptive Quiz
            </button>
            <span className={`text-[11px] font-medium italic ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              Review architectural explanations below.
            </span>
          </div>
        </div>
      )}

      {/* 3. QUESTION LIST (BEFORE AND AFTER GRADING) */}
      {!isLoading && quizSession?.questions && quizSession.questions.length > 0 && (
        <div className="space-y-5">
          {quizSession.questions.map((q, qIdx) => {
            const evaluation = gradedResult?.questionEvaluations?.find(e => e.id === q.id);
            const isQuestionCorrect = evaluation?.isCorrect;
            const currentAnswer = userAnswers[q.id];

            return (
              <div 
                key={q.id}
                className={`p-6 rounded-2xl border-2 transition-all ${
                  evaluation
                    ? isQuestionCorrect
                      ? (isDark ? 'bg-emerald-950/15 border-emerald-500/40' : 'bg-emerald-50/50 border-emerald-300')
                      : (isDark ? 'bg-rose-950/15 border-rose-500/40' : 'bg-rose-50/50 border-rose-300')
                    : (isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-300 shadow-xs')
                }`}
              >
                {/* Question Header & Meta */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-purple-600/10 text-purple-600 dark:text-purple-400 border border-purple-500/30 font-mono">
                      Q{qIdx + 1}
                    </span>
                    <span className={`text-xs font-bold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                      {q.category}
                    </span>
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                      isDark ? 'bg-slate-800 border-slate-700 text-slate-400' : 'bg-slate-100 border-slate-300 text-slate-600'
                    }`}>
                      {q.type}
                    </span>
                  </div>

                  {evaluation && (
                    <div className="flex items-center gap-1.5 shrink-0">
                      {isQuestionCorrect ? (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                          <CheckCircle2 className="w-4 h-4" /> Correct
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-rose-600 dark:text-rose-400">
                          <XCircle className="w-4 h-4" /> Incorrect
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Scenario Context (If Any) */}
                {q.scenario && (
                  <div className={`p-3 rounded-xl border text-xs font-medium mb-3 leading-relaxed ${
                    isDark ? 'bg-slate-950 border-slate-800 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-700'
                  }`}>
                    <strong className="block text-[10px] uppercase tracking-wider text-purple-600 dark:text-purple-400 mb-0.5">
                      Engineering Scenario:
                    </strong>
                    {q.scenario}
                  </div>
                )}

                {/* Code Snippet (If Any) */}
                {q.codeSnippet && (
                  <div className="mb-3.5 rounded-xl overflow-hidden border border-slate-700/60">
                    <div className="bg-slate-950 px-3 py-1.5 border-b border-slate-800 flex items-center gap-1.5 text-[10px] font-mono text-slate-400">
                      <Code2 className="w-3.5 h-3.5 text-purple-400" />
                      <span>Code Inspection</span>
                    </div>
                    <pre className="p-3.5 bg-slate-950 text-slate-200 font-mono text-xs overflow-x-auto whitespace-pre leading-relaxed">
                      <code>{q.codeSnippet}</code>
                    </pre>
                  </div>
                )}

                {/* Question Prompt */}
                <h4 className={`text-sm sm:text-base font-bold mb-3 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  {q.question}
                </h4>

                {/* Question Inputs: Multi-Choice vs Short Answer */}
                {q.type === 'short-answer' ? (
                  <div className="space-y-2">
                    <textarea
                      rows={3}
                      value={currentAnswer || ''}
                      onChange={(e) => handleShortAnswerChange(q.id, e.target.value)}
                      disabled={Boolean(evaluation) || isGrading}
                      placeholder="Type your technical analysis here (2-3 concise sentences explaining the trade-offs)..."
                      className={`w-full p-3 rounded-xl border-2 text-xs font-medium transition resize-none focus:outline-none focus:border-purple-500 ${
                        isDark 
                          ? 'bg-slate-950 border-slate-800 text-slate-200 placeholder-slate-600' 
                          : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400'
                      }`}
                    />
                    <div className="flex justify-between text-[10px] font-mono text-slate-400">
                      <span>Evaluated server-side against architectural rubrics</span>
                      <span>{(currentAnswer || '').length} characters</span>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {q.options?.map((opt, optIdx) => {
                      const isMulti = q.type === 'multi-select';
                      const isSelected = isMulti 
                        ? Array.isArray(currentAnswer) && currentAnswer.includes(optIdx)
                        : currentAnswer === optIdx;

                      // Evaluation styling
                      let optionBadgeClass = '';
                      if (evaluation) {
                        const isCorrectOption = isMulti 
                          ? (evaluation.correctAnswerIndices || []).includes(optIdx)
                          : evaluation.correctAnswer === optIdx;

                        if (isCorrectOption) {
                          optionBadgeClass = isDark ? 'border-emerald-500 bg-emerald-950/40 text-emerald-200' : 'border-emerald-500 bg-emerald-50 text-emerald-950';
                        } else if (isSelected && !isCorrectOption) {
                          optionBadgeClass = isDark ? 'border-rose-500 bg-rose-950/40 text-rose-200' : 'border-rose-500 bg-rose-50 text-rose-950';
                        }
                      }

                      return (
                        <div
                          key={optIdx}
                          onClick={() => {
                            if (isMulti) handleMultiSelect(q.id, optIdx);
                            else handleSingleSelect(q.id, optIdx);
                          }}
                          className={`p-3 rounded-xl border-2 text-xs font-medium cursor-pointer transition flex items-start gap-3 select-none ${
                            optionBadgeClass || (isSelected
                              ? (isDark ? 'border-purple-500 bg-purple-950/30 text-white' : 'border-purple-600 bg-purple-50 text-purple-950 shadow-xs')
                              : (isDark ? 'border-slate-800 hover:border-slate-700 bg-slate-950/50 text-slate-300' : 'border-slate-300 hover:border-purple-300 bg-white text-slate-800 shadow-xs'))
                          }`}
                        >
                          <div className={`mt-0.5 w-4 h-4 rounded-${isMulti ? 'md' : 'full'} border-2 flex items-center justify-center shrink-0 transition ${
                            isSelected
                              ? 'border-purple-600 bg-purple-600 text-white'
                              : (isDark ? 'border-slate-700 bg-slate-900' : 'border-slate-400 bg-white')
                          }`}>
                            {isSelected && <Check className="w-3 h-3 text-white" />}
                          </div>

                          <div className="flex-1 leading-relaxed">
                            {opt}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* 4. POST-GRADE ARCHITECTURAL EXPLANATION */}
                {evaluation && (
                  <div className={`mt-4 pt-3.5 border-t-2 space-y-2 text-xs animate-fadeIn ${
                    isDark ? 'border-slate-800' : 'border-slate-200'
                  }`}>
                    <div className={`p-3 rounded-xl border ${
                      isDark ? 'bg-purple-950/20 border-purple-900/30 text-purple-200' : 'bg-purple-50 border-purple-200 text-purple-950'
                    }`}>
                      <strong className="block text-[11px] font-bold text-purple-600 dark:text-purple-400 mb-1">
                        Architectural Rationale & Deep Dive:
                      </strong>
                      <p className="leading-relaxed font-medium">
                        {evaluation.explanation}
                      </p>
                    </div>

                    {evaluation.knowledgeGap && (
                      <div className={`p-2.5 rounded-lg border text-[11px] font-medium flex items-start gap-2 ${
                        isDark ? 'bg-slate-950 border-slate-800 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-700'
                      }`}>
                        <Terminal className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                        <span>
                          <strong>Core Diagnostic:</strong> {evaluation.knowledgeGap}
                        </span>
                      </div>
                    )}
                  </div>
                )}

              </div>
            );
          })}

          {/* SUBMIT BUTTON */}
          {!gradedResult && (
            <div className={`p-4 rounded-2xl border-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
              isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-300 shadow-sm'
            }`}>
              <div className="text-xs font-medium">
                <span className={isDark ? 'text-slate-300' : 'text-slate-700'}>
                  Ready to test your screening readiness?
                </span>
                <span className="block text-[11px] text-slate-500 mt-0.5">
                  Submissions are graded securely against server-side architectural rubrics.
                </span>
              </div>

              <button
                onClick={handleSubmitQuiz}
                disabled={isGrading || answeredCount === 0}
                className={`inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-xs font-extrabold transition shadow-md cursor-pointer ${
                  isGrading || answeredCount === 0
                    ? 'opacity-50 cursor-not-allowed bg-slate-500 text-white'
                    : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-purple-600/30'
                }`}
              >
                {isGrading ? (
                  <>
                    <BrainCircuit className="w-4 h-4 animate-spin" />
                    <span>Grading with Server Rubrics...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Submit Assessment ({answeredCount}/{totalQuestions})</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* DISCLAIMER FOOTER */}
          <div className="text-center text-[11px] font-medium text-slate-500 dark:text-slate-500 pt-2 pb-4">
            {quizSession.disclaimer || 'Generated practice assessment for technical interview preparation — not an officially validated certification exam.'}
          </div>
        </div>
      )}

    </div>
  );
}
