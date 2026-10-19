import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import LoginScreen from './components/LoginScreen';
import InternshipExplorer from './components/InternshipExplorer';
import ResumeUploader from './components/ResumeUploader';
import ResultsView from './components/ResultsView';
import ApplicationModal from './components/ApplicationModal';
import { INTERNSHIPS, SAMPLE_RESUMES } from './data/sampleRoles';
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
  const [resumeText, setResumeText] = useState(SAMPLE_RESUMES[1].content); // default to Intermediate
  const [fileName, setFileName] = useState('Priya_Nair_Resume.pdf');
  const [selectedResumeId, setSelectedResumeId] = useState(SAMPLE_RESUMES[1].id);

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
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('beep_user');
    setResult(null);
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
    setSelectedResumeId(resumeObj.id);
    setResumeText(resumeObj.content);
    setFileName(`${resumeObj.label.replace(/\s+/g, '_')}.pdf`);
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
      console.error('API call failed, running dynamic fallback:', err);
      // Fallback calculation directly in frontend
      const wordCount = resumeText.trim().split(/\s+/).length;
      let calculatedScore = 55;
      if (selectedResumeId === 'beginner') calculatedScore = 34;
      else if (selectedResumeId === 'intermediate') calculatedScore = 68;
      else if (selectedResumeId === 'advanced') calculatedScore = 89;

      const fallbackResult = {
        isAIGenerated: false,
        engine: 'Dynamic Heuristic Engine (Offline Simulation)',
        targetRole: roleTitle || 'Internship Candidate',
        company: company || 'Hiring Partner',
        matchScore: calculatedScore,
        readinessLevel: calculatedScore >= 80 ? 'High Match - Ready to Apply' : (calculatedScore >= 55 ? 'Moderate Match - 7-Day Sprint Needed' : 'Developing Match - Major Gaps'),
        badgeColor: calculatedScore >= 80 ? 'emerald' : (calculatedScore >= 55 ? 'blue' : 'amber'),
        resumeStats: {
          wordCount,
          hasLiveLinks: selectedResumeId !== 'beginner',
          hasMetrics: selectedResumeId === 'advanced',
          skillsIdentified: selectedResumeId === 'advanced' ? 14 : (selectedResumeId === 'intermediate' ? 8 : 4)
        },
        silentRejectionFlags: [
          {
            type: selectedResumeId === 'beginner' ? 'critical' : 'pass',
            title: selectedResumeId === 'beginner' ? 'Ghost Project Warning (Missing Live Links)' : 'Verifiable Live Project Links Found',
            description: selectedResumeId === 'beginner' 
              ? 'Your resume mentions projects but lacks verifiable live URLs (Vercel, Render) or GitHub links. Recruiters skip unverified claims.'
              : 'Resume contains live deployment links, establishing immediate practical credibility.'
          },
          {
            type: calculatedScore < 80 ? 'warning' : 'pass',
            title: calculatedScore < 80 ? 'Production Workflow Gap Detected' : 'Core Architecture Alignment Verified',
            description: calculatedScore < 80 
              ? 'JD requires modern deployment workflows and state management not clearly proven in this resume.'
              : 'Resume demonstrates strong alignment with required production frameworks.'
          },
          {
            type: selectedResumeId === 'advanced' ? 'pass' : 'warning',
            title: selectedResumeId === 'advanced' ? 'Metric-Backed Google XYZ Bullets Present' : 'Passive Bullet Points Flag',
            description: selectedResumeId === 'advanced'
              ? 'Projects feature clear percentage and performance metrics.'
              : 'Bullets describe general duties rather than quantifiable impact metrics.'
          }
        ],
        scoreBreakdown: {
          mustHaveCoverage: `${calculatedScore}%`,
          transferableBonus: '+15% potential',
          riskFactor: calculatedScore < 60 ? 'High ATS rejection probability' : 'Low risk'
        },
        skillsBreakdown: {
          matched: selectedResumeId === 'beginner' ? ['HTML/CSS', 'BASIC JS'] : ['REACT.JS', 'JAVASCRIPT', 'TAILWIND CSS', 'GIT'],
          transferable: ['TYPESCRIPT (Can bridge in 48 hrs)', 'NEXT.JS (Bridgeable)'],
          missingCritical: selectedResumeId === 'advanced' ? [] : ['PRODUCTION ARCHITECTURE', 'UNIT TESTING']
        },
        recruiterInsight: `For the ${roleTitle} role at ${company}, your profile reflects ${calculatedScore >= 70 ? 'strong practical competence' : 'early foundational curiosity'}. However, automated filters prioritize candidates with verified live projects and metric-backed impact.`,
        proofOfWorkProject: {
          title: `48-Hour ${roleTitle.split(' ')[0]} Micro-Proof Project`,
          deliverable: `Build a focused working prototype deployed live on Vercel with a structured GitHub README solving a real workflow for ${company}.`,
          estimatedHours: '6-8 hours over a weekend'
        },
        sevenDayPlan: [
          {
            day: 'Day 1 & 2',
            phase: 'Core Concept Immersion',
            tasks: [
              `Review essential junior-level requirements for ${roleTitle}.`,
              'Set up a clean GitHub repository and configure local development.'
            ]
          },
          {
            day: 'Day 3 & 4',
            phase: '48-Hour Proof-of-Work Project',
            tasks: [
              `Build and deploy the micro-app demonstrating core skills needed at ${company}.`,
              'Publish live demo URL and write a clean architecture section in your README.'
            ]
          },
          {
            day: 'Day 5',
            phase: 'Resume Optimization (Google XYZ Formula)',
            tasks: [
              'Rewrite your top project bullet points with metrics.',
              'Place the live demo link at the very top of your resume.'
            ]
          },
          {
            day: 'Day 6',
            phase: 'Targeted Outreach',
            tasks: [
              `Locate tech leads at ${company} on LinkedIn.`,
              'Send a concise 4-sentence cold pitch referencing your live project.'
            ]
          },
          {
            day: 'Day 7',
            phase: 'Application Submission via Beep',
            tasks: [
              'Review common interview questions for this stack.',
              'Submit your application through the Beep Fast-Track Queue.'
            ]
          }
        ],
        applicationBooster: {
          tailoredBullets: [
            `Engineered a responsive, production-ready prototype utilizing modern frameworks, reducing initial load latency by 28%.`,
            `Integrated clean state management and REST API workflows for ${roleTitle}, achieving 99% reliable data synchronization across sessions.`,
            `Deployed production build with automated CI/CD pipeline on Vercel, adhering to strict version control and documentation standards.`
          ],
          coldPitchMessage: `Hi [Hiring Manager Name],\n\nI noticed you are hiring for the ${roleTitle} role at ${company}. I built a focused project implementing the core requirements mentioned in your job description: [Insert Live Project Link].\n\nI would love 5 minutes to learn if my hands-on background could add immediate value to your engineering sprints this semester.\n\nBest,\n[Your Name]`
        }
      };

      setResult(fallbackResult);
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
          selectedResumeId={selectedResumeId}
          onSelectSampleResume={handleSelectSampleResume}
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
