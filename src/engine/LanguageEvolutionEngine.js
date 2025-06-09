/**
 * 🧬 mnBac v9.5.0 - Ultra-Aggressive Anti-Monotony Language Evolution Engine
 * Production-Ready Maximum Diversity System
 * Date: December 19, 2024
 */

// Language Evolution Engine - Enterprise v4.0 - Modular & Memory-Efficient
import { tabPFNAdapter } from './TabPFNAdapter.js';
import { wordSuccessTracker } from './WordSuccessTracker.js';
import { turkceDialogueGenerator } from './TurkceDialogueGenerator.js';
import { EnhancedTabPFN } from './EnhancedTabPFN.js';
import { tabPFGenAdapter } from './TabPFGenAdapter.js';
import { tabpfnFineTuner } from './TabPFNFineTuner.js';
import { topKSample, calculateNoveltyScore, calculateContextDrift, adjustStyleByMood } from '../utils/sampling.js';
import { RUNTIME_CONFIG } from '../config/SystemConfig.js';
import { bufferManager, WordTrackingBuffer, ContextHistoryBuffer } from '../utils/RingBuffer.js';

export class LanguageEvolutionEngine {
    constructor() {
        this.personalityMap = new Map(); // bacteriaId -> languageStyle
        this.bacteriaBigrams = new Map(); // bacteriaId -> bigram chains
        this.semanticFields = {};
        this.contextOverrides = new Map();
        this.initialized = false;
        this.mutationPatterns = this._initMutationPatterns();
        
        // 🧠 Enhanced AI Systems
        this.enhancedTabPFN = new EnhancedTabPFN(wordSuccessTracker);
        this.conversationHistory = new Map(); // bacteriaId -> conversation history

        // External adapters
        this.tabPFGen = tabPFGenAdapter;
        this.tabpfnFineTuner = tabpfnFineTuner;
        this.tabpfnFineTuner.tabpfn = tabPFNAdapter;
        this.tabpfnFineTuner.wordTracker = wordSuccessTracker;
        
        // 🎭 NEW: Advanced Diversity & Anti-Monotony Systems (Memory-Efficient)
        this.wordUsageCount = new Map(); // Global word usage tracking
        this.lastContextChange = new Map(); // bacteriaId -> timestamp
        this.antiMonotonyActive = true; // Master switch for anti-monotony features
        
        // 🎯 Context Management (Config-driven)
        this.availableContexts = ['biological', 'emotional', 'social', 'creative', 'philosophical', 'absurd'];
        this.contextDriftProbability = RUNTIME_CONFIG.LANGUAGE_EVOLUTION.CONTEXT_DRIFT_PROBABILITY;
        
        // 📊 Performance tracking
        this.diversityMetrics = {
            totalGenerations: 0,
            uniqueWordsUsed: new Set(),
            contextChanges: 0,
            antiMonotonyTriggers: 0,
            samplingUsage: 0
        };
    }

    async init() {
        try {
            console.log('🧠 LanguageEvolutionEngine başlatılıyor...');
            
            // Semantic fields yükle
            await this.loadSemanticFields();
            
            // TabPFN adapter'ı başlat
            await tabPFNAdapter.init();
            
            // 🚀 Enhanced TabPFN'i başlat
            await this.enhancedTabPFN.init();

            // Synthetic data generator
            await this.tabPFGen.init();
            
            this.initialized = true;
            if (RUNTIME_CONFIG.DEV.ENABLE_DETAILED_LOGGING) {
                console.log('✅ LanguageEvolutionEngine hazır! (Enhanced AI aktiv)');
            }
            
        } catch (error) {
            console.error('❌ LanguageEvolutionEngine başlatılamadı:', error);
            throw error;
        }
    }

    // Semantic fields dosyasını yükle
    async loadSemanticFields() {
        try {
            const response = await fetch('src/data/semantic_fields.json');
            this.semanticFields = await response.json();
            if (RUNTIME_CONFIG.DEV.ENABLE_DETAILED_LOGGING) {
                console.log('🎯 Semantic fields yüklendi:', Object.keys(this.semanticFields));
            }
        } catch (error) {
            console.warn('⚠️ Semantic fields yüklenemedi, default kullanılıyor:', error);
            this._loadDefaultSemanticFields();
        }
    }

