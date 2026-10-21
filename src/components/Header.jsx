import React, { useState } from 'react';
import { 
  HelpCircle, Info, Sun, Moon, LogOut, Briefcase, 
  BarChart3, Zap, FileText, Target, GitFork, MessageSquare 
} from 'lucide-react';

export default function Header({ 
  apiStatus, 
  user, 
  onLogout, 
  theme, 
  toggleTheme, 
  applicationsCount = 0, 
  onOpenApplications,
  onOpenStats,
  onNavigateSection,
  activeSection = 'matcher'
}) {
  const [showInfo, setShowInfo] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const isDark = theme === 'dark';

  return (
    <header className={`border-b sticky top-0 z-50 backdrop-blur-md transition-colors duration-200 ${
      isDark ? 'border-slate-800 bg-slate-950/85' : 'border-slate-200/90 bg-white/95 shadow-xs'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4">
        
        {/* Left: Brand Logo & Title */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-pink-500 flex items-center justify-center shadow-md shadow-purple-500/20 text-white font-black text-lg tracking-tight shrink-0">
            B
          </div>
          <div className="leading-tight">
            <div className="flex items-center gap-2">
              <span className={`font-black text-base sm:text-lg tracking-tight ${
                isDark ? 'text-white' : 'text-slate-950'
              }`}>
                EventBeep
              </span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                isDark
                  ? 'bg-purple-950/60 border-purple-500/40 text-purple-300'
                  : 'bg-purple-50 border-purple-200 text-purple-800 font-bold'
              }`}>
                Radar
              </span>
            </div>
            <p className={`text-[10px] font-semibold tracking-wide ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              Founder’s Office Discovery Platform
            </p>
          </div>
        </div>

        {/* Center: Quick Feature Navigation Pills (Hidden on small mobile, visible on tablet/desktop) */}
        {onNavigateSection && (
          <nav className="hidden lg:flex items-center gap-1 bg-slate-100/80 dark:bg-slate-900/80 p-1 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs font-bold">
            <button
              onClick={() => onNavigateSection('matcher')}
              className={`px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 cursor-pointer ${
                activeSection === 'matcher'
                  ? (isDark ? 'bg-slate-800 text-white shadow-xs' : 'bg-white text-slate-900 shadow-xs')
                  : (isDark ? 'text-slate-400 hover:text-slate-200' : 'text-slate-600 hover:text-slate-900')
              }`}
            >
              <Target className="w-3.5 h-3.5 text-purple-500" />
              <span>Roles & Matcher</span>
            </button>

            <button
              onClick={() => onNavigateSection('resume')}
              className={`px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 cursor-pointer ${
                activeSection === 'resume'
                  ? (isDark ? 'bg-slate-800 text-white shadow-xs' : 'bg-white text-slate-900 shadow-xs')
                  : (isDark ? 'text-slate-400 hover:text-slate-200' : 'text-slate-600 hover:text-slate-900')
              }`}
            >
              <FileText className="w-3.5 h-3.5 text-indigo-500" />
              <span>Resume Parser</span>
            </button>

            <button
              onClick={() => onNavigateSection('roadmap')}
              className={`px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 cursor-pointer ${
                activeSection === 'roadmap'
                  ? (isDark ? 'bg-slate-800 text-white shadow-xs' : 'bg-white text-slate-900 shadow-xs')
                  : (isDark ? 'text-slate-400 hover:text-slate-200' : 'text-slate-600 hover:text-slate-900')
              }`}
            >
              <GitFork className="w-3.5 h-3.5 text-pink-500" />
              <span>48h Blueprint</span>
            </button>

            <button
              onClick={() => onNavigateSection('interview')}
              className={`px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 cursor-pointer ${
                activeSection === 'interview'
                  ? (isDark ? 'bg-slate-800 text-white shadow-xs' : 'bg-white text-slate-900 shadow-xs')
                  : (isDark ? 'text-slate-400 hover:text-slate-200' : 'text-slate-600 hover:text-slate-900')
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5 text-emerald-500" />
              <span>Interview STAR</span>
            </button>

            <button
              onClick={() => onNavigateSection('quiz')}
              className={`px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 cursor-pointer ${
                activeSection === 'quiz'
                  ? (isDark ? 'bg-slate-800 text-white shadow-xs' : 'bg-white text-slate-900 shadow-xs')
                  : (isDark ? 'text-slate-400 hover:text-slate-200' : 'text-slate-600 hover:text-slate-900')
              }`}
            >
              <Zap className="w-3.5 h-3.5 text-amber-500" />
              <span>CS Quiz</span>
            </button>
          </nav>
        )}

        {/* Right Actions: Applications, Stats, Theme, User Menu */}
        <div className="flex items-center gap-2">
          
          {/* Applications Tracker Pill */}
          {user && (
            <button
              onClick={onOpenApplications}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition cursor-pointer ${
                isDark
                  ? 'bg-purple-950/40 hover:bg-purple-900/50 border-purple-500/40 text-purple-200 shadow-xs'
                  : 'bg-purple-50 hover:bg-purple-100/80 border-purple-200 text-purple-900 shadow-xs'
              }`}
              title="View all your submitted internship applications"
            >
              <Briefcase className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
              <span className="hidden sm:inline">Applications</span>
              {applicationsCount > 0 && (
                <span className="w-4 h-4 rounded-full bg-purple-600 text-white text-[10px] font-bold flex items-center justify-center">
                  {applicationsCount}
                </span>
              )}
            </button>
          )}

          {/* Placement Stats Button */}
          {onOpenStats && (
            <button
              onClick={onOpenStats}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition cursor-pointer ${
                isDark
                  ? 'bg-slate-900 hover:bg-slate-800 border-slate-700 text-slate-200'
                  : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-800 shadow-xs'
              }`}
              title="View Placement & Candidate Analytics"
            >
              <BarChart3 className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
              <span className="hidden md:inline">Analytics</span>
            </button>
          )}

          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className={`p-2 rounded-xl border transition-all cursor-pointer ${
              isDark 
                ? 'bg-slate-900 border-slate-700 text-amber-400 hover:bg-slate-800' 
                : 'bg-white border-slate-200 text-slate-800 hover:bg-slate-100 shadow-xs'
            }`}
            title={isDark ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Engine Status Indicator */}
          <div 
            onClick={() => setShowInfo(!showInfo)}
            className={`cursor-pointer group flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-bold border transition-all ${
              apiStatus?.aiEnabled 
                ? (isDark ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300' : 'bg-emerald-50 border-emerald-300 text-emerald-800')
                : (isDark ? 'bg-amber-950/50 border-amber-500/40 text-amber-300' : 'bg-amber-50 border-amber-300 text-amber-900')
            }`}
            title="Click for Engine details"
          >
            <span className={`w-2 h-2 rounded-full animate-pulse ${apiStatus?.aiEnabled ? 'bg-emerald-500' : 'bg-amber-500'}`} />
            <span className="hidden xl:inline">
              {apiStatus?.aiEnabled ? 'Live AI' : 'Heuristic Engine'}
            </span>
            <HelpCircle className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100" />
          </div>

          {/* User Profile & Sign Out Dropdown */}
          {user && (
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className={`flex items-center gap-2 p-1.5 pl-2.5 rounded-full border transition cursor-pointer ${
                  isDark
                    ? 'border-slate-700 bg-slate-900 hover:bg-slate-800 text-slate-100'
                    : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-900 shadow-xs'
                }`}
              >
                <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-600 text-white font-black text-xs flex items-center justify-center">
                  {user.name ? user.name.charAt(0).toUpperCase() : 'S'}
                </div>
                <span className="text-xs font-bold hidden sm:inline max-w-[100px] truncate">
                  {user.name ? user.name.split(' ')[0] : 'Student'}
                </span>
              </button>

              {/* User Dropdown */}
              {showUserMenu && (
                <div className={`absolute right-0 mt-2 w-64 rounded-2xl border shadow-xl p-3 z-50 animate-fadeIn ${
                  isDark ? 'bg-slate-900 border-slate-700 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
                }`}>
                  <div className="pb-2.5 border-b border-inherit/40">
                    <p className="text-xs font-extrabold">{user.name || 'Candidate'}</p>
                    <p className={`text-[11px] truncate mt-0.5 font-medium ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                      {user.email}
                    </p>
                    <p className={`text-[10px] mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      {user.college || 'Registered Student'} {user.graduationYear ? `• ${user.graduationYear}` : ''}
                    </p>
                  </div>

                  <div className="pt-2">
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        onLogout();
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-rose-500 hover:bg-rose-500/10 transition cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

        </div>

      </div>

      {/* Engine Info Dropdown Modal */}
      {showInfo && (
        <div className={`border-t px-4 py-3 text-xs flex items-center justify-between animate-fadeIn ${
          isDark ? 'border-slate-800 bg-slate-900/90 text-slate-200' : 'border-slate-200 bg-purple-50/90 text-purple-950 font-medium'
        }`}>
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0" />
            <span>
              <strong>Active Engine:</strong> {apiStatus?.engine || 'Deterministic Heuristic (Token-Aware Boundary Regex)'}
            </span>
          </div>
          <button
            onClick={() => setShowInfo(false)}
            className="text-[11px] font-bold underline hover:opacity-80 cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}
    </header>
  );
}
