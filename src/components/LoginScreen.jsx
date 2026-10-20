import React, { useState } from 'react';
import { 
  Sparkles, Shield, CheckCircle2, Sun, Moon, ArrowRight, 
  Mail, User, Building, GraduationCap, UserPlus, LogIn, X, Lock, Key
} from 'lucide-react';

export default function LoginScreen({ onLogin, theme, toggleTheme }) {
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [showPasswordInput, setShowPasswordInput] = useState(false);
  const [existingUser, setExistingUser] = useState(null);
  const [isNewUserStep, setIsNewUserStep] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [inputError, setInputError] = useState('');

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
  const [regPassword, setRegPassword] = useState('Beep@2026');
  const [collegeName, setCollegeName] = useState('');
  const [gradYear, setGradYear] = useState('');

  const isDark = theme === 'dark';

  // Check if an email exists locally or in SQLite database
  const lookupEmail = async (emailToCheck) => {
    const clean = emailToCheck.trim().toLowerCase();
    if (!clean) {
      setExistingUser(null);
      setIsNewUserStep(false);
      setShowPasswordInput(false);
      return;
    }

    // 1. Check local saved list first
    const localMatch = savedAccounts.find(a => a.email?.toLowerCase() === clean);
    if (localMatch) {
      setExistingUser(localMatch);
      // If the local match already holds a valid token, we can allow 1-click continuation
      if (localMatch.token) {
        setShowPasswordInput(false);
      } else {
        setShowPasswordInput(true);
      }
      return;
    }

    // 2. Check backend API
    try {
      const resp = await fetch('/api/auth/check-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: clean })
      });
      if (resp.ok) {
        const data = await resp.json();
        if (data.exists && data.user) {
          setExistingUser(data.user);
          setShowPasswordInput(true);
          return;
        }
      }
    } catch {
      // Backend lookup failed, proceed with local check
    }

    setExistingUser(null);
    setShowPasswordInput(false);
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
      setShowPasswordInput(false);
    }
  };

  // Step 1: User submits email / password
  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setInputError('');
    const cleanEmail = emailInput.trim().toLowerCase();

    if (!cleanEmail || !/^\S+@\S+\.\S+$/.test(cleanEmail)) {
      setInputError('Please enter a valid email address.');
      return;
    }

    // If returning user has a saved active token on this device, log in immediately!
    const localProfile = savedAccounts.find(a => a.email?.toLowerCase() === cleanEmail);
    if (localProfile?.token && !showPasswordInput) {
      setIsSubmitting(true);
      try {
        const verifyResp = await fetch('/api/auth/me', {
          headers: { 'Authorization': `Bearer ${localProfile.token}` }
        });
        if (verifyResp.ok) {
          const verifyData = await verifyResp.json();
          onLogin(verifyData.user, localProfile.token);
          return;
        }
      } catch {
        // Token invalid, fall through to password prompt
      } finally {
        setIsSubmitting(false);
      }
    }

    // If user is recognized and password field is visible: authenticate with backend
    if (existingUser || showPasswordInput) {
      if (!passwordInput) {
        setShowPasswordInput(true);
        setInputError('Please enter your account password (or default: Beep@2026).');
        return;
      }

      setIsSubmitting(true);
      try {
        const resp = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: cleanEmail,
            password: passwordInput
          })
        });

        const data = await resp.json();
        if (!resp.ok) {
          throw new Error(data.error || 'Authentication failed. Please check your credentials.');
        }

        // Save token and profile to local device list
        const updatedProfile = { ...data.user, token: data.token };
        const currentList = JSON.parse(localStorage.getItem('beep_registered_students') || '[]');
        const updatedList = [updatedProfile, ...currentList.filter(u => u.email?.toLowerCase() !== cleanEmail)];
        localStorage.setItem('beep_registered_students', JSON.stringify(updatedList));
        setSavedAccounts(updatedList);

        onLogin(data.user, data.token);
      } catch (err) {
        setInputError(err.message || 'Login failed. Please try again.');
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    // If new user: advance to registration details form
    setIsNewUserStep(true);
  };

  // Step 2: New student registers their details
  const handleRegistrationSubmit = async (e) => {
    e.preventDefault();
    setInputError('');
    const cleanEmail = emailInput.trim().toLowerCase();
    const cleanName = fullName.trim();
    const cleanPass = regPassword.trim();
    const cleanCollege = collegeName.trim();
    const cleanYear = gradYear.trim();

    if (!cleanName) {
      setInputError('Please enter your full name.');
      return;
    }
    if (cleanPass.length < 6) {
      setInputError('Password must be at least 6 characters.');
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
          college: cleanCollege || 'College Student (India)',
          graduationYear: cleanYear || '2026'
        })
      });

      const data = await resp.json();
      if (!resp.ok) {
        throw new Error(data.error || 'Registration failed. Please try again.');
      }

      // Persist in saved profiles with token
      const newProfile = { ...data.user, token: data.token };
      const currentList = JSON.parse(localStorage.getItem('beep_registered_students') || '[]');
      const updatedList = [newProfile, ...currentList.filter(u => u.email?.toLowerCase() !== cleanEmail)];
      localStorage.setItem('beep_registered_students', JSON.stringify(updatedList));
      setSavedAccounts(updatedList);

      onLogin(data.user, data.token);
    } catch (err) {
      setInputError(err.message || 'Registration failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Direct login by clicking a saved student card
  const handleQuickLogin = (account) => {
    setEmailInput(account.email);
    setExistingUser(account);
    if (account.token) {
      // Direct session continuation
      onLogin(account, account.token);
    } else {
      setShowPasswordInput(true);
      setPasswordInput('Beep@2026');
    }
  };

  // Remove a saved profile from local list
  const handleRemoveAccount = (e, emailToRemove) => {
    e.stopPropagation();
    const updated = savedAccounts.filter(a => a.email !== emailToRemove);
    setSavedAccounts(updated);
    localStorage.setItem('beep_registered_students', JSON.stringify(updated));
    if (existingUser?.email === emailToRemove) {
      setExistingUser(null);
      setShowPasswordInput(false);
    }
  };

  // Evaluator / Fast Demo Login (creates/authenticates evaluator with genuine JWT)
  const handleGuestLogin = async () => {
    setIsSubmitting(true);
    setInputError('');
    try {
      // Attempt login first
      const loginResp = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'guest.student@beep.edu',
          password: 'Guest@Beep2026'
        })
      });

      if (loginResp.ok) {
        const data = await loginResp.json();
        onLogin(data.user, data.token);
        return;
      }

      // If not yet created, register evaluator
      const regResp = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Student Guest (Evaluator)',
          email: 'guest.student@beep.edu',
          password: 'Guest@Beep2026',
          college: 'Founder’s Office Evaluator',
          graduationYear: '2026'
        })
      });

      if (regResp.ok) {
        const data = await regResp.json();
        onLogin(data.user, data.token);
        return;
      }

      // Offline fallback
      onLogin({
        name: 'Student Guest',
        email: 'guest.student@beep.edu',
        college: 'Campus Job Seeker',
        avatar: null
      }, 'demo_token');
    } catch {
      onLogin({
        name: 'Student Guest',
        email: 'guest.student@beep.edu',
        college: 'Campus Job Seeker',
        avatar: null
      }, 'demo_token');
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

        <div className="flex items-center gap-2 text-xs">
          <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full border text-[11px] ${
            isDark ? 'bg-slate-900 border-slate-800 text-emerald-400' : 'bg-emerald-50 border-emerald-200 text-emerald-700'
          }`}>
            <Shield className="w-3.5 h-3.5" />
            <span>SQLite & JWT Protected</span>
          </div>
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
                  ? 'First time here? Register once with your password and access your applications anytime.'
                  : 'Enter your email to verify your internship match and access your tracking pipeline.'
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

            {/* STEP 1: Enter Email & Password Form */}
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
                          {existingUser.college || 'Verified Student Profile'}
                        </span>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                      Profile Verified
                    </span>
                  </div>
                )}

                {/* Password Input (Shown for returning users or when required) */}
                {showPasswordInput && (
                  <div className="animate-fadeIn">
                    <div className="flex items-center justify-between mb-1.5">
                      <label className={`block text-xs font-bold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                        Account Password
                      </label>
                      <span className={`text-[10px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        Default demo: <code className="text-purple-500 font-semibold">Beep@2026</code>
                      </span>
                    </div>
                    <div className="relative">
                      <Lock className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                      <input
                        type="password"
                        placeholder="Enter password"
                        value={passwordInput}
                        onChange={(e) => setPasswordInput(e.target.value)}
                        className={`w-full text-xs pl-10 pr-4 py-3 rounded-2xl border focus:outline-none focus:ring-2 focus:ring-purple-500 transition ${
                          isDark 
                            ? 'bg-slate-950 border-slate-800 text-white placeholder-slate-500' 
                            : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400'
                        }`}
                      />
                    </div>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full flex items-center justify-center gap-2 py-3.5 px-5 rounded-2xl font-bold text-xs bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-lg shadow-purple-600/30 transition transform hover:-translate-y-0.5 cursor-pointer disabled:opacity-60"
                >
                  {isSubmitting ? (
                    <span>Authenticating...</span>
                  ) : existingUser && !showPasswordInput ? (
                    <>
                      <LogIn className="w-4 h-4" />
                      <span>Continue as {existingUser.name} ➔</span>
                    </>
                  ) : showPasswordInput ? (
                    <>
                      <Key className="w-4 h-4" />
                      <span>Sign In Securely ➔</span>
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
                    disabled={isSubmitting}
                    className={`w-full py-2.5 px-4 rounded-xl text-xs font-semibold border transition ${
                      isDark
                        ? 'border-slate-800 bg-slate-950/60 hover:bg-slate-800 text-slate-400 hover:text-slate-200'
                        : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Quick Evaluator Access (Demo Student) ➔
                  </button>
                </div>

              </form>
            ) : (
              /* STEP 2: New Student Details & Registration Form */
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
                    Set Account Password <span className="text-purple-500">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                    <input
                      type="password"
                      required
                      placeholder="At least 6 characters"
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
                    disabled={isSubmitting}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-bold text-xs bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-md transition cursor-pointer disabled:opacity-60"
                  >
                    <span>{isSubmitting ? 'Registering...' : 'Save Profile & Enter Radar'}</span>
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
                <Shield className="w-3.5 h-3.5 text-purple-500 shrink-0" />
                <span>Cryptographically secured: Password hashing + Signed JWT tokens</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-purple-500 shrink-0" />
                <span>Isolated applications: Students can only view their own records</span>
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
