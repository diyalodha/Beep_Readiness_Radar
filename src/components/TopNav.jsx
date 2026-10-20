import React, { useState } from 'react';
import { 
  Menu, Search, Moon, Sun, Bell, 
  LogOut
} from 'lucide-react';

export default function TopNav({
  activeTab = 'overview',
  theme,
  toggleTheme,
  user,
  onLogout,
  applicationsCount = 0,
  onOpenMobileSidebar,
  searchQuery = '',
  setSearchQuery
}) {
  const isDark = theme === 'dark';
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  // Map active tab to human-readable title
  const getTabTitle = () => {
    switch (activeTab) {
      case 'overview': return 'Overview';
      case 'resume': return 'Resume Auditor';
      case 'matcher': return 'JD Matcher & Roles';
      case 'roadmap': return '48-Hour Roadmap';
      case 'quiz': return 'Skill Assessment';
      case 'interview': return 'Interview Prep';
      case 'applications': return 'Application Pipeline';
      case 'analytics': return 'Placement Analytics';
      default: return 'Overview';
    }
  };

  const userInitial = user?.name ? user.name.charAt(0).toUpperCase() : 'S';

  return (
    <header className={`sticky top-0 z-30 border-b backdrop-blur-md transition-colors ${
      isDark ? 'bg-slate-950/80 border-slate-800 text-slate-100' : 'bg-white/80 border-slate-200 text-slate-900'
    }`}>
      <div className="px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between gap-4">
        
        {/* Left: Mobile Menu Trigger + Tab Title */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenMobileSidebar}
            className="p-2 rounded-xl border border-inherit/40 lg:hidden text-slate-500 hover:text-slate-900 dark:hover:text-white"
            title="Open navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div>
            <h1 className="text-base sm:text-lg font-black tracking-tight leading-none">
              {getTabTitle()}
            </h1>
          </div>
        </div>

        {/* Right: Search + Theme Toggle + Notifications + User Avatar */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* Search Input Bar (Matching the screenshot: 'Search anything...') */}
          <div className="relative hidden md:block">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery && setSearchQuery(e.target.value)}
              placeholder="Search anything..."
              className={`pl-8 pr-4 py-1.5 rounded-full text-xs border transition-all w-48 lg:w-64 focus:outline-none focus:ring-2 focus:ring-purple-500/40 ${
                isDark 
                  ? 'bg-slate-900 border-slate-800 text-slate-200 placeholder-slate-500' 
                  : 'bg-slate-100 border-slate-200 text-slate-800 placeholder-slate-400'
              }`}
            />
          </div>

          {/* Theme Toggle (Moon / Sun) */}
          <button
            onClick={toggleTheme}
            className={`p-2 rounded-full border transition cursor-pointer ${
              isDark 
                ? 'bg-slate-900 border-slate-800 text-amber-400 hover:bg-slate-800' 
                : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
            }`}
            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Notification Bell */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(prev => !prev)}
              className={`p-2 rounded-full border transition cursor-pointer relative ${
                isDark 
                  ? 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800' 
                  : 'bg-slate-100 border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-200'
              }`}
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              <span className="w-2 h-2 rounded-full bg-purple-500 absolute top-1.5 right-1.5 ring-2 ring-white dark:ring-slate-950" />
            </button>

            {/* Notification Dropdown */}
            {showNotifications && (
              <div className={`absolute right-0 mt-2 w-72 rounded-2xl border shadow-xl p-3 z-50 animate-fadeIn ${
                isDark ? 'bg-slate-900 border-slate-800 text-slate-200' : 'bg-white border-slate-200 text-slate-800'
              }`}>
                <div className="flex items-center justify-between pb-2 border-b border-inherit/40 text-xs font-bold">
                  <span>Notifications</span>
                  <span className="text-[10px] text-purple-500">Live</span>
                </div>
                <div className="py-2 space-y-2 text-xs">
                  <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 text-[11px] leading-snug">
                    🚀 <strong>Beep Readiness Radar active:</strong> Boundary-aware matching and 48-hr project generator online.
                  </div>
                  {applicationsCount > 0 && (
                    <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] leading-snug">
                      📄 <strong>{applicationsCount} application(s)</strong> stored securely in SQLite database.
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Avatar Circle */}
          <div className="relative">
            <button
              onClick={() => setShowUserDropdown(prev => !prev)}
              className="w-8 h-8 rounded-full bg-slate-950 dark:bg-slate-100 text-white dark:text-slate-950 font-black text-xs flex items-center justify-center shadow-sm cursor-pointer hover:ring-2 hover:ring-purple-500/50 transition"
              title="Account Menu"
            >
              {userInitial}
            </button>

            {showUserDropdown && (
              <div className={`absolute right-0 mt-2 w-56 rounded-2xl border shadow-xl p-3 z-50 animate-fadeIn ${
                isDark ? 'bg-slate-900 border-slate-800 text-slate-200' : 'bg-white border-slate-200 text-slate-800'
              }`}>
                <div className="pb-2 border-b border-inherit/40">
                  <p className="text-xs font-bold">{user?.name || 'Student'}</p>
                  <p className={`text-[10px] truncate ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    {user?.email || 'student@beep.edu'}
                  </p>
                  <span className="inline-block mt-1 text-[10px] px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 font-bold border border-purple-500/20">
                    Pro Plan
                  </span>
                </div>

                <div className="pt-2">
                  <button
                    onClick={onLogout}
                    className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-xs font-semibold text-rose-500 hover:bg-rose-500/10 transition cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>

      </div>
    </header>
  );
}
