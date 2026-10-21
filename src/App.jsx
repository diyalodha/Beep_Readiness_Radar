import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import LoginScreen from './components/LoginScreen';
import InternshipExplorer from './components/InternshipExplorer';
import ResumeUploader from './components/ResumeUploader';
import ResultsView from './components/ResultsView';
import RoadmapFocusedView from './components/RoadmapFocusedView';
import AdaptiveQuizView from './components/AdaptiveQuizView';
import InterviewFocusedView from './components/InterviewFocusedView';
import ApplicationsView from './components/ApplicationsView';
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

  // Active section for seamless feature navigation: 'matcher' | 'resume' | 'roadmap' | 'interview' | 'quiz' | 'applications' | 'analytics'
  const [activeSection, setActiveSection] = useState('matcher');

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

  const [apiStatus, setApiStatus] = useState({
    aiEnabled: false,
    engine: 'Checking engine...',
    message: ''
  });

  // Flow State
  const [selectedInternship, setSelectedInternship] = useState(INTERNSHIPS[0]);
  const [isCustomJob, setIsCustomJob] = useState(false);
  const [customRoleTitle, setCustomRoleTitle] = useState('');
  const [customJd, setCustomJd] = useState('');

  // Resume State
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
      setActiveSection('matcher');
      return;
    }

    if (!targetJobText?.trim()) {
      setErrorMessage('Please select an internship or provide a custom job description.');
      setActiveSection('matcher');
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
      setActiveSection('matcher');

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
      setActiveSection('matcher');

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

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-200 ${
      isDark ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'
    }`}>
      
      {/* 1. Full-Width Sticky Top Header with Feature Navigation Pills */}
      <Header
        apiStatus={apiStatus}
        user={user}
        onLogout={handleLogout}
        theme={theme}
        toggleTheme={toggleTheme}
        applicationsCount={applications.length}
        onOpenApplications={() => setActiveSection('applications')}
        onOpenStats={() => setActiveSection('analytics')}
        onNavigateSection={(sec) => setActiveSection(sec)}
        activeSection={activeSection}
      />

      {/* 2. Bold, Centered, Highlighted Hero Section */}
      <Hero
        theme={theme}
        onScrollToRoles={() => {
          setActiveSection('matcher');
          setTimeout(() => {
            const el = document.getElementById('roles-explorer-section');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }, 50);
        }}
        onOpenStats={() => setActiveSection('analytics')}
        onOpenQuiz={() => setActiveSection('quiz')}
      />

      {/* 3. Main Full-Width Content Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Error Notification */}
        {errorMessage && (
          <div className="max-w-4xl mx-auto mb-6">
            <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/40 text-rose-600 dark:text-rose-400 text-xs sm:text-sm font-bold flex items-center gap-2.5 shadow-sm">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          </div>
        )}

        {/* SECTION 1: ROLE EXPLORER, RESUME PARSER & COMPLETE AUDIT FLOW */}
        {activeSection === 'matcher' && (
          <div className="space-y-8 animate-fadeIn pb-16">
            
            {/* Step 1: Curated Roles */}
            <div id="roles-explorer-section">
              <InternshipExplorer
                selectedInternship={selectedInternship}
                onSelectInternship={handleSelectInternship}
                onCustomJobSelect={handleCustomJobSelect}
                isCustomJob={isCustomJob}
                theme={theme}
              />
            </div>

            {/* Step 2: Resume Ingestion */}
            <div id="resume-section">
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
            </div>

            {/* Step 3: Run Audit CTA */}
            <div className="max-w-4xl mx-auto px-4 text-center">
              <div className={`p-6 sm:p-8 rounded-3xl border transition-colors shadow-sm space-y-4 ${
                isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200'
              }`}>
                <div>
                  <h3 className="text-lg sm:text-xl font-black tracking-tight">
                    Evaluate Your Readiness for {activeJobTitle}
                  </h3>
                  <p className={`text-xs sm:text-sm mt-1 max-w-lg mx-auto font-medium ${
                    isDark ? 'text-slate-300' : 'text-slate-600'
                  }`}>
                    {resumeText ? `Using attached candidate resume: ${fileName || 'Ready'}` : 'Attach a resume or pick a sample student profile above to run the evaluation.'}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleAnalyze}
                  disabled={isLoading || !resumeText.trim()}
                  className={`w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-2xl font-black text-xs sm:text-sm shadow-xl transition-all ${
                    isLoading || !resumeText.trim()
                      ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed border border-slate-300 dark:border-slate-700'
                      : 'bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-500 hover:from-purple-500 hover:to-indigo-500 text-white shadow-purple-600/30 hover:shadow-purple-600/50 cursor-pointer transform hover:-translate-y-0.5'
                  }`}
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-white" />
                      <span>Auditing readiness against {activeJobTitle}...</span>
                    </>
                  ) : !resumeText.trim() ? (
                    <>
                      <FileText className="w-4 h-4 text-slate-400" />
                      <span>Attach Resume Above to Run Audit</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-purple-200" />
                      <span>Audit Readiness for {activeJobTitle}</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Step 4: Results & Diagnostics */}
            {result && (
              <div id="results-section">
                <ResultsView
                  result={result}
                  theme={theme}
                  onApplyClick={() => setIsApplyModalOpen(true)}
                  onNewAudit={() => {
                    setResult(null);
                    window.scrollTo({ top: 300, behavior: 'smooth' });
                  }}
                />
              </div>
            )}

          </div>
        )}

        {/* SECTION 2: DEDICATED RESUME PARSER */}
        {activeSection === 'resume' && (
          <div className="space-y-6 animate-fadeIn pb-16 max-w-5xl mx-auto">
            <div className={`p-6 rounded-3xl border flex items-center justify-between ${
              isDark ? 'bg-slate-900/70 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
            }`}>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
                  Client-Side Document Extraction
                </span>
                <h2 className="text-xl sm:text-2xl font-black mt-1">Resume Parser & Ingestion</h2>
                <p className={`text-xs mt-1 font-medium ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                  Drop any PDF or DOCX file to extract technical skills and verify formatting client-side.
                </p>
              </div>

              {resumeText && (
                <button
                  onClick={() => setActiveSection('matcher')}
                  className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md transition cursor-pointer flex items-center gap-2"
                >
                  <span>Go to Role Matcher</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
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
          </div>
        )}

        {/* SECTION 3: 48-HOUR PROJECT BLUEPRINT */}
        {activeSection === 'roadmap' && (
          <div className="animate-fadeIn">
            <RoadmapFocusedView
              result={result}
              selectedInternship={selectedInternship}
              onNavigate={(sec) => setActiveSection(sec)}
              theme={theme}
            />
          </div>
        )}

        {/* SECTION 4: INTERVIEW STAR PREP & COLD PITCH */}
        {activeSection === 'interview' && (
          <div className="animate-fadeIn">
            <InterviewFocusedView
              result={result}
              selectedInternship={selectedInternship}
              user={user}
              onNavigate={(sec) => setActiveSection(sec)}
              theme={theme}
            />
          </div>
        )}

        {/* SECTION 5: ADAPTIVE CS ASSESSMENT QUIZ */}
        {activeSection === 'quiz' && (
          <div className="animate-fadeIn">
            <AdaptiveQuizView
              theme={theme}
              onCompleteQuiz={(quizScore) => {
                console.log('Quiz scored:', quizScore);
              }}
            />
          </div>
        )}

        {/* SECTION 6: APPLICATION PIPELINE TRACKER */}
        {activeSection === 'applications' && (
          <div className="animate-fadeIn">
            <ApplicationsView
              applications={applications}
              onNavigate={(sec) => setActiveSection(sec)}
              theme={theme}
            />
          </div>
        )}

        {/* SECTION 7: PLACEMENT & CANDIDATE ANALYTICS */}
        {activeSection === 'analytics' && (
          <div className="animate-fadeIn pb-16">
            <StatisticsModal
              isOpen={true}
              isInline={true}
              onClose={() => setActiveSection('matcher')}
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

      {/* Clean Full-Width Footer */}
      <footer className={`border-t py-8 text-center text-xs transition-colors duration-200 ${
        isDark ? 'border-slate-800 bg-slate-950 text-slate-400' : 'border-slate-200 bg-white text-slate-600'
      }`}>
        <div className="max-w-5xl mx-auto px-4 space-y-2">
          <p className="font-extrabold text-sm text-slate-900 dark:text-slate-100">
            EventBeep Founder’s Office • Internship Readiness Radar
          </p>
          <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
            Closing the student Actionability Gap with deterministic boundary matching, weekend proof-of-work project blueprints, and authenticated application tracking.
          </p>
        </div>
      </footer>

    </div>
  );
}
