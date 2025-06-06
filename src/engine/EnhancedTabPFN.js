/**
 * 🧠 Enhanced TabPFN - Multi-Layer Prediction Engine
 * NeoMag v8.9.1 - Advanced AI Conversation System
 */

export class EnhancedTabPFN {
    constructor(wordSuccessTracker) {
        this.wordTracker = wordSuccessTracker;
        this.isReady = false;
        this.contextMatrix = this._buildContextMatrix();
        this.culturalMemory = new Map(); // Community word patterns
        this.temporalPatterns = new Map(); // Time-based patterns
        this.crossBacteriaKnowledge = new Map(); // Shared learning
        
        // Performance metrics
        this.predictionHistory = [];
        this.accuracyScore = 0.75; // Starting accuracy
        
        console.log('🧠 Enhanced TabPFN initializing...');
    }

    async init() {
        try {
            this.isReady = true;
            console.log('✅ Enhanced TabPFN ready!');
            
            // Initialize prediction layers
            await this._initializePredictionLayers();
            
        } catch (error) {
            console.error('❌ Enhanced TabPFN initialization failed:', error);
            this.isReady = false;
        }
    }

    // Main prediction method with 5-layer analysis
    async generateNextWord(bacteria, context, conversationHistory = []) {
        if (!this.isReady) {
            console.warn('⚠️ Enhanced TabPFN not ready, using fallback');
            return this._fallbackPrediction(bacteria, context);
        }

        try {
            // Layer 1: Immediate context (last 3 words)
            const immediateLayer = this._predictFromImmediate(conversationHistory.slice(-3), context);
            
            // Layer 2: Conversation context (topic flow)
            const conversationalLayer = this._predictFromFlow(conversationHistory, context);
            
            // Layer 3: Personality context (bacteria traits)
            const personalityLayer = this._predictFromTraits(bacteria, context);
            
            // Layer 4: Cultural context (community words)
            const culturalLayer = this._predictFromCommunity(bacteria, context);
            
            // Layer 5: Temporal context (time-based patterns)
            const temporalLayer = this._predictFromTime(bacteria, context);

            // Weighted combination of all layers
            const predictions = {
                immediate: { words: immediateLayer, weight: 0.3 },
                conversational: { words: conversationalLayer, weight: 0.25 },
                personality: { words: personalityLayer, weight: 0.2 },
                cultural: { words: culturalLayer, weight: 0.15 },
                temporal: { words: temporalLayer, weight: 0.1 }
            };

            const finalPrediction = this._weightedSelection(predictions, bacteria, context);
            
            // Track prediction for learning
            this._trackPrediction(finalPrediction, bacteria, context);
            
            return finalPrediction;
            
        } catch (error) {
            console.error('🔥 Enhanced TabPFN prediction error:', error);
            return this._fallbackPrediction(bacteria, context);
        }
    }

    // Layer 1: Immediate context prediction
    _predictFromImmediate(lastWords, context) {
        if (!lastWords || lastWords.length === 0) {
            return this._getContextWords(context, 5);
        }

        const predictions = [];
        const lastWord = lastWords[lastWords.length - 1];
        
        // Look for common word combinations
        const contextWords = this.contextMatrix[context] || [];
        
        // Simple n-gram like predictions
        if (lastWord) {
            // Words that commonly follow this word
            const followingWords = this._getFollowingWords(lastWord, context);
            predictions.push(...followingWords);
        }
        
        // Add context-appropriate words
        predictions.push(...contextWords.slice(0, 3));
        
        return [...new Set(predictions)].slice(0, 5);
    }

    // Layer 2: Conversation flow prediction
    _predictFromFlow(history, context) {
        if (!history || history.length < 2) {
            return this._getContextWords(context, 3);
        }

        const predictions = [];
        
        // Analyze conversation topics
        const topics = this._extractTopics(history);
        
        // Get words related to current topics
        for (const topic of topics) {
            const relatedWords = this._getTopicWords(topic, context);
            predictions.push(...relatedWords);
        }
        
        // Prevent repetition
        const recentWords = new Set(history.slice(-5));
        const filteredPredictions = predictions.filter(word => !recentWords.has(word));
        
        return filteredPredictions.slice(0, 5);
    }

    // Layer 3: Personality-based prediction
    _predictFromTraits(bacteria, context) {
        const predictions = [];
        const personality = bacteria.personality || {};
        
        // High consciousness → philosophical words
        if (bacteria.consciousness_level > 0.7) {
            predictions.push(...this.contextMatrix.philosophical);
        }
        
        // High sociability → social words
        if (personality.sociability > 0.6) {
            predictions.push(...this.contextMatrix.social);
        }
        
        // High creativity → creative words
        if (personality.creativity > 0.5) {
            predictions.push(...this.contextMatrix.creative);
        }
        
        // High optimism → positive words
        if (personality.optimism > 0.7) {
            predictions.push('mutlu', 'güzel', 'harika', 'muhteşem', 'mükemmel');
        }
        
        // Low energy → survival words
        if (bacteria.energy_level < 0.3) {
            predictions.push(...this.contextMatrix.biological);
        }
        
        return [...new Set(predictions)].slice(0, 4);
    }

