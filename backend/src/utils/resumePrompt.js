exports.generateResumePrompt = (resumeText, companyName, jobTitle, jobDescription) => {
  return `
You are an expert ATS Resume Analyzer.
Analyze the provided resume against the job description.
Provide detailed feedback, score breakdown, and actionable suggestions.

Company:
${companyName}

Job Title:
${jobTitle}

Job Description:
${jobDescription}

Resume:
${resumeText}
`;
};
