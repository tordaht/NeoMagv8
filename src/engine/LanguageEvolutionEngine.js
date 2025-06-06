// Language Evolution Engine - Hibrit Dil Üretim Sistemi
import { tabPFNAdapter } from './TabPFNAdapter.js';
import { wordSuccessTracker } from './WordSuccessTracker.js';
import { turkceDialogueGenerator } from './TurkceDialogueGenerator.js';
import { EnhancedTabPFN } from './EnhancedTabPFN.js';

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
            
            this.initialized = true;
            console.log('✅ LanguageEvolutionEngine hazır! (Enhanced AI aktif)');
            
        } catch (error) {
            console.error('❌ LanguageEvolutionEngine başlatılamadı:', error);
        }
    }

    // Semantic fields dosyasını yükle
    async loadSemanticFields() {
        try {
            const response = await fetch('src/data/semantic_fields.json');
            this.semanticFields = await response.json();
            console.log('🎯 Semantic fields yüklendi:', Object.keys(this.semanticFields));
        } catch (error) {
            console.warn('⚠️ Semantic fields yüklenemedi, default kullanılıyor:', error);
            this._loadDefaultSemanticFields();
        }
    }

    // Default semantic fields
    _loadDefaultSemanticFields() {
        this.semanticFields = {
            biological: ['dna', 'protein', 'hücre', 'enerji', 'yaşam'],
            emotional: ['mutlu', 'üzgün', 'heyecan', 'korku', 'sevgi'],
            social: ['arkadaş', 'paylaşım', 'topluluk', 'yardım', 'birlik'],
            absurd: ['uçan patates', 'dans eden mikroskop', 'ağlayan bilgisayar'],
            neutral: ['selam', 'evet', 'hayır', 'belki', 'tamam']
        };
    }

    // Bakteri için dil stilini başlat
    initializeLanguageStyle(bacteria) {
        if (this.personalityMap.has(bacteria.id)) return;

        const style = {
            // Temel parametreler
            markovChainUsage: 0.3 + (bacteria.consciousness_level * 0.4),
            tabPFNUsage: 0.2 + (bacteria.consciousness_level * 0.6),
            absurdTolerance: bacteria.personality.creativity || 0.2,
            patternBreaking: bacteria.personality.adventurousness || 0.15,
            
            // Kişilik temelli
            emotionLevel: bacteria.personality.optimism || 0.5,
            socialLevel: bacteria.personality.sociability || 0.5,
            creativity: bacteria.personality.creativity || 0.3,
            
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

        this.personalityMap.set(bacteria.id, style);
        this._initializeBigrams(bacteria);
        
        console.log(`🎭 ${bacteria.name} dil stili başlatıldı:`, {
            markov: style.markovChainUsage.toFixed(2),
            tabPFN: style.tabPFNUsage.toFixed(2),
            absurd: style.absurdTolerance.toFixed(2)
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

    // Ana yaratıcı ifade üretme metodu
    async generateCreativeExpression(bacteria, context) {
        const style = this.personalityMap.get(bacteria.id);
        if (!style) {
            this.initializeLanguageStyle(bacteria);
            return this.generateCreativeExpression(bacteria, context);
        }

        const vocab = Array.from(bacteria.vocabulary);
        let words = [];

        // 1. Çekirdek kelime seçimi
        let coreWord = await this._selectCoreWord(bacteria, context, style);
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

    // Sistem durumu - Enhanced AI included
    getStatus() {
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
            
            // Advanced Features
            aiEnhancements: {
                multiLayerPrediction: this.enhancedTabPFN.isReady,
                crossBacteriaLearning: true,
                conversationMemory: true,
                reinforcementLearning: true
            }
        };
    }
}

// Global instance
export const languageEvolutionEngine = new LanguageEvolutionEngine(); 