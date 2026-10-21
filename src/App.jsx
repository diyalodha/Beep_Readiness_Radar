import React, { useState, useEffect, useRef, useCallback } from 'react';
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
import ResumePreviewModal from './components/ResumePreviewModal';
import { INTERNSHIPS, SAMPLE_RESUMES } from './data/sampleRoles';
import { extractResumeTextFromFile, ACCEPT_ATTR } from './utils/documentParser';
import { runDynamicHeuristicAnalysis } from './utils/heuristicCore';
import { AlertTriangle, Sparkles, ArrowRight, RefreshCw, FileText, UploadCloud, CheckCircle2, Trash2, Eye } from 'lucide-react';

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
  const [fileUrl, setFileUrl] = useState(null);
  const [fileType, setFileType] = useState('text'); // 'pdf' | 'docx' | 'text' | 'sample'
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const matcherFileInputRef = useRef(null);
  const [isMatcherParsing, setIsMatcherParsing] = useState(false);

  const handleMatcherFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (fileUrl) {
      URL.revokeObjectURL(fileUrl);
      setFileUrl(null);
    }
    setIsMatcherParsing(true);
    setErrorMessage('');
    try {
      const { kind, text } = await extractResumeTextFromFile(file);
      setResumeText(text);
      setFileName(file.name);
      if (kind === 'pdf') {
        const url = URL.createObjectURL(file);
        setFileUrl(url);
        setFileType('pdf');
      } else if (kind === 'docx') {
        setFileUrl(null);
        setFileType('docx');
      } else {
        setFileUrl(null);
        setFileType('text');
      }
    } catch (err) {
      setErrorMessage(err?.message || 'Could not parse resume file.');
    } finally {
      setIsMatcherParsing(false);
      if (e.target) e.target.value = '';
    }
  };

  const handleQuickSampleSelect = (sample) => {
    if (fileUrl) {
      URL.revokeObjectURL(fileUrl);
      setFileUrl(null);
    }
    setResumeText(sample.content);
    setFileName(`${sample.label.replace(/\s+/g, '_')}.pdf`);
    setFileType('sample');
    setErrorMessage('');
  };

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

  const handleLogout = useCallback(() => {
    setUser(null);
    setToken('');
    setApplications([]);
    setResult(null);
    if (fileUrl) {
      URL.revokeObjectURL(fileUrl);
      setFileUrl(null);
    }
    setResumeText('');
    setFileName('');
    setFileType('text');
    setErrorMessage('');
    localStorage.removeItem('beep_user');
    localStorage.removeItem('beep_token');
    localStorage.removeItem('beep_applications');
    localStorage.removeItem('beep_registered_students');
  }, [fileUrl]);

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
  }, [token, handleLogout]);

  const handleApplicationSubmitted = (newApp) => {
    setApplications(prev => {
      const updated = [newApp, ...prev.filter(a => a.refId !== newApp.refId)];
      localStorage.setItem('beep_applications', JSON.stringify(updated));
      return updated;
    });
  };

  // Clean up object URLs on unmount
  useEffect(() => {
    return () => {
      if (fileUrl) {
        URL.revokeObjectURL(fileUrl);
      }
    };
  }, [fileUrl]);

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
    if (fileUrl) {
      URL.revokeObjectURL(fileUrl);
      setFileUrl(null);
    }
    setResumeText(resumeObj.content);
    setFileName(`${resumeObj.label.replace(/\s+/g, '_')}.pdf`);
    setFileType('sample');
    setErrorMessage('');
  };

  const handleRemoveResume = () => {
    if (fileUrl) {
      URL.revokeObjectURL(fileUrl);
      setFileUrl(null);
    }
    setResumeText('');
    setFileName('');
    setFileType('text');
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

            {/* Hidden In-Place File Picker for JD Matcher */}
            <input
              ref={matcherFileInputRef}
              type="file"
              accept={ACCEPT_ATTR}
              className="hidden"
              onChange={handleMatcherFileSelect}
            />

            {/* In-Place Resume Attachment Zone right on JD Matcher */}
            {!resumeText ? (
              <div className={`p-5 rounded-3xl border-2 transition-all shadow-xs ${
                isDark ? 'bg-slate-900/90 border-purple-500/40 text-slate-200' : 'bg-white border-purple-200 text-slate-800 shadow-sm'
              }`}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2.5 rounded-xl bg-purple-600/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 shrink-0 mt-0.5">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className={`text-sm font-black ${isDark ? 'text-white' : 'text-slate-950'}`}>
                        Attach Candidate Resume for Technical Audit
                      </h3>
                      <p className={`text-xs mt-0.5 font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                        Attach your PDF/DOCX file directly without leaving this page, or pick a sample candidate.
                      </p>
                    </div>
                  </div>

                  {/* Direct File Picker Trigger (In-Place!) */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => matcherFileInputRef.current?.click()}
                      disabled={isMatcherParsing}
                      className="px-4 py-2.5 rounded-xl font-bold text-xs bg-purple-600 hover:bg-purple-500 text-white shadow-md shadow-purple-600/30 transition cursor-pointer flex items-center gap-1.5"
                    >
                      {isMatcherParsing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <UploadCloud className="w-4 h-4" />}
                      <span>{isMatcherParsing ? 'Parsing Resume...' : 'Attach Resume File'}</span>
                    </button>
                  </div>
                </div>

                {/* 1-Click Sample Resumes right on JD Matcher */}
                <div className="mt-4 pt-3.5 border-t border-inherit/30 flex flex-wrap items-center gap-2 text-xs">
                  <span className={`text-[11px] font-bold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    Or test instantly with:
                  </span>
                  {SAMPLE_RESUMES.map(sample => (
                    <button
                      key={sample.id}
                      type="button"
                      onClick={() => handleQuickSampleSelect(sample)}
                      className={`px-3 py-1.5 rounded-xl font-bold text-xs border transition cursor-pointer flex items-center gap-1.5 ${
                        isDark 
                          ? 'bg-slate-950 border-slate-800 text-slate-300 hover:border-purple-500 hover:text-white' 
                          : 'bg-slate-50 border-slate-300 text-slate-700 hover:border-purple-500 hover:bg-purple-50/50'
                      }`}
                      title={sample.summary}
                    >
                      <span>{sample.label.split(' ')[0]} ({sample.tag})</span>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              /* Attached Resume Status Card right on JD Matcher with Preview */
              <div className={`p-4 rounded-3xl border-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs transition-all ${
                isDark ? 'bg-slate-900 border-purple-500/50 text-slate-200' : 'bg-white border-purple-300 text-slate-800 shadow-sm'
              }`}>
                <div 
                  className="flex items-center gap-3 cursor-pointer group flex-1"
                  onClick={() => setIsPreviewOpen(true)}
                  title="Click to preview attached resume"
                >
                  <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shrink-0">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`font-black text-xs group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors ${isDark ? 'text-white' : 'text-slate-950'}`}>
                        {fileName || 'Active_Resume.pdf'}
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                        {resumeText.trim().split(/\s+/).length} words
                      </span>
                    </div>
                    <p className={`text-[11px] mt-0.5 flex items-center gap-1.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      <span>Ready for technical audit against {activeJobTitle}.</span>
                      <span>•</span>
                      <span className="text-purple-600 dark:text-purple-400 font-bold group-hover:underline flex items-center gap-1">
                        <Eye className="w-3 h-3" /> Click to Preview
                      </span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {/* Dedicated Preview Button on JD Matcher */}
                  <button
                    type="button"
                    onClick={() => setIsPreviewOpen(true)}
                    className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                      isDark 
                        ? 'bg-purple-950/40 border-purple-500/40 text-purple-300 hover:bg-purple-900/40' 
                        : 'bg-purple-50 border-purple-300 text-purple-800 hover:bg-purple-100 shadow-2xs'
                    }`}
                    title="Open resume document preview"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Preview</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => matcherFileInputRef.current?.click()}
                    className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition cursor-pointer ${
                      isDark ? 'bg-slate-950 border-slate-800 hover:border-slate-700 text-slate-300' : 'bg-slate-50 border-slate-300 hover:bg-slate-100 text-slate-700'
                    }`}
                  >
                    Change File
                  </button>

                  <button
                    type="button"
                    onClick={handleRemoveResume}
                    className={`p-1.5 rounded-xl border text-slate-400 hover:text-rose-500 transition cursor-pointer ${
                      isDark ? 'border-slate-800 bg-slate-950' : 'border-slate-300 bg-slate-50'
                    }`}
                    title="Remove resume"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
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
                  {resumeText ? `Using attached file: ${fileName || 'Active resume'}` : 'Attach your resume above to evaluate technical readiness.'}
                </p>
              </div>

              <button
                type="button"
                onClick={resumeText.trim() ? handleAnalyze : () => matcherFileInputRef.current?.click()}
                disabled={isLoading}
                className={`px-8 py-3.5 rounded-2xl font-black text-xs sm:text-sm shadow-xl transition-all cursor-pointer ${
                  isLoading
                    ? 'bg-slate-200 dark:bg-slate-800 text-slate-500 cursor-not-allowed border-2 border-slate-300 dark:border-slate-700'
                    : resumeText.trim()
                      ? 'bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-500 hover:from-purple-500 hover:to-indigo-500 text-white shadow-purple-600/30 hover:shadow-purple-600/50 transform hover:-translate-y-0.5'
                      : 'bg-purple-600 hover:bg-purple-500 text-white shadow-purple-600/30'
                }`}
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Auditing {fileName || 'Resume'} against {activeJobTitle}...</span>
                  </span>
                ) : !resumeText.trim() ? (
                  <span className="flex items-center gap-2">
                    <UploadCloud className="w-4 h-4" />
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
              fileUrl={fileUrl}
              setFileUrl={setFileUrl}
              fileType={fileType}
              setFileType={setFileType}
              isPreviewOpen={isPreviewOpen}
              setIsPreviewOpen={setIsPreviewOpen}
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

      {/* Shared Resume Document Preview Modal */}
      <ResumePreviewModal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        fileName={fileName}
        resumeText={resumeText}
        fileUrl={fileUrl}
        fileType={fileType}
        wordCount={resumeText ? resumeText.trim().split(/\s+/).length : 0}
        onUploadDifferent={() => {
          setIsPreviewOpen(false);
          if (activeTab === 'matcher' && matcherFileInputRef.current) {
            matcherFileInputRef.current.click();
          }
        }}
        theme={theme}
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
