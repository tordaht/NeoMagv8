// @ts-nocheck
/**
 * 🧬 Enhanced Persistent Learning Engine v1.0
 * İstemci-taraflı kalıcı öğrenme sistemi (IndexedDB + TensorFlow.js)
 * Her kullanıcı etkileşimi kalıcı olarak saklanır ve öğrenilir
 */

export class PersistentLearningEngine {
    constructor() {
        this.dbName = 'NeoMagLearningDB';
        this.dbVersion = 1;
        this.db = null;
        this.isReady = false;
        
        // Öğrenme metrikleri
        this.metrics = {
            totalInteractions: 0,
            uniqueWords: new Set(),
            learningRate: 0.01,
            retentionScore: 0.95
        };
        
        // Kelime başarı oranları
        this.wordSuccessRates = new Map();
        
        // Context patterns
        this.contextPatterns = new Map();
        
        this.initialize();
    }
    
    /**
     * IndexedDB ve öğrenme sistemini başlat
     */
    async initialize() {
        try {
            console.log('🧬 Initializing Persistent Learning Engine...');
            
            // IndexedDB açma
            await this.openDatabase();
            
            // Önceki öğrenme verilerini yükle
            await this.loadPreviousLearning();
            
            this.isReady = true;
            console.log('✅ Persistent Learning Engine ready!');
            console.log(`📊 Loaded ${this.metrics.totalInteractions} previous interactions`);
            console.log(`📚 Vocabulary size: ${this.metrics.uniqueWords.size} words`);
            
        } catch (error) {
            console.error('❌ Persistent Learning Engine initialization failed:', error);
        }
    }
    
