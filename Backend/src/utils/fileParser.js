const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');

/**
 * Parses a buffer into text based on its mimetype
 * @param {Buffer} buffer - The file buffer
 * @param {string} mimetype - The file mimetype
 * @returns {Promise<string>} - Extracted text
 */
const parseFileBuffer = async (buffer, mimetype) => {
    try {
        if (mimetype === 'application/pdf') {
            const data = await pdfParse(buffer);
            return data.text;
        } else if (
            mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || 
            mimetype === 'application/msword'
        ) {
            const result = await mammoth.extractRawText({ buffer });
            return result.value;
        } else {
            throw new Error('Unsupported file type. Please upload a PDF or DOCX file.');
        }
    } catch (error) {
        throw new Error(`Failed to parse file: ${error.message}`);
    }
};

module.exports = {
    parseFileBuffer
};
