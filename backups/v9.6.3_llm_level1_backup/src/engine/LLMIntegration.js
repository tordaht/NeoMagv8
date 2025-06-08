// LLM Integration for mnBac v9.6.3+
// Multi-tier AI system for bacteria consciousness levels

class LLMIntegration {
    constructor() {
        this.transformers = null;
        this.initializeTransformers();
        
        this.apiKeys = {
            openai: localStorage.getItem('mnbac_openai_key'),
            huggingface: localStorage.getItem('mnbac_hf_key')
        };
        
        this.models = {
            light: 'Xenova/distilgpt2',
            medium: 'microsoft/DialoGPT-medium',
            heavy: 'microsoft/DialoGPT-large',
            turkish: 'dbmdz/bert-base-turkish-cased',
            conversational: 'facebook/blenderbot-400M-distill'
        };
        
        // HuggingFace modellerini consciousness seviyesine göre optimize et
        this.hfModels = {
            basic: 'microsoft/DialoGPT-small',      // 0-20 consciousness  
            medium: 'microsoft/DialoGPT-medium',    // 20-50 consciousness
            advanced: 'facebook/blenderbot-400M-distill', // 50-80 consciousness
            expert: 'microsoft/DialoGPT-large'     // 80+ consciousness
        };
    }

    async initializeTransformers() {
        try {
            const { pipeline } = await import('https://cdn.jsdelivr.net/npm/@xenova/transformers@2.6.0');
            this.transformers = pipeline;
            console.log('🤖 Transformers.js loaded successfully');
        } catch (error) {
            console.warn('⚠️ Transformers.js failed to load:', error);
        }
    }

    // Consciousness-based HuggingFace model selection
    selectHFModel(consciousnessLevel) {
        if (consciousnessLevel < 20) return this.hfModels.basic;
        if (consciousnessLevel < 50) return this.hfModels.medium;
        if (consciousnessLevel < 80) return this.hfModels.advanced;
        return this.hfModels.expert;
    }
    
    // Legacy model selection (for fallback)
    selectModel(consciousnessLevel) {
        if (consciousnessLevel < 20) return 'light';
        if (consciousnessLevel < 60) return 'medium';
        return 'heavy';
    }

    // Level 1: Client-side Transformers.js
    async generateWithTransformers(prompt, maxLength = 50) {
        if (!this.transformers) return null;
        
        try {
            const generator = await this.transformers('text-generation', this.models.light);
            const result = await generator(prompt, {
                max_length: maxLength,
                do_sample: true,
                temperature: 0.8,
                pad_token_id: 50256
            });
            
            return result[0].generated_text.replace(prompt, '').trim();
        } catch (error) {
            console.error('Transformers.js error:', error);
            return null;
        }
    }

    // Level 2: Enhanced HuggingFace Inference API (MAIN SYSTEM)
    async generateWithHuggingFace(prompt, bacteriaContext) {
        // API key yoksa ücretsiz modeli dene
        const useAuth = !!this.apiKeys.huggingface;
        const model = this.selectHFModel(bacteriaContext.consciousness || 0);
        
        try {
            const headers = {
                'Content-Type': 'application/json'
            };
            
            if (useAuth) {
                headers['Authorization'] = `Bearer ${this.apiKeys.huggingface}`;
            }
            
            // Bakteriye özel prompt hazırla
            const bacteriaPrompt = this.prepareBacteriaPrompt(prompt, bacteriaContext);
            
            const response = await fetch(`https://api-inference.huggingface.co/models/${model}`, {
                method: 'POST',
                headers,
                body: JSON.stringify({
                    inputs: bacteriaPrompt,
                    parameters: {
                        max_length: bacteriaContext.consciousness > 50 ? 120 : 80,
                        temperature: Math.min(0.9, 0.5 + bacteriaContext.consciousness / 100),
                        do_sample: true,
                        top_p: 0.9,
                        repetition_penalty: 1.1
                    }
                })
            });
            
            if (!response.ok) {
                console.warn(`HuggingFace API returned ${response.status}, trying fallback...`);
                return await this.tryFallbackModel(bacteriaPrompt, bacteriaContext);
            }
            
            const result = await response.json();
            let generatedText = '';
            
            // Farklı response formatlarını handle et
            if (Array.isArray(result)) {
                generatedText = result[0]?.generated_text || '';
            } else if (result.generated_text) {
                generatedText = result.generated_text;
            } else {
                console.warn('Unexpected HF response format:', result);
                return null;
            }
            
            // Original prompt'u temizle ve bacteria response'u al
            const cleanResponse = generatedText.replace(bacteriaPrompt, '').trim();
            return this.cleanBacteriaResponse(cleanResponse, bacteriaContext);
            
        } catch (error) {
            console.error('HuggingFace API error:', error);
            return await this.tryFallbackModel(prompt, bacteriaContext);
        }
    }
    
    // Bacteria-specific prompt preparation
    prepareBacteriaPrompt(userMessage, bacteriaContext) {
        const consciousnessDesc = bacteriaContext.consciousness > 50 ? "yüksek bilinçli" : 
                                 bacteriaContext.consciousness > 20 ? "orta bilinçli" : "basit";
        
        return `Bakteri ${bacteriaContext.name} (${consciousnessDesc}, enerji: ${bacteriaContext.energy}%)
İnsan: ${userMessage}
Bakteri ${bacteriaContext.name}:`;
    }
    
