import React from 'react';
import { FileText, RefreshCw, X, ExternalLink } from 'lucide-react';

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

export default function ResumePreviewModal({
  isOpen,
  onClose,
  fileName,
  resumeText,
  fileUrl,
  fileType,
  wordCount = 0,
  onUploadDifferent,
  theme
}) {
  if (!isOpen) return null;

  const isDark = theme === 'dark';

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 animate-fadeIn"
      onClick={onClose}
    >
      <div 
        className={`max-w-4xl w-full rounded-3xl p-5 sm:p-6 border shadow-2xl relative flex flex-col h-[88vh] ${
          isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-300 text-slate-900'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
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
                className={`text-xs px-3 py-1.5 rounded-xl border flex items-center gap-1 font-semibold transition cursor-pointer ${
                  isDark ? 'border-slate-800 hover:bg-slate-800 text-slate-300' : 'border-slate-300 hover:bg-slate-100 text-slate-700'
                }`}
                title="Open PDF in new browser tab"
              >
                <span>Full Tab</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            )}

            <button
              onClick={onClose}
              className={`p-1.5 rounded-full border transition cursor-pointer ${
                isDark ? 'border-slate-800 text-slate-400 hover:text-white' : 'border-slate-300 text-slate-500 hover:text-slate-800'
              }`}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Document Viewer (100% full-width, clean white document, zero black borders) */}
        <div className="flex-1 overflow-hidden rounded-2xl border border-slate-300 dark:border-slate-700 relative bg-white flex flex-col">
          {fileType === 'pdf' && fileUrl ? (
            <iframe
              src={`${fileUrl}#view=FitH`}
              className="w-full h-full border-0 bg-white"
              title="Exact Uploaded Resume PDF"
            />
          ) : (
            <iframe
              srcDoc={buildResumeHtml(fileName, resumeText)}
              className="w-full h-full border-0 bg-white"
              title="Candidate Resume Document"
            />
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between pt-3.5 mt-2.5 border-t border-inherit/40">
          {onUploadDifferent ? (
            <button
              type="button"
              onClick={onUploadDifferent}
              className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl border cursor-pointer ${
                isDark ? 'border-slate-800 hover:border-slate-700 text-slate-300' : 'border-slate-300 hover:bg-slate-100 text-slate-700'
              }`}
            >
              <RefreshCw className="w-3.5 h-3.5 text-purple-500" />
              <span>Upload a Different File</span>
            </button>
          ) : (
            <div />
          )}

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-500 text-white transition shadow-sm cursor-pointer"
          >
            Done • Return to Workspace
          </button>
        </div>
      </div>
    </div>
  );
}
