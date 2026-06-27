const Resume = require('../models/resumeModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const parsePDF = require('../utils/pdfParser');
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