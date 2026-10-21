import React, { useState, useEffect } from 'react';
import AppHeader from './components/AppHeader';
import DynamicHero from './components/DynamicHero';
import RoadmapFocusedView from './components/RoadmapFocusedView';
import AdaptiveQuizView from './components/AdaptiveQuizView';
import InterviewFocusedView from './components/InterviewFocusedView';
import ApplicationsView from './components/ApplicationsView';
import LoginScreen from './components/LoginScreen';
import InternshipExplorer from './components/InternshipExplorer';
import ResumeUploader from './components/ResumeUploader';
import ResultsView from './components/ResultsView';
import ApplicationModal from './components/ApplicationModal';
import ApplicationTrackerModal from './components/ApplicationTrackerModal';
import StatisticsModal from './components/StatisticsModal';
import { INTERNSHIPS } from './data/sampleRoles';
import { runDynamicHeuristicAnalysis } from './utils/heuristicCore';
import { AlertTriangle, Sparkles, ArrowRight, RefreshCw, FileText } from 'lucide-react';

export default function App() {
  // Theme state: dark / light
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('beep_theme') || 'dark';
  });

  // Active navigation tab ('matcher' | 'resume' | 'roadmap' | 'interview' | 'quiz' | 'applications' | 'analytics')
  const [activeTab, setActiveTab] = useState('matcher');

  // User state: logged in user profile & JWT token
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('beep_user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(() => {
    return localStorage.getItem('beep_token') || '';
  });

  // Verify session validity with backend on boot
  useEffect(() => {
    const savedToken = localStorage.getItem('beep_token');
    if (savedToken) {
      fetch('/api/auth/me', {
        headers: { 'Authorization': `Bearer ${savedToken}` }
      })
        .then(res => {
          if (res.ok) return res.json();
          throw new Error('Session invalid');
        })
        .then(data => {
          if (data?.user) {
            setUser(data.user);
            localStorage.setItem('beep_user', JSON.stringify(data.user));
          }
        })
        .catch(() => {
          setUser(null);
          setToken('');
          localStorage.removeItem('beep_token');
          localStorage.removeItem('beep_user');
        });
    }
  }, []);

  // Applications Tracker state
  const [isApplicationsOpen, setIsApplicationsOpen] = useState(false);
  const [applications, setApplications] = useState(() => {
    try {
      const saved = localStorage.getItem('beep_applications');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Statistics Modal state
  const [isStatsModalOpen, setIsStatsModalOpen] = useState(false);

  const [_apiStatus, setApiStatus] = useState({
    aiEnabled: false,
    engine: 'Checking engine...',
    message: ''
  });

  // Flow State
  const [selectedInternship, setSelectedInternship] = useState(INTERNSHIPS[0]);
  const [isCustomJob, setIsCustomJob] = useState(false);
  const [customRoleTitle, setCustomRoleTitle] = useState('');
  const [customJd, setCustomJd] = useState('');

  // Resume State (Empty by default so user sees the dropzone)
  const [resumeText, setResumeText] = useState('');
  const [fileName, setFileName] = useState('');

  // Analysis & Execution State
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  // Apply Modal State
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);

  // Sync theme class
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('beep_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  const handleLogin = (userData, userToken) => {
    setApplications([]);
    setUser(userData);
    const tokenVal = userToken || '';
    setToken(tokenVal);
    localStorage.setItem('beep_user', JSON.stringify(userData));
    if (tokenVal) {
      localStorage.setItem('beep_token', tokenVal);
    }
    localStorage.removeItem('beep_registered_students');
  };

  const handleLogout = () => {
    setUser(null);
    setToken('');
    setApplications([]);
    setResult(null);
    setResumeText('');
    setFileName('');
    setErrorMessage('');
    localStorage.removeItem('beep_user');
    localStorage.removeItem('beep_token');
    localStorage.removeItem('beep_applications');
    localStorage.removeItem('beep_registered_students');
  };

  // Sync applications from backend (strictly authorized by JWT token)
  useEffect(() => {
    if (!token) return;
    fetch('/api/applications', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
      .then(res => {
        if (res.status === 401) {
          handleLogout();
          throw new Error('Session expired. Please sign in again.');
        }
        if (!res.ok) throw new Error(`HTTP error ${res.status}`);
        return res.json();
      })
      .then(data => {
        if (data?.applications && Array.isArray(data.applications)) {
          setApplications(data.applications);
          localStorage.setItem('beep_applications', JSON.stringify(data.applications));
        }
      })
      .catch(err => {
        console.warn('Could not fetch server applications:', err.message);
      });
  }, [token]);

  const handleApplicationSubmitted = (newApp) => {
    setApplications(prev => {
      const updated = [newApp, ...prev.filter(a => a.refId !== newApp.refId)];
      localStorage.setItem('beep_applications', JSON.stringify(updated));
      return updated;
    });
  };

  // Check backend engine status on load
  useEffect(() => {
    fetch('/api/status')
      .then(res => res.json())
      .then(data => setApiStatus(data))
      .catch(err => {
        console.warn('Backend not responding to /api/status, using client simulation mode:', err);
        setApiStatus({
          aiEnabled: false,
          engine: 'Dynamic Demo Engine (Client Mode)',
          message: 'Backend server offline. Running high-fidelity local simulation.'
        });
      });
  }, []);

  const handleSelectInternship = (job) => {
    setSelectedInternship(job);
    setIsCustomJob(false);
    setErrorMessage('');
  };

  const handleCustomJobSelect = () => {
    setIsCustomJob(true);
    setSelectedInternship(null);
    setErrorMessage('');
  };

  const handleSelectSampleResume = (resumeObj) => {
    setResumeText(resumeObj.content);
    setFileName(`${resumeObj.label.replace(/\s+/g, '_')}.pdf`);
    setErrorMessage('');
  };

  const handleRemoveResume = () => {
    setResumeText('');
    setFileName('');
    setResult(null);
    setErrorMessage('');
  };

  const handleAnalyze = async (e) => {
    e?.preventDefault();

    const targetJobText = isCustomJob ? customJd : selectedInternship?.description;
    const roleTitle = isCustomJob ? customRoleTitle : selectedInternship?.title;
    const company = isCustomJob ? 'Custom Partner' : selectedInternship?.company;

    if (!resumeText.trim()) {
      setErrorMessage('Please attach or paste a resume before auditing.');
      setActiveTab('resume');
      return;
    }

    if (!targetJobText?.trim()) {
      setErrorMessage('Please select an internship or provide a custom job description.');
      setActiveTab('matcher');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentSkills: resumeText,
          jobDescription: targetJobText,
          targetRole: roleTitle || 'Internship Role',
          companyName: company || 'Hiring Company'
        })
      });

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}: Failed to analyze`);
      }

      const data = await response.json();
      setResult(data);
      setActiveTab('matcher');

      setTimeout(() => {
        const el = document.getElementById('results-section');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (err) {
      console.error('API call failed, running client heuristic:', err);
      let clientResult = null;
      try {
        clientResult = runDynamicHeuristicAnalysis(
          resumeText,
          targetJobText || '',
          (roleTitle || 'Internship Candidate'),
          (company || 'Hiring Company')
        );
        clientResult.engine = 'Client Heuristic Fallback (Backend Offline)';
        clientResult.fallbackNotice = 'Backend server was unreachable. Scoring was computed locally from your actual resume text using the same heuristic engine.';
      } catch (innerErr) {
        console.error('Client heuristic also failed:', innerErr);
        setErrorMessage('Analysis failed both on the server and locally. Please check your inputs and try again.');
        setIsLoading(false);
        return;
      }

      setResult(clientResult);
      setActiveTab('matcher');

      setTimeout(() => {
        const el = document.getElementById('results-section');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } finally {
      setIsLoading(false);
    }
  };

  const isDark = theme === 'dark';

  // 1. Login Gate
  if (!user) {
    return (
      <LoginScreen
        onLogin={handleLogin}
        theme={theme}
        toggleTheme={toggleTheme}
      />
    );
  }

  const activeJobTitle = isCustomJob ? (customRoleTitle || 'Custom Role') : selectedInternship?.title;

  // 2. Main Authenticated Application with Centered Dynamic Hero & Top Navigation
  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-200 ${
      isDark ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'
    }`}>
      
      {/* Top Header Bar with 3-Lines Menu & Feature Navigation */}
      <AppHeader
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        theme={theme}
        toggleTheme={toggleTheme}
        user={user}
        onLogout={handleLogout}
        applicationsCount={applications.length}
        hasResult={Boolean(result)}
      />

      {/* Bold Centered Dynamic Hero (Adapts headline & subtitle to current feature) */}
      <DynamicHero activeTab={activeTab} theme={theme} />

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 py-6">
        
        {/* Error Banner */}
        {errorMessage && (
          <div className="mb-6">
            <div className="p-3.5 rounded-2xl bg-rose-500/10 border-2 border-rose-500/40 text-rose-600 dark:text-rose-400 text-xs font-semibold flex items-center gap-2 shadow-xs">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          </div>
        )}

        {/* FEATURE 1: ROLES & JD MATCHER */}
        {activeTab === 'matcher' && (
          <div className="space-y-6 animate-fadeIn pb-12">
            <InternshipExplorer
              selectedInternship={selectedInternship}
              onSelectInternship={handleSelectInternship}
              onCustomJobSelect={handleCustomJobSelect}
              isCustomJob={isCustomJob}
              theme={theme}
            />

            {/* Quick Resume Reminder if not attached */}
            {!resumeText && (
              <div className={`p-4 rounded-3xl border-2 flex items-center justify-between text-xs transition-all ${
                isDark ? 'bg-slate-900/90 border-slate-700 text-slate-200' : 'bg-white border-slate-300 text-slate-800 shadow-xs'
              }`}>
                <div className="flex items-center gap-2.5">
                  <FileText className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  <span className="font-semibold">No resume attached yet. Attach your resume to evaluate readiness.</span>
                </div>
                <button
                  onClick={() => setActiveTab('resume')}
                  className="px-3.5 py-1.5 rounded-xl font-bold bg-purple-600 hover:bg-purple-500 text-white shadow-xs transition cursor-pointer"
                >
                  Attach Resume
                </button>
              </div>
            )}

            {/* Audit Trigger CTA */}
            <div className={`p-6 sm:p-8 rounded-3xl border-2 text-center transition-all shadow-sm space-y-3 ${
              isDark 
                ? 'bg-gradient-to-b from-purple-950/30 to-slate-900 border-purple-500/40' 
                : 'bg-gradient-to-b from-purple-50/80 to-white border-purple-300 shadow-md'
            }`}>
              <div>
                <h3 className={`text-base sm:text-lg font-black ${isDark ? 'text-white' : 'text-slate-950'}`}>
                  Evaluate Technical Readiness for {activeJobTitle}
                </h3>
                <p className={`text-xs mt-1 font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  {resumeText ? `Using attached file: ${fileName || 'Active resume'}` : 'Click below or switch to the Resume tab to attach your profile.'}
                </p>
              </div>

              <button
                type="button"
                onClick={handleAnalyze}
                disabled={isLoading || !resumeText.trim()}
                className={`px-8 py-3.5 rounded-2xl font-black text-xs sm:text-sm shadow-xl transition-all ${
                  isLoading || !resumeText.trim()
                    ? 'bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-500 cursor-not-allowed border-2 border-slate-300 dark:border-slate-700'
                    : 'bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-500 hover:from-purple-500 hover:to-indigo-500 text-white shadow-purple-600/30 hover:shadow-purple-600/50 cursor-pointer transform hover:-translate-y-0.5'
                }`}
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Auditing {fileName || 'Resume'} against {activeJobTitle}...</span>
                  </span>
                ) : !resumeText.trim() ? (
                  <span className="flex items-center gap-2" onClick={() => setActiveTab('resume')}>
                    <FileText className="w-4 h-4" />
                    <span>Attach Resume to Enable Audit</span>
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    <span>Audit Readiness for {activeJobTitle}</span>
                    <ArrowRight className="w-4 h-4" />
                  </span>
                )}
              </button>
            </div>

            {/* Detailed Results View */}
            {result && (
              <ResultsView
                result={result}
                theme={theme}
                onApplyClick={() => setIsApplyModalOpen(true)}
                onNewAudit={() => {
                  setResult(null);
                  window.scrollTo({ top: 350, behavior: 'smooth' });
                }}
              />
            )}
          </div>
        )}

        {/* FEATURE 2: RESUME AUDITOR */}
        {activeTab === 'resume' && (
          <div className="space-y-6 animate-fadeIn pb-12">
            <ResumeUploader
              resumeText={resumeText}
              setResumeText={setResumeText}
              fileName={fileName}
              setFileName={setFileName}
              onSelectSampleResume={handleSelectSampleResume}
              onRemoveResume={handleRemoveResume}
              isCustomJob={isCustomJob}
              customJd={customJd}
              setCustomJd={setCustomJd}
              customRoleTitle={customRoleTitle}
              setCustomRoleTitle={setCustomRoleTitle}
              theme={theme}
            />

            {resumeText && (
              <div className="text-center pt-2">
                <button
                  onClick={() => setActiveTab('matcher')}
                  className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-extrabold text-xs sm:text-sm shadow-lg shadow-purple-600/30 transition cursor-pointer inline-flex items-center gap-2"
                >
                  <span>Proceed to Target JD Matcher & Audit</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        )}

        {/* FEATURE 3: 48-HOUR ROADMAP */}
        {activeTab === 'roadmap' && (
          <RoadmapFocusedView
            result={result}
            selectedInternship={selectedInternship}
            onNavigate={(tab) => setActiveTab(tab)}
            theme={theme}
          />
        )}

        {/* FEATURE 4: INTERVIEW PREPARATION */}
        {activeTab === 'interview' && (
          <InterviewFocusedView
            result={result}
            selectedInternship={selectedInternship}
            user={user}
            onNavigate={(tab) => setActiveTab(tab)}
            theme={theme}
          />
        )}

        {/* FEATURE 5: ADAPTIVE TECH QUIZ */}
        {activeTab === 'quiz' && (
          <AdaptiveQuizView
            theme={theme}
            onCompleteQuiz={(quizScore) => {
              console.log('Quiz completed with score:', quizScore);
            }}
          />
        )}

        {/* FEATURE 6: APPLICATIONS PIPELINE */}
        {activeTab === 'applications' && (
          <ApplicationsView
            applications={applications}
            onNavigate={(tab) => setActiveTab(tab)}
            theme={theme}
          />
        )}

        {/* FEATURE 7: PLACEMENT & CANDIDATE ANALYTICS */}
        {activeTab === 'analytics' && (
          <div className="pb-12 animate-fadeIn">
            <StatisticsModal
              isOpen={true}
              isInline={true}
              onClose={() => setActiveTab('matcher')}
              theme={theme}
              user={user}
              result={result}
              applications={applications}
            />
          </div>
        )}

      </main>

      {/* Global Application Submission Modal */}
      <ApplicationModal
        isOpen={isApplyModalOpen}
        onClose={() => setIsApplyModalOpen(false)}
        internship={selectedInternship || { title: customRoleTitle, company: 'Custom Partner' }}
        result={result}
        user={user}
        token={token}
        theme={theme}
        onApplicationSubmitted={handleApplicationSubmitted}
      />

      {/* Applications Tracker Modal */}
      <ApplicationTrackerModal
        isOpen={isApplicationsOpen}
        onClose={() => setIsApplicationsOpen(false)}
        applications={applications}
        theme={theme}
      />

      {/* Campus Placement & Hiring Statistics Modal */}
      <StatisticsModal
        isOpen={isStatsModalOpen}
        isInline={false}
        onClose={() => setIsStatsModalOpen(false)}
        theme={theme}
        user={user}
        result={result}
        applications={applications}
      />

      {/* Clean Centered Footer with Strong Contrast */}
      <footer className={`border-t py-8 text-center text-xs transition-colors duration-200 mt-auto ${
        isDark ? 'border-slate-800 bg-slate-950 text-slate-400' : 'border-slate-300 bg-white text-slate-700 shadow-2xs'
      }`}>
        <div className="max-w-4xl mx-auto px-4 space-y-2">
          <p className={`font-extrabold text-sm ${isDark ? 'text-white' : 'text-slate-950'}`}>
            EventBeep Founder’s Office • Internship Readiness Radar
          </p>
          <p className={`text-xs font-semibold ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            Closing the student Actionability Gap with transparent skill diagnostics, weekend proof-of-work project blueprints, and authenticated application tracking.
          </p>
        </div>
      </footer>

    </div>
  );
}
