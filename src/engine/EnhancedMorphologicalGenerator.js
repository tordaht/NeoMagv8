/**
 * 🦠 Simple Morphological Generator v9.7.1
 * Lightweight Turkish morphology for mnBac simulation
 */

// Simple Turkish Lexicon
class SimpleLexicon {
    constructor() {
        this.baseWords = {
            subjects: ['bakteri', 'hücre', 'mikrob', 'organizma', 'yaşam'],
            verbs: ['yaşıyor', 'büyüyor', 'hareket ediyor', 'besiniyor', 'gelişiyor'],
            objects: ['enerji', 'besin', 'su', 'oksijen', 'karbon'],
            emotions: ['mutlu', 'sakin', 'aktif', 'dinç', 'canlı'],
            locations: ['petri', 'sıvı', 'ortam', 'yüzey', 'merkez']
        };
    }
    
    getWords(category) {
        return this.baseWords[category] || [];
    }
    
    addWord(category, word) {
        if (this.baseWords[category]) {
            this.baseWords[category].push(word);
        }
    }
}

// Simple Turkish Morphology
class SimpleMorphology {
    constructor() {
        this.vowelHarmony = {
            back: ['a', 'ı', 'o', 'u'],
            front: ['e', 'i', 'ö', 'ü']
        };
    }
    
    getLastVowel(word) {
        for (let i = word.length - 1; i >= 0; i--) {
            const char = word[i].toLowerCase();
            if ([...this.vowelHarmony.back, ...this.vowelHarmony.front].includes(char)) {
                return char;
            }
        }
        return 'a';
    }
    
    isBackVowel(vowel) {
        return this.vowelHarmony.back.includes(vowel);
    }
    
    addCase(word, caseType = 'nom') {
        if (caseType === 'nom') return word;
        
        const lastVowel = this.getLastVowel(word);
        const isBack = this.isBackVowel(lastVowel);
        
        switch (caseType) {
            case 'acc': // -ı/-i
                return word + (isBack ? 'ı' : 'i');
            case 'dat': // -a/-e  
                return word + (isBack ? 'a' : 'e');
            case 'loc': // -da/-de
                return word + (isBack ? 'da' : 'de');
            default:
                return word;
        }
    }
}

// Simple Sentence Generator
class SimpleSentenceGenerator {
    constructor() {
        this.lexicon = new SimpleLexicon();
        this.morphology = new SimpleMorphology();
        
        this.templates = [
            '{subject} {verb}',
            '{subject} {object} {verb}',
            '{subject} {location} {verb}'
        ];
    }
    
    randomChoice(arr) {
        return arr[Math.floor(Math.random() * arr.length)];
    }
    
    capitalize(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }
    
    generateSentence(type = 'simple') {
        const template = this.randomChoice(this.templates);
        let sentence = template;
        
        // Subject
        const subject = this.randomChoice(this.lexicon.getWords('subjects'));
        sentence = sentence.replace('{subject}', this.capitalize(subject));
        
        // Object (with accusative case if present)
        if (sentence.includes('{object}')) {
            const objectBase = this.randomChoice(this.lexicon.getWords('objects'));
            const object = this.morphology.addCase(objectBase, 'acc');
            sentence = sentence.replace('{object}', object);
        }
        
        // Location (with locative case if present)
        if (sentence.includes('{location}')) {
            const locationBase = this.randomChoice(this.lexicon.getWords('locations'));
            const location = this.morphology.addCase(locationBase, 'loc');
            sentence = sentence.replace('{location}', location);
        }
        
        // Verb
        const verb = this.randomChoice(this.lexicon.getWords('verbs'));
        sentence = sentence.replace('{verb}', verb);
        
        return sentence + '.';
    }
    
    generateDialogue(sentences = 2) {
        const dialogue = [];
        for (let i = 0; i < sentences; i++) {
            dialogue.push(this.generateSentence());
        }
        return dialogue.join(' ');
    }
}

// Global instances
const simpleMorphology = new SimpleMorphology();
const sentenceGenerator = new SimpleSentenceGenerator();

// Export functions
export function generateMorphSentence(contextEmbed = null, sentenceType = 'simple') {
    return sentenceGenerator.generateSentence(sentenceType);
}

export function generateMorphDialogue(sentences = 2) {
    return sentenceGenerator.generateDialogue(sentences);
}

export function addCase(word, role = 'nom') {
    return simpleMorphology.addCase(word, role);
}

// Browser compatibility
if (typeof window !== 'undefined') {
    window.generateMorphSentence = generateMorphSentence;
    window.generateMorphDialogue = generateMorphDialogue;
    window.addCase = addCase;
    window.simpleMorphology = simpleMorphology;
    window.sentenceGenerator = sentenceGenerator;
}

console.log('🦠 Simple Morphological Generator v9.7.1 loaded!');