import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, FileText, Loader2 } from 'lucide-react';
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';
import * as pdfjsWorker from 'pdfjs-dist/legacy/build/pdf.worker.min.mjs';
import pdfWorkerSrc from 'pdfjs-dist/legacy/build/pdf.worker.min.mjs?url';

(globalThis as typeof globalThis & { pdfjsWorker?: unknown }).pdfjsWorker = pdfjsWorker;
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerSrc;

export const RESUME_URL = '/assets/Rehan_Shaikh_Resume.pdf';
export const RESUME_FILENAME = 'Rehan_Shaikh_Resume.pdf';

interface ResumeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = window.setTimeout(() => {
      reject(new Error(`${label} timed out after ${ms}ms`));
    }, ms);
    promise.then(
      (value) => {
        window.clearTimeout(timer);
        resolve(value);
      },
      (err) => {
        window.clearTimeout(timer);
        reject(err);
      }
    );
  });
}

export const ResumeModal: React.FC<ResumeModalProps> = ({ isOpen, onClose }) => {
  const [status, setStatus] = useState<'idle' | 'loading' | 'ready' | 'fallback'>('idle');
  const [pageImages, setPageImages] = useState<string[]>([]);
  const [pageCount, setPageCount] = useState<number>(1);
  const [downloadState, setDownloadState] = useState<'idle' | 'downloading'>('idle');
  const [reloadNonce, setReloadNonce] = useState<number>(0);

  const pdfBytesRef = useRef<Uint8Array | null>(null);
  const loadedRef = useRef<boolean>(false);
  const fetchPromiseRef = useRef<Promise<Uint8Array> | null>(null);

  const getPdfBytes = React.useCallback(async (): Promise<Uint8Array> => {
    if (pdfBytesRef.current && pdfBytesRef.current.byteLength > 0) {
      return pdfBytesRef.current;
    }
    if (fetchPromiseRef.current) {
      return fetchPromiseRef.current;
    }

    const p = (async () => {
      const res = await withTimeout(
        fetch(RESUME_URL, { cache: 'no-cache', credentials: 'same-origin' }),
        25000,
        'PDF fetch'
      );
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      const buffer = await withTimeout(res.arrayBuffer(), 20000, 'PDF buffer read');
      const bytes = new Uint8Array(buffer);
      if (bytes.byteLength < 100) {
        throw new Error('Empty PDF response');
      }
      pdfBytesRef.current = bytes;
      return bytes;
    })();

    fetchPromiseRef.current = p;
    try {
      return await p;
    } finally {
      fetchPromiseRef.current = null;
    }
  }, []);

  // Pre-warm PDF bytes in background so Download PDF works synchronously on first click
  useEffect(() => {
    void getPdfBytes().catch(() => {});
  }, [getPdfBytes]);

  useEffect(() => {
    if (!isOpen) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose();
      }
    };
    window.addEventListener('keydown', onKeyDown, true);
    return () => window.removeEventListener('keydown', onKeyDown, true);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen) return;
    if (loadedRef.current) return;

    let cancelled = false;
    setStatus('loading');

    (async () => {
      try {
        const bytes = await getPdfBytes();
        if (cancelled) return;

        const standardFontDataUrl = new URL('/pdfjs/standard_fonts/', window.location.origin).href;
        const loadingTask = pdfjsLib.getDocument({
          data: bytes.slice(0),
          standardFontDataUrl,
          disableWorkerRendering: true,
          useWasm: false,
          useSystemFonts: true,
        });

        const pdf = await withTimeout(loadingTask.promise, 20000, 'PDF parse');
        if (cancelled) return;

        setPageCount(pdf.numPages);

        const renderScale = Math.min(window.devicePixelRatio || 1, 1.5) * 1.35;
        const rendered: string[] = [];

        for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
          const page = await pdf.getPage(pageNum);
          if (cancelled) return;

          const viewport = page.getViewport({ scale: renderScale });
          const canvas = document.createElement('canvas');
          canvas.width = Math.max(1, Math.floor(viewport.width));
          canvas.height = Math.max(1, Math.floor(viewport.height));

          const ctx = canvas.getContext('2d', { alpha: false });
          if (!ctx) throw new Error('Canvas 2D context unavailable');

          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, canvas.width, canvas.height);

          await withTimeout(
            page.render({
              canvasContext: ctx,
              viewport,
              canvas,
            }).promise,
            20000,
            `PDF page ${pageNum} render`
          );
          if (cancelled) return;

          rendered.push(canvas.toDataURL('image/png'));
        }

        if (cancelled) return;
        loadedRef.current = true;
        setPageImages(rendered);
        setStatus('ready');
      } catch (err) {
        console.error('Resume PDF render failed:', err);
        if (!cancelled) {
          loadedRef.current = false;
          setStatus('fallback');
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isOpen, reloadNonce, getPdfBytes]);

  const triggerBlobDownload = (bytes: Uint8Array) => {
    const copy = new Uint8Array(bytes.byteLength);
    copy.set(bytes);
    const blob = new Blob([copy], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = RESUME_FILENAME;
    a.rel = 'noopener';
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.setTimeout(() => {
      URL.revokeObjectURL(url);
    }, 60000);
  };

  const handleDownloadPdf = async () => {
    if (pdfBytesRef.current && pdfBytesRef.current.byteLength > 0) {
      triggerBlobDownload(pdfBytesRef.current);
      return;
    }

    setDownloadState('downloading');
    try {
      const bytes = await getPdfBytes();
      triggerBlobDownload(bytes);
    } catch {
      const a = document.createElement('a');
      a.href = RESUME_URL;
      a.download = RESUME_FILENAME;
      a.rel = 'noopener';
      a.style.display = 'none';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } finally {
      setDownloadState('idle');
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/85 backdrop-blur-md"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative w-full max-w-4xl max-h-[90vh] flex flex-col rounded-[28px] sm:rounded-[36px] border-2 border-[#D7E2EA]/80 bg-[#0C0C0C] shadow-2xl text-[#D7E2EA] z-10 overflow-hidden"
          >
            {/* Header Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 px-5 sm:px-8 py-4 sm:py-5 border-b border-white/10 bg-[#111214] shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-[#D7E2EA]">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-bold uppercase tracking-wide text-[#D7E2EA] leading-tight">
                    Rehan Shaikh — Resume
                  </h2>
                  <p className="text-xs text-[#D7E2EA]/60">
                    {status === 'ready'
                      ? `PDF Document • ${pageCount} ${pageCount === 1 ? 'Page' : 'Pages'}`
                      : 'AI Automation & No-Code Specialist'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 sm:gap-3">
                <button
                  type="button"
                  onClick={handleDownloadPdf}
                  disabled={downloadState === 'downloading'}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white text-black font-semibold text-xs sm:text-sm uppercase tracking-wider hover:bg-white/90 transition-colors cursor-pointer disabled:opacity-60"
                >
                  {downloadState === 'downloading' ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Download className="w-4 h-4" />
                  )}
                  <span>{downloadState === 'downloading' ? 'Downloading...' : 'Download PDF'}</span>
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="p-2 rounded-full text-[#D7E2EA]/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                  aria-label="Close resume modal"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Scrollable Resume Content */}
            <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-8 bg-[#141518]">
              {status === 'loading' && (
                <div className="flex flex-col items-center justify-center py-24 text-[#D7E2EA]/70 gap-3">
                  <Loader2 className="w-7 h-7 animate-spin" />
                  <span className="text-sm uppercase tracking-wider">Loading Resume PDF...</span>
                </div>
              )}

              {status === 'ready' && pageImages.length > 0 && (
                <div className="max-w-[780px] mx-auto space-y-6">
                  {pageImages.map((src, idx) => (
                    <img
                      key={idx}
                      src={src}
                      alt={`Rehan Shaikh Resume page ${idx + 1}`}
                      className="w-full h-auto block rounded-xl shadow-[0_12px_40px_rgba(0,0,0,0.45)] bg-white"
                      draggable={false}
                    />
                  ))}
                </div>
              )}

              {status === 'fallback' && (
                <div className="max-w-[780px] mx-auto space-y-4">
                  <div className="flex items-center justify-between gap-3 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-[#D7E2EA]/80">
                    <span>Showing formatted resume view. You can also download the original PDF above.</span>
                    <button
                      type="button"
                      onClick={() => {
                        loadedRef.current = false;
                        setReloadNonce((n) => n + 1);
                      }}
                      className="px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 text-[#D7E2EA] font-medium uppercase tracking-wider transition-colors cursor-pointer shrink-0"
                    >
                      Retry PDF
                    </button>
                  </div>
                  <div className="bg-white text-[#2B2B2B] rounded-xl p-6 sm:p-10 shadow-xl space-y-5 font-sans text-[13px] leading-relaxed">
                  <div className="flex items-start justify-between gap-4 border-b-2 border-[#1B2A4A] pb-4">
                    <div className="pt-2">
                      <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#1B2A4A]">
                        REHAN SHAIKH
                      </h3>
                      <p className="text-[11px] sm:text-xs font-medium text-[#2F5D8A] mt-1 tracking-wide">
                        HOSPITALITY MANAGEMENT STUDENT • AI AUTOMATION &amp; GOOGLE SHEETS
                      </p>
                      <p className="text-xs text-[#5A5A5A] mt-2">
                        Bangalore, Karnataka &nbsp;|&nbsp; 9014700399 &nbsp;|&nbsp; rehanshaikhsalam@gmail.com
                      </p>
                    </div>
                    <img
                      src="/assets/resume_portrait.jpg"
                      alt="Rehan Shaikh portrait"
                      className="w-20 sm:w-24 h-auto rounded border border-black/10 object-cover shrink-0"
                    />
                  </div>

                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[#1B2A4A] border-b border-[#2F5D8A]/60 pb-1 mb-2">
                      Professional Summary
                    </h4>
                    <p>
                      Motivated first-year Hospitality Management student with practical exposure to AI automation, Google Sheets, data management, and workflow building. Interested in hospitality operations, customer service, business process automation, and technology-driven solutions. Quick to learn, responsible, adaptable, and comfortable working in fast-paced environments.
                    </p>
                  </div>

                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[#1B2A4A] border-b border-[#2F5D8A]/60 pb-1 mb-2">
                      Education
                    </h4>
                    <div className="flex justify-between font-bold text-[#2B2B2B]">
                      <span>B.Voc / Hospitality Management – 1st Year</span>
                      <span className="text-[#5A5A5A] font-normal">2026 – Present</span>
                    </div>
                    <p>Amrita College of Hotel Management, Bangalore</p>
                    <div className="flex justify-between font-bold text-[#2B2B2B] mt-2">
                      <span>12th – Commerce</span>
                      <span className="text-[#5A5A5A] font-normal">Completed</span>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[#1B2A4A] border-b border-[#2F5D8A]/60 pb-1 mb-2">
                      Core Skills
                    </h4>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 list-disc pl-5">
                      <li>Google Sheets</li>
                      <li>Gmail &amp; Google Workspace</li>
                      <li>Data Entry &amp; Data Management</li>
                      <li>Microsoft Office Basics</li>
                      <li>Make.com Automation</li>
                      <li>AI Automation &amp; Workflow Building</li>
                      <li>Communication Skills</li>
                      <li>Problem Solving</li>
                      <li>Logical Thinking</li>
                      <li>Teamwork &amp; Time Management</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[#1B2A4A] border-b border-[#2F5D8A]/60 pb-1 mb-2">
                      AI Automation Projects
                    </h4>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>Built a Gmail → Google Sheets email logging workflow for organized data capture.</li>
                      <li>Created a Google Forms → Google Sheets data-entry workflow.</li>
                      <li>Configured Google Sheets → Gmail notification workflows for timely updates.</li>
                      <li>Worked on lead capture and management automation concepts.</li>
                      <li>Explored WhatsApp and Gmail automation concepts for business communication.</li>
                      <li>Designed automated data collection and notification workflow concepts using no-code automation tools.</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[#1B2A4A] border-b border-[#2F5D8A]/60 pb-1 mb-2">
                      Strengths
                    </h4>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 list-disc pl-5">
                      <li>Quick learner</li>
                      <li>Comfortable learning new technology</li>
                      <li>Responsible and hardworking</li>
                      <li>Interested in automation and business processes</li>
                      <li>Good communication skills</li>
                      <li>Adaptable to different work environments</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[#1B2A4A] border-b border-[#2F5D8A]/60 pb-1 mb-2">
                      Career Interests
                    </h4>
                    <p>
                      AI Automation • Data Entry • Hospitality • Operations • Customer Service • Business Process Automation
                    </p>
                  </div>

                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[#1B2A4A] border-b border-[#2F5D8A]/60 pb-1 mb-2">
                      Languages
                    </h4>
                    <p>English • Hindi • Telugu</p>
                  </div>

                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[#1B2A4A] border-b border-[#2F5D8A]/60 pb-1 mb-2">
                      Additional Information
                    </h4>
                    <p>
                      Available for part-time and entry-level opportunities in hospitality, operations, customer service, data entry, and automation support roles.
                    </p>
                  </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ResumeModal;
