"use client";

import { useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { FileText } from "lucide-react";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

// Set worker from unpkg
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

export default function PdfThumbnail({ fileUrl, width = 300 }) {
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center text-muted-foreground w-full h-full bg-[#F1F5F9]">
        <FileText className="w-10 h-10 mb-2 text-[#CBD5E1]" />
        <span className="text-xs text-[#94A3B8]">Preview unavailable</span>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center w-full h-full overflow-hidden bg-white">
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#F1F5F9]">
          <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full" />
        </div>
      )}
      <Document
        file={fileUrl}
        onLoadSuccess={() => setLoading(false)}
        onLoadError={() => {
          setError(true);
          setLoading(false);
        }}
        className="flex items-center justify-center w-full"
      >
        <Page 
          pageNumber={1} 
          width={width} 
          renderTextLayer={false} 
          renderAnnotationLayer={false} 
          className="shadow-md"
        />
      </Document>
    </div>
  );
}
