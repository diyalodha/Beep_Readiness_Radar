import React, { useState, useRef, useEffect } from 'react';
import { SAMPLE_RESUMES } from '../data/sampleRoles';
import { extractResumeTextFromFile, ACCEPT_ATTR } from '../utils/documentParser';
import ResumePreviewModal from './ResumePreviewModal';
import { 
  UploadCloud, FileText, CheckCircle2, RefreshCw, 
  Sparkles, Eye, Trash2, AlertCircle, FileCheck, 
  ArrowRight, ShieldCheck
} from 'lucide-react';

export default function ResumeUploader({
  resumeText,
  setResumeText,
  fileName,
  setFileName,
  fileUrl: propFileUrl,
  setFileUrl: propSetFileUrl,
  fileType: propFileType,
  setFileType: propSetFileType,
  isPreviewOpen: propIsPreviewOpen,
  setIsPreviewOpen: propSetIsPreviewOpen,
  onSelectSampleResume,
  onRemoveResume,
  isCustomJob,
  customJd,
  setCustomJd,
  customRoleTitle,
  setCustomRoleTitle,
  theme
}) {
  const [localFileUrl, setLocalFileUrl] = useState(null);
  const [localFileType, setLocalFileType] = useState('text');
  const [localIsPreviewOpen, setLocalIsPreviewOpen] = useState(false);

  const fileUrl = propFileUrl !== undefined ? propFileUrl : localFileUrl;
  const setFileUrl = propSetFileUrl || setLocalFileUrl;
  const fileType = propFileType !== undefined ? propFileType : localFileType;
  const setFileType = propSetFileType || setLocalFileType;
  const isPreviewOpen = propIsPreviewOpen !== undefined ? propIsPreviewOpen : localIsPreviewOpen;
  const setIsPreviewOpen = propSetIsPreviewOpen || setLocalIsPreviewOpen;

  const [isDragging, setIsDragging] = useState(false);
  const [parseError, setParseError] = useState('');
  const [isParsing, setIsParsing] = useState(false);
  const fileInputRef = useRef(null);

  const isDark = theme === 'dark';

  // Clean up object URLs on unmount if managed locally
  useEffect(() => {
    return () => {
      if (localFileUrl) {
        URL.revokeObjectURL(localFileUrl);
      }
    };
  }, [localFileUrl]);

  const handleFileProcess = async (file) => {
    if (!file) return;

    if (fileUrl) {
      URL.revokeObjectURL(fileUrl);
      setFileUrl(null);
    }
    setParseError('');
    setResumeText('');
    setFileName('');
    setIsParsing(true);

    try {
      const { kind, text } = await extractResumeTextFromFile(file);
      setFileName(file.name);
      setResumeText(text);

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
      const message = err?.message || 'Could not read this file.';
      setParseError(message);
      setResumeText('');
      setFileName('');
      setFileType('text');
    } finally {
      setIsParsing(false);
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

  const handleSampleSelect = (sample) => {
    if (fileUrl) {
      URL.revokeObjectURL(fileUrl);
      setFileUrl(null);
    }
    setParseError('');
    setFileType('sample');
    onSelectSampleResume(sample);
  };

  const handleRemove = () => {
    if (fileUrl) {
      URL.revokeObjectURL(fileUrl);
      setFileUrl(null);
    }
    setParseError('');
    setFileType('text');
    onRemoveResume();
  };

  const wordCount = resumeText ? resumeText.trim().split(/\s+/).length : 0;

  return (
    <section className="max-w-6xl mx-auto px-4 sm:px-6 py-4">
      
      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept={ACCEPT_ATTR}
        className="hidden"
        onChange={(e) => {
          if (e.target.files && e.target.files[0]) {
            handleFileProcess(e.target.files[0]);
          }
        }}
      />

      {/* Step Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="w-6 h-6 rounded-lg bg-purple-600/10 text-purple-600 dark:text-purple-400 font-bold text-xs flex items-center justify-center border border-purple-500/20">
            2
          </span>
          <h2 className={`text-base sm:text-lg font-extrabold tracking-tight ${
            isDark ? 'text-white' : 'text-slate-900'
          }`}>
            Attach Your Resume
          </h2>
        </div>

        {resumeText && (
          <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Resume Ready
          </span>
        )}
      </div>

      {/* If user clicked "Paste Custom JD", show Custom JD input drawer */}
      {isCustomJob && (
        <div className={`mb-5 p-5 rounded-3xl border-2 transition-colors ${
          isDark ? 'bg-slate-900 border-indigo-900/60 text-white' : 'bg-white border-indigo-300 shadow-xs text-slate-900'
        }`}>
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-4 h-4 text-indigo-600" />
            <h3 className={`text-xs font-extrabold uppercase tracking-wider ${isDark ? 'text-white' : 'text-slate-950'}`}>
              Custom Internship Details
            </h3>
          </div>
          <div className="space-y-3">
            <input
              type="text"
              placeholder="Internship Title (e.g. Backend Engineering Intern)"
              value={customRoleTitle}
              onChange={(e) => setCustomRoleTitle(e.target.value)}
              className={`w-full text-xs p-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-indigo-500 font-semibold ${
                isDark ? 'bg-slate-950 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
              }`}
            />
            <textarea
              rows={4}
              placeholder="Paste the job description and requirements from LinkedIn, Internshala, etc..."
              value={customJd}
              onChange={(e) => setCustomJd(e.target.value)}
              className={`w-full text-xs p-3 rounded-xl border font-mono resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                isDark ? 'bg-slate-950 border-slate-700 text-slate-200' : 'bg-slate-50 border-slate-300 text-slate-900'
              }`}
            />
          </div>
        </div>
      )}

      {/* Visible parse error banner */}
      {parseError && (
        <div className={`mb-4 p-3.5 rounded-2xl border flex items-start gap-2.5 text-xs ${
          isDark
            ? 'bg-rose-950/40 border-rose-500/40 text-rose-200'
            : 'bg-rose-50 border-rose-400 text-rose-900 font-medium'
        }`}>
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          <div>
            <p className="font-extrabold">Could not read that file</p>
            <p className="opacity-90 mt-0.5">{parseError}</p>
          </div>
        </div>
      )}

      {/* STATE A: RESUME IS ATTACHED */}
      {resumeText ? (
        <div className={`p-5 sm:p-6 rounded-3xl border-2 transition-all shadow-md ${
          isDark 
            ? 'bg-slate-900 border-purple-500/60 ring-1 ring-purple-500/30' 
            : 'bg-white border-purple-400 shadow-purple-500/10 ring-2 ring-purple-400/30'
        }`}>
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            
            {/* File Info Block (Clickable to open exact preview) */}
            <div 
              onClick={() => setIsPreviewOpen(true)}
              className="flex items-center gap-3.5 cursor-pointer group flex-1"
              title="Click to preview exact file"
            >
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white font-bold text-xs shadow-md group-hover:scale-105 transition-transform shrink-0 ${
                fileType === 'pdf' ? 'bg-rose-600' : (fileType === 'docx' ? 'bg-blue-600' : 'bg-gradient-to-tr from-purple-600 to-indigo-600')
              }`}>
                {fileType === 'pdf' ? 'PDF' : (fileType === 'docx' ? 'DOCX' : <FileCheck className="w-6 h-6" />)}
              </div>
              
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className={`text-sm font-bold truncate group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors ${
                    isDark ? 'text-white' : 'text-slate-900'
                  }`}>
                    {fileName || 'Attached_Resume.pdf'}
                  </h3>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shrink-0">
                    Attached
                  </span>
                </div>
                
                <p className={`text-xs mt-0.5 flex items-center gap-2 ${
                  isDark ? 'text-slate-400' : 'text-slate-500'
                }`}>
                  <span>{fileType === 'pdf' ? 'Native PDF Document' : (fileType === 'docx' ? 'Word Document' : `${wordCount} words`)}</span>
                  <span>•</span>
                  <span className="text-purple-600 dark:text-purple-400 font-semibold group-hover:underline flex items-center gap-1">
                    <Eye className="w-3.5 h-3.5" /> Click to view preview
                  </span>
                </p>
              </div>
            </div>

            {/* Action Buttons: Preview, Change, Remove */}
            <div className="flex items-center gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800">
              
              {/* Preview Button */}
              <button
                type="button"
                onClick={() => setIsPreviewOpen(true)}
                className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition cursor-pointer ${
                  isDark
                    ? 'bg-slate-950 border-slate-800 text-slate-300 hover:text-white hover:border-slate-700'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <Eye className="w-3.5 h-3.5 text-purple-500" />
                <span>Open File Preview</span>
              </button>

              {/* Change / Replace Button */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-purple-600 hover:bg-purple-500 text-white shadow-sm transition cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Change Resume</span>
              </button>

              {/* Remove / Clear Button */}
              <button
                type="button"
                onClick={handleRemove}
                className={`p-2 rounded-xl border text-slate-400 hover:text-rose-500 hover:border-rose-500/40 transition cursor-pointer ${
                  isDark ? 'border-slate-800 bg-slate-950' : 'border-slate-200 bg-slate-50'
                }`}
                title="Remove attached resume"
              >
                <Trash2 className="w-4 h-4" />
              </button>

            </div>

          </div>

          {/* Privacy notice (attached state) */}
          <div className={`mt-3 flex items-start gap-2 text-[11px] ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>
            <ShieldCheck className="w-3.5 h-3.5 mt-0.5 shrink-0 text-purple-500" />
            <p>
              <span className="font-semibold">Privacy:</span> Your resume text is parsed in-browser to evaluate skill alignment. It is never stored on our servers after analysis.
            </p>
          </div>

        </div>
      ) : (
        /* STATE B: NO RESUME ATTACHED YET */
        <div className="space-y-4">
          
          {/* Drag & Drop File Dropzone */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-3xl p-8 text-center cursor-pointer transition-all ${
              isDragging
                ? 'border-purple-600 bg-purple-500/10 scale-[1.01]'
                : (isDark
                    ? 'border-slate-700 bg-slate-900/70 hover:border-purple-500 hover:bg-slate-900'
                    : 'border-slate-400 bg-white hover:border-purple-600 hover:bg-purple-50/30 shadow-xs hover:shadow-md')
            }`}
          >
            <div className="w-14 h-14 rounded-2xl bg-purple-600/10 text-purple-600 dark:text-purple-400 flex items-center justify-center mx-auto mb-3 border border-purple-500/20 shadow-xs">
              {isParsing ? <RefreshCw className="w-7 h-7 animate-spin" /> : <UploadCloud className="w-7 h-7" />}
            </div>

            <h3 className={`text-base font-extrabold ${isDark ? 'text-white' : 'text-slate-950 font-black'}`}>
              {isParsing ? 'Parsing your resume...' : 'Drop your Resume here, or click to browse'}
            </h3>
            
            <p className={`text-xs mt-1.5 max-w-md mx-auto font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              Supported: PDF (parsed via pdf.js), DOCX (Mammoth), RTF, TXT, MD. Max file size 5 MB.
            </p>

            <div className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-500 text-white shadow-md transition cursor-pointer">
              <FileText className="w-3.5 h-3.5" />
              <span>Select Resume File</span>
            </div>
          </div>

          {/* Fallback Option: 1-Click Sample Resumes with High-Contrast Clear Styling */}
          <div className={`p-5 rounded-3xl border-2 transition-colors ${
            isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-300 shadow-xs'
          }`}>
            <span className={`text-xs font-extrabold uppercase tracking-wider block mb-3 ${
              isDark ? 'text-slate-200' : 'text-slate-950'
            }`}>
              Or test with sample student profiles:
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {SAMPLE_RESUMES.map((res) => (
                <button
                  key={res.id}
                  type="button"
                  onClick={() => handleSampleSelect(res)}
                  className={`text-left p-3.5 rounded-2xl border transition-all cursor-pointer ${
                    isDark 
                      ? 'bg-slate-950 border-slate-800 hover:border-purple-500 text-slate-200 hover:bg-slate-900/90' 
                      : 'bg-slate-50 border-slate-300 hover:border-purple-500 text-slate-800 hover:bg-purple-50/40 shadow-xs hover:shadow-sm'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-600/10 text-purple-700 dark:text-purple-300 border border-purple-500/20">
                      {res.tag}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <h4 className={`text-xs font-extrabold ${isDark ? 'text-white' : 'text-slate-950'}`}>{res.label}</h4>
                  <p className={`text-[11px] mt-1 font-semibold leading-snug ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{res.summary}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Privacy & AI Disclosure Notice */}
          <div className={`p-3.5 rounded-xl border flex items-start gap-2.5 text-[11px] leading-relaxed mt-1 ${
            isDark ? 'bg-slate-900/40 border-slate-800 text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-600'
          }`}>
            <ShieldCheck className="w-4 h-4 mt-0.5 shrink-0 text-purple-500" />
            <div className="space-y-1">
              <p>
                <span className="font-bold text-slate-200 dark:text-slate-200">Resume Privacy Guarantee:</span> Your resume text is parsed in-memory strictly to evaluate skill alignment against this job description. The server does not log, persist, or retain resume contents in any database.
              </p>
            </div>
          </div>

        </div>
      )}

      {/* Shared Resume Preview Modal */}
      <ResumePreviewModal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        fileName={fileName}
        resumeText={resumeText}
        fileUrl={fileUrl}
        fileType={fileType}
        wordCount={wordCount}
        onUploadDifferent={() => {
          setIsPreviewOpen(false);
          fileInputRef.current?.click();
        }}
        theme={theme}
      />

    </section>
  );
}
