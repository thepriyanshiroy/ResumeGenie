"use client";

import { useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { X, FileText, Download } from "lucide-react";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

// Set worker from unpkg
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

export default function PdfViewerModal({ fileUrl, fileName, onClose }) {
  const [numPages, setNumPages] = useState(null);
  const [error, setError] = useState(false);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 md:p-8">
      <div className="bg-[#F8FAFC] rounded-2xl w-full max-w-5xl h-full flex flex-col shadow-2xl overflow-hidden relative animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 bg-white border-b border-[#E2E8F0]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-[#2563EB]">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">{fileName || "Resume Preview"}</h3>
              {numPages && <p className="text-xs text-[#64748B]">{numPages} page{numPages > 1 ? 's' : ''}</p>}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <a 
              href={fileUrl}
              download
              target="_blank"
              className="p-2 text-[#64748B] hover:text-[#2563EB] hover:bg-blue-50 rounded-full transition-colors flex items-center"
              title="Download PDF"
            >
              <Download className="w-5 h-5" />
            </a>
            <div className="w-px h-6 bg-[#E2E8F0] mx-1"></div>
            <button 
              onClick={onClose} 
              className="p-2 text-[#64748B] hover:bg-red-50 hover:text-red-500 rounded-full transition-colors"
              title="Close Preview"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>
        
        {/* PDF Body */}
        <div className="flex-1 overflow-y-auto bg-[#E2E8F0]/50 p-4 md:p-8 flex flex-col items-center custom-scrollbar">
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
              className="flex flex-col items-center gap-6 w-full max-w-3xl"
            >
              {Array.from(new Array(numPages || 1), (el, index) => (
                <div key={`page_${index + 1}`} className="shadow-lg rounded overflow-hidden w-full max-w-full flex justify-center bg-white">
                  <Page 
                    pageNumber={index + 1} 
                    width={800} 
                    renderTextLayer={false} 
                    renderAnnotationLayer={false}
                    className="max-w-full"
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