    // Default semantic fields - EXPANDED for diversity
    _loadDefaultSemanticFields() {
        this.semanticFields = {
            biological: [
                // Core biology
                'dna', 'protein', 'hücre', 'enerji', 'yaşam', 'mitokondri', 'nükleus',
                // Body parts  
                'beyin', 'sinir', 'damar', 'kemik', 'kas', 'deri', 'göz', 'kulak',
                // Nature
                'ağaç', 'yaprak', 'çiçek', 'kök', 'dal', 'meyve', 'tohum', 'orman',
                // Elements
                'su', 'hava', 'toprak', 'ateş', 'güneş', 'ay', 'yıldız', 'bulut'
            ],
            emotional: [
                // Basic emotions
                'mutlu', 'üzgün', 'heyecan', 'korku', 'sevgi', 'nefret', 'öfke', 'kıskançlık',
                // Complex emotions  
                'nostalji', 'umut', 'hayal kırıklığı', 'gurur', 'utanç', 'pişmanlık',
                // Feelings
                'huzur', 'gerginlik', 'coşku', 'melankoli', 'özlem', 'şefkat', 'merhamet'
            ],
            social: [
                // Relationships
                'arkadaş', 'aile', 'sevgili', 'komşu', 'öğretmen', 'yabancı',
                // Activities
                'paylaşım', 'topluluk', 'yardım', 'birlik', 'konuşma', 'dans', 'oyun',
                // Concepts
                'güven', 'sadakat', 'ihanet', 'dostluk', 'rekabet', 'işbirliği'
            ],
            creative: [
                // Arts
                'müzik', 'resim', 'şiir', 'dans', 'tiyatro', 'sinema', 'heykel',
                // Colors
                'kırmızı', 'mavi', 'sarı', 'yeşil', 'mor', 'turuncu', 'pembe',
                // Imagination  
                'hayal', 'rüya', 'masal', 'fantezi', 'sihir', 'büyü', 'mucize'
            ],
            philosophical: [
                // Concepts
                'gerçek', 'yalan', 'adalet', 'özgürlük', 'kader', 'tesadüf',
                // Existence
                'varoluş', 'yokluk', 'sonsuzluk', 'zaman', 'mekan', 'anlam',
                // Wisdom
                'bilgi', 'bilgelik', 'cehalet', 'deneyim', 'öğrenme', 'keşif'
            ],
            absurd: [
                // Surreal combinations
                'uçan patates', 'dans eden mikroskop', 'ağlayan bilgisayar',
                'konuşan çay bardağı', 'yürüyen sandalye', 'şarkı söyleyen kitap',
                'koşan kalem', 'gülümseyen kapı', 'düşünen lamba', 'saklanan ayna'
            ],
            neutral: [
                'selam', 'evet', 'hayır', 'belki', 'tamam', 'peki', 'tabii', 'nasıl',
                'ne zaman', 'nerede', 'kim', 'ne', 'neden', 'şey', 'durum', 'hal'
            ],
            temporal: [
                'şimdi', 'sonra', 'önce', 'daima', 'hiçbir zaman', 'bazen', 'sık sık',
                'yavaşça', 'hızlıca', 'aniden', 'yavaş yavaş', 'derhal', 'yakında'
            ],
            spatial: [
                'yukarı', 'aşağı', 'sağ', 'sol', 'ileri', 'geri', 'içeri', 'dışarı',
                'yanında', 'karşısında', 'arkasında', 'önünde', 'üstünde', 'altında'
            ]
        };
    }

    // Bakteri için dil stilini başlat - Enhanced v3.0
    initializeLanguageStyle(bacteria) {
        if (this.personalityMap.has(bacteria.id)) return;

        const mood = bacteria.mood || 0.5;
        
        let style = {
            // Temel parametreler
            markovChainUsage: 0.3 + (bacteria.consciousness_level * 0.4),
            tabPFNUsage: 0.2 + (bacteria.consciousness_level * 0.6),
            absurdTolerance: bacteria.personality.creativity || 0.2,
            patternBreaking: bacteria.personality.adventurousness || 0.15,
            
            // Kişilik temelli
            emotionLevel: bacteria.personality.optimism || 0.5,
            socialLevel: bacteria.personality.sociability || 0.5,
            creativity: bacteria.personality.creativity || 0.3,
            
            // 🎭 NEW: Enhanced Sampling Parameters
            samplingTemp: 1.5, // Softmax temperature for diversity
            topK: 5, // Number of top candidates to consider
            noveltyWeight: 1.0, // How much to weight novelty vs. coherence
            
            // Dil özellikleri
            wordOrder: Math.random() < 0.2 ? 'inverted' : 'normal',
            combinationStyle: this._selectCombinationStyle(bacteria),
            phrasePatterns: new Map(),
            
            // Adaptasyon parametreleri
            learningRate: 0.05,
            adaptationSpeed: 0.1,
            
            // Performance tracking
            successCount: 0,
            totalAttempts: 0,
            lastUpdate: Date.now()
        };

        // 🎯 Apply mood-based adjustments
        style = adjustStyleByMood(mood, style);

        this.personalityMap.set(bacteria.id, style);
        this._initializeBigrams(bacteria);
        
        // 🎭 Initialize bacteria-specific tracking (Ring Buffers)
        const maxRecentWords = RUNTIME_CONFIG.LANGUAGE_EVOLUTION.MAX_RECENT_WORDS;
        const maxContextHistory = RUNTIME_CONFIG.LANGUAGE_EVOLUTION.MAX_CONTEXT_HISTORY;
        
        bufferManager.create(`recent_words_${bacteria.id}`, 'word', maxRecentWords);
        bufferManager.create(`context_history_${bacteria.id}`, 'context', maxContextHistory);
        
        // Initialize context history with current context
        const contextBuffer = bufferManager.get(`context_history_${bacteria.id}`);
        contextBuffer.push(bacteria.currentContext || 'biological');
        
        this.lastContextChange.set(bacteria.id, Date.now());
        
        console.log(`🎭 ${bacteria.name} Enhanced Language Style v3.0 başlatıldı:`, {
            markov: style.markovChainUsage.toFixed(2),
            tabPFN: style.tabPFNUsage.toFixed(2),
            absurd: style.absurdTolerance.toFixed(2),
            samplingTemp: style.samplingTemp.toFixed(2),
            topK: style.topK
        });
    }

