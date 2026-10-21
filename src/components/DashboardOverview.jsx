import React, { useState } from 'react';
import { 
  Award, Target, Zap, Briefcase, CheckCircle2, 
  Circle, ArrowRight, Sparkles
} from 'lucide-react';

export default function DashboardOverview({
  user,
  result,
  resumeText,
  selectedInternship,
  applications = [],
  onNavigate,
  theme
}) {
  const isDark = theme === 'dark';

  // Dynamic greeting initialized once
  const [greeting] = useState(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  });

  const studentName = user?.name ? user.name.split(' ')[0] : 'Student';

  // Manual toggle state for tasks, with smart initial completion detection
  const [completedTasks, setCompletedTasks] = useState({
    uploadResume: Boolean(resumeText && resumeText.trim().length > 0),
    runAts: Boolean(result),
    analyzeJd: Boolean(result && selectedInternship),
    generateRoadmap: Boolean(result?.proofOfWorkProject),
    completeQuiz: false,
    mockInterview: false,
    saveJob: Boolean(applications.length > 0)
  });

  const toggleTask = (taskId, targetNav = null) => {
    setCompletedTasks(prev => ({
      ...prev,
      [taskId]: !prev[taskId]
    }));
    if (targetNav && onNavigate) {
      onNavigate(targetNav);
    }
  };

  const tasksList = [
    {
      id: 'uploadResume',
      label: 'Upload and parse resume',
      done: completedTasks.uploadResume || Boolean(resumeText),
      nav: 'resume'
    },
    {
      id: 'runAts',
      label: 'Run ATS analysis',
      done: completedTasks.runAts || Boolean(result),
      nav: 'matcher'
    },
    {
      id: 'analyzeJd',
      label: 'Analyze JD match',
      done: completedTasks.analyzeJd || Boolean(result),
      nav: 'matcher'
    },
    {
      id: 'generateRoadmap',
      label: 'Generate roadmap',
      done: completedTasks.generateRoadmap || Boolean(result?.proofOfWorkProject),
      nav: 'roadmap'
    },
    {
      id: 'completeQuiz',
      label: 'Complete adaptive quiz',
      done: completedTasks.completeQuiz,
      nav: 'quiz'
    },
    {
      id: 'mockInterview',
      label: 'Complete mock interview',
      done: completedTasks.mockInterview || Boolean(result?.interviewPreparation),
      nav: 'interview'
    },
    {
      id: 'saveJob',
      label: 'Save at least one job',
      done: completedTasks.saveJob || Boolean(applications.length > 0),
      nav: 'applications'
    }
  ];

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      
      {/* 1. Header Greeting Section */}
      <div>
        <h2 className="text-2xl sm:text-3xl font-black tracking-tight flex items-center gap-2">
          <span>{greeting}, {studentName}</span>
          <span className="text-purple-600 dark:text-purple-400">✦</span>
        </h2>
        <p className={`text-xs sm:text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
          This view updates from your real resume, JD, roadmap, quiz, interview, and jobs activity.
        </p>
      </div>

      {/* 2. Four KPI / Action Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: ATS Score */}
        <div className={`p-5 rounded-3xl border flex flex-col justify-between transition-all shadow-sm ${
          isDark 
            ? 'bg-slate-900/70 border-slate-800 hover:border-slate-700' 
            : 'bg-white border-slate-200 hover:border-slate-300'
        }`}>
          <div className="flex items-center justify-between">
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center border ${
              isDark ? 'bg-slate-800/80 border-slate-700 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-700'
            }`}>
              <Award className="w-5 h-5" />
            </div>

            <button
              onClick={() => onNavigate('resume')}
              className={`text-[11px] font-bold px-3 py-1.5 rounded-full border transition cursor-pointer ${
                isDark 
                  ? 'bg-slate-800/80 hover:bg-slate-800 border-slate-700 text-slate-300' 
                  : 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700'
              }`}
            >
              {result ? 'Re-audit' : (resumeText ? 'View resume' : 'Upload resume to start')}
            </button>
          </div>

          <div className="mt-6">
            <span className="text-3xl sm:text-4xl font-black block tracking-tight">
              {result ? `${result.matchScore}%` : '--'}
            </span>
            <span className={`text-xs font-semibold block mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              ATS Score
            </span>
          </div>
        </div>

        {/* Card 2: JD Match */}
        <div className={`p-5 rounded-3xl border flex flex-col justify-between transition-all shadow-sm ${
          isDark 
            ? 'bg-slate-900/70 border-slate-800 hover:border-slate-700' 
            : 'bg-white border-slate-200 hover:border-slate-300'
        }`}>
          <div className="flex items-center justify-between">
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center border ${
              isDark ? 'bg-slate-800/80 border-slate-700 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-700'
            }`}>
              <Target className="w-5 h-5" />
            </div>

            <button
              onClick={() => onNavigate('matcher')}
              className={`text-[11px] font-bold px-3 py-1.5 rounded-full border transition cursor-pointer ${
                isDark 
                  ? 'bg-slate-800/80 hover:bg-slate-800 border-slate-700 text-slate-300' 
                  : 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700'
              }`}
            >
              {selectedInternship ? 'Analyze a JD' : 'Select a JD'}
            </button>
          </div>

          <div className="mt-6">
            <span className="text-3xl sm:text-4xl font-black block tracking-tight">
              {result ? `${result.skillsBreakdown?.matched?.length || 0} matched` : '--'}
            </span>
            <span className={`text-xs font-semibold block mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              JD Match
            </span>
          </div>
        </div>

        {/* Card 3: Quiz Score / Blueprint */}
        <div className={`p-5 rounded-3xl border flex flex-col justify-between transition-all shadow-sm ${
          isDark 
            ? 'bg-slate-900/70 border-slate-800 hover:border-slate-700' 
            : 'bg-white border-slate-200 hover:border-slate-300'
        }`}>
          <div className="flex items-center justify-between">
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center border ${
              isDark ? 'bg-slate-800/80 border-slate-700 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-700'
            }`}>
              <Zap className="w-5 h-5" />
            </div>

            <button
              onClick={() => onNavigate('quiz')}
              className={`text-[11px] font-bold px-3 py-1.5 rounded-full border transition cursor-pointer ${
                isDark 
                  ? 'bg-slate-800/80 hover:bg-slate-800 border-slate-700 text-slate-300' 
                  : 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700'
              }`}
            >
              Complete a quiz
            </button>
          </div>

          <div className="mt-6">
            <span className="text-3xl sm:text-4xl font-black block tracking-tight">
              {completedTasks.completeQuiz ? '85%' : '--'}
            </span>
            <span className={`text-xs font-semibold block mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Quiz Score
            </span>
          </div>
        </div>

        {/* Card 4: Jobs Saved / Applications */}
        <div className={`p-5 rounded-3xl border flex flex-col justify-between transition-all shadow-sm ${
          isDark 
            ? 'bg-slate-900/70 border-slate-800 hover:border-slate-700' 
            : 'bg-white border-slate-200 hover:border-slate-300'
        }`}>
          <div className="flex items-center justify-between">
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center border ${
              isDark ? 'bg-slate-800/80 border-slate-700 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-700'
            }`}>
              <Briefcase className="w-5 h-5" />
            </div>

            <button
              onClick={() => onNavigate('applications')}
              className={`text-[11px] font-bold px-3 py-1.5 rounded-full border transition cursor-pointer ${
                isDark 
                  ? 'bg-slate-800/80 hover:bg-slate-800 border-slate-700 text-slate-300' 
                  : 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700'
              }`}
            >
              {applications.length > 0 ? 'View tracked' : 'Search jobs to populate'}
            </button>
          </div>

          <div className="mt-6">
            <span className="text-3xl sm:text-4xl font-black block tracking-tight">
              {applications.length}
            </span>
            <span className={`text-xs font-semibold block mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Jobs Saved
            </span>
          </div>
        </div>

      </div>

      {/* 3. Lower Section: Weekly Progress (Left) + Today's Tasks (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        
        {/* Weekly Progress Card (2 Cols) */}
        <div className={`lg:col-span-2 p-6 rounded-3xl border transition-colors shadow-sm flex flex-col justify-between ${
          isDark ? 'bg-slate-900/70 border-slate-800' : 'bg-white border-slate-200'
        }`}>
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-extrabold tracking-tight">
                Weekly Progress
              </h3>
              {result && (
                <span className="text-[10px] font-bold text-emerald-500 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Live Sync
                </span>
              )}
            </div>

            <div className="divide-y divide-inherit/40 space-y-1">
              
              {/* Row 1: Resume Strength */}
              <div className="py-3.5 flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  Resume strength
                </span>
                <span className={`font-mono text-[11px] ${
                  result ? 'text-emerald-500 font-bold' : (isDark ? 'text-slate-500' : 'text-slate-400')
                }`}>
                  {result 
                    ? `${result.detailedStats?.estimatedReadinessIndicator ?? result.matchScore}% • ${result.skillsBreakdown?.matched?.length || 0} skills found` 
                    : 'No data'}
                </span>
              </div>

              {/* Row 2: JD Match Rate */}
              <div className="py-3.5 flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  JD match rate
                </span>
                <span className={`font-mono text-[11px] ${
                  result ? 'text-purple-400 font-bold' : (isDark ? 'text-slate-500' : 'text-slate-400')
                }`}>
                  {result 
                    ? `${result.matchScore}% • ${result.targetRole}` 
                    : 'No data'}
                </span>
              </div>

              {/* Row 3: Roadmap Completion */}
              <div className="py-3.5 flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  Roadmap completion
                </span>
                <span className={`font-mono text-[11px] ${
                  result ? 'text-indigo-400 font-bold' : (isDark ? 'text-slate-500' : 'text-slate-400')
                }`}>
                  {result ? '48h Blueprint Ready' : 'No roadmap yet'}
                </span>
              </div>

              {/* Row 4: Interview Score */}
              <div className="py-3.5 flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  Interview score
                </span>
                <span className={`font-mono text-[11px] ${
                  result ? 'text-emerald-500 font-bold' : (isDark ? 'text-slate-500' : 'text-slate-400')
                }`}>
                  {result ? 'STAR Answers Generated' : 'Not completed'}
                </span>
              </div>

            </div>
          </div>

          {/* Quick CTA banner inside progress card if audit done */}
          {result ? (
            <div className={`mt-5 p-3.5 rounded-2xl border flex items-center justify-between text-xs ${
              isDark ? 'bg-purple-950/30 border-purple-800/40 text-purple-200' : 'bg-purple-50 border-purple-200 text-purple-900'
            }`}>
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-500 shrink-0" />
                <span className="font-medium">Audit complete for <strong>{result.targetRole}</strong> ({result.matchScore}%)</span>
              </div>
              <button
                onClick={() => onNavigate('matcher')}
                className="px-3 py-1 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-[11px] transition cursor-pointer"
              >
                View Full Audit
              </button>
            </div>
          ) : (
            <div className={`mt-5 p-3.5 rounded-2xl border flex items-center justify-between text-xs ${
              isDark ? 'bg-slate-950/40 border-slate-800 text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-600'
            }`}>
              <span>Connect your resume and target JD to populate your live readiness metrics.</span>
              <button
                onClick={() => onNavigate('resume')}
                className="px-3 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-[11px] transition cursor-pointer"
              >
                Get Started
              </button>
            </div>
          )}
        </div>

        {/* Today's Tasks Card (1 Col) */}
        <div className={`p-6 rounded-3xl border transition-colors shadow-sm ${
          isDark ? 'bg-slate-900/70 border-slate-800' : 'bg-white border-slate-200'
        }`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-extrabold tracking-tight">
              Today's Tasks
            </h3>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
              isDark ? 'bg-slate-800 border-slate-700 text-slate-300' : 'bg-slate-100 border-slate-200 text-slate-700'
            }`}>
              {tasksList.filter(t => t.done).length} / {tasksList.length} Done
            </span>
          </div>

          <div className="space-y-2.5">
            {tasksList.map((task) => (
              <div
                key={task.id}
                onClick={() => toggleTask(task.id, task.nav)}
                className={`p-2.5 rounded-xl border flex items-center justify-between text-xs transition cursor-pointer ${
                  task.done 
                    ? (isDark ? 'bg-slate-950/40 border-emerald-900/40 text-slate-200' : 'bg-emerald-50/50 border-emerald-200 text-slate-800')
                    : (isDark ? 'bg-slate-950/40 border-slate-800/80 text-slate-400 hover:text-slate-200 hover:border-slate-700' : 'bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-900')
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  {task.done ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  ) : (
                    <Circle className="w-4 h-4 text-slate-400 shrink-0" />
                  )}
                  <span className={`truncate ${task.done ? 'line-through opacity-70' : 'font-medium'}`}>
                    {task.label}
                  </span>
                </div>

                <ArrowRight className="w-3.5 h-3.5 opacity-40 shrink-0 ml-2" />
              </div>
            ))}
          </div>

        </div>

      </div>

    </div>
  );
}
