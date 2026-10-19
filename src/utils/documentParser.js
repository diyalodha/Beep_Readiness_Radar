import * as pdfjsLib from 'pdfjs-dist';
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import mammoth from 'mammoth/mammoth.browser';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;

const MAX_FILE_BYTES = 5 * 1024 * 1024; // 5 MB

const SUPPORTED = {
  pdf:  { exts: ['.pdf'],                                          mimeTypes: ['application/pdf'] },
  docx: { exts: ['.docx'],                                         mimeTypes: ['application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/zip'] },
  rtf:  { exts: ['.rtf'],                                          mimeTypes: ['application/rtf', 'text/rtf'] },
  txt:  { exts: ['.txt', '.md'],                                   mimeTypes: ['text/plain', 'text/markdown', 'text/md'] },
};

function classifyFile(file) {
  const name = (file.name || '').toLowerCase();
  if (name.endsWith('.pdf')) return 'pdf';
  if (name.endsWith('.docx')) return 'docx';
  if (name.endsWith('.rtf')) return 'rtf';
  if (name.endsWith('.txt') || name.endsWith('.md')) return 'txt';
  // Fallback to MIME sniffing
  for (const [kind, cfg] of Object.entries(SUPPORTED)) {
    if (cfg.mimeTypes.includes(file.type)) return kind;
  }
  return null;
}

async function extractPdfText(file) {
  const buffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;
  const chunks = [];
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const pageText = content.items.map(item => (typeof item.str === 'string' ? item.str : '')).join(' ');
    chunks.push(pageText);
  }
  const merged = chunks.join('\n').replace(/\s+/g, ' ').trim();
  if (!merged) {
    throw new Error('No selectable text found in this PDF. It may be a scanned image and needs OCR.');
  }
  return merged;
}

async function extractDocxText(file) {
  const buffer = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer: buffer });
  const text = (result.value || '').trim();
  if (!text) throw new Error('DOCX file appears to be empty.');
  return text;
}

function stripRtf(rtf) {
  // Very small RTF-to-text helper: remove control words, groups, and hex escapes.
  return rtf
    .replace(/\\'([0-9a-fA-F]{2})/g, (_, h) => String.fromCharCode(parseInt(h, 16)))
    .replace(/\\[a-zA-Z]{1,32}-?\d{0,9}\s?/g, '')
    .replace(/[{}]/g, '')
    .replace(/\\[\\{}]/g, m => m.slice(1))
    .replace(/[\r\n]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

async function extractRtfText(file) {
  const raw = await file.text();
  const cleaned = stripRtf(raw);
  if (!cleaned) throw new Error('RTF file appears to be empty.');
  return cleaned;
}

async function extractPlainText(file) {
  const raw = await file.text();
  const cleaned = raw.trim();
  if (!cleaned) throw new Error('Text file appears to be empty.');
  return cleaned;
}

export async function extractResumeTextFromFile(file) {
  if (!file) throw new Error('No file selected.');
  if (file.size > MAX_FILE_BYTES) {
    throw new Error(`File is larger than ${Math.round(MAX_FILE_BYTES / (1024 * 1024))} MB. Please upload a smaller resume.`);
  }
  const kind = classifyFile(file);
  if (!kind) {
    throw new Error('Unsupported file type. Please upload a PDF, DOCX, RTF, TXT, or MD file.');
  }
  switch (kind) {
    case 'pdf':  return { kind, text: await extractPdfText(file) };
    case 'docx': return { kind, text: await extractDocxText(file) };
    case 'rtf':  return { kind, text: await extractRtfText(file) };
    case 'txt':  return { kind, text: await extractPlainText(file) };
    default:     throw new Error('Unsupported file type.');
  }
}

export const ACCEPT_ATTR = '.pdf,.docx,.rtf,.txt,.md';
