import React, { useState, useRef, useEffect } from 'react';
import { SAMPLE_RESUMES } from '../data/sampleRoles';
import { extractResumeTextFromFile, ACCEPT_ATTR } from '../utils/documentParser';
import { 
  UploadCloud, FileText, CheckCircle2, RefreshCw, 
  Sparkles, Eye, Trash2, X, AlertCircle, FileCheck, 
  ArrowRight, ExternalLink, ShieldCheck
} from 'lucide-react';

export default function ResumeUploader({
  resumeText,
  setResumeText,
  fileName,
  setFileName,
  onSelectSampleResume,
  onRemoveResume,
  isCustomJob,
  customJd,
  setCustomJd,
  customRoleTitle,
  setCustomRoleTitle,
  theme
}) {
  const [isDragging, setIsDragging] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [fileUrl, setFileUrl] = useState(null);
  const [fileType, setFileType] = useState('text'); // 'pdf' | 'docx' | 'text' | 'sample'
  const [parseError, setParseError] = useState('');
  const [isParsing, setIsParsing] = useState(false);
  const fileInputRef = useRef(null);

  const isDark = theme === 'dark';

  // Clean up object URLs on unmount
  useEffect(() => {
    return () => {
      if (fileUrl) {
        URL.revokeObjectURL(fileUrl);
      }
    };
  }, [fileUrl]);

  const handleFileProcess = async (file) => {
    if (!file) return;

    // Reset prior state before parsing the new file.
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
        // Native object URL so the user can visually inspect the exact PDF.
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

      {/* Visible parse error banner (never silent) */}
      {parseError && (
        <div className={`mb-3 p-3 rounded-xl border flex items-start gap-2 text-xs ${
          isDark
            ? 'bg-rose-950/40 border-rose-500/40 text-rose-200'
            : 'bg-rose-50 border-rose-300 text-rose-800'
        }`}>
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          <div>
            <p className="font-bold">Could not read that file</p>
            <p className="opacity-90 mt-0.5">{parseError}</p>
          </div>
        </div>
      )}

      {/* STATE A: RESUME IS ATTACHED */}
      {resumeText ? (
        <div className={`p-5 rounded-2xl border transition-all shadow-md ${
          isDark 
            ? 'bg-slate-900/90 border-purple-500/40 ring-1 ring-purple-500/20' 
            : 'bg-white border-purple-300 shadow-purple-500/5 ring-1 ring-purple-400/30'
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
                  <span>{fileType === 'pdf' ? 'Native PDF Document' : (fileType === 'docx' ? 'Word Document (parsed with Mammoth)' : `${wordCount} words`)}</span>
                  <span>•</span>
                  <span className="text-purple-600 dark:text-purple-400 font-semibold group-hover:underline flex items-center gap-1">
                    <Eye className="w-3.5 h-3.5" /> Click to view exact file
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
                className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition ${
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
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-purple-600 hover:bg-purple-500 text-white shadow-sm transition"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Change Resume</span>
              </button>

              {/* Remove / Clear Button */}
              <button
                type="button"
                onClick={handleRemove}
                className={`p-2 rounded-xl border text-slate-400 hover:text-rose-500 hover:border-rose-500/40 transition ${
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
              <span className="font-semibold">Privacy:</span> Your resume text is sent to our analysis engine to compute your readiness score. It is not stored on our servers after analysis.
            </p>
          </div>

        </div>
      ) : (
        /* STATE B: NO RESUME ATTACHED YET (CLEAN DROPZONE) */
        <div className="space-y-4">
          
          {/* Drag & Drop File Dropzone */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-3xl p-8 text-center cursor-pointer transition-all ${
              isDragging
                ? 'border-purple-500 bg-purple-500/10 scale-[1.01]'
                : (isDark
                    ? 'border-slate-800 bg-slate-900/40 hover:border-purple-500/50 hover:bg-slate-900/80'
                    : 'border-slate-300 bg-white hover:border-purple-400 hover:bg-purple-50/20 shadow-sm')
            }`}
          >
            <div className="w-14 h-14 rounded-2xl bg-purple-600/10 text-purple-600 dark:text-purple-400 flex items-center justify-center mx-auto mb-3 shadow-inner">
              {isParsing ? <RefreshCw className="w-7 h-7 animate-spin" /> : <UploadCloud className="w-7 h-7" />}
            </div>

            <h3 className={`text-sm sm:text-base font-extrabold ${isDark ? 'text-white' : 'text-slate-900'}`}>
              {isParsing ? 'Parsing your resume...' : 'Drop your Resume here, or click to browse'}
            </h3>
            
            <p className={`text-xs mt-1 max-w-md mx-auto ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Supported: PDF (parsed with pdf.js), DOCX (Mammoth), RTF, TXT, MD. Max file size 5 MB. Scanned image PDFs are not supported without OCR.
            </p>

            <div className="mt-4 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-purple-600 text-white shadow-md">
              <FileText className="w-3.5 h-3.5" />
              <span>Select Resume File</span>
            </div>
          </div>

          {/* Fallback Option: 1-Click Sample Resumes */}
          <div className={`p-4 rounded-2xl border transition-colors ${
            isDark ? 'bg-slate-900/50 border-slate-800/80' : 'bg-slate-50 border-slate-200'
          }`}>
            <span className={`text-[11px] font-bold uppercase tracking-wider block mb-2 ${
              isDark ? 'text-slate-400' : 'text-slate-600'
            }`}>
              Or test with sample student profiles:
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {SAMPLE_RESUMES.map((res) => (
                <button
                  key={res.id}
                  type="button"
                  onClick={() => handleSampleSelect(res)}
                  className={`text-left p-3 rounded-xl border transition-all ${
                    isDark 
                      ? 'bg-slate-950 border-slate-800 hover:border-purple-500/50 text-slate-300 hover:bg-slate-900' 
                      : 'bg-white border-slate-200 hover:border-purple-300 text-slate-700 hover:bg-purple-50/30 shadow-sm'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400">
                      {res.tag}
                    </span>
                    <ArrowRight className="w-3 h-3 text-slate-400" />
                  </div>
                  <h4 className={`text-xs font-bold ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>{res.label}</h4>
                  <p className={`text-[10px] mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{res.summary}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Privacy notice */}
          <div className={`flex items-start gap-2 text-[11px] mt-1 ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>
            <ShieldCheck className="w-3.5 h-3.5 mt-0.5 shrink-0 text-purple-500" />
            <p>
              <span className="font-semibold">Privacy:</span> Your resume text is sent to our analysis engine only to compute a readiness score for you. The server does not log or persist resume contents. Parsed text stays in your browser until you remove it.
            </p>
          </div>

        </div>
      )}

      {/* MODAL: EXACT FILE PREVIEW VIEWER (HIGH FIDELITY) */}
      {isPreviewOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-5">
          <div className={`max-w-4xl w-full rounded-3xl p-5 sm:p-6 border shadow-2xl relative flex flex-col h-[88vh] ${
            isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3.5 mb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-xl font-bold text-xs ${
                  fileType === 'pdf' ? 'bg-rose-500/10 text-rose-500' : 'bg-purple-600/10 text-purple-600 dark:text-purple-400'
                }`}>
                  {fileType === 'pdf' ? 'PDF' : <FileText className="w-5 h-5" />}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-sm leading-tight truncate max-w-sm">
                      {fileName || 'Uploaded_Resume.pdf'}
                    </h3>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                      Exact File Preview
                    </span>
                  </div>
                  <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    {fileType === 'pdf' ? 'Original PDF layout rendered directly' : `${wordCount} words detected`}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {fileUrl && (
                  <button
                    type="button"
                    onClick={() => window.open(fileUrl, '_blank')}
                    className={`text-xs px-3 py-1.5 rounded-xl border flex items-center gap-1 font-semibold transition ${
                      isDark ? 'border-slate-800 hover:bg-slate-800 text-slate-300' : 'border-slate-200 hover:bg-slate-100 text-slate-700'
                    }`}
                    title="Open PDF in new browser tab"
                  >
                    <span>Full Tab</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                )}

                <button
                  onClick={() => setIsPreviewOpen(false)}
                  className={`p-1.5 rounded-full border transition ${
                    isDark ? 'border-slate-800 text-slate-400 hover:text-white' : 'border-slate-200 text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Resume Content View: High-Fidelity Rendering */}
            <div className="flex-1 overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 relative bg-slate-950 flex flex-col">
              
              {fileType === 'pdf' && fileUrl ? (
                /* 1. EXACT NATIVE PDF DOCUMENT VIEWER */
                <iframe
                  src={`${fileUrl}#view=FitH`}
                  className="w-full h-full border-0 bg-white"
                  title="Exact Uploaded Resume PDF"
                />
              ) : (
                /* 2. FORMATTED A4 DOCUMENT VIEWER (For Text & Sample Resumes) */
                <div className="w-full h-full overflow-y-auto bg-slate-100 dark:bg-slate-950 p-4 sm:p-8 flex justify-center">
                  <div className="max-w-2xl w-full bg-white text-slate-900 p-8 sm:p-10 rounded-xl shadow-2xl border border-slate-200 font-sans text-xs leading-relaxed space-y-4">
                    
                    {/* Stylized Document Header */}
                    <div className="border-b border-slate-300 pb-4 text-center">
                      <h2 className="text-xl font-black tracking-tight text-slate-900 uppercase">
                        {fileName ? fileName.replace(/\.[^/.]+$/, '').replace(/_/g, ' ') : 'Candidate Resume'}
                      </h2>
                      <p className="text-[11px] text-slate-500 mt-1">
                        Verified Student Candidate • Beep Platform Document
                      </p>
                    </div>

                    {/* Document Body */}
                    <div className="whitespace-pre-wrap font-sans text-xs text-slate-800 leading-relaxed space-y-2">
                      {resumeText}
                    </div>

                  </div>
                </div>
              )}

            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between pt-3.5 mt-2.5 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => {
                  setIsPreviewOpen(false);
                  fileInputRef.current?.click();
                }}
                className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl border ${
                  isDark ? 'border-slate-800 hover:border-slate-700 text-slate-300' : 'border-slate-200 hover:bg-slate-100 text-slate-700'
                }`}
              >
                <RefreshCw className="w-3.5 h-3.5 text-purple-500" />
                <span>Upload a Different File</span>
              </button>

              <button
                type="button"
                onClick={() => setIsPreviewOpen(false)}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-500 text-white transition shadow-sm"
              >
                Done • Return to Audit
              </button>
            </div>

          </div>
        </div>
      )}

    </section>
  );
}