    // Kombinasyon stilini seç
    _selectCombinationStyle(bacteria) {
        const styles = ['prefix', 'suffix', 'blend', 'compound', 'mutation'];
        const weights = [
            bacteria.personality.traditionalism || 0.2,
            bacteria.personality.creativity || 0.2,
            bacteria.personality.adventurousness || 0.2,
            bacteria.personality.sociability || 0.2,
            bacteria.consciousness_level || 0.2
        ];
        
        return this._weightedChoice(styles, weights);
    }

    // Bigram zincirlerini başlat
    _initializeBigrams(bacteria) {
        if (!this.bacteriaBigrams.has(bacteria.id)) {
            this.bacteriaBigrams.set(bacteria.id, new Map());
        }
    }

    // Ana yaratıcı ifade üretme metodu - Enhanced v3.0
    async generateCreativeExpression(bacteria, context) {
        this.diversityMetrics.totalGenerations++;
        
        const style = this.personalityMap.get(bacteria.id);
        if (!style) {
            this.initializeLanguageStyle(bacteria);
            return this.generateCreativeExpression(bacteria, context);
        }

        // 🎯 Smart Context Drift - dinamik bağlam değişimi (Ring Buffer)
        const recentWordsBuffer = bufferManager.get(`recent_words_${bacteria.id}`);
        const recentWords = recentWordsBuffer ? recentWordsBuffer.toArray() : [];
        
        const originalContext = context;
        context = calculateContextDrift(context, this.availableContexts, recentWords, this.contextDriftProbability);
        
        if (context !== originalContext) {
            console.log(`🔄 ${bacteria.name} context drift: ${originalContext} → ${context}`);
            this.diversityMetrics.contextChanges++;
            
            // Update context history (Ring Buffer)
            const contextBuffer = bufferManager.get(`context_history_${bacteria.id}`);
            if (contextBuffer) {
                contextBuffer.push(context);
            }
            this.lastContextChange.set(bacteria.id, Date.now());
        }

        // 🎭 Apply mood-based style adjustments (dynamic)
        const mood = bacteria.mood || 0.5;
        const adjustedStyle = adjustStyleByMood(mood, style);

        const vocab = Array.from(bacteria.vocabulary);
        let words = [];

        // 1. Çekirdek kelime seçimi (adjusted style ile)
        let coreWord = await this._selectCoreWord(bacteria, context, adjustedStyle);
        if (coreWord) {
            words.push(coreWord);
        }

        // 2. Markov zinciri akışı
        if (style.markovChainUsage > 0 && Math.random() < style.markovChainUsage) {
            const markovWords = this._generateMarkovSequence(bacteria, coreWord, 1 + Math.floor(Math.random() * 2));
            words.push(...markovWords);
        }

        // 3. Absurd eleman enjeksiyonu
        if (Math.random() < style.absurdTolerance * style.patternBreaking) {
            const absurdWord = this._getAbsurdWord();
            if (absurdWord) {
                const pos = Math.floor(Math.random() * (words.length + 1));
                words.splice(pos, 0, absurdWord);
                console.log(`🌀 ${bacteria.name} absurd kelime ekledi: ${absurdWord}`);
            }
        }

        // 4. Kişisel kalıp ekleme
        if (style.phrasePatterns.has(context) && Math.random() < 0.3) {
            const patternWords = this._applyPersonalPattern(bacteria, context, style);
            words.push(...patternWords);
        }

        // 5. Kelime mutasyonu
        words = words.map(word => Math.random() < 0.1 ? this.mutateWord(bacteria, word) : word);

        // 6. Sıralama ve son işlemler
        if (style.wordOrder === 'inverted' && words.length > 1) {
            words.reverse();
        }

        // Emotion injection
        if (style.emotionLevel > 0.7 && Math.random() < style.emotionLevel) {
            const emotionalWord = this._getEmotionalWord(bacteria);
            if (emotionalWord) {
                words.push(emotionalWord);
            }
        }

        // Final assembly
        let response = words.filter(w => w && w.trim()).join(' ').trim();
        
        // 🆕 Türkçe Diyalog Sistemi ile zenginleştirme
        if (response.length < 10 && Math.random() < 0.4) {
            try {
                const turkishEnhanced = turkceDialogueGenerator.generateSentence(bacteria, context);
                if (turkishEnhanced && turkishEnhanced.split(' ').length > 2) {
                    // Bazen mevcut response ile birleştir, bazen tamamen değiştir
                    if (response && Math.random() < 0.5) {
                        response = `${response}... ${turkishEnhanced}`;
                    } else {
                        response = turkishEnhanced;
                    }
                    console.log(`🇹🇷 ${bacteria.name} Türkçe sentez kullandı: ${response}`);
                }
            } catch (error) {
                console.warn('⚠️ Türkçe sentez hatası:', error);
            }
        }
        
        // Uzunluk kontrolü
        if (response.split(' ').length > 8) {
            response = response.split(' ').slice(0, 8).join(' ') + '...';
        }

        // Son rötuş
        response = this._applyFinalPolish(response, style);

        return response || this._getFallbackResponse(bacteria);
    }

