const matchService = require('../services/matchService');
const { pool } = require('../config/db');

/**
 * Controller to handle resume to job description matching
 */
const analyzeMatch = async (req, res, next) => {
    try {
        const { resumeText, jobDescription } = req.body;

        // Validation
        if (!resumeText || typeof resumeText !== 'string' || resumeText.trim() === '') {
            return res.status(400).json({
                success: false,
                message: 'Invalid or missing "resumeText" in request body.'
            });
        }

        if (!jobDescription || typeof jobDescription !== 'string' || jobDescription.trim() === '') {
            return res.status(400).json({
                success: false,
                message: 'Invalid or missing "jobDescription" in request body.'
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
                result.score,
                result.matched,
                result.missing
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
        next(error); // Pass errors to global error handler
    }
};

module.exports = {
    analyzeMatch
};
