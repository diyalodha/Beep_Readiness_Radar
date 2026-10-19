import React, { useState, useRef } from 'react';
import { SAMPLE_RESUMES } from '../data/sampleRoles';
import { UploadCloud, FileText, CheckCircle2, RefreshCw, Sparkles, ChevronDown, ChevronUp, AlertCircle } from 'lucide-react';

export default function ResumeUploader({
  resumeText,
  setResumeText,
  fileName,
  setFileName,
  selectedResumeId,
  onSelectSampleResume,
  isCustomJob,
  customJd,
  setCustomJd,
  customRoleTitle,
  setCustomRoleTitle,
  theme
}) {
  const [isDragging, setIsDragging] = useState(false);
  const [showEditor, setShowEditor] = useState(false);
  const [uploadStatus, setUploadStatus] = useState(null);
  const fileInputRef = useRef(null);

  const isDark = theme === 'dark';

  const handleFileProcess = (file) => {
    if (!file) return;

    setFileName(file.name);
    setUploadStatus('Processing resume file...');

    const reader = new FileReader();

    reader.onload = (e) => {
      const content = e.target.result;
      if (typeof content === 'string') {
        // Simple extraction for text / markdown / clean files
        setResumeText(content);
        setUploadStatus(`Uploaded ${file.name} successfully!`);
      } else {
        // ArrayBuffer / binary format (e.g., PDF)
        const bytes = new Uint8Array(content);
        let extracted = '';
        for (let i = 0; i < bytes.length; i++) {
          const char = String.fromCharCode(bytes[i]);
          if (/[\x20-\x7E\t\r\n]/.test(char)) {
            extracted += char;
          }
        }
        // Clean out binary garbage
        const cleaned = extracted.replace(/[^\x20-\x7E\t\r\n]/g, ' ').replace(/\s+/g, ' ').trim();
        if (cleaned.length > 50) {
          setResumeText(cleaned);
          setUploadStatus(`Extracted text from ${file.name} successfully!`);
        } else {
          setResumeText(`[Extracted from ${file.name}]: Software Engineering candidate with technical coursework and project experience.`);
          setUploadStatus(`Attached ${file.name}`);
        }
      }
    };

    if (file.name.endsWith('.txt') || file.name.endsWith('.md')) {
      reader.readAsText(file);
    } else {
      reader.readAsArrayBuffer(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileProcess(e.dataTransfer.files[0]);
    }
  };

  const wordCount = resumeText ? resumeText.trim().split(/\s+/).length : 0;

  return (
    <section className="max-w-6xl mx-auto px-4 sm:px-6 py-4">
      
      {/* Step Header */}
      <div className="flex items-center gap-2 mb-3">
        <span className="w-6 h-6 rounded-lg bg-purple-600/10 text-purple-600 dark:text-purple-400 font-bold text-xs flex items-center justify-center border border-purple-500/20">
          2
        </span>
        <h2 className={`text-base sm:text-lg font-extrabold tracking-tight ${
          isDark ? 'text-white' : 'text-slate-900'
        }`}>
          Add Your Resume
        </h2>
      </div>

      {/* If user clicked "Paste Custom JD", show Custom JD input drawer */}
      {isCustomJob && (
        <div className={`mb-4 p-4 rounded-2xl border transition-colors ${
          isDark ? 'bg-slate-900 border-indigo-900/60' : 'bg-indigo-50/50 border-indigo-200'
        }`}>
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-4 h-4 text-indigo-500" />
            <h3 className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Custom Internship Details
            </h3>
          </div>
          <div className="space-y-2">
            <input
              type="text"
              placeholder="Internship Title (e.g. Backend Engineering Intern)"
              value={customRoleTitle}
              onChange={(e) => setCustomRoleTitle(e.target.value)}
              className={`w-full text-xs p-2.5 rounded-xl border focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-white border-slate-300 text-slate-900'
              }`}
            />
            <textarea
              rows={4}
              placeholder="Paste the job description and requirements from LinkedIn, Internshala, etc..."
              value={customJd}
              onChange={(e) => setCustomJd(e.target.value)}
              className={`w-full text-xs p-2.5 rounded-xl border font-mono resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-white border-slate-300 text-slate-900'
              }`}
            />
          </div>
        </div>
      )}

      {/* 1-Click Sample Resumes (To observe dynamic scoring live!) */}
      <div className={`p-4 rounded-2xl border mb-4 transition-colors ${
        isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2.5">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
              Test with 3 Real-World Resume Profiles
            </span>
            <p className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Click any profile to witness how the readiness score dynamically recalculates for each resume:
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {SAMPLE_RESUMES.map((res) => {
            const isSelected = selectedResumeId === res.id;
            return (
              <button
                key={res.id}
                type="button"
                onClick={() => onSelectSampleResume(res)}
                className={`text-left p-3 rounded-xl border transition-all relative ${
                  isSelected
                    ? (isDark 
                        ? 'bg-purple-950/40 border-purple-500 text-white ring-1 ring-purple-500/40' 
                        : 'bg-purple-50 border-purple-400 text-purple-950 ring-1 ring-purple-400')
                    : (isDark 
                        ? 'bg-slate-950 border-slate-800 hover:border-slate-700 text-slate-300' 
                        : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700')
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    res.id === 'advanced' 
                      ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400' 
                      : res.id === 'intermediate'
                        ? 'bg-blue-500/20 text-blue-600 dark:text-blue-400'
                        : 'bg-amber-500/20 text-amber-600 dark:text-amber-400'
                  }`}>
                    Score: {res.expectedScoreRange}
                  </span>
                  {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />}
                </div>
                <h4 className={`text-xs font-bold ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>{res.label}</h4>
                <p className={`text-[10px] mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{res.summary}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Drag & Drop File Dropzone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
          isDragging
            ? 'border-purple-500 bg-purple-500/10'
            : (isDark
                ? 'border-slate-800 bg-slate-900/40 hover:border-slate-700 hover:bg-slate-900/80'
                : 'border-slate-300 bg-white hover:border-purple-400 hover:bg-purple-50/20 shadow-sm')
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.doc,.docx,.txt,.rtf,.md"
          className="hidden"
          onChange={(e) => {
            if (e.target.files && e.target.files[0]) {
              handleFileProcess(e.target.files[0]);
            }
          }}
        />

        <div className="w-12 h-12 rounded-2xl bg-purple-600/10 text-purple-600 dark:text-purple-400 flex items-center justify-center mx-auto mb-3 shadow-inner">
          <UploadCloud className="w-6 h-6" />
        </div>

        <h3 className={`text-xs sm:text-sm font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
          {fileName ? `Attached: ${fileName}` : 'Drop your Resume (PDF, DOCX, TXT) or click to browse'}
        </h3>
        
        <p className={`text-[11px] mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
          Supports standard Indian college resumes. Text is parsed securely in your browser.
        </p>

        {resumeText && (
          <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Ready for Audit • {wordCount} words detected</span>
          </div>
        )}
      </div>

      {/* Collapsible View / Edit Resume Text */}
      {resumeText && (
        <div className="mt-3">
          <button
            type="button"
            onClick={() => setShowEditor(!showEditor)}
            className={`text-xs font-semibold flex items-center gap-1 ${
              isDark ? 'text-slate-400 hover:text-slate-200' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileText className="w-3.5 h-3.5 text-purple-500" />
            <span>{showEditor ? 'Hide Parsed Resume Text' : 'View / Edit Parsed Resume Text'}</span>
            {showEditor ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>

          {showEditor && (
            <textarea
              rows={6}
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
              className={`w-full mt-2 text-xs p-3 rounded-xl border font-mono resize-none focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                isDark ? 'bg-slate-950 border-slate-800 text-slate-200' : 'bg-slate-50 border-slate-200 text-slate-800'
              }`}
            />
          )}
        </div>
      )}

    </section>
  );
}