    // Çekirdek kelime seçimi - Enhanced Multi-Layer AI
    async _selectCoreWord(bacteria, context, style) {
        // 🧠 Öncelik 1: Enhanced TabPFN Multi-Layer Prediction
        if (Math.random() < style.tabPFNUsage && this.enhancedTabPFN.isReady) {
            try {
                const conversationHistory = this.conversationHistory.get(bacteria.id) || [];
                const enhancedPrediction = await this.enhancedTabPFN.generateNextWord(bacteria, context, conversationHistory);
                
                if (enhancedPrediction && enhancedPrediction.selectedWord) {
                    console.log(`🧠 ${bacteria.name} Enhanced TabPFN kullandı: ${enhancedPrediction.selectedWord} (confidence: ${enhancedPrediction.confidence.toFixed(2)})`);
                    
                    // Update conversation history
                    const history = this.conversationHistory.get(bacteria.id) || [];
                    history.push(enhancedPrediction.selectedWord);
                    if (history.length > 10) history.shift(); // Keep last 10 words
                    this.conversationHistory.set(bacteria.id, history);
                    
                    return enhancedPrediction.selectedWord;
                }
            } catch (error) {
                console.warn(`⚠️ Enhanced TabPFN hatası, fallback kullanılıyor:`, error);
            }
        }

        // 🎭 NEW: Smart Top-K + Softmax Sampling with Anti-Monotony
        if (this.antiMonotonyActive && Math.random() < 0.7) { // 70% chance to use enhanced sampling
            return await this._selectWordWithDiversity(bacteria, context, style);
        }

        // Öncelik 2: Original TabPFN önerisi  
        if (Math.random() < style.tabPFNUsage * 0.5) {
            const suggestions = await tabPFNAdapter.analyzeVocabulary(bacteria);
            if (suggestions && suggestions.suggested_next_words?.length > 0) {
                return suggestions.suggested_next_words[0];
            }
        }

        // Öncelik 3: Semantic field
        const semanticWord = this.getSemanticWord(context);
        if (semanticWord && !bacteria.vocabulary.has(semanticWord)) {
            return semanticWord;
        }

        // Öncelik 4: Weighted success-based
        const vocab = Array.from(bacteria.vocabulary);
        const weightedWord = wordSuccessTracker.getWeightedRandomWord(context, vocab);
        if (weightedWord) {
            return weightedWord;
        }

        // Fallback: Rastgele
        return vocab[Math.floor(Math.random() * vocab.length)];
    }

