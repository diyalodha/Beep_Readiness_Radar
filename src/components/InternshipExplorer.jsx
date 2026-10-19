import React, { useState } from 'react';
import { INTERNSHIPS } from '../data/sampleRoles';
import { MapPin, IndianRupee, Check, ChevronDown, ChevronUp, PlusCircle, Info } from 'lucide-react';

export default function InternshipExplorer({
  selectedInternship,
  onSelectInternship,
  onCustomJobSelect,
  isCustomJob,
  theme
}) {
  const [expandedId, setExpandedId] = useState(null);
  const [filter, setFilter] = useState('all');

  const isDark = theme === 'dark';

  const toggleExpand = (id, e) => {
    e.stopPropagation();
    setExpandedId(prev => (prev === id ? null : id));
  };

  const filteredJobs = INTERNSHIPS.filter(job => {
    if (filter === 'all') return true;
    if (filter === 'tech') return job.id.includes('frontend') || job.id.includes('fullstack') || job.id.includes('aiml');
    if (filter === 'data') return job.id.includes('data');
    if (filter === 'product') return job.id.includes('product');
    return true;
  });

  return (
    <section className="max-w-6xl mx-auto px-4 sm:px-6 pt-6 pb-2">
      
      {/* Section Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-purple-600/10 text-purple-600 dark:text-purple-400 font-bold text-xs flex items-center justify-center border border-purple-500/20">
              1
            </span>
            <h2 className={`text-base sm:text-lg font-extrabold tracking-tight ${
              isDark ? 'text-white' : 'text-slate-900'
            }`}>
              Select Target Internship
            </h2>
          </div>
          <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Pick an opening from verified hiring partners or paste any custom job description.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: 'all', label: 'All Roles' },
            { id: 'tech', label: 'Software / Web' },
            { id: 'data', label: 'Data & Analytics' },
            { id: 'product', label: 'Product & APM' }
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`text-xs px-3 py-1 rounded-full font-medium transition whitespace-nowrap ${
                filter === f.id
                  ? 'bg-purple-600 text-white shadow-sm'
                  : (isDark 
                      ? 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white' 
                      : 'bg-white border border-slate-200 text-slate-600 hover:text-slate-900 shadow-sm')
              }`}
            >
              {f.label}
            </button>
          ))}

          {/* Custom Job Button */}
          <button
            onClick={onCustomJobSelect}
            className={`text-xs px-3 py-1 rounded-full font-medium transition whitespace-nowrap flex items-center gap-1 border ${
              isCustomJob
                ? 'bg-indigo-600 text-white border-indigo-500'
                : (isDark
                    ? 'bg-slate-900 border-slate-800 text-indigo-400 hover:border-indigo-500/50'
                    : 'bg-indigo-50 border-indigo-200 text-indigo-700 hover:bg-indigo-100')
            }`}
          >
            <PlusCircle className="w-3.5 h-3.5" />
            Paste Custom JD
          </button>
        </div>
      </div>

      {/* Sample Data Notice */}
      <div className={`mb-4 p-3 rounded-2xl border flex items-start gap-2.5 text-[11px] leading-relaxed ${
        isDark
          ? 'bg-indigo-950/30 border-indigo-500/40 text-indigo-200'
          : 'bg-indigo-50 border-indigo-200 text-indigo-800'
      }`}>
        <Info className="w-4 h-4 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold">Sample scenarios.</span>
          {' '}The internships below are fictional example listings created for this MVP demo. They do not represent currently open vacancies at Swiggy, CRED, Zepto, EventBeep, or InMobi. Use the "Paste Custom JD" option to audit against a real job posting.
        </div>
      </div>

      {/* Internships Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {filteredJobs.map(job => {
          const isSelected = selectedInternship?.id === job.id && !isCustomJob;
          const isExpanded = expandedId === job.id;

          return (
            <div
              key={job.id}
              onClick={() => onSelectInternship(job)}
              className={`rounded-2xl border p-4 cursor-pointer transition-all relative flex flex-col justify-between ${
                isSelected
                  ? (isDark 
                      ? 'bg-purple-950/30 border-purple-500 ring-2 ring-purple-500/30 shadow-lg shadow-purple-500/10' 
                      : 'bg-purple-50/80 border-purple-500 ring-2 ring-purple-400/40 shadow-md')
                  : (isDark 
                      ? 'bg-slate-900/70 border-slate-800/90 hover:border-slate-700 hover:bg-slate-900' 
                      : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-md')
              }`}
            >
              <div>
                {/* Header: Logo, Company, Stipend */}
                <div className="flex items-start justify-between gap-2 mb-2.5">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-9 h-9 rounded-xl bg-gradient-to-tr ${job.color} flex items-center justify-center text-white font-black text-sm shadow-sm`}>
                      {job.logo}
                    </div>
                    <div>
                      <h3 className={`text-xs font-bold leading-tight ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
                        {job.title}
                      </h3>
                      <p className={`text-[11px] font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        {job.company}
                      </p>
                    </div>
                  </div>

                  {isSelected ? (
                    <span className="p-1 rounded-full bg-purple-600 text-white shadow-sm shrink-0">
                      <Check className="w-3 h-3" />
                    </span>
                  ) : (
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                      isDark ? 'bg-slate-800 border-slate-700 text-slate-300' : 'bg-slate-100 border-slate-200 text-slate-700'
                    }`}>
                      {job.badge}
                    </span>
                  )}
                </div>

                {/* Stipend & Location */}
                <div className={`flex flex-wrap items-center gap-3 text-[11px] mb-3 pb-2.5 border-b ${
                  isDark ? 'border-slate-800 text-slate-400' : 'border-slate-100 text-slate-600'
                }`}>
                  <span className="flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400">
                    <IndianRupee className="w-3 h-3" />
                    {job.stipend}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-slate-400" />
                    {job.location}
                  </span>
                </div>

                {/* Required Skills Tag Pills */}
                <div className="flex flex-wrap gap-1 mb-2">
                  {job.requiredSkills.slice(0, 4).map((skill, sIdx) => (
                    <span
                      key={sIdx}
                      className={`text-[10px] px-2 py-0.5 rounded-md font-mono ${
                        isDark 
                          ? 'bg-slate-950 border border-slate-800 text-slate-300' 
                          : 'bg-slate-100 border border-slate-200 text-slate-700'
                      }`}
                    >
                      {skill}
                    </span>
                  ))}
                  {job.requiredSkills.length > 4 && (
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-md ${
                      isDark ? 'text-slate-500' : 'text-slate-400'
                    }`}>
                      +{job.requiredSkills.length - 4} more
                    </span>
                  )}
                </div>

                {/* Expanded Full JD Preview */}
                {isExpanded && (
                  <div className={`mt-3 pt-3 border-t text-[11px] leading-relaxed whitespace-pre-wrap font-sans max-h-56 overflow-y-auto ${
                    isDark ? 'border-slate-800 text-slate-300 bg-slate-950/60 p-2.5 rounded-lg' : 'border-slate-100 text-slate-700 bg-slate-50 p-2.5 rounded-lg'
                  }`}>
                    {job.description}
                  </div>
                )}
              </div>

              {/* Card Footer: Expand JD & Selection status */}
              <div className="flex items-center justify-between pt-2.5 mt-2 border-t border-slate-100 dark:border-slate-800/80">
                <button
                  type="button"
                  onClick={(e) => toggleExpand(job.id, e)}
                  className="text-[11px] font-semibold text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-0.5"
                >
                  {isExpanded ? (
                    <>Hide Details <ChevronUp className="w-3 h-3" /></>
                  ) : (
                    <>View Full JD <ChevronDown className="w-3 h-3" /></>
                  )}
                </button>

                <span className={`text-[10px] font-bold ${
                  isSelected ? 'text-purple-600 dark:text-purple-400' : (isDark ? 'text-slate-500' : 'text-slate-400')
                }`}>
                  {isSelected ? 'Ready for Audit' : 'Click to Select'}
                </span>
              </div>
            </div>
          );
        })}
      </div>

    </section>
  );
}