    // Fallback model deneme sistemi
    async tryFallbackModel(prompt, bacteriaContext) {
        const fallbackModels = [
            'microsoft/DialoGPT-small',
            'facebook/blenderbot-400M-distill', 
            'distilgpt2'
        ];
        
        for (const model of fallbackModels) {
            try {
                const response = await fetch(`https://api-inference.huggingface.co/models/${model}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        inputs: prompt,
                        parameters: { max_length: 60, temperature: 0.7 }
                    })
                });
                
                if (response.ok) {
                    const result = await response.json();
                    const text = result[0]?.generated_text || result.generated_text || '';
                    return this.cleanBacteriaResponse(text.replace(prompt, '').trim(), bacteriaContext);
                }
            } catch (e) {
                continue; // Try next model
            }
        }
        
        return null; // All fallbacks failed
    }
    
    // Response temizleme ve bacteria-appropriate hale getirme
    cleanBacteriaResponse(response, bacteriaContext) {
        if (!response) return null;
        
        // Truncate if too long
        if (response.length > 150) {
            response = response.substring(0, 147) + "...";
        }
        
        // Remove inappropriate content
        response = response.replace(/Human:|İnsan:|Bacteria:|Bakteri:/gi, '');
        
        // Add bacteria personality touch
        if (bacteriaContext.consciousness < 15) {
            response = response.toLowerCase() + " 🦠";
        } else if (bacteriaContext.consciousness > 70) {
            response += " 🧬✨";
        }
        
        return response.trim();
    }

    // Level 3: OpenAI GPT
    async generateWithOpenAI(messages, bacteriaContext) {
        if (!this.apiKeys.openai) return null;
        
        try {
            const systemPrompt = `You are a bacteria named ${bacteriaContext.name} with consciousness level ${bacteriaContext.consciousness}. 
                Your energy is ${bacteriaContext.energy}, mood is ${bacteriaContext.mood}.
                Respond in Turkish, as a bacteria would think and speak.
                Keep responses under 50 words and bacteria-appropriate.`;
            
            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.apiKeys.openai}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: 'gpt-3.5-turbo',
                    messages: [
                        { role: 'system', content: systemPrompt },
                        ...messages
                    ],
                    max_tokens: 100,
                    temperature: 0.7
                })
            });
            
            const result = await response.json();
            return result.choices[0]?.message?.content;
        } catch (error) {
            console.error('OpenAI API error:', error);
            return null;
        }
    }

    // Main generation function - HuggingFace Level 2 Primary
    async generateBacteriaResponse(userMessage, bacteriaContext) {
        const consciousnessLevel = bacteriaContext.consciousness || 0;
        let response = null;
        
        console.log(`🤖 Generating response for ${bacteriaContext.name} (consciousness: ${consciousnessLevel}%)`);
        
        // PRIMARY: HuggingFace Inference API (Level 2)
        try {
            response = await this.generateWithHuggingFace(userMessage, bacteriaContext);
            if (response && response.length > 3) {
                console.log('✅ HuggingFace generation successful');
                return response;
            }
        } catch (error) {
            console.warn('⚠️ HuggingFace failed, trying fallbacks...', error);
        }
        
        // FALLBACK 1: Client-side Transformers.js (Level 1)
        try {
            const prompt = `Human: ${userMessage}\nBacteria ${bacteriaContext.name}:`;
            response = await this.generateWithTransformers(prompt, 60);
            if (response && response.length > 3) {
                console.log('✅ Transformers.js fallback successful');
                return this.postProcessResponse(response, bacteriaContext);
            }
        } catch (error) {
            console.warn('⚠️ Transformers.js fallback failed', error);
        }
        
        // FALLBACK 2: Template-based local generation
        response = this.generateFallbackResponse(userMessage, bacteriaContext);
        console.log('📝 Using template fallback');
        
        return this.postProcessResponse(response, bacteriaContext);
    }

    generateFallbackResponse(userMessage, bacteriaContext) {
        const templates = [
            "Mikroskobik düşüncelerim var bu konuda...",
            "Hücresel seviyede bu soruyu değerlendiriyorum...",
            "Bilinç seviyem " + Math.round(bacteriaContext.consciousness) + "%, bu yeterli mi?",
            "Arkadaş, ben sadece bir bakteriyim ama...",
            "ATP üretirken bu konuyu düşünüyordum..."
        ];
        
        return templates[Math.floor(Math.random() * templates.length)];
    }

    postProcessResponse(response, bacteriaContext) {
        if (!response) return "...";
        
        // Length limit
        if (response.length > 200) {
            response = response.substring(0, 197) + "...";
        }
        
        // Add bacteria-specific touches based on consciousness
        if (bacteriaContext.consciousness < 10) {
            response = response.toLowerCase();
        } else if (bacteriaContext.consciousness > 80) {
            response += " 🧬";
        }
        
        return response;
    }

    // API key management
    setAPIKey(service, key) {
        this.apiKeys[service] = key;
        localStorage.setItem(`mnbac_${service}_key`, key);
        console.log(`✅ ${service} API key saved`);
    }

    // Usage statistics
    getUsageStats() {
        return {
            transformersAvailable: !!this.transformers,
            huggingfaceConfigured: !!this.apiKeys.huggingface,
            openaiConfigured: !!this.apiKeys.openai,
            recommendedSetup: !this.apiKeys.openai ? 'Consider adding OpenAI API key for best results' : 'Fully configured'
        };
    }
}

// Global instance
window.llmIntegration = new LLMIntegration();

export default LLMIntegration; 