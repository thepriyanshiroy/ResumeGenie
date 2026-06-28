const fs = require('fs').promises;
const Resume = require('../models/resumeModel');
const ResumeAnalysis = require('../models/resumeAnalysisModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const parsePDF = require('../utils/pdfParser');
const geminiService = require("../services/geminiService");
exports.uploadResume = catchAsync(async (req, res, next) => {
    const resume = await Resume.create({
        user: req.user.id,
        companyName: req.body.companyName,
        jobTitle: req.body.jobTitle,
        jobDescription: req.body.jobDescription,
        originalFileName: req.file.originalname,
        storedFileName: req.file.filename,
        filePath: req.file.path,
        mimeType: req.file.mimetype,
        fileSize: req.file.size
    });
    const extractedText = await parsePDF(req.file.path);
    resume.extractedText = extractedText;
    resume.status = 'parsed';

    await resume.save();
    res.status(201).json({
        status: 'success',
        data: {
            resume
        }
    });

});
exports.getAllResumes = catchAsync(async (req, res, next) => {

    const resumes = await Resume.find({
        user: req.user.id
    });

    res.status(200).json({
        status: 'success',
        results: resumes.length,
        data: {
            resumes
        }
    });

});

exports.getResume = catchAsync(async (req, res, next) => {

    const resume = await Resume.findOne({
        _id: req.params.id,
        user: req.user.id
    });

    if (!resume) {
        return next(new AppError('No resume found with that ID.', 404));
    }

    res.status(200).json({
        status: 'success',
        data: {
            resume
        }
    });

});

exports.deleteResume = catchAsync(async (req, res, next) => {

    const resume = await Resume.findOneAndDelete({
        _id: req.params.id,
        user: req.user.id
    });

    if (!resume) {
        return next(new AppError('No resume found with that ID.', 404));
    }

    res.status(204).json({
        status: 'success',
        data: null
    });

});
exports.analyzeResume = catchAsync(async (req, res, next) => {

    const resume = await Resume.findById(req.params.id);

    if (!resume) {
        return next(new AppError("Resume not found", 404));
    }

    const analysisText = await geminiService.analyzeResume(
        resume.extractedText,
        resume.companyName,
        resume.jobTitle,
        resume.jobDescription
    );
    
    // Clean markdown formatting if AI returns it and parse JSON
    const cleanJson = analysisText.replace(/```json/gi, '').replace(/```/gi, '').trim();
    let analysisData;
    try {
        analysisData = JSON.parse(cleanJson);
    } catch (error) {
        return next(new AppError("Failed to parse AI response as JSON", 500));
    }

    const savedAnalysis = await ResumeAnalysis.create({
        resume: resume._id,
        user: req.user._id,
        ...analysisData,
        analysisStatus: "completed"
    });

    resume.analysis = savedAnalysis._id;
    await resume.save();
    
    res.status(201).json({
        status: "success",
        data: {
            analysis: savedAnalysis
        }
    });
});
exports.getResumeAnalysis = catchAsync(async (req, res, next) => {
    // ResumeAnalysis has a 'resume' reference, so we query it directly
    const analysis = await ResumeAnalysis.findOne({ 
        resume: req.params.id, 
        user: req.user.id 
    });

    if (!analysis) {
        return next(new AppError('Analysis not found for this resume', 404));
    }

    res.status(200).json({
        status: 'success',
        data: analysis
    });
});