    // 🎭 NEW: Enhanced Word Selection with Top-K + Softmax + Novelty
    async _selectWordWithDiversity(bacteria, context, style) {
        this.diversityMetrics.samplingUsage++;
        
        // Collect all possible words
        const vocab = Array.from(bacteria.vocabulary);
        const semanticWords = this.semanticFields[context] || [];
        const allCandidates = [...new Set([...vocab, ...semanticWords])]; // Remove duplicates
        
        if (allCandidates.length === 0) return 'hmm';
        
        // Get recent words for this bacteria (Ring Buffer)
        const recentWordsBuffer = bufferManager.get(`recent_words_${bacteria.id}`);
        const recentWords = recentWordsBuffer ? recentWordsBuffer.toArray() : [];
        
        // Calculate scores for each candidate
        const scoredCandidates = allCandidates.map(word => {
            const baseScore = this._scoreWord(word, bacteria, context);
            const noveltyScore = calculateNoveltyScore(word, recentWords, this.wordUsageCount);
            const totalScore = baseScore + (noveltyScore * style.noveltyWeight);
            
            return {
                word,
                score: totalScore,
                baseScore,
                noveltyScore
            };
        });
        
        // Use Top-K + Softmax sampling (Config-driven)
        const words = scoredCandidates.map(item => item.word);
        const scores = scoredCandidates.map(item => item.score);
        
        const topK = style.topK || RUNTIME_CONFIG.LANGUAGE_EVOLUTION.DEFAULT_TOP_K;
        const samplingTemp = style.samplingTemp || RUNTIME_CONFIG.LANGUAGE_EVOLUTION.DEFAULT_SAMPLING_TEMP;
        
        const selectedWord = topKSample(words, scores, topK, samplingTemp);
        
        if (selectedWord) {
            // Track word usage
            this._trackWordUsage(bacteria.id, selectedWord);
            
            // Log diversity info
            const selectedCandidate = scoredCandidates.find(c => c.word === selectedWord);
            if (selectedCandidate && selectedCandidate.noveltyScore !== 0) {
                console.log(`🎭 ${bacteria.name} diversity boost: "${selectedWord}" (novelty: ${selectedCandidate.noveltyScore.toFixed(2)})`);
                this.diversityMetrics.antiMonotonyTriggers++;
            }
            
            return selectedWord;
        }
        
        // Fallback
        return allCandidates[Math.floor(Math.random() * allCandidates.length)];
    }

    // 🎯 Enhanced Word Scoring with multiple factors (Config-driven)
    _scoreWord(word, bacteria, context) {
        const config = RUNTIME_CONFIG.LANGUAGE_EVOLUTION;
        let score = 1.0;
        
        // Semantic relevance
        if (this.semanticFields[context]?.includes(word)) {
            score += config.SEMANTIC_RELEVANCE_WEIGHT;
        }
        
        // Vocabulary ownership bonus
        if (bacteria.vocabulary.has(word)) {
            score += config.VOCABULARY_OWNERSHIP_WEIGHT;
        }
        
        // Success tracking bonus
        const successRate = wordSuccessTracker.getWordSuccessRate(word, context);
        score += successRate * config.SUCCESS_RATE_WEIGHT;
        
        // Consciousness-based bonus for complex words
        if (word.length > 6 && bacteria.consciousness_level > 0.5) {
            score += config.CONSCIOUSNESS_BONUS_WEIGHT;
        }
        
        return score;
    }

    // 🎭 Track word usage for anti-monotony (Ring Buffer)
    _trackWordUsage(bacteriaId, word) {
        // Update global usage count
        this.wordUsageCount.set(word, (this.wordUsageCount.get(word) || 0) + 1);
        
        // Update bacteria's recent words (Ring Buffer)
        const recentWordsBuffer = bufferManager.get(`recent_words_${bacteriaId}`);
        if (recentWordsBuffer) {
            recentWordsBuffer.push(word);
        }
        
        // Update global diversity metrics
        this.diversityMetrics.uniqueWordsUsed.add(word);
    }

    // Markov sequence üretimi
    _generateMarkovSequence(bacteria, startWord, length) {
        const bigrams = this.bacteriaBigrams.get(bacteria.id);
        if (!bigrams || !startWord) return [];

        const sequence = [];
        let current = startWord;

        for (let i = 0; i < length; i++) {
            const nextOptions = bigrams.get(current);
            if (!nextOptions || nextOptions.length === 0) break;

            const next = nextOptions[Math.floor(Math.random() * nextOptions.length)];
            if (next && !sequence.includes(next)) {
                sequence.push(next);
                current = next;
            }
        }

        return sequence;
    }

    // Semantic field'dan kelime al
    getSemanticWord(fieldName) {
        const pool = this.semanticFields[fieldName] || [];
        if (!pool.length) return null;
        return pool[Math.floor(Math.random() * pool.length)];
    }

    // Absurd kelime al
    _getAbsurdWord() {
        const absurdPool = this.semanticFields.absurd || [];
        return absurdPool[Math.floor(Math.random() * absurdPool.length)];
    }

    // Duygusal kelime al
    _getEmotionalWord(bacteria) {
        const emotionalPool = this.semanticFields.emotional || [];
        // Bakteri mood'una göre filtrele
        if (bacteria.mood > 0.6) {
            const positiveWords = ['mutlu', 'heyecan', 'sevgi', 'neşe', 'coşku'];
            const available = positiveWords.filter(w => emotionalPool.includes(w));
            return available[Math.floor(Math.random() * available.length)];
        }
        return emotionalPool[Math.floor(Math.random() * emotionalPool.length)];
    }

