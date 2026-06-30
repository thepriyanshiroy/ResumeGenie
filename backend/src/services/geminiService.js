const { GoogleGenAI, Type } = require("@google/genai");
const AppError = require('../utils/appError');
const { generateResumePrompt } = require('../utils/resumePrompt');

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY
});

exports.analyzeResume = async (
  resumeText,
  companyName,
  jobTitle,
  jobDescription
) => {
  const prompt = generateResumePrompt(resumeText, companyName, jobTitle, jobDescription);

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          resumeSections: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                section: {
                  type: Type.STRING,
                  enum: [
                    "Contact Info",
                    "Professional Summary",
                    "Work Experience",
                    "Skills",
                    "Education",
                    "Projects",
                    "Certifications"
                  ]
                },
                status: {
                  type: Type.STRING,
                  enum: ["Complete", "Missing", "Needs Improvement"]
                },
                feedback: { type: Type.STRING }
              }
            }
          },
          overallAnalysis: {
            type: Type.OBJECT,
            properties: {
              score: { type: Type.INTEGER },
              rating: { type: Type.STRING },
              description: { type: Type.STRING },
              applicantRank: { type: Type.STRING },
              quickFixes: { type: Type.INTEGER }
            }
          },
          scoreBreakdown: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                category: {
                  type: Type.STRING,
                  enum: [
                    "Keyword Match",
                    "Experience Relevance",
                    "Skills Alignment",
                    "Education Fit",
                    "Formatting & ATS",
                    "Impact & Metrics",
                    "Leadership & Soft Skills",
                    "Industry Relevance"
                  ]
                },
                score: { type: Type.INTEGER },
                feedback: { type: Type.STRING }
              }
            }
          },
          keywordAnalysis: {
            type: Type.OBJECT,
            properties: {
              found: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    keyword: { type: Type.STRING },
                    priority: {
                      type: Type.STRING,
                      enum: ["Critical", "High", "Medium", "Low"]
                    }
                  }
                }
              },
              missing: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    keyword: { type: Type.STRING },
                    priority: {
                      type: Type.STRING,
                      enum: ["Critical", "High", "Medium", "Low"]
                    }
                  }
                }
              },
              coverage: { type: Type.INTEGER }
            }
          },
          strengths: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                category: { type: Type.STRING },
                description: { type: Type.STRING }
              }
            }
          },
          improvements: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                priority: {
                  type: Type.STRING,
                  enum: ["High", "Medium", "Low"]
                },
                category: { type: Type.STRING },
                description: { type: Type.STRING }
              }
            }
          },
          aiSuggestions: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                type: { type: Type.STRING, enum: ["summary", "keywords", "bullet"] },
                title: { type: Type.STRING },
                description: { type: Type.STRING },
                keywords: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING }
                },
                before: { type: Type.STRING },
                after: { type: Type.STRING }
              }
            }
          },
          estimatedImprovement: {
            type: Type.OBJECT,
            properties: {
              current: { type: Type.INTEGER },
              projected: { type: Type.INTEGER },
              increase: { type: Type.INTEGER }
            }
          }
        }
      }
    }
  });

  const analysisText = response.text;
  const cleanJson = analysisText.replace(/```json/gi, '').replace(/```/gi, '').trim();
  
  try {
    return JSON.parse(cleanJson);
  } catch (error) {
    throw new AppError("Failed to parse AI response as JSON", 500);
  }
};