// 🔧 Central Configuration Management System
// Replaces all magic numbers throughout the codebase

export const CONFIG = {
    // 🎭 Language Evolution Engine
    LANGUAGE_EVOLUTION: {
        // Context Drift - RAPID CONTEXT CHANGES
        CONTEXT_DRIFT_PROBABILITY: 0.5,
        MAX_CONTEXT_HISTORY: 3,
        
        // Sampling Parameters - MAXIMUM DIVERSITY
        DEFAULT_SAMPLING_TEMP: 2.5,
        DEFAULT_TOP_K: 3,
        MAX_RECENT_WORDS: 20,
        
        // Scoring Weights
        SEMANTIC_RELEVANCE_WEIGHT: 0.5,
        VOCABULARY_OWNERSHIP_WEIGHT: 0.3,
        SUCCESS_RATE_WEIGHT: 0.4,
        CONSCIOUSNESS_BONUS_WEIGHT: 0.2,
        NOVELTY_WEIGHT: 1.0,
        
        // Anti-Monotony - ULTRA AGGRESSIVE SETTINGS
        DIVERSITY_USAGE_PROBABILITY: 0.9,
        MAX_PENALTY_VALUE: 2.0,
        RECENT_USAGE_PENALTY: 0.8,
        TOTAL_USAGE_PENALTY: 0.2,
        FRESH_WORD_BONUS: 0.8,
        
        // Performance Limits
        MAX_CONVERSATION_HISTORY: 20,
        MAX_BIGRAM_CHAINS: 10,
        CLEANUP_INTERVAL_MS: 300000, // 5 minutes
        
        // Style Adaptation
        ADAPTATION_RATE: 0.1,
        MIN_SUCCESS_RATE: 0.3,
        HIGH_SUCCESS_RATE: 0.7
    },
    
    // 🎯 Morphological Dialogue Generator
    MORPHOLOGICAL: {
        // Sanitization
        MAX_WORD_LENGTH: 50,
        MIN_WORD_LENGTH: 2,
        MAX_REPEATED_CHARS: 2, // Configurable now!
        INVALID_CHAR_PATTERNS: [/[0-9]/g, /[^\wıüöçşğİÜÖÇŞĞ\s]/gi],
        
        // Dynamic Lexicon
        MAX_DYNAMIC_WORDS: 1000,
        LEXICON_CLEANUP_THRESHOLD: 1200,
        WORD_FREQUENCY_THRESHOLD: 0.1,
        
        // Success Tracking
        DEFAULT_SUCCESS_RATE: 0.5,
        LEARNING_RATE: 0.05,
        DECAY_RATE: 0.99
    },
    
    // 🔤 Turkish Morphology Engine
    MORPHOLOGY: {
        // Vowel Harmony
        FRONT_VOWELS: ['e', 'i', 'ö', 'ü'],
        BACK_VOWELS: ['a', 'ı', 'o', 'u'],
        ROUNDED_VOWELS: ['o', 'ö', 'u', 'ü'],
        UNROUNDED_VOWELS: ['a', 'e', 'ı', 'i'],
        
        // Consonant Assimilation
        VOICELESS_CONSONANTS: ['p', 't', 'k', 'ç', 'f', 'h', 's', 'ş'],
        VOICED_CONSONANTS: ['b', 'd', 'g', 'c', 'v', 'z', 'j', 'l', 'm', 'n', 'r', 'y'],
        
        // Performance
        MEMOIZATION_CACHE_SIZE: 500,
        LEVENSHTEIN_MAX_DISTANCE: 3
    },
    
    // 💾 Persistent Learning Engine
    PERSISTENT_LEARNING: {
        // Database Schema
        DB_NAME: 'mnBacLearningDB',
        DB_VERSION: 3,
        
        // Data Limits
        MAX_INTERACTIONS: 5000,
        MAX_TEMPORAL_DATA: 1000,
        MAX_CONTEXT_PATTERNS: 200,
        
        // Cleanup Policy
        INTERACTION_TTL_DAYS: 30,
        TEMPORAL_DATA_TTL_HOURS: 24,
        CLEANUP_INTERVAL_MS: 3600000, // 1 hour
        
        // Batch Operations
        BATCH_SIZE: 100,
        TRANSACTION_TIMEOUT_MS: 5000
    },
    
    // 🧠 TabPFN Adapter
    TABPFN: {
        // Cache Management
        PREDICTION_CACHE_SIZE: 200,
        FEATURE_VECTOR_SIZE: 15, // Extended from 10
        
        // Model Parameters
        CONFIDENCE_THRESHOLD: 0.6,
        MIN_VOCABULARY_SIZE: 5,
        MAX_SUGGESTIONS: 10,
        
        // Performance
        BATCH_PREDICTION_SIZE: 50,
        CACHE_TTL_MS: 1800000 // 30 minutes
    },
    
    // 🇹🇷 Turkish Dialogue Generator
    TURKISH_DIALOGUE: {
        // Template Management
        TEMPLATE_CACHE_SIZE: 100,
        MAX_TEMPLATE_COMPLEXITY: 5,
        
        // Generation Parameters
        MIN_SENTENCE_LENGTH: 3,
        MAX_SENTENCE_LENGTH: 12,
        ADVERB_USAGE_PROBABILITY: 0.3,
        EMOTION_INJECTION_PROBABILITY: 0.4
    },
    
    // 📊 Word Success Tracker
    WORD_SUCCESS: {
        // Weight Management
        DEFAULT_WEIGHT: 1.0,
        MAX_WEIGHT: 10.0,
        MIN_WEIGHT: 0.1,
        
        // Learning Parameters
        SUCCESS_BOOST: 0.2,
        FAILURE_PENALTY: 0.1,
        CONTEXT_LEARNING_RATE: 0.05,
        
        // Storage
        SNAPSHOT_INTERVAL_MS: 600000, // 10 minutes
        MAX_STORED_SNAPSHOTS: 5
    },
    
    // 🎨 UI & UX
    UI: {
        // Animation Timings
        FADE_DURATION_MS: 300,
        NOTIFICATION_DURATION_MS: 3000,
        LOADING_TIMEOUT_MS: 10000,
        
        // Performance
        MAX_CHAT_MESSAGES: 500,
        RENDER_BATCH_SIZE: 20,
        UPDATE_THROTTLE_MS: 100
    },
    
    // 🔧 Development & Testing
    DEV: {
        // Logging
        LOG_LEVEL: 'INFO', // DEBUG, INFO, WARN, ERROR
        MAX_LOG_ENTRIES: 1000,
        
        // Testing
        UNIT_TEST_TIMEOUT_MS: 5000,
        MOCK_DELAY_MS: 100,
        
        // Feature Flags
        ENABLE_PERFORMANCE_MONITORING: true,
        ENABLE_DETAILED_LOGGING: false,
        ENABLE_EXPERIMENTAL_FEATURES: true
    }
};