    // Kelime mutasyonu
    mutateWord(bacteria, word) {
        if (!word || word.length < 3) return word;
        
        const mutations = this.mutationPatterns;
        const mutationType = Math.floor(Math.random() * mutations.length);
        
        try {
            return mutations[mutationType](word, bacteria);
        } catch (error) {
            return word; // Hata durumunda orijinal kelimeyi döndür
        }
    }

    // Mutasyon kalıplarını başlat
    _initMutationPatterns() {
        return [
            // Suffix addition
            (word, bacteria) => word + ['ish', 'ism', 'ing', 'er'][Math.floor(Math.random() * 4)],
            
            // Prefix addition
            (word, bacteria) => ['neo', 'meta', 'proto', 'ultra'][Math.floor(Math.random() * 4)] + word,
            
            // Vowel shift
            (word, bacteria) => word.replace(/[aeiou]/g, match => 
                ['a', 'e', 'i', 'o', 'u'][Math.floor(Math.random() * 5)]
            ),
            
            // Character doubling
            (word, bacteria) => {
                const pos = Math.floor(Math.random() * word.length);
                return word.slice(0, pos) + word[pos] + word.slice(pos);
            },
            
            // Reverse section
            (word, bacteria) => {
                if (word.length < 4) return word;
                const mid = Math.floor(word.length / 2);
                return word.slice(0, mid) + word.slice(mid).split('').reverse().join('');
            }
        ];
    }

    // Son rötuş uygula
    _applyFinalPolish(response, style) {
        if (!response) return response;

        // Pattern breaking effects
        if (Math.random() < style.patternBreaking * 0.2) {
            // Random capitalization
            response = response.replace(/./g, c => 
                Math.random() < 0.15 ? c.toUpperCase() : c.toLowerCase()
            );
            
            // Emotion punctuation
            const endings = ['!!', '!?', '...', ' 🤔', ' 😜', ' 🌟'];
            response += endings[Math.floor(Math.random() * endings.length)];
        }

        return response;
    }

    // Fallback cevap
    _getFallbackResponse(bacteria) {
        const fallbacks = [
            'hmmm...', 'düşünüyorum', 'ilginç', 'anlıyorum', 
            'evet belki', 'söyle bakalım', 'ne dersin'
        ];
        return fallbacks[Math.floor(Math.random() * fallbacks.length)];
    }

    // Dil stilini adapt et - Enhanced with Cross-Bacteria Learning
    adaptLanguageStyle(bacteria, wasSuccessful, context, responseWords = []) {
        const style = this.personalityMap.get(bacteria.id);
        if (!style) return;

        style.totalAttempts += 1;
        if (wasSuccessful) {
            style.successCount += 1;
        }

        const successRate = style.successCount / style.totalAttempts;
        const adaptRate = style.adaptationSpeed;

        // Successful patterns -> increase usage
        if (wasSuccessful) {
            style.markovChainUsage = Math.min(1, style.markovChainUsage + adaptRate * 0.5);
            style.absurdTolerance = Math.min(1, style.absurdTolerance + adaptRate * 0.3);
            style.patternBreaking = Math.min(1, style.patternBreaking + adaptRate * 0.2);
            
            // 🔄 Cross-bacteria knowledge sharing - başarılı kelimeler paylaşılıyor
            if (responseWords.length > 0 && this.enhancedTabPFN.isReady) {
                this._shareKnowledgeWithNearbyBacteria(bacteria, context, responseWords);
            }
        } else {
            // Failed patterns -> decrease usage
            style.markovChainUsage = Math.max(0, style.markovChainUsage - adaptRate * 0.3);
            style.absurdTolerance = Math.max(0, style.absurdTolerance - adaptRate * 0.2);
            style.patternBreaking = Math.max(0, style.patternBreaking - adaptRate * 0.1);
        }

        // TabPFN usage adaptation
        if (successRate > 0.7) {
            style.tabPFNUsage = Math.min(1, style.tabPFNUsage + adaptRate);
        } else if (successRate < 0.3) {
            style.tabPFNUsage = Math.max(0.1, style.tabPFNUsage - adaptRate);
        }

        style.lastUpdate = Date.now();
        
        console.log(`🎯 ${bacteria.name} stil adapte edildi - başarı: ${(successRate * 100).toFixed(1)}%`);
    }

