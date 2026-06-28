const mongoose = require("mongoose");

const resumeAnalysisSchema = new mongoose.Schema(
  {
    // Relationships
    resume: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Resume",
      required: true
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    // ----------------------------
    // Resume Sections
    // ----------------------------
    resumeSections: [
      {
        section: {
          type: String,
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
          type: String,
          enum: [
            "Complete",
            "Missing",
            "Needs Improvement"
          ]
        },

        feedback: String
      }
    ],

    // ----------------------------
    // Overall ATS Score
    // ----------------------------
    overallAnalysis: {
      score: {
        type: Number,
        min: 0,
        max: 100
      },

      rating: String,

      description: String,

      applicantRank: String,

      quickFixes: Number
    },

    // ----------------------------
    // Detailed Score Breakdown
    // ----------------------------
    scoreBreakdown: [
      {
        category: {
          type: String,
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

        score: {
          type: Number,
          min: 0,
          max: 100
        },

        feedback: String
      }
    ],

    // ----------------------------
    // Keyword Analysis
    // ----------------------------
    keywordAnalysis: {
      found: [
        {
          keyword: String,

          priority: {
            type: String,
            enum: [
              "Critical",
              "High",
              "Medium",
              "Low"
            ]
          }
        }
      ],

      missing: [
        {
          keyword: String,

          priority: {
            type: String,
            enum: [
              "Critical",
              "High",
              "Medium",
              "Low"
            ]
          }
        }
      ],

      coverage: {
        type: Number,
        min: 0,
        max: 100
      }
    },

    // ----------------------------
    // What's Working Well
    // ----------------------------
    strengths: [
      {
        category: String,

        description: String
      }
    ],

    // ----------------------------
    // Needs Improvement
    // ----------------------------
    improvements: [
      {
        priority: {
          type: String,
          enum: [
            "High",
            "Medium",
            "Low"
          ]
        },

        category: String,

        description: String
      }
    ],

    // ----------------------------
    // AI Suggestions
    // ----------------------------
    aiSuggestions: [
      {
        type: {
          type: String,
          enum: ["summary", "keywords", "bullet"]
        },
        title: String,
        description: String,
        keywords: [String],
        before: String,
        after: String
      }
    ],

    // ----------------------------
    // Estimated Score
    // ----------------------------
    estimatedImprovement: {
      current: Number,

      projected: Number,

      increase: Number
    },

    // ----------------------------
    // Analysis Status
    // ----------------------------
    analysisStatus: {
      type: String,
      enum: [
        "pending",
        "completed",
        "failed"
      ],
      default: "pending"
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model(
  "ResumeAnalysis",
  resumeAnalysisSchema
);