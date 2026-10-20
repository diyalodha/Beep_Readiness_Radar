import React from 'react';
import { 
  LayoutDashboard, FileText, Search, GitFork, 
  HelpCircle, MessageSquare, Briefcase, BarChart3, 
  Sparkles, LogOut, X
} from 'lucide-react';

export default function Sidebar({
  activeTab = 'overview',
  setActiveTab,
  theme,
  user,
  onLogout,
  applicationsCount = 0,
  hasAuditResult = false,
  isOpenMobile = false,
  onCloseMobile
}) {
  const isDark = theme === 'dark';

  const navItems = [
    {
      id: 'overview',
      label: 'Overview',
      icon: LayoutDashboard,
      badge: null
    },
    {
      id: 'resume',
      label: 'Resume',
      icon: FileText,
      badge: null
    },
    {
      id: 'matcher',
      label: 'JD Matcher',
      icon: Search,
      badge: null
    },
    {
      id: 'roadmap',
      label: 'Roadmap',
      icon: GitFork,
      badge: hasAuditResult ? 'Ready' : null
    },
    {
      id: 'quiz',
      label: 'Quiz',
      icon: HelpCircle,
      badge: null
    },
    {
      id: 'interview',
      label: 'Interview',
      icon: MessageSquare,
      badge: hasAuditResult ? 'STAR' : null
    },
    {
      id: 'applications',
      label: 'Jobs',
      icon: Briefcase,
      badge: applicationsCount > 0 ? String(applicationsCount) : null
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: BarChart3,
      badge: null
    }
  ];

  const handleNavClick = (id) => {
    setActiveTab(id);
    if (onCloseMobile) onCloseMobile();
  };

  const userInitial = user?.name ? user.name.charAt(0).toUpperCase() : 'S';

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div 
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-sm lg:hidden transition-opacity"
        />
      )}

      {/* Persistent Sidebar */}
      <aside className={`fixed lg:sticky top-0 left-0 z-50 h-screen w-64 flex flex-col justify-between border-r transition-all duration-200 ${
        isDark 
          ? 'bg-slate-950 border-slate-800 text-slate-100' 
          : 'bg-white border-slate-200 text-slate-900'
      } ${
        isOpenMobile ? 'translate-x-0 shadow-2xl' : '-translate-x-full lg:translate-x-0'
      }`}>
        
        {/* Top Section: Brand + Navigation */}
        <div className="flex flex-col flex-1 overflow-y-auto">
          
          {/* Brand Header */}
          <div className="p-5 pb-4 flex items-center justify-between border-b border-inherit/40">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-slate-950 dark:bg-slate-100 flex items-center justify-center text-white dark:text-slate-950 shadow-md">
                <Sparkles className="w-5 h-5 fill-current" />
              </div>
              <div className="leading-tight">
                <h1 className="text-sm font-black tracking-tight flex items-center gap-1.5">
                  <span>EventBeep</span>
                </h1>
                <span className={`text-[10px] font-semibold tracking-wide ${
                  isDark ? 'text-slate-400' : 'text-slate-500'
                }`}>
                  Founder's Office • Radar OS
                </span>
              </div>
            </div>

            {/* Mobile Close Button */}
            <button
              onClick={onCloseMobile}
              className="p-1.5 rounded-lg border border-inherit/40 lg:hidden text-slate-400 hover:text-slate-100"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1 mt-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? (isDark 
                          ? 'bg-slate-900 text-white shadow-sm ring-1 ring-slate-800 font-bold' 
                          : 'bg-slate-100 text-slate-900 shadow-sm font-bold')
                      : (isDark
                          ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50')
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${
                      isActive 
                        ? (isDark ? 'text-purple-400' : 'text-purple-600') 
                        : 'opacity-70'
                    }`} />
                    <span>{item.label}</span>
                  </div>

                  {item.badge && (
                    <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                      isActive
                        ? 'bg-purple-600 text-white'
                        : (isDark ? 'bg-slate-800 text-slate-300' : 'bg-slate-200 text-slate-700')
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

        </div>

        {/* Bottom Section: User Profile & Logout */}
        <div className="p-3 border-t border-inherit/40">
          <div className={`p-3 rounded-2xl border flex items-center justify-between transition-colors ${
            isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-200'
          }`}>
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-slate-950 dark:bg-slate-100 text-white dark:text-slate-950 font-black text-xs flex items-center justify-center shrink-0">
                {userInitial}
              </div>
              <div className="min-w-0 text-left">
                <p className="text-xs font-bold truncate leading-tight">
                  {user?.name || 'Student'}
                </p>
                <p className={`text-[10px] truncate ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  {user?.college || 'Pro plan'}
                </p>
              </div>
            </div>

            <button
              onClick={onLogout}
              className={`p-1.5 rounded-xl border transition-colors ${
                isDark 
                  ? 'hover:bg-slate-800 border-slate-700 text-slate-400 hover:text-rose-400' 
                  : 'hover:bg-slate-200 border-slate-300 text-slate-600 hover:text-rose-600'
              }`}
              title="Sign out of Beep Radar"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </aside>
    </>
  );
}
