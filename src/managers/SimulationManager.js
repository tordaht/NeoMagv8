/**
 * 🧬 mnBac v9.5.0 - Simulation Manager
 * Ultra-Aggressive Anti-Monotony Language Evolution System
 * Production-Ready Canvas & Interaction Management
 * Date: December 19, 2024
 */

import { languageEvolutionEngine } from '@/engine/LanguageEvolutionEngine.js';
import { tabPFNAdapter } from '@/engine/TabPFNAdapter.js';
import { wordSuccessTracker } from '@/engine/WordSuccessTracker.js';
import { getContextualWord, getSemanticFieldsStatus } from '@/utils/semanticFields.js';
import { RUNTIME_CONFIG } from '../config/SystemConfig.js';

export class SimulationManager {
    constructor() {
        this.bacteriaPopulation = [];
        this.isRunning = false;
        this.simulationStepCount = 0;
        this.simulationDay = 0;
        this.stepInterval = 1000; // 1 saniye
        this.dailyUpdateInterval = 10; // 10 adımda bir gün
        this.canvas = null;
        this.ctx = null;
        this.initialized = false;
        this.selectedBacteria = null; // Seçili bakteri
        this.wordGenerationEnabled = true; // Kelime üretme switch
        this.tabpfnEnabled = true; // TabPFN switch
        
        // Performance tracking
        this.performanceMetrics = {
            avgStepTime: 0,
            totalSteps: 0,
            fps: 0,
            lastFpsUpdate: Date.now()
        };
    }

    // Simülasyonu başlat
    async initialize() {
        try {
            console.log('🎬 SimulationManager başlatılıyor...');
            
            // Canvas'ı ayarla
            this.setupCanvas();
            
            // Dil sistemini başlat
            await languageEvolutionEngine.init();
            
            // Initial bacteria population oluştur
            this.createInitialPopulation();

            // İlk etkileşimi hemen başlat
            await this.triggerRandomInteractions();
            
            this.initialized = true;
            console.log('✅ SimulationManager hazır!');
            
        } catch (error) {
            console.error('❌ SimulationManager başlatılamadı:', error);
        }
    }

    // Canvas ayarla
    setupCanvas() {
        this.canvas = document.getElementById('simCanvas');
        if (this.canvas) {
            this.ctx = this.canvas.getContext('2d');
            this.resizeCanvas();
            
            // Click event listener
            this.canvas.addEventListener('click', (e) => this.handleCanvasClick(e));
        }
    }

    // Canvas boyutunu ayarla
    resizeCanvas() {
        if (!this.canvas) return;
        
        const container = this.canvas.parentElement;
        const rect = container.getBoundingClientRect();
        
        this.canvas.width = rect.width;
        this.canvas.height = rect.height;
        
        console.log(`📐 Canvas boyutu: ${this.canvas.width}x${this.canvas.height}`);
    }

    // İlk bakteri popülasyonunu oluştur
    createInitialPopulation() {
        const initialCount = 5;
        
        for (let i = 0; i < initialCount; i++) {
            const bacteria = this.createBacteria();
            this.bacteriaPopulation.push(bacteria);
            
            // Dil stilini başlat
            languageEvolutionEngine.initializeLanguageStyle(bacteria);
        }
        
        console.log(`🧬 İlk popülasyon oluşturuldu: ${initialCount} bakteri`);
    }