    // Layer 4: Cultural context (community learning)
    _predictFromCommunity(bacteria, context) {
        const predictions = [];
        
        // Get trending words in community
        const trendingWords = this._getTrendingCommunityWords(context);
        predictions.push(...trendingWords);
        
        // Get words successful in this context
        if (this.wordTracker) {
            const topWords = this.wordTracker.getTopWords(context, 3);
            predictions.push(...topWords.map(w => w.word));
        }
        
        // Cross-bacteria knowledge sharing
        const sharedKnowledge = this.crossBacteriaKnowledge.get(context) || [];
        predictions.push(...sharedKnowledge.slice(0, 2));
        
        return [...new Set(predictions)].slice(0, 4);
    }

    // Layer 5: Temporal pattern prediction
    _predictFromTime(bacteria, context) {
        const predictions = [];
        const currentHour = new Date().getHours();
        
        // Time-based word patterns
        if (currentHour >= 6 && currentHour <= 12) {
            // Morning words
            predictions.push('günaydın', 'başlangıç', 'enerji', 'taze', 'yeni');
        } else if (currentHour >= 12 && currentHour <= 18) {
            // Afternoon words  
            predictions.push('öğlen', 'aktivite', 'çalışma', 'üretken', 'dinamik');
        } else if (currentHour >= 18 && currentHour <= 22) {
            // Evening words
            predictions.push('akşam', 'dinlenme', 'sohbet', 'rahatlama', 'huzur');
        } else {
            // Night words
            predictions.push('gece', 'uyku', 'rüya', 'sessiz', 'sakin');
        }
        
        // Check temporal patterns from history
        const temporalPattern = this.temporalPatterns.get(`${context}_${currentHour}`) || [];
        predictions.push(...temporalPattern);
        
        return [...new Set(predictions)].slice(0, 3);
    }

    // Weighted selection from all layers
    _weightedSelection(predictions, bacteria, context) {
        const allWords = new Map(); // word -> total weight
        
        // Combine predictions with weights
        for (const [layerName, layerData] of Object.entries(predictions)) {
            const { words, weight } = layerData;
            
            for (const word of words) {
                if (!word) continue;
                
                const currentWeight = allWords.get(word) || 0;
                const successWeight = this.wordTracker ? this.wordTracker.getWeight(word, context) : 1.0;
                
                allWords.set(word, currentWeight + (weight * successWeight));
            }
        }
        
        // Sort by weight and select top candidates
        const sortedWords = Array.from(allWords.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 8)
            .map(([word, weight]) => ({ word, weight, confidence: Math.min(0.9, weight) }));
        
        // Add some randomness to prevent predictability
        if (Math.random() < 0.15) {
            const randomWord = this._getRandomContextWord(context);
            if (randomWord) {
                sortedWords.push({ word: randomWord, weight: 0.3, confidence: 0.4 });
            }
        }
        
        return {
            predictions: sortedWords,
            selectedWord: sortedWords[0]?.word || null,
            confidence: this._calculateOverallConfidence(sortedWords),
            layers: Object.keys(predictions),
            metadata: {
                bacteriaId: bacteria.id,
                context,
                timestamp: Date.now(),
                consciousnessLevel: bacteria.consciousness_level
            }
        };
    }

    // Build enhanced context matrix
    _buildContextMatrix() {
        return {
            biological: [
                'ATP', 'mitokondri', 'ribosom', 'DNA', 'RNA', 'enzim', 'protein', 
                'hücre', 'membran', 'sitoplazma', 'çekirdek', 'metabolizma',
                'sentez', 'katabolizma', 'anabolizma', 'homeostaz'
            ],
            philosophical: [
                'varlık', 'bilinç', 'düşünce', 'anlam', 'hakikat', 'felsefe',
                'varoluş', 'kimlik', 'benlik', 'ruh', 'zihin', 'akıl',
                'bilgi', 'gerçeklik', 'evren', 'sonsuzluk'
            ],
            social: [
                'arkadaş', 'paylaşım', 'iletişim', 'topluluk', 'yardım', 'birlik',
                'dostluk', 'sevgi', 'empati', 'anlayış', 'hoşgörü', 'saygı',
                'işbirliği', 'dayanışma', 'bağlılık'
            ],
            creative: [
                'hayal', 'sanat', 'yaratıcı', 'inovasyon', 'tasarım', 'estetik',
                'ilham', 'özgünlük', 'yaratıcılık', 'keşif', 'buluş', 'yenilik',
                'deneyim', 'deneme', 'farklılık'
            ],
            emotional: [
                'mutlu', 'üzgün', 'heyecanlı', 'sakin', 'öfkeli', 'meraklı',
                'endişeli', 'umutlu', 'korkmuş', 'gururlu', 'memnun', 'şaşkın',
                'coşkulu', 'melankolik', 'nostaljik'
            ],
            absurd: [
                'uçan patates', 'dans eden mikroskop', 'şarkı söyleyen termometre',
                'ağlayan bilgisayar', 'koşan masa', 'düşünen taş', 'konuşan renk',
                'yüzen matematik', 'rüya gören robot', 'felsefe yapan kedi'
            ]
        };
    }

