"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import api from "@/lib/axios";

export default function ProcessingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  
  const [step, setStep] = useState(0);

  const steps = [
    "Parsing resume...",
    "Matching to job description...",
    "Scoring & suggestions...",
    "Almost done..."
  ];

  useEffect(() => {
    if (!id) {
      router.push("/dashboard");
      return;
    }

    const runAnalysis = async () => {
      try {
        await api.post(`/resumes/${id}/analyze`);
        router.push(`/results/${id}`);
      } catch (err) {
        console.error("Analysis failed", err);
        const errorMessage = err.response?.data?.message || "Failed to analyze resume. Please try again.";
        alert(`Analysis Error: ${errorMessage}`);
        router.push("/dashboard");
      }
    };

    runAnalysis();
  }, [id, router]);

  useEffect(() => {
    // Cycle through messages just for visual feedback since we are waiting on a single API call
    const interval = setInterval(() => {
      setStep((prev) => (prev < steps.length - 1 ? prev + 1 : prev));
    }, 2000);
    return () => clearInterval(interval);
  }, [steps.length]);

  return (
    <div className="min-h-screen bg-[#F5F9FC] flex flex-col items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-10 max-w-md w-full shadow-[0_10px_30px_-10px_rgba(45,107,230,0.1)] text-center border border-border relative overflow-hidden">
        {/* Animated background gradient */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500 bg-[length:200%_100%] animate-[shimmer_2s_infinite]" />
        
        <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-8 relative">
          <Loader2 className="w-10 h-10 text-primary animate-spin" />
        </div>
        
        <h2 className="text-2xl font-display font-bold text-foreground mb-4">Analyzing Your Resume</h2>
        
        <div className="h-6">
          <p className="text-muted-foreground animate-pulse transition-all duration-300">
            {steps[step]}
          </p>
        </div>

        <div className="mt-8 pt-6 border-t border-border flex flex-col gap-3">
          {steps.map((s, i) => (
            <div key={i} className={`flex items-center text-sm ${i <= step ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
              <div className={`w-2 h-2 rounded-full mr-3 ${i === step ? 'bg-primary animate-pulse' : i < step ? 'bg-green-500' : 'bg-gray-200'}`} />
              {s}
            </div>
          ))}
        </div>
      </div>
      
      {/* Tailwind config for shimmer animation would ideally go to global css, but keeping self-contained here via style if needed, or rely on existing ones */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}} />
    </div>
  );
}