    /**
     * IndexedDB veritabanını aç
     */
    openDatabase() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.dbVersion);
            
            request.onerror = () => reject(request.error);
            request.onsuccess = () => {
                this.db = request.result;
                resolve();
            };
            
            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                
                // Kullanıcı etkileşimleri tablosu
                if (!db.objectStoreNames.contains('interactions')) {
                    const interactionsStore = db.createObjectStore('interactions', { 
                        keyPath: 'id', 
                        autoIncrement: true 
                    });
                    interactionsStore.createIndex('timestamp', 'timestamp', { unique: false });
                    interactionsStore.createIndex('context', 'context', { unique: false });
                }
                
                // Öğrenilen kelimeler tablosu
                if (!db.objectStoreNames.contains('vocabulary')) {
                    const vocabStore = db.createObjectStore('vocabulary', { 
                        keyPath: 'word' 
                    });
                    vocabStore.createIndex('successRate', 'successRate', { unique: false });
                    vocabStore.createIndex('frequency', 'frequency', { unique: false });
                }
                
                // Context patterns tablosu
                if (!db.objectStoreNames.contains('contextPatterns')) {
                    const patternsStore = db.createObjectStore('contextPatterns', { 
                        keyPath: 'pattern' 
                    });
                    patternsStore.createIndex('effectiveness', 'effectiveness', { unique: false });
                }
                
                console.log('🗃️ IndexedDB schema created');
            };
        });
    }
    
    /**
     * Önceki öğrenme verilerini yükle
     */
    async loadPreviousLearning() {
        if (!this.db) return;
        
        try {
            // Etkileşim sayısını hesapla
            const interactionCount = await this.countRecords('interactions');
            this.metrics.totalInteractions = interactionCount;
            
            // Kelime başarı oranlarını yükle
            const vocabulary = await this.getAllRecords('vocabulary');
            vocabulary.forEach(record => {
                this.wordSuccessRates.set(record.word, record.successRate);
                this.metrics.uniqueWords.add(record.word);
            });
            
            // Context patterns yükle
            const patterns = await this.getAllRecords('contextPatterns');
            patterns.forEach(record => {
                this.contextPatterns.set(record.pattern, record.effectiveness);
            });
            
            console.log('📚 Previous learning data loaded successfully');
            
        } catch (error) {
            console.warn('⚠️ Could not load previous learning data:', error);
        }
    }
    
    /**
     * Kullanıcı etkileşimini kaydet ve öğren
     */
    async recordInteraction(userInput, bacteriaResponse, context, bacteriaId) {
        if (!this.isReady) return;
        
        try {
            const interaction = {
                userInput: userInput.trim(),
                bacteriaResponse: bacteriaResponse,
                context: context,
                bacteriaId: bacteriaId,
                timestamp: Date.now(),
                words: this.extractWords(userInput),
                success: this.evaluateInteractionSuccess(userInput, bacteriaResponse)
            };
            
            // Etkileşimi kaydet
            await this.addRecord('interactions', interaction);
            
            // Kelimeleri öğren
            await this.learnFromWords(interaction.words, interaction.success, context);
            
            // Context pattern'i güncelle
            await this.updateContextPattern(context, interaction.success);
            
            // Metrikleri güncelle
            this.updateMetrics(interaction);
            
            console.log(`🧠 Interaction learned: "${userInput.substring(0, 30)}..." (success: ${interaction.success})`);
            
        } catch (error) {
            console.error('❌ Failed to record interaction:', error);
        }
    }
    
    /**
     * Kelimelerden öğren ve başarı oranlarını güncelle
     */
    async learnFromWords(words, success, context) {
        for (const word of words) {
            const currentRecord = await this.getRecord('vocabulary', word);
            
            if (currentRecord) {
                // Mevcut kelimeyi güncelle
                const newSuccessRate = this.calculateNewSuccessRate(
                    currentRecord.successRate, 
                    success, 
                    currentRecord.frequency
                );
                
                const updatedRecord = {
                    ...currentRecord,
                    successRate: newSuccessRate,
                    frequency: currentRecord.frequency + 1,
                    lastUsed: Date.now(),
                    contexts: [...new Set([...currentRecord.contexts, context])]
                };
                
                await this.updateRecord('vocabulary', updatedRecord);
                this.wordSuccessRates.set(word, newSuccessRate);
                
            } else {
                // Yeni kelime ekle
                const newRecord = {
                    word: word,
                    successRate: success ? 0.8 : 0.2, // Başlangıç değeri
                    frequency: 1,
                    firstSeen: Date.now(),
                    lastUsed: Date.now(),
                    contexts: [context]
                };
                
                await this.addRecord('vocabulary', newRecord);
                this.wordSuccessRates.set(word, newRecord.successRate);
                this.metrics.uniqueWords.add(word);
            }
        }
    }
    
    /**
     * Context pattern'i güncelle
     */
    async updateContextPattern(context, success) {
        const currentPattern = await this.getRecord('contextPatterns', context);
        
        if (currentPattern) {
            const newEffectiveness = this.calculateNewSuccessRate(
                currentPattern.effectiveness,
                success,
                currentPattern.usageCount
            );
            
            const updatedPattern = {
                ...currentPattern,
                effectiveness: newEffectiveness,
                usageCount: currentPattern.usageCount + 1,
                lastUsed: Date.now()
            };
            
            await this.updateRecord('contextPatterns', updatedPattern);
            this.contextPatterns.set(context, newEffectiveness);
            
        } else {
            const newPattern = {
                pattern: context,
                effectiveness: success ? 0.75 : 0.25,
                usageCount: 1,
                firstSeen: Date.now(),
                lastUsed: Date.now()
            };
            
            await this.addRecord('contextPatterns', newPattern);
            this.contextPatterns.set(context, newPattern.effectiveness);
        }
    }
    
    /**
     * Yeni başarı oranını hesapla (öğrenme algoritması)
     */
    calculateNewSuccessRate(currentRate, success, frequency) {
        const learningWeight = Math.min(0.3, 1 / (frequency + 1)); // Adaptive learning rate
        const successValue = success ? 1.0 : 0.0;
        
        return currentRate * (1 - learningWeight) + successValue * learningWeight;
    }
    
    /**
     * Etkileşim başarısını değerlendir
     */
    evaluateInteractionSuccess(userInput, bacteriaResponse) {
        // Basit heuristik - gerçek uygulamada daha sofistike olabilir
        const meaningfulResponse = bacteriaResponse.length > 10;
        const containsUserWords = this.extractWords(userInput).some(word => 
            bacteriaResponse.toLowerCase().includes(word.toLowerCase())
        );
        const notGeneric = !bacteriaResponse.includes('Anlamadım') && 
                          !bacteriaResponse.includes('...');
        
        return meaningfulResponse && (containsUserWords || notGeneric);
    }
    
    /**
     * Metinten kelimeleri çıkar
     */
    extractWords(text) {
        return text.toLowerCase()
            .replace(/[^\wçğıöşüâîû\s]/g, ' ')
            .split(/\s+/)
            .filter(word => word.length > 2)
            .slice(0, 10); // İlk 10 kelime
    }
    
    /**
     * Öğrenilen kelime için başarı oranı getir
     */
    getWordSuccessRate(word) {
        return this.wordSuccessRates.get(word.toLowerCase()) || 0.5;
    }
    
    /**
     * Context için etkililik oranı getir
     */
    getContextEffectiveness(context) {
        return this.contextPatterns.get(context) || 0.5;
    }
    
    /**
     * En başarılı kelimeleri getir
     */
    getTopWords(limit = 20) {
        return Array.from(this.wordSuccessRates.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, limit)
            .map(([word, rate]) => ({ word, successRate: rate }));
    }
    
    /**
     * Öğrenme istatistiklerini getir
     */
    getLearningStats() {
        const topWords = this.getTopWords(10);
        const topContexts = Array.from(this.contextPatterns.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([context, effectiveness]) => ({ context, effectiveness }));
        
        return {
            totalInteractions: this.metrics.totalInteractions,
            vocabularySize: this.metrics.uniqueWords.size,
            topWords: topWords,
            topContexts: topContexts,
            averageSuccessRate: this.calculateAverageSuccessRate(),
            learningTrend: this.calculateLearningTrend()
        };
    }
    
    /**
     * Ortalama başarı oranını hesapla
     */
    calculateAverageSuccessRate() {
        if (this.wordSuccessRates.size === 0) return 0;
        
        const total = Array.from(this.wordSuccessRates.values())
            .reduce((sum, rate) => sum + rate, 0);
        
        return total / this.wordSuccessRates.size;
    }
    
    /**
     * Öğrenme trendini hesapla
     */
    calculateLearningTrend() {
        // Basit trend hesaplaması - son etkileşimlerdeki başarı oranı
        const recentThreshold = Date.now() - (24 * 60 * 60 * 1000); // Son 24 saat
        // Bu implementation için basit bir değer döndürüyoruz
        return Math.min(1.0, this.metrics.totalInteractions / 100);
    }

    /**
     * Track bacteria speech for vocabulary statistics
     */
    async trackSpeech(bacteria, message) {
        if (!this.isReady || !message) return;

        try {
            const words = this.extractWords(message);
            await this.learnFromWords(words, true, 'speech');
            this.metrics.totalInteractions++;
        } catch (error) {
            console.warn('⚠️ Failed to track speech:', error);
        }
    }
    
    /**
     * Metrikleri güncelle
     */
    updateMetrics(interaction) {
        this.metrics.totalInteractions++;
        interaction.words.forEach(word => this.metrics.uniqueWords.add(word));
    }
    
    // IndexedDB yardımcı methodları
    async addRecord(storeName, record) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], 'readwrite');
            const store = transaction.objectStore(storeName);
            const request = store.add(record);
            
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }
    
    async getRecord(storeName, key) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], 'readonly');
            const store = transaction.objectStore(storeName);
            const request = store.get(key);
            
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }
    
    async updateRecord(storeName, record) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], 'readwrite');
            const store = transaction.objectStore(storeName);
            const request = store.put(record);
            
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }
    
    async getAllRecords(storeName) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], 'readonly');
            const store = transaction.objectStore(storeName);
            const request = store.getAll();
            
            request.onsuccess = () => resolve(request.result || []);
            request.onerror = () => reject(request.error);
        });
    }
    
    async countRecords(storeName) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], 'readonly');
            const store = transaction.objectStore(storeName);
            const request = store.count();
            
            request.onsuccess = () => resolve(request.result || 0);
            request.onerror = () => reject(request.error);
        });
    }
    
    /**
     * Veritabanını temizle (geliştirme amaçlı)
     */
    async clearDatabase() {
        if (!this.db) return;
        
        const storeNames = ['interactions', 'vocabulary', 'contextPatterns'];
        
        for (const storeName of storeNames) {
            await new Promise((resolve, reject) => {
                const transaction = this.db.transaction([storeName], 'readwrite');
                const store = transaction.objectStore(storeName);
                const request = store.clear();
                
                request.onsuccess = () => resolve();
                request.onerror = () => reject(request.error);
            });
        }
        
        // Metrikleri sıfırla
        this.metrics.totalInteractions = 0;
        this.metrics.uniqueWords.clear();
        this.wordSuccessRates.clear();
        this.contextPatterns.clear();
        
        console.log('🗑️ Learning database cleared');
    }
}

export default PersistentLearningEngine; 