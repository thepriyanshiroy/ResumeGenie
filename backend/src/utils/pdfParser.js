const fs = require('fs');
const pdfParse = require('pdf-parse');

const AppError = require('./appError');

const parsePDF = async (filePath) => {
    try {
        const dataBuffer = fs.readFileSync(filePath);

        const data = await pdfParse(dataBuffer);

        if (!data.text || data.text.trim().length === 0) {
            throw new AppError('No readable text found in the uploaded PDF.', 400);
        }

        return data.text;

    } catch (err) {
        throw new AppError(
            `Failed to parse PDF: ${err.message}`,
            500
        );
    }
};

module.exports = parsePDF;