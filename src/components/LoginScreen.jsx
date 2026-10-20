import React, { useState } from 'react';
import { 
  Sparkles, Shield, CheckCircle2, Sun, Moon, ArrowRight, 
  Mail, User, Building, GraduationCap, UserPlus, LogIn, Lock, Info
} from 'lucide-react';

export default function LoginScreen({ onLogin, theme, toggleTheme }) {
  const [activeTab, setActiveTab] = useState('login'); // 'login' | 'register'
  
  // Login Form State
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  
  // Registration Form State
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regCollege, setRegCollege] = useState('');
  const [regGradYear, setRegGradYear] = useState('');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const isDark = theme === 'dark';

  // Handle Login Submission
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    
    const cleanEmail = loginEmail.trim().toLowerCase();
    if (!cleanEmail || !loginPassword) {
      setErrorMessage('Please enter both email and password.');
      return;
    }

    setIsSubmitting(true);
    try {
      const resp = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail, password: loginPassword })
      });

      const data = await resp.json();
      if (!resp.ok) {
        throw new Error(data.error || 'Invalid email or password.');
      }

      onLogin(data.user, data.token);
    } catch (err) {
      setErrorMessage(err.message || 'Login failed. Please verify your credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Registration Submission
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    const cleanName = regName.trim();
    const cleanEmail = regEmail.trim().toLowerCase();
    const cleanPass = regPassword.trim();

    if (!cleanName) {
      setErrorMessage('Please enter your full name.');
      return;
    }
    if (!cleanEmail || !/^\S+@\S+\.\S+$/.test(cleanEmail)) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }
    if (cleanPass.length < 8 || !/[A-Za-z]/.test(cleanPass) || !/\d/.test(cleanPass)) {
      setErrorMessage('Password must be at least 8 characters long and contain both letters and numbers.');
      return;
    }

    setIsSubmitting(true);
    try {
      const resp = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: cleanName,
          email: cleanEmail,
          password: cleanPass,
          college: regCollege.trim() || 'College Student',
          graduationYear: regGradYear.trim() || '2026'
        })
      });

      const data = await resp.json();
      if (!resp.ok) {
        throw new Error(data.error || 'Unable to complete registration. Please try signing in.');
      }

      onLogin(data.user, data.token);
    } catch (err) {
      setErrorMessage(err.message || 'Registration failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`min-h-screen flex flex-col justify-between transition-colors duration-200 ${
      isDark ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'
    }`}>
      
      {/* Top Navbar */}
      <header className={`border-b px-4 sm:px-8 py-3.5 flex items-center justify-between ${
        isDark ? 'border-slate-800/80 bg-slate-900/60' : 'border-slate-200 bg-white/80'
      } backdrop-blur-md`}>
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-purple-500/20 text-white font-black text-xl">
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
              <p className={`text-[10px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Founder’s Office Discovery Platform
              </p>
            </div>
          </div>

          {/* Theme Toggle Button (shifted to the left) */}
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
        </div>

        <div className="flex items-center gap-2 text-xs">
          <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full border text-[11px] ${
            isDark ? 'bg-slate-900 border-slate-800 text-emerald-400' : 'bg-emerald-50 border-emerald-200 text-emerald-700'
          }`}>
            <Shield className="w-3.5 h-3.5" />
            <span>Authenticated Sessions</span>
          </div>
        </div>
      </header>

      {/* Main Login Card Container */}
      <main className="flex-1 flex items-center justify-center px-4 py-12 relative overflow-hidden">
        
        {/* Ambient Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[350px] bg-purple-600/10 blur-[130px] pointer-events-none rounded-full" />

        <div className="max-w-md w-full relative z-10">
          
          <div className={`p-7 sm:p-8 rounded-3xl border shadow-2xl transition-all ${
            isDark 
              ? 'bg-slate-900/90 border-slate-800/90 shadow-purple-950/20' 
              : 'bg-white border-slate-200 shadow-slate-200/80'
          }`}>
            
            {/* Header Badge */}
            <div className="text-center mb-5">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 mb-3">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Student Career Portal</span>
              </div>
              <h2 className={`text-2xl font-extrabold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {activeTab === 'login' ? 'Sign In to Beep' : 'Create Student Account'}
              </h2>
              <p className={`text-xs mt-1 leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                {activeTab === 'login' 
                  ? 'Access your resume audits and application tracking pipeline.'
                  : 'Register your candidate profile to audit resumes against startup roles.'
                }
              </p>
            </div>

            {/* Tab Switcher: Sign In vs Sign Up */}
            <div className={`flex rounded-2xl p-1 mb-5 border ${
              isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-100 border-slate-200'
            }`}>
              <button
                type="button"
                onClick={() => { setActiveTab('login'); setErrorMessage(''); }}
                className={`flex-1 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                  activeTab === 'login'
                    ? 'bg-purple-600 text-white shadow-md'
                    : isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </button>
              <button
                type="button"
                onClick={() => { setActiveTab('register'); setErrorMessage(''); }}
                className={`flex-1 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                  activeTab === 'register'
                    ? 'bg-purple-600 text-white shadow-md'
                    : isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Create Account</span>
              </button>
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/40 text-rose-500 text-xs">
                {errorMessage}
              </div>
            )}

            {/* TAB 1: SIGN IN FORM */}
            {activeTab === 'login' ? (
              <form onSubmit={handleLoginSubmit} className="space-y-3.5">
                <div>
                  <label className={`block text-xs font-bold mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                    <input
                      type="email"
                      required
                      placeholder="name@college.edu"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      className={`w-full text-xs pl-10 pr-4 py-3 rounded-2xl border focus:outline-none focus:ring-2 focus:ring-purple-500 transition ${
                        isDark 
                          ? 'bg-slate-950 border-slate-800 text-white placeholder-slate-500' 
                          : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400'
                      }`}
                    />
                  </div>
                </div>

                <div>
                  <label className={`block text-xs font-bold mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                    <input
                      type="password"
                      required
                      placeholder="Enter your password"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      className={`w-full text-xs pl-10 pr-4 py-3 rounded-2xl border focus:outline-none focus:ring-2 focus:ring-purple-500 transition ${
                        isDark 
                          ? 'bg-slate-950 border-slate-800 text-white placeholder-slate-500' 
                          : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400'
                      }`}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full flex items-center justify-center gap-2 py-3.5 px-5 rounded-2xl font-bold text-xs bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-lg shadow-purple-600/30 transition transform hover:-translate-y-0.5 cursor-pointer disabled:opacity-60"
                >
                  {isSubmitting ? (
                    <span>Authenticating...</span>
                  ) : (
                    <>
                      <span>Sign In to Radar</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            ) : (
              /* TAB 2: REGISTRATION FORM */
              <form onSubmit={handleRegisterSubmit} className="space-y-3 animate-fadeIn">
                <div>
                  <label className={`block text-xs font-bold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    Full Name <span className="text-purple-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Aryan Kumar"
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      className={`w-full text-xs pl-10 pr-4 py-2.5 rounded-xl border focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                        isDark 
                          ? 'bg-slate-950 border-slate-800 text-white placeholder-slate-500' 
                          : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400'
                      }`}
                    />
                  </div>
                </div>

                <div>
                  <label className={`block text-xs font-bold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    Email Address <span className="text-purple-500">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                    <input
                      type="email"
                      required
                      placeholder="e.g. aryan@college.edu"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      className={`w-full text-xs pl-10 pr-4 py-2.5 rounded-xl border focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                        isDark 
                          ? 'bg-slate-950 border-slate-800 text-white placeholder-slate-500' 
                          : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400'
                      }`}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className={`block text-xs font-bold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                      Password <span className="text-purple-500">*</span>
                    </label>
                    <span className={`text-[10px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      Min 8 chars, 1 letter & 1 number
                    </span>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                    <input
                      type="password"
                      required
                      placeholder="Create secure password"
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      className={`w-full text-xs pl-10 pr-4 py-2.5 rounded-xl border focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                        isDark 
                          ? 'bg-slate-950 border-slate-800 text-white placeholder-slate-500' 
                          : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400'
                      }`}
                    />
                  </div>
                </div>

                <div>
                  <label className={`block text-xs font-bold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    College / Branch
                  </label>
                  <div className="relative">
                    <Building className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                    <input
                      type="text"
                      placeholder="e.g. Pune University, B.Tech CSE"
                      value={regCollege}
                      onChange={(e) => setRegCollege(e.target.value)}
                      className={`w-full text-xs pl-10 pr-4 py-2.5 rounded-xl border focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                        isDark 
                          ? 'bg-slate-950 border-slate-800 text-white placeholder-slate-500' 
                          : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400'
                      }`}
                    />
                  </div>
                </div>

                <div>
                  <label className={`block text-xs font-bold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    Graduation Year
                  </label>
                  <div className="relative">
                    <GraduationCap className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                    <input
                      type="text"
                      placeholder="e.g. 2026"
                      value={regGradYear}
                      onChange={(e) => setRegGradYear(e.target.value)}
                      className={`w-full text-xs pl-10 pr-4 py-2.5 rounded-xl border focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                        isDark 
                          ? 'bg-slate-950 border-slate-800 text-white placeholder-slate-500' 
                          : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400'
                      }`}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full flex items-center justify-center gap-2 py-3 px-5 rounded-xl font-bold text-xs bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-md transition cursor-pointer disabled:opacity-60 mt-1"
                >
                  {isSubmitting ? (
                    <span>Creating Account...</span>
                  ) : (
                    <>
                      <span>Complete Registration</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            )}

            {/* Privacy & Trust Badge */}
            <div className={`mt-6 pt-5 border-t space-y-2 text-[11px] ${
              isDark ? 'border-slate-800/80 text-slate-400' : 'border-slate-100 text-slate-500'
            }`}>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-purple-500 shrink-0" />
                <span>Protected sessions with bcrypt password hashing & JWT tokens.</span>
              </div>
              <div className="flex items-center gap-2">
                <Info className="w-3.5 h-3.5 text-purple-500 shrink-0" />
                <span>Resume privacy: files are analyzed in-session and never sold or retained.</span>
              </div>
            </div>

          </div>

          <p className={`text-center text-[11px] mt-4 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
            Beep AI Career Platform • Founder’s Office Assignment Tool
          </p>

        </div>
      </main>

      {/* Footer */}
      <footer className={`py-4 text-center text-xs border-t ${
        isDark ? 'border-slate-900 text-slate-500' : 'border-slate-200 text-slate-400'
      }`}>
        Beep AI Career Platform • Founder’s Office Assignment Discovery Tool
      </footer>

    </div>
  );
}
