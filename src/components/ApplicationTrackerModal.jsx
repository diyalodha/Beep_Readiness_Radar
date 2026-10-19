import React, { useState } from 'react';
import { 
  X, Briefcase, Calendar, Clock, CheckCircle2, 
  Copy, Check, Download, Sparkles, Building2
} from 'lucide-react';

export default function ApplicationTrackerModal({ isOpen, onClose, applications = [], theme }) {
  const [copiedId, setCopiedId] = useState(null);

  if (!isOpen) return null;

  const isDark = theme === 'dark';

  const handleCopyId = (id) => {
    navigator.clipboard?.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDownloadReceipt = (app) => {
    const content = `================================================
BEEP FAST-TRACK INTERNSHIP APPLICATION RECEIPT
================================================
Reference ID  : ${app.refId}
Target Role   : ${app.role}
Hiring Partner: ${app.company || 'Hiring Partner'}
Applicant     : ${app.name}
Email         : ${app.email}
Phone         : ${app.phone || 'N/A'}
Match Score   : ${app.matchScore !== null ? `${app.matchScore}%` : 'N/A'}
Submitted At  : ${new Date(app.submittedAt).toLocaleString()}
Status        : Application Received & Under Review

Current Stage : Stage 2/4 - Resume & Proof-of-Work Verification
Expected Update: Within 48-72 business hours

Thank you for applying through the Beep Career Platform.
================================================`;
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Beep_Application_${app.refId}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Determine stage progress (simulated dynamic pipeline for visual feedback)
  const getPipelineStages = (app) => {
    const hasScore = typeof app.matchScore === 'number';
    const isHighMatch = hasScore && app.matchScore >= 75;

    return [
      {
        id: 1,
        title: 'Application Received',
        detail: 'Direct submission to Beep Fast-Track Queue',
        completed: true,
        current: false,
        time: new Date(app.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      },
      {
        id: 2,
        title: 'ATS & Proof-of-Work Screened',
        detail: hasScore ? `Verified with ${app.matchScore}% readiness score` : 'Initial resume verification completed',
        completed: true,
        current: !isHighMatch,
        time: 'Automated'
      },
      {
        id: 3,
        title: 'Hiring Team Review',
        detail: isHighMatch ? 'Priority candidate fast-track queue' : 'Under review by hiring coordinator',
        completed: isHighMatch,
        current: isHighMatch,
        time: 'In Progress'
      },
      {
        id: 4,
        title: 'Interview Decision / Callback',
        detail: 'Shortlist notification & interview scheduling',
        completed: false,
        current: false,
        time: 'Pending'
      }
    ];
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
      <div 
        className={`w-full max-w-2xl rounded-3xl border shadow-2xl overflow-hidden flex flex-col max-h-[90vh] transition-colors ${
          isDark ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        {/* Header */}
        <div className={`p-5 sm:p-6 border-b flex items-center justify-between ${
          isDark ? 'border-slate-800 bg-slate-950/40' : 'border-slate-100 bg-slate-50/70'
        }`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-purple-600/30">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-extrabold tracking-tight">My Applications</h2>
                <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${
                  applications.length > 0
                    ? (isDark ? 'bg-purple-950/60 border-purple-500/40 text-purple-300' : 'bg-purple-50 border-purple-200 text-purple-700')
                    : (isDark ? 'bg-slate-800 border-slate-700 text-slate-400' : 'bg-slate-100 border-slate-200 text-slate-600')
                }`}>
                  {applications.length} Submitted
                </span>
              </div>
              <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Track your active internship submissions and live candidate review pipeline.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className={`p-2 rounded-xl border transition ${
              isDark 
                ? 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300' 
                : 'bg-white hover:bg-slate-100 border-slate-200 text-slate-600 shadow-sm'
            }`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4 flex-1">
          {applications.length === 0 ? (
            <div className="text-center py-12 px-4 space-y-3">
              <div className={`w-14 h-14 mx-auto rounded-3xl border flex items-center justify-center ${
                isDark ? 'bg-slate-800/60 border-slate-700 text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-400'
              }`}>
                <Briefcase className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold">No Applications Yet</h3>
              <p className={`text-xs max-w-sm mx-auto leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Audit your resume against any internship role on the dashboard, then click <strong>"Apply via Beep"</strong> to track your application progress here.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {applications.map((app, idx) => {
                const stages = getPipelineStages(app);

                return (
                  <div 
                    key={app.refId || idx}
                    className={`border rounded-2xl p-4 sm:p-5 transition-all shadow-sm ${
                      isDark 
                        ? 'bg-slate-950/60 border-slate-800 hover:border-slate-700' 
                        : 'bg-white border-slate-200 hover:border-purple-200 shadow-slate-100'
                    }`}
                  >
                    {/* Top Row: Role, Company, Ref ID */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-extrabold text-sm sm:text-base">
                            {app.role}
                          </h4>
                          {app.matchScore !== null && (
                            <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${
                              app.matchScore >= 75
                                ? (isDark ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300' : 'bg-emerald-50 border-emerald-300 text-emerald-700')
                                : (isDark ? 'bg-blue-950/60 border-blue-500/40 text-blue-300' : 'bg-blue-50 border-blue-300 text-blue-700')
                            }`}>
                              {app.matchScore}% Match
                            </span>
                          )}
                        </div>

                        <div className={`flex flex-wrap items-center gap-3 mt-1 text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                          <span className="flex items-center gap-1 font-medium">
                            <Building2 className="w-3.5 h-3.5 opacity-70" />
                            {app.company || 'Hiring Partner'}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 opacity-70" />
                            {new Date(app.submittedAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 opacity-70" />
                            {new Date(app.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>

                      {/* Reference Badge & Actions */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleCopyId(app.refId)}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-[11px] font-mono font-medium transition ${
                            isDark 
                              ? 'bg-slate-900 hover:bg-slate-800 border-slate-700 text-slate-300' 
                              : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
                          }`}
                          title="Click to copy Reference ID"
                        >
                          <span>{app.refId}</span>
                          {copiedId === app.refId ? (
                            <Check className="w-3 h-3 text-emerald-500" />
                          ) : (
                            <Copy className="w-3 h-3 opacity-60" />
                          )}
                        </button>

                        <button
                          onClick={() => handleDownloadReceipt(app)}
                          className={`p-1.5 rounded-xl border transition ${
                            isDark 
                              ? 'bg-slate-900 hover:bg-slate-800 border-slate-700 text-slate-300' 
                              : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
                          }`}
                          title="Download Application Slip"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Progress Pipeline */}
                    <div className="mt-5 pt-4 border-t border-dashed border-slate-200 dark:border-slate-800">
                      <div className="flex items-center justify-between mb-2">
                        <span className={`text-[10px] font-bold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                          Application Review Pipeline
                        </span>
                        <span className="text-[11px] font-semibold text-purple-600 dark:text-purple-400 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse" />
                          In Active Review
                        </span>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                        {stages.map((stage) => (
                          <div 
                            key={stage.id}
                            className={`p-2.5 rounded-xl border text-left flex flex-col justify-between transition ${
                              stage.completed
                                ? (isDark ? 'bg-emerald-950/20 border-emerald-500/30' : 'bg-emerald-50/60 border-emerald-200')
                                : stage.current
                                  ? (isDark ? 'bg-purple-950/20 border-purple-500/40 ring-1 ring-purple-500/40' : 'bg-purple-50/60 border-purple-300 ring-1 ring-purple-300')
                                  : (isDark ? 'bg-slate-900/40 border-slate-800 opacity-60' : 'bg-slate-50 border-slate-200 opacity-60')
                            }`}
                          >
                            <div className="flex items-center justify-between mb-1">
                              <span className={`text-[10px] font-bold ${
                                stage.completed 
                                  ? 'text-emerald-600 dark:text-emerald-400' 
                                  : stage.current 
                                    ? 'text-purple-600 dark:text-purple-400' 
                                    : 'text-slate-400'
                              }`}>
                                Stage {stage.id}
                              </span>
                              {stage.completed ? (
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                              ) : stage.current ? (
                                <span className="w-2 h-2 rounded-full bg-purple-500 animate-ping" />
                              ) : null}
                            </div>
                            <p className="text-[11px] font-bold leading-tight">
                              {stage.title}
                            </p>
                            <p className={`text-[10px] mt-1 line-clamp-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                              {stage.time}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className={`p-4 border-t flex items-center justify-between text-xs ${
          isDark ? 'border-slate-800 bg-slate-950/40 text-slate-400' : 'border-slate-100 bg-slate-50/70 text-slate-500'
        }`}>
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-purple-500" />
            <span>Applications are verified and synced with Beep's hiring partner queue.</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl font-bold bg-purple-600 hover:bg-purple-500 text-white shadow-sm transition"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
}
