import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import LoginScreen from './components/LoginScreen';
import InternshipExplorer from './components/InternshipExplorer';
import ResumeUploader from './components/ResumeUploader';
import ResultsView from './components/ResultsView';
import ApplicationModal from './components/ApplicationModal';
import ApplicationTrackerModal from './components/ApplicationTrackerModal';
import { INTERNSHIPS } from './data/sampleRoles';
import { runDynamicHeuristicAnalysis } from './utils/heuristicCore';
import { AlertTriangle, Sparkles, ArrowRight, RefreshCw } from 'lucide-react';

export default function App() {
  // Theme state: dark / light
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('beep_theme') || 'dark';
  });

  // User state: logged in user profile
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('beep_user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

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

  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem('beep_user', JSON.stringify(userData));

    // Also persist in local registered students list
    try {
      const all = JSON.parse(localStorage.getItem('beep_registered_students') || '[]');
      const filtered = all.filter(u => u.email?.toLowerCase() !== userData.email?.toLowerCase());
      localStorage.setItem('beep_registered_students', JSON.stringify([userData, ...filtered]));
    } catch {
      // ignore
    }
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('beep_user');
    setResult(null);
  };

  // Sync applications from backend / localStorage for the logged in user
  useEffect(() => {
    if (!user?.email) return;
    fetch(`/api/applications?email=${encodeURIComponent(user.email)}`)
      .then(res => res.json())
      .then(data => {
        if (data?.applications && Array.isArray(data.applications)) {
          setApplications(prev => {
            const map = new Map();
            // Merge existing local and server apps by refId
            for (const app of [...data.applications, ...prev]) {
              if (app.refId) map.set(app.refId, app);
            }
            const merged = Array.from(map.values()).sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));
            localStorage.setItem('beep_applications', JSON.stringify(merged));
            return merged;
          });
        }
      })
      .catch(err => {
        console.warn('Could not fetch server applications, relying on local storage:', err);
      });
  }, [user]);

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
      return;
    }

    if (!targetJobText?.trim()) {
      setErrorMessage('Please select an internship or provide a custom job description.');
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

      setTimeout(() => {
        const el = document.getElementById('results-section');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (err) {
      console.error('API call failed, running client heuristic:', err);
      // Compute a real fallback from the actual resume + JD text (never preset scores).
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
  const activeCompany = isCustomJob ? 'Custom Job' : selectedInternship?.company;

  // 2. Main Authenticated Application
  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-200 ${
      isDark ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'
    }`}>
      {/* Top Header */}
      <Header
        apiStatus={apiStatus}
        user={user}
        onLogout={handleLogout}
        theme={theme}
        toggleTheme={toggleTheme}
        applicationsCount={applications.length}
        onOpenApplications={() => setIsApplicationsOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        <Hero theme={theme} />

        {/* Error Banner */}
        {errorMessage && (
          <div className="max-w-4xl mx-auto px-4 mt-4">
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/40 text-rose-500 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          </div>
        )}

        {/* Step 1: Internship Explorer (Pick a Job First) */}
        <InternshipExplorer
          selectedInternship={selectedInternship}
          onSelectInternship={handleSelectInternship}
          onCustomJobSelect={handleCustomJobSelect}
          isCustomJob={isCustomJob}
          theme={theme}
        />

        {/* Step 2: Resume Uploader (Drop Resume or Select Sample Profile) */}
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

        {/* Step 3: Run Audit CTA */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 text-center">
          <button
            type="button"
            onClick={handleAnalyze}
            disabled={isLoading || !resumeText.trim()}
            className={`w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-2xl font-black text-sm shadow-xl transition-all ${
              isLoading || !resumeText.trim()
                ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed border border-slate-300 dark:border-slate-700'
                : 'bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-500 hover:from-purple-500 hover:to-indigo-500 text-white shadow-purple-600/30 hover:shadow-purple-600/50 cursor-pointer transform hover:-translate-y-0.5'
            }`}
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-white" />
                <span>Auditing {fileName || 'Resume'} against {activeJobTitle}...</span>
              </>
            ) : !resumeText.trim() ? (
              <>
                <Sparkles className="w-4 h-4 text-slate-400" />
                <span>Drop a Resume Above to Run Audit</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-purple-200" />
                <span>Audit Readiness for {activeJobTitle} ({activeCompany})</span>
                <ArrowRight className="w-4 h-4" />
              </>
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
              window.scrollTo({ top: 200, behavior: 'smooth' });
            }}
          />
        )}
      </main>

      {/* Apply Modal */}
      <ApplicationModal
        isOpen={isApplyModalOpen}
        onClose={() => setIsApplyModalOpen(false)}
        internship={selectedInternship || { title: customRoleTitle, company: 'Custom Partner' }}
        result={result}
        user={user}
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

      {/* Footer */}
      <footer className={`border-t py-8 text-center text-xs transition-colors duration-200 ${
        isDark ? 'border-slate-900 bg-slate-950/80 text-slate-500' : 'border-slate-200 bg-white text-slate-400'
      }`}>
        <div className="max-w-5xl mx-auto px-4 space-y-2">
          <p className={`font-semibold ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            Beep Internship Readiness Radar • Built for the Founder’s Office Assignment
          </p>
          <p className={`text-[11px] ${isDark ? 'text-slate-600' : 'text-slate-400'}`}>
            Bridging the student Actionability Gap with transparent skill diagnostics and weekend proof-of-work plans.
          </p>
        </div>
      </footer>
    </div>
  );
}
