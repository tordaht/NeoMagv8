/**
 * 🧠 Multi-Layer Consciousness Model for Bacteria
 * Implements a comprehensive consciousness system inspired by cognitive science
 */

class BacterialConsciousness {
    constructor(bacteriaId) {
        this.bacteriaId = bacteriaId;
        this.states = {
            // Temel ihtiyaçlar (Maslow'un hiyerarşisi inspired)
            survival: { 
                hunger: 0.5, 
                energy: 1.0, 
                safety: 0.8,
                health: 1.0,
                comfort: 0.7
            },
            
            // Sosyal bilinç
            social: { 
                loneliness: 0.3, 
                curiosity: 0.7, 
                empathy: 0.4,
                groupBelonging: 0.0,
                socialAnxiety: 0.2,
                trustLevel: 0.5,
                cooperativeness: 0.6
            },
            
            // Kognitif yetenekler
            cognitive: {
                memoryCapacity: 0.6,
                learningRate: 0.3,
                attentionSpan: 0.5,
                creativityLevel: 0.4,
                problemSolving: 0.3,
                patternRecognition: 0.4,
                abstractThinking: 0.2
            },
            
            // Duygusal durum
            emotional: {
                mood: 0.5, // -1 to 1 scale
                stress: 0.2,
                excitement: 0.3,
                confidence: 0.4,
                happiness: 0.6,
                fear: 0.1,
                anger: 0.0,
                surprise: 0.3
            },
            
            // Meta-bilişsel farkındalık
            metacognitive: {
                selfAwareness: 0.1,
                intentionality: 0.2,
                reflection: 0.1,
                planning: 0.3,
                evaluation: 0.2
            }
        };
        
        this.memories = new CircularBuffer(50); // Son 50 deneyim
        this.relationships = new Map(); // Diğer bakterilerle ilişkiler
        this.personalityTraits = this.generatePersonality();
        this.consciousnessLevel = 0;
        this.lastUpdate = Date.now();
        
        // Consciousness evolution tracking
        this.evolutionHistory = [];
        this.emergentBehaviors = new Set();
        this.thoughtPatterns = new Map();
    }
    
    generatePersonality() {
        return {
            openness: Math.random(),
            conscientiousness: Math.random(),
            extraversion: Math.random(),
            agreeableness: Math.random(),
            neuroticism: Math.random(),
            // Additional traits
            creativity: Math.random(),
            adventurousness: Math.random(),
            assertiveness: Math.random(),
            humor: Math.random(),
            patience: Math.random()
        };
    }
    
    updateConsciousness(environment, interactions) {
        const deltaTime = (Date.now() - this.lastUpdate) / 1000; // seconds
        
        // Çevresel faktörlere göre bilinç durumu güncelleme
        this.processEnvironmentalStimuli(environment, deltaTime);
        this.processSocialInteractions(interactions, deltaTime);
        this.updateEmotionalState(deltaTime);
        this.formMemories();
        this.evolveConsciousness(deltaTime);
        
        this.lastUpdate = Date.now();
        return this.getCurrentState();
    }
    
    processEnvironmentalStimuli(environment, deltaTime) {
        // Food availability affects hunger and energy
        if (environment.foodNearby) {
            this.states.survival.hunger = Math.max(0, this.states.survival.hunger - 0.1 * deltaTime);
            this.states.survival.energy = Math.min(1, this.states.survival.energy + 0.05 * deltaTime);
        } else {
            this.states.survival.hunger = Math.min(1, this.states.survival.hunger + 0.02 * deltaTime);
            this.states.survival.energy = Math.max(0, this.states.survival.energy - 0.01 * deltaTime);
        }
        
        // Danger affects safety and stress
        if (environment.dangerLevel > 0) {
            this.states.survival.safety = Math.max(0, this.states.survival.safety - environment.dangerLevel * deltaTime);
            this.states.emotional.stress = Math.min(1, this.states.emotional.stress + environment.dangerLevel * 0.5 * deltaTime);
            this.states.emotional.fear = Math.min(1, this.states.emotional.fear + environment.dangerLevel * deltaTime);
        } else {
            this.states.survival.safety = Math.min(1, this.states.survival.safety + 0.05 * deltaTime);
            this.states.emotional.stress = Math.max(0, this.states.emotional.stress - 0.02 * deltaTime);
            this.states.emotional.fear = Math.max(0, this.states.emotional.fear - 0.05 * deltaTime);
        }
        
        // Novelty affects curiosity and learning
        if (environment.noveltyLevel > 0) {
            this.states.social.curiosity = Math.min(1, this.states.social.curiosity + environment.noveltyLevel * 0.3 * deltaTime);
            this.states.cognitive.learningRate = Math.min(1, this.states.cognitive.learningRate + environment.noveltyLevel * 0.1 * deltaTime);
            this.states.emotional.surprise = Math.min(1, this.states.emotional.surprise + environment.noveltyLevel * 0.5 * deltaTime);
        }
    }
    
