/**
 * 🧠 AI Training Adapter - Bakterinin Bilinç Eğitim Sistemi
 * 
 * Consciousness training data kullanarak Enhanced TabPFN'i besler
 * Few-shot learning ve multilabel eğitim yaklaşımları
 */

import { generateMorphSentence, generateMorphDialogue, addCase, LEXICON } from './MorphologicalDialogueGenerator.js';

class AITrainingAdapter {
    constructor() {
        this.trainingData = null;
        this.fewShotTemplates = null;
        this.contextPatterns = new Map();
        this.successPatterns = new Map();
        this.emotionalPatterns = new Map();
        this.isLoaded = false;
        
        this.loadTrainingData();
    }

    async loadTrainingData() {
        try {
            const response = await fetch('/src/data/consciousness_training_data.json');
            const data = await response.json();
            
            this.trainingData = data.training_data;
            this.fewShotTemplates = data.few_shot_templates;
            this.metadata = data.metadata;
            
            this.analyzePatterns();
            this.isLoaded = true;
            
            console.log(`🧠 AI Training Data loaded: ${this.trainingData.length} examples`);
        } catch (error) {
            console.error('❌ AI Training Data loading failed:', error);
            this.createFallbackData();
        }
    }

    analyzePatterns() {
        // Enhanced pattern analysis with new data fields
        this.trainingData.forEach(item => {
            // Context patterns
            item.context.forEach(ctx => {
                if (!this.contextPatterns.has(ctx)) {
                    this.contextPatterns.set(ctx, {
                        examples: [],
                        avgSuccess: 0,
                        topWords: new Map(),
                        cognitiveProcesses: new Set(),
                        emotionalTones: new Set(),
                        avgConsciousness: 0,
                        avgValence: 0,
                        avgArousal: 0
                    });
                }
                
                const pattern = this.contextPatterns.get(ctx);
                pattern.examples.push(item);
                
                // Word weight analysis
                Object.entries(item.word_weights || {}).forEach(([word, weight]) => {
                    if (!pattern.topWords.has(word)) {
                        pattern.topWords.set(word, []);
                    }
                    pattern.topWords.get(word).push(weight);
                });
                
                // Cognitive process tracking
                if (item.cognitive_process) {
                    item.cognitive_process.forEach(proc => pattern.cognitiveProcesses.add(proc));
                }
                
                // Emotional tone tracking
                if (item.emotional_tone) {
                    pattern.emotionalTones.add(item.emotional_tone);
                }
            });

            // Emotional patterns
            const emotion = item.emotional_tone;
            if (!this.emotionalPatterns.has(emotion)) {
                this.emotionalPatterns.set(emotion, {
                    examples: [],
                    contexts: new Set(),
                    avgConsciousness: 0
                });
            }
            
            const emotionPattern = this.emotionalPatterns.get(emotion);
            emotionPattern.examples.push(item);
            item.context.forEach(ctx => emotionPattern.contexts.add(ctx));
        });

        // Calculate averages and enhanced metrics
        this.contextPatterns.forEach((pattern, ctx) => {
            const examples = pattern.examples;
            const exampleCount = examples.length;
            
            // Success rate calculation
            pattern.avgSuccess = examples.reduce((sum, ex) => {
                return sum + (ex.success_rate || this.getSuccessValue(ex.success_prediction));
            }, 0) / exampleCount;

            // Consciousness level average
            pattern.avgConsciousness = examples.reduce((sum, ex) => 
                sum + (ex.consciousness_level || 0.5), 0) / exampleCount;
                
            // Emotional metrics
            pattern.avgValence = examples.reduce((sum, ex) => 
                sum + (ex.valence || 0), 0) / exampleCount;
                
            pattern.avgArousal = examples.reduce((sum, ex) => 
                sum + (ex.arousal || 0.5), 0) / exampleCount;

            // Average word weights
            pattern.topWords.forEach((weights, word) => {
                const avg = weights.reduce((a, b) => a + b, 0) / weights.length;
                pattern.topWords.set(word, avg);
            });
        });

        this.emotionalPatterns.forEach((pattern, emotion) => {
            pattern.avgConsciousness = pattern.examples.reduce((sum, ex) => 
                sum + ex.consciousness_level, 0) / pattern.examples.length;
        });
    }

