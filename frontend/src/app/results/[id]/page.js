"use client";

import { use, useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import DashboardNavbar from "@/components/dashboard/DashboardNavbar";
import { ArrowLeft, CheckCircle2, AlertCircle, XCircle, FileText, Check, X, AlertTriangle, Lightbulb, BarChart3, Target, Zap, TrendingUp, Award } from "lucide-react";
import Link from "next/link";
import api from "@/lib/axios";
import dynamic from "next/dynamic";

const PdfThumbnail = dynamic(() => import("@/components/shared/PdfThumbnail"), { ssr: false });
const PdfViewerModal = dynamic(() => import("@/components/shared/PdfViewerModal"), { ssr: false });

export default function ResultsPage() {
  const params = useParams();
  const id = params?.id;
  const router = useRouter();
  const [analysis, setAnalysis] = useState(null);
  const [resume, setResume] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  const [showPdfModal, setShowPdfModal] = useState(false);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const resumeRes = await api.get(`/resumes/${id}`);
        setResume(resumeRes.data.data.resume);

        const analysisRes = await api.get(`/resumes/${id}/analyze`);
        setAnalysis(analysisRes.data.data);
      } catch (err) {
        console.error("Failed to load analysis", err);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchResults();
    }
  }, [id]);



  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this resume and its analysis?")) return;
    try {
      await api.delete(`/resumes/${id}`);
      router.push("/dashboard");
    } catch (err) {
      console.error("Failed to delete", err);
      alert("Failed to delete resume.");
    }
  };

  const handleSave = () => {
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F9FC] flex flex-col">
        <DashboardNavbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="min-h-screen bg-[#F5F9FC] flex flex-col">
        <DashboardNavbar />
        <div className="flex-1 flex flex-col items-center justify-center p-4">
          <h2 className="text-2xl font-bold font-display mb-2">Analysis Not Found</h2>
          <Link href="/dashboard" className="text-primary hover:underline flex items-center">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const score = analysis.overallAnalysis?.score || 0;
  
  const getScoreColor = (s) => {
    if (s >= 85) return "text-green-600";
    if (s >= 70) return "text-yellow-600";
    return "text-red-600";
  };
  
  const getScoreBg = (s) => {
    if (s >= 85) return "bg-green-500";
    if (s >= 70) return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <div className="min-h-screen bg-[#F5F9FC] flex flex-col font-sans overflow-x-hidden print:bg-white print:min-h-0 print:overflow-visible">
      <div className="print:hidden">
        <DashboardNavbar />
      </div>
      
      <main className="flex-1 max-w-[1400px] w-full mx-auto safe-x py-4 sm:p-6 md:p-8 print:p-0 print:m-0 print:max-w-none">
        {/* Subheader: Back link and Action buttons */}
        <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 mb-6 print:hidden">
          <Link href="/dashboard" className="text-[#64748B] hover:text-foreground flex items-center text-sm font-medium w-fit transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
          </Link>
          
          <div className="grid grid-cols-2 sm:flex items-center gap-3">
            <button 
              onClick={handleDelete}
              className="flex min-h-11 items-center justify-center text-sm font-medium px-4 py-2 bg-white border border-red-200 rounded-xl shadow-sm text-red-600 hover:bg-red-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
            >
              <XCircle className="w-4 h-4 mr-2" /> Delete
            </button>
            <button 
              onClick={handleSave} 
              className={`flex min-h-11 items-center justify-center text-sm font-medium px-4 py-2 rounded-xl shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${isSaved ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-[#2563EB] hover:bg-[#1d4ed8] text-white'}`}
            >
              {isSaved ? <Check className="w-4 h-4 mr-2" /> : <FileText className="w-4 h-4 mr-2" />}
              {isSaved ? 'Saved' : 'Save Analysis'}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 sm:gap-6 xl:gap-8 items-start print:flex print:flex-col print:gap-8">
          
          {/* Left Column */}
          <div className="xl:col-span-4 min-w-0 flex flex-col gap-5 sm:gap-6 xl:sticky xl:top-24 xl:max-h-[calc(100vh-7rem)] overflow-y-auto no-scrollbar print:static print:max-h-none print:overflow-visible print:block">
            
            {/* Resume Preview */}
            <div className="bg-white rounded-2xl p-4 sm:p-6 border border-[#E2E8F0] shadow-sm flex flex-col items-center text-center shrink-0">
              <div className="bg-[#F1F5F9] rounded-xl w-full aspect-[4/5] max-h-[420px] flex flex-col items-center justify-center overflow-hidden mb-4 relative">
                {resume?.storedFileName ? (
                  <PdfThumbnail 
                    fileUrl={resume?.filePath?.startsWith('http') ? resume.filePath : `/uploads/${resume.storedFileName}`} 
                    width={400} 
                  />
                ) : (
                  <>
                    <FileText className="w-16 h-16 text-[#CBD5E1] mb-4" />
                    <h3 className="font-semibold text-[#94A3B8] mb-1">Resume Preview</h3>
                  </>
                )}
              </div>
              
              <p className="text-sm text-[#94A3B8] truncate w-full mb-4 px-2">
                {resume?.originalFileName || "resume.pdf"}
              </p>
              
              <button 
                onClick={() => setShowPdfModal(true)}
                className="w-full py-2.5 bg-[#F8FAFC] hover:bg-[#F1F5F9] border border-[#E2E8F0] text-[#64748B] text-sm font-semibold rounded-xl transition-colors flex items-center justify-center print:hidden"
                disabled={!resume?.storedFileName}
              >
                <FileText className="w-4 h-4 mr-2" /> Preview Full PDF
              </button>
            </div>

            {/* Resume Info Section */}
            <div className="text-center px-4 shrink-0">
              <h2 className="font-semibold text-foreground text-base sm:text-lg break-words">{resume?.jobTitle || "Frontend Developer"} Resume</h2>
              <p className="text-sm text-[#64748B]">{resume?.companyName || "Google"} • {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
            </div>

            {/* Resume Sections */}
            <div className="bg-white rounded-2xl p-4 sm:p-6 border border-[#E2E8F0] shadow-sm shrink-0">
              <h3 className="text-lg font-display font-semibold mb-5 sm:mb-6">Resume Sections</h3>
              <div className="space-y-4">
                {(analysis.resumeSections || []).map((section, idx) => (
                  <div key={idx} className="flex gap-3 sm:gap-4 items-start">
                    {section.status === "Complete" && <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />}
                    {section.status === "Missing" && <XCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />}
                    {section.status === "Needs Improvement" && <AlertTriangle className="w-5 h-5 text-yellow-500 shrink-0 mt-0.5" />}
                    
                    <div>
                      <h4 className="text-sm font-semibold text-foreground">{section.section}</h4>
                      <p className="text-xs text-[#64748B] mt-0.5">{section.feedback}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="xl:col-span-8 min-w-0 flex flex-col gap-5 sm:gap-6 pb-12 sm:pb-20">
            
            {/* 1. ATS Score Card */}
            <div className="bg-white rounded-2xl p-5 sm:p-8 border border-[#E2E8F0] shadow-sm flex flex-col md:flex-row items-center gap-6 sm:gap-8">
              {/* Score Ring */}
              <div className="relative w-32 h-32 sm:w-40 sm:h-40 shrink-0 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="45" fill="none" stroke="#F1F5F9" strokeWidth="8" />
                  <circle 
                    cx="50" cy="50" r="45" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="8" 
                    strokeDasharray={`${score * 2.827} 282.7`} 
                    strokeLinecap="round" 
                    className={"text-[#2563EB] transition-all duration-1000 ease-out"} 
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-foreground font-display font-bold text-4xl sm:text-5xl">
                  {score}
                </div>
              </div>
              
              {/* Text Content */}
              <div className="flex-1 text-center md:text-left">
                <p className="text-[#64748B] text-sm font-medium mb-1">Overall ATS Score</p>
                <h2 className="text-2xl sm:text-3xl font-display font-bold text-foreground mb-3">{analysis.overallAnalysis?.rating || "Good Match"}</h2>
                <p className="text-sm text-[#64748B] mb-5 leading-relaxed">
                  {analysis.overallAnalysis?.description || "Your resume scores above average. With a few targeted improvements, you could reach 90+."}
                </p>
                <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                  <span className="px-3 py-1 bg-green-50 text-green-700 text-xs font-semibold rounded-full">
                    Top {analysis.overallAnalysis?.applicantRank || "30%"} of applicants
                  </span>
                  <span className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-semibold rounded-full">
                    {analysis.overallAnalysis?.quickFixes || 5} quick fixes available
                  </span>
                </div>
              </div>
            </div>

            {/* 2. Detailed Score Breakdown */}
            <div className="bg-white rounded-2xl p-5 sm:p-8 border border-[#E2E8F0] shadow-sm">
              <h3 className="text-lg sm:text-xl font-display font-semibold mb-6 flex items-center gap-2">
                <BarChart3 className="text-[#2563EB] w-5 h-5" /> Detailed Score Breakdown
              </h3>
              <div className="space-y-6">
                {(analysis.scoreBreakdown || []).map((item, i) => (
                  <div key={i} className="space-y-2 min-w-0">
                    <div className="flex justify-between text-sm font-medium">
                      <span className="flex min-w-0 items-center gap-2 text-foreground">
                        {item.category === "Keyword Match" && <Target className="w-4 h-4 text-[#64748B]" />}
                        {item.category === "Experience Relevance" && <TrendingUp className="w-4 h-4 text-[#64748B]" />}
                        {item.category === "Skills Alignment" && <Zap className="w-4 h-4 text-[#64748B]" />}
                        {item.category === "Education Fit" && <Award className="w-4 h-4 text-[#64748B]" />}
                        {item.category === "Formatting & ATS" && <FileText className="w-4 h-4 text-[#64748B]" />}
                        <span className="break-words">{item.category}</span>
                      </span>
                      <span className={getScoreColor(item.score)}>{item.score}%</span>
                    </div>
                    <div className="h-2.5 w-full bg-[#F1F5F9] rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${getScoreBg(item.score)}`} style={{ width: `${item.score}%` }} />
                    </div>
                    <p className="text-xs text-[#64748B]">{item.feedback}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* 3. Keyword Analysis */}
            <div className="bg-white rounded-2xl p-5 sm:p-8 border border-[#E2E8F0] shadow-sm">
              <h3 className="text-lg sm:text-xl font-display font-semibold mb-2 flex items-center gap-2">
                <Target className="text-[#2563EB] w-5 h-5" /> Keyword Analysis
              </h3>
              <p className="text-sm text-[#64748B] mb-6">Keywords from the job description matched against your resume</p>
              
              <div className="flex flex-wrap gap-2 sm:gap-3 mb-6 sm:mb-8">
                {(analysis.keywordAnalysis?.missing || []).map((kw, i) => (
                  <span key={`m-${i}`} className="inline-flex max-w-full items-center px-3 py-1.5 rounded-full text-xs font-medium border border-red-200 bg-red-50 text-red-600">
                    <XCircle className="w-3.5 h-3.5 mr-1.5" /> {kw.keyword} <span className="ml-1 opacity-70 font-normal">({kw.priority})</span>
                  </span>
                ))}
                {(analysis.keywordAnalysis?.found || []).map((kw, i) => (
                  <span key={`f-${i}`} className="inline-flex max-w-full items-center px-3 py-1.5 rounded-full text-xs font-medium border border-green-200 bg-green-50 text-green-600">
                    <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" /> {kw.keyword} <span className="ml-1 opacity-70 font-normal">({kw.priority})</span>
                  </span>
                ))}
              </div>
              
              <div className="bg-[#F8FAFC] rounded-2xl p-4 sm:p-6 grid grid-cols-3 gap-3 sm:gap-8 items-center">
                <div>
                  <p className="text-2xl font-bold text-green-600">{analysis.keywordAnalysis?.found?.length || 0}</p>
                  <p className="text-xs text-[#64748B] font-medium mt-1">Found</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-red-500">{analysis.keywordAnalysis?.missing?.length || 0}</p>
                  <p className="text-xs text-[#64748B] font-medium mt-1">Missing</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{analysis.keywordAnalysis?.coverage || 0}%</p>
                  <p className="text-xs text-[#64748B] font-medium mt-1">Coverage</p>
                </div>
              </div>
            </div>

            {/* 4. What's Working Well */}
            <div className="bg-white rounded-2xl p-5 sm:p-8 border border-[#E2E8F0] shadow-sm">
              <h3 className="text-lg sm:text-xl font-display font-semibold mb-6 flex items-center gap-2">
                <CheckCircle2 className="text-green-500 w-5 h-5" /> What&apos;s Working Well
              </h3>
              <div className="space-y-4">
                {(analysis.strengths || []).map((s, i) => (
                  <div key={i} className="flex gap-3 sm:gap-4 items-start bg-[#F0FDF4] p-4 rounded-2xl border border-green-100">
                    <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                    <div className="flex-1 space-y-2">
                      <p className="text-sm text-foreground">{s.description}</p>
                      <span className="inline-block px-2 py-1 bg-green-100 text-green-700 text-[10px] font-semibold rounded uppercase tracking-wider">
                        {s.category}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 5. Needs Improvement */}
            <div className="bg-white rounded-2xl p-5 sm:p-8 border border-[#E2E8F0] shadow-sm">
              <h3 className="text-lg sm:text-xl font-display font-semibold mb-6 flex items-center gap-2">
                <AlertTriangle className="text-yellow-500 w-5 h-5" /> Needs Improvement
              </h3>
              <div className="space-y-4">
                {(analysis.improvements || []).map((imp, i) => (
                  <div key={i} className="flex gap-3 sm:gap-4 items-start bg-white p-4 rounded-2xl border border-[#E2E8F0]">
                    <div className="w-6 h-6 rounded-full bg-yellow-100 flex items-center justify-center shrink-0 mt-0.5">
                      <span className="text-yellow-600 text-sm font-bold">!</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-foreground">{imp.description}</p>
                      <div className="flex items-center gap-2 mt-3">
                        <span className={`px-2 py-1 text-[10px] font-semibold rounded-full uppercase tracking-wider ${
                          imp.priority === 'High' ? 'bg-red-50 text-red-600 border border-red-100' :
                          imp.priority === 'Medium' ? 'bg-yellow-50 text-yellow-600 border border-yellow-100' :
                          'bg-gray-50 text-gray-600 border border-gray-200'
                        }`}>
                          {imp.priority} Priority
                        </span>
                        <span className="px-2 py-1 bg-[#F1F5F9] text-[#64748B] text-[10px] font-semibold rounded-full uppercase tracking-wider hidden sm:block">
                          {imp.category}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 6. AI-Powered Suggestions */}
            <div className="bg-[#F0F4F8] rounded-2xl p-5 sm:p-8 border border-[#E2E8F0] shadow-sm">
              <h3 className="text-lg sm:text-xl font-display font-semibold mb-2 flex items-center gap-2">
                <Lightbulb className="text-[#2563EB] w-5 h-5" /> AI-Powered Suggestions
              </h3>
              <p className="text-sm text-[#64748B] mb-8">
                Personalized recommendations based on the <span className="font-semibold text-foreground">{resume?.jobTitle}</span> job description:
              </p>
              
              <div className="space-y-6">
                {(analysis.aiSuggestions || []).map((sug, i) => (
                  <div key={i} className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-white min-w-0">
                    <h4 className="font-semibold text-foreground mb-4 flex items-start gap-2">
                      {sug.type === 'summary' && <Zap className="text-[#2563EB] w-4 h-4" />}
                      {sug.type === 'keywords' && <Target className="text-[#2563EB] w-4 h-4" />}
                      {sug.type === 'bullet' && <TrendingUp className="text-[#2563EB] w-4 h-4" />}
                      {sug.title}
                    </h4>
                    
                    {sug.description && (
                      <div className="bg-white border border-[#E2E8F0] rounded-xl p-4 text-sm text-foreground italic mb-4">
                        &quot;{sug.description}&quot;
                      </div>
                    )}

                    {sug.keywords && sug.keywords.length > 0 && (
                      <div className="mb-4">
                        <p className="text-sm text-[#64748B] mb-3">Weave these into your experience bullets:</p>
                        <div className="flex flex-wrap gap-2">
                          {sug.keywords.map((kw, ki) => (
                            <span key={ki} className="px-3 py-1.5 bg-[#EFF6FF] text-[#2563EB] text-xs font-medium rounded-full">
                              + {kw}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {sug.before && sug.after && (
                      <div className="mt-4">
                        <p className="text-sm text-[#64748B] mb-3">Transform vague bullets into impactful ones:</p>
                        <div className="space-y-3">
                          <div className="bg-[#FEF2F2] rounded-xl p-4 text-sm border border-[#FEE2E2] break-words">
                            <span className="text-red-500 font-semibold text-xs uppercase block mb-1">X Before</span>
                            &quot;{sug.before}&quot;
                          </div>
                          <div className="bg-[#F0FDF4] rounded-xl p-4 text-sm border border-[#DCFCE7] break-words">
                            <span className="text-green-600 font-semibold text-xs uppercase block mb-1">✓ After</span>
                            &quot;{sug.after}&quot;
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}

                {analysis.estimatedImprovement && (
                  <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm">
                    <div>
                      <h4 className="font-semibold text-foreground flex items-center gap-2 mb-4">
                        <Award className="text-[#2563EB] w-5 h-5" /> Estimated Score After Changes
                      </h4>
                      <div className="flex flex-wrap items-end gap-4 sm:gap-6 pl-1">
                        <div className="text-center">
                          <p className="text-4xl font-display font-bold text-[#64748B]">{analysis.estimatedImprovement.current || score}</p>
                          <p className="text-xs text-[#64748B] mt-1">Current</p>
                        </div>
                        <div className="pb-3 text-[#CBD5E1]">→</div>
                        <div className="text-center">
                          <p className="text-4xl font-display font-bold text-green-600">{analysis.estimatedImprovement.projected || Math.min(100, score + 12)}</p>
                          <p className="text-xs text-[#64748B] mt-1">Projected</p>
                        </div>
                        <div className="pb-3 pl-4">
                          <span className="px-3 py-1.5 bg-green-50 text-green-700 text-xs font-semibold rounded-full">
                            +{analysis.estimatedImprovement.increase || Math.min(100 - score, 12)} points
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      </main>

      {showPdfModal && (
        <PdfViewerModal 
          fileUrl={resume?.filePath?.startsWith('http') ? resume.filePath : `/uploads/${resume?.storedFileName}`} 
          fileName={resume?.originalFileName}
          onClose={() => setShowPdfModal(false)}
        />
      )}
    </div>
  );
}