    processSocialInteractions(interactions, deltaTime) {
        if (!interactions || interactions.length === 0) {
            // Loneliness increases without interactions
            this.states.social.loneliness = Math.min(1, this.states.social.loneliness + 0.01 * deltaTime);
            this.states.social.groupBelonging = Math.max(0, this.states.social.groupBelonging - 0.02 * deltaTime);
            return;
        }
        
        interactions.forEach(interaction => {
            const { bacteriaId, type, quality } = interaction;
            
            // Update relationship
            if (!this.relationships.has(bacteriaId)) {
                this.relationships.set(bacteriaId, {
                    trust: 0.5,
                    affinity: 0.5,
                    interactions: 0,
                    lastInteraction: Date.now()
                });
            }
            
            const relationship = this.relationships.get(bacteriaId);
            relationship.interactions++;
            relationship.lastInteraction = Date.now();
            
            // Process interaction type
            switch (type) {
                case 'cooperation':
                    relationship.trust = Math.min(1, relationship.trust + 0.1 * quality);
                    relationship.affinity = Math.min(1, relationship.affinity + 0.05 * quality);
                    this.states.social.cooperativeness = Math.min(1, this.states.social.cooperativeness + 0.02);
                    this.states.emotional.happiness = Math.min(1, this.states.emotional.happiness + 0.03);
                    break;
                    
                case 'conflict':
                    relationship.trust = Math.max(0, relationship.trust - 0.15 * quality);
                    relationship.affinity = Math.max(0, relationship.affinity - 0.1 * quality);
                    this.states.emotional.anger = Math.min(1, this.states.emotional.anger + 0.1 * quality);
                    this.states.emotional.stress = Math.min(1, this.states.emotional.stress + 0.05 * quality);
                    break;
                    
                case 'communication':
                    relationship.affinity = Math.min(1, relationship.affinity + 0.03 * quality);
                    this.states.social.loneliness = Math.max(0, this.states.social.loneliness - 0.05);
                    this.states.cognitive.learningRate = Math.min(1, this.states.cognitive.learningRate + 0.01);
                    break;
                    
                case 'teaching':
                    relationship.trust = Math.min(1, relationship.trust + 0.05);
                    this.states.cognitive.learningRate = Math.min(1, this.states.cognitive.learningRate + 0.1 * quality);
                    this.states.social.empathy = Math.min(1, this.states.social.empathy + 0.02);
                    break;
            }
        });
        
        // Update group belonging based on relationships
        const avgTrust = Array.from(this.relationships.values())
            .reduce((sum, rel) => sum + rel.trust, 0) / Math.max(1, this.relationships.size);
        this.states.social.groupBelonging = avgTrust * 0.7 + this.states.social.cooperativeness * 0.3;
    }
    
    updateEmotionalState(deltaTime) {
        // Emotional homeostasis - emotions naturally decay toward neutral
        const decayRate = 0.01 * deltaTime;
        
        Object.keys(this.states.emotional).forEach(emotion => {
            if (emotion === 'mood') {
                // Mood is calculated from other emotions
                return;
            }
            
            // Decay toward neutral (0.3 for most emotions)
            const neutralPoint = emotion === 'happiness' ? 0.5 : 0.3;
            const current = this.states.emotional[emotion];
            
            if (current > neutralPoint) {
                this.states.emotional[emotion] = Math.max(neutralPoint, current - decayRate);
            } else if (current < neutralPoint) {
                this.states.emotional[emotion] = Math.min(neutralPoint, current + decayRate);
            }
        });
        
        // Calculate overall mood from emotional states
        const positiveEmotions = this.states.emotional.happiness + this.states.emotional.excitement + this.states.emotional.confidence;
        const negativeEmotions = this.states.emotional.stress + this.states.emotional.fear + this.states.emotional.anger;
        
        this.states.emotional.mood = (positiveEmotions - negativeEmotions) / 3;
        this.states.emotional.mood = Math.max(-1, Math.min(1, this.states.emotional.mood));
        
        // Personality affects emotional regulation
        if (this.personalityTraits.neuroticism < 0.3) {
            // Low neuroticism = better emotional regulation
            this.states.emotional.stress *= (1 - 0.1 * deltaTime);
            this.states.emotional.anger *= (1 - 0.1 * deltaTime);
        }
    }
    