    // Helper methods
    _getContextWords(context, limit = 5) {
        const contextWords = this.contextMatrix[context] || this.contextMatrix.biological;
        return contextWords.slice(0, limit);
    }

    _getFollowingWords(word, context) {
        // Simple implementation - could be enhanced with n-gram data
        const following = {
            'ATP': ['üretimi', 'sentezi', 'enerjisi'],
            'bilinç': ['seviyesi', 'gelişimi', 'farkındalığı'],
            'arkadaş': ['olmak', 'edinmek', 'sevgisi'],
            'hayal': ['kurmak', 'gücü', 'aleminde']
        };
        
        return following[word] || [];
    }

    _extractTopics(history) {
        // Simple topic extraction based on word frequency
        const wordCounts = {};
        const contextWords = Object.values(this.contextMatrix).flat();
        
        for (const message of history) {
            const words = message.split(' ');
            for (const word of words) {
                if (contextWords.includes(word)) {
                    wordCounts[word] = (wordCounts[word] || 0) + 1;
                }
            }
        }
        
        return Object.keys(wordCounts)
            .sort((a, b) => wordCounts[b] - wordCounts[a])
            .slice(0, 3);
    }

    _getTopicWords(topic, context) {
        // Return words related to the topic within context
        for (const [ctxName, words] of Object.entries(this.contextMatrix)) {
            if (words.includes(topic)) {
                return words.slice(0, 3);
            }
        }
        return [];
    }

    _getTrendingCommunityWords(context) {
        // Get community trending words
        const trending = this.culturalMemory.get(`trending_${context}`) || [];
        return trending.slice(0, 3);
    }

    _getRandomContextWord(context) {
        const words = this.contextMatrix[context] || this.contextMatrix.biological;
        return words[Math.floor(Math.random() * words.length)];
    }

    _calculateOverallConfidence(predictions) {
        if (predictions.length === 0) return 0.2;
        
        const avgConfidence = predictions.reduce((sum, p) => sum + p.confidence, 0) / predictions.length;
        return Math.min(0.95, avgConfidence + (predictions.length * 0.05));
    }

    _trackPrediction(prediction, bacteria, context) {
        this.predictionHistory.push({
            timestamp: Date.now(),
            bacteriaId: bacteria.id,
            context,
            prediction: prediction.selectedWord,
            confidence: prediction.confidence
        });
        
        // Keep only last 100 predictions
        if (this.predictionHistory.length > 100) {
            this.predictionHistory = this.predictionHistory.slice(-100);
        }
    }

    _fallbackPrediction(bacteria, context) {
        const words = this._getContextWords(context, 3);
        return {
            predictions: words.map(word => ({ word, weight: 0.5, confidence: 0.4 })),
            selectedWord: words[0] || 'kelime',
            confidence: 0.4,
            layers: ['fallback'],
            metadata: { fallback: true }
        };
    }

    async _initializePredictionLayers() {
        // Initialize cultural memory
        this.culturalMemory.set('trending_biological', ['ATP', 'enerji', 'büyüme']);
        this.culturalMemory.set('trending_social', ['arkadaş', 'paylaşım', 'sevgi']);
        this.culturalMemory.set('trending_philosophical', ['bilinç', 'anlam', 'varlık']);
        
        console.log('📊 Prediction layers initialized');
    }

    // Cross-bacteria learning
    shareKnowledge(fromBacteriaId, toBacteriaId, context, successfulWords) {
        const key = `knowledge_${context}`;
        const knowledge = this.crossBacteriaKnowledge.get(key) || [];
        
        for (const word of successfulWords) {
            if (!knowledge.includes(word)) {
                knowledge.push(word);
            }
        }
        
        // Keep only top 20 words per context
        this.crossBacteriaKnowledge.set(key, knowledge.slice(0, 20));
        
        console.log(`🔄 Knowledge shared: ${fromBacteriaId} → ${toBacteriaId} (${context}): ${successfulWords.join(', ')}`);
    }

    // Get system status
    getStatus() {
        return {
            isReady: this.isReady,
            accuracyScore: this.accuracyScore,
            predictionCount: this.predictionHistory.length,
            contexts: Object.keys(this.contextMatrix),
            sharedKnowledge: this.crossBacteriaKnowledge.size,
            culturalMemory: this.culturalMemory.size
        };
    }
} 