"use client";

import { useEffect, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { X, FileText, Download, ArrowLeft } from "lucide-react";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

// Set worker from unpkg
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

export default function PdfViewerModal({ fileUrl, fileName, onClose }) {
  const [numPages, setNumPages] = useState(null);
  const [error, setError] = useState(false);
  const [pageWidth, setPageWidth] = useState(800);

  useEffect(() => {
    const updateWidth = () => {
      setPageWidth(Math.min(800, Math.max(280, window.innerWidth - 48)));
    };

    updateWidth();
    window.addEventListener("resize", updateWidth);

    // Suppress the expected 401 warning in development so it doesn't trigger the Next.js error overlay
    const originalWarn = console.warn;
    const originalError = console.error;
    
    console.warn = (...args) => {
      if (typeof args[0] === 'string' && args[0].includes('Unexpected server response (401)')) return;
      originalWarn(...args);
    };
    
    console.error = (...args) => {
      if (typeof args[0] === 'string' && args[0].includes('Unexpected server response (401)')) return;
      originalError(...args);
    };

    return () => {
      window.removeEventListener("resize", updateWidth);
      console.warn = originalWarn;
      console.error = originalError;
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm safe-x py-4 md:p-8">
      <div className="bg-[#F8FAFC] rounded-2xl w-full max-w-5xl h-full max-h-[calc(100dvh-2rem)] flex flex-col shadow-2xl overflow-hidden relative animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex justify-between items-center gap-3 px-4 sm:px-6 py-3 sm:py-4 bg-white border-b border-[#E2E8F0]">
          <div className="flex min-w-0 items-center gap-3">
            <button 
              onClick={onClose} 
              className="sm:hidden p-2 -ml-2 text-[#64748B] hover:text-foreground hover:bg-gray-100 rounded-xl transition-colors focus-visible:outline-none"
              title="Back"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="w-10 h-10 shrink-0 rounded-xl bg-blue-50 flex items-center justify-center text-[#2563EB]">
              <FileText className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h3 className="truncate font-semibold text-foreground">{fileName || "Resume Preview"}</h3>
              {numPages && <p className="text-xs text-[#64748B]">{numPages} page{numPages > 1 ? 's' : ''}</p>}
            </div>
          </div>
          
          <div className="flex shrink-0 items-center gap-1 sm:gap-2">
            <button 
              onClick={async (e) => {
                e.preventDefault();
                try {
                  const res = await fetch(fileUrl);
                  const blob = await res.blob();
                  const blobUrl = window.URL.createObjectURL(blob);
                  const link = document.createElement('a');
                  link.href = blobUrl;
                  
                  let downloadName = fileName || 'resume.pdf';
                  if (!downloadName.toLowerCase().endsWith('.pdf')) {
                    downloadName += '.pdf';
                  }
                  
                  link.download = downloadName;
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                  window.URL.revokeObjectURL(blobUrl);
                } catch (error) {
                  console.error('Download failed:', error);
                  window.open(fileUrl, '_blank');
                }
              }}
              className="p-2 text-[#64748B] hover:text-[#2563EB] hover:bg-blue-50 rounded-xl transition-colors flex items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              title="Download PDF"
              aria-label="Download PDF"
            >
              <Download className="w-5 h-5" />
            </button>
            <div className="w-px h-6 bg-[#E2E8F0] mx-1"></div>
            <button 
              onClick={onClose} 
              className="p-2 text-[#64748B] hover:bg-red-50 hover:text-red-500 rounded-xl transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
              title="Close Preview"
              aria-label="Close preview"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>
        
        {/* PDF Body */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden bg-[#E2E8F0]/50 p-3 sm:p-4 md:p-8 flex flex-col items-center">
          {error ? (
            <div className="flex flex-col items-center justify-center text-muted-foreground w-full h-full">
              <FileText className="w-16 h-16 mb-4 text-[#CBD5E1]" />
              <p>Failed to load the PDF.</p>
              <a href={fileUrl} target="_blank" className="text-[#2563EB] underline mt-2 text-sm">Try downloading it instead</a>
            </div>
          ) : (
            <Document 
              file={fileUrl} 
              onLoadSuccess={({ numPages }) => setNumPages(numPages)}
              onLoadError={() => setError(true)}
              className="flex flex-col items-center gap-4 sm:gap-6 w-full max-w-3xl"
            >
              {Array.from(new Array(numPages || 1), (el, index) => (
                <div key={`page_${index + 1}`} className="shadow-lg rounded overflow-hidden w-full max-w-full flex justify-center bg-white">
                  <Page 
                    pageNumber={index + 1} 
                    width={pageWidth} 
                    renderTextLayer={false} 
                    renderAnnotationLayer={false}
                    className="max-w-full [&_canvas]:!max-w-full [&_canvas]:!h-auto"
                  />
                </div>
              ))}
            </Document>
          )}
        </div>

      </div>
    </div>
  );
}
