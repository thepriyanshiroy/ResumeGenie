"use client";

import { useState, useEffect } from "react";
import DashboardNavbar from "@/components/dashboard/DashboardNavbar";
import { Search, Plus, Trash2, ArrowRight } from "lucide-react";
import Link from "next/link";
import api from "@/lib/axios";
import dynamic from "next/dynamic";

const PdfThumbnail = dynamic(() => import("@/components/shared/PdfThumbnail"), { ssr: false });

export default function Dashboard() {
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchResumes = async () => {
    try {
      const res = await api.get("/resumes");
      setResumes(res.data.data.resumes || []);
    } catch (err) {
      console.error("Failed to fetch resumes", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchResumes();
  }, []);

  const deleteResume = async (id, e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (!window.confirm("Are you sure you want to delete this resume and its analysis?")) return;
    try {
      await api.delete(`/resumes/${id}`);
      setResumes((prev) => prev.filter((r) => r._id !== id));
    } catch (err) {
      console.error("Failed to delete resume", err);
      alert("Failed to delete resume.");
    }
  };



  return (
    <div className="min-h-screen bg-[#F5F9FC] overflow-x-hidden">
      <DashboardNavbar />
      
      <main className="safe-x py-6 sm:p-8 md:p-12 max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center mb-6 sm:mb-8 gap-4">
          <div className="min-w-0">
            <h1 className="text-2xl sm:text-3xl font-bold font-display text-foreground mb-2">My Resumes</h1>
            <p className="text-muted-foreground">Analyze and track your resume scores</p>
          </div>
          
          <Link 
            href="/analyze" 
            className="inline-flex min-h-11 items-center justify-center whitespace-nowrap text-sm font-medium px-4 py-2 bg-primary text-white hover:bg-primary/90 rounded-xl shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          >
            <Plus className="w-4 h-4 mr-2" />
            Analyze New Resume
          </Link>
        </div>
        
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-[320px] rounded-2xl bg-white border border-border animate-pulse shadow-sm" />
            ))}
          </div>
        ) : resumes.length === 0 ? (
          <div className="mt-8 sm:mt-12 flex flex-col items-center justify-center px-5 py-14 sm:py-20 border-2 border-dashed border-[#DDE4ED] rounded-2xl bg-white/50 text-center">
            <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4">
              <Search className="w-8 h-8 text-blue-300" />
            </div>
            <h3 className="text-lg sm:text-xl font-display font-semibold text-foreground mb-2">No resumes analyzed yet</h3>
            <p className="text-muted-foreground max-w-sm mb-6">Upload your first resume to get an AI-powered ATS score and actionable feedback.</p>
            <Link 
              href="/analyze" 
              className="inline-flex min-h-11 items-center justify-center whitespace-nowrap text-sm font-medium px-6 py-2 bg-primary text-white hover:bg-primary/90 rounded-xl shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            >
              Get Started
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {resumes.map((resume) => (
              <div key={resume._id} className="group relative min-w-0 bg-white border border-[#E2E8F0] rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow flex flex-col">
                
                {/* Delete Button always visible on hover or focus */}
                <button 
                  onClick={(e) => deleteResume(resume._id, e)}
                  className="absolute top-6 right-6 p-2 bg-white/90 backdrop-blur-sm border border-red-100 text-red-500 rounded-lg opacity-100 sm:opacity-0 sm:group-hover:opacity-100 focus:opacity-100 transition-all hover:bg-red-50 z-10 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
                  title="Delete Analysis"
                  aria-label={`Delete ${resume.jobTitle} resume analysis`}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                
                {/* PDF Thumbnail */}
                <div className="mb-4 aspect-[3/4] bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] overflow-hidden flex items-center justify-center relative">
                  {resume.storedFileName ? (
                    <PdfThumbnail fileUrl={resume.filePath?.startsWith('http') ? resume.filePath : `/uploads/${resume.storedFileName}`} width={300} />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-white to-[#F1F5F9] relative flex items-center justify-center text-[#94A3B8]">
                       No Preview
                    </div>
                  )}
                </div>
                
                <div className="flex-1 flex flex-col justify-end">
                  <h3 className="font-semibold text-foreground text-sm truncate mb-1" title={`${resume.jobTitle} Resume`}>
                    {resume.jobTitle} Resume
                  </h3>
                  <p className="text-xs text-[#64748B] truncate mb-4">
                    {resume.companyName} • {new Date(resume.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </p>
                  
                  <div className="flex items-center justify-between pt-4 border-t border-[#F1F5F9]">
                    {resume.analysis ? (
                      <span className="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold bg-green-50 text-green-700 border border-green-100">
                        Score: {resume.analysis?.overallAnalysis?.score || 0}/100
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold bg-blue-50 text-[#2563EB] border border-blue-100 capitalize">
                        {resume.status}
                      </span>
                    )}
                    
                    <Link 
                      href={resume.analysis ? `/results/${resume._id}` : `/processing?id=${resume._id}`}
                      className="text-sm font-semibold text-[#2563EB] hover:text-[#1d4ed8] flex items-center transition-colors"
                    >
                      View Results <ArrowRight className="w-4 h-4 ml-1" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
