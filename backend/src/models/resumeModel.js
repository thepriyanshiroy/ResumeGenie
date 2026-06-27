const mongoose = require("mongoose");

const resumeSchema = new mongoose.Schema(
  {
    // Owner of the resume
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Resume must belong to a user"],
    },

    // Job Details
    companyName: {
      type: String,
      required: [true, "Please provide the company name"],
      trim: true,
    },

    jobTitle: {
      type: String,
      required: [true, "Please provide the job title"],
      trim: true,
    },

    jobDescription: {
      type: String,
      required: [true, "Please provide the job description"],
      trim: true,
    },

    // Uploaded File Information
    originalFileName: {
      type: String,
      required: [true, "Original file name is required"],
      trim: true,
    },

    storedFileName: {
      type: String,
      required: [true, "Stored file name is required"],
      unique: true,
    },

    filePath: {
      type: String,
      required: [true, "File path is required"],
    },

    mimeType: {
      type: String,
      required: [true, "File type is required"],
      enum: [
        "application/pdf",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ],
    },

    fileSize: {
      type: Number,
      required: [true, "File size is required"],
      min: 0,
    },

    // Parsed Resume Content
    extractedText: {
      type: String,
      default: "",
    },

    // Resume Processing Status
    status: {
      type: String,
      enum: [
        "uploaded",
        "parsing",
        "parsed",
        "analyzing",
        "completed",
        "failed",
      ],
      default: "uploaded",
    },
  },
  {
    timestamps: true,
  }
);

const Resume = mongoose.model("Resume", resumeSchema);

module.exports = Resume;