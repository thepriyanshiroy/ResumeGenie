"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useDropzone } from "react-dropzone";
import { Upload, FileText, Loader2, ArrowRight } from "lucide-react";
import DashboardNavbar from "@/components/dashboard/DashboardNavbar";
import api from "@/lib/axios";
import { toast } from "react-hot-toast";

export default function AnalyzePage() {
  const router = useRouter();
  const [file, setFile] = useState(null);
  const [formData, setFormData] = useState({
    companyName: "",
    jobTitle: "",
    jobDescription: "",
    experienceLevel: "Entry"
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0]);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
    },
    maxSize: 5 * 1024 * 1024, // 5MB
    multiple: false
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      toast.error("Please upload a resume file");
      return;
    }
    
    if (!formData.companyName || !formData.jobTitle || !formData.jobDescription) {
      toast.error("Please fill all required fields");
      return;
    }

    try {
      setIsSubmitting(true);
      
      const submitData = new FormData();
      submitData.append("resume", file);
      submitData.append("companyName", formData.companyName);
      submitData.append("jobTitle", formData.jobTitle);
      submitData.append("jobDescription", formData.jobDescription);
      submitData.append("experienceLevel", formData.experienceLevel);

      // Upload to backend
      const res = await api.post("/resumes/upload", submitData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      const resumeId = res.data.data.resume._id;
      
      // Navigate to processing screen
      router.push(`/processing?id=${resumeId}`);
      
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to upload resume. Please try again.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F9FC]">
      <DashboardNavbar />
      
      <main className="p-8 md:p-12 max-w-7xl mx-auto">
        <div className="mb-10">
          <h1 className="text-4xl font-bold font-display text-foreground mb-3">Analyze Your Resume</h1>
          <p className="text-lg text-muted-foreground">Tell us about the role you&apos;re targeting to get tailored feedback.</p>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          
          {/* Left Column: Upload */}
          <div className="flex flex-col">
            <label className="text-sm font-semibold text-foreground mb-2">1. Upload Resume</label>
            <div 
              {...getRootProps()} 
              className={`flex-1 border-2 border-dashed rounded-3xl p-10 flex flex-col items-center justify-center text-center transition-colors cursor-pointer ${
                isDragActive ? 'border-primary bg-primary/5' : 'border-[#DDE4ED] bg-white hover:bg-gray-50'
              }`}
            >
              <input {...getInputProps()} />
              
              {!file ? (
                <>
                  <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-6">
                    <Upload className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-display font-semibold mb-2">Drag & drop your resume</h3>
                  <p className="text-muted-foreground mb-6">or click to browse from your computer</p>
                  <p className="text-sm text-muted-foreground">PDF or DOCX, up to 5 MB. Your file is processed securely and never shared.</p>
                </>
              ) : (
                <>
                  <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mb-6">
                    <FileText className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="text-xl font-display font-semibold mb-2 text-foreground truncate max-w-xs">{file.name}</h3>
                  <p className="text-muted-foreground mb-6">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                  <button type="button" onClick={(e) => { e.stopPropagation(); setFile(null); }} className="text-sm text-red-500 hover:underline">
                    Remove file
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Right Column: Form details */}
          <div className="bg-white rounded-3xl p-8 border border-border shadow-sm flex flex-col">
            <h2 className="text-xl font-display font-semibold mb-6">2. Job Details</h2>
            
            <div className="space-y-5 flex-1">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label htmlFor="companyName" className="block text-sm font-semibold text-foreground mb-2">Company Name *</label>
                  <input 
                    type="text" 
                    id="companyName"
                    name="companyName"
                    required
                    value={formData.companyName}
                    onChange={handleInputChange}
                    className="w-full h-11 px-4 rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white"
                    placeholder="e.g. Google"
                  />
                </div>
                
                <div>
                  <label htmlFor="jobTitle" className="block text-sm font-semibold text-foreground mb-2">Job Title *</label>
                  <input 
                    type="text" 
                    id="jobTitle"
                    name="jobTitle"
                    required
                    value={formData.jobTitle}
                    onChange={handleInputChange}
                    className="w-full h-11 px-4 rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white"
                    placeholder="e.g. Frontend Engineer"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="experienceLevel" className="block text-sm font-semibold text-foreground mb-2">Experience Level</label>
                <select 
                  id="experienceLevel"
                  name="experienceLevel"
                  value={formData.experienceLevel}
                  onChange={handleInputChange}
                  className="w-full h-11 px-4 rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white"
                >
                  <option value="Intern">Intern</option>
                  <option value="Entry">Entry Level</option>
                  <option value="Mid">Mid Level</option>
                  <option value="Senior">Senior</option>
                  <option value="Lead">Lead / Staff</option>
                </select>
              </div>

              <div>
                <label htmlFor="jobDescription" className="block text-sm font-semibold text-foreground mb-2">Job Description *</label>
                <textarea 
                  id="jobDescription"
                  name="jobDescription"
                  required
                  value={formData.jobDescription}
                  onChange={handleInputChange}
                  className="w-full p-4 rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white h-48 resize-none"
                  placeholder="Paste the full job description here..."
                />
              </div>
            </div>

            <div className="pt-6 mt-6 border-t border-border">
              <button 
                type="submit"
                disabled={isSubmitting || !file}
                className="w-full h-12 flex items-center justify-center rounded-xl bg-primary text-white font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    Run Analysis <ArrowRight className="w-5 h-5 ml-2" />
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
}
