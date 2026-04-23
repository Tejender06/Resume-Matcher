const { extractKeywords } = require('../utils/textProcessor');

/**
 * Calculates match score and extracts matched/missing keywords.
 * @param {string} resumeText 
 * @param {string} jobDescription 
 * @returns {Object} { score, matched, missing }
 */
const calculateMatch = (resumeText, jobDescription) => {
    const resumeData = extractKeywords(resumeText);
    const jobData = extractKeywords(jobDescription);

    const resumeWords = new Set(resumeData.keywords);
    const jobWords = jobData.keywords;

    if (jobWords.length === 0) {
        return {
            score: 0,
            matched: [],
            missing: []
        };
    }

    // Find matched and missing words
    const matchedWords = [];
    const missingWords = [];

    jobWords.forEach(word => {
        if (resumeWords.has(word)) {
            matchedWords.push(word);
        } else {
            missingWords.push(word);
        }
    });

    // Calculate score: (matched count / total job keywords count) * 100
    let score = (matchedWords.length / jobWords.length) * 100;
    score = Math.round(score);

    // Limit to top 10 keywords for cleaner output
    // The lists are already sorted by relevance (frequency in job description)
    const topMatched = matchedWords.slice(0, 10);
    const topMissing = missingWords.slice(0, 10);

    return {
        score,
        matched: topMatched,
        missing: topMissing
    };
};

module.exports = {
    calculateMatch
};