// 🎯 Environment-based Configuration Override
export function getConfig(environment = 'development') {
    const envConfigs = {
        development: {
            DEV: {
                ...CONFIG.DEV,
                LOG_LEVEL: 'DEBUG',
                ENABLE_DETAILED_LOGGING: true
            }
        },
        production: {
            DEV: {
                ...CONFIG.DEV,
                LOG_LEVEL: 'WARN',
                ENABLE_DETAILED_LOGGING: false,
                ENABLE_PERFORMANCE_MONITORING: false
            },
            PERSISTENT_LEARNING: {
                ...CONFIG.PERSISTENT_LEARNING,
                MAX_INTERACTIONS: 10000,
                CLEANUP_INTERVAL_MS: 1800000 // 30 minutes
            }
        },
        testing: {
            PERSISTENT_LEARNING: {
                ...CONFIG.PERSISTENT_LEARNING,
                DB_NAME: 'mnBacTestDB',
                MAX_INTERACTIONS: 100
            },
            DEV: {
                ...CONFIG.DEV,
                LOG_LEVEL: 'ERROR',
                UNIT_TEST_TIMEOUT_MS: 1000
            }
        }
    };
    
    return mergeDeep(CONFIG, envConfigs[environment] || {});
}

// 🔄 Deep merge utility for config override
function mergeDeep(target, source) {
    const result = { ...target };
    
    for (const key in source) {
        if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
            result[key] = mergeDeep(result[key] || {}, source[key]);
        } else {
            result[key] = source[key];
        }
    }
    
    return result;
}

// 🎮 Runtime Configuration Validation
export function validateConfig(config) {
    const errors = [];
    
    // Critical validations
    if (config.LANGUAGE_EVOLUTION.DEFAULT_TOP_K < 1) {
        errors.push('DEFAULT_TOP_K must be at least 1');
    }
    
    if (config.MORPHOLOGICAL.MAX_REPEATED_CHARS < 1) {
        errors.push('MAX_REPEATED_CHARS must be at least 1');
    }
    
    if (config.PERSISTENT_LEARNING.MAX_INTERACTIONS < 100) {
        errors.push('MAX_INTERACTIONS must be at least 100');
    }
    
    if (errors.length > 0) {
        throw new Error(`Configuration validation failed:\n${errors.join('\n')}`);
    }
    
    return true;
}

// 🚀 Export configured instance
const environment = typeof process !== 'undefined' && process.env.NODE_ENV || 'development';
export const RUNTIME_CONFIG = getConfig(environment);

// Validate on import
validateConfig(RUNTIME_CONFIG);

console.log(`🔧 SystemConfig loaded for environment: ${environment}`);

export default RUNTIME_CONFIG; 