    getSuccessValue(prediction) {
        const values = {
            'very_high': 1.0,
            'high': 0.8,
            'medium': 0.6,
            'learning_experience': 0.4,
            'low': 0.2
        };
        return values[prediction] || 0.5;
    }

    /**
     * Enhanced context-aware word suggestion with cognitive processes
     */
    suggestWordForContext(context, currentConsciousness = 0.5, cognitiveState = null) {
        if (!this.isLoaded) return null;

        // Multi-criteria filtering
        const relevantExamples = this.trainingData.filter(item => {
            const contextMatch = item.context.includes(context);
            const consciousnessMatch = Math.abs(item.consciousness_level - currentConsciousness) < 0.3;
            
            // Optional cognitive state matching
            let cognitiveMatch = true;
            if (cognitiveState && item.cognitive_process) {
                cognitiveMatch = item.cognitive_process.some(proc => 
                    proc.includes(cognitiveState) || cognitiveState.includes(proc)
                );
            }
            
            return contextMatch && consciousnessMatch && cognitiveMatch;
        });

        if (relevantExamples.length === 0) return null;

        // Enhanced word candidate analysis
        const wordCandidates = new Map();
        
        relevantExamples.forEach(example => {
            if (example.word_weights) {
                Object.entries(example.word_weights).forEach(([word, weight]) => {
                    if (weight > 0.6) { // Only high-confidence words
                        if (!wordCandidates.has(word)) {
                            wordCandidates.set(word, {
                                weight: 0,
                                count: 0,
                                examples: [],
                                cognitiveProcesses: new Set(),
                                avgValence: 0,
                                avgArousal: 0,
                                morphFeatures: new Set()
                            });
                        }
                        
                        const candidate = wordCandidates.get(word);
                        candidate.weight += weight;
                        candidate.count++;
                        candidate.examples.push(example);
                        
                        // Enhanced features
                        if (example.cognitive_process) {
                            example.cognitive_process.forEach(proc => candidate.cognitiveProcesses.add(proc));
                        }
                        candidate.avgValence += (example.valence || 0);
                        candidate.avgArousal += (example.arousal || 0.5);
                        
                        // Morphological features
                        if (example.morph_analysis) {
                            example.morph_analysis.forEach(morph => {
                                if (morph.token === word || morph.root === word) {
                                    morph.tags?.forEach(tag => candidate.morphFeatures.add(tag));
                                }
                            });
                        }
                    }
                });
            }
        });

        // Enhanced scoring algorithm
        let bestWord = null;
        let bestScore = 0;

        wordCandidates.forEach((data, word) => {
            const avgWeight = data.weight / data.count;
            const frequency = data.count / relevantExamples.length;
            const avgValence = data.avgValence / data.count;
            const avgArousal = data.avgArousal / data.count;
            
            // Multi-factor scoring
            const baseScore = avgWeight * 0.5 + frequency * 0.3;
            const emotionalBonus = Math.abs(avgValence) * 0.1; // Emotional intensity bonus
            const cognitiveBonus = data.cognitiveProcesses.size * 0.05; // Cognitive richness
            const morphBonus = data.morphFeatures.size * 0.02; // Morphological diversity
            
            const totalScore = baseScore + emotionalBonus + cognitiveBonus + morphBonus;
            
            if (totalScore > bestScore) {
                bestScore = totalScore;
                bestWord = {
                    word,
                    confidence: avgWeight,
                    frequency,
                    totalScore,
                    cognitiveProcesses: Array.from(data.cognitiveProcesses),
                    emotionalProfile: { valence: avgValence, arousal: avgArousal },
                    morphFeatures: Array.from(data.morphFeatures),
                    examples: data.examples.slice(0, 2)
                };
            }
        });

        return bestWord;
    }

