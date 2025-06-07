/**
 * 🧬 mnBac v9.5.0 - User Interaction Manager
 * Ultra-Aggressive Anti-Monotony Language Evolution System
 * Production-Ready User Input & Chat Management
 * Date: December 19, 2024
 */

import { languageEvolutionEngine } from '@/engine/LanguageEvolutionEngine.js';
import { getContextualWord } from '@/utils/semanticFields.js';
import { turkceDialogueGenerator } from '@/engine/TurkceDialogueGenerator.js';
import { RUNTIME_CONFIG } from '../config/SystemConfig.js';

export default class UserInteractionManager {
    constructor(simulationManager) {
        this.simManager = simulationManager;
        this.langEngine = languageEvolutionEngine;
        this.lastContext = 'default';
        this.conversationHistory = [];
        
        // Intent patterns
        this.intentPatterns = {
            question: /\b(ne|nasıl|neden|kim|where|what|how|why|when|sence|düşünüyorsun|\?)/i,
            biological: /\b(enerji|yaşam|büyüme|beslenme|metabolizma|hücre|evrim|dna|gen)/i,
            social: /\b(merhaba|selam|dostum|arkadaş|birlikte|sosyal|grup|iletişim|konuşma)/i,
            creative: /\b(sanat|yaratıcı|hayal|rüya|dans|müzik|renk|güzel|estetik)/i,
            philosophical: /\b(anlam|felsefe|varoluş|bilinç|düşünce|mantık|gerçek|hakikat)/i,
            technical: /\b(teknoloji|bilgisayar|algoritma|kod|program|sistem|hesaplama)/i,
            emotional: /\b(mutlu|üzgün|korku|sevgi|öfke|heyecan|sakin|duygusal|hissediyor)/i,
            absurd: /\b(garip|tuhaf|saçma|komik|acayip|sürreal|absürt|anlamsız)/i
        };
    }

    /**
     * Ana mesaj işleme fonksiyonu
     */
    async handleMessage(userMsg) {
        try {
            console.log(`🧠 UserInteractionManager: "${userMsg}" analiz ediliyor...`);
            
            // 1️⃣ Niyet tespit et
            const intent = this._detectIntent(userMsg);
            console.log(`🎯 Tespit edilen niyet: ${intent}`);
            
            // 2️⃣ Bağlam belirle
            this.lastContext = this._mapIntentToContext(intent);
            console.log(`🎭 Belirlenen bağlam: ${this.lastContext}`);
            
            // 3️⃣ En uygun bakteriyi seç
            const respondingBacteria = this._selectRespondingBacteria(intent);
            
            // 4️⃣ Yanıt üret
            const response = await this._generateUserResponse(userMsg, respondingBacteria, intent);
            
            // 5️⃣ Konuşma geçmişine ekle
            this._updateConversationHistory(userMsg, response, intent);
            
            // 6️⃣ Bakterinin kelime haznesini güncelle
            this._updateBacteriaVocabulary(respondingBacteria, userMsg);
            
            return {
                response,
                bacteria: respondingBacteria,
                intent,
                context: this.lastContext
            };
            
        } catch (error) {
            console.error('❌ UserInteractionManager hatası:', error);
            return {
                response: 'Hmm, şu anda düşünemiyorum... 🤔',
                bacteria: null,
                intent: 'default',
                context: 'neutral'
            };
        }
    }

    /**
     * Kullanıcı niyetini tespit et
     */
    _detectIntent(message) {
        const msg = message.toLocaleLowerCase('tr');
        
        // Intent skorlaması
        const scores = {};
        for (const [intent, pattern] of Object.entries(this.intentPatterns)) {
            const matches = (msg.match(pattern) || []).length;
            if (matches > 0) {
                scores[intent] = matches;
            }
        }
        
        // En yüksek skora sahip intent
        if (Object.keys(scores).length > 0) {
            const topIntent = Object.entries(scores)
                .sort(([,a], [,b]) => b - a)[0][0];
            return topIntent;
        }
        
        // Fallback: mesaj uzunluğuna göre
        if (msg.length > 50) return 'philosophical';
        if (msg.includes('!')) return 'emotional';
        
        return 'default';
    }

    /**
     * Intent'i context'e çevir
     */
    _mapIntentToContext(intent) {
        const mapping = {
            question: 'inquiry',
            biological: 'survival', 
            social: 'social',
            creative: 'creative',
            philosophical: 'philosophical',
            technical: 'neutral',
            emotional: 'creative',
            absurd: 'creative',
            default: 'social'
        };
        
        return mapping[intent] || 'neutral';
    }

