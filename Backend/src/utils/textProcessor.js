const sw = require('stopword');

/**
 * Normalizes text, tokenizes, removes stopwords and punctuation, and counts frequency.
 * @param {string} text - Raw input string
 * @returns {Object} - Object containing unique keywords and a word frequency map
 */
const extractKeywords = (text) => {
    if (!text) return { keywords: [], frequency: {} };

    // 1. Convert to lowercase and remove punctuation
    const cleanText = text.toLowerCase().replace(/[^\w\s]|_/g, " ").replace(/\s+/g, " ");

    // 2. Tokenize into words
    const tokens = cleanText.split(" ").filter(word => word.trim().length > 1);

    // 3. Remove stopwords (English)
    const filteredTokens = sw.removeStopwords(tokens);

    // 4. Count word frequency
    const frequency = {};
    filteredTokens.forEach(word => {
        frequency[word] = (frequency[word] || 0) + 1;
    });

    // 5. Extract unique keywords, sorted by frequency (descending)
    const keywords = Object.keys(frequency).sort((a, b) => frequency[b] - frequency[a]);

    return { keywords, frequency };
};

module.exports = {
    extractKeywords
};
