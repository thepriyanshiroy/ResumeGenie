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
    <section className="w-full py-16 px-4 md:px-20 max-w-7xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {features.map((feature, index) => (
          <div key={index} className="flex flex-col items-center text-center p-10 rounded-[2rem] bg-card shadow-[0_4px_40px_rgba(45,107,230,0.06)] hover:shadow-[0_8px_40px_rgba(45,107,230,0.12)] transition-shadow duration-300">
            <div className="h-14 w-14 rounded-2xl bg-[#EBF1FA] flex items-center justify-center mb-6">
              {feature.icon}
            </div>
            <h3 className="text-xl font-bold font-display text-foreground mb-3">{feature.title}</h3>
            <p className="text-[#64748B] font-body">{feature.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
