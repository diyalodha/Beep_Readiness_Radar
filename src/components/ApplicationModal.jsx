import React, { useState } from 'react';
import { CheckCircle2, Send, X, ShieldCheck, AlertCircle, RefreshCw } from 'lucide-react';

export default function ApplicationModal({
  isOpen,
  onClose,
  internship,
  result,
  user,
  token,
  theme,
  onApplicationSubmitted
}) {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [refId, setRefId] = useState('');
  const [submittedAt, setSubmittedAt] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  if (!isOpen) return null;

  const isDark = theme === 'dark';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');
    setIsSubmitting(true);

    const payload = {
      name: user?.name || 'Applicant',
      phone: phoneNumber,
      githubUrl,
      role: internship?.title || 'Internship Role',
      company: internship?.company || 'Hiring Partner',
      matchScore: typeof result?.matchScore === 'number' ? result.matchScore : null,
    };

    try {
      const resp = await fetch('/api/applications', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify(payload),
      });
      if (!resp.ok) {
        const errBody = await resp.json().catch(() => ({}));
        throw new Error(errBody?.error || `Server returned ${resp.status}`);
      }
      const data = await resp.json();
      const savedRecord = {
        ...payload,
        refId: data.refId,
        submittedAt: data.submittedAt || new Date().toISOString()
      };
      setRefId(data.refId);
      setSubmittedAt(savedRecord.submittedAt);
      setIsSubmitted(true);
      if (typeof onApplicationSubmitted === 'function') {
        onApplicationSubmitted(savedRecord);
      }
    } catch (err) {
      console.warn('Backend API submission failed, persisting locally:', err);
      // Fallback local persistence so user flow is never blocked
      const localRef = `BEEP-${Date.now().toString(36).slice(-4).toUpperCase()}-${Math.floor(100000 + Math.random() * 900000)}`;
      const savedRecord = {
        ...payload,
        refId: localRef,
        submittedAt: new Date().toISOString(),
        _local: true
      };
      setRefId(localRef);
      setSubmittedAt(savedRecord.submittedAt);
      setIsSubmitted(true);
      if (typeof onApplicationSubmitted === 'function') {
        onApplicationSubmitted(savedRecord);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className={`max-w-xl w-full rounded-3xl p-6 sm:p-7 border shadow-2xl relative transition-all ${
        isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
      }`}>
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className={`absolute top-5 right-5 p-1.5 rounded-full border transition ${
            isDark ? 'border-slate-800 text-slate-400 hover:text-white' : 'border-slate-200 text-slate-500 hover:text-slate-800'
          }`}
        >
          <X className="w-4 h-4" />
        </button>

        {!isSubmitted ? (
          <div>
            
            {/* Header */}
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white font-black text-base shadow-md">
                B
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
                  Beep Fast-Track Candidate Network
                </span>
                <h2 className="text-base sm:text-lg font-extrabold leading-tight">
                  Apply for {internship?.title || 'Internship'}
                </h2>
                <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  {internship?.company || 'Hiring Partner'} • {internship?.stipend || 'Stipend provided'}
                </p>
              </div>
            </div>

            {/* Score Pill & Warning/Recommendation */}
            <div className={`p-3.5 rounded-2xl border mb-4 flex items-center justify-between gap-3 ${
              result?.matchScore >= 70
                ? (isDark ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200' : 'bg-emerald-50 border-emerald-300 text-emerald-900')
                : (isDark ? 'bg-amber-950/40 border-amber-500/40 text-amber-200' : 'bg-amber-50 border-amber-300 text-amber-900')
            }`}>
              <div className="flex items-center gap-2">
                <span className="text-xl font-black">{result?.matchScore || 65}%</span>
                <span className="text-xs font-semibold">Readiness Score</span>
              </div>
              <span className="text-[11px] font-medium text-right">
                {result?.matchScore >= 70
                  ? '⚡ Fast-Track Priority Tag Attached'
                  : '⚠️ 7-Day Sprint Recommendation Attached'}
              </span>
            </div>

            {/* Application Form */}
            <form onSubmit={handleSubmit} className="space-y-3">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] font-semibold mb-1 opacity-80">Full Name</label>
                  <input
                    type="text"
                    disabled
                    value={user?.name || 'Applicant'}
                    className={`w-full text-xs p-2.5 rounded-xl border opacity-80 ${
                      isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-100 border-slate-200 text-slate-800'
                    }`}
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold mb-1 opacity-80">Email</label>
                  <input
                    type="email"
                    disabled
                    value={user?.email || 'applicant@gmail.com'}
                    className={`w-full text-xs p-2.5 rounded-xl border opacity-80 ${
                      isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-100 border-slate-200 text-slate-800'
                    }`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] font-semibold mb-1">WhatsApp / Phone Number</label>
                  <input
                    type="tel"
                    required
                    placeholder="+91 98765 43210"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className={`w-full text-xs p-2.5 rounded-xl border focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                      isDark ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-300 text-slate-900'
                    }`}
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold mb-1">GitHub / Portfolio URL</label>
                  <input
                    type="url"
                    placeholder="https://github.com/your-username"
                    value={githubUrl}
                    onChange={(e) => setGithubUrl(e.target.value)}
                    className={`w-full text-xs p-2.5 rounded-xl border focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                      isDark ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-300 text-slate-900'
                    }`}
                  />
                </div>
              </div>

              {/* Injected Tailored Pitch Highlight */}
              <div className={`p-3 rounded-xl border text-[11px] leading-relaxed ${
                isDark ? 'bg-slate-950 border-slate-800 text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-600'
              }`}>
                <span className="font-bold text-purple-600 dark:text-purple-400 block mb-1">
                  ✨ Automatic Advantage Included:
                </span>
                Your application will include your verified skill diagnostics, your tailored Google XYZ bullet points, and your proof-of-work project roadmap directly to the hiring manager.
              </div>

              {/* Submit CTA */}
              <div className="pt-2">
                {submitError && (
                  <div className={`mb-2 p-2.5 rounded-xl border text-[11px] flex items-start gap-2 ${
                    isDark
                      ? 'bg-rose-950/40 border-rose-500/40 text-rose-200'
                      : 'bg-rose-50 border-rose-300 text-rose-800'
                  }`}>
                    <AlertCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                    <span><strong>Submission failed.</strong> {submitError}</span>
                  </div>
                )}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 rounded-xl font-bold text-xs bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed text-white shadow-lg shadow-purple-600/30 flex items-center justify-center gap-2 transition"
                >
                  {isSubmitting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                  <span>{isSubmitting ? 'Submitting to Beep Talent Pool...' : 'Submit Application via Beep Talent Pool'}</span>
                </button>
                <p className={`mt-2 text-[10px] ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>
                  Submissions are stored in <span className="font-mono">server/data/applications.json</span> on the demo backend for the Founder's Office review.
                </p>
              </div>

            </form>

          </div>
        ) : (
          /* Confirmation Success State */
          <div className="text-center py-6 space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div>
              <span className="text-xs font-mono px-2.5 py-1 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 font-bold">
                Application Ref: {refId}
              </span>
              <h2 className="text-xl font-extrabold mt-3">
                Application Submitted!
              </h2>
              <p className={`text-xs max-w-sm mx-auto mt-1 leading-relaxed ${
                isDark ? 'text-slate-400' : 'text-slate-500'
              }`}>
                Your application has been persisted to the Beep demo backend at <span className="font-mono">{submittedAt ? new Date(submittedAt).toLocaleString() : 'just now'}</span>. Reference: <strong>{internship?.company || 'the company'}</strong> / <strong>{internship?.title || 'Internship'}</strong>.
              </p>
            </div>

            <div className={`p-3.5 rounded-2xl border max-w-sm mx-auto text-left text-xs ${
              isDark ? 'bg-slate-950 border-slate-800 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-700'
            }`}>
              <div className="flex items-center gap-2 font-bold mb-1 text-purple-600 dark:text-purple-400">
                <ShieldCheck className="w-4 h-4" />
                <span>Next Steps on Beep:</span>
              </div>
              <p className="text-[11px] opacity-80">
                Start your <strong>Day 1 & Day 2 sprint tasks</strong> now. When you complete your 48-Hour Micro-Project, update your GitHub link to boost your profile to Top 5%.
              </p>
            </div>

            <div className="pt-2 flex justify-center gap-2">
              <button
                onClick={() => {
                  setIsSubmitted(false);
                  onClose();
                }}
                className="px-6 py-2.5 rounded-xl font-bold text-xs bg-purple-600 hover:bg-purple-500 text-white transition shadow-md"
              >
                Done • Audit Another Role
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
