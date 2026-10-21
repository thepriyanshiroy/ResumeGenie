"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useDropzone } from "react-dropzone";
import { Upload, FileText, Loader2, ArrowRight, ArrowLeft, AlertCircle, ShieldAlert } from "lucide-react";
import DashboardNavbar from "@/components/dashboard/DashboardNavbar";
import api from "@/lib/axios";
import { toast } from "react-hot-toast";
import { isSafeTextInput, detectSecurityThreat } from "@/lib/securityValidation";

const analyzeSchema = z.object({
  companyName: z
    .string({ required_error: "Company name is required" })
    .trim()
    .min(2, "Company name must be at least 2 characters")
    .max(100, "Company name must not exceed 100 characters")
    .refine((val) => isSafeTextInput(val), (val) => ({
      message: detectSecurityThreat(val) || "Disallowed characters or injection pattern in company name"
    })),
  jobTitle: z
    .string({ required_error: "Job title is required" })
    .trim()
    .min(2, "Job title must be at least 2 characters")
    .max(100, "Job title must not exceed 100 characters")
    .refine((val) => isSafeTextInput(val), (val) => ({
      message: detectSecurityThreat(val) || "Disallowed characters or injection pattern in job title"
    })),
  experienceLevel: z.enum(["Intern", "Entry", "Mid", "Senior", "Lead"], {
    errorMap: () => ({ message: "Please select a valid experience level" })
  }),
  jobDescription: z
    .string({ required_error: "Job description is required" })
    .trim()
    .min(30, "Job description must be at least 30 characters for meaningful ATS matching")
    .max(10000, "Job description must not exceed 10,000 characters")
    .refine((val) => isSafeTextInput(val), (val) => ({
      message: detectSecurityThreat(val) || "Security Alert: Potential SQL/script injection pattern detected (' OR '1'='1' --). Please enter clean job description text."
    }))
});

