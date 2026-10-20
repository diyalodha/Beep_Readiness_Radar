import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import TopNav from './components/TopNav';
import DashboardOverview from './components/DashboardOverview';
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

  // Active navigation tab (matching the dashboard layout in the reference design)
  const [activeTab, setActiveTab] = useState('overview');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

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
  const _activeCompany = isCustomJob ? 'Custom Job' : selectedInternship?.company;

  // 2. Main Authenticated Application Dashboard Layout
  return (
    <div className={`min-h-screen flex transition-colors duration-200 ${
      isDark ? 'bg-slate-950 text-slate-100' : 'bg-slate-50/80 text-slate-900'
    }`}>
      
      {/* Persistent Modern Left Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        theme={theme}
        user={user}
        onLogout={handleLogout}
        applicationsCount={applications.length}
        hasAuditResult={Boolean(result)}
        isOpenMobile={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        
        {/* Top Header Bar */}
        <TopNav
          activeTab={activeTab}
          theme={theme}
          toggleTheme={toggleTheme}
          user={user}
          onLogout={handleLogout}
          applicationsCount={applications.length}
          onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />

        {/* Dynamic View Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-6xl w-full mx-auto">
          
          {/* Error Banner */}
          {errorMessage && (
            <div className="mb-6">
              <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/40 text-rose-500 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            </div>
          )}

          {/* TAB 1: OVERVIEW (Matching the screenshot exactly) */}
          {activeTab === 'overview' && (
            <DashboardOverview
              user={user}
              result={result}
              resumeText={resumeText}
              fileName={fileName}
              selectedInternship={selectedInternship}
              applications={applications}
              onNavigate={(tab) => setActiveTab(tab)}
              theme={theme}
            />
          )}

          {/* TAB 2: RESUME AUDITOR */}
          {activeTab === 'resume' && (
            <div className="space-y-6 animate-fadeIn pb-12">
              <div className={`p-6 rounded-3xl border ${
                isDark ? 'bg-slate-900/70 border-slate-800' : 'bg-white border-slate-200'
              }`}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      isDark ? 'bg-purple-950/60 border-purple-500/40 text-purple-300' : 'bg-purple-50 border-purple-200 text-purple-700'
                    }`}>
                      Resume Ingestion & Parsing
                    </span>
                    <h2 className="text-xl sm:text-2xl font-black tracking-tight mt-1">
                      Upload or Select Candidate Resume
                    </h2>
                    <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      Drop your PDF or DOCX file to extract text, skills, and project links client-side.
                    </p>
                  </div>

                  {resumeText && (
                    <button
                      onClick={() => setActiveTab('matcher')}
                      className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md transition cursor-pointer flex items-center gap-2 shrink-0"
                    >
                      <span>Proceed to JD Matcher</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

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
                    className="px-6 py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black text-xs shadow-lg shadow-purple-600/30 transition cursor-pointer inline-flex items-center gap-2"
                  >
                    <span>Target Role Matching & Audit</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: JD MATCHER & ROLES */}
          {activeTab === 'matcher' && (
            <div className="space-y-6 animate-fadeIn pb-12">
              <InternshipExplorer
                selectedInternship={selectedInternship}
                onSelectInternship={handleSelectInternship}
                onCustomJobSelect={handleCustomJobSelect}
                isCustomJob={isCustomJob}
                theme={theme}
              />

              {/* Audit Trigger CTA */}
              <div className="p-4 sm:p-6 rounded-3xl border text-center transition-colors shadow-sm space-y-3 bg-gradient-to-b from-purple-900/10 to-transparent dark:from-purple-950/20 border-purple-500/30">
                <div>
                  <h3 className="text-base font-extrabold">
                    Ready to evaluate your readiness for {activeJobTitle}?
                  </h3>
                  <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    {resumeText ? `Using attached resume: ${fileName || 'Active resume'}` : 'Please attach your resume in the Resume tab first.'}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleAnalyze}
                  disabled={isLoading || !resumeText.trim()}
                  className={`px-8 py-3.5 rounded-2xl font-black text-xs shadow-xl transition-all ${
                    isLoading || !resumeText.trim()
                      ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed border border-slate-300 dark:border-slate-700'
                      : 'bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-500 hover:from-purple-500 hover:to-indigo-500 text-white shadow-purple-600/30 hover:shadow-purple-600/50 cursor-pointer transform hover:-translate-y-0.5'
                  }`}
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Auditing readiness against {activeJobTitle}...</span>
                    </span>
                  ) : !resumeText.trim() ? (
                    <span className="flex items-center gap-2" onClick={() => setActiveTab('resume')}>
                      <FileText className="w-4 h-4" />
                      <span>Attach Resume in Resume Tab</span>
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
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                />
              )}
            </div>
          )}

          {/* TAB 4: ROADMAP & 48-HR BLUEPRINT */}
          {activeTab === 'roadmap' && (
            <RoadmapFocusedView
              result={result}
              selectedInternship={selectedInternship}
              onNavigate={(tab) => setActiveTab(tab)}
              theme={theme}
            />
          )}

          {/* TAB 5: ADAPTIVE QUIZ */}
          {activeTab === 'quiz' && (
            <AdaptiveQuizView
              theme={theme}
              onCompleteQuiz={(quizScore) => {
                console.log('Quiz completed with score:', quizScore);
              }}
            />
          )}

          {/* TAB 6: INTERVIEW PREPARATION */}
          {activeTab === 'interview' && (
            <InterviewFocusedView
              result={result}
              selectedInternship={selectedInternship}
              user={user}
              onNavigate={(tab) => setActiveTab(tab)}
              theme={theme}
            />
          )}

          {/* TAB 7: JOBS & APPLICATION TRACKER */}
          {activeTab === 'applications' && (
            <ApplicationsView
              applications={applications}
              onNavigate={(tab) => setActiveTab(tab)}
              theme={theme}
            />
          )}

          {/* TAB 8: PLACEMENT & CANDIDATE ANALYTICS */}
          {activeTab === 'analytics' && (
            <div className="pb-12 animate-fadeIn">
              <StatisticsModal
                isOpen={true}
                isInline={true}
                onClose={() => setActiveTab('overview')}
                theme={theme}
                user={user}
                result={result}
                applications={applications}
              />
            </div>
          )}

        </main>

        {/* Global Modals */}
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

        <ApplicationTrackerModal
          isOpen={isApplicationsOpen}
          onClose={() => setIsApplicationsOpen(false)}
          applications={applications}
          theme={theme}
        />

        <StatisticsModal
          isOpen={isStatsModalOpen}
          isInline={false}
          onClose={() => setIsStatsModalOpen(false)}
          theme={theme}
          user={user}
          result={result}
          applications={applications}
        />

      </div>

    </div>
  );
}
