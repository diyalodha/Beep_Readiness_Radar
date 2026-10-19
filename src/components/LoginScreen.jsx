import React, { useState, useEffect } from 'react';
import { Sparkles, Shield, CheckCircle2, Sun, Moon, UserCheck, ArrowRight, X, Building, Mail, User } from 'lucide-react';

// Safe client-side JWT decoder for Google Identity credential token
function parseJwt(token) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

export default function LoginScreen({ onLogin, theme, toggleTheme }) {
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [customEmail, setCustomEmail] = useState('');
  const [customName, setCustomName] = useState('');
  const [customCollege, setCustomCollege] = useState('');
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

  const isDark = theme === 'dark';

  // Initialize official Google Identity Services if a client ID is available
  useEffect(() => {
    if (!googleClientId) return;

    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => {
      if (window.google?.accounts?.id) {
        window.google.accounts.id.initialize({
          client_id: googleClientId,
          callback: (response) => {
            const data = parseJwt(response.credential);
            if (data) {
              onLogin({
                name: data.name || data.given_name || 'Google Student',
                email: data.email,
                avatar: data.picture || null,
                college: 'Verified Google Student',
                _verifiedGoogle: true
              });
            }
          }
        });

        const targetEl = document.getElementById('gsi-button-container');
        if (targetEl) {
          window.google.accounts.id.renderButton(targetEl, {
            theme: isDark ? 'filled_black' : 'outline',
            size: 'large',
            shape: 'pill',
            text: 'continue_with',
            width: 320
          });
        }
      }
    };
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, [googleClientId, isDark, onLogin]);

  // Fast 1-Click Sandbox Student Login
  const handleFastStudentLogin = () => {
    onLogin({
      name: 'Priya Sharma',
      email: 'priya.sharma@college.edu',
      college: 'Pre-final Year B.Tech CSE (Tier-2/3)',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&h=120&fit=crop&crop=faces',
      _demo: true
    });
  };

  const handleCustomSubmit = (e) => {
    e.preventDefault();
    if (!customEmail) return;
    const name = customName.trim() || customEmail.split('@')[0];
    onLogin({
      name,
      email: customEmail,
      college: customCollege.trim() || 'College Student (India)',
      avatar: null,
      _custom: true
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
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 mb-3">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Student Career Portal</span>
              </div>
              <h2 className={`text-2xl font-extrabold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Sign In to Beep Radar
              </h2>
              <p className={`text-xs mt-1.5 leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Audit your college resume against real internship job descriptions and unlock your 7-day action sprint.
              </p>
            </div>

            {/* Quick Sandbox Access Badge */}
            <div className={`mb-5 p-3 rounded-2xl border flex items-center gap-3 text-xs ${
              isDark ? 'bg-purple-950/30 border-purple-500/30 text-purple-200' : 'bg-purple-50/70 border-purple-200 text-purple-900'
            }`}>
              <UserCheck className="w-5 h-5 text-purple-500 shrink-0" />
              <div className="flex-1">
                <span className="font-bold block">Instant Sandbox Access</span>
                <span className="opacity-80 text-[11px]">Explore all features immediately with zero friction.</span>
              </div>
            </div>

            {/* Login Actions */}
            <div className="space-y-3">
              
              {/* Primary 1-Click Fast Student Access */}
              <button
                type="button"
                onClick={handleFastStudentLogin}
                className="w-full flex items-center justify-between px-5 py-3.5 rounded-2xl font-bold text-xs bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-lg shadow-purple-600/30 transition transform hover:-translate-y-0.5 cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center font-bold text-xs">
                    P
                  </div>
                  <div className="text-left">
                    <span className="block leading-tight">One-Click Fast Access</span>
                    <span className="text-[10px] font-normal opacity-90">Priya Sharma (B.Tech Pre-Final)</span>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 opacity-80" />
              </button>

              {/* Official Google GIS Button Container (if Google Client ID provided) */}
              {googleClientId ? (
                <div id="gsi-button-container" className="flex justify-center pt-1" />
              ) : (
                /* Google OAuth Button with Configuration Modal */
                <button
                  type="button"
                  onClick={() => setShowGoogleModal(true)}
                  className={`w-full flex items-center justify-center gap-3 px-5 py-3 rounded-2xl border font-semibold text-xs transition-all cursor-pointer shadow-sm hover:shadow-md ${
                    isDark
                      ? 'bg-slate-950 hover:bg-slate-800/80 border-slate-700 text-white'
                      : 'bg-white hover:bg-slate-50 border-slate-300 text-slate-800'
                  }`}
                >
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                  </svg>
                  <span>Continue with Google / Gmail</span>
                </button>
              )}

              {/* Custom Student Profile Button */}
              <button
                type="button"
                onClick={() => setShowCustomModal(true)}
                className={`w-full py-2.5 px-4 rounded-xl text-xs font-semibold border transition ${
                  isDark
                    ? 'border-slate-800 bg-slate-950/60 hover:bg-slate-800 text-slate-300'
                    : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700'
                }`}
              >
                Sign in with Your Own Details ➔
              </button>

            </div>

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
                <span>Transparent scoring: No hidden algorithm black holes</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-purple-500 shrink-0" />
                <span>Includes 48-hr proof-of-work project & recruiter cold pitches</span>
              </div>
              <div className="flex items-start gap-2">
                <Shield className="w-3.5 h-3.5 text-purple-500 shrink-0 mt-0.5" />
                <span>Your uploaded resume is audited in real-time and never shared.</span>
              </div>
            </div>

          </div>

          <p className={`text-center text-[11px] mt-4 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
            Beep AI Career Platform • Fast-Track Internship Radar
          </p>

        </div>
      </main>

      {/* Google OAuth Modal (Explains live Google Cloud integration + instant option) */}
      {showGoogleModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className={`max-w-md w-full rounded-3xl p-6 border shadow-2xl relative ${
            isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                </svg>
                <h3 className="font-extrabold text-sm">Google Sign-In Integration</h3>
              </div>
              <button 
                onClick={() => setShowGoogleModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="py-4 space-y-3 text-xs leading-relaxed">
              <p className={isDark ? 'text-slate-300' : 'text-slate-600'}>
                To enable live Google OAuth credentials in production, configure your Google Cloud Client ID in your environment:
              </p>

              <div className={`p-3 rounded-xl font-mono text-[11px] border ${
                isDark ? 'bg-slate-950 border-slate-800 text-purple-300' : 'bg-slate-100 border-slate-200 text-purple-800'
              }`}>
                VITE_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
              </div>

              <p className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                For instant preview and evaluation without setting up Google Cloud API keys, click below to proceed directly:
              </p>

              <div className="pt-2 space-y-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowGoogleModal(false);
                    handleFastStudentLogin();
                  }}
                  className="w-full py-2.5 rounded-xl font-bold text-xs bg-purple-600 hover:bg-purple-500 text-white shadow-md transition"
                >
                  Continue with Verified Student Profile (Priya Sharma)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowGoogleModal(false);
                    setShowCustomModal(true);
                  }}
                  className={`w-full py-2.5 rounded-xl font-semibold text-xs border transition ${
                    isDark ? 'border-slate-800 hover:bg-slate-800 text-slate-300' : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  Enter Your Custom Name & College
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Custom Student Modal */}
      {showCustomModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className={`max-w-md w-full rounded-3xl p-6 border shadow-2xl relative ${
            isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-purple-500" />
                <h3 className="font-extrabold text-sm">Create Your Student Profile</h3>
              </div>
              <button 
                onClick={() => setShowCustomModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCustomSubmit} className="pt-4 space-y-3">
              <div>
                <label className={`block text-[11px] font-bold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rahul Verma"
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    className={`w-full text-xs pl-9 pr-3 py-2.5 rounded-xl border focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                      isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className={`block text-[11px] font-bold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="email"
                    required
                    placeholder="rahul.verma@example.com"
                    value={customEmail}
                    onChange={(e) => setCustomEmail(e.target.value)}
                    className={`w-full text-xs pl-9 pr-3 py-2.5 rounded-xl border focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                      isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className={`block text-[11px] font-bold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  College / Degree
                </label>
                <div className="relative">
                  <Building className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="text"
                    placeholder="e.g. Final Year B.Tech CSE"
                    value={customCollege}
                    onChange={(e) => setCustomCollege(e.target.value)}
                    className={`w-full text-xs pl-9 pr-3 py-2.5 rounded-xl border focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                      isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                    }`}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowCustomModal(false)}
                  className={`px-3 py-2 rounded-xl text-xs border transition ${
                    isDark ? 'border-slate-800 text-slate-400 hover:text-white' : 'border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-500 text-white shadow-md transition"
                >
                  Enter Portal ➔
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