export default function AnalyzePage() {
  const router = useRouter();
  const [file, setFile] = useState(null);
  const [fileError, setFileError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isValid }
  } = useForm({
    resolver: zodResolver(analyzeSchema),
    defaultValues: {
      companyName: "",
      jobTitle: "",
      experienceLevel: "Entry",
      jobDescription: ""
    },
    mode: "all" // Real-time validation on typing and on blur
  });

  const jobDescriptionValue = watch("jobDescription") || "";

  const onDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles.length > 0) {
      const selected = acceptedFiles[0];
      if (selected.size > 5 * 1024 * 1024) {
        setFileError("File size exceeds 5 MB. Please upload a smaller PDF.");
        setFile(null);
        return;
      }
      if (selected.type !== "application/pdf" && !selected.name.toLowerCase().endsWith(".pdf")) {
        setFileError("Only PDF files are supported for resume analysis.");
        setFile(null);
        return;
      }
      setFile(selected);
      setFileError("");
    }
  }, []);

  const onDropRejected = useCallback((rejections) => {
    if (rejections.length > 0) {
      const rej = rejections[0];
      const err = rej.errors[0];
      if (err?.code === "file-too-large") {
        setFileError("File is too large. Maximum size is 5 MB.");
      } else if (err?.code === "file-invalid-type") {
        setFileError("Only PDF files are supported for resume analysis.");
      } else {
        setFileError(err?.message || "Invalid file format");
      }
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    onDropRejected,
    accept: {
      "application/pdf": [".pdf"]
    },
    maxSize: 5 * 1024 * 1024,
    multiple: false
  });

  const onSubmit = async (data) => {
    if (!file) {
      setFileError("Please upload a resume file (PDF).");
      toast.error("Please upload your resume file (PDF)");
      return;
    }

    // Additional security sanity check
    const threat = detectSecurityThreat(data.jobDescription) || detectSecurityThreat(data.companyName) || detectSecurityThreat(data.jobTitle);
    if (threat) {
      toast.error(threat);
      return;
    }

    try {
      setIsSubmitting(true);

      const submitData = new FormData();
      submitData.append("resume", file);
      submitData.append("companyName", data.companyName.trim());
      submitData.append("jobTitle", data.jobTitle.trim());
      submitData.append("jobDescription", data.jobDescription.trim());
      submitData.append("experienceLevel", data.experienceLevel);

      const res = await api.post("/resumes/upload", submitData, {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      });

      const resumeId = res.data.data.resume._id;
      toast.success("Resume uploaded successfully! Analyzing...");
      router.push(`/processing?id=${resumeId}`);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to upload resume. Please try again.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F9FC] overflow-x-hidden">
      <DashboardNavbar />

      <main className="safe-x py-6 sm:p-8 md:p-12 max-w-7xl mx-auto">
        <div className="mb-6 sm:mb-10 flex flex-col gap-4">
          <Link
            href="/dashboard"
            className="text-[#64748B] hover:text-foreground flex items-center text-sm font-medium w-fit transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
          </Link>
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold font-display text-foreground mb-3">
              Analyze Your Resume
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
              Tell us about the role you&apos;re targeting to get tailored feedback.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10" noValidate>
          {/* Left Column: Upload */}
          <div className="flex flex-col">
            <label className="text-sm font-semibold text-foreground mb-2">
              1. Upload Resume (PDF) *
            </label>
            <div
              {...getRootProps()}
              className={`min-h-[320px] lg:min-h-[520px] border-2 border-dashed rounded-2xl p-6 sm:p-10 flex flex-col items-center justify-center text-center transition-colors cursor-pointer focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2 ${
                fileError
                  ? "border-red-400 bg-red-50/20"
                  : isDragActive
                  ? "border-primary bg-primary/5"
                  : "border-[#DDE4ED] bg-white hover:bg-gray-50"
              }`}
            >
              <input {...getInputProps()} />

              {!file ? (
                <>
                  <div
                    className={`w-16 h-16 rounded-full flex items-center justify-center mb-6 ${
                      fileError ? "bg-red-100" : "bg-blue-50"
                    }`}
                  >
                    <Upload className={`w-8 h-8 ${fileError ? "text-red-500" : "text-primary"}`} />
                  </div>
                  <h3 className="text-lg sm:text-xl font-display font-semibold mb-2">
                    Drag & drop your resume
                  </h3>
                  <p className="text-muted-foreground mb-6">or click to browse from your computer</p>
                  <p className="text-sm text-muted-foreground">
                    PDF format only, up to 5 MB. Processed securely.
                  </p>
                </>
              ) : (
                <>
                  <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mb-6">
                    <FileText className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-display font-semibold mb-2 text-foreground break-all max-w-full">
                    {file.name}
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setFile(null);
                      setFileError("");
                    }}
                    className="text-sm text-red-500 hover:underline font-medium"
                  >
                    Remove file
                  </button>
                </>
              )}
            </div>

            {fileError && (
              <div className="flex items-center gap-1.5 text-sm text-red-600 mt-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{fileError}</span>
              </div>
            )}
          </div>

          {/* Right Column: Form details */}
          <div className="bg-white rounded-2xl p-5 sm:p-8 border border-border shadow-sm flex flex-col min-w-0">
            <h2 className="text-lg sm:text-xl font-display font-semibold mb-6">2. Job Details</h2>

            <div className="space-y-5 flex-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* Company Name */}
                <div>
                  <label htmlFor="companyName" className="block text-sm font-semibold text-foreground mb-2">
                    Company Name *
                  </label>
                  <input
                    type="text"
                    id="companyName"
                    {...register("companyName")}
                    className={`w-full min-h-11 px-4 rounded-xl border bg-white focus:outline-none focus:ring-2 transition-colors ${
                      errors.companyName
                        ? "border-red-500 focus:ring-red-400 bg-red-50/10"
                        : "border-border focus:ring-primary focus:border-transparent"
                    }`}
                    placeholder="e.g. Google"
                  />
                  {errors.companyName && (
                    <p className="text-xs text-red-600 mt-1.5 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      {errors.companyName.message}
                    </p>
                  )}
                </div>

                {/* Job Title */}
                <div>
                  <label htmlFor="jobTitle" className="block text-sm font-semibold text-foreground mb-2">
                    Job Title *
                  </label>
                  <input
                    type="text"
                    id="jobTitle"
                    {...register("jobTitle")}
                    className={`w-full min-h-11 px-4 rounded-xl border bg-white focus:outline-none focus:ring-2 transition-colors ${
                      errors.jobTitle
                        ? "border-red-500 focus:ring-red-400 bg-red-50/10"
                        : "border-border focus:ring-primary focus:border-transparent"
                    }`}
                    placeholder="e.g. Frontend Engineer"
                  />
                  {errors.jobTitle && (
                    <p className="text-xs text-red-600 mt-1.5 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      {errors.jobTitle.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Experience Level */}
              <div>
                <label htmlFor="experienceLevel" className="block text-sm font-semibold text-foreground mb-2">
                  Experience Level *
                </label>
                <select
                  id="experienceLevel"
                  {...register("experienceLevel")}
                  className={`w-full min-h-11 px-4 rounded-xl border bg-white focus:outline-none focus:ring-2 transition-colors ${
                    errors.experienceLevel
                      ? "border-red-500 focus:ring-red-400"
                      : "border-border focus:ring-primary focus:border-transparent"
                  }`}
                >
                  <option value="Intern">Intern</option>
                  <option value="Entry">Entry Level</option>
                  <option value="Mid">Mid Level</option>
                  <option value="Senior">Senior</option>
                  <option value="Lead">Lead / Staff</option>
                </select>
                {errors.experienceLevel && (
                  <p className="text-xs text-red-600 mt-1.5 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    {errors.experienceLevel.message}
                  </p>
                )}
              </div>

              {/* Job Description */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label htmlFor="jobDescription" className="block text-sm font-semibold text-foreground">
                    Job Description *
                  </label>
                  <span
                    className={`text-xs ${
                      jobDescriptionValue.trim().length >= 30
                        ? "text-muted-foreground"
                        : "text-amber-600 font-medium"
                    }`}
                  >
                    {jobDescriptionValue.trim().length}/30 min chars
                  </span>
                </div>
                <textarea
                  id="jobDescription"
                  {...register("jobDescription")}
                  className={`w-full min-w-0 p-4 rounded-xl border bg-white focus:outline-none focus:ring-2 transition-colors min-h-44 sm:min-h-48 resize-y ${
                    errors.jobDescription
                      ? "border-red-500 focus:ring-red-400 bg-red-50/10"
                      : "border-border focus:ring-primary focus:border-transparent"
                  }`}
                  placeholder="Paste the full job description here (minimum 30 characters)..."
                />
                {errors.jobDescription && (
                  <div className="flex items-start gap-1.5 text-xs text-red-600 mt-2 bg-red-50 p-2.5 rounded-xl border border-red-200">
                    <ShieldAlert className="w-4 h-4 shrink-0 text-red-600 mt-0.5" />
                    <span className="font-medium leading-relaxed">{errors.jobDescription.message}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="pt-6 mt-6 border-t border-border">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full min-h-12 flex items-center justify-center rounded-xl bg-primary text-white font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Uploading & Preparing Analysis...
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