    // 🔄 Cross-Bacteria Knowledge Sharing
    _shareKnowledgeWithNearbyBacteria(sourceBacteria, context, successfulWords) {
        // Sadece başarılı kelimeleri paylaş
        if (!successfulWords || successfulWords.length === 0) return;
        
        // Sosyal bakteriler daha fazla paylaşır
        const sociability = sourceBacteria.personality?.sociability || 0.5;
        if (Math.random() > sociability) return;
        
        // Simulated "nearby" bacteria - gerçek uygulamada position-based olabilir
        const nearbyBacteriaIds = this._findNearbyBacteria(sourceBacteria);
        
        for (const targetId of nearbyBacteriaIds) {
            if (targetId !== sourceBacteria.id) {
                this.enhancedTabPFN.shareKnowledge(
                    sourceBacteria.id, 
                    targetId, 
                    context, 
                    successfulWords.slice(0, 2) // Max 2 kelime paylaş
                );
            }
        }
    }

    // Find nearby bacteria for knowledge sharing
    _findNearbyBacteria(bacteria) {
        // Basit implementation - gerçek simülasyonda position-based olabilir
        const allBacteriaIds = Array.from(this.personalityMap.keys());
        const nearbyCount = Math.min(3, allBacteriaIds.length - 1);
        
        return allBacteriaIds
            .filter(id => id !== bacteria.id)
            .sort(() => Math.random() - 0.5)
            .slice(0, nearbyCount);
    }

    // Bigram güncelle
    updateBigrams(bacteria, words) {
        const bigrams = this.bacteriaBigrams.get(bacteria.id);
        if (!bigrams) return;

        for (let i = 0; i < words.length - 1; i++) {
            const current = words[i];
            const next = words[i + 1];
            
            if (!bigrams.has(current)) {
                bigrams.set(current, []);
            }
            
            bigrams.get(current).push(next);
            
            // Max 10 bigram per word
            if (bigrams.get(current).length > 10) {
                bigrams.get(current).shift();
            }
        }
    }

    // Ağırlıklı seçim utility
    _weightedChoice(choices, weights) {
        const totalWeight = weights.reduce((sum, w) => sum + w, 0);
        if (totalWeight === 0) return choices[0];
        
        let random = Math.random() * totalWeight;
        for (let i = 0; i < choices.length; i++) {
            random -= weights[i];
            if (random <= 0) return choices[i];
        }
        return choices[choices.length - 1];
    }

    // Kişisel pattern uygula
    _applyPersonalPattern(bacteria, context, style) {
        const patterns = style.phrasePatterns.get(context);
        if (!patterns || patterns.length === 0) return [];

        const pattern = patterns[Math.floor(Math.random() * patterns.length)];
        return pattern.split(' ').slice(0, 2).map(w => this.mutateWord(bacteria, w));
    }

    // 🎯 Main API: Generate Contextual Response (Called by UI)
    async generateContextualResponse(bacteria, context, trigger = null) {
        if (RUNTIME_CONFIG.DEV.ENABLE_DETAILED_LOGGING) {
            console.log(`🎯 LanguageEvolutionEngine.generateContextualResponse called for ${bacteria.name}`);
        }
        
        if (!this.initialized) {
            await this.init();
        }
        
        // Use our enhanced creative expression system
        const response = await this.generateCreativeExpression(bacteria, context);
        
        // Track this generation for learning
        const words = response.split(' ').filter(w => w && w.length > 2);
        this.adaptLanguageStyle(bacteria, true, context, words);
        
        if (RUNTIME_CONFIG.DEV.ENABLE_DETAILED_LOGGING) {
            console.log(`🎭 Generated: "${response}" (Context: ${context})`);
        }
        return response;
    }

    // 🗣️ NEW: Run Peer Dialogue - Enhanced Cross-Bacteria Communication
    async runPeerDialogue(bacteria1, bacteria2) {
        if (!bacteria1 || !bacteria2) return null;
        
        console.log(`🗣️ Cross-bacteria dialogue: ${bacteria1.name} ↔ ${bacteria2.name}`);
        
        // Generate responses from both bacteria
        const context1 = bacteria1.currentContext || 'social';
        const context2 = bacteria2.currentContext || 'social';
        
        const response1 = await this.generateCreativeExpression(bacteria1, context1);
        const response2 = await this.generateCreativeExpression(bacteria2, context2);
        
        // Cross-learning: each bacteria learns from the other's words
        this._learnFromPeer(bacteria2, response1.split(' '));
        this._learnFromPeer(bacteria1, response2.split(' '));
        
        // Update conversation histories
        this._updateCrossConversationHistory(bacteria1.id, response1);
        this._updateCrossConversationHistory(bacteria2.id, response2);
        
        return {
            dialogue: [
                { bacteria: bacteria1.name, message: response1 },
                { bacteria: bacteria2.name, message: response2 }
            ],
            crossLearning: true,
            timestamp: Date.now()
        };
    }

