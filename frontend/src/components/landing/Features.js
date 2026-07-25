"use client";
import { FileText, Target, TrendingUp } from "lucide-react";

export default function Features() {
  const features = [
    {
      icon: <FileText className="h-6 w-6 text-primary" strokeWidth={1.75} />,
      title: "Smart Parsing",
      description: "AI reads every section of your resume intelligently",
    },
    {
      icon: <Target className="h-6 w-6 text-primary" strokeWidth={1.75} />,
      title: "ATS Scoring",
      description: "Get precise compatibility scores for any job posting",
    },
    {
      icon: <TrendingUp className="h-6 w-6 text-primary" strokeWidth={1.75} />,
      title: "Actionable Tips",
      description: "Receive specific suggestions to improve your resume",
    },
  ];

  return (
    <section className="w-full safe-x py-10 sm:py-14 md:py-16 md:px-20 max-w-7xl mx-auto">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
        {features.map((feature, index) => (
          <div key={index} className="flex min-w-0 flex-col items-center text-center p-6 sm:p-8 lg:p-10 rounded-2xl bg-card shadow-[0_4px_40px_rgba(45,107,230,0.06)] hover:shadow-[0_8px_40px_rgba(45,107,230,0.12)] transition-shadow duration-300">
            <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-xl bg-[#EBF1FA] flex items-center justify-center mb-5 sm:mb-6">
              {feature.icon}
            </div>
            <h3 className="text-lg sm:text-xl font-bold font-display text-foreground mb-3">{feature.title}</h3>
            <p className="text-sm sm:text-base text-[#64748B] font-body leading-relaxed">{feature.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
