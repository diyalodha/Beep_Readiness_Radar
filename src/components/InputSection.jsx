import React from 'react';
import { SAMPLE_ROLES } from '../data/sampleRoles';
import { Sparkles, RefreshCw, FileText, Briefcase, ArrowRight, Check } from 'lucide-react';

export default function InputSection({
  targetRole,
  setTargetRole,
  studentSkills,
  setStudentSkills,
  jobDescription,
  setJobDescription,
  onAnalyze,
  isLoading,
  selectedPresetId,
  onSelectPreset,
  onReset
}) {
  return (
    <section id="audit-tool" className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      
      {/* 1-Click Preset Selector */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 sm:p-5 mb-6 shadow-xl backdrop-blur-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-purple-400">
              1-Click Test Presets
            </span>
            <p className="text-xs text-slate-400">
              Select a realistic Indian student scenario to test instantly:
            </p>
          </div>

          <button
            type="button"
            onClick={onReset}
            className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1 self-start sm:self-auto py-1 px-2.5 rounded-lg border border-slate-800 hover:border-slate-700 bg-slate-950 transition"
          >
            <RefreshCw className="w-3 h-3" />
            Clear Form
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {SAMPLE_ROLES.map((role) => {
            const isSelected = selectedPresetId === role.id;
            return (
              <button
                key={role.id}
                type="button"
                onClick={() => onSelectPreset(role)}
                className={`text-left p-3 rounded-xl border transition-all relative ${
                  isSelected
                    ? 'bg-purple-950/40 border-purple-500/80 text-white shadow-md shadow-purple-500/10'
                    : 'bg-slate-950/50 border-slate-800 hover:border-slate-700 text-slate-300 hover:bg-slate-900/60'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                    {role.badge}
                  </span>
                  {isSelected && <Check className="w-3.5 h-3.5 text-purple-400" />}
                </div>
                <h4 className="text-xs font-bold text-slate-100">{role.title}</h4>
                <p className="text-[11px] text-slate-400 mt-0.5">{role.company}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Input Form */}
      <form onSubmit={onAnalyze} className="space-y-4">
        
        {/* Optional Role Title */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            Target Role Title (Optional)
          </label>
          <div className="relative">
            <Briefcase className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
              placeholder="e.g. Frontend Engineering Intern, Data Analyst Intern"
              className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
            />
          </div>
        </div>

        {/* Dual Textareas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Left: Student Skills */}
          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-4 flex flex-col">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-purple-400" />
                1. Your Current Skills & Projects
              </label>
              <span className="text-[11px] text-slate-500">Paste resume or list</span>
            </div>
            <textarea
              rows={9}
              required
              value={studentSkills}
              onChange={(e) => setStudentSkills(e.target.value)}
              placeholder="Paste your resume text or list your skills, frameworks, college coursework, and projects..."
              className="w-full bg-slate-950 border border-slate-800/80 rounded-xl p-3 text-xs sm:text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none font-mono leading-relaxed flex-1"
            />
            <p className="text-[10px] text-slate-500 mt-2">
              💡 Tip: Include college projects, languages, and clubs.
            </p>
          </div>

          {/* Right: Job Description */}
          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-4 flex flex-col">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5 text-indigo-400" />
                2. Target Internship Job Description (JD)
              </label>
              <span className="text-[11px] text-slate-500">From LinkedIn, Beep, etc.</span>
            </div>
            <textarea
              rows={9}
              required
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste the full internship requirements, required skills, and responsibilities here..."
              className="w-full bg-slate-950 border border-slate-800/80 rounded-xl p-3 text-xs sm:text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none font-mono leading-relaxed flex-1"
            />
            <p className="text-[10px] text-slate-500 mt-2">
              💡 Tip: Even brief listings work! The engine parses core competencies.
            </p>
          </div>

        </div>

        {/* CTA Button */}
        <div className="pt-2 text-center">
          <button
            type="submit"
            disabled={isLoading || !studentSkills.trim() || !jobDescription.trim()}
            className={`w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-xl font-bold text-sm shadow-xl transition-all ${
              isLoading || !studentSkills.trim() || !jobDescription.trim()
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                : 'bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-500 hover:from-purple-500 hover:to-indigo-500 text-white shadow-purple-600/25 hover:shadow-purple-600/40 cursor-pointer transform hover:-translate-y-0.5'
            }`}
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-white" />
                <span>Auditing Skills & Synthesizing 7-Day Plan...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-purple-200" />
                <span>Audit My Readiness & Generate 7-Day Action Plan</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>

      </form>

    </section>
  );
}