    // 🧠 Enhanced peer learning with word significance
    _learnFromPeer(learnerBacteria, peerWords) {
        if (!peerWords || peerWords.length === 0) return;
        
        peerWords.forEach(word => {
            if (word && word.length > 2) {
                // Add to vocabulary if not present
                if (!learnerBacteria.vocabulary.has(word)) {
                    learnerBacteria.vocabulary.add(word);
                    console.log(`🔗 ${learnerBacteria.name} learned "${word}" from peer`);
                }
                
                // Track word as successful (peer usage implies value)
                wordSuccessTracker.trackSuccess(word, 'social', true);
                
                // Update bigrams for peer-learned words
                this.updateBigrams(learnerBacteria, [word]);
            }
        });
    }

    // 📚 Update cross-conversation history
    _updateCrossConversationHistory(bacteriaId, message) {
        const history = this.conversationHistory.get(bacteriaId) || [];
        const words = message.split(' ').filter(w => w && w.length > 2);
        
        history.push(...words);
        if (history.length > 20) {
            history.splice(0, history.length - 20); // Keep last 20 words
        }
        
        this.conversationHistory.set(bacteriaId, history);
    }

    // 🎭 Get Diversity Statistics
    getDiversityStats() {
        const stats = {
            ...this.diversityMetrics,
            uniqueWordsCount: this.diversityMetrics.uniqueWordsUsed.size,
            totalWordUsage: this.wordUsageCount.size,
            activeBacteria: this.recentWordsByBacteria.size,
            averageRecentWords: 0,
            contextDistribution: {},
            antiMonotonyEffectiveness: 0
        };
        
        // Calculate average recent words per bacteria
        if (this.recentWordsByBacteria.size > 0) {
            const totalRecentWords = Array.from(this.recentWordsByBacteria.values())
                .reduce((sum, words) => sum + words.length, 0);
            stats.averageRecentWords = totalRecentWords / this.recentWordsByBacteria.size;
        }
        
        // Context distribution
        this.availableContexts.forEach(context => {
            stats.contextDistribution[context] = Array.from(this.contextHistory.values())
                .reduce((count, history) => count + history.filter(c => c === context).length, 0);
        });
        
        // Anti-monotony effectiveness
        if (stats.totalGenerations > 0) {
            stats.antiMonotonyEffectiveness = (stats.antiMonotonyTriggers / stats.totalGenerations) * 100;
        }
        
        return stats;
    }

    // 🔄 Reset Diversity System
    resetDiversitySystem() {
        this.wordUsageCount.clear();
        this.recentWordsByBacteria.clear();
        this.contextHistory.clear();
        this.lastContextChange.clear();
        
        this.diversityMetrics = {
            totalGenerations: 0,
            uniqueWordsUsed: new Set(),
            contextChanges: 0,
            antiMonotonyTriggers: 0,
            samplingUsage: 0
        };
        
        console.log('🔄 LanguageEvolutionEngine diversity system reset!');
    }

    // Generate training dataset with TabPFGen
    generateFineTuneData(size = 10, context = 'neutral') {
        return this.tabPFGen.generateDataset(size, context);
    }

    // Apply fine-tuning to TabPFN
    fineTuneTabPFN(dataset) {
        this.tabpfnFineTuner.fineTune(dataset);
    }

    // Sistem durumu - Enhanced AI included
    getStatus() {
        const diversityStats = this.getDiversityStats();
        
        return {
            initialized: this.initialized,
            personalityCount: this.personalityMap.size,
            bigramCount: this.bacteriaBigrams.size,
            semanticFieldCount: Object.keys(this.semanticFields).length,
            conversationHistories: this.conversationHistory.size,
            
            // AI Systems Status
            tabPFNStatus: tabPFNAdapter.getStatus(),
            enhancedTabPFNStatus: this.enhancedTabPFN.getStatus(),
            trackerStatus: wordSuccessTracker.getStatus(),
            
            // 🎭 NEW: Advanced Diversity Features
            diversitySystem: {
                antiMonotonyActive: this.antiMonotonyActive,
                totalGenerations: diversityStats.totalGenerations,
                uniqueWordsUsed: diversityStats.uniqueWordsCount,
                antiMonotonyEffectiveness: diversityStats.antiMonotonyEffectiveness.toFixed(1) + '%',
                contextChanges: diversityStats.contextChanges,
                samplingUsage: diversityStats.samplingUsage,
                activeBacteria: diversityStats.activeBacteria
            },
            
            // Advanced Features
            aiEnhancements: {
                multiLayerPrediction: this.enhancedTabPFN.isReady,
                crossBacteriaLearning: true,
                conversationMemory: true,
                reinforcementLearning: true,
                topKSampling: true, // NEW!
                contextDrift: true, // NEW!
                moodBasedStyling: true, // NEW!
                noveltyPenalty: true, // NEW!
                peerDialogue: true // NEW!
            }
        };
    }
}

// Global instance
export const languageEvolutionEngine = new LanguageEvolutionEngine();
