// @ts-nocheck
// Word Success Tracker - Kelime Başarı Takibi ve Reinforcement Learning
export class WordSuccessTracker {
    constructor() {
        this.stats = new Map(); // { word: { context: { total, success, weight } } }
        this.contextStats = new Map(); // { context: { totalWords, avgSuccess } }
        this.temporalData = []; // Zaman bazlı başarı verisi
        this.learningRate = 0.1;
        this.decayFactor = 0.95;
        this.initialized = false;
    }

    // Kelime sonucunu kaydet
    record(word, context, wasSuccessful, metadata = {}) {
        if (!word || !context) return;

        // Kelime istatistiklerini başlat
        if (!this.stats.has(word)) {
            this.stats.set(word, {});
        }
        
        const wordStats = this.stats.get(word);
        if (!wordStats[context]) {
            wordStats[context] = {
                total: 0,
                success: 0,
                weight: 1.0,
                lastUsed: Date.now(),
                metadata: []
            };
        }

        const ctxStats = wordStats[context];
        ctxStats.total += 1;
        if (wasSuccessful) {
            ctxStats.success += 1;
        }

        // Metadata kaydet (opsiyonel)
        if (Object.keys(metadata).length > 0) {
            ctxStats.metadata.push({
                timestamp: Date.now(),
                success: wasSuccessful,
                ...metadata
            });
            
            // Max 10 metadata kayıt tut
            if (ctxStats.metadata.length > 10) {
                ctxStats.metadata = ctxStats.metadata.slice(-10);
            }
        }

        // Ağırlığı güncelle
        this._updateWeight(word, context, wasSuccessful);
        
        // Bağlam istatistiklerini güncelle
        this._updateContextStats(context, wasSuccessful);
        
        // Temporal data kaydet
        this._recordTemporalData(word, context, wasSuccessful);
        
        console.log(`📊 WordTracker: ${word} (${context}) → ${wasSuccessful ? '✅' : '❌'}, weight: ${ctxStats.weight.toFixed(3)}`);
    }

    // Kelime ağırlığını güncelle (Reinforcement Learning)
    _updateWeight(word, context, wasSuccessful) {
        const wordStats = this.stats.get(word);
        const ctxStats = wordStats[context];
        
        if (wasSuccessful) {
            // Başarılı kelime - ağırlığı artır
            ctxStats.weight = Math.min(2.0, ctxStats.weight + this.learningRate);
        } else {
            // Başarısız kelime - ağırlığı azalt
            ctxStats.weight = Math.max(0.1, ctxStats.weight - (this.learningRate * 0.5));
        }
        
        // Zaman bazlı decay uygula
        const timeSinceLastUse = (Date.now() - ctxStats.lastUsed) / (1000 * 60 * 60); // saat
        if (timeSinceLastUse > 1) {
            ctxStats.weight *= Math.pow(this.decayFactor, timeSinceLastUse);
        }
        
        ctxStats.lastUsed = Date.now();
    }

    // Bağlam istatistiklerini güncelle
    _updateContextStats(context, wasSuccessful) {
        if (!this.contextStats.has(context)) {
            this.contextStats.set(context, {
                totalWords: 0,
                successCount: 0,
                avgSuccess: 0
            });
        }
        
        const stats = this.contextStats.get(context);
        stats.totalWords += 1;
        if (wasSuccessful) {
            stats.successCount += 1;
        }
        stats.avgSuccess = stats.successCount / stats.totalWords;
    }

    // Temporal data kaydet
    _recordTemporalData(word, context, wasSuccessful) {
        this.temporalData.push({
            timestamp: Date.now(),
            word,
            context,
            success: wasSuccessful
        });
        
        // Max 1000 kayıt tut
        if (this.temporalData.length > 1000) {
            this.temporalData = this.temporalData.slice(-1000);
        }
    }

    // Başarı oranını al
    getSuccessRate(word, context) {
        const wordStats = this.stats.get(word);
        if (!wordStats || !wordStats[context]) {
            return 0.5; // Default neutral score
        }
        
        const ctxStats = wordStats[context];
        if (ctxStats.total === 0) return 0.5;
        
        return ctxStats.success / ctxStats.total;
    }

    // Kelime ağırlığını al
    getWeight(word, context) {
        const wordStats = this.stats.get(word);
        if (!wordStats || !wordStats[context]) {
            return 1.0; // Default weight
        }
        
        return wordStats[context].weight;
    }