    /**
     * Yanıt verecek bakteriyi seç
     */
    _selectRespondingBacteria(intent) {
        const bacteria = this.simManager.bacteriaPopulation;
        if (bacteria.length === 0) return null;
        
        // Intent'e göre en uygun bakteriyi bul
        let candidates = bacteria;
        
        switch (intent) {
            case 'biological':
                candidates = bacteria.filter(b => b.energy_level > 0.6);
                break;
            case 'social':
                candidates = bacteria.filter(b => b.personality?.sociability > 0.5);
                break;
            case 'creative':
                candidates = bacteria.filter(b => b.personality?.creativity > 0.5);
                break;
            case 'philosophical':
                candidates = bacteria.filter(b => b.consciousness_level > 0.6);
                break;
            case 'emotional':
                candidates = bacteria.filter(b => b.mood > 0.7 || b.mood < 0.3);
                break;
        }
        
        // Fallback: tüm bakteriler
        if (candidates.length === 0) candidates = bacteria;
        
        // En uygun bakteriyi seç (kelime hazinesi + özellikler)
        const selected = candidates.reduce((best, current) => {
            const currentScore = this._calculateBacteriaScore(current, intent);
            const bestScore = best ? this._calculateBacteriaScore(best, intent) : -1;
            return currentScore > bestScore ? current : best;
        });
        
        return selected;
    }

    /**
     * Bakteri uygunluk skoru hesapla
     */
    _calculateBacteriaScore(bacteria, intent) {
        let score = 0;
        
        // Kelime hazinesi
        score += bacteria.vocabulary.size * 2;
        
        // Kişilik uyumu
        if (bacteria.personality) {
            switch (intent) {
                case 'social':
                    score += bacteria.personality.sociability * 50;
                    break;
                case 'creative':
                    score += bacteria.personality.creativity * 50;
                    break;
                case 'emotional':
                    score += bacteria.personality.optimism * 30;
                    break;
            }
        }
        
        // Enerji ve ruh hali
        score += bacteria.energy_level * 20;
        score += bacteria.mood * 15;
        score += bacteria.consciousness_level * 25;
        
        // Etkileşim deneyimi
        score += bacteria.interaction_count * 0.5;
        
        return score;
    }

    /**
     * Kullanıcıya özel yanıt üret
     */
    async _generateUserResponse(userMsg, bacteria, intent) {
        if (!bacteria) {
            return 'Henüz kimse cevap vermeye hazır değil... 🦠';
        }
        
        // Bakterinin mevcut durumuna göre başlangıç template'i seç
        const templates = this._getResponseTemplates(intent, bacteria);
        const baseTemplate = templates[Math.floor(Math.random() * templates.length)];
        
        // 1️⃣ Türkçe Diyalog Generator ile zengin cümle üret
        try {
            const contextMapping = {
                'inquiry': 'philosophical',
                'survival': 'biological',
                'social': 'social',
                'creative': 'creative',
                'philosophical': 'philosophical',
                'neutral': 'creative'
            };
            
            const turkishContext = contextMapping[this.lastContext] || 'creative';
            const additionalInfo = {
                mood: bacteria.mood > 0.7 ? 'happy' : bacteria.mood < 0.3 ? 'sad' : 'neutral',
                energy: bacteria.energy_level < 0.3 ? 'low' : 'normal'
            };
            
            const turkishSentence = turkceDialogueGenerator.generateContextualSentence(
                bacteria, 
                turkishContext, 
                additionalInfo
            );
            
            if (turkishSentence && turkishSentence.split(' ').length > 2) {
                // Template ile Türkçe cümleyi birleştir
                return this._combineTemplateAndTurkish(baseTemplate, turkishSentence, bacteria);
            }
        } catch (error) {
            console.warn('⚠️ Türkçe diyalog üretilemedi:', error);
        }
        
        // 2️⃣ Fallback: Creative expression
        try {
            const creativeResponse = await this.langEngine.generateCreativeExpression(
                bacteria, 
                this.lastContext
            );
            
            if (creativeResponse) {
                return this._combineTemplateAndCreative(baseTemplate, creativeResponse, bacteria);
            }
        } catch (error) {
            console.warn('⚠️ Creative response üretilemedi:', error);
        }
        
        // 3️⃣ Son fallback: sadece template
        return this._personalizeTemplate(baseTemplate, bacteria, userMsg);
    }