    // Yeni bakteri oluştur
    createBacteria() {
        const bacteria = {
            id: `bacteria_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            name: this.generateBacteriaName(),
            x: Math.random() * (this.canvas?.width || 800),
            y: Math.random() * (this.canvas?.height || 600),
            size: 5 + Math.random() * 10,
            age: 0,
            energy_level: 0.5 + Math.random() * 0.5,
            growth_rate: 0.1 + Math.random() * 0.4,
            consciousness_level: Math.random(),
            mood: 0.5 + Math.random() * 0.5,
            language_stage: Math.floor(Math.random() * 3),
            
            // Kişilik özellikleri
            personality: {
                optimism: Math.random(),
                sociability: Math.random(),
                creativity: Math.random(),
                adventurousness: Math.random(),
                traditionalism: Math.random()
            },
            
            // Kelime hazinesi
            vocabulary: new Set(this.getInitialVocabulary()),
            
            // Etkileşim verileri
            interaction_count: 0,
            memory_bank: [],
            
            // Hareket verileri
            velocity: {
                x: (Math.random() - 0.5) * 2,
                y: (Math.random() - 0.5) * 2
            },
            
            // Görsel özellikler
            color: this.generateBacteriaColor(),
            lastMessage: '',
            lastMessageTime: 0
        };
        
        return bacteria;
    }

    // Bakteri ismi üret
    generateBacteriaName() {
        const prefixes = ['Neo', 'Meta', 'Proto', 'Ultra', 'Hyper', 'Mega', 'Giga'];
        const suffixes = ['Bac', 'Cell', 'Micro', 'Bio', 'Gene', 'Vita', 'Orga'];
        const numbers = Math.floor(Math.random() * 1000);
        
        const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
        const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
        
        return `${prefix}${suffix}-${numbers}`;
    }

    // Başlangıç kelime haznesi
    getInitialVocabulary() {
        const basicWords = ['merhaba', 'enerji', 'yaşam', 'büyüme', 'hareket'];
        const vocabularySize = 3 + Math.floor(Math.random() * 5);
        
        return basicWords.slice(0, vocabularySize);
    }

    // Bakteri rengi üret
    generateBacteriaColor() {
        const colors = [
            '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', 
            '#FECA57', '#FF9FF3', '#54A0FF', '#5F27CD'
        ];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    // Canvas tıklama olayı - Hit-test ile bakteri seçimi
    handleCanvasClick(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        // 1️⃣ Tıklanan koordinatta bakteri var mı kontrol et
        const hitBacteria = this.bacteriaPopulation.find(bacteria => {
            const size = bacteria.size;
            const centerX = bacteria.x;
            const centerY = bacteria.y;
            const dx = x - centerX;
            const dy = y - centerY;
            const radius = size / 2;
            return dx*dx + dy*dy <= radius*radius;
        });

        if (hitBacteria) {
            // 2️⃣ Bakteri seçildi
            this.selectBacteria(hitBacteria);
        } else {
            // 3️⃣ Boş alana tıklandı - yemek ekle
            this.addFood(x, y);
            // Yakındaki bakterilerle etkileşim başlat
            this.triggerNearbyInteractions(x, y);
        }
    }

    // Bakteri seçme
    selectBacteria(bacteria) {
        // Önceki seçimi temizle
        if (this.selectedBacteria) {
            this.selectedBacteria.selected = false;
        }
        
        // Yeni seçimi ayarla
        this.selectedBacteria = bacteria;
        bacteria.selected = true;
        
        console.log(`👆 Seçilen bakteri: ${bacteria.name} (${bacteria.id})`);
        
        // UI'de seçili bakterinin bilgilerini göster
        this.updateSelectedBacteriaInfo();
    }

    // Seçili bakteri bilgilerini güncelle
    updateSelectedBacteriaInfo() {
        if (!this.selectedBacteria) return;
        
        const info = {
            name: this.selectedBacteria.name,
            age: this.selectedBacteria.age.toFixed(1),
            energy: (this.selectedBacteria.energy_level * 100).toFixed(0) + '%',
            mood: (this.selectedBacteria.mood * 100).toFixed(0) + '%',
            vocabulary: this.selectedBacteria.vocabulary.size,
            consciousness: (this.selectedBacteria.consciousness_level * 100).toFixed(0) + '%'
        };
        
        // Chat alanına bilgi mesajı ekle
        this.addChatMessage('Sistem', 
            `🔍 Seçilen: ${info.name} | Yaş: ${info.age} | Enerji: ${info.energy} | Ruh Hali: ${info.mood} | Kelime: ${info.vocabulary}`, 
            'system');
    }

    // Note: handleUserMessage artık UserInteractionManager tarafından handle ediliyor

    // Yemek ekle
    addFood(x, y) {
        console.log(`🍎 Yemek eklendi: (${x.toFixed(0)}, ${y.toFixed(0)})`);
        
        // Yakındaki bakterilerin enerjisini artır
        this.bacteriaPopulation.forEach(bacteria => {
            const distance = Math.sqrt((bacteria.x - x) ** 2 + (bacteria.y - y) ** 2);
            if (distance < 50) {
                bacteria.energy_level = Math.min(1, bacteria.energy_level + 0.2);
                bacteria.mood = Math.min(1, bacteria.mood + 0.1);
                console.log(`🍯 ${bacteria.name} enerji aldı!`);
            }
        });
    }

    // Yakındaki etkileşimleri tetikle
    triggerNearbyInteractions(x, y) {
        const nearbyBacteria = this.bacteriaPopulation.filter(bacteria => {
            const distance = Math.sqrt((bacteria.x - x) ** 2 + (bacteria.y - y) ** 2);
            return distance < 100;
        });
        
        if (nearbyBacteria.length >= 2) {
            console.log(`💬 ${nearbyBacteria.length} bakteri sohbet başlatıyor...`);
            this.startGroupConversation(nearbyBacteria);
        }
    }

    // Grup sohbeti başlat
    async startGroupConversation(bacteria) {
        if (bacteria.length < 2) return;
        
        const speaker = bacteria[Math.floor(Math.random() * bacteria.length)];
        const listeners = bacteria.filter(b => b.id !== speaker.id);
        
        // Context belirle
        const context = this.determineContext(speaker, listeners);
        
        // Yaratıcı ifade üret
        const message = await languageEvolutionEngine.generateCreativeExpression(speaker, context);
        
        if (message) {
            speaker.lastMessage = message;
            speaker.lastMessageTime = Date.now();
            speaker.interaction_count += 1;
            
            // Başarı değerlendirmesi
            const success = this.evaluateMessageSuccess(speaker, message, listeners, context);
            
            // Word tracker'a kaydet
            const words = message.split(' ');
            words.forEach(word => {
                wordSuccessTracker.record(word, context, success, {
                    speakerId: speaker.id,
                    listenerCount: listeners.length
                });
            });
            
            // Dil stilini adapt et
            languageEvolutionEngine.adaptLanguageStyle(speaker, success, context);
            
            // Bigram güncelle
            languageEvolutionEngine.updateBigrams(speaker, words);
            
            // UI'yi güncelle
            this.addChatMessage(speaker.name, message, 'bacteria');
            
            console.log(`💬 ${speaker.name}: "${message}" (${context}) - Başarı: ${success ? '✅' : '❌'}`);
        }
    }

    // Bağlam belirle
    determineContext(speaker, listeners) {
        if (speaker.energy_level < 0.3) return 'survival';
        if (listeners.length > 2) return 'social';
        if (speaker.mood > 0.7) return 'creative';
        if (speaker.consciousness_level > 0.7) return 'philosophical';
        return 'neutral';
    }

    // Mesaj başarısını değerlendir
    evaluateMessageSuccess(speaker, message, listeners, context) {
        let successScore = 0;
        
        const baseSuccess = {
            'social': 0.7, 'creative': 0.6, 'philosophical': 0.5,
            'survival': 0.8, 'neutral': 0.6
        };
        
        successScore += baseSuccess[context] || 0.6;
        
        const wordCount = message.split(' ').length;
        if (wordCount >= 2 && wordCount <= 4) {
            successScore += 0.2;
        } else if (wordCount > 6) {
            successScore -= 0.1;
        }
        
        successScore += (speaker.mood - 0.5) * 0.2;
        successScore += (Math.random() - 0.5) * 0.3;
        
        const isSuccessful = successScore > 0.5;
        
        // Listener mood güncellemesi
        listeners.forEach(listener => {
            if (isSuccessful) {
                listener.mood = Math.min(1, listener.mood + 0.05);
            } else {
                listener.mood = Math.max(0, listener.mood - 0.02);
            }
        });
        
        return isSuccessful;
    }

    // Ana simülasyon döngüsü
    async simulationStep() {
        if (!this.isRunning || !this.initialized) return;
        
        this.simulationStepCount += 1;
        
        // Günlük güncelleme
        if (this.simulationStepCount % this.dailyUpdateInterval === 0) {
            this.simulationDay += 1;
            await this.performDailyUpdate();
        }
        
        // Bakteri güncellemeleri
        for (const bacteria of this.bacteriaPopulation) {
            await this.updateBacteria(bacteria);
        }
        
        // Otomatik etkileşimler (her adımda daha sık konuşma)
        await this.triggerRandomInteractions();
        
        // Canvas çizimi
        this.render();
        
        // UI güncelleme
        if (this.simulationStepCount % 5 === 0) {
            this.updateUI();
        }
        
        // Bir sonraki adım
        setTimeout(() => this.simulationStep(), this.stepInterval);
    }

    // Bakteri güncelleme
    async updateBacteria(bacteria) {
        bacteria.age += 0.1;
        bacteria.energy_level = Math.max(0, bacteria.energy_level - 0.01);
        
        this.moveBacteria(bacteria);
        
        // Kelime öğrenme denemesi
        if (Math.random() < 0.1) {
            await this.attemptWordGeneration(bacteria);
        }
        
        // Bilinç gelişimi
        if (bacteria.interaction_count > 5 && Math.random() < 0.05) {
            bacteria.consciousness_level = Math.min(1, bacteria.consciousness_level + 0.01);
        }
    }

    // Bakteri hareketi
    moveBacteria(bacteria) {
        if (!this.canvas) return;
        
        bacteria.velocity.x += (Math.random() - 0.5) * 0.5;
        bacteria.velocity.y += (Math.random() - 0.5) * 0.5;
        
        const maxSpeed = 2;
        const speed = Math.sqrt(bacteria.velocity.x ** 2 + bacteria.velocity.y ** 2);
        if (speed > maxSpeed) {
            bacteria.velocity.x = (bacteria.velocity.x / speed) * maxSpeed;
            bacteria.velocity.y = (bacteria.velocity.y / speed) * maxSpeed;
        }
        
        bacteria.x += bacteria.velocity.x;
        bacteria.y += bacteria.velocity.y;
        
        // Sınır kontrolü
        if (bacteria.x < 0 || bacteria.x > this.canvas.width) {
            bacteria.velocity.x *= -0.8;
            bacteria.x = Math.max(0, Math.min(this.canvas.width, bacteria.x));
        }
        if (bacteria.y < 0 || bacteria.y > this.canvas.height) {
            bacteria.velocity.y *= -0.8;
            bacteria.y = Math.max(0, Math.min(this.canvas.height, bacteria.y));
        }
    }

    // Kelime üretme denemesi
    async attemptWordGeneration(bacteria) {
        try {
            const suggestions = await tabPFNAdapter.analyzeVocabulary(bacteria);
            
            if (suggestions && suggestions.suggested_next_words?.length > 0) {
                const newWord = suggestions.suggested_next_words[0];
                if (!bacteria.vocabulary.has(newWord)) {
                    bacteria.vocabulary.add(newWord);
                    console.log(`🎯 ${bacteria.name} yeni kelime öğrendi: "${newWord}"`);
                }
            } else {
                const context = this.determineContext(bacteria, []);
                const semanticWord = languageEvolutionEngine.getSemanticWord(context);
                if (semanticWord && !bacteria.vocabulary.has(semanticWord)) {
                    bacteria.vocabulary.add(semanticWord);
                    console.log(`📚 ${bacteria.name} semantic kelime öğrendi: "${semanticWord}"`);
                }
            }
        } catch (error) {
            console.warn('⚠️ Kelime üretme hatası:', error);
        }
    }

    // Rastgele etkileşimler
    async triggerRandomInteractions() {
        if (this.bacteriaPopulation.length < 2) return;
        
        const shuffled = [...this.bacteriaPopulation].sort(() => Math.random() - 0.5);
        const groupSize = 2 + Math.floor(Math.random() * 3);
        const group = shuffled.slice(0, Math.min(groupSize, shuffled.length));
        
        if (group.length >= 2) {
            await this.startGroupConversation(group);
        }
    }

    // Günlük güncelleme
    async performDailyUpdate() {
        console.log(`🌅 Gün ${this.simulationDay} başlıyor...`);
        
        for (const bacteria of this.bacteriaPopulation) {
            bacteria.energy_level = Math.min(1, bacteria.energy_level + 0.3);
            bacteria.mood = 0.3 + bacteria.mood * 0.7;
            
            if (bacteria.vocabulary.size > 20) {
                const words = Array.from(bacteria.vocabulary);
                const keepWords = words.slice(-15);
                bacteria.vocabulary = new Set(keepWords);
            }
        }
        
        if (this.simulationDay % 5 === 0) {
            tabPFNAdapter.clearCache();
        }
    }

    // Render (Canvas çizimi)
    render() {
        if (!this.ctx || !this.canvas) return;
        
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.bacteriaPopulation.forEach(bacteria => {
            this.drawBacteria(bacteria);
        });
        
        this.calculateFPS();
    }

    // Bakteri çizimi
    drawBacteria(bacteria) {
        this.ctx.save();
        
        // Seçili bakteriyi vurgula
        if (bacteria.selected) {
            this.ctx.strokeStyle = '#FFD700'; // Altın rengi
            this.ctx.lineWidth = 4;
            this.ctx.beginPath();
            this.ctx.arc(bacteria.x, bacteria.y, bacteria.size + 3, 0, Math.PI * 2);
            this.ctx.stroke();
        }
        
        this.ctx.fillStyle = bacteria.color;
        this.ctx.beginPath();
        this.ctx.arc(bacteria.x, bacteria.y, bacteria.size, 0, Math.PI * 2);
        this.ctx.fill();
        
        this.ctx.strokeStyle = bacteria.energy_level > 0.5 ? '#4CAF50' : '#FF5722';
        this.ctx.lineWidth = 2;
        this.ctx.stroke();
        
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.font = '10px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(bacteria.name, bacteria.x, bacteria.y - bacteria.size - 5);
        
        if (bacteria.lastMessage && (Date.now() - bacteria.lastMessageTime) < 3000) {
            this.ctx.fillStyle = '#000000';
            this.ctx.fillRect(bacteria.x - 30, bacteria.y + bacteria.size + 5, 60, 20);
            this.ctx.fillStyle = '#FFFFFF';
            this.ctx.font = '8px Arial';
            this.ctx.fillText(bacteria.lastMessage.substring(0, 8) + '...', bacteria.x, bacteria.y + bacteria.size + 17);
        }
        
        this.ctx.restore();
    }

    // FPS hesaplama
    calculateFPS() {
        const now = Date.now();
        if (now - this.performanceMetrics.lastFpsUpdate > 1000) {
            this.performanceMetrics.fps = this.performanceMetrics.totalSteps;
            this.performanceMetrics.totalSteps = 0;
            this.performanceMetrics.lastFpsUpdate = now;
        }
        this.performanceMetrics.totalSteps++;
    }

    // UI güncelleme
    updateUI() {
        const fpsDisplay = document.getElementById('fpsDisplay');
        if (fpsDisplay) {
            fpsDisplay.textContent = `FPS: ${this.performanceMetrics.fps}`;
        }
        
        const bacteriaCount = document.getElementById('bacteriaCount');
        if (bacteriaCount) {
            bacteriaCount.textContent = `Bakteri: ${this.bacteriaPopulation.length}`;
        }
        
        const dayDisplay = document.getElementById('dayDisplay');
        if (dayDisplay) {
            dayDisplay.textContent = `Gün: ${this.simulationDay}`;
        }
    }

    // Chat mesajı ekle
    addChatMessage(sender, message, type) {
        const chatMessages = document.getElementById('chatMessages');
        if (!chatMessages) return;
        
        const messageDiv = document.createElement('div');
        messageDiv.className = `chat-message ${type}`;
        messageDiv.innerHTML = `
            <strong>${sender}:</strong> ${message}
            <small>${new Date().toLocaleTimeString()}</small>
        `;
        
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    // Simülasyonu başlat
    start() {
        if (!this.initialized) {
            console.error('❌ Simülasyon başlatılamadı - initialize edilmemiş');
            return;
        }
        
        this.isRunning = true;
        this.simulationStep();
        console.log('▶️ Simülasyon başlatıldı');
    }

    // Simülasyonu durdur
    stop() {
        this.isRunning = false;
        console.log('⏸️ Simülasyon durduruldu');
    }

    // Sistem durumu
    getStatus() {
        return {
            isRunning: this.isRunning,
            initialized: this.initialized,
            populationSize: this.bacteriaPopulation.length,
            simulationDay: this.simulationDay,
            stepCount: this.simulationStepCount,
            performanceMetrics: this.performanceMetrics,
            engineStatus: languageEvolutionEngine.getStatus()
        };
    }
}

// Global instance
export const simulationManager = new SimulationManager(); 