    /**
     * Generate enhanced few-shot prompt with cognitive and morphological awareness
     */
    generateFewShotPrompt(targetContext, targetEmotion = null, targetCognitive = null) {
        if (!this.isLoaded) return '';

        let examples = this.trainingData.filter(item => 
            item.context.includes(targetContext)
        );

        if (targetEmotion) {
            examples = examples.filter(item => 
                item.emotional_tone === targetEmotion
            );
        }

        if (targetCognitive) {
            examples = examples.filter(item => 
                item.cognitive_process && item.cognitive_process.includes(targetCognitive)
            );
        }

        // Enhanced selection criteria
        examples = examples
            .filter(ex => ex.consciousness_level > 0.4)
            .sort((a, b) => {
                // Multi-criteria sorting
                const consciousnessScore = b.consciousness_level - a.consciousness_level;
                const complexityScore = (b.complexity === 'complex' ? 3 : b.complexity === 'medium' ? 2 : 1) -
                                      (a.complexity === 'complex' ? 3 : a.complexity === 'medium' ? 2 : 1);
                const cognitiveScore = (b.cognitive_process?.length || 0) - (a.cognitive_process?.length || 0);
                
                return consciousnessScore * 0.5 + complexityScore * 0.3 + cognitiveScore * 0.2;
            })
            .slice(0, 4); // Increased to 4 examples

        let prompt = `🧠 Bakterinin Gelişmiş Bilinç Örnekleri:\n\n`;

        examples.forEach((example, index) => {
            const mechanism = example.mechanisms[0] || 'Unknown';
            const wordExample = Object.keys(example.word_weights || {})[0] || 'kelime';
            const cognitiveProcs = example.cognitive_process?.join(', ') || 'basic_processing';
            const emotionalTone = example.emotional_tone || 'neutral';
            
            prompt += `Örnek ${index + 1} [${example.context.join(', ')}]:\n`;
            
            // Handle dialogue vs single text
            if (Array.isArray(example.text)) {
                prompt += `  Diyalog: ${example.text.join(' / ')}\n`;
                prompt += `  Cooperasyon: ${example.dialogue_structure?.cooperation_level || 'medium'}\n`;
            } else {
                prompt += `  Metin: "${example.text}"\n`;
            }
            
            prompt += `  Kelime: "${wordExample}" → ${example.success_prediction} (${(example.success_rate || 0.5).toFixed(2)})\n`;
            prompt += `  Bilinç: ${example.consciousness_level} | Ton: ${emotionalTone}\n`;
            prompt += `  Kognitif: ${cognitiveProcs}\n`;
            prompt += `  Eylem: ${example.action_type?.join(', ') || 'reflection'}\n`;
            
            if (example.valence !== undefined && example.arousal !== undefined) {
                prompt += `  Duygusal: valence=${example.valence.toFixed(1)}, arousal=${example.arousal.toFixed(1)}\n`;
            }
            
            prompt += `  Mekanizma: ${mechanism}\n\n`;
        });

        prompt += `🎯 Yeni İçerik Üret:\n`;
        prompt += `Context: ${targetContext}\n`;
        if (targetEmotion) prompt += `Emotion: ${targetEmotion}\n`;
        if (targetCognitive) prompt += `Cognitive Process: ${targetCognitive}\n`;
        prompt += `Consciousness Level: 0.6-0.9 arası\n`;
        prompt += `Türkçe morfoloji kurallarına uygun, anlamlı ve yaratıcı olsun.\n`;

        return prompt;
    }

    /**
     * Predict word success based on training patterns
     */
    predictWordSuccess(word, context, emotionalTone) {
        if (!this.isLoaded) return 0.5;

        const contextPattern = this.contextPatterns.get(context);
        if (!contextPattern) return 0.5;

        const wordWeight = contextPattern.topWords.get(word);
        if (!wordWeight) return 0.4; // Unknown words get lower prediction

        const emotionPattern = this.emotionalPatterns.get(emotionalTone);
        const emotionBonus = emotionPattern && emotionPattern.contexts.has(context) ? 0.1 : 0;

        return Math.min(1.0, wordWeight + emotionBonus);
    }

    /**
     * Get learning insights for specific context
     */
    getLearningInsights(context) {
        if (!this.isLoaded) return null;

        const pattern = this.contextPatterns.get(context);
        if (!pattern) return null;

        const topWords = Array.from(pattern.topWords.entries())
            .sort(([,a], [,b]) => b - a)
            .slice(0, 5)
            .map(([word, weight]) => ({ word, weight: weight.toFixed(2) }));

        return {
            context,
            totalExamples: pattern.examples.length,
            avgSuccess: pattern.avgSuccess.toFixed(2),
            topWords,
            successfulExamples: pattern.examples
                .filter(ex => this.getSuccessValue(ex.success_prediction) > 0.7)
                .map(ex => ex.text)
                .slice(0, 3)
        };
    }

    createFallbackData() {
        // Minimal fallback data if file loading fails
        this.trainingData = [
            {
                text: "İlk anım bir titreşimdi",
                context: ["philosophical"],
                word_weights: { "titreşim": 0.9, "anı": 0.8 },
                success_prediction: "high",
                consciousness_level: 0.5
            }
        ];
        this.isLoaded = true;
        console.log('🔄 Using fallback training data');
    }

    /**
     * Enhanced TabPFN entegrasyonu için training weights
     */
    getTrainingWeightsForLayer(layerName) {
        if (!this.isLoaded) return {};

        const relevantExamples = this.trainingData.filter(item =>
            item.layers.includes(layerName.toLowerCase())
        );

        const weights = {};
        relevantExamples.forEach(example => {
            if (example.word_weights) {
                Object.entries(example.word_weights).forEach(([word, weight]) => {
                    if (!weights[word]) weights[word] = [];
                    weights[word].push(weight);
                });
            }
        });

        // Average the weights
        Object.keys(weights).forEach(word => {
            const avgWeight = weights[word].reduce((a, b) => a + b, 0) / weights[word].length;
            weights[word] = avgWeight;
        });

        return weights;
    }

    getSystemStatus() {
        if (!this.isLoaded) return { status: 'loading' };

        return {
            status: 'active',
            trainingExamples: this.trainingData.length,
            contexts: Array.from(this.contextPatterns.keys()),
            emotions: Array.from(this.emotionalPatterns.keys()),
            topContexts: Array.from(this.contextPatterns.entries())
                .sort(([,a], [,b]) => b.avgSuccess - a.avgSuccess)
                .slice(0, 3)
                .map(([ctx, data]) => ({ 
                    context: ctx, 
                    avgSuccess: data.avgSuccess.toFixed(2),
                    examples: data.examples.length 
                }))
        };
    }

    /**
     * 🔥 NEW: Morphological Dialogue Generation Integration
     * Training data ile morfolojik cümle üretimini birleştirir
     */
    async generateTrainingAwareMorphSentence(context, consciousnessLevel = 0.5, emotionalTone = null) {
        if (!this.isLoaded) {
            // Fallback to basic morphological generation
            return await generateMorphSentence(null, 'simple');
        }

        // Context ve bilinç seviyesine uygun örnekleri filtrele
        const relevantExamples = this.trainingData.filter(item => {
            const contextMatch = item.context.includes(context);
            const consciousnessMatch = Math.abs(item.consciousness_level - consciousnessLevel) < 0.4;
            const emotionMatch = !emotionalTone || item.emotional_tone === emotionalTone;
            
            return contextMatch && consciousnessMatch && emotionMatch;
        });

        // Enhanced sentence type selection based on training data
        let sentenceType = 'simple';
        if (relevantExamples.length > 0) {
            const complexExamples = relevantExamples.filter(ex => ex.complexity === 'complex');
            const emotionalExamples = relevantExamples.filter(ex => 
                ex.emotional_tone && ex.emotional_tone !== 'neutral'
            );
            
            if (complexExamples.length > 0) {
                sentenceType = Math.random() > 0.5 ? 'complex' : 'locative';
            } else if (emotionalExamples.length > 0) {
                sentenceType = 'emotional';
            }
        }

        // Generate morphological sentence with training context
        const contextEmbed = this.createContextEmbedding(relevantExamples);
        return await generateMorphSentence(contextEmbed, sentenceType);
    }

    /**
     * Enhanced dialogue generation with training awareness
     */
    async generateTrainingAwareMorphDialogue(context, sentences = 3, consciousnessLevel = 0.5) {
        if (!this.isLoaded) {
            return await generateMorphDialogue(sentences);
        }

        const dialogue = [];
        const relevantExamples = this.trainingData.filter(item => 
            item.context.includes(context) && 
            Math.abs(item.consciousness_level - consciousnessLevel) < 0.3
        );

        // Generate contextually aware sentences
        for (let i = 0; i < sentences; i++) {
            const emotionalTone = this.selectContextualEmotion(relevantExamples);
            const sentence = await this.generateTrainingAwareMorphSentence(
                context, 
                consciousnessLevel, 
                emotionalTone
            );
            dialogue.push(sentence);
        }

        return dialogue.join(' ');
    }

    /**
     * Training data'dan morfolojik case selection
     */
    getTrainingAwareCaseForWord(word, context, role = 'nom') {
        if (!this.isLoaded) {
            return addCase(word, role);
        }

        // Training data'da bu kelime nasıl kullanılmış?
        const relevantExamples = this.trainingData.filter(item => {
            if (!item.morph_analysis) return false;
            return item.morph_analysis.some(morph => 
                morph.token === word || morph.root === word
            );
        });

        if (relevantExamples.length > 0) {
            // Most common case usage in training data
            const caseCounts = {};
            relevantExamples.forEach(example => {
                example.morph_analysis.forEach(morph => {
                    if (morph.token === word || morph.root === word) {
                        morph.tags?.forEach(tag => {
                            if (tag.includes('Case:')) {
                                const caseType = tag.split(':')[1];
                                caseCounts[caseType] = (caseCounts[caseType] || 0) + 1;
                            }
                        });
                    }
                });
            });

            // Select most frequent case, fallback to requested role
            const mostFrequentCase = Object.keys(caseCounts)
                .sort((a, b) => caseCounts[b] - caseCounts[a])[0];

            if (mostFrequentCase) {
                const caseMapping = {
                    'Nom': 'nom',
                    'Acc': 'acc', 
                    'Dat': 'dat',
                    'Loc': 'loc',
                    'Abl': 'abl',
                    'Gen': 'gen'
                };
                role = caseMapping[mostFrequentCase] || role;
            }
        }

        return addCase(word, role);
    }

    /**
     * Training data'dan emotional context seçimi
     */
    selectContextualEmotion(relevantExamples) {
        if (relevantExamples.length === 0) return null;

        const emotionCounts = {};
        relevantExamples.forEach(example => {
            const emotion = example.emotional_tone;
            if (emotion) {
                emotionCounts[emotion] = (emotionCounts[emotion] || 0) + 1;
            }
        });

        const emotions = Object.keys(emotionCounts);
        if (emotions.length === 0) return null;

        // Weighted random selection
        const totalCount = Object.values(emotionCounts).reduce((a, b) => a + b, 0);
        let random = Math.random() * totalCount;

        for (const emotion of emotions) {
            random -= emotionCounts[emotion];
            if (random <= 0) {
                return emotion;
            }
        }

        return emotions[0]; // fallback
    }

    /**
     * Create pseudo context embedding from training examples
     */
    createContextEmbedding(relevantExamples) {
        if (relevantExamples.length === 0) return null;

        // Simple context representation
        const wordFrequencies = {};
        relevantExamples.forEach(example => {
            if (example.word_weights) {
                Object.entries(example.word_weights).forEach(([word, weight]) => {
                    wordFrequencies[word] = (wordFrequencies[word] || 0) + weight;
                });
            }
        });

        return {
            topWords: Object.entries(wordFrequencies)
                .sort(([,a], [,b]) => b - a)
                .slice(0, 10)
                .map(([word, freq]) => ({ word, frequency: freq })),
            avgConsciousness: relevantExamples.reduce((sum, ex) => 
                sum + ex.consciousness_level, 0) / relevantExamples.length,
            dominantEmotion: this.selectContextualEmotion(relevantExamples)
        };
    }

    /**
     * Test morphological integration
     */
    async testMorphologicalIntegration() {
        console.log('🔧 Testing Morphological Integration...\n');

        // Test contexts from training data
        const testContexts = ['philosophical', 'social', 'self-reflection', 'creative'];
        
        for (const context of testContexts) {
            if (this.contextPatterns.has(context)) {
                console.log(`Context: ${context}`);
                
                const sentence = await this.generateTrainingAwareMorphSentence(context, 0.7);
                console.log(`  Generated: ${sentence}`);
                
                const dialogue = await this.generateTrainingAwareMorphDialogue(context, 2, 0.6);
                console.log(`  Dialogue: ${dialogue}`);
                console.log('');
            }
        }

        // Test morphological case selection
        const testWords = ['bakteri', 'enerji', 'düşünce'];
        console.log('Morphological Case Testing:');
        testWords.forEach(word => {
            const cases = ['nom', 'acc', 'dat', 'loc'];
            cases.forEach(role => {
                const result = this.getTrainingAwareCaseForWord(word, 'philosophical', role);
                console.log(`  ${word} (${role}): ${result}`);
            });
        });
    }
}

export default AITrainingAdapter;

// Expose globally for non-module loaders
if (typeof window !== 'undefined') {
    window.AITrainingAdapter = AITrainingAdapter;
}