    formMemories() {
        // Create episodic memory from current state
        const significance = this.calculateSignificance();
        
        if (significance > 0.3) { // Only remember significant moments
            const memory = {
                timestamp: Date.now(),
                states: JSON.parse(JSON.stringify(this.states)), // Deep copy
                significance: significance,
                context: this.getCurrentContext(),
                emotions: this.getEmotionalSnapshot()
            };
            
            this.memories.add(memory);
            
            // Extract patterns from memories
            this.extractThoughtPatterns();
        }
    }
    
    calculateSignificance() {
        // High emotions = high significance
        const emotionalIntensity = Object.values(this.states.emotional)
            .reduce((sum, val) => sum + Math.abs(val - 0.5), 0) / Object.keys(this.states.emotional).length;
        
        // Novel experiences = high significance
        const novelty = this.states.social.curiosity * 0.5 + this.states.emotional.surprise * 0.5;
        
        // Social interactions = moderate significance
        const socialSignificance = this.states.social.groupBelonging * 0.3;
        
        // Survival threats = very high significance
        const survivalThreat = (1 - this.states.survival.safety) * 0.8 + this.states.survival.hunger * 0.5;
        
        return Math.min(1, emotionalIntensity * 0.3 + novelty * 0.3 + socialSignificance * 0.2 + survivalThreat * 0.2);
    }
    
    getCurrentContext() {
        // Determine the primary context based on current states
        const contexts = [];
        
        if (this.states.survival.hunger > 0.7) contexts.push('hungry');
        if (this.states.survival.energy < 0.3) contexts.push('tired');
        if (this.states.survival.safety < 0.5) contexts.push('threatened');
        if (this.states.social.loneliness > 0.6) contexts.push('lonely');
        if (this.states.social.groupBelonging > 0.7) contexts.push('social');
        if (this.states.cognitive.learningRate > 0.7) contexts.push('learning');
        if (this.states.emotional.mood > 0.5) contexts.push('happy');
        if (this.states.emotional.mood < -0.3) contexts.push('sad');
        
        return contexts.length > 0 ? contexts : ['neutral'];
    }
    
    getEmotionalSnapshot() {
        return {
            dominant: this.getDominantEmotion(),
            intensity: this.getEmotionalIntensity(),
            valence: this.states.emotional.mood
        };
    }
    
    getDominantEmotion() {
        let maxEmotion = 'neutral';
        let maxValue = 0;
        
        Object.entries(this.states.emotional).forEach(([emotion, value]) => {
            if (emotion !== 'mood' && Math.abs(value - 0.5) > maxValue) {
                maxValue = Math.abs(value - 0.5);
                maxEmotion = emotion;
            }
        });
        
        return maxEmotion;
    }
    
    getEmotionalIntensity() {
        const values = Object.values(this.states.emotional);
        const avg = values.reduce((sum, val) => sum + val, 0) / values.length;
        const variance = values.reduce((sum, val) => sum + Math.pow(val - avg, 2), 0) / values.length;
        return Math.sqrt(variance); // Standard deviation as intensity measure
    }
    
    extractThoughtPatterns() {
        // Analyze memories for recurring patterns
        const recentMemories = this.memories.getAll().slice(-10); // Last 10 memories
        
        if (recentMemories.length < 3) return;
        
        // Look for emotional patterns
        const emotionalSequence = recentMemories.map(m => m.emotions.dominant);
        const emotionalPattern = this.findPattern(emotionalSequence);
        
        if (emotionalPattern) {
            this.thoughtPatterns.set('emotional', emotionalPattern);
        }
        
        // Look for context patterns
        const contextSequence = recentMemories.map(m => m.context[0]); // Primary context
        const contextPattern = this.findPattern(contextSequence);
        
        if (contextPattern) {
            this.thoughtPatterns.set('contextual', contextPattern);
        }
    }
    
    findPattern(sequence) {
        // Simple pattern detection - look for repetitions
        for (let length = 2; length <= Math.min(5, sequence.length / 2); length++) {
            for (let start = 0; start <= sequence.length - length * 2; start++) {
                const pattern = sequence.slice(start, start + length);
                const nextPattern = sequence.slice(start + length, start + length * 2);
                
                if (JSON.stringify(pattern) === JSON.stringify(nextPattern)) {
                    return pattern;
                }
            }
        }
        return null;
    }
    
    evolveConsciousness(deltaTime) {
        // Calculate consciousness level from all states
        const survivalScore = Object.values(this.states.survival).reduce((sum, val) => sum + val, 0) / 5;
        const socialScore = Object.values(this.states.social).reduce((sum, val) => sum + val, 0) / 7;
        const cognitiveScore = Object.values(this.states.cognitive).reduce((sum, val) => sum + val, 0) / 7;
        const emotionalBalance = 1 - Math.abs(this.states.emotional.mood);
        const metacognitiveScore = Object.values(this.states.metacognitive).reduce((sum, val) => sum + val, 0) / 5;
        
        // Weighted consciousness calculation
        const newConsciousness = (
            survivalScore * 0.15 +
            socialScore * 0.25 +
            cognitiveScore * 0.3 +
            emotionalBalance * 0.1 +
            metacognitiveScore * 0.2
        );
        
        // Smooth transition
        this.consciousnessLevel = this.consciousnessLevel * 0.9 + newConsciousness * 0.1;
        
        // Track evolution
        this.evolutionHistory.push({
            timestamp: Date.now(),
            level: this.consciousnessLevel,
            states: JSON.parse(JSON.stringify(this.states))
        });
        
        // Limit history size
        if (this.evolutionHistory.length > 100) {
            this.evolutionHistory.shift();
        }
        
        // Check for emergent behaviors
        this.checkEmergentBehaviors();
    }
    
    checkEmergentBehaviors() {
        // Self-awareness emerges at higher consciousness
        if (this.consciousnessLevel > 0.7 && !this.emergentBehaviors.has('self-awareness')) {
            this.emergentBehaviors.add('self-awareness');
            this.states.metacognitive.selfAwareness = 0.5;
            console.log(`🌟 Bacteria ${this.bacteriaId} achieved self-awareness!`);
        }
        
        // Empathy emerges from social interactions
        if (this.states.social.empathy > 0.7 && this.relationships.size > 3 && !this.emergentBehaviors.has('empathy')) {
            this.emergentBehaviors.add('empathy');
            console.log(`💝 Bacteria ${this.bacteriaId} developed empathy!`);
        }
        
        // Creative problem solving emerges from high cognitive + emotional balance
        if (this.states.cognitive.creativityLevel > 0.7 && Math.abs(this.states.emotional.mood) < 0.3 && !this.emergentBehaviors.has('creativity')) {
            this.emergentBehaviors.add('creativity');
            this.states.cognitive.problemSolving = Math.min(1, this.states.cognitive.problemSolving + 0.2);
            console.log(`🎨 Bacteria ${this.bacteriaId} unlocked creative thinking!`);
        }
        
        // Abstract thinking emerges from pattern recognition
        if (this.thoughtPatterns.size >= 2 && this.states.cognitive.patternRecognition > 0.6 && !this.emergentBehaviors.has('abstract-thinking')) {
            this.emergentBehaviors.add('abstract-thinking');
            this.states.cognitive.abstractThinking = 0.5;
            console.log(`🧩 Bacteria ${this.bacteriaId} developed abstract thinking!`);
        }
    }
    
    getCurrentState() {
        return {
            consciousnessLevel: this.consciousnessLevel,
            states: this.states,
            personality: this.personalityTraits,
            relationships: Array.from(this.relationships.entries()),
            emergentBehaviors: Array.from(this.emergentBehaviors),
            thoughtPatterns: Array.from(this.thoughtPatterns.entries()),
            dominantNeed: this.getDominantNeed(),
            emotionalState: this.getEmotionalSnapshot(),
            context: this.getCurrentContext()
        };
    }
    
    getDominantNeed() {
        const needs = {
            food: this.states.survival.hunger,
            rest: 1 - this.states.survival.energy,
            safety: 1 - this.states.survival.safety,
            social: this.states.social.loneliness,
            learning: this.states.social.curiosity,
            expression: this.states.cognitive.creativityLevel
        };
        
        let maxNeed = 'none';
        let maxValue = 0.3; // Threshold
        
        Object.entries(needs).forEach(([need, value]) => {
            if (value > maxValue) {
                maxValue = value;
                maxNeed = need;
            }
        });
        
        return maxNeed;
    }
}

// Helper class for circular buffer
class CircularBuffer {
    constructor(size) {
        this.size = size;
        this.buffer = [];
        this.index = 0;
    }
    
    add(item) {
        if (this.buffer.length < this.size) {
            this.buffer.push(item);
        } else {
            this.buffer[this.index] = item;
            this.index = (this.index + 1) % this.size;
        }
    }
    
    getAll() {
        return this.buffer.slice();
    }
    
    getLast(n) {
        return this.buffer.slice(-n);
    }
}

// Export for use in main system
if (typeof module !== 'undefined' && module.exports) {
    module.exports = BacterialConsciousness;
} 