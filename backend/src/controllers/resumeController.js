const fs = require('fs').promises;
const Resume = require('../models/resumeModel');
const ResumeAnalysis = require('../models/resumeAnalysisModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const parsePDF = require('../utils/pdfParser');
const geminiService = require("../services/geminiService");
const logger = require("../utils/logger");
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
    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    // Sorting
    const sort = req.query.sort ? req.query.sort.split(',').join(' ') : '-createdAt';

    const resumes = await Resume.find({
        user: req.user.id
    })
    .sort(sort)
    .skip(skip)
    .limit(limit);

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

    // Delete the physical file to prevent storage bloat
    if (resume.filePath) {
        try {
            await fs.unlink(resume.filePath);
            logger.info(`Deleted physical file: ${resume.filePath}`);
        } catch (err) {
            logger.error(`Error deleting physical file ${resume.filePath}: ${err.message}`);
        }
    }

    // Delete associated analysis if it exists
    await ResumeAnalysis.deleteMany({ resume: resume._id });

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

    const analysisData = await geminiService.analyzeResume(
        resume.extractedText,
        resume.companyName,
        resume.jobTitle,
        resume.jobDescription
    );

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