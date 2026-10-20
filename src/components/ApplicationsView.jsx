import React, { useState } from 'react';
import { 
  Briefcase, Calendar, Clock, CheckCircle2, 
  Copy, Check, Download, Building2, ArrowRight
} from 'lucide-react';

export default function ApplicationsView({ 
  applications = [], 
  onNavigate, 
  theme 
}) {
  const isDark = theme === 'dark';
  const [copiedId, setCopiedId] = useState(null);

  const handleCopyId = (id) => {
    navigator.clipboard?.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDownloadReceipt = (app) => {
    const content = `================================================
BEEP INTERNSHIP APPLICATION SUBMISSION RECEIPT
================================================
Reference ID  : ${app.refId}
Target Role   : ${app.role}
Target Company: ${app.company || 'Hiring Partner'}
Applicant     : ${app.name}
Email         : ${app.email}
Phone         : ${app.phone || 'N/A'}
Readiness Est.: ${app.matchScore !== null ? `${app.matchScore}%` : 'N/A'}
Submitted At  : ${new Date(app.submittedAt).toLocaleString()}
Status        : Submitted to Beep — Awaiting Update

Platform Notice:
Applications are saved in Beep. Status updates are shown
when recorded on the platform.
================================================`;
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Beep_Application_${app.refId}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const getPipelineStages = (app) => {
    return [
      {
        id: 1,
        title: 'Submitted to Beep',
        detail: 'Application received and stored with unique reference ID',
        completed: true,
        current: false,
        time: new Date(app.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      },
      {
        id: 2,
        title: 'Readiness Profile Stored',
        detail: app.matchScore !== null ? `Saved with ${app.matchScore}% estimated technical match` : 'Resume skills profile linked to record',
        completed: true,
        current: true,
        time: 'Confirmed'
      },
      {
        id: 3,
        title: 'Awaiting Update',
        detail: 'Stored in Beep database; awaiting platform review or status change',
        completed: false,
        current: false,
        time: 'Queued'
      },
      {
        id: 4,
        title: 'Status Update / Callback',
        detail: 'Direct status change or review notification',
        completed: false,
        current: false,
        time: 'Pending'
      }
    ];
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fadeIn pb-12">
      
      {/* Header */}
      <div className={`p-6 rounded-3xl border ${
        isDark ? 'bg-slate-900/70 border-slate-800' : 'bg-white border-slate-200'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                applications.length > 0
                  ? (isDark ? 'bg-purple-950/60 border-purple-500/40 text-purple-300' : 'bg-purple-50 border-purple-200 text-purple-700')
                  : (isDark ? 'bg-slate-800 border-slate-700 text-slate-400' : 'bg-slate-100 border-slate-200 text-slate-600')
              }`}>
                {applications.length} Submitted Records
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight mt-1">
              Active Application Pipeline & Status Tracker
            </h2>
            <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Applications are saved in Beep. Status updates are shown when recorded on the platform.
            </p>
          </div>

          <button
            onClick={() => onNavigate('matcher')}
            className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md transition cursor-pointer flex items-center gap-2 shrink-0"
          >
            <Briefcase className="w-3.5 h-3.5" />
            <span>Apply to New Role</span>
          </button>
        </div>
      </div>

      {/* Applications List */}
      {applications.length === 0 ? (
        <div className={`p-12 rounded-3xl border text-center space-y-3 ${
          isDark ? 'bg-slate-900/40 border-slate-800 text-slate-400' : 'bg-white border-slate-200 text-slate-500'
        }`}>
          <div className={`w-14 h-14 mx-auto rounded-3xl border flex items-center justify-center ${
            isDark ? 'bg-slate-800/60 border-slate-700 text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-400'
          }`}>
            <Briefcase className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">No Applications Submitted Yet</h3>
          <p className="text-xs max-w-sm mx-auto leading-relaxed">
            Audit your resume against any internship role in <strong>JD Matcher</strong>, then submit your profile to track your application lifecycle here.
          </p>
          <div className="pt-2">
            <button
              onClick={() => onNavigate('matcher')}
              className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md transition cursor-pointer inline-flex items-center gap-1.5"
            >
              <span>Explore Roles</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {applications.map((app, idx) => {
            const stages = getPipelineStages(app);

            return (
              <div 
                key={app.refId || idx}
                className={`p-5 rounded-3xl border transition-all shadow-sm ${
                  isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200'
                }`}
              >
                {/* Header Row */}
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

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleCopyId(app.refId)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-[11px] font-mono font-medium transition cursor-pointer ${
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
                      className={`p-1.5 rounded-xl border transition cursor-pointer ${
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

                {/* Stages */}
                <div className="mt-4 pt-3 border-t border-dashed border-inherit/40">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
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
  );
}