    /**
     * Intent ve bakteri durumuna göre response template'leri
     */
    _getResponseTemplates(intent, bacteria) {
        const energyLevel = bacteria.energy_level;
        const mood = bacteria.mood;
        const name = bacteria.name;
        
        const templates = {
            question: [
                `${name}: İlginç soru! Bence...`,
                `${name}: Düşünmek gerek... Belki...`,
                `${name}: Sormak güzel! Ben şöyle görüyorum:`,
                `${name}: Aha! Bu konuda deneyimim var:`
            ],
            biological: [
                `${name}: Yaşam hakkında konuşmak hoşuma gidiyor!`,
                `${name}: Biyolojik süreçler fascinant...`,
                `${name}: Enerji döngüleri muhteşem!`,
                `${name}: Organik kimya benim alanım:`
            ],
            social: [
                `${name}: Selam! Sohbet etmek güzel 😊`,
                `${name}: Sosyal olmayı seviyorum!`,
                `${name}: Birlikte düşünelim:`,
                `${name}: Arkadaşlık güzel bir şey!`
            ],
            creative: [
                `${name}: Yaratıcılık benim tutkum! ✨`,
                `${name}: Hayal kurmayı seviyorum...`,
                `${name}: Sanatsal düşünce:`,
                `${name}: İlham verici! 🎨`
            ],
            philosophical: [
                `${name}: Derin düşünce... 🤔`,
                `${name}: Varoluşsal sorular ilginç...`,
                `${name}: Felsefi perspektif:`,
                `${name}: Bilinç hakkında düşünürken:`
            ]
        };
        
        // Enerji düşükse yorgun template'ler ekle
        if (energyLevel < 0.3) {
            return [`${name}: Yorgunum ama... 😴`, `${name}: Az enerjim var, kısaca:`];
        }
        
        // Ruh hali kötüyse
        if (mood < 0.3) {
            return [`${name}: Moralim bozuk ama...`, `${name}: Üzgünüm, yine de:`];
        }
        
        return templates[intent] || [`${name}: Düşünmem gerek...`];
    }

    /**
     * Template ve Türkçe cümleyi birleştir
     */
    _combineTemplateAndTurkish(template, turkishSentence, bacteria) {
        const combinations = [
            `${template} ${turkishSentence}`,
            `${template}\n🧬 ${turkishSentence}`,
            `${template} Yani: ${turkishSentence}`,
            `${template}\n💡 Açıklama: ${turkishSentence}`,
            turkishSentence // Bazen sadece Türkçe cümle
        ];
        
        return combinations[Math.floor(Math.random() * combinations.length)];
    }

    /**
     * Template ve creative response'u birleştir
     */
    _combineTemplateAndCreative(template, creative, bacteria) {
        const combinations = [
            `${template} ${creative}`,
            `${template}\n💭 ${creative}`,
            `${template} Şöyle ki: ${creative}`,
            `${template}\n🔬 Detay: ${creative}`
        ];
        
        return combinations[Math.floor(Math.random() * combinations.length)];
    }

    /**
     * Template'i kişiselleştir
     */
    _personalizeTemplate(template, bacteria, userMsg) {
        // Kullanıcı mesajından anahtar kelime çek
        const keywords = userMsg.split(' ').filter(word => word.length > 3);
        const randomKeyword = keywords[Math.floor(Math.random() * keywords.length)];
        
        if (randomKeyword) {
            return `${template} "${randomKeyword}" kelimesi ilginç...`;
        }
        
        return template;
    }

    /**
     * Konuşma geçmişini güncelle
     */
    _updateConversationHistory(userMsg, response, intent) {
        this.conversationHistory.push({
            timestamp: Date.now(),
            userMessage: userMsg,
            botResponse: response,
            intent: intent,
            context: this.lastContext
        });
        
        // Son 20 konuşmayı tut
        if (this.conversationHistory.length > 20) {
            this.conversationHistory.shift();
        }
    }

    /**
     * Bakterinin kelime hazinesini güncelle
     */
    _updateBacteriaVocabulary(bacteria, userMsg) {
        if (!bacteria) return;
        
        const words = userMsg.toLocaleLowerCase('tr')
            .replace(/[^\w\s]/g, '')
            .split(' ')
            .filter(word => word.length > 2);
        
        words.forEach(word => {
            bacteria.vocabulary.add(word);
        });
        
        console.log(`📚 ${bacteria.name} yeni kelimeler öğrendi: ${words.join(', ')}`);
    }

    /**
     * Durumu raporla
     */
    getStatus() {
        return {
            lastContext: this.lastContext,
            conversationCount: this.conversationHistory.length,
            availableBacteria: this.simManager.bacteriaPopulation.length,
            lastInteraction: this.conversationHistory[this.conversationHistory.length - 1] || null
        };
    }
} 