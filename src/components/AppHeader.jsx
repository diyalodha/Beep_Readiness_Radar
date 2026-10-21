import React, { useState, useEffect } from 'react';
import { 
  Menu, X, Sun, Moon, LogOut, Target, FileText, 
  Zap, HelpCircle, MessageSquare, Briefcase, BarChart3,
  CheckCircle2, ChevronDown
} from 'lucide-react';

export default function AppHeader({
  activeTab = 'matcher',
  setActiveTab,
  theme,
  toggleTheme,
  user,
  onLogout,
  applicationsCount = 0,
  _hasResult = false
}) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const isDark = theme === 'dark';

  // Close menu on Escape key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isMenuOpen) {
        setIsMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMenuOpen]);

  const navItems = [
    {
      id: 'matcher',
      label: 'JD Matcher',
      shortLabel: 'Matcher',
      icon: Target,
      desc: 'Select or paste an internship to audit alignment'
    },
    {
      id: 'resume',
      label: 'Resume Parser',
      shortLabel: 'Resume',
      icon: FileText,
      desc: 'PDF/DOCX client-side parsing & native preview'
    },
    {
      id: 'roadmap',
      label: '48h Roadmap',
      shortLabel: '48h Project',
      icon: Zap,
      desc: 'Weekend proof project, Google XYZ & README'
    },
    {
      id: 'interview',
      label: 'Interview Prep',
      shortLabel: 'Interview',
      icon: MessageSquare,
      desc: 'Screening questions, STAR answers & cold outreach'
    },
    {
      id: 'quiz',
      label: 'Tech Quiz',
      shortLabel: 'Quiz',
      icon: HelpCircle,
      desc: '5-question adaptive CS & system assessment'
    },
    {
      id: 'applications',
      label: 'Applications',
      shortLabel: 'Jobs',
      icon: Briefcase,
      desc: 'SQLite persistent tracking & submission slips',
      badge: applicationsCount > 0 ? String(applicationsCount) : null
    },
    {
      id: 'analytics',
      label: 'Placement Stats',
      shortLabel: 'Stats',
      icon: BarChart3,
      desc: 'Readiness metrics & illustrative 2026 guidelines'
    }
  ];

  const handleSelectTab = (id) => {
    setActiveTab(id);
    setIsMenuOpen(false);
  };

  const userInitial = user?.name ? user.name.charAt(0).toUpperCase() : 'S';

  return (
    <>
      <header className={`sticky top-0 z-40 border-b backdrop-blur-md transition-colors duration-200 ${
        isDark 
          ? 'bg-slate-950/90 border-slate-800 text-white' 
          : 'bg-white/95 border-slate-300 text-slate-900 shadow-xs'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex items-center justify-between gap-3">
          
          {/* Left: Brand Logo & Name + 3-Lines Features Button */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Brand Logo & Name */}
            <div 
              className="flex items-center gap-2.5 cursor-pointer select-none" 
              onClick={() => handleSelectTab('matcher')}
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white font-black text-base shadow-md shadow-purple-600/30">
                B
              </div>
              <div className="leading-tight">
                <div className="flex items-center gap-1.5">
                  <span className={`font-black text-base sm:text-lg tracking-tight ${
                    isDark ? 'text-white' : 'text-slate-950 font-black'
                  }`}>
                    EventBeep
                  </span>
                  <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border tracking-wide uppercase ${
                    isDark 
                      ? 'bg-purple-950/60 border-purple-500/50 text-purple-300' 
                      : 'bg-purple-100 border-purple-300 text-purple-900 shadow-2xs'
                  }`}>
                    Founder's Office
                  </span>
                </div>
                <p className={`text-[10px] font-semibold ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  Internship Readiness Radar
                </p>
              </div>
            </div>

            {/* 3-Lines Features Menu Trigger Button */}
            <button
              onClick={() => setIsMenuOpen(prev => !prev)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                isMenuOpen
                  ? (isDark 
                      ? 'bg-purple-600 text-white border-purple-500 shadow-md shadow-purple-600/30' 
                      : 'bg-purple-600 text-white border-purple-600 shadow-md shadow-purple-600/30')
                  : (isDark 
                      ? 'bg-slate-900 border-slate-700 text-slate-200 hover:bg-slate-800 hover:text-white' 
                      : 'bg-slate-100 border-slate-300 text-slate-800 hover:bg-slate-200 shadow-2xs')
              }`}
              title="Open full features navigation menu"
              aria-label="Features menu"
            >
              {isMenuOpen ? <X className="w-4 h-4 text-white" /> : <Menu className="w-4 h-4 text-purple-500 dark:text-purple-400" />}
              <span className="hidden sm:inline">Features</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 hidden sm:inline ${isMenuOpen ? 'rotate-180' : ''}`} />
            </button>
          </div>

          {/* Center: Desktop Feature Pills */}
          <nav className="hidden lg:flex items-center gap-1 overflow-x-auto py-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => handleSelectTab(item.id)}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                    isActive
                      ? (isDark 
                          ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30 border border-purple-500' 
                          : 'bg-purple-600 text-white shadow-md shadow-purple-600/30 border border-purple-600')
                      : (isDark
                          ? 'text-slate-300 hover:text-white hover:bg-slate-900 border border-transparent'
                          : 'text-slate-700 hover:text-slate-950 hover:bg-slate-100 border border-transparent')
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{item.shortLabel}</span>
                  {item.badge && (
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                      isActive ? 'bg-white text-purple-700 font-extrabold' : 'bg-purple-100 text-purple-900 dark:bg-purple-950 dark:text-purple-300 font-extrabold'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right: Theme Toggle + User Badge + Sign Out */}
          <div className="flex items-center gap-2 shrink-0">
            
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-xl border transition-all cursor-pointer ${
                isDark 
                  ? 'bg-slate-900 border-slate-700 text-amber-400 hover:bg-slate-800' 
                  : 'bg-slate-100 border-slate-300 text-slate-800 hover:bg-slate-200 shadow-2xs'
              }`}
              title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* User Profile Pill */}
            {user && (
              <div className={`hidden sm:flex items-center gap-2 px-2.5 py-1.5 rounded-xl border ${
                isDark ? 'bg-slate-900 border-slate-700 text-slate-200' : 'bg-slate-100 border-slate-300 text-slate-800 shadow-2xs'
              }`}>
                <div className="w-6 h-6 rounded-full bg-purple-600 text-white text-xs font-black flex items-center justify-center">
                  {userInitial}
                </div>
                <div className="text-left leading-tight">
                  <span className="text-xs font-bold block truncate max-w-[100px]">
                    {user?.name ? user.name.split(' ')[0] : 'Student'}
                  </span>
                </div>
              </div>
            )}

            {/* Logout Button */}
            <button
              onClick={onLogout}
              className={`p-2 rounded-xl border transition-all cursor-pointer ${
                isDark 
                  ? 'hover:bg-rose-950/40 border-slate-700 text-slate-400 hover:text-rose-400 hover:border-rose-800' 
                  : 'hover:bg-rose-50 border-slate-300 text-slate-700 hover:text-rose-600 hover:border-rose-300'
              }`}
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>

          </div>

        </div>
      </header>

      {/* "3 Lines" Full Feature Navigation Drawer / Dropdown */}
      {isMenuOpen && (
        <div 
          className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/60 backdrop-blur-sm animate-fadeIn flex items-start justify-center p-4 sm:p-6"
          onClick={() => setIsMenuOpen(false)}
        >
          <div 
            className={`w-full max-w-4xl rounded-3xl border shadow-2xl p-6 transition-all my-auto ${
              isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drawer Header */}
            <div className="flex items-center justify-between pb-4 border-b border-inherit/40 mb-5">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-purple-600 flex items-center justify-center text-white font-bold text-sm">
                  B
                </div>
                <div>
                  <h3 className="font-extrabold text-base">EventBeep Features & Platform Tools</h3>
                  <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                    Select any capability to instantly update your view and centralized diagnostic hero.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsMenuOpen(false)}
                className={`p-2 rounded-xl border cursor-pointer ${
                  isDark ? 'bg-slate-800 border-slate-700 text-slate-300' : 'bg-slate-100 border-slate-300 text-slate-700'
                }`}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Grid of All 7 Features */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;

                return (
                  <div
                    key={item.id}
                    onClick={() => handleSelectTab(item.id)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                      isActive
                        ? (isDark ? 'bg-purple-950/40 border-purple-500 ring-2 ring-purple-500/30' : 'bg-purple-50 border-purple-500 ring-2 ring-purple-400/40 shadow-sm')
                        : (isDark ? 'bg-slate-950/50 border-slate-800 hover:border-slate-700' : 'bg-white border-slate-300 hover:border-purple-300 shadow-2xs hover:shadow-sm')
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center border ${
                          isActive 
                            ? 'bg-purple-600 text-white border-purple-500' 
                            : 'bg-purple-600/10 text-purple-600 dark:text-purple-400 border-purple-500/20'
                        }`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        {isActive && (
                          <span className="text-[10px] font-bold text-purple-600 dark:text-purple-400 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            Active
                          </span>
                        )}
                      </div>

                      <h4 className={`text-xs font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        {item.label}
                      </h4>
                      <p className={`text-[11px] mt-1 leading-snug ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                        {item.desc}
                      </p>
                    </div>

                    <div className="mt-3 pt-2 border-t border-inherit/20 text-[10px] font-bold text-purple-600 dark:text-purple-400 flex items-center justify-between">
                      <span>Launch Feature</span>
                      <span>→</span>
                    </div>
                  </div>
                );
              })}
            </div>

          </div>
        </div>
      )}
    </>
  );
}
