import React, { useState } from 'react';
import { 
  Sparkles, Shield, CheckCircle2, Sun, Moon, ArrowRight, 
  Mail, User, Building, GraduationCap, UserPlus, LogIn, X
} from 'lucide-react';

export default function LoginScreen({ onLogin, theme, toggleTheme }) {
  const [emailInput, setEmailInput] = useState('');
  const [existingUser, setExistingUser] = useState(null);
  const [isNewUserStep, setIsNewUserStep] = useState(false);
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);
  const [savedAccounts, setSavedAccounts] = useState(() => {
    try {
      const stored = localStorage.getItem('beep_registered_students');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // ignore
    }
    return [];
  });

  // Registration Form Fields for New Students
  const [fullName, setFullName] = useState('');
  const [collegeName, setCollegeName] = useState('');
  const [gradYear, setGradYear] = useState('');
  const [inputError, setInputError] = useState('');

  const isDark = theme === 'dark';

  // Check if an email exists locally or in the backend
  const lookupEmail = async (emailToCheck) => {
    const clean = emailToCheck.trim().toLowerCase();
    if (!clean) {
      setExistingUser(null);
      setIsNewUserStep(false);
      return;
    }

    // 1. Check local saved list first
    const localMatch = savedAccounts.find(a => a.email?.toLowerCase() === clean);
    if (localMatch) {
      setExistingUser(localMatch);
      setIsNewUserStep(false);
      return;
    }

    // 2. Check backend API
    setIsCheckingEmail(true);
    try {
      const resp = await fetch(`/api/users/lookup?email=${encodeURIComponent(clean)}`);
      if (resp.ok) {
        const data = await resp.json();
        if (data.found && data.user) {
          setExistingUser(data.user);
          setIsNewUserStep(false);
          setIsCheckingEmail(false);
          return;
        }
      }
    } catch {
      // Backend lookup failed, proceed with local check
    } finally {
      setIsCheckingEmail(false);
    }

    setExistingUser(null);
  };

  // Handle email input change
  const handleEmailChange = (e) => {
    const val = e.target.value;
    setEmailInput(val);
    setInputError('');

    if (/^\S+@\S+\.\S+$/.test(val.trim())) {
      lookupEmail(val);
    } else {
      setExistingUser(null);
      setIsNewUserStep(false);
    }
  };

  // Step 1: User submits email
  const handleEmailSubmit = (e) => {
    e.preventDefault();
    const cleanEmail = emailInput.trim().toLowerCase();

    if (!cleanEmail || !/^\S+@\S+\.\S+$/.test(cleanEmail)) {
      setInputError('Please enter a valid email address.');
      return;
    }

    // If returning user: directly log in!
    if (existingUser) {
      onLogin(existingUser);
      return;
    }

    // If new user: advance to details input
    setIsNewUserStep(true);
  };

  // Step 2: New user registers their details
  const handleRegistrationSubmit = async (e) => {
    e.preventDefault();
    const cleanEmail = emailInput.trim().toLowerCase();
    const cleanName = fullName.trim();
    const cleanCollege = collegeName.trim();
    const cleanYear = gradYear.trim();

    if (!cleanName) {
      setInputError('Please enter your full name.');
      return;
    }

    const newProfile = {
      name: cleanName,
      email: cleanEmail,
      college: cleanCollege || 'College Student (India)',
      graduationYear: cleanYear || '2026',
      avatar: null,
      registeredAt: new Date().toISOString()
    };

    // Save locally
    try {
      const currentList = JSON.parse(localStorage.getItem('beep_registered_students') || '[]');
      const updated = [newProfile, ...currentList.filter(u => u.email?.toLowerCase() !== cleanEmail)];
      localStorage.setItem('beep_registered_students', JSON.stringify(updated));
      setSavedAccounts(updated);
    } catch {
      // ignore
    }

    // Save to server in background
    try {
      await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProfile)
      });
    } catch {
      // local save will suffice
    }

    // Directly log in the student
    onLogin(newProfile);
  };

  // Direct login by clicking a saved student card
  const handleQuickLogin = (account) => {
    onLogin(account);
  };

  // Remove a saved profile from local list
  const handleRemoveAccount = (e, emailToRemove) => {
    e.stopPropagation();
    const updated = savedAccounts.filter(a => a.email !== emailToRemove);
    setSavedAccounts(updated);
    localStorage.setItem('beep_registered_students', JSON.stringify(updated));
    if (existingUser?.email === emailToRemove) {
      setExistingUser(null);
    }
  };

  // Fast Guest Login for evaluators
  const handleGuestLogin = () => {
    onLogin({
      name: 'Student Guest',
      email: 'guest.student@beep.edu',
      college: 'Campus Job Seeker',
      avatar: null,
      _guest: true
    });
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
                Founder’s Office Discovery MVP
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
      </header>

      {/* Main Login Card Container */}
      <main className="flex-1 flex items-center justify-center px-4 py-12 relative overflow-hidden">
        
        {/* Ambient Gradient Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[350px] bg-purple-600/10 blur-[130px] pointer-events-none rounded-full" />

        <div className="max-w-md w-full relative z-10">
          
          <div className={`p-7 sm:p-8 rounded-3xl border shadow-2xl transition-all ${
            isDark 
              ? 'bg-slate-900/90 border-slate-800/90 shadow-purple-950/20' 
              : 'bg-white border-slate-200 shadow-slate-200/80'
          }`}>
            
            {/* Header Badge */}
            <div className="text-center mb-6">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 mb-3">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Student Career Portal</span>
              </div>
              <h2 className={`text-2xl font-extrabold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {isNewUserStep ? 'Create Your Student Profile' : 'Sign In to Beep Radar'}
              </h2>
              <p className={`text-xs mt-1.5 leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                {isNewUserStep 
                  ? 'First time here? Fill in your details once, and you can log in directly next time.'
                  : 'Enter your Gmail or college email to audit your resume against real internships.'
                }
              </p>
            </div>

            {/* Error Message */}
            {inputError && (
              <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/40 text-rose-500 text-xs">
                {inputError}
              </div>
            )}

            {/* Saved Accounts Quick-Picker (if returning user has registered profiles on this browser) */}
            {!isNewUserStep && savedAccounts.length > 0 && !existingUser && (
              <div className="mb-5 space-y-2">
                <span className={`text-[10px] font-bold uppercase tracking-wider block ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Saved Student Profiles on this Device:
                </span>
                <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                  {savedAccounts.map((acc, idx) => (
                    <div
                      key={idx}
                      onClick={() => handleQuickLogin(acc)}
                      className={`p-2.5 rounded-xl border flex items-center justify-between gap-3 text-left transition cursor-pointer group ${
                        isDark 
                          ? 'bg-slate-950/80 hover:bg-slate-800 border-slate-800 hover:border-purple-500/50' 
                          : 'bg-slate-50 hover:bg-purple-50 border-slate-200 hover:border-purple-300'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                          {acc.name ? acc.name.charAt(0).toUpperCase() : 'S'}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold truncate leading-tight">{acc.name}</p>
                          <p className={`text-[10px] truncate ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{acc.email}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <span className="text-[10px] font-semibold text-purple-600 dark:text-purple-400 group-hover:translate-x-0.5 transition-transform">
                          Log In ➔
                        </span>
                        <button
                          type="button"
                          onClick={(e) => handleRemoveAccount(e, acc.email)}
                          className="p-1 text-slate-400 hover:text-rose-500 transition rounded"
                          title="Remove profile from this browser"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="relative flex items-center justify-center my-3">
                  <div className={`border-t w-full ${isDark ? 'border-slate-800' : 'border-slate-200'}`} />
                  <span className={`px-2 text-[10px] font-semibold uppercase tracking-wider relative ${
                    isDark ? 'bg-slate-900 text-slate-500' : 'bg-white text-slate-400'
                  }`}>
                    or enter email
                  </span>
                  <div className={`border-t w-full ${isDark ? 'border-slate-800' : 'border-slate-200'}`} />
                </div>
              </div>
            )}

            {/* STEP 1: Enter Email Form */}
            {!isNewUserStep ? (
              <form onSubmit={handleEmailSubmit} className="space-y-3.5">
                <div>
                  <label className={`block text-xs font-bold mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    Student Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                    <input
                      type="email"
                      required
                      placeholder="your.email@gmail.com"
                      value={emailInput}
                      onChange={handleEmailChange}
                      className={`w-full text-xs pl-10 pr-4 py-3 rounded-2xl border focus:outline-none focus:ring-2 focus:ring-purple-500 transition ${
                        isDark 
                          ? 'bg-slate-950 border-slate-800 text-white placeholder-slate-500' 
                          : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400'
                      }`}
                    />
                  </div>
                </div>

                {/* Returning User Banner: If email matches an existing profile */}
                {existingUser && (
                  <div className={`p-3 rounded-2xl border flex items-center justify-between gap-3 animate-fadeIn ${
                    isDark ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200' : 'bg-emerald-50 border-emerald-300 text-emerald-900'
                  }`}>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      <div>
                        <span className="font-bold text-xs block leading-tight">
                          Welcome back, {existingUser.name}!
                        </span>
                        <span className="text-[10px] opacity-80">
                          {existingUser.college || 'Verified Student'}
                        </span>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                      Profile Found
                    </span>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isCheckingEmail}
                  className="w-full flex items-center justify-center gap-2 py-3.5 px-5 rounded-2xl font-bold text-xs bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-lg shadow-purple-600/30 transition transform hover:-translate-y-0.5 cursor-pointer"
                >
                  {existingUser ? (
                    <>
                      <LogIn className="w-4 h-4" />
                      <span>Log In Directly as {existingUser.name} ➔</span>
                    </>
                  ) : (
                    <>
                      <span>Continue with Email</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                {/* Guest Access Alternative */}
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handleGuestLogin}
                    className={`w-full py-2.5 px-4 rounded-xl text-xs font-semibold border transition ${
                      isDark
                        ? 'border-slate-800 bg-slate-950/60 hover:bg-slate-800 text-slate-400 hover:text-slate-200'
                        : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Continue as Quick Guest ➔
                  </button>
                </div>

              </form>
            ) : (
              /* STEP 2: New Student Details Form */
              <form onSubmit={handleRegistrationSubmit} className="space-y-3.5 animate-fadeIn">
                <div className={`p-3 rounded-2xl border flex items-center gap-2.5 text-xs ${
                  isDark ? 'bg-purple-950/30 border-purple-500/30 text-purple-200' : 'bg-purple-50 border-purple-200 text-purple-900'
                }`}>
                  <UserPlus className="w-4 h-4 text-purple-500 shrink-0" />
                  <div>
                    <span className="font-bold block">New Student Registration</span>
                    <span className="text-[10px] opacity-80">Linking profile to: <strong>{emailInput}</strong></span>
                  </div>
                </div>

                <div>
                  <label className={`block text-xs font-bold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    Your Full Name <span className="text-purple-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Aryan Kumar"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
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
                    College / University & Branch
                  </label>
                  <div className="relative">
                    <Building className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                    <input
                      type="text"
                      placeholder="e.g. MIT Pune, B.Tech CSE"
                      value={collegeName}
                      onChange={(e) => setCollegeName(e.target.value)}
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
                    Graduation Year / Semester
                  </label>
                  <div className="relative">
                    <GraduationCap className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                    <input
                      type="text"
                      placeholder="e.g. 2026 (6th Semester)"
                      value={gradYear}
                      onChange={(e) => setGradYear(e.target.value)}
                      className={`w-full text-xs pl-10 pr-4 py-2.5 rounded-xl border focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                        isDark 
                          ? 'bg-slate-950 border-slate-800 text-white placeholder-slate-500' 
                          : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400'
                      }`}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsNewUserStep(false)}
                    className={`px-4 py-2.5 rounded-xl text-xs font-semibold border transition ${
                      isDark ? 'border-slate-800 text-slate-400 hover:text-white' : 'border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-bold text-xs bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-md transition cursor-pointer"
                  >
                    <span>Save Profile & Enter Radar</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </form>
            )}

            {/* Trust Badges */}
            <div className={`mt-6 pt-5 border-t space-y-2 text-[11px] ${
              isDark ? 'border-slate-800/80 text-slate-400' : 'border-slate-100 text-slate-500'
            }`}>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-purple-500 shrink-0" />
                <span>100% Free tool for college students & campus job seekers</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-purple-500 shrink-0" />
                <span>No password required: Easy login via your email</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="w-3.5 h-3.5 text-purple-500 shrink-0" />
                <span>Your details are remembered on this device for instant access.</span>
              </div>
            </div>

          </div>

          <p className={`text-center text-[11px] mt-4 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
            Beep AI Career Platform • Fast-Track Internship Radar
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
