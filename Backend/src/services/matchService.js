const { extractSkills } = require('../utils/textProcessor');
const stringSimilarity = require('string-similarity');

const DEPENDENCY_MAP = {
    "node.js": ["javascript"],
    "express": ["node.js"],
    "rest api": ["api"]
};

const CRITICAL_SKILLS = ["system design", "redis", "caching"];

/**
 * Applies fuzzy matching between required skills and candidate skills
 */
const isFuzzyMatch = (reqSkillObj, candidateSkills) => {
    if (candidateSkills.length === 0) return false;
    
    const candidateSkillNames = candidateSkills.map(s => s.skill);
    
    // Exact match optimization
    if (candidateSkillNames.includes(reqSkillObj.skill)) return true;

    // Strict concept matching
    const threshold = reqSkillObj.type === 'concept' ? 0.85 : 0.7;
    const bestMatch = stringSimilarity.findBestMatch(reqSkillObj.skill, candidateSkillNames);
    
    return bestMatch.bestMatch.rating >= threshold;
};

/**
 * Calculates match score and extracts matched/missing skills, using weighted fuzzy matching.
 */
const calculateMatch = (resumeText, jobDescription) => {
    const rawResumeSkills = extractSkills(resumeText);
    const jobSkills = extractSkills(jobDescription);

    if (jobSkills.length === 0) {
        return {
            match_percentage: 0,
            matched_skills: [],
            missing_skills: [],
            recommendation: "Skip",
            confidence: "Low"
        };
    }

    // 1. Skill Dependency Fix: Infer implied skills to satisfy job requirements
    const resumeSkillsMap = new Map();
    rawResumeSkills.forEach(s => resumeSkillsMap.set(s.skill, s));

    const inferred = [];
    resumeSkillsMap.forEach(s => {
        if (DEPENDENCY_MAP[s.skill]) {
            DEPENDENCY_MAP[s.skill].forEach(implied => {
                if (!resumeSkillsMap.has(implied)) {
                    inferred.push(implied);
                }
            });
        }
    });
    
    inferred.forEach(implied => {
        resumeSkillsMap.set(implied, { skill: implied, weight: 0 }); // Implied skills don't artificially inflate weight
    });
    
    const resumeSkills = Array.from(resumeSkillsMap.values());

    let totalRequiredWeight = 0;
    let matchedWeight = 0;
    
    const matchedSkillsList = [];
    let missingSkillsList = [];
    let missingCriticalCount = 0;

    // 2. Process requirements
    jobSkills.forEach(reqSkillObj => {
        totalRequiredWeight += reqSkillObj.weight;

        if (isFuzzyMatch(reqSkillObj, resumeSkills)) {
            matchedWeight += reqSkillObj.weight;
            matchedSkillsList.push(reqSkillObj.skill);
        } else {
            missingSkillsList.push(reqSkillObj.skill);
            if (CRITICAL_SKILLS.includes(reqSkillObj.skill)) {
                missingCriticalCount++;
            }
        }
    });

    // Remove dependent skills from missing just in case
    missingSkillsList = missingSkillsList.filter(missing => {
        let isImplied = false;
        matchedSkillsList.forEach(matched => {
            if (DEPENDENCY_MAP[matched] && DEPENDENCY_MAP[matched].includes(missing)) {
                isImplied = true;
            }
        });
        return !isImplied;
    });

    // 3. Base score
    let score = (matchedWeight / totalRequiredWeight) * 100;

    // 4. Bonus Signals
    const lowerResume = resumeText.toLowerCase();
    const lowerJob = jobDescription.toLowerCase();

    if (lowerJob.includes('recommendation system') && lowerResume.includes('recommendation system')) score += 5;
    if (lowerJob.includes('intern') && lowerResume.includes('intern')) score += 5;
    if (lowerJob.includes('backend') && lowerResume.includes('backend')) score += 5;

    // 5. Critical Skill Penalty
    if (missingCriticalCount > 0) {
        score -= (missingCriticalCount * 10);
    }

    // Cap at 100 before applying strict caps
    score = Math.min(score, 100);

    // 6. Score Cap Logic
    if (missingCriticalCount >= 2) {
        score = Math.min(score, 75);
    }
    
    // Floor at 0
    score = Math.max(Math.round(score), 0);

    // 7. Confidence & Recommendation
    let confidence = "Low";
    if (score >= 80 && missingCriticalCount === 0) {
        confidence = "High";
    } else if (score >= 60 && score <= 79) {
        confidence = "Medium";
    }

    let recommendation = "Skip";
    if (score >= 60) {
        recommendation = "Apply";
    }

    // Dedup Safety: filter matched and missing to be strictly unique
    const finalMatched = Array.from(new Set(matchedSkillsList));
    const finalMissing = Array.from(new Set(missingSkillsList));

    return {
        match_percentage: score,
        matched_skills: finalMatched,
        missing_skills: finalMissing,
        recommendation: recommendation,
        confidence: confidence
    };
};

module.exports = {
    calculateMatch
};
