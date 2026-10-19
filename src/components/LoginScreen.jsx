import React, { useState } from 'react';
import { Sparkles, Shield, CheckCircle2, Sun, Moon, Info } from 'lucide-react';

export default function LoginScreen({ onLogin, theme, toggleTheme }) {
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [customEmail, setCustomEmail] = useState('');
  const [customName, setCustomName] = useState('');

  const demoAccounts = [
    {
      name: 'Arjun Sharma',
      email: 'arjun.sharma24@gmail.com',
      college: 'Tier-3 Engineering College (3rd Year CS)',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces'
    },
    {
      name: 'Priya Nair',
      email: 'priya.nair.tech@gmail.com',
      college: 'Final Year IT Student',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&h=100&fit=crop&crop=faces'
    },
    {
      name: 'Rohan Mehta',
      email: 'rohan.mehta.apm@gmail.com',
      college: 'ECE 3rd Year • Aspiring PM',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=faces'
    }
  ];

  const handleSelectAccount = (account) => {
    onLogin(account);
  };

  const handleCustomLogin = (e) => {
    e.preventDefault();
    if (!customEmail) return;
    const name = customName.trim() || customEmail.split('@')[0];
    onLogin({
      name,
      email: customEmail,
      college: 'College Student (India)',
      avatar: null
    });
  };

  const handleGuestLogin = () => {
    onLogin({
      name: 'Student Guest',
      email: 'guest.student@beep.edu',
      college: 'Campus Job Seeker',
      avatar: null
    });
  };

  const isDark = theme === 'dark';

  return (
    <div className={`min-h-screen flex flex-col justify-between transition-colors duration-200 ${
      isDark ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'
    }`}>
      
      {/* Top Navbar */}
      <header className={`border-b px-4 sm:px-8 py-4 flex items-center justify-between ${
        isDark ? 'border-slate-800/80 bg-slate-900/60' : 'border-slate-200 bg-white/80'
      } backdrop-blur-md`}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-purple-500/20 text-white font-black text-xl">
            B
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-400 bg-clip-text text-transparent">
                Beep
              </span>
              <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${
                isDark 
                  ? 'bg-purple-500/15 border-purple-500/30 text-purple-300' 
                  : 'bg-purple-50 border-purple-200 text-purple-700'
              }`}>
                Readiness Radar
              </span>
            </div>
            <p className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Founder’s Office Discovery MVP
            </p>
          </div>
        </div>

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
      </header>

      {/* Main Login Card Container */}
      <main className="flex-1 flex items-center justify-center px-4 py-12 relative overflow-hidden">
        
        {/* Ambient Gradient Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[350px] bg-purple-600/10 blur-[130px] pointer-events-none rounded-full" />

        <div className="max-w-md w-full relative z-10">
          
          <div className={`p-8 rounded-3xl border shadow-2xl transition-all ${
            isDark 
              ? 'bg-slate-900/90 border-slate-800/90 shadow-purple-950/20' 
              : 'bg-white border-slate-200 shadow-slate-200/80'
          }`}>
            
            {/* Header Badge */}
            <div className="text-center mb-6">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-purple-500/10 text-purple-600 border border-purple-500/20 mb-3">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Student Career Portal</span>
              </div>
              <h2 className={`text-2xl font-extrabold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Sign In to Beep Radar
              </h2>
              <p className={`text-xs mt-1.5 leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Compare your college skills against real internship descriptions and generate your 7-day action plan.
              </p>
            </div>

            {/* Demo Sign-In Transparency Banner */}
            <div className={`mb-4 p-3 rounded-2xl border flex items-start gap-2.5 text-[11px] leading-relaxed ${
              isDark
                ? 'bg-amber-950/40 border-amber-500/40 text-amber-200'
                : 'bg-amber-50 border-amber-300 text-amber-800'
            }`}>
              <Info className="w-4 h-4 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Demo Sign-In Only</p>
                <p className="opacity-90 mt-0.5">
                  No real Google OAuth is performed. Any account you pick here creates a local-only profile stored in your browser's <span className="font-mono">localStorage</span>. Do not enter real personal data.
                </p>
              </div>
            </div>

            {/* Google Login Action */}
            <div className="space-y-4">
              
              <button
                type="button"
                onClick={() => setShowGoogleModal(true)}
                className={`w-full flex items-center justify-center gap-3 px-5 py-3.5 rounded-2xl border font-bold text-sm transition-all cursor-pointer shadow-sm hover:shadow-md ${
                  isDark
                    ? 'bg-slate-950 hover:bg-slate-800/80 border-slate-700 text-white'
                    : 'bg-white hover:bg-slate-50 border-slate-300 text-slate-800'
                }`}
              >
                {/* Official Google 'G' Multi-color SVG */}
                <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Continue with Google / Gmail</span>
              </button>

              <div className="relative flex items-center justify-center my-4">
                <div className={`border-t w-full ${isDark ? 'border-slate-800' : 'border-slate-200'}`} />
                <span className={`px-3 text-[11px] font-medium uppercase tracking-wider relative ${
                  isDark ? 'bg-slate-900 text-slate-500' : 'bg-white text-slate-400'
                }`}>
                  or quick sign-in
                </span>
                <div className={`border-t w-full ${isDark ? 'border-slate-800' : 'border-slate-200'}`} />
              </div>

              {/* Instant Guest / Demo Mode Button */}
              <button
                type="button"
                onClick={handleGuestLogin}
                className={`w-full py-3 px-4 rounded-xl text-xs font-semibold border transition ${
                  isDark
                    ? 'border-slate-800 bg-slate-950/60 hover:bg-slate-800 text-slate-300'
                    : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700'
                }`}
              >
                Continue as Student Guest ➔
              </button>

            </div>

            {/* Trust Badges */}
            <div className={`mt-6 pt-5 border-t space-y-2 text-[11px] ${
              isDark ? 'border-slate-800/80 text-slate-400' : 'border-slate-100 text-slate-500'
            }`}>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-purple-500 shrink-0" />
                <span>100% Free tool for college students & graduates</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-purple-500 shrink-0" />
                <span>Transparent scoring: No hidden algorithm black holes</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-purple-500 shrink-0" />
                <span>Action-first: Includes 48-hr project & Google XYZ bullets</span>
              </div>
              <div className="flex items-start gap-2">
                <Shield className="w-3.5 h-3.5 text-purple-500 shrink-0 mt-0.5" />
                <span>Your resume text is only used to compute your score. The demo backend does not persist resume contents.</span>
              </div>
            </div>

          </div>

          <p className={`text-center text-[11px] mt-4 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
            This is a discovery MVP. Sessions are local-only and no identity is verified.
          </p>

        </div>
      </main>

      {/* Google Account Chooser Modal */}
      {showGoogleModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className={`max-w-md w-full rounded-2xl p-6 border shadow-2xl relative ${
            isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                </svg>
                <h3 className="font-bold text-sm">Choose an account for Beep</h3>
              </div>
              <button 
                onClick={() => setShowGoogleModal(false)}
                className="text-xs text-slate-400 hover:text-slate-200 px-2 py-1 rounded"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-400 mb-3">
              Select a pre-loaded student profile or enter your custom Gmail:
            </p>

            {/* Preloaded Accounts List */}
            <div className="space-y-2 mb-4">
              {demoAccounts.map((acc, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    handleSelectAccount(acc);
                    setShowGoogleModal(false);
                  }}
                  className={`w-full flex items-center gap-3 p-2.5 rounded-xl border text-left transition ${
                    isDark
                      ? 'border-slate-800 bg-slate-950 hover:bg-slate-800/80 hover:border-purple-500/50'
                      : 'border-slate-200 bg-slate-50 hover:bg-purple-50 hover:border-purple-300'
                  }`}
                >
                  <img
                    src={acc.avatar}
                    alt={acc.name}
                    className="w-9 h-9 rounded-full object-cover border border-purple-500/40"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold truncate">{acc.name}</p>
                    <p className="text-[11px] text-slate-400 truncate">{acc.email}</p>
                    <p className="text-[10px] text-purple-400 truncate font-medium">{acc.college}</p>
                  </div>
                </button>
              ))}
            </div>

            {/* Custom Gmail Form */}
            <form onSubmit={handleCustomLogin} className="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-2.5">
              <span className="text-[11px] font-semibold text-slate-400 block">
                Or enter another Gmail address:
              </span>
              <div className="grid grid-cols-1 gap-2">
                <input
                  type="text"
                  placeholder="Your Name (e.g. Rahul)"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  className={`w-full text-xs p-2.5 rounded-lg border focus:outline-none focus:ring-1 focus:ring-purple-500 ${
                    isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                  }`}
                />
                <input
                  type="email"
                  required
                  placeholder="your.email@gmail.com"
                  value={customEmail}
                  onChange={(e) => setCustomEmail(e.target.value)}
                  className={`w-full text-xs p-2.5 rounded-lg border focus:outline-none focus:ring-1 focus:ring-purple-500 ${
                    isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                  }`}
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowGoogleModal(false)}
                  className="px-3 py-1.5 rounded-lg text-xs border border-slate-700 text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg text-xs font-bold bg-purple-600 hover:bg-purple-500 text-white transition"
                >
                  Sign In with Gmail
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* Footer */}
      <footer className={`py-4 text-center text-xs border-t ${
        isDark ? 'border-slate-900 text-slate-500' : 'border-slate-200 text-slate-400'
      }`}>
        Beep AI Career Platform • Founder’s Office Assignment Discovery Tool
      </footer>

    </div>
  );
}
