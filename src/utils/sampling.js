// Enhanced Sampling Utilities for Language Evolution
// Prevents greedy selection and enables diversity

/**
 * Softmax function with temperature control
 * @param {number[]} scores - Array of scores
 * @param {number} temperature - Controls randomness (higher = more random)
 * @returns {number[]} - Probability distribution
 */
export function softmax(scores, temperature = 1.0) {
    if (!scores || scores.length === 0) return [];
    
    // Avoid division by zero
    const temp = Math.max(temperature, 0.01);
    
    // Calculate exponentials with temperature scaling
    const exps = scores.map(score => Math.exp(score / temp));
    const sum = exps.reduce((a, b) => a + b, 0);
    
    // Avoid NaN by ensuring sum > 0
    if (sum === 0) {
        // Return uniform distribution
        return new Array(scores.length).fill(1 / scores.length);
    }
    
    return exps.map(exp => exp / sum);
}

/**
 * Sample from items according to probability distribution
 * @param {any[]} items - Items to sample from
 * @param {number[]} probabilities - Probability distribution
 * @returns {any} - Sampled item
 */
export function sampleFrom(items, probabilities) {
    if (!items || items.length === 0) return null;
    if (!probabilities || probabilities.length !== items.length) {
        // Fallback to uniform random selection
        return items[Math.floor(Math.random() * items.length)];
    }
    
    const random = Math.random();
    let accumulator = 0;
    
    for (let i = 0; i < items.length; i++) {
        accumulator += probabilities[i];
        if (random < accumulator) {
            return items[i];
        }
    }
    
    // Fallback to last item (should rarely happen)
    return items[items.length - 1];
}

/**
 * Top-K + Softmax sampling - prevents greedy selection
 * @param {any[]} items - Items to sample from
 * @param {number[]} scores - Scores for each item
 * @param {number} K - Number of top items to consider
 * @param {number} temperature - Softmax temperature
 * @returns {any} - Sampled item
 */
export function topKSample(items, scores, K = 4, temperature = 2.0) {
    if (!items || items.length === 0) return null;
    if (!scores || scores.length !== items.length) {
        return items[Math.floor(Math.random() * items.length)];
    }
    
    // Create scored items
    const scoredItems = items.map((item, index) => ({
        item,
        score: scores[index] || 0
    }));
    
    // Sort by score descending
    scoredItems.sort((a, b) => b.score - a.score);
    
    // Take top K
    const topK = scoredItems.slice(0, Math.min(K, scoredItems.length));
    
    if (topK.length === 0) return null;
    if (topK.length === 1) return topK[0].item;
    
    // Apply softmax to top K scores
    const topScores = topK.map(item => item.score);
    const probabilities = softmax(topScores, temperature);
    const topItems = topK.map(item => item.item);
    
    return sampleFrom(topItems, probabilities);
}

/**
 * Calculate novelty penalty for a word based on recent usage
 * @param {string} word - Word to check
 * @param {string[]} recentWords - Recently used words
 * @param {Map} wordUsageCount - Global word usage counter
 * @param {number} maxPenalty - Maximum penalty to apply
 * @returns {number} - Novelty score (positive = bonus, negative = penalty)
 */
export function calculateNoveltyScore(word, recentWords = [], wordUsageCount = new Map(), maxPenalty = 1.0) {
    if (!word) return 0;
    
    // Count recent usage (last N words)
    const recentUsage = recentWords.filter(w => w === word).length;
    const totalUsage = wordUsageCount.get(word) || 0;
    
    // EXTREMELY AGGRESSIVE penalty for recent repeated usage
    let penalty = 0;
    if (recentUsage > 0) {
        penalty = Math.min(recentUsage * 0.8, maxPenalty); // 0.8 penalty per recent usage (MUCH MORE AGGRESSIVE!)
    }
    
    // Additional penalty for overall high usage  
    if (totalUsage > 3) { // Lower threshold for penalty
        penalty += Math.min((totalUsage - 3) * 0.2, maxPenalty * 0.7); // More aggressive global penalty
    }
    
    // Bonus for never used words
    const freshBonus = totalUsage === 0 ? 0.5 : 0;
    
    // Bonus for words not used recently
    const recentBonus = recentUsage === 0 && recentWords.length > 0 ? 0.2 : 0;
    
    return freshBonus + recentBonus - penalty;
}

/**
 * Smart context drift - gradually change context based on conversation flow
 * @param {string} currentContext - Current context
 * @param {string[]} availableContexts - Available context options
 * @param {string[]} recentWords - Recently used words
 * @param {number} driftProbability - Probability of context change
 * @returns {string} - New context (may be same as current)
 */
export function calculateContextDrift(currentContext, availableContexts, recentWords = [], driftProbability = 0.4) {
    if (!availableContexts || availableContexts.length === 0) return currentContext;
    
    // Force context change if current context not in available list
    if (!availableContexts.includes(currentContext)) {
        return availableContexts[Math.floor(Math.random() * availableContexts.length)];
    }
    
    // Random context drift
    if (Math.random() < driftProbability) {
        // Try to pick a different context
        const otherContexts = availableContexts.filter(ctx => ctx !== currentContext);
        if (otherContexts.length > 0) {
            return otherContexts[Math.floor(Math.random() * otherContexts.length)];
        }
    }
    
    // Contextual drift based on recent words (simple heuristic)
    if (recentWords.length > 3) {
        const lastWords = recentWords.slice(-3);
        
        // Simple keyword-based context suggestion
        if (lastWords.some(w => ['sevgi', 'arkadaş', 'paylaş'].includes(w))) {
            return 'social';
        }
        if (lastWords.some(w => ['dna', 'protein', 'hücre'].includes(w))) {
            return 'biological';
        }
        if (lastWords.some(w => ['mutlu', 'üzgün', 'korku'].includes(w))) {
            return 'emotional';
        }
        if (lastWords.some(w => ['düşün', 'felsefe', 'anlam'].includes(w))) {
            return 'philosophical';
        }
        if (lastWords.some(w => ['yaratık', 'sanat', 'hayal'].includes(w))) {
            return 'creative';
        }
    }
    
    return currentContext;
}

/**
 * Mood-based style adjustment
 * @param {number} mood - Bacteria mood (0.0 - 1.0)
 * @param {object} style - Style object to modify
 * @returns {object} - Modified style object
 */
export function adjustStyleByMood(mood, style) {
    const adjustedStyle = { ...style };
    
    // Ensure mood is in valid range
    const clampedMood = Math.max(0, Math.min(1, mood || 0.5));
    
    // Low mood = higher randomness, less absurdity
    adjustedStyle.samplingTemp = 1.0 + (1 - clampedMood) * 2; // 1.0-3.0 range
    adjustedStyle.absurdTolerance = (adjustedStyle.absurdTolerance || 0.3) * clampedMood;
    adjustedStyle.patternBreaking = (adjustedStyle.patternBreaking || 0.1) * clampedMood;
    
    // High mood = more creativity and social interaction
    if (clampedMood > 0.7) {
        adjustedStyle.creativity = Math.min(1, (adjustedStyle.creativity || 0.3) + 0.2);
        adjustedStyle.socialLevel = Math.min(1, (adjustedStyle.socialLevel || 0.5) + 0.1);
    }
    
    return adjustedStyle;
}

// Export all utilities as default object for easy importing
export default {
    softmax,
    sampleFrom,
    topKSample,
    calculateNoveltyScore,
    calculateContextDrift,
    adjustStyleByMood
}; 