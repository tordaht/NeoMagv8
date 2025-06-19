// @ts-nocheck
// TabPFN Adapter - Kelime Analizi ve Öneri Sistemi
import trainingDataJson from '../data/consciousness_training_data.json' assert { type: 'json' };
import * as tf from '@tensorflow/tfjs';
import { ModelService } from '@/services/ModelService.ts';


export class TabPFNAdapter {
    private modelService: ModelService;

    constructor(modelService: ModelService) {
        this.modelService = modelService;
        this.isReady = false;
        this.model = null;
        this.trainingData = [];
        this.contextWordMap = new Map();
        this.predictionCache = new Map();
        this.contextMatrix = null;
        this.initialized = false;
    }

    async init() {
        try {
            console.log('🔧 TabPFN Adapter başlatılıyor...');

            // Training data yükle ve bağlam haritası oluştur
            this._loadContextWordMap(trainingDataJson.training_data || []);

            if (typeof tf !== 'undefined') {
                try {
                    await tf.setBackend('webgl');
                    await tf.ready();
                } catch (err) {
                    console.warn('⚠️ WebGL backend kullanılamıyor, wasm\u2019a geçiliyor');
                    try {
                        await tf.setBackend('wasm');
                        await tf.ready();
                    } catch (wasmErr) {
                        console.error('❌ WASM backend de başarısız, CPU kullanılacak');
                        await tf.setBackend('cpu');
                        await tf.ready();
                    }
                }

                try {
                    this.model = await this.modelService.loadModel();
                } catch (modelErr) {
                    console.error('❌ GraphModel yüklenemedi:', modelErr);
                    this.model = null;
                }

            }
            
            this.isReady = true;
            this.initialized = true;
            console.log('✅ TabPFN Adapter hazır!');
            
        } catch (error) {
            console.error('❌ TabPFN yüklenemedi:', error);
            this.isReady = false;
        }
    }

    // Bakteri kelime dağarcığını analiz et
    async analyzeVocabulary(bacteria) {
        if (!this.isReady) {
            console.warn('⚠️ TabPFN hazır değil, fallback kullanılıyor');
            return null;
        }

        try {
            const features = this._prepareFeatures(bacteria);
            const cacheKey = this._getCacheKey(features);
            
            // Cache kontrolü
            if (this.predictionCache.has(cacheKey)) {
                return this.predictionCache.get(cacheKey);
            }

            // Kelime önerisi üret
            const suggestions = await this._generateWordSuggestions(bacteria, features);
            
            // Cache'e kaydet
            this.predictionCache.set(cacheKey, suggestions);
            
            return suggestions;
            
        } catch (error) {
            console.error('🔥 TabPFN analiz hatası:', error);
            return null;
        }
    }

    // Bakteri özelliklerini feature vector'e çevir
    _prepareFeatures(bacteria) {
        const features = [
            bacteria.consciousness_level || 0,
            bacteria.vocabulary.size || 0,
            bacteria.personality.optimism || 0.5,
            bacteria.personality.sociability || 0.5,
            bacteria.age || 0,
            bacteria.energy_level || 0.5,
            bacteria.growth_rate || 0.5,
            bacteria.mood || 0.5,
            bacteria.language_stage || 0,
            bacteria.interaction_count || 0
        ];
        
        return features.map(f => Math.min(Math.max(f, 0), 1)); // 0-1 arasında normalize et
    }

    // Cache key oluştur
    _getCacheKey(features) {
        return features.map(f => Math.round(f * 10)).join('_');
    }

    // Kelime önerileri üret
    async _generateWordSuggestions(bacteria, features) {
        // Eğitim verisine dayalı öneriler ve kural tabanlı sistem
        const vocabulary = Array.from(bacteria.vocabulary);
        const suggestions = [];

        const context = this._detectContext(bacteria);
        const trainingMap = this.contextWordMap.get(context);
        if (trainingMap) {
            const trainingWords = [...trainingMap.entries()]
                .filter(([w]) => !bacteria.vocabulary.has(w))
                .sort((a, b) => b[1] - a[1])
                .slice(0, 5)
                .map(([w]) => w);
            suggestions.push(...trainingWords);
        }
        
        // Bilinç seviyesine göre öneriler
        if (bacteria.consciousness_level > 0.7) {
            suggestions.push(...this._getPhilosophicalWords());
        }
        
        // Sosyal seviyeye göre öneriler
        if (bacteria.personality.sociability > 0.6) {
            suggestions.push(...this._getSocialWords());
        }
        
        // Yaratıcılık seviyesine göre öneriler
        if (bacteria.personality.creativity > 0.5) {
            suggestions.push(...this._getCreativeWords());
        }
        
        // Absurd öneriler (düşük ihtimalle)
        if (Math.random() < 0.1) {
            suggestions.push(...this._getAbsurdWords());
        }
        
        // Mevcut kelimelerle kombinasyonlar
        if (vocabulary.length >= 2) {
            suggestions.push(...this._generateCombinations(vocabulary));
        }
        
        // Duplicate'ları kaldır ve max 5 öneri döndür
        const uniqueSuggestions = [...new Set(suggestions)]
            .filter(word => !bacteria.vocabulary.has(word))
            .sort(() => Math.random() - 0.5)
            .slice(0, 5);
            
        return {
            suggested_next_words: uniqueSuggestions,
            confidence: this._calculateConfidence(uniqueSuggestions.length),
            context: this._detectContext(bacteria),
            reasoning: this._generateReasoning(bacteria, uniqueSuggestions)
        };
    }

    // Bağlam-spesifik kelime grupları
    _getPhilosophicalWords() {
        return ['varoluş', 'bilinç', 'düşünce', 'anlam', 'hakikat', 'felsefe'];
    }

    _getSocialWords() {
        return ['arkadaş', 'paylaşım', 'iletişim', 'topluluk', 'yardım', 'birlik'];
    }

    _getCreativeWords() {
        return ['hayal', 'sanat', 'yaratıcı', 'inovasyon', 'tasarım', 'estetik'];
    }

    _getAbsurdWords() {
        return ['uçan patates', 'dans eden mikroskop', 'şarkı söyleyen termometre', 'ağlayan bilgisayar'];
    }

    // Mevcut kelimelerle kombinasyon oluştur
    _generateCombinations(vocabulary) {
        const combinations = [];
        const words = vocabulary.slice(0, 5); // Max 5 kelime kullan
        
        for (let i = 0; i < words.length - 1; i++) {
            for (let j = i + 1; j < words.length; j++) {
                const word1 = words[i];
                const word2 = words[j];
                
                if (word1 && word2 && word1 !== word2) {
                    // Farklı kombinasyon türleri
                    combinations.push(word1 + word2);
                    combinations.push(word1.slice(0, 3) + word2.slice(-3));
                    combinations.push(word1[0] + word2);
                    
                    if (word1.length > 2 && word2.length > 2) {
                        combinations.push(word1.slice(0, -1) + word2.slice(1));
                    }
                }
            }
        }
        
        return combinations.slice(0, 3); // Max 3 kombinasyon
    }

    // Güven skoru hesapla
    _calculateConfidence(suggestionCount) {
        return Math.min(0.9, 0.3 + (suggestionCount * 0.15));
    }

    // Bağlam tespit et
    _detectContext(bacteria) {
        if (bacteria.consciousness_level > 0.7) return 'philosophical';
        if (bacteria.personality.sociability > 0.6) return 'social';
        if (bacteria.energy_level < 0.3) return 'survival';
        if (bacteria.mood > 0.7) return 'creative';
        return 'neutral';
    }

    // Öneri gerekçesi oluştur
    _generateReasoning(bacteria, suggestions) {
        const reasons = [];
        
        if (bacteria.consciousness_level > 0.7) {
            reasons.push('Yüksek bilinç seviyesi - felsefi kelimeler');
        }
        
        if (bacteria.personality.sociability > 0.6) {
            reasons.push('Sosyal kişilik - iletişim kelimeleri');
        }
        
        if (suggestions.length > 3) {
            reasons.push('Zengin kelime havuzu - kombinasyonlar');
        }
        
        return reasons.join(', ') || 'Genel kelime gelişimi';
    }

    _loadContextWordMap(data) {
        this.contextWordMap.clear();
        for (const item of data) {
            const contexts = item.context || [];
            const weights = item.word_weights || {};
            for (const ctx of contexts) {
                if (!this.contextWordMap.has(ctx)) {
                    this.contextWordMap.set(ctx, new Map());
                }
                const wordMap = this.contextWordMap.get(ctx);
                for (const [word, weight] of Object.entries(weights)) {
                    const current = wordMap.get(word) || 0;
                    if (weight > current) {
                        wordMap.set(word, weight);
                    }
                }
            }
        }
    }

    // Cache temizle
    clearCache() {
        this.predictionCache.clear();
        console.log('🧹 TabPFN cache temizlendi');
    }

    // Sistem durumu
    getStatus() {
        return {
            isReady: this.isReady,
            initialized: this.initialized,
            cacheSize: this.predictionCache.size,
            modelLoaded: this.model !== null
        };
    }
}

// Global instance with model service
const tabPFNModelService = new ModelService('https://cdn.example.com/neomag', 'latest');
export const tabPFNAdapter = new TabPFNAdapter(tabPFNModelService);
