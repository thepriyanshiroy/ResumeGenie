const fs = require('fs');
const pdfParse = require('pdf-parse');

const AppError = require('./appError');

const axios = require('axios');

const parsePDF = async (filePath) => {
    try {
        let dataBuffer;
        if (filePath.startsWith('http')) {
            const response = await axios.get(filePath, { responseType: 'arraybuffer' });
            dataBuffer = Buffer.from(response.data);
        } else {
            dataBuffer = fs.readFileSync(filePath);
        }

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