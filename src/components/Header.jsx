import React, { useState } from 'react';
import { HelpCircle, Info, Sun, Moon, LogOut } from 'lucide-react';

export default function Header({ apiStatus, user, onLogout, theme, toggleTheme }) {
  const [showInfo, setShowInfo] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const isDark = theme === 'dark';

  return (
    <header className={`border-b sticky top-0 z-50 backdrop-blur-md transition-colors duration-200 ${
      isDark ? 'border-slate-800 bg-slate-900/70' : 'border-slate-200 bg-white/80'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
        
        {/* Brand / Logo */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-purple-500/20 text-white font-extrabold text-lg tracking-tight">
            B
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className={`font-extrabold text-lg tracking-tight ${
                isDark ? 'text-white' : 'text-slate-900'
              }`}>
                Beep
              </span>
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                isDark
                  ? 'bg-purple-500/15 border-purple-500/30 text-purple-300'
                  : 'bg-purple-50 border-purple-200 text-purple-700'
              }`}>
                Readiness Radar
              </span>
            </div>
            <p className={`text-[10px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Founder’s Office Discovery MVP
            </p>
          </div>
        </div>

        {/* Right Actions: Theme Toggle, Engine Status, User Profile */}
        <div className="flex items-center gap-2.5">
          
          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className={`p-2 rounded-xl border transition-all ${
              isDark 
                ? 'bg-slate-900 border-slate-800 text-amber-400 hover:bg-slate-800' 
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100 shadow-sm'
            }`}
            title={isDark ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Engine Status Indicator */}
          <div 
            onClick={() => setShowInfo(!showInfo)}
            className={`cursor-pointer group flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-medium border transition-all ${
              apiStatus?.aiEnabled 
                ? (isDark ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300' : 'bg-emerald-50 border-emerald-300 text-emerald-700')
                : (isDark ? 'bg-amber-950/50 border-amber-500/40 text-amber-300' : 'bg-amber-50 border-amber-300 text-amber-700')
            }`}
          >
            <span className={`w-2 h-2 rounded-full animate-pulse ${apiStatus?.aiEnabled ? 'bg-emerald-500' : 'bg-amber-500'}`} />
            <span className="hidden sm:inline">
              {apiStatus?.aiEnabled ? 'Live AI Engine' : 'Demo Engine'}
            </span>
            <HelpCircle className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100" />
          </div>

          {/* User Profile & Sign Out Dropdown */}
          {user && (
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className={`flex items-center gap-2 p-1.5 pl-2 rounded-full border transition ${
                  isDark
                    ? 'border-slate-800 bg-slate-900 hover:bg-slate-800 text-slate-200'
                    : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-800 shadow-sm'
                }`}
              >
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-6 h-6 rounded-full object-cover border border-purple-500"
                  />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-purple-600 text-white font-bold text-xs flex items-center justify-center">
                    {user.name?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                )}
                <span className="text-xs font-semibold max-w-[90px] truncate hidden sm:inline">
                  {user.name}
                </span>
                {user._demo && (
                  <span className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border ${
                    isDark
                      ? 'bg-amber-500/10 border-amber-500/40 text-amber-300'
                      : 'bg-amber-50 border-amber-300 text-amber-700'
                  }`} title="Local demo session — no real authentication is happening">
                    Demo
                  </span>
                )}
              </button>

              {/* User Menu Dropdown */}
              {showUserMenu && (
                <div className={`absolute right-0 mt-2 w-56 rounded-2xl border shadow-xl p-3 z-50 transition-all ${
                  isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
                }`}>
                  <div className="pb-2.5 mb-2 border-b border-slate-200 dark:border-slate-800">
                    <p className="text-xs font-bold truncate">{user.name}</p>
                    <p className={`text-[11px] truncate ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      {user.email}
                    </p>
                    <p className="text-[10px] text-purple-500 font-medium mt-0.5 truncate">
                      {user.college || 'Logged In with Google'}
                    </p>
                    {user._demo && (
                      <p className={`text-[10px] mt-1 ${isDark ? 'text-amber-300' : 'text-amber-700'}`}>
                        Demo session. Not a real signed-in Google account.
                      </p>
                    )}
                  </div>

                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      onLogout();
                    }}
                    className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-rose-500 hover:bg-rose-500/10 transition text-left"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          )}

        </div>
      </div>

      {/* Info Dropdown */}
      {showInfo && (
        <div className={`border-b px-4 py-3 text-xs transition-all ${
          isDark ? 'bg-slate-900 border-slate-800 text-slate-300' : 'bg-slate-100 border-slate-200 text-slate-700'
        }`}>
          <div className="max-w-7xl mx-auto flex items-start gap-3">
            <Info className="w-4 h-4 text-purple-500 mt-0.5 shrink-0" />
            <div className="space-y-1">
              <p className={`font-semibold ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
                System Mode: {apiStatus?.aiEnabled ? '🟢 Genuine Gemini 2.5 Flash' : '🟡 Curated Heuristic Simulation (Demo Mode)'}
              </p>
              <p className={isDark ? 'text-slate-400' : 'text-slate-600'}>
                {apiStatus?.message || 'API keys are stored exclusively in the backend server environment (.env) to prevent client-side leaks.'}
              </p>
              <p className="text-[11px] text-purple-500 font-mono">
                To switch to live AI, add GEMINI_API_KEY=your_key in server .env.
              </p>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
