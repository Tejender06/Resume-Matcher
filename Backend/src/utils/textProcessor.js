const stringSimilarity = require('string-similarity');

// 1. GENERIC WORDS BLACKLIST
const GENERIC_WORDS = new Set([
    "understanding", "knowledge", "ability", "role", "duration", "responsible",
    "etc", "experience", "basic", "strong", "good", "excellent", "working",
    "familiarity", "proficient", "skills", "years", "project", "team", "development",
    "exposure", "criteria", "issues", "fix", "quality", "structure"
]);

// 2. CANONICAL SKILL MAPPING
const CANONICAL_MAP = {
    "node": "node.js",
    "nodejs": "node.js",
    "express.js": "express",
    "postgres": "postgresql",
    "psql": "postgresql",
    "database": "postgresql",
    "api": "rest api",
    "rest": "rest api",
    "authentication": "jwt",
    "auth": "jwt"
};

// 3. CONTROLLED SKILL DICTIONARY
const SKILL_DICT = {
    core: [
        "node.js", "express", "django", "postgresql", "mysql", "mongodb", 
        "react", "python", "java", "typescript", "javascript"
    ],
    concepts: [
        "system design", "caching", "authentication", "jwt", "rest api", 
        "graphql", "microservices", "ci/cd", "backend architecture", "debugging"
    ],
    tools: [
        "docker", "kubernetes", "git", "redis", "linux", "aws", "gcp"
    ]
};

// Combine all known canonical skills for extraction
const ALL_KNOWN_SKILLS = [...SKILL_DICT.core, ...SKILL_DICT.concepts, ...SKILL_DICT.tools];

/**
 * Maps a raw term to its canonical form
 */
const getCanonicalTerm = (term) => {
    return CANONICAL_MAP[term] || term;
};

/**
 * Gets the weight of a canonical skill
 */
const getSkillWeight = (canonicalSkill) => {
    if (SKILL_DICT.core.includes(canonicalSkill)) return 3;
    if (SKILL_DICT.concepts.includes(canonicalSkill)) return 3;
    if (SKILL_DICT.tools.includes(canonicalSkill)) return 1;
    return 1; // Default fallback weight
};

const getSkillType = (canonicalSkill) => {
    if (SKILL_DICT.concepts.includes(canonicalSkill)) return 'concept';
    return 'skill';
};

/**
 * Extracts and deduplicates canonical skills from raw text
 * @param {string} text - Raw input string
 * @returns {Array} - Array of unique canonical skill objects
 */
const extractSkills = (text) => {
    if (!text) return [];

    // Clean text (lowercase, remove most punctuation but keep dots for node.js)
    const cleanText = text.toLowerCase().replace(/[^\w\s\.]/g, " ").replace(/\s+/g, " ");
    
    const extractedSkills = new Map(); // using Map for deduplication

    // Look for all known skills and their canonical forms in the text
    const words = cleanText.split(' ');
    const biGrams = [];
    for (let i = 0; i < words.length - 1; i++) {
        biGrams.push(`${words[i]} ${words[i+1]}`);
    }
    const triGrams = [];
    for (let i = 0; i < words.length - 2; i++) {
        triGrams.push(`${words[i]} ${words[i+1]} ${words[i+2]}`);
    }

    const allTokens = [...words, ...biGrams, ...triGrams];

    allTokens.forEach(token => {
        token = token.trim();
        if (token.length < 2 || GENERIC_WORDS.has(token)) return;

        let canonical = getCanonicalTerm(token);

        // Does this canonical term exist in our controlled dictionary?
        if (ALL_KNOWN_SKILLS.includes(canonical)) {
            extractedSkills.set(canonical, {
                skill: canonical,
                weight: getSkillWeight(canonical),
                type: getSkillType(canonical)
            });
        }
    });

    return Array.from(extractedSkills.values());
};

module.exports = {
    extractSkills,
    ALL_KNOWN_SKILLS,
    getSkillWeight,
    getCanonicalTerm
};
