import React, { useState, useRef, useEffect } from 'react';
import { SAMPLE_RESUMES } from '../data/sampleRoles';
import { extractResumeTextFromFile, ACCEPT_ATTR } from '../utils/documentParser';
import { 
  UploadCloud, FileText, CheckCircle2, RefreshCw, 
  Sparkles, Eye, Trash2, X, AlertCircle, FileCheck, 
  ArrowRight, ExternalLink, ShieldCheck
} from 'lucide-react';

function escapeHtml(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function buildResumeHtml(fileName, resumeText) {
  if (!resumeText) return '';
  const lines = resumeText.split(/\r?\n/);
  
  let name = '';
  let contactLine = '';
  const bodyLines = [];
  
  for (let i = 0; i < lines.length; i++) {
    const trimmed = lines[i].trim();
    if (!trimmed) continue;
    if (!name) {
      name = trimmed;
    } else if (!contactLine && (trimmed.toLowerCase().includes('email') || trimmed.toLowerCase().includes('phone') || trimmed.toLowerCase().includes('@') || trimmed.toLowerCase().includes('github') || trimmed.toLowerCase().includes('linkedin'))) {
      contactLine = trimmed;
    } else {
      bodyLines.push(trimmed);
    }
  }

  const formattedSections = [];
  let currentSection = { title: '', items: [] };

  for (const line of bodyLines) {
    const isSectionHeader = /^[A-Z\s&/]{3,35}:?$/.test(line) || 
      /^(TECHNICAL SKILLS|CORE COMPETENCIES|SKILLS|PROJECTS|KEY PROJECTS|ACADEMIC PROJECTS|PROFESSIONAL PROJECTS|EDUCATION|EXPERIENCE|ACHIEVEMENTS|LEADERSHIP|COLLEGE INVOLVEMENT|CERTIFICATIONS):?$/i.test(line);

    if (isSectionHeader) {
      if (currentSection.title || currentSection.items.length) {
        formattedSections.push(currentSection);
      }
      currentSection = { title: line.replace(/:$/, ''), items: [] };
    } else {
      currentSection.items.push(line);
    }
  }
  if (currentSection.title || currentSection.items.length) {
    formattedSections.push(currentSection);
  }

  const sectionsHtml = formattedSections.map(sec => `
    <div style="margin-top: 18px;">
      ${sec.title ? `<div style="font-size: 13px; font-weight: 800; letter-spacing: 0.05em; color: #1e1b4b; border-bottom: 2px solid #cbd5e1; padding-bottom: 4px; margin-bottom: 8px; text-transform: uppercase;">${escapeHtml(sec.title)}</div>` : ''}
      <div style="font-size: 12px; line-height: 1.6; color: #1e293b;">
        ${sec.items.map(it => {
          if (it.startsWith('- ') || it.startsWith('• ')) {
            return `<div style="margin-left: 14px; text-indent: -12px; margin-bottom: 4px;">• ${escapeHtml(it.replace(/^[-•]\s*/, ''))}</div>`;
          }
          if (/^\d+\.\s/.test(it)) {
            return `<div style="font-weight: 700; color: #0f172a; margin-top: 8px; margin-bottom: 2px;">${escapeHtml(it)}</div>`;
          }
          return `<div style="margin-bottom: 4px;">${escapeHtml(it)}</div>`;
        }).join('')}
      </div>
    </div>
  `).join('');

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <style>
          * { box-sizing: border-box; }
          body {
            margin: 0;
            padding: 24px;
            background: #ffffff;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
            color: #0f172a;
            display: flex;
            justify-content: center;
          }
          .page {
            max-width: 820px;
            width: 100%;
            background: #ffffff;
            padding: 24px 32px;
          }
          .header {
            text-align: center;
            border-bottom: 2px solid #4338ca;
            padding-bottom: 12px;
            margin-bottom: 16px;
          }
          .name {
            font-size: 24px;
            font-weight: 900;
            letter-spacing: -0.02em;
            color: #0f172a;
            text-transform: uppercase;
            margin: 0;
          }
          .contact {
            font-size: 11.5px;
            color: #475569;
            margin-top: 6px;
            font-weight: 500;
          }
          .badge {
            display: inline-block;
            background: #eef2ff;
            color: #4338ca;
            font-size: 10px;
            font-weight: 700;
            padding: 2px 8px;
            border-radius: 9999px;
            margin-top: 6px;
            border: 1px solid #c7d2fe;
          }
        </style>
      </head>
      <body>
        <div class="page">
          <div class="header">
            <h1 class="name">${escapeHtml(name || fileName || 'Candidate Resume')}</h1>
            ${contactLine ? `<div class="contact">${escapeHtml(contactLine)}</div>` : ''}
            <span class="badge">EventBeep Candidate Profile</span>
          </div>
          ${sectionsHtml}
        </div>
      </body>
    </html>
  `;
}

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

      {/* MODAL: EXACT FILE PREVIEW VIEWER (HIGH FIDELITY, CLEAN UNIFORM VIEW) */}
      {isPreviewOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-5">
          <div className={`max-w-4xl w-full rounded-3xl p-5 sm:p-6 border shadow-2xl relative flex flex-col h-[88vh] ${
            isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-300 text-slate-900'
          }`}>
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3.5 mb-3 border-b border-inherit/40">
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
                      Document Preview
                    </span>
                  </div>
                  <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    {fileType === 'pdf' ? 'Native PDF Document' : `${wordCount} words detected • Formatted Document View`}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {fileUrl && (
                  <button
                    type="button"
                    onClick={() => window.open(fileUrl, '_blank')}
                    className={`text-xs px-3 py-1.5 rounded-xl border flex items-center gap-1 font-semibold transition ${
                      isDark ? 'border-slate-800 hover:bg-slate-800 text-slate-300' : 'border-slate-300 hover:bg-slate-100 text-slate-700'
                    }`}
                    title="Open PDF in new browser tab"
                  >
                    <span>Full Tab</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                )}

                <button
                  onClick={() => setIsPreviewOpen(false)}
                  className={`p-1.5 rounded-full border transition cursor-pointer ${
                    isDark ? 'border-slate-800 text-slate-400 hover:text-white' : 'border-slate-300 text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Resume Content View: High-Fidelity Rendering - Zero Black Bands */}
            <div className="flex-1 overflow-hidden rounded-2xl border border-slate-300 dark:border-slate-700 relative bg-white flex flex-col">
              
              {fileType === 'pdf' && fileUrl ? (
                /* 1. EXACT NATIVE PDF DOCUMENT VIEWER */
                <iframe
                  src={`${fileUrl}#view=FitH`}
                  className="w-full h-full border-0 bg-white"
                  title="Exact Uploaded Resume PDF"
                />
              ) : (
                /* 2. HIGH-FIDELITY FORMATTED DOCUMENT VIEWER (For Sample & Text Resumes) */
                <iframe
                  srcDoc={buildResumeHtml(fileName, resumeText)}
                  className="w-full h-full border-0 bg-white"
                  title="Candidate Resume Document"
                />
              )}

            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between pt-3.5 mt-2.5 border-t border-inherit/40">
              <button
                type="button"
                onClick={() => {
                  setIsPreviewOpen(false);
                  fileInputRef.current?.click();
                }}
                className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl border cursor-pointer ${
                  isDark ? 'border-slate-800 hover:border-slate-700 text-slate-300' : 'border-slate-300 hover:bg-slate-100 text-slate-700'
                }`}
              >
                <RefreshCw className="w-3.5 h-3.5 text-purple-500" />
                <span>Upload a Different File</span>
              </button>

              <button
                type="button"
                onClick={() => setIsPreviewOpen(false)}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-500 text-white transition shadow-sm cursor-pointer"
              >
                Done • Return to Workspace
              </button>
            </div>

          </div>
        </div>
      )}

    </section>
  );
}
