const matchService = require('../services/matchService');
const { pool } = require('../config/db');
const { parseFileBuffer } = require('../utils/fileParser');

/**
 * Controller to handle resume to job description matching
 */
const analyzeMatch = async (req, res, next) => {
    try {
        const { jobDescription } = req.body;
        const file = req.file;

        // Validation
        if (!file) {
            return res.status(400).json({
                success: false,
                message: 'Please upload a valid resume file (.pdf or .docx).'
            });
        }

        if (!jobDescription || typeof jobDescription !== 'string' || jobDescription.trim() === '') {
            return res.status(400).json({
                success: false,
                message: 'Invalid or missing "jobDescription" in request body.'
            });
        }

        // Parse the file buffer to text
        const resumeText = await parseFileBuffer(file.buffer, file.mimetype);

        if (!resumeText || resumeText.trim() === '') {
            return res.status(400).json({
                success: false,
                message: 'Could not extract any text from the uploaded file.'
            });
        }

        // Call service layer for core logic
        const result = matchService.calculateMatch(resumeText, jobDescription);

        // Save to PostgreSQL if DATABASE_URL is configured
        let matchId = null;
        if (process.env.DATABASE_URL) {
            const insertQuery = `
                INSERT INTO matches (resume_text, job_description, score, matched_keywords, missing_keywords)
                VALUES ($1, $2, $3, $4, $5)
                RETURNING id;
            `;
            const values = [
                resumeText,
                jobDescription,
                result.match_percentage || 0,
                result.matched_skills || [],
                result.missing_skills || []
            ];
            const dbRes = await pool.query(insertQuery, values);
            matchId = dbRes.rows[0].id;
            result.id = matchId; // Append the database ID to the response
        }

        // Success response
        return res.status(200).json({
            success: true,
            data: result
        });
    } catch (error) {
        if (error.message.includes('Unsupported file type')) {
             return res.status(400).json({ success: false, message: error.message });
        }
        next(error); // Pass errors to global error handler
    }
};

module.exports = {
    analyzeMatch
};