    // Ağırlıklı rastgele kelime seç
    getWeightedRandomWord(context, candidateWords) {
        if (!candidateWords || candidateWords.length === 0) {
            return null;
        }
        
        // Her kelime için ağırlık hesapla
        const weights = candidateWords.map(word => {
            const baseWeight = this.getWeight(word, context);
            const successRate = this.getSuccessRate(word, context);
            
            // Ağırlık = baseWeight * (1 + successRate)
            return baseWeight * (1 + successRate);
        });
        
        // Ağırlıklı seçim yap
        const totalWeight = weights.reduce((sum, w) => sum + w, 0);
        if (totalWeight === 0) {
            return candidateWords[Math.floor(Math.random() * candidateWords.length)];
        }
        
        let random = Math.random() * totalWeight;
        for (let i = 0; i < candidateWords.length; i++) {
            random -= weights[i];
            if (random <= 0) {
                return candidateWords[i];
            }
        }
        
        return candidateWords[candidateWords.length - 1];
    }

    // En başarılı kelimeleri al
    getTopWords(context, limit = 5) {
        const contextWords = [];
        
        for (const [word, contexts] of this.stats) {
            if (contexts[context]) {
                const stats = contexts[context];
                const successRate = stats.success / stats.total;
                contextWords.push({
                    word,
                    successRate,
                    weight: stats.weight,
                    total: stats.total
                });
            }
        }
        
        // Başarı oranına göre sırala
        contextWords.sort((a, b) => {
            // Önce başarı oranına göre, sonra kullanım sayısına göre
            const successDiff = b.successRate - a.successRate;
            if (Math.abs(successDiff) > 0.1) return successDiff;
            return b.total - a.total;
        });
        
        return contextWords.slice(0, limit);
    }

    // En kötü performans gösteren kelimeleri al
    getWorstWords(context, limit = 5) {
        const contextWords = [];
        
        for (const [word, contexts] of this.stats) {
            if (contexts[context] && contexts[context].total >= 3) {
                const stats = contexts[context];
                const successRate = stats.success / stats.total;
                contextWords.push({
                    word,
                    successRate,
                    weight: stats.weight,
                    total: stats.total
                });
            }
        }
        
        // Başarı oranına göre ters sırala (en kötüler önce)
        contextWords.sort((a, b) => a.successRate - b.successRate);
        
        return contextWords.slice(0, limit);
    }

    // Bağlam performansını al
    getContextPerformance(context) {
        const stats = this.contextStats.get(context);
        if (!stats) {
            return {
                context,
                totalWords: 0,
                avgSuccess: 0.5,
                confidence: 0
            };
        }
        
        return {
            context,
            totalWords: stats.totalWords,
            avgSuccess: stats.avgSuccess,
            confidence: Math.min(1, stats.totalWords / 20) // 20 kelimede %100 güven
        };
    }

    // Trending kelimeleri al (son zamanlarda başarılı olanlar)
    getTrendingWords(context, timeWindow = 3600000) { // 1 saat
        const now = Date.now();
        const recentData = this.temporalData.filter(
            item => item.context === context && 
                   (now - item.timestamp) <= timeWindow
        );
        
        const wordCounts = {};
        const wordSuccess = {};
        
        recentData.forEach(item => {
            if (!wordCounts[item.word]) {
                wordCounts[item.word] = 0;
                wordSuccess[item.word] = 0;
            }
            wordCounts[item.word]++;
            if (item.success) {
                wordSuccess[item.word]++;
            }
        });
        
        const trending = Object.keys(wordCounts)
            .map(word => ({
                word,
                usage: wordCounts[word],
                successRate: wordSuccess[word] / wordCounts[word],
                trend: wordCounts[word] > 2 ? 'hot' : 'normal'
            }))
            .filter(item => item.usage >= 2)
            .sort((a, b) => b.successRate - a.successRate);
            
        return trending;
    }

    // İstatistikleri temizle
    clearStats() {
        this.stats.clear();
        this.contextStats.clear();
        this.temporalData = [];
        console.log('🧹 WordSuccessTracker temizlendi');
    }

    // Sistem durumunu al
    getStatus() {
        return {
            totalWords: this.stats.size,
            totalContexts: this.contextStats.size,
            temporalDataPoints: this.temporalData.length,
            learningRate: this.learningRate,
            avgContextPerformance: this._calculateAvgPerformance()
        };
    }

    // Ortalama performans hesapla
    _calculateAvgPerformance() {
        if (this.contextStats.size === 0) return 0;
        
        let totalAvg = 0;
        for (const [context, stats] of this.contextStats) {
            totalAvg += stats.avgSuccess;
        }
        
        return totalAvg / this.contextStats.size;
    }

    // Export data (debugging/analytics için)
    exportData() {
        return {
            stats: Object.fromEntries(this.stats),
            contextStats: Object.fromEntries(this.contextStats),
            temporalData: this.temporalData.slice(-100), // Son 100 kayıt
            status: this.getStatus()
        };
    }
}

// Global instance
export const wordSuccessTracker = new WordSuccessTracker